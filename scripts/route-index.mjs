// Route index for src/proxy.ts: the valid slugs for /work/<slug> and for explorer footballer pages, so unknown
// addresses get a real 404 status before rendering starts (with streaming on, a page can't change its status
// once it has begun sending). Runs before dev and build, after winger-derive. Output is git-ignored.
// The /work rule mirrors getPagedProjects() in src/lib/content.ts: tier 1–2, drafts only with SHOW_DRAFTS.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const dir = "content/projects";
const work = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml"))
  .map((f) => YAML.parse(fs.readFileSync(path.join(dir, f), "utf8")))
  .filter((p) => p.tier < 3 && (!p.draft || !!process.env.SHOW_DRAFTS)).map((p) => p.slug).sort();
const cat = JSON.parse(fs.readFileSync("public/winger/catalog.json", "utf8"));
const players = cat.rows.map((r) => r[cat.cols.indexOf("slug")]).sort();
fs.mkdirSync("src/generated", { recursive: true });
fs.writeFileSync("src/generated/route-index.json", JSON.stringify({ work, players }));
console.log(`route index: ${work.length} project pages, ${players.length} footballer pages`);
