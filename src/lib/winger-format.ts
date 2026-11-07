// Display rules for the winger explorer. Formatting only: stored values are never changed.
import type { Feature } from "./winger-types";

// Raw feature value as a reader would say it, using the feature's own display metadata.
export const fmtRaw = (f: Feature, v: number) => `${(v * f.multiplier).toFixed(f.precision)}${f.suffix}`;
export const fmtZ = (z: number) => `${z >= 0 ? "+" : "−"}${Math.abs(z).toFixed(2)}`;
export const fmtDist = (d: number) => d.toFixed(2);
export const fmtPct = (p: number) => p.toFixed(1);
export const season = (s: string) => s.replace("-", "–");
export const ordinal = (n: number) => { const r = Math.round(n); const s = ["th", "st", "nd", "rd"], v = r % 100; return `${r}${s[(v - 20) % 10] || s[v] || s[0]}`; };

// How strongly an average differs from the typical spell, in words. DRAFT wording, pending research sign-off.
export const strength = (z: number) => {
  const a = Math.abs(z);
  if (a < 0.25) return "about average";
  const w = a < 0.5 ? "slightly" : a < 1 ? "clearly" : "strongly";
  return `${w} ${z > 0 ? "more" : "less"}`;
};

// "Above 88% of all spells" / "Below 79% of all spells". shareBelow is the % of spells under the value.
export const shareText = (shareBelow: number) =>
  shareBelow >= 50 ? `higher than ${Math.round(shareBelow)}% of spells` : `lower than ${Math.round(100 - shareBelow)}% of spells`;

// Text colour with the better contrast on an archetype fill.
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
export const onColor = (hex: string) => (ratio(lum(hex), lum("#121211")) >= ratio(lum(hex), lum("#e8e7e2")) ? "#121211" : "#e8e7e2");

// The six features where an archetype's average is furthest from the typical spell, largest first.
export const topTendencies = (centroid: number[], n = 6) =>
  centroid.map((z, k) => ({ k, z })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z) || a.k - b.k).slice(0, n);

// Feature-by-feature squared differences between two z-score vectors (the research's own distance).
export const distanceParts = (a: number[], b: number[]) => {
  const parts = a.map((z, k) => ({ k, sq: (z - b[k]) ** 2, diff: z - b[k] }));
  const total = parts.reduce((s, p) => s + p.sq, 0);
  return { distance: Math.sqrt(total), parts: [...parts].sort((p, q) => q.sq - p.sq || p.k - q.k), total };
};
