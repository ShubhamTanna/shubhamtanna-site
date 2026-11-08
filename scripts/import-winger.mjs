// Imports the winger research bundle into the site.
//
//   npm run import:winger -- <path-to-decoding-winger-playstyles clone>
//
// Verifies the eight files in <repo>/portfolio/web/ (schema, hashes, counts, keys, and a replay of the
// research's ten distance cases), then copies them unchanged to data/winger/. Nothing is copied if a
// check fails. The site's own derived files are made from data/winger/ by scripts/winger-derive.mjs.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { FILES, verifyBundle } from "./winger/verify.mjs";

const repo = process.argv[2];
if (!repo) { console.error("Usage: npm run import:winger -- <path-to-decoding-winger-playstyles>"); process.exit(1); }
const src = path.join(path.resolve(repo), "portfolio", "web");
try {
  const { manifest } = verifyBundle(src, { log: (s) => console.log(`✓ ${s}`) });
  const dst = "data/winger";
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(dst)) fs.unlinkSync(path.join(dst, f));
  for (const f of FILES) fs.copyFileSync(path.join(src, f), path.join(dst, f));
  let commit = "unknown";
  try { commit = execSync("git rev-parse HEAD", { cwd: repo }).toString().trim(); } catch {}
  fs.writeFileSync(path.join(dst, "IMPORTED.json"), JSON.stringify({ from: "ShubhamTanna/decoding-winger-playstyles", commit, schema_version: manifest.schema_version, data_version: manifest.data_version }, null, 2) + "\n");
  console.log(`Imported ${manifest.data_version} (schema ${manifest.schema_version}) from ${commit.slice(0, 7)} into ${dst}/`);
} catch (e) {
  console.error(`✗ ${e.message}\nNothing was copied.`);
  process.exit(1);
}
