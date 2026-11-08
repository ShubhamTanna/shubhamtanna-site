// Builds the explorer's browser files from the verified research bundle in data/winger/.
// Runs before `next dev` and `next build`. Output (git-ignored): public/winger/
//   meta.json           features, archetypes, featured spells, population facts (small; every page)
//   catalog.json        one compact row per spell for search, ranking and the map (~50 KB gzipped)
//   spells/<slug>.json  one spell: all 20 fingerprint rows and its 10 neighbours, full precision
// No research value is recalculated or rounded. The only new numbers are display helpers, marked below.
import fs from "node:fs";
import path from "node:path";
import { verifyBundle } from "./winger/verify.mjs";
import { slugify, shortSeason } from "./winger/csv.mjs";

const SRC = "data/winger", OUT = "public/winger";
const t0 = Date.now();
const b = verifyBundle(SRC);
const m = b.manifest;
const F = m.feature_order;

// Display names only. Canonical keys and spell ids are never changed.
const CLUB = { "Paris S-G": "Paris Saint-Germain", "Manchester Utd": "Manchester United", "Newcastle Utd": "Newcastle United", "Nott'ham Forest": "Nottingham Forest", "Eint Frankfurt": "Eintracht Frankfurt", "Gladbach": "Mönchengladbach", "West Brom": "West Bromwich Albion", "Wolves": "Wolverhampton" };
const playerName = new Map(m.featured_spells.map((f) => [f.player_id, f.display_name]));
// Approved featured examples published after schema 1.1.0 (research handoff, not the manifest). Checked here:
// each spell must exist, carry the stated cluster, and not duplicate a style already featured.
const extraPath = path.join(SRC, "featured-additions.json");
const extraFeatured = fs.existsSync(extraPath) ? JSON.parse(fs.readFileSync(extraPath, "utf8")).spells : [];
for (const f of extraFeatured) {
  const sp = b["spells.csv"].find((s) => s.spell_id === f.spell_id);
  if (!sp) throw new Error(`featured addition not in bundle: ${f.spell_id}`);
  if (sp.k5_cluster !== f.cluster_id) throw new Error(`featured addition cluster mismatch: ${f.display_name}`);
  if (m.featured_spells.some((x) => x.cluster_id === f.cluster_id)) throw new Error(`style C${f.cluster_id} already featured`);
}
const club = (s) => CLUB[s] ?? s;
const name = (s) => playerName.get(s.player_id) ?? s.player;

const spells = b["spells.csv"];
const slugOf = new Map();
const used = new Set();
for (const s of spells) {
  let slug = `${slugify(name(s))}-${slugify(club(s.squad))}-${shortSeason(s.season)}`;
  if (used.has(slug)) throw new Error(`slug collision: ${slug}`);
  used.add(slug); slugOf.set(s.spell_id, slug);
}

// Fingerprint rows per spell, in manifest feature order.
const fp = new Map();
for (const r of b["fingerprint.csv"]) {
  if (!fp.has(r.spell_id)) fp.set(r.spell_id, new Array(F.length));
  fp.get(r.spell_id)[F.indexOf(r.feature)] = [r.raw_value, r.z_score, r.population_percentile, r.assigned_centroid_z];
}
const nb = new Map();
for (const r of b["neighbours.csv"]) {
  if (!nb.has(r.target_spell_id)) nb.set(r.target_spell_id, []);
  nb.get(r.target_spell_id)[r.rank - 1] = [slugOf.get(r.candidate_spell_id), r.distance];
}
const career = new Map();
for (const s of spells) { if (!career.has(s.player_id)) career.set(s.player_id, []); career.get(s.player_id).push(s); }
for (const list of career.values()) list.sort((a, c) => a.season.localeCompare(c.season) || a.squad.localeCompare(c.squad));

// Display helper (derived, not a research output): for each archetype and feature, the share of all
// spells whose z-score is below the archetype's average. Lets the UI say "more than ~90% of wingers".
const zCol = F.map((_, k) => spells.map((s) => fp.get(s.spell_id)[k][1]).sort((a, c) => a - c));
const shareBelow = (k, v) => { const col = zCol[k]; let lo = 0, hi = col.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (col[mid] < v) lo = mid + 1; else hi = mid; } return (100 * lo) / col.length; };

const archetypes = b["archetypes.csv"].map((a) => {
  const members = spells.filter((s) => s.k5_cluster === a.cluster_id).sort((x, y) => x.k5_centroid_distance - y.k5_centroid_distance);
  return {
    id: a.cluster_id, code: `C${a.cluster_id}`, label: a.label, color: a.color,
    nSpells: a.n_spells, nPlayers: new Set(members.map((s) => s.player_id)).size,
    centroid: F.map((f) => a[f]),
    shareBelow: F.map((f, k) => shareBelow(k, a[f])),
    representatives: members.slice(0, 25).map((s) => slugOf.get(s.spell_id)),
  };
});
for (const a of archetypes) if (a.nSpells !== spells.filter((s) => s.k5_cluster === a.id).length) throw new Error(`C${a.id} count mismatch`);

// Display helper (derived): z-score histograms per feature, for all spells and for each archetype's members,
// plus each archetype's member quartiles. Bins cover −3 to +3 SD; values outside are counted, never dropped.
const H = { lo: -3, hi: 3, step: 0.25 };
const nBins = Math.round((H.hi - H.lo) / H.step);
const hist = (zs) => {
  const h = new Array(nBins + 2).fill(0); // [under, ...bins, over]
  for (const z of zs) h[z < H.lo ? 0 : z >= H.hi ? nBins + 1 : 1 + Math.floor((z - H.lo) / H.step)]++;
  return h;
};
const quart = (zs) => { const s = [...zs].sort((a, c) => a - c); const q = (p) => s[Math.floor(p * (s.length - 1))]; return [q(0.25), q(0.5), q(0.75)]; };
const distribution = {
  ...H,
  all: F.map((_, k) => hist(spells.map((s) => fp.get(s.spell_id)[k][1]))),
  byCluster: b["archetypes.csv"].map((a) => {
    const zs = F.map((_, k) => spells.filter((s) => s.k5_cluster === a.cluster_id).map((s) => fp.get(s.spell_id)[k][1]));
    return { hist: zs.map(hist), quartiles: zs.map(quart) };
  }),
  median: zCol.map((col) => col[Math.floor(0.5 * (col.length - 1))]),
};

const features = b["features.csv"].map((f) => ({
  key: f.feature, name: f.display_name, family: f.macro_family, interpretation: f.interpretation, limitations: f.limitations,
  unit: f.unit, unitStatus: f.unit_status, precision: f.display_precision, multiplier: f.display_multiplier, suffix: f.display_suffix,
}));

const meta = {
  schemaVersion: m.schema_version, dataVersion: m.data_version, sourceCommit: m.source_commit,
  nSpells: m.n_spells, nPlayers: m.n_players, nFeatures: m.n_features, minimumMinutes: m.minimum_minutes,
  seasons: m.season_bounds.map(shortSeason), leagues: m.leagues, comparisonScope: m.comparison_scope, topK: m.top_k,
  limitations: m.limitations, families: m.family_order,
  pca: m.pca_variance.map((p) => ({ component: p.component, pct: p.explained_variance_pct })),
  zObserved: m.visualization.fingerprint.observed_z,
  features, archetypes, distribution,
  // Display reference (derived): how far a spell's closest other footballer usually is.
  nearestQuartiles: (() => { const d = spells.map((s) => s.nearest_distance).sort((a, c) => a - c); const q = (p) => d[Math.floor(p * (d.length - 1))]; return [q(0.25), q(0.5), q(0.75)]; })(),
  featured: [...m.featured_spells, ...extraFeatured].map((f) => ({ slug: slugOf.get(f.spell_id), name: f.display_name, club: f.display_club, cluster: f.cluster_id })),
};

// Catalog numbers are for drawing and sorting only, so 4 decimals is plenty; every per-spell file keeps full precision.
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const CAT_COLS = ["slug", "player", "club", "comp", "season", "cluster", "pc1", "pc2", "pc3", "minutes", "age", "centroidDist", "pctWithin", "stable", "playerKey"];
const playerKeys = [...career.keys()];
const pk = new Map(playerKeys.map((k, i) => [k, i]));
const catalog = { cols: CAT_COLS, rows: spells.map((s) => [slugOf.get(s.spell_id), name(s), club(s.squad), s.comp, shortSeason(s.season), s.k5_cluster, r4(s.PC1), r4(s.PC2), r4(s.PC3), s.Minutes, s.age, r4(s.k5_centroid_distance), r4(s.centroid_distance_pct_within_cluster), s.k5_label_preserved_all_three_tests, pk.get(s.player_id)]) };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "spells"), { recursive: true });
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta));
fs.writeFileSync(path.join(OUT, "catalog.json"), JSON.stringify(catalog));
for (const s of spells) {
  const out = {
    slug: slugOf.get(s.spell_id), spellId: s.spell_id, player: name(s), playerId: s.player_id, club: club(s.squad), squad: s.squad,
    comp: s.comp, season: shortSeason(s.season), age: s.age, born: s.born, minutes: s.Minutes,
    cluster: s.k5_cluster, silhouette: s.k5_silhouette, centroidDist: s.k5_centroid_distance, secondDist: s.k5_second_centroid_distance,
    margin: s.k5_centroid_margin, pc: [s.PC1, s.PC2, s.PC3, s.PC4, s.PC5],
    robust: { familyBalanced: s.k5_family_balanced_aligned, equalPlayerWeight: s.k5_equal_player_weight_aligned, extremeTrimmed: s.k5_extreme_trimmed_aligned, allThree: s.k5_label_preserved_all_three_tests },
    distToCluster: [0, 1, 2, 3, 4].map((k) => s[`distance_to_cluster_${k}`]),
    alt: s.alternative_cluster, altDist: s.alternative_centroid_distance, pctWithin: s.centroid_distance_pct_within_cluster,
    nearest: { slug: slugOf.get(s.nearest_spell_id), dist: s.nearest_distance, pct: s.nearest_distance_population_percentile },
    fp: fp.get(s.spell_id), nb: nb.get(s.spell_id),
    career: career.get(s.player_id).map((c) => slugOf.get(c.spell_id)),
  };
  if (out.fp.some((r) => !r) || out.nb.length !== m.top_k) throw new Error(`incomplete data for ${out.slug}`);
  fs.writeFileSync(path.join(OUT, "spells", `${out.slug}.json`), JSON.stringify(out));
}
console.log(`winger: ${spells.length} spells, ${archetypes.length} archetypes → ${OUT}/ in ${Date.now() - t0} ms`);
