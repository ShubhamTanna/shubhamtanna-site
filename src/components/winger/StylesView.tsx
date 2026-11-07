"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EXPLORE, type CatalogRow, type Meta } from "@/lib/winger-types";
import { fmtDist, onColor, season } from "@/lib/winger-format";
import Signature, { readingOf } from "./Signature";
import { useSelection } from "./Selection";

type Props = {
  meta: Meta;
  reps: CatalogRow[][];                       // per archetype, closest to its centre first
  featured: ({ slug: string; name: string; club: string; season: string; points: { name: string; value: string; pct: string }[] } | null)[];
};

export default function StylesView({ meta, reps, featured }: Props) {
  const { archetypes } = meta;
  const { style, set } = useSelection();
  const [all, setAll] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const m = /^c([0-4])$/i.exec(p.get("style") ?? "");
    if (m) set({ style: Number(m[1]) });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read after hydration
    if (p.get("all") === "1") setAll(true);
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
      <section className="wrap wx-hero">
        <p className="mono">Decoding winger playstyles · {archetypes.reduce((s, x) => s + x.nSpells, 0).toLocaleString("en-US")} spells</p>
        <div className="grid">
          <h1 className="d">One position.<br /><em>Many ways to play.</em></h1>
          <p className="wx-lede">Five recurring ways wingers attacked in Europe’s top five leagues, 2017–2024, found from 20 measured behaviours. The styles overlap: they describe tendencies, not fixed identities.</p>
        </div>
      </section>

      <section className="wrap">
        <p className="mono wx-label">Choose a style</p>
        <ul className="wx-cards" role="list">
          {archetypes.map((x) => (
            <li key={x.id}>
              <button type="button" aria-pressed={x.id === a.id} onClick={() => pick(x.id)} style={{ ["--c" as string]: x.color, ["--on" as string]: onColor(x.color) }}>
                <span className="code mono">{x.code}</span>
                <span className="name">{x.label}</span>
                <span className="n mono">{x.nSpells} spells</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap wx-style" style={{ ["--c" as string]: a.color, ["--on" as string]: ink }}>
        <header>
          <p className="mono"><span className="chip">{a.code}</span> Behavioural signature · {a.nSpells} spells · {a.nPlayers} footballers</p>
          <h2 className="d" aria-live="polite">{a.label}</h2>
          {!all && <p className="read">{readingOf(a, meta.features)}</p>}
        </header>
        <Signature a={a} meta={meta} all={all} />
        <button type="button" className="wx-all mono" aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Back to the six largest differences" : "Show all 20 behaviours"}</button>
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
              {f.points.length > 0 && (
                <ul className="why">
                  {f.points.map((pt) => <li key={pt.name}><b className="mono">{pt.value}</b><span>{pt.name}</span><small>around the {pt.pct} percentile</small></li>)}
                </ul>
              )}
              <Link className="more-link" href={`${EXPLORE}/players/${f.slug}`}>Open profile →</Link>
            </>) : <p className="wx-pending">A recognisable example for this style is still being chosen with the research.</p>}
          </aside>
        </div>
      </section>
    </>
  );
}
