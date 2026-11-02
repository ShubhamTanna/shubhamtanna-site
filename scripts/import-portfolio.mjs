// Pulls a project's portfolio/ folder (from its GitHub repo) into the site.
//
//   node scripts/import-portfolio.mjs <path-to-repo-or-portfolio-folder> <slug> [--sub <folder>]
//
// --sub is for the case-studies repo, e.g. --sub tata-motors reads case-studies/tata-motors/portfolio.
// What it does:
//   chart-*.csv, table.csv, other CSVs → content/projects/<slug>/
//   lead.png|jpg|mp4 (+ lead-poster.png) → public/work/<slug>/ and sets `lead`
//   files/*.pdf|xlsx                      → public/files/<slug>/ and adds them to `links`
//   table.csv                             → added as a results table
//   charts: wired from SPECS below; every column a chart needs is checked against the CSV header
//   facts.md                              → copied to content/projects/<slug>/facts.md (source of truth for numbers)
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const [, , src, slug, ...rest] = process.argv;
if (!src || !slug) { console.error("Usage: node scripts/import-portfolio.mjs <repo-path> <slug> [--sub <folder>]"); process.exit(1); }
const sub = rest[rest.indexOf("--sub") + 1];
let dir = path.resolve(src);
if (sub && rest.includes("--sub")) dir = path.join(dir, sub);
if (fs.existsSync(path.join(dir, "portfolio"))) dir = path.join(dir, "portfolio");
if (!fs.existsSync(dir)) { console.error(`No folder at ${dir}`); process.exit(1); }

// Chart specs agreed in the outputs guide. `need` = columns that must exist in the CSV.
const SPECS = {
  "code1o1": [{ kind: "bar", file: "chart-1.csv", title: "Clients by channel", label: "channel", value: "clients", highlight: undefined }],
  "aur-sunao": [
    { kind: "bridge", file: "chart-1.csv", title: "From a loss to a profit on every subscriber", label: "line_item", before: "old_inr", after: "new_inr", startLabel: "Original plan", endLabel: "Recommended plan", unit: "₹", lead: true },
    { kind: "line", file: "chart-2.csv", title: "Monthly profit by number of subscribers", x: "subscribers", y: "monthly_profit_inr", unit: "₹" },
  ],
  "tata-motors": [
    { kind: "bar", file: "chart-1.csv", title: "Market share, FY20 vs FY23", label: "year", value: "share_pct", unit: "%", lead: true },
    { kind: "range", file: "chart-2.csv", title: "What two of the fixes are worth a year", label: "fix", low: "low_inr_cr", high: "high_inr_cr", unit: " Cr" },
  ],
  "player-detection": [{ kind: "bar", file: "chart-1.csv", title: "Detection accuracy by class (mAP@0.5)", label: "class", value: "map50" }],
  "epl-transfer-value": [{ kind: "bar", file: "chart-1.csv", title: "What moves a player's transfer value", label: "feature", value: "coefficient", lead: true }],
  "getawayguru": [{ kind: "bar", file: "chart-1.csv", title: "Why people cancel a trip", label: "reason", value: "pct_respondents", unit: "%", lead: true }],
  "winger-classification": [
    { kind: "scatter", file: "chart-1.csv", title: "Wingers on the two main style axes", x: "pc1", y: "pc2", group: "cluster_name", name: "player", xLabel: "PC1", yLabel: "PC2", lead: true },
    { kind: "heatmap", file: "chart-2.csv", title: "What each style does more or less of", row: "cluster_name", col: "feature", value: "value_z" },
  ],
};
const NEED = (s) => ["label", "value", "low", "high", "before", "after", "x", "y", "group", "name", "row", "col"].map((k) => s[k]).filter(Boolean);

const yamlPath = `content/projects/${slug}.yaml`;
const doc = fs.existsSync(yamlPath) ? YAML.parseDocument(fs.readFileSync(yamlPath, "utf8")) : null;
if (!doc) console.warn(`! No ${yamlPath} yet: create it first (copy a Tier 1 file and edit), then re-run. Files are still copied.`);
const contentDir = `content/projects/${slug}`, pubDir = `public/work/${slug}`, fileDir = `public/files/${slug}`;
[contentDir, pubDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));
const header = (f) => fs.readFileSync(f, "utf8").replace(/^﻿/, "").split(/\r?\n/)[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
const log = [];

for (const f of fs.readdirSync(dir)) {
  const full = path.join(dir, f);
  if (/\.csv$/i.test(f)) { fs.copyFileSync(full, path.join(contentDir, f)); log.push(`csv   ${f}`); }
  if (/^facts\.md$/i.test(f)) { fs.copyFileSync(full, path.join(contentDir, f)); log.push("facts facts.md"); }
  if (/^lead(-poster)?\.(png|jpe?g|webp|mp4)$/i.test(f)) { fs.copyFileSync(full, path.join(pubDir, f)); log.push(`media ${f}`); }
}
const filesIn = path.join(dir, "files"), links = [];
if (fs.existsSync(filesIn)) {
  fs.mkdirSync(fileDir, { recursive: true });
  for (const f of fs.readdirSync(filesIn).filter((f) => /\.(pdf|xlsx)$/i.test(f))) {
    fs.copyFileSync(path.join(filesIn, f), path.join(fileDir, f));
    const label = /deck/i.test(f) ? "Deck (PDF)" : /paper/i.test(f) ? "Paper (PDF)" : /\.xlsx$/i.test(f) ? "Excel model" : /questionnaire/i.test(f) ? "Questionnaire (PDF)" : f;
    links.push({ label, href: `/files/${slug}/${f}` }); log.push(`file  ${f}`);
  }
}

const problems = [];
const charts = (SPECS[slug] ?? []).filter((s) => fs.existsSync(path.join(contentDir, s.file))).map(({ lead, ...s }) => {
  const h = header(path.join(contentDir, s.file));
  const missing = NEED(s).filter((col) => !h.includes(col));
  if (missing.length) problems.push(`${s.file}: missing column(s) ${missing.join(", ")} (has: ${h.join(", ")})`);
  return { ...Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined)), _lead: !!lead };
});

if (doc) {
  if (charts.length) doc.set("charts", charts.map(({ _lead, ...c }) => c));
  const leadIdx = charts.findIndex((c) => c._lead);
  const media = ["lead.mp4", "lead.png", "lead.jpg", "lead.jpeg", "lead.webp"].find((f) => fs.existsSync(path.join(pubDir, f)));
  if (media) doc.set("lead", { kind: media.endsWith(".mp4") ? "video" : "image", src: `/work/${slug}/${media}`, ...(fs.existsSync(path.join(pubDir, "lead-poster.png")) ? { poster: `/work/${slug}/lead-poster.png` } : {}), alt: "", caption: "" });
  else if (leadIdx >= 0) doc.set("lead", { kind: "chart", chart: leadIdx });
  const tbl = path.join(contentDir, "table.csv");
  if (fs.existsSync(tbl)) {
    const [h, ...rows] = fs.readFileSync(tbl, "utf8").trim().split(/\r?\n/).map((l) => l.split(",").map((x) => x.trim().replace(/^"|"$/g, "")));
    const results = (doc.get("results")?.toJSON?.() ?? []).filter((t) => t.caption !== "From table.csv");
    doc.set("results", [...results, { caption: "From table.csv", columns: h.map((x) => x.replace(/_/g, " ")), rows }]);
    log.push("table table.csv → results (rename its caption in the YAML)");
  }
  if (links.length) {
    const existing = doc.get("links")?.toJSON?.() ?? [];
    doc.set("links", [...existing.filter((l) => !links.some((n) => n.href === l.href)), ...links]);
  }
  fs.writeFileSync(yamlPath, doc.toString({ lineWidth: 0 }));
}

console.log(`Imported into ${slug}:\n  ` + (log.join("\n  ") || "(nothing found)"));
if (problems.length) { console.log("\nFix before launch:\n  " + problems.join("\n  ")); process.exitCode = 1; }
console.log("\nNext: read facts.md and check every number on the page against it.");
