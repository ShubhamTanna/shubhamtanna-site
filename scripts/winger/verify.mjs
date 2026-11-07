// Checks a winger research bundle (the eight files in portfolio/web/) before the site uses it.
// Throws on the first problem. Returns the parsed tables.
import fs from "node:fs";
import path from "node:path";
import { readBuf, sha256, typedRows } from "./csv.mjs";

export const SCHEMA = "1.1.0";
export const FILES = ["manifest.json", "features.csv", "archetypes.csv", "spells.csv", "fingerprint.csv", "neighbours.csv", "acceptance.csv", "facts.md"];
const TOL = (a, e) => Math.abs(a - e) <= 1e-10 + 1e-10 * Math.abs(e);

export function verifyBundle(dir, { log = () => {} } = {}) {
  for (const f of FILES) if (!fs.existsSync(path.join(dir, f))) throw new Error(`missing ${f} in ${dir}`);
  const m = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
  if (m.schema_version !== SCHEMA) throw new Error(`schema ${m.schema_version}; this site reads ${SCHEMA}`);
  if (m.source_tree_dirty !== false) throw new Error("manifest says the build came from a dirty tree; not publishable");

  // 1. Every file matches the manifest's hash and byte count.
  const t = {};
  for (const f of FILES.filter((x) => x !== "manifest.json")) {
    const spec = m.files[f], buf = readBuf(path.join(dir, f));
    if (!spec) throw new Error(`manifest has no entry for ${f}`);
    if (buf.length !== spec.bytes) throw new Error(`${f}: ${buf.length} bytes, manifest says ${spec.bytes}`);
    if (sha256(buf) !== spec.sha256) throw new Error(`${f}: SHA-256 does not match the manifest`);
    if (f.endsWith(".csv")) {
      t[f] = typedRows(buf.toString("utf8"), spec.schema, f);
      if (spec.rows !== undefined && t[f].length !== spec.rows) throw new Error(`${f}: ${t[f].length} rows, manifest says ${spec.rows}`);
    }
  }
  log("hashes, byte counts, headers and types match the manifest");

  // 2. Counts and keys.
  const spells = t["spells.csv"], fp = t["fingerprint.csv"], nb = t["neighbours.csv"], feats = t["features.csv"], arch = t["archetypes.csv"];
  const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: ${a}, expected ${b}`); };
  eq(spells.length, m.n_spells, "spells"); eq(fp.length, m.n_fingerprint_rows, "fingerprint rows"); eq(nb.length, m.n_neighbours, "neighbours");
  eq(feats.length, m.n_features, "features"); eq(arch.length, m.n_clusters, "archetypes");
  eq(new Set(spells.map((s) => s.player_id)).size, m.n_players, "footballers");
  eq(feats.map((f) => f.feature).join(), m.feature_order.join(), "feature order");
  const ids = new Map(spells.map((s) => [s.spell_id, s]));
  eq(ids.size, spells.length, "unique spell ids");
  for (const r of fp) if (!ids.has(r.spell_id)) throw new Error(`fingerprint references unknown ${r.spell_id}`);
  for (const r of nb) {
    if (!ids.has(r.target_spell_id) || !ids.has(r.candidate_spell_id)) throw new Error("neighbour references an unknown spell");
    if (ids.get(r.target_spell_id).player_id === ids.get(r.candidate_spell_id).player_id) throw new Error("neighbour is the same footballer");
  }
  for (const s of spells) if (s.nearest_spell_id && !ids.has(s.nearest_spell_id)) throw new Error("nearest_spell_id references an unknown spell");
  for (const f of m.featured_spells) if (!ids.has(f.spell_id)) throw new Error(`featured spell ${f.display_name} not in spells.csv`);
  arch.forEach((a, i) => { eq(a.cluster_id, i, "archetype order"); eq(a.color.toLowerCase(), m.archetype_colors[`C${i}`].toLowerCase(), `C${i} colour`); });
  log("counts, keys, references, same-footballer exclusion, featured spells and archetype colours check out");

  // 3. Replay the research's ten 20-feature distance cases with the published fingerprints.
  const z = new Map();
  for (const r of fp) { if (!z.has(r.spell_id)) z.set(r.spell_id, {}); z.get(r.spell_id)[r.feature] = r.z_score; }
  const cases = t["acceptance.csv"].filter((r) => r.field === "comparison_20d");
  eq(cases.length, 10, "comparison cases");
  let worst = 0;
  for (const c of cases) {
    const e = JSON.parse(c.expected);
    const a = z.get(e.target_spell_id), b = z.get(e.candidate_spell_id);
    const parts = m.feature_order.map((f, k) => ({ feature: f, k, sq: (a[f] - b[f]) ** 2 }));
    const d = Math.sqrt(parts.reduce((s, p) => s + p.sq, 0));
    if (!TOL(d, e.distance)) throw new Error(`${c.check_id}: distance ${d} vs ${e.distance}`);
    worst = Math.max(worst, Math.abs(d - e.distance));
    const top = [...parts].sort((p, q) => q.sq - p.sq || p.k - q.k).slice(0, 3);
    top.forEach((p, i) => {
      if (p.feature !== e.top3[i].feature) throw new Error(`${c.check_id}: contribution ${i + 1} is ${p.feature}, expected ${e.top3[i].feature}`);
      if (!TOL(p.sq, e.top3[i].squared_contribution)) throw new Error(`${c.check_id}: contribution ${i + 1} differs`);
    });
  }
  log(`all 10 distance cases replay within tolerance (largest gap ${worst.toExponential(2)})`);
  return { manifest: m, ...t };
}
