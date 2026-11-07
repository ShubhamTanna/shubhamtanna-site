// Server-side reader for the explorer's derived files (public/winger/, made by scripts/winger-derive.mjs).
// Used while rendering at build time; the browser fetches the same files directly when it needs them.
import fs from "node:fs";
import path from "node:path";
import { decodeCatalog, type CatalogRow, type Meta, type Spell } from "./winger-types";

const DIR = path.join(process.cwd(), "public", "winger");
let meta: Meta | undefined, catalog: CatalogRow[] | undefined, bySlug: Map<string, CatalogRow> | undefined;

export { BASE, EXPLORE } from "./winger-types";

export function getMeta(): Meta {
  return (meta ??= JSON.parse(fs.readFileSync(path.join(DIR, "meta.json"), "utf8")));
}
export function getCatalog(): CatalogRow[] {
  return (catalog ??= decodeCatalog(JSON.parse(fs.readFileSync(path.join(DIR, "catalog.json"), "utf8"))));
}
export function getRow(slug: string): CatalogRow | undefined {
  bySlug ??= new Map(getCatalog().map((r) => [r.slug, r]));
  return bySlug.get(slug);
}
// Cached so footballer pages that aren't prerendered are rendered once on first visit, then served from cache.
export async function loadSpell(slug: string): Promise<Spell | undefined> {
  "use cache";
  return getSpell(slug);
}
// Spells prerendered at build: featured examples and each style's 25 most representative spells.
export function prerenderedSlugs(): string[] {
  const m = getMeta();
  return [...new Set([...m.featured.map((f) => f.slug), ...m.archetypes.flatMap((a) => a.representatives)])];
}
export function getSpell(slug: string): Spell | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  const f = path.join(DIR, "spells", `${slug}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : undefined;
}
