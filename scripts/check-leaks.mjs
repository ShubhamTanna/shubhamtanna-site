// Fails the build if any internal note appears in the built site.
// Run after `next build`: node scripts/check-leaks.mjs
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

// Private notes live in content/private/internal-notes.yaml (gitignored, so absent on Vercel) and,
// for older files, in a project's `internal:` field. Both are checked when present.
const projDir = "content/projects", privFile = "content/private/internal-notes.yaml";
const notes = [
  ...fs.readdirSync(projDir).filter((f) => f.endsWith(".yaml")).map((f) => YAML.parse(fs.readFileSync(path.join(projDir, f), "utf8")).internal),
  ...(fs.existsSync(privFile) ? Object.values(YAML.parse(fs.readFileSync(privFile, "utf8")) ?? {}) : []),
].filter(Boolean);
// Check distinctive fragments (8+ words) so small rewording still gets caught.
const fragments = notes.flatMap((n) => n.split(/(?<=[.;])\s+/)).map((s) => s.trim()).filter((s) => s.split(" ").length >= 5);

const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(html|rsc|txt|json|js)$/.test(e.name)) files.push(p);
});
walk(".next/server/app");

let leaks = 0;
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  for (const frag of fragments) if (text.includes(frag)) { console.error(`LEAK in ${f}: "${frag}"`); leaks++; }
}
if (leaks) { console.error(`${leaks} internal-note leak(s). Build blocked.`); process.exit(1); }
console.log(`Leak check passed: ${fragments.length} internal fragments, ${files.length} output files.`);
