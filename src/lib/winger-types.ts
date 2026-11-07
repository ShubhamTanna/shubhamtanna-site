export const BASE = "/work/decoding-winger-playstyles";
export const EXPLORE = `${BASE}/explore`;
export const DATA = "/winger";

// Shapes of the files scripts/winger-derive.mjs writes to public/winger/. Safe to import anywhere.

export type Feature = {
  key: string; name: string; family: string; interpretation: string; limitations: string;
  unit: string; unitStatus: "verified_definition" | "unresolved_physical_unit";
  precision: number; multiplier: number; suffix: string;
};

export type Archetype = {
  id: number; code: string; label: string; color: string; nSpells: number; nPlayers: number;
  centroid: number[];      // standardized centroid, manifest feature order
  shareBelow: number[];    // display helper: % of all spells below the centroid on each feature
  representatives: string[]; // slugs, closest to the centroid first
};

export type Meta = {
  schemaVersion: string; dataVersion: string; sourceCommit: string;
  nSpells: number; nPlayers: number; nFeatures: number; minimumMinutes: number;
  seasons: [string, string]; leagues: string[]; comparisonScope: string; topK: number;
  limitations: string[]; families: string[];
  pca: { component: string; pct: number }[];
  zObserved: [number, number];
  nearestQuartiles: [number, number, number];
  features: Feature[]; archetypes: Archetype[];
  featured: { slug: string; name: string; club: string; cluster: number }[];
};

// One row of catalog.json, decoded.
export type CatalogRow = {
  slug: string; player: string; club: string; comp: string; season: string; cluster: number;
  pc1: number; pc2: number; minutes: number; age: number; centroidDist: number; pctWithin: number;
  stable: boolean; playerKey: number;
};

export type Spell = {
  slug: string; spellId: string; player: string; playerId: string; club: string; squad: string;
  comp: string; season: string; age: number; born: number; minutes: number;
  cluster: number; silhouette: number; centroidDist: number; secondDist: number; margin: number;
  pc: number[];
  robust: { familyBalanced: number; equalPlayerWeight: number; extremeTrimmed: number; allThree: boolean };
  distToCluster: number[]; alt: number; altDist: number; pctWithin: number;
  nearest: { slug: string; dist: number; pct: number };
  fp: [raw: number, z: number, pct: number, centroidZ: number][]; // manifest feature order
  nb: [slug: string, distance: number][];                        // ranks 1–10
  career: string[];                                              // this footballer's spells, by season
};

export const decodeCatalog = (c: { cols: string[]; rows: unknown[][] }): CatalogRow[] =>
  c.rows.map((r) => Object.fromEntries(c.cols.map((k, i) => [k, r[i]])) as CatalogRow);
