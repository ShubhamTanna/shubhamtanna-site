import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Fingerprint from "@/components/winger/Fingerprint";
import { FocusOn } from "@/components/winger/Selection";
import { EXPLORE, getMeta, getRow, loadSpell, prerenderedSlugs } from "@/lib/winger";
import { fmtDist, onColor, season } from "@/lib/winger-format";

// About 130 pages are built ahead; the other ~1,270 are rendered on first visit and cached.
export function generateStaticParams() {
  return prerenderedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = getRow((await params).slug);
  return r ? { title: `${r.player}, ${r.club} ${season(r.season)}` } : {};
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await loadSpell(slug);
  if (!s) notFound();
  const m = getMeta();
  const a = m.archetypes[s.cluster], alt = m.archetypes[s.alt];
  const maxD = Math.max(...s.distToCluster);
  const order = s.distToCluster.map((d, k) => ({ d, k })).sort((p, q) => p.d - q.d);
  const career = s.career.map((c) => getRow(c)!);
  const nbs = s.nb.map(([c, d]) => ({ r: getRow(c)!, d }));
  const robustCount = [s.robust.familyBalanced, s.robust.equalPlayerWeight, s.robust.extremeTrimmed].filter((x) => x === s.cluster).length;

  return (
    <article className="wx-player">
      <FocusOn slug={s.slug} style={s.cluster} />
      <header className="wx-phead">
        <div className="wrap">
          <Link className="mono back" href={`${EXPLORE}/players`}>← All footballers</Link>
          <div className="grid">
            <div>
              <p className="mono">{s.comp} · {season(s.season)}</p>
              <h1 className="d">{s.player}</h1>
              <p className="sub">{s.club} · age {s.age} · {s.minutes.toLocaleString("en-US")} minutes</p>
            </div>
            <div className="assign" style={{ background: a.color, color: onColor(a.color) }}>
              <span className="mono">Closest style · {a.code}</span>
              <b className="d">{a.label}</b>
              <Link className="mono" href={`${EXPLORE}?style=c${a.id}`} style={{ color: "inherit" }}>About this style →</Link>
            </div>
          </div>
          {career.length > 1 && (
            <nav className="wx-career" aria-label={`${s.player}’s seasons`}>
              <span className="mono">Seasons in the data</span>
              <ol>
                {career.map((c) => (
                  <li key={c.slug}>
                    <Link href={`${EXPLORE}/players/${c.slug}`} aria-current={c.slug === s.slug ? "page" : undefined}>
                      <i style={{ background: m.archetypes[c.cluster].color }} aria-hidden="true" />
                      <span>{season(c.season)}</span><small>{c.club} · {m.archetypes[c.cluster].code}</small>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </header>

      <section className="wrap">
        <div className="head"><h2 className="d">Where this season sits</h2>
          <p className="wx-note">Distance to the centre of each style across all 20 behaviours. The spell is assigned to the nearest one. Styles overlap, so a second style close behind means a mixed profile.</p>
        </div>
        <ol className="wx-dists">
          {order.map(({ d, k }) => (
            <li key={k} className={k === s.cluster ? "on" : undefined}>
              <span className="lab"><i style={{ background: m.archetypes[k].color }} />{m.archetypes[k].code} · {m.archetypes[k].label}</span>
              <span className="bar"><i style={{ width: `${(d / maxD) * 100}%`, background: k === s.cluster ? m.archetypes[k].color : undefined }} /></span>
              <span className="mono">{fmtDist(d)}</span>
            </li>
          ))}
        </ol>
        <p className="wx-small">Second closest: {alt.code} {alt.label}, {fmtDist(s.altDist - s.centroidDist)} further away. {robustCount === 3 ? `It stayed in ${a.code} in all three robustness tests.` : `It moved style in ${3 - robustCount} of three robustness tests, so treat the assignment as borderline.`}</p>
      </section>

      <section className="wrap">
        <div className="head"><h2 className="d">Behavioural fingerprint</h2>
          <p className="wx-note">All 20 behaviours for this season, against every winger spell and against the {a.label.toLowerCase()} average.</p>
        </div>
        <Fingerprint fp={s.fp} features={m.features} families={m.families} color={a.color} code={a.code} />
      </section>

      <section className="wrap">
        <div className="head"><h2 className="d">Most similar seasons</h2>
          <p className="wx-note">The ten closest spells by other footballers, across all 20 behaviours and the whole 2017–2024 period. Smaller distance means more alike in style. It is not a percentage and says nothing about quality.</p>
        </div>
        <ol className="wx-list">
          {nbs.map(({ r, d }, i) => (
            <li key={r.slug}>
              <span className="rank mono">{String(i + 1).padStart(2, "0")}</span>
              <Link href={`${EXPLORE}/players/${r.slug}`}><b>{r.player}</b><span>{r.club}</span></Link>
              <span className="mono season"><i className="sw" style={{ background: m.archetypes[r.cluster].color }} aria-hidden="true" />{m.archetypes[r.cluster].code} · {season(r.season)}</span>
              <span className="mono dist">{fmtDist(d)}</span>
              <Link className="mono cmp" href={`${EXPLORE}/compare?a=${s.slug}&b=${r.slug}`}>Compare</Link>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
