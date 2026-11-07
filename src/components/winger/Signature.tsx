// Behavioural signature as distribution strips: for each behaviour, where this style's seasons sit inside all
// winger seasons. Drawn on paper; the style colour fills its own seasons. Statistics are the research's own z-scores.
import type { Archetype, Feature, Meta } from "@/lib/winger-types";
import { fmtZ, lc, listText, sdText, signature, type SigItem } from "@/lib/winger-format";

// One-line football reading of each style, grounded only in its signature features.
// DRAFT: pending research sign-off. Falls back to a generated sentence if labels change.
const READING: Record<string, string> = {
  "Penalty-area attacking and shooting": "Lives in and around the box: more of its touches come in the penalty area and it shoots from closer in. It crosses and passes the ball forward much less than most wingers.",
  "Crossing-oriented wide play": "Stays wide and delivers: far more of its passes are crosses and long balls. It gets fewer touches in the penalty area and shoots from further out.",
  "Deeper passing progression": "Plays deeper and moves the ball on by passing: fewer touches in the final third and fewer forward carries and receptions, but more progressive passes.",
  "Direct carrying and dribbling": "Takes the ball forward itself: carries and dribbles into the final third and the box far more than most wingers, and plays fewer long passes.",
  "Advanced creative progression": "Creates from advanced areas: far more passes into the box and progressive passes, while also carrying and shooting more than most wingers.",
};
export const readingOf = (a: Archetype, F: Feature[]) => {
  const sig = signature(a.centroid);
  return READING[a.label] ?? `Leans into ${listText(sig.more.map((s) => lc(F[s.k].name)))}; less ${listText(sig.less.map((s) => lc(F[s.k].name)))}.`;
};

type Props = { a: Archetype; meta: Meta; all?: boolean };
type Group = { title: string; note?: string; items: SigItem[] };

export default function Signature({ a, meta, all }: Props) {
  const F = meta.features;
  const sig = signature(a.centroid);
  const groups: Group[] = all
    ? meta.families.map((fam) => ({ title: fam, items: F.map((_, k) => ({ k, z: a.centroid[k], context: false })).filter((x) => F[x.k].family === fam) }))
    : [
        { title: `What ${a.code} does more`, note: "Above the average winger", items: sig.more },
        { title: `What ${a.code} does less`, note: "Below the average winger", items: sig.less },
      ].sort((p, q) => q.items.filter((i) => !i.context).length - p.items.filter((i) => !i.context).length); // side with more of the top six first
  const anyCtx = !all && [...sig.more, ...sig.less].some((s) => s.context);

  return (
    <div className="sig" style={{ ["--c" as string]: a.color }}>
      <Guide code={a.code} />
      {groups.map((g) => (
        <section key={g.title} className="sig-grp">
          <div className="sig-h">
            <p><b className="d">{g.title}</b>{g.note && <span className="mono">{g.note}</span>}</p>
            <p className="mono ends" aria-hidden="true"><span>← less</span><span>more →</span></p>
          </div>
          {g.items.map((it) => <Strip key={it.k} a={a} meta={meta} {...it} />)}
        </section>
      ))}
      <p className="sig-foot">
        {all ? "All 20 behaviours, grouped by family." : `These are the six behaviours where the ${a.code} average differs most from the average winger, in either direction.`}
        {anyCtx && " Rows marked “for context” come from outside those six: the strongest tendencies in the other direction, shown so the style reads as a whole (only where the average is at least 0.3 SD from the mean)."}
        {F.some((f) => f.unitStatus === "unresolved_physical_unit") && " * The physical unit of average shot distance is not yet confirmed."}
      </p>
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
        <li><i className="g-pop" />Grey outline: <b>all 1,396 winger seasons</b>, from doing this least (left) to most (right).</li>
        <li><i className="g-mem" />Coloured shape: <b>the {code} seasons</b>. Where it sits shows how this style differs.</li>
        <li><i className="g-avg" /><b>{code} average</b> (solid line) against <i className="g-zero" /><b>the average winger</b> (dashed).</li>
        <li><span className="mono g-n">+12</span>A few seasons are too extreme to fit; the number counts them.</li>
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
  const f = meta.features[k], sb = a.shareBelow[k];
  const over = all[all.length - 1], under = all[0];
  const words = z >= 0 ? `More than ${Math.round(sb)}% of winger seasons` : `Less than ${Math.round(100 - sb)}% of winger seasons`;
  return (
    <div className={`sig-row${context ? " ctx" : ""}`}>
      <div className="lab">
        <b>{f.name}{star(f)}{context && <em className="mono">for context</em>}</b>
        <span>{a.code} average: {words.charAt(0).toLowerCase() + words.slice(1)}</span>
        <span className="mono sd">{sdText(z)}</span>
      </div>
      <div className="strip" role="img" aria-label={`${f.name}. ${a.code} seasons against all winger seasons. ${a.code} average ${sdText(z)}, ${words.toLowerCase()}.`}>
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
