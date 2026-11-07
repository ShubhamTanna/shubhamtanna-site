import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Closeness from "@/components/winger/Closeness";
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
  const a = m.archetypes[s.cluster];
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
              <span className="mono">Seasons in the data · <Link href={`${EXPLORE}/evolution?p=${s.slug}`} style={{ display: "inline-block", paddingBlock: 4 }}>Follow across seasons →</Link></span>
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
        <div className="head"><h2 className="d">Which style is it closest to?</h2>
          <p className="wx-note">Each style has a centre: its average across all 20 behaviours. This season is placed at the left and each centre sits as far away as it is. The nearest centre decides the style. Styles overlap, so a second centre close behind means a mixed profile.</p>
        </div>
        <Closeness dist={s.distToCluster} cluster={s.cluster} archetypes={m.archetypes} label={`${s.player.split(" ").slice(-1)[0]} ${season(s.season)}`} />
        <p className="wx-small">{robustCount === 3 ? `It stayed closest to ${a.code} in all three robustness tests.` : `It moved style in ${3 - robustCount} of three robustness tests, so treat the assignment as borderline.`}</p>
      </section>

      <section className="wrap">
        <div className="head"><h2 className="d">Behavioural fingerprint</h2>
          <p className="wx-note">What this season did more or less than the average winger, across all 20 behaviours, with the {a.code} {a.label.toLowerCase()} average marked for reference.</p>
        </div>
        <Fingerprint fp={s.fp} features={m.features} families={m.families} color={a.color} code={a.code} />
        <p className="wx-small"><Link href={`${EXPLORE}/compare?a=${s.slug}`} style={{ display: "inline-block", paddingBlock: 4 }}>Compare this season with another →</Link></p>
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
