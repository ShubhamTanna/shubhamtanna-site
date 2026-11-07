import StylesView from "@/components/winger/StylesView";
import { getMeta, getRow, getSpell } from "@/lib/winger";
import { fmtRaw, ordinal, signature } from "@/lib/winger-format";

export default function StylesPage() {
  const m = getMeta();
  const reps = m.archetypes.map((a) => a.representatives.slice(0, 10).map((s) => getRow(s)!));
  const featured = m.archetypes.map((a) => {
    const f = m.featured.find((x) => x.cluster === a.id);
    if (!f) return null;
    // Why this season is a good example: the style's signature behaviours (top six, not context) where this
    // season leans the same way as the style, strongest first. Measured value first, percentile as rank.
    const sp = getSpell(f.slug)!;
    const sig = signature(a.centroid);
    const points = [...sig.more, ...sig.less].filter((t) => !t.context && Math.sign(sp.fp[t.k][1]) === Math.sign(t.z))
      .sort((p, q) => Math.abs(sp.fp[q.k][1]) - Math.abs(sp.fp[p.k][1])).slice(0, 3)
      .map((t) => { const ft = m.features[t.k], [raw, , pct] = sp.fp[t.k]; return { name: ft.name, value: `${fmtRaw(ft, raw)}${ft.unitStatus === "unresolved_physical_unit" ? "*" : ""}`, pct: ordinal(pct) }; });
    return { slug: f.slug, name: f.name, club: f.club, season: getRow(f.slug)!.season, points };
  });
  return <StylesView meta={m} reps={reps} featured={featured} />;
}
