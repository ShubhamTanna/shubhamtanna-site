// Site QA: every page at 8 screen sizes. Run against a running server:
//   npm run build && npm start   (in one terminal)
//   npm run qa                   (in another; QA_URL to point elsewhere, e.g. a Vercel preview)
// Checks: no sideways scroll, tap targets >= 24px (44px is the goal on touch), no text under 11px,
// no console errors, every image has alt text, every internal link resolves. Screenshots → qa-shots/.
import fs from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
// Playwright isn't a site dependency (it's only for QA). Use a local install if present, else the global one.
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(execSync("npm root -g").toString().trim() + "/playwright"); }
const { chromium } = pw;

const BASE = process.env.QA_URL ?? "http://localhost:3000";
const SIZES = [[320, 640, true], [360, 780, true], [390, 844, true], [844, 390, true], [768, 1024, true], [1024, 768, false], [1366, 768, false], [1920, 1080, false]];
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const PAGES = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
fs.mkdirSync("qa-shots", { recursive: true });

const browser = await chromium.launch(fs.existsSync("/usr/bin/google-chrome") ? { executablePath: "/usr/bin/google-chrome" } : {});
let failures = 0;
const fail = (msg) => { failures++; console.log("  ✗ " + msg); };
const seenLinks = new Set();

for (const [w, h, mobile] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Vercel Analytics' script only exists on Vercel, so it 404s on a local server: not a real error.
  page.on("console", (m) => { if (m.type() === "error" && !m.location()?.url?.includes("/_vercel/")) errors.push(m.text()); });
  console.log(`${w}×${h}`);
  for (const p of PAGES) {
    errors.length = 0;
    const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
    if (!res?.ok()) { fail(`${p}: HTTP ${res?.status()}`); continue; }
    const r = await page.evaluate((w) => {
      // Compare against the device width, not innerWidth: a phone browser widens the layout to fit anything too wide
      // and zooms out, so innerWidth grows with the overflow and hides it.
      const vw = w;
      const scrolls = (e) => { for (let s = e.parentElement; s; s = s.parentElement) { const o = getComputedStyle(s).overflowX; if (o !== "visible") return true; } return false; };
      const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.right > vw + 1 && !e.closest("svg") && !scrolls(e) && ![...e.children].some((c) => c.getBoundingClientRect().right > vw + 1); }).map((e) => (e.textContent || "").trim().slice(0, 30));
      const small = [...document.querySelectorAll("a, button")].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && b.height < 24 && getComputedStyle(e).visibility !== "hidden"; }).map((e) => (e.textContent || "").trim().slice(0, 30));
      const tiny = [...document.querySelectorAll("p, span, li, a, time, b, figcaption, text")].filter((e) => e.textContent.trim() && !e.closest("svg") && parseFloat(getComputedStyle(e).fontSize) < 11).map((e) => e.textContent.trim().slice(0, 30));
      const noAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.src);
      const links = [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href"));
      return { overflow: document.documentElement.scrollWidth > vw + 1 || innerWidth > vw + 1, wide, small, tiny, noAlt, links };
    }, w);
    if (r.overflow) fail(`${p}: wider than the screen${r.wide.length ? ": " + r.wide.slice(0, 3).join(" | ") : ""}`);
    if (r.small.length) fail(`${p}: ${r.small.length} tap target(s) under 24px: ${r.small.slice(0, 3).join(" | ")}`);
    if (r.tiny.length) fail(`${p}: text under 11px: ${r.tiny.slice(0, 3).join(" | ")}`);
    if (r.noAlt.length) fail(`${p}: image(s) without alt`);
    if (errors.length) fail(`${p}: console errors: ${errors.slice(0, 2).join(" | ")}`);
    r.links.forEach((l) => seenLinks.add(l.split("#")[0] || "/"));
    if (["/", "/work", "/story"].includes(p) || p.startsWith("/work/aur")) await page.screenshot({ path: `qa-shots/${w}x${h}${p.replace(/\//g, "_") || "_home"}.png` });
  }
  await ctx.close();
}
console.log("links");
for (const l of seenLinks) { const res = await fetch(BASE + l, { redirect: "manual" }); if (res.status >= 400) fail(`broken link ${l}: ${res.status}`); }
await browser.close();
console.log(failures ? `\n${failures} problem(s).` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
