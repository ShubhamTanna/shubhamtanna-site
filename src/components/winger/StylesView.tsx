"use client";
import Link from "next/link";
import { useEffect } from "react";
import { EXPLORE, type Archetype, type CatalogRow, type Feature } from "@/lib/winger-types";
import { fmtDist, onColor, season, shareText, strength, topTendencies } from "@/lib/winger-format";
import { useSelection } from "./Selection";

type Props = {
  archetypes: Archetype[]; features: Feature[];
  reps: CatalogRow[][];                       // per archetype, closest to its centre first
  featured: ({ slug: string; name: string; club: string; season: string } | null)[];
};

export default function StylesView({ archetypes, features, reps, featured }: Props) {
  const { style, set } = useSelection();
  useEffect(() => {
    const m = /^c([0-4])$/i.exec(new URLSearchParams(location.search).get("style") ?? "");
    if (m) set({ style: Number(m[1]) });
  }, [set]);
  const pick = (id: number) => {
    set({ style: id });
    const u = new URL(location.href); u.searchParams.set("style", `c${id}`); history.replaceState(null, "", u);
  };
  const a = archetypes[style] ?? archetypes[0];
  const ink = onColor(a.color);
  const f = featured[a.id];

  return (
    <>
      <section className="wx-styles wrap">
        <div className="wx-intro">
          <p className="mono">Decoding winger playstyles · {archetypes.reduce((s, x) => s + x.nSpells, 0).toLocaleString("en-US")} spells</p>
          <h1 className="d">One position.<br /><em>Many ways to play.</em></h1>
          <p className="wx-lede">Five recurring ways wingers attacked in Europe’s top five leagues, 2017–2024, found from 20 measured behaviours. The styles overlap: they describe tendencies, not fixed identities.</p>
          <p className="mono wx-label">Choose a style</p>
          <ul className="wx-picker">
            {archetypes.map((x) => (
              <li key={x.id}>
                <button type="button" aria-pressed={x.id === a.id} onClick={() => pick(x.id)} style={{ ["--c" as string]: x.color, ["--on" as string]: onColor(x.color) }}>
                  <i aria-hidden="true" />
                  <span className="code">{x.code}</span>
                  <span className="name">{x.label}</span>
                  <span className="n">{x.nSpells}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="wx-panel" style={{ background: a.color, color: ink }} aria-live="polite">
          <div className="top"><span className="mono">{a.code} · Behavioural signature</span><span className="mono">{a.nSpells} spells · {a.nPlayers} footballers</span></div>
          <h2 className="d">{a.label}</h2>
          <div className="wx-sigslot" style={{ borderColor: ink }}>
            <span className="mono">Signature visual · options in review</span>
          </div>
          <p className="mono wx-label" style={{ color: ink }}>What sets it apart</p>
          <ol className="wx-tend">
            {topTendencies(a.centroid).map(({ k, z }) => (
              <li key={k}>
                <span className="feat">{features[k].name}</span>
                <span className="how">{strength(z)} than the typical winger · its average is {shareText(a.shareBelow[k])}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap wx-reps">
        <div className="head"><h2 className="d">Most representative profiles</h2>
          <p className="wx-note">Spells ranked by how close they sit to the centre of <b>{a.label}</b> across all 20 behaviours. Closest first. Close means a typical example of the style, not a better player.</p>
        </div>
        <div className="wx-reps-grid">
          <ol className="wx-list">
            {reps[a.id].slice(0, 10).map((r, i) => (
              <li key={r.slug}>
                <span className="rank mono">{String(i + 1).padStart(2, "0")}</span>
                <Link href={`${EXPLORE}/players/${r.slug}`}><b>{r.player}</b><span>{r.club}</span></Link>
                <span className="mono season">{season(r.season)}</span>
                <span className="mono dist" title="Distance from the style’s centre (20 standardized behaviours)">{fmtDist(r.centroidDist)}</span>
              </li>
            ))}
          </ol>
          <aside className="wx-featured" style={{ borderTopColor: a.color }}>
            <p className="mono">Featured example</p>
            {f ? (<>
              <p className="d big">{f.name}</p>
              <p>{f.club} · {season(f.season)}</p>
              <Link className="more-link" href={`${EXPLORE}/players/${f.slug}`}>Open profile →</Link>
            </>) : <p className="wx-pending">A recognisable example for this style is still being chosen with the research.</p>}
          </aside>
        </div>
      </section>
    </>
  );
}
