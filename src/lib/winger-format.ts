// Display rules for the winger explorer. Formatting only: stored values are never changed.
import type { Feature } from "./winger-types";

// Raw feature value as a reader would say it, using the feature's own display metadata.
export const fmtRaw = (f: Feature, v: number) => `${(v * f.multiplier).toFixed(f.precision)}${f.suffix}`;
export const fmtZ = (z: number) => `${z >= 0 ? "+" : "−"}${Math.abs(z).toFixed(2)}`;
export const fmtDist = (d: number) => d.toFixed(2);
export const fmtPct = (p: number) => p.toFixed(1);
export const season = (s: string) => s.replace("-", "–");
export const ordinal = (n: number) => { const r = Math.round(n); const s = ["th", "st", "nd", "rd"], v = r % 100; return `${r}${s[(v - 20) % 10] || s[v] || s[0]}`; };

// Words come from percentile rank (share of all spells below a value). SD values are shown alongside as
// distance from the all-spell mean. On skewed behaviours the two can point different ways; see skewNote.
export const shareText = (shareBelow: number) =>
  shareBelow >= 50 ? `higher than ${Math.round(shareBelow)}% of spells` : `lower than ${Math.round(100 - shareBelow)}% of spells`;
export const sdText = (z: number) =>
  Math.abs(z) < 0.005 ? "at the mean" : `${Math.abs(z).toFixed(2)} SD ${z > 0 ? "above" : "below"} the mean`;
// True when percentile and mean point opposite ways (above the median but below the mean, or the reverse).
export const skewed = (shareBelow: number, z: number) => (shareBelow - 50) * z < 0 && Math.abs(shareBelow - 50) >= 1;
export const skewNote =
  "Above the median but below the mean (or the reverse) is not a contradiction: on lopsided behaviours a few very high values pull the mean away from the middle spell.";

// Text colour with the better contrast on an archetype fill.
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
export const onColor = (hex: string) => (ratio(lum(hex), lum("#121211")) >= ratio(lum(hex), lum("#e8e7e2")) ? "#121211" : "#e8e7e2");

// The six features where an archetype's average is furthest from the all-spell mean, largest first.
export const topTendencies = (centroid: number[], n = 6) =>
  centroid.map((z, k) => ({ k, z })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z) || a.k - b.k).slice(0, n);

// Feature-by-feature squared differences between two z-score vectors (the research's own distance).
export const distanceParts = (a: number[], b: number[]) => {
  const parts = a.map((z, k) => ({ k, sq: (z - b[k]) ** 2, diff: z - b[k] }));
  const total = parts.reduce((s, p) => s + p.sq, 0);
  return { distance: Math.sqrt(total), parts: [...parts].sort((p, q) => q.sq - p.sq || p.k - q.k), total };
};

// Behavioural signature. The six largest absolute centroid deviations are always shown, unchanged.
// Display rule (pending research sign-off): if one direction has fewer than SIG.minSide of those six,
// add up to SIG.maxContext features from outside the six in that direction, only where the centroid is at
// least SIG.contextMin SD from the mean. Context features are always labelled as context.
export const SIG = { n: 6, minSide: 2, maxContext: 3, contextMin: 0.3 } as const;
export type SigItem = { k: number; z: number; context: boolean };
export function signature(centroid: number[]) {
  const top = topTendencies(centroid, SIG.n);
  const inTop = new Set(top.map((t) => t.k));
  const side = (sign: 1 | -1) => {
    const main: SigItem[] = top.filter((t) => Math.sign(t.z) === sign).map((t) => ({ ...t, context: false }));
    if (main.length >= SIG.minSide) return main;
    const extra = centroid.map((z, k) => ({ k, z }))
      .filter((t) => !inTop.has(t.k) && Math.sign(t.z) === sign && Math.abs(t.z) >= SIG.contextMin)
      .sort((a, b) => Math.abs(b.z) - Math.abs(a.z) || a.k - b.k).slice(0, SIG.maxContext);
    return [...main, ...extra.map((t) => ({ ...t, context: true }))];
  };
  return { more: side(1), less: side(-1) };
}
// "crosses per 90, cross share of passes and long-pass share"
export const listText = (names: string[]) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
export const lc = (name: string) => name.charAt(0).toLowerCase() + name.slice(1);
