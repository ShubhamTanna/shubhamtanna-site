import type { Metadata } from "next";
import Link from "next/link";
import { EXPLORE, getCatalog, getMeta } from "@/lib/winger";
import "./case.css";

// Case study. Every number on this page comes from the research fact sheet
// (decoding-winger-playstyles docs/case_study_fact_sheet.md, PR #5 at d9d8ef9) or from the verified data release.
// Not indexed until the coordinated launch.
export const metadata: Metadata = {
  title: "Decoding winger playstyles",
  description: "A self-initiated investigation into how wingers differ in attack: 1,396 player–club–season spells, 20 behavioural measures, five overlapping styles and an interactive explorer.",
  robots: { index: false, follow: false },
};

// From the fact sheet: archetype table (measured tendencies, approved examples) and counts.
const STYLES = [
  { id: 0, line: "A larger share of attacking-third touches in the box, shorter average shots and more shots per 100 attacking-third touches. Fewer crosses and progressive passes per 90.", ex: "Richarlison · Everton · 2018–19", slug: "richarlison-everton-2018-19" },
  { id: 1, line: "More crosses per 90; crosses and long passes make up larger shares of pass attempts. A smaller share of attacking-third touches in the box.", ex: "Raphinha · Leeds United · 2020–21", slug: "raphinha-leeds-united-2020-21" },
  { id: 2, line: "A smaller attacking-third share of touches and less progression by carrying, with progressive passing above average. All six largest differences are negative.", ex: "Carlos Soler · Valencia · 2018–19", slug: "carlos-soler-valencia-2018-19" },
  { id: 3, line: "More carries into the box and progressive carries per 90; more take-on attempts per 100 live touches. A smaller long-pass share.", ex: "Vinícius Júnior · Real Madrid · 2022–23", slug: "vinicius-junior-real-madrid-2022-23" },
  { id: 4, line: "More passes into the box, progressive passes, progressive carries and shots per 90.", ex: "Neymar · Paris Saint-Germain · 2021–22", slug: "neymar-paris-saint-germain-2021-22" },
];
const CHECKS = [
  { name: "Extremes trimmed", what: "Refit without the most extreme 1% of profiles", kept: 96.06017191977078 },
  { name: "Families balanced", what: "Each behavioural family weighted equally", kept: 92.40687679083095 },
  { name: "Equal weight per footballer", what: "Players with many seasons count no more than others", kept: 87.32091690544412 },
];

export default function CaseStudy() {
  const m = getMeta();
  const rows = getCatalog();
  const A = m.archetypes;
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <article className="page-project wcs">
      <header className="cband wcs-hero"><div className="wrap">
        <Link className="back" href="/work">← All work</Link>
        <div className="wcs-hgrid">
          <div>
            <span className="kicker">Analytics &amp; research · 2026 · Personal project</span>
            <h1>Decoding winger playstyles</h1>
            <p className="deck">Goals and assists tell you who finished the move. I set out to measure everything else a winger does.</p>
          </div>
          <figure className="wcs-hmap">
            <CaseMap rows={rows} colors={A.map((a) => a.color)} labels={A.map((a) => a.code)} dark />
            <figcaption>Every dot is one of 1,396 winger spells from 2017–18 to 2023–24, coloured by the nearest of five styles. The colours overlap. That is the finding.</figcaption>
          </figure>
        </div>
      </div></header>

      <div className="wrap"><div className="cbody">
        <div className="glance">
          <div><span>Role</span><p>Conceived and led: question, research design, decisions, interpretation, product</p></div>
          <div><span>Year</span><p>2026</p></div>
          <div><span>Origin</span><p>Personal project, self-initiated</p></div>
          <div><span>Methods</span><p>Feature design, PCA, K-Means, distance-based similarity, sensitivity checks</p></div>
        </div>
        <div className="answer2"><span>The answer</span><p>Goals and assists miss most of how wingers differ. Twenty behavioural measures across seven seasons show five recurring ways to attack, and a bigger finding: wingers sit on a continuum, not in boxes.</p></div>
        <div className="actions">
          <Link className="btn" href={EXPLORE}>Open the Winger Style Explorer →</Link>
        </div>

        <div className="stats wcs-stats">
          <div><b>1,396</b><span>player–club–season spells</span></div>
          <div><b>665</b><span>footballers</span></div>
          <div><b>20</b><span>behavioural measures</span></div>
          <div><b>7</b><span>seasons across 5 top leagues</span></div>
        </div>

        <section className="csec"><h2><i>{num()}</i><b>The question</b></h2><div>
          <p className="lede">It started as an argument with friends: should wingers who do completely different jobs be judged by the same numbers?</p>
          <p>Mohamed Salah is judged, fairly, by his goals. But <Link href={`${EXPLORE}/players/jeremy-doku-manchester-city-2023-24`}>Jérémy Doku</Link> and Savinho hurt teams in other ways: carrying the ball, beating defenders, creating chances. Goals and assists flatten all of that into one column.</p>
          <p>Years of watching Manchester City sharpened the doubt. In the 2022–23 treble season, I watched <Link href={`${EXPLORE}/players/jack-grealish-manchester-city-2022-23`}>Jack Grealish</Link> shape how the team attacked without producing the goals and assists that would make his impact obvious on a stat sheet. I had been turning the idea over for three or four years: players carry different responsibilities, and those responsibilities shape how a team works.</p>
          <p className="q">Can we identify and quantify the different ways wingers contribute in attack, beyond counting goals and assists?</p>
          <p>My hypothesis was that different jobs would leave distinct fingerprints: perhaps five or six recognisable types, such as goalscorers, dribblers, crossers and creators. I deliberately did not fix the groups in advance. I wanted the data to show what recurs, and I wanted to study players season by season rather than assume a footballer’s style never changes.</p>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>Five ways to play</b></h2><div>
          <p className="lede">The measurements produced five groups a football fan can recognise, without me assigning a single player by hand.</p>
          <ul className="wcs-styles">
            {STYLES.map((s) => { const a = A[s.id]; return (
              <li key={a.id} style={{ ["--c" as string]: a.color }}>
                <Link href={`${EXPLORE}?style=c${a.id}`}>
                  <span className="mono code">{a.code} · {a.nSpells} spells</span>
                  <b>{a.label}</b>
                  <span className="line">{s.line}</span>
                </Link>
                <Link className="mono ex" href={`${EXPLORE}/players/${s.slug}`}>e.g. {s.ex} →</Link>
              </li>
            ); })}
          </ul>
          <p className="ctx">Each description is a group tendency relative to the average spell, not a rule every member follows. The C0 name, for example, does not mean high shot volume: its shots per 90 sit near the overall mean; what stands out is where and how often it shoots relative to its touches.</p>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>The surprise: a continuum, not boxes</b></h2><div>
          <p className="lede">I expected distinct types. The data said otherwise, and that changed what the five groups mean.</p>
          <p>The overall separation between the groups is modest: a mean silhouette of about 0.149, on a scale where values near 1 would mean clean, well-separated groups. Wingers do not fall into five tidy boxes. They spread across a continuous space, with many spells sitting between styles.</p>
          <CaseMap rows={rows} colors={A.map((a) => a.color)} labels={A.map((a) => a.code)} />
          <p className="cap">All 1,396 spells on the first two principal components, coloured by nearest style. The colours bleed into each other because the styles genuinely overlap. These two directions hold 54.88% of the variation.</p>
          <p>So I refined the claim instead of forcing it. The five archetypes are useful summaries of recurring tendencies, not permanent player types. That shift is the most important result of the project: football roles are more nuanced than position labels, and more continuous than I had imagined.</p>
          <p>Before trusting even that, I tried to break it. I refit the groups three different ways and checked how many spells kept their label:</p>
          <ul className="wcs-checks">
            {CHECKS.map((c) => (
              <li key={c.name}>
                <span><b>{c.name}</b><small>{c.what}</small></span>
                <span className="bar" role="img" aria-label={`${c.kept.toFixed(0)}% kept their label`}><i style={{ width: `${c.kept}%` }} /></span>
                <b className="mono">{Math.round(c.kept)}%</b>
              </li>
            ))}
          </ul>
          <p className="ctx">The broad patterns recur, and weighting every footballer equally moves the most assignments. Agreement between these checks is consistency, not proof the groups would hold on new data.</p>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>How I got there</b></h2><div>
          <p className="lede">The hard part was not running algorithms. It was a chain of decisions, each made with imperfect information.</p>
          <ol className="wcs-steps">
            <li>
              <b>Decide who counts as a winger.</b>
              <p>Historical position labels blur wingers, forwards and midfielders. I defined the population from FIFA positional data (LW, RW, LM or RM eligibility) matched to the statistics by name, birth year and club history, resolved ambiguous identities manually, and required at least 1,125 minutes for every club spell. Result: 1,396 spells from 665 footballers.</p>
            </li>
            <li>
              <b>Add a second data source, knowing it would hurt.</b>
              <p>Midway through, I found a second source with attacking statistics the first did not have. Joining it by player, birth year, club and season matched the entire population, but it meant manual research into ambiguous identities and several rounds of reconciliation between sources. I chose the richer picture over the easier pipeline. The lesson stuck: analytical credibility is decided in the data, long before the model.</p>
            </li>
            <li>
              <b>Measure behaviour, not quality.</b>
              <p>I screened 27 candidate measures for interpretability, reliability and redundancy, built 21, and cut one that duplicated others. The final 20 cover eight families: territory, receiving, carrying, dribbling, passing, crossing, shooting and the choice between carrying and passing. Each describes how a winger plays, never how well.</p>
            </li>
            <li>
              <b>Use each method for one question only.</b>
              <p>PCA shows what varies together and powers the map. K-Means summarises the recurring group averages; I tested two to ten groups and kept five because it was the most interpretable description. Similarity uses all 20 measures, because the map hides too much: even five components kept only about 54% of each spell’s ten nearest neighbours.</p>
            </li>
            <li>
              <b>Try to break my own result.</b>
              <p>Three alternative specifications for the groups, and two alternative distance measures for similarity (which kept about 8.6 and 7.9 of each spell’s ten nearest footballers). I report what moved, not just what held.</p>
            </li>
          </ol>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>What the profiles reveal</b></h2><div>
          <p className="lede">The labels are the entry point. The real insight sits in the full profiles.</p>
          <div className="wcs-pairs">
            <figure>
              <figcaption><span className="mono">Different label, more crossing</span><b>Raphinha</b><span>Leeds United 2021–22 ({A[1].code}) → Barcelona 2022–23 ({A[4].code})</span></figcaption>
              <dl>
                <div><dt>Crosses per 90</dt><dd>5.00 <i>→</i> 7.47</dd></div>
                <div><dt>Passes into the box per 90</dt><dd>1.51 <i>→</i> 3.21</dd></div>
                <div><dt>Style distance between seasons</dt><dd>5.04</dd></div>
              </dl>
              <p>He crossed <em>more</em> at Barcelona, yet left the crossing group. The label follows the whole profile, not one headline action.</p>
              <Link className="mono" href={`${EXPLORE}/compare?a=raphinha-leeds-united-2021-22&b=raphinha-barcelona-2022-23`}>Compare both seasons →</Link>
            </figure>
            <figure>
              <figcaption><span className="mono">Same label, real change</span><b>Carlos Soler</b><span>Valencia 2018–19 ({A[2].code}) and 2020–21 ({A[2].code})</span></figcaption>
              <dl>
                <div><dt>Attacking-third touch share</dt><dd>36.0% <i>→</i> 24.7%</dd></div>
                <div><dt>Progressive passes per 90</dt><dd>4.50 <i>→</i> 5.03</dd></div>
                <div><dt>Style distance between seasons</dt><dd>5.15</dd></div>
              </dl>
              <p>Same group both times, yet his two seasons are further apart than Raphinha’s. A label can hide a meaningful shift.</p>
              <Link className="mono" href={`${EXPLORE}/compare?a=carlos-soler-valencia-2018-19&b=carlos-soler-valencia-2020-21`}>Compare both seasons →</Link>
            </figure>
          </div>
          <p>Across the data, 329 of the 665 footballers qualify in more than one season, so styles can be followed over time rather than assumed. Within any one group, players still vary widely, and similarity depends on the complete profile rather than a position label or one statistic. Some seasons sit far from every centre: <Link href={`${EXPLORE}/players/jeremy-doku-manchester-city-2023-24`}>Doku’s 2023–24</Link> is worth opening.</p>
          <p className="ctx">These comparisons describe how measured behaviour changed. They do not explain why, and they say nothing about whether a player got better or worse.</p>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>From notebooks to a product</b></h2><div>
          <p className="lede">Findings that live in notebooks persuade no one. I wanted people to explore them.</p>
          <p>I structured the results into a verified data release, checked on every build, and turned it into the Winger Style Explorer: the five styles and what defines each, a profile for every one of the 1,396 spells, the ten most similar seasons by other footballers, side-by-side comparisons, a 2D and 3D style map, and season-by-season evolution for any footballer with more than one qualifying spell.</p>
          <div className="actions"><Link className="btn" href={EXPLORE}>Open the explorer →</Link></div>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>What it cannot tell you</b></h2><div>
          <ul>
            <li><b>Behaviour, not effectiveness.</b> It describes how wingers attack, not how well: no finishing quality, efficiency or overall ability, and no style is shown to be better than another.</li>
            <li><b>No tactical cause.</b> There is no tracking data, off-ball movement, manager instruction, opposition pressure or teammate effect, so it cannot say why a player plays a certain way or why a style changed.</li>
            <li><b>Overlapping groups.</b> The five styles summarise a continuum; they are not natural types, and a label is not a permanent identity.</li>
            <li><b>Coverage.</b> Five leagues, seven seasons, positionally eligible players with enough minutes. Absent years do not mean a player stopped playing. Source versions are incompletely documented and a clean-environment rerun has not yet been demonstrated.</li>
          </ul>
          <p>This is a defensible descriptive framework, not a complete theory of winger performance.</p>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>Where it goes next</b></h2><div>
          <p>The bigger idea is to understand footballers by their responsibilities rather than their positions: extending the approach to other roles, adding event and tracking data for off-ball movement and space, and studying positional rotation. The question I care about most is complementarity: whether a player’s value depends partly on how their profile fits the teammates around them. That is a research question for the future, not something this model shows.</p>
        </div></section>

        <section className="csec"><h2><i>{num()}</i><b>What I took away</b></h2><div>
          <p className="lede">The most useful result did not confirm the hypothesis that started it.</p>
          <p>I set out to find distinct winger types and found a continuum with five recognisable tendencies. Taking that seriously, instead of overselling five clean categories, is what made the work defensible. I also learned that an ambiguous question becomes manageable when it is broken into small, testable decisions, and that you have to be just as clear about what the data cannot establish.</p>
          <p>I conceived the question, set the research direction, made the methodological calls, interpreted the results and directed the product from first notebook to finished explorer. I used AI assistants extensively to write and check the implementation; the questions, decisions and conclusions were mine.</p>
        </div></section>
      </div></div>

      <Link className="nextband" href={EXPLORE}><div className="wrap"><div><span className="k">Explore the research</span><h2>Winger Style Explorer</h2></div><b>Explore →</b></div></Link>
    </article>
  );
}

// Static style map for the case study: every spell on PC1/PC2, coloured by nearest style (verified release).
function CaseMap({ rows, colors, labels, dark }: { rows: { pc1: number; pc2: number; cluster: number; slug: string }[]; colors: string[]; labels: string[]; dark?: boolean }) {
  const X0 = -8.5, X1 = 12.5, Y0 = -6.5, Y1 = 7, S = 10;
  const px = (v: number) => (v - X0) * S, py = (v: number) => (Y1 - v) * S;
  return (
    <figure className={dark ? "wcs-map dark" : "wcs-map"}>
      <svg viewBox={`0 0 ${(X1 - X0) * S} ${(Y1 - Y0) * S}`} role="img" aria-label="Scatter of 1,396 spells on two principal components; the five style colours overlap heavily rather than forming separate clusters.">
        {!dark && <line x1={px(0)} x2={px(0)} y1={0} y2={(Y1 - Y0) * S} className="ax" />}
        {!dark && <line y1={py(0)} y2={py(0)} x1={0} x2={(X1 - X0) * S} className="ax" />}
        {rows.map((r) => <circle key={r.slug} cx={px(r.pc1)} cy={py(r.pc2)} r={dark ? 1.7 : 1.5} fill={colors[r.cluster]} />)}
      </svg>
      <div className="key mono" aria-hidden={dark ? undefined : true}>{labels.map((l, i) => <span key={l}><i style={{ background: colors[i] }} />{l}</span>)}</div>
    </figure>
  );
}
