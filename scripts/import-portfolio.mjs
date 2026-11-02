// Pulls a project's portfolio/ folder (from its GitHub repo) into the site, then checks that every
// chart in the project's YAML can find the columns it needs.
//
//   npm run import -- <path-to-repo> <slug> [--sub <folder>]
//   npm run import -- ../case-studies tata-motors --sub tata-motors
//   npm run import -- --all ../repos          (re-import every project from a folder of clones)
//
// Copies: *.csv and facts.md → content/projects/<slug>/ (old CSVs there are replaced)
//         lead.mp4 / lead.jpg|png|webp / lead-poster.* → public/work/<slug>/
// It never edits the YAML: chart specs, copy and links stay as written. Exit code 1 if a column is missing.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const SOURCES = {
  "code1o1": ["case-studies", "code1o1"], "aur-sunao": ["case-studies", "aur-sunao"], "tata-motors": ["case-studies", "tata-motors"],
  "adani-vs-reliance": ["case-studies", "adani-vs-reliance"], "epl-transfer-value": ["case-studies", "epl-transfer-value"],
  "getawayguru": ["case-studies", "getawayguru"], "hope-for-recovery": ["case-studies", "hope-for-recovery"], "linkup": ["case-studies", "linkup"],
  "player-detection": ["football-player-detection"], "esg-sentiment": ["esg-sentiment-classifier"], "research-buddy": ["research-buddy"],
  "compiler-lab": ["shift-reduce-parser"], "autobot": ["autobot-ros2-simulation"], "breakout": ["tilt-breakout-arduino"],
  "winger-classification": ["decoding-winger-playstyles"],
};

const args = process.argv.slice(2);
const jobs = [];
if (args[0] === "--all") {
  const root = path.resolve(args[1] ?? "..");
  for (const [slug, parts] of Object.entries(SOURCES)) jobs.push([path.join(root, ...parts), slug]);
} else {
  const [src, slug] = args;
  if (!src || !slug) { console.error("Usage: npm run import -- <repo-path> <slug> [--sub <folder>]  |  --all <folder-of-clones>"); process.exit(1); }
  const sub = args.includes("--sub") ? args[args.indexOf("--sub") + 1] : "";
  jobs.push([path.join(path.resolve(src), sub), slug]);
}

const header = (f) => {
  const line = fs.readFileSync(f, "utf8").replace(/^﻿/, "").split(/\r?\n/)[0];
  return line.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
};
const NEEDS = (c) => [c.label, c.value, c.low, c.high, c.before, c.after, c.typeCol, c.x, c.y, c.group, c.name, c.row, c.col, c.seriesCol, c.unitCol, c.betterCol, c.highlightCol, ...(c.series ?? []).map((s) => s.col), ...[...(c.detail ?? "").matchAll(/\{(\w+)\}/g)].map((m) => m[1])].filter(Boolean);

let problems = 0;
for (const [repoDir, slug] of jobs) {
  const dir = fs.existsSync(path.join(repoDir, "portfolio")) ? path.join(repoDir, "portfolio") : repoDir;
  if (!fs.existsSync(dir)) { console.log(`- ${slug}: no folder at ${dir}, skipped`); continue; }
  const contentDir = `content/projects/${slug}`, pubDir = `public/work/${slug}`;
  fs.mkdirSync(contentDir, { recursive: true });
  for (const f of fs.readdirSync(contentDir)) if (f.endsWith(".csv")) fs.unlinkSync(path.join(contentDir, f));
  const copied = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (/\.csv$/i.test(f) || /^facts\.md$/i.test(f)) { fs.copyFileSync(full, path.join(contentDir, f)); copied.push(f); }
    if (/^lead(-poster)?\.(png|jpe?g|webp|mp4)$/i.test(f)) { fs.mkdirSync(pubDir, { recursive: true }); fs.copyFileSync(full, path.join(pubDir, f)); copied.push(f); }
  }
  // check the YAML's charts against the CSV headers
  const yamlPath = `content/projects/${slug}.yaml`;
  const issues = [];
  if (fs.existsSync(yamlPath)) {
    const p = YAML.parse(fs.readFileSync(yamlPath, "utf8"));
    for (const c of p.charts ?? []) {
      const f = path.join(contentDir, c.file);
      if (!fs.existsSync(f)) { issues.push(`${c.file}: missing (chart "${c.title}")`); continue; }
      const h = header(f), missing = NEEDS(c).filter((col) => !h.includes(col));
      if (missing.length) issues.push(`${c.file}: chart needs ${missing.join(", ")}; CSV has ${h.join(", ")}`);
    }
    if (p.lead?.src?.startsWith(`/work/${slug}/`) && !fs.existsSync(`public${p.lead.src}`)) issues.push(`lead file ${p.lead.src} not found`);
  } else issues.push(`no ${yamlPath}: create the project file first`);
  problems += issues.length;
  console.log(`${issues.length ? "✗" : "✓"} ${slug}: ${copied.length} file(s)${issues.length ? "\n    " + issues.join("\n    ") : ""}`);
}
console.log(problems ? `\n${problems} problem(s). Fix the CSV or the chart spec, then re-run.` : "\nAll charts match their CSVs. Next: check every number on the page against facts.md.");
process.exit(problems ? 1 : 0);
