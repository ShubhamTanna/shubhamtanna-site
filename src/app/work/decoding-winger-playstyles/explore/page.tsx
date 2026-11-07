import StylesView from "@/components/winger/StylesView";
import { getMeta, getRow } from "@/lib/winger";

export default function StylesPage() {
  const m = getMeta();
  const reps = m.archetypes.map((a) => a.representatives.slice(0, 10).map((s) => getRow(s)!));
  const featured = m.archetypes.map((a) => {
    const f = m.featured.find((x) => x.cluster === a.id);
    return f ? { slug: f.slug, name: f.name, club: f.club, season: getRow(f.slug)!.season } : null;
  });
  return <StylesView archetypes={m.archetypes} features={m.features} reps={reps} featured={featured} />;
}
