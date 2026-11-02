// One-off: turns the locked prototype's data (directions/data8.js) into the site's YAML content,
// merging the richer project files that already exist. Safe to delete after launch.
import fs from "node:fs";
import vm from "node:vm";
import YAML from "yaml";

const src = fs.readFileSync(process.argv[2] ?? "../directions/data8.js", "utf8")
  .replace(/^const \$ = .*$/m, "")
  .replace(/^const (\w+) =/gm, "globalThis.$1 =");
const ctx = {}; vm.createContext(ctx); vm.runInContext(src, ctx);
const { SITE, CHAPTERS, PROOF, WORK, EXPERIENCE_WORK, EXPERIENCE_LEAD, OFF, PHOTOS, NOW } = ctx;

const out = (p, data, header = "") => fs.writeFileSync(p, header + YAML.stringify(data, { lineWidth: 0 }));
const img = (s) => "/" + s; // prototype paths are relative; site serves from /public
const href = (h) => !h ? undefined : h.startsWith("#p-") ? `/work/${h.slice(3)}` : h === "#experience" ? "/experience" : h === "#contact" ? "#contact" : h;

// ---------- site.yaml ----------
const oldSite = YAML.parse(fs.readFileSync("content/site.yaml", "utf8"));
out("content/site.yaml", {
  name: "Shubham Tanna",
  location: "Mumbai, India",
  email: oldSite.email ?? "",
  links: { linkedin: oldSite.links?.linkedin ?? "", github: oldSite.links?.github ?? "", resume: "/resume.pdf" },
  positioning: SITE.line,
  subline: SITE.sub,
  proof: SITE.proof.map(([value, label]) => ({ value, label })),
  heroPhoto: { src: img(PHOTOS.hero[0]), alt: PHOTOS.hero[1] },
  lookingFor: NOW.lookingFor,
  closing: "Hiring for consulting or analytics? Let's talk.",
}, "# Site-wide text: headline, proof numbers, contact. Edit freely; the site rebuilds from this file.\n# Empty email or links are hidden until filled in.\n\n");

// ---------- story.yaml ----------
out("content/story.yaml", {
  chapters: CHAPTERS.map(([title, text, pull, years], i) => ({
    key: title.toLowerCase(),
    title, years, pull, text,
    long: [],
    photo: { src: img(PHOTOS.chapters[i][0]), alt: PHOTOS.chapters[i][1], caption: PHOTOS.chapters[i][2] },
    proof: PROOF[i].filter(([v]) => v !== "Open to").map(([value, what, source, h]) => ({ value, what, source, href: href(h) })),
  })),
}, "# The six story chapters. `text` is the short version (Home and Story page).\n# `long` is your longer story: a list of paragraphs. Empty = a 'your story goes here' note shows in development only.\n\n");

// ---------- experience.yaml ----------
out("content/experience.yaml", {
  photos: PHOTOS.exp.map(([s, alt, caption]) => ({ src: img(s), alt, caption })),
  work: EXPERIENCE_WORK.map((x, i) => ({
    org: x.org, sub: x.sub, role: x.role, dates: x.dates, current: i === 0, line: x.line,
    owned: x.owned?.map(([title, text]) => ({ title, text })), note: x.note, tools: x.tools, href: href(x.href),
  })),
  leadership: EXPERIENCE_LEAD.map(([dates, role, org, line]) => ({ dates, role, org, line })),
}, "# Experience page. Work roles first (newest first), then leadership and volunteering.\n\n");

// ---------- about.yaml ----------
out("content/about.yaml", {
  photo: { src: img(PHOTOS.hello[0]), alt: PHOTOS.hello[1] },
  lede: "I co-founded Code1o1, a coding academy in Mumbai, and grew it to 14 paying clients without spending on ads. Right now I'm a Business Operations Intern at Yocket, finding and fixing leaks in a study-abroad sales funnel.",
  body: ["I studied Computer Science and Business Systems at NMIMS. The work I like most sits between the two: pricing a plan, sizing a market, or building a model and asking what it means for the decision."],
  whyConsulting: "",
  facts: [
    { label: "Education", value: "B.Tech, CSBS, NMIMS, 2026" },
    { label: "Based in", value: "Mumbai" },
    { label: "Languages", value: "English, Hindi, Gujarati, Marathi" },
    { label: "Tools", value: "Python, SQL, Excel, Tableau, Power BI" },
  ],
  off: OFF.map(([title, text], i) => ({ title, text, photo: img(PHOTOS.off[i]) })),
  now: {
    updated: "2026-11",
    building: NOW.building.map(([name, stage, tech, line, doneWhen]) => ({ name, stage, tech, line, doneWhen })),
    learning: NOW.learning.map(([kind, topic, detail]) => ({ kind, topic, detail: detail.startsWith("*") ? "" : detail })),
    log: NOW.log.map(([date, text]) => ({ date, text })),
  },
}, "# About page: intro, off the clock, and the monthly 'Now' section.\n# now.updated is YYYY-MM; update it whenever you edit the Now lists.\n\n");

// ---------- projects ----------
const TIER = { "code1o1": 1, "aur-sunao": 1, "tata-motors": 1, "adani-vs-reliance": 1, "player-detection": 1,
  "epl-transfer-value": 2, "getawayguru": 2, "esg-sentiment": 2, "research-buddy": 2, "linkup": 2,
  "hope-for-recovery": 3, "compiler-lab": 3, "autobot": 3, "breakout": 3 };
const RENAME = { "football-player-detection": "player-detection", "esg-sentiment-classifier": "esg-sentiment" };
const dir = "content/projects";
const old = {};
for (const f of fs.readdirSync(dir)) {
  const d = YAML.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
  old[RENAME[d.slug] ?? d.slug] = d;
  fs.unlinkSync(`${dir}/${f}`);
}
WORK.forEach((w, i) => {
  const o = old[w.slug] ?? {};
  const p = {
    slug: w.slug, rank: i + 1, tier: TIER[w.slug], type: w.type, section: w.sec,
    title: o.title ?? w.t, cardTitle: w.t, cardLine: w.l,
    hero: { value: w.hero, label: w.hl },
    year: w.year, team: w.team, tools: w.tools,
    stats: w.stats?.map(([value, label]) => ({ value, label })),
    context: o.context, answer: o.answer ?? w.answer, problem: o.problem ?? w.problem, did: o.did ?? w.did,
    results: o.results ?? [], method: o.method, notes: o.notes, story: o.story,
    skills: o.skills ?? [], links: o.links ?? [], lead: undefined, charts: [], internal: o.internal,
  };
  for (const k of Object.keys(p)) if (p[k] === undefined) delete p[k];
  out(`${dir}/${w.slug}.yaml`, p, `# Tier ${p.tier}: ${p.tier === 1 ? "full page" : p.tier === 2 ? "short page" : "no page, one line in Smaller builds"}.\n# 'internal' is never shown; the build fails if its text leaks into the site.\n\n`);
});
for (const f of ["grid.yaml", "now.yaml"]) if (fs.existsSync(`content/${f}`)) fs.unlinkSync(`content/${f}`);
console.log("Migrated:", WORK.length, "projects, 6 chapters,", EXPERIENCE_WORK.length + EXPERIENCE_LEAD.length, "roles.");
