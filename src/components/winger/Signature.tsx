// Behavioural signature: three concepts under review, drawn from the same statistics.
//   strips  where the style's members sit inside the distribution of all winger spells
//   ledger  percentile rank of the style average, set as type
//   ladder  the style average against the other four styles' averages
// Monochrome in the panel's ink so it works on every archetype colour. Not final.
import type { Archetype, Feature, Meta } from "@/lib/winger-types";
import { fmtZ, lc, listText, sdText, signature, type SigItem } from "@/lib/winger-format";

export type SigVariant = "strips" | "ledger" | "ladder";
export const SIG_VARIANTS: { id: SigVariant; name: string }[] = [
  { id: "strips", name: "A · Distribution strips" },
  { id: "ledger", name: "B · Rank ledger" },
  { id: "ladder", name: "C · Style ladder" },
];

// One-line football reading of each style, grounded only in its signature features.
// DRAFT: pending research sign-off. Falls back to a generated sentence if labels change.
const READING: Record<string, string> = {
  "Penalty-area attacking and shooting": "Lives in and around the box: more of its touches come in the penalty area and it shoots from closer in. It crosses and passes the ball forward much less than most wingers.",
  "Crossing-oriented wide play": "Stays wide and delivers: far more of its passes are crosses and long balls. It gets fewer touches in the penalty area and shoots from further out.",
  "Deeper passing progression": "Plays deeper and moves the ball on by passing: fewer touches in the final third and fewer forward carries and receptions, but more progressive passes.",
  "Direct carrying and dribbling": "Takes the ball forward itself: carries and dribbles into the final third and the box far more than most wingers, and plays fewer long passes.",
  "Advanced creative progression": "Creates from advanced areas: far more passes into the box and progressive passes, while also carrying and shooting more than most wingers.",
};

type Props = { a: Archetype; meta: Meta; variant: SigVariant; all?: boolean };

export default function Signature({ a, meta, variant, all }: Props) {
  const F = meta.features;
  const sig = signature(a.centroid);
  const reading = READING[a.label] ?? `Leans into ${listText(sig.more.map((s) => lc(F[s.k].name)))}; less ${listText(sig.less.map((s) => lc(F[s.k].name)))}.`;
  const groups: { title: string; note?: string; items: SigItem[] }[] = all
    ? meta.families.map((fam) => ({ title: fam, items: F.map((f, k) => ({ k, z: a.centroid[k], context: false })).filter((x) => F[x.k].family === fam) }))
    : [
        { title: "Leans into", note: "above the all-spell mean", items: sig.more },
        { title: "Less of", note: "below the all-spell mean", items: sig.less },
      ].sort((p, q) => q.items.filter((i) => !i.context).length - p.items.filter((i) => !i.context).length); // side with more of the top six first
  const View = variant === "strips" ? Strips : variant === "ladder" ? Ladder : Ledger;
  return (
    <div className={`sig sig-${variant}`}>
      {!all && <p className="sig-read">{reading}</p>}
      <View a={a} meta={meta} groups={groups} />
      <p className="sig-foot">
        {all ? "All 20 behaviours, by family." : `The six behaviours where the ${a.code} average is furthest from the all-spell mean, in either direction.`}
        {!all && [...sig.more, ...sig.less].some((s) => s.context) && ` Dashed rows are context: the strongest tendencies the other way from outside those six, at least 0.3 SD from the mean.`}
        {F.some((f) => f.unitStatus === "unresolved_physical_unit") && " * Physical unit of average shot distance not confirmed."}
      </p>
    </div>
  );
}

type ViewProps = { a: Archetype; meta: Meta; groups: { title: string; note?: string; items: SigItem[] }[] };
const star = (f: Feature) => (f.unitStatus === "unresolved_physical_unit" ? "*" : "");
const rank = (sb: number, z: number) => (z >= 0 ? `Average higher than ${Math.round(sb)}% of spells` : `Average lower than ${Math.round(100 - sb)}% of spells`);

function Head({ title, note, count }: { title: string; note?: string; count: number }) {
  return <p className="sig-h mono"><b>{title}</b>{note && <span>{note}</span>}<span className="sr"> ({count})</span></p>;
}

// A · the style's members (filled) inside all 1,396 spells (outline), with its average marked.
function Strips({ a, meta, groups }: ViewProps) {
  const D = meta.distribution, nb = D.all[0].length - 2;
  const W = 240, Hh = 36;
  const x = (z: number) => ((z - D.lo) / (D.hi - D.lo)) * 100;
  const path = (h: number[], peak: number, close: boolean) => {
    const pts = h.slice(1, -1).map((c, i) => `${((i + 0.5) / nb) * W},${Hh - (c / peak) * (Hh - 2)}`);
    return close ? `M0,${Hh} L${pts.join(" L")} L${W},${Hh} Z` : `M${pts.join(" L")}`;
  };
  return (
    <div className="sig-groups">
      {groups.map((g) => (
        <section key={g.title}>
          <Head title={g.title} note={g.note} count={g.items.length} />
          {g.items.map(({ k, z, context }) => {
            const f = meta.features[k];
            const all = D.all[k], mem = D.byCluster[a.id].hist[k];
            const nAll = all.reduce((s, c) => s + c, 0), nMem = mem.reduce((s, c) => s + c, 0);
            const da = all.map((c) => c / nAll), dm = mem.map((c) => c / nMem);
            const peak = Math.max(...da.slice(1, -1), ...dm.slice(1, -1));
            const [q1, , q3] = D.byCluster[a.id].quartiles[k];
            const over = all[all.length - 1], under = all[0];
            return (
              <div key={k} className={`sig-row${context ? " ctx" : ""}`}>
                <div className="lab">
                  <b>{f.name}{star(f)}</b>
                  <span>{rank(a.shareBelow[k], z)} · {fmtZ(z)} SD</span>
                </div>
                <div className="strip" role="img" aria-label={`${f.name}: ${a.code} members against all spells. ${a.code} average ${sdText(z)}; middle half of ${a.code} spells between ${fmtZ(q1)} and ${fmtZ(q3)} SD.`}>
                  <svg viewBox={`0 0 ${W} ${Hh}`} preserveAspectRatio="none" aria-hidden="true">
                    <path d={path(dm, peak, true)} className="mem" />
                    <path d={path(da, peak, false)} className="pop" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <i className="zero" style={{ left: `${x(0)}%` }} />
                  <i className="iqr" style={{ left: `${x(Math.max(D.lo, q1))}%`, width: `${x(Math.min(D.hi, q3)) - x(Math.max(D.lo, q1))}%` }} />
                  <i className="avg" style={{ left: `${x(z)}%` }}><span className="mono">{a.code}</span></i>
                  {under > 0 && <span className="ov l mono">‹{under}</span>}
                  {over > 0 && <span className="ov r mono">{over}›</span>}
                </div>
              </div>
            );
          })}
        </section>
      ))}
      <div className="sig-key mono" aria-hidden="true">
        <span><i className="k-mem" />{a.code} spells</span>
        <span><i className="k-pop" />All spells</span>
        <span><i className="k-iqr" />Middle half of {a.code}</span>
        <span><i className="k-zero" />All-spell mean</span>
        <span>‹ › spells beyond ±3 SD</span>
      </div>
    </div>
  );
}

// B · percentile rank of the style average, set large; where it sits on a 0–100 rank scale.
function Ledger({ a, meta, groups }: ViewProps) {
  return (
    <div className="sig-cols">
      {groups.map((g) => (
        <section key={g.title}>
          <Head title={g.title} note={g.note} count={g.items.length} />
          <ol>
            {g.items.map(({ k, z, context }) => {
              const f = meta.features[k], sb = a.shareBelow[k];
              const big = z >= 0 ? Math.round(sb) : Math.round(100 - sb);
              return (
                <li key={k} className={context ? "ctx" : undefined}>
                  <span className="big d">{big}<small>%</small></span>
                  <span className="cap">{z >= 0 ? "of spells sit below the" : "of spells sit above the"} {a.code} average</span>
                  <span className="rk" role="img" aria-label={`Percentile rank ${Math.round(sb)} of 100`}><i style={{ left: `${sb}%` }} /></span>
                  <b>{f.name}{star(f)}</b>
                  <span className="mono sd">{sdText(z)}{context ? " · context" : ""}</span>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

// C · the five style averages on each behaviour; this style filled, the other four hollow.
function Ladder({ a, meta, groups }: ViewProps) {
  const ks = groups.flatMap((g) => g.items.map((i) => i.k));
  const ext = Math.max(1.5, ...ks.flatMap((k) => meta.archetypes.map((o) => Math.abs(o.centroid[k]))));
  const lim = Math.ceil(ext * 2) / 2;
  const x = (z: number) => ((z + lim) / (2 * lim)) * 100;
  return (
    <div className="sig-groups">
      <div className="sig-axis mono" aria-hidden="true"><span>← less</span><span>mean</span><span>more →</span></div>
      {groups.map((g) => (
        <section key={g.title}>
          <Head title={g.title} note={g.note} count={g.items.length} />
          {g.items.map(({ k, z, context }) => {
            const f = meta.features[k];
            // Stagger labels of averages that sit close together: above, then below.
            let last = -Infinity, up = true;
            const others = meta.archetypes.filter((o) => o.id !== a.id).map((o) => ({ o, px: x(o.centroid[k]) })).sort((p, q) => p.px - q.px)
              .map((e) => { up = e.px - last < 7 ? !up : true; last = e.px; return { ...e, up }; });
            return (
              <div key={k} className={`sig-row${context ? " ctx" : ""}`}>
                <div className="lab"><b>{f.name}{star(f)}</b><span>{rank(a.shareBelow[k], z)} · {fmtZ(z)} SD</span></div>
                <div className="lad" role="img" aria-label={`${f.name}: ${a.code} average ${sdText(z)}. Other styles: ${others.map(({ o }) => `${o.code} ${fmtZ(o.centroid[k])}`).join(", ")}.`}>
                  <i className="zero" style={{ left: `${x(0)}%` }} />
                  <i className="stem" style={{ left: `${Math.min(x(0), x(z))}%`, width: `${Math.abs(x(z) - x(0))}%` }} />
                  {others.map(({ o, px, up }) => <i key={o.id} className={`oth${up ? "" : " dn"}`} style={{ left: `${px}%` }} title={`${o.code} ${o.label}: ${fmtZ(o.centroid[k])} SD`}><span className="mono">{o.code}</span></i>)}
                  <i className="me" style={{ left: `${x(z)}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      ))}
      <div className="sig-key mono" aria-hidden="true">
        <span><i className="k-me" />{a.code} average</span>
        <span><i className="k-oth" />Other styles’ averages</span>
        <span>Scale ±{lim} SD from the all-spell mean</span>
      </div>
    </div>
  );
}
