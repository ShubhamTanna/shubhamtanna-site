// Behavioural signature as distribution strips: for each behaviour, where this style's seasons sit inside all
// winger spells. Drawn on paper; the style colour fills its own seasons. Statistics are the research's own z-scores.
import type { Archetype, Feature, Meta } from "@/lib/winger-types";
import { fmtZ, lc, listText, sdText, SHOT_UNIT_NOTE, signature, type SigItem } from "@/lib/winger-format";
import Definitions from "./Definitions";

// One-line reading of each style: group averages over spells relative to the pooled mean, in the measured
// denominators. Wording from the research copy audit (decoding-winger-playstyles PR #5, explorer_copy_audit.md).
// Falls back to a generated sentence if labels change.
const READING: Record<string, string> = {
  "Penalty-area attacking and shooting": "A larger share of this group’s attacking-third touches came inside the box, and its shots came from closer in. It averaged fewer crosses and progressive passes per 90.",
  "Crossing-oriented wide play": "Crosses and long balls made up larger shares of pass attempts. A smaller share of attacking-third touches came inside the box, and shots came from farther out on average.",
  "Deeper passing progression": "A smaller share of touches came in the attacking third, and a smaller share of receptions were progressive. Carrying accounted for less of the group’s progression; progressive passes per 90 were above average.",
  "Direct carrying and dribbling": "The group averaged more progressive carries and more carries into the box per 90. It attempted more take-ons per 100 live touches, while long passes made up a smaller share of pass attempts.",
  "Advanced creative progression": "These spells averaged more passes into the penalty area and more progressive passes per 90. Progressive carries and shots per 90 were also above the pooled average.",
};
export const readingOf = (a: Archetype, F: Feature[]) => {
  const sig = signature(a.centroid);
  return READING[a.label] ?? `Higher than average: ${listText(sig.more.map((s) => lc(F[s.k].name)))}. Lower: ${listText(sig.less.map((s) => lc(F[s.k].name)))}.`;
};

type Props = { a: Archetype; meta: Meta; all?: boolean };
type Group = { title: string; note?: string; items: SigItem[] };

export default function Signature({ a, meta, all }: Props) {
  const F = meta.features;
  const sig = signature(a.centroid);
  const groups: Group[] = all
    ? meta.families.map((fam) => ({ title: fam, items: F.map((_, k) => ({ k, z: a.centroid[k], context: false })).filter((x) => F[x.k].family === fam) }))
    : [
        { title: `Where ${a.code} is higher`, note: "Centre above the overall mean", items: sig.more },
        { title: `Where ${a.code} is lower`, note: "Centre below the overall mean", items: sig.less },
      ].sort((p, q) => q.items.filter((i) => !i.context).length - p.items.filter((i) => !i.context).length); // side with more of the top six first
  const anyCtx = !all && [...sig.more, ...sig.less].some((s) => s.context);

  return (
    <div className="sig" style={{ ["--c" as string]: a.color }}>
      <Guide code={a.code} />
      {groups.map((g) => (
        <section key={g.title} className="sig-grp">
          <div className="sig-h">
            <p><b className="d">{g.title}</b>{g.note && <span className="mono">{g.note}</span>}</p>
            <p className="mono ends" aria-hidden="true"><span>← lower values</span><span>higher values →</span></p>
          </div>
          {g.items.map((it) => <Strip key={it.k} a={a} meta={meta} {...it} />)}
        </section>
      ))}
      <p className="sig-foot">
        {all ? "All 20 behaviours, grouped by family. Higher means a higher measured value: a longer average shot distance, for example, is not more shooting." : `The six largest differences between the ${a.code} centre and the overall mean, in either direction.`}
        {anyCtx && " The six strongest differences always appear. When they mostly point one way, we also show up to three differences the other way, if the centre is at least 0.3 standard deviations from the overall mean. These are context, not defining traits."}
        {F.some((f) => f.unitStatus === "unresolved_physical_unit") && ` ${SHOT_UNIT_NOTE}`}
      </p>
      {all && <Definitions features={F} />}
    </div>
  );
}

// Plain-language key, drawn with the same marks as the strips.
function Guide({ code }: { code: string }) {
  return (
    <div className="sig-guide">
      <svg viewBox="0 0 132 44" aria-hidden="true">
        <path d="M2,40 C26,40 34,6 56,8 C80,10 92,38 130,40" className="pop" />
        <path d="M30,40 C44,40 52,14 66,12 C80,10 86,40 104,40 Z" className="mem" />
        <line x1="56" x2="56" y1="2" y2="42" className="zero" />
        <line x1="68" x2="68" y1="2" y2="42" className="avg" />
      </svg>
      <ul>
        <li><i className="g-pop" />Grey outline: <b>all 1,396 qualifying spells</b> (one footballer, one club, one season), from lowest values (left) to highest (right).</li>
        <li><i className="g-mem" />Coloured shape: <b>the {code} spells</b>. Where it sits shows how this group differs on average; members overlap with other groups.</li>
        <li><i className="g-avg" /><b>{code} centre</b>, the average of its spells (solid line), against <i className="g-zero" /><b>the overall mean</b> (dashed). The number is the gap in standard deviations (SD).</li>
        <li><span className="mono g-n">+12</span>A few spells sit beyond the strip’s edge; the number counts them.</li>
      </ul>
    </div>
  );
}

const star = (f: Feature) => (f.unitStatus === "unresolved_physical_unit" ? "*" : "");

function Strip({ a, meta, k, z, context }: { a: Archetype; meta: Meta } & SigItem) {
  const D = meta.distribution, nb = D.all[0].length - 2;
  const W = 400, H = 60;
  const x = (v: number) => ((v - D.lo) / (D.hi - D.lo)) * 100;
  const all = D.all[k], mem = D.byCluster[a.id].hist[k];
  const nAll = all.reduce((s, c) => s + c, 0), nMem = mem.reduce((s, c) => s + c, 0);
  const da = all.map((c) => c / nAll), dm = mem.map((c) => c / nMem);
  const peak = Math.max(...da.slice(1, -1), ...dm.slice(1, -1));
  // Smooth curve through bin centres (display only; bins are 0.25 SD wide).
  const path = (d: number[], close: boolean) => {
    const p = d.slice(1, -1).map((c, i) => [((i + 0.5) / nb) * W, H - (c / peak) * (H - 4)]);
    let s = `M${close ? `0,${H} L` : ""}${p[0][0]},${p[0][1]}`;
    for (let i = 1; i < p.length; i++) { const mx = (p[i - 1][0] + p[i][0]) / 2; s += ` C${mx},${p[i - 1][1]} ${mx},${p[i][1]} ${p[i][0]},${p[i][1]}`; }
    return close ? `${s} L${W},${H} Z` : s;
  };
  const f = meta.features[k];
  const over = all[all.length - 1], under = all[0];
  // Archetype copy stays on the centroid scale: the centre is the mean of its members' z-scores.
  const words = `${a.code} centre ${sdText(z)} of all qualifying spells`;
  return (
    <div className={`sig-row${context ? " ctx" : ""}`}>
      <div className="lab">
        <b>{f.name}{star(f)}{context && <em className="mono">for context</em>}</b>
        <span>{words}</span>
      </div>
      <div className="strip" role="img" aria-label={`${f.name}. ${a.code} spells against all qualifying spells. ${words}.`}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={path(dm, true)} className="mem" />
          <path d={path(da, false)} className="pop" vectorEffect="non-scaling-stroke" />
        </svg>
        <i className="zero" style={{ left: `${x(0)}%` }} />
        <i className="avg" style={{ left: `${x(Math.max(D.lo, Math.min(D.hi, z)))}%` }}><span className="mono">{fmtZ(z)}</span></i>
        {under > 0 && <span className="ov l mono" title={`${under} seasons sit further left than the strip shows (below −3 SD)`}>+{under}</span>}
        {over > 0 && <span className="ov r mono" title={`${over} seasons sit further right than the strip shows (above +3 SD)`}>+{over}</span>}
      </div>
    </div>
  );
}
