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
  // 1,396 generated profiles: reachable and followable, but kept out of search results so they don't dilute the site.
  return r ? { title: `${r.player}, ${r.club} ${season(r.season)}`, robots: { index: false, follow: true } } : {};
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Existence check before anything suspends, so an unknown footballer gets a real 404 status (once streaming
  // starts the status is fixed at 200). getRow is a synchronous lookup in the catalogue.
  if (!getRow(slug)) notFound();
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
              <span className="mono">Club spells in the data · <Link href={`${EXPLORE}/evolution?p=${s.slug}`} style={{ display: "inline-block", paddingBlock: 4 }}>Follow across seasons →</Link></span>
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
          <p className="wx-note">Each style has a centre: its average across all 20 behaviours. This spell is placed at the left and each centre sits as far away as it is. The nearest centre decides the style. The five styles overlap, so a second centre close behind is common; it is not a measure of mixed membership.</p>
        </div>
        <Closeness dist={s.distToCluster} cluster={s.cluster} archetypes={m.archetypes} label={`${s.player.split(" ").slice(-1)[0]} ${season(s.season)}`} margin={s.margin} />
        <p className="wx-small">{robustCount === 3 ? `The assignment stayed ${a.code} in all three sensitivity checks (family-balanced, equal weight per footballer, extremes trimmed).` : `The assignment changed in ${3 - robustCount} of three sensitivity checks (family-balanced, equal weight per footballer, extremes trimmed). That shows sensitivity to alternative specifications, not a confidence level.`}</p>
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
          <p className="wx-note">For each other footballer we kept their closest qualifying spell, then selected the ten closest of those, across all 20 behaviours. All spells of {s.player} are excluded, and the search covers the whole 2017–2024 period, so later seasons can appear. Smaller distance means more alike in measured style; it is not a percentage and says nothing about quality.</p>
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
