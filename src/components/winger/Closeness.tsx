// How close a season sits to each style's centre: the season at the left, each centre placed by its distance.
// Nearer to the season = more alike. Distances are the research's 20-behaviour distances, not percentages.
import type { Archetype } from "@/lib/winger-types";
import { fmtDist } from "@/lib/winger-format";

export default function Closeness({ dist, cluster, archetypes, label = "This season" }: {
  dist: number[]; cluster: number; archetypes: Archetype[]; label?: string;
}) {
  const max = Math.max(4, Math.ceil(Math.max(...dist)));
  const x = (d: number) => (d / max) * 100;
  const order = dist.map((d, k) => ({ d, k })).sort((p, q) => p.d - q.d);
  // Lanes: a marker within 9% of the previous one moves to the next lane so labels don't collide.
  const placed = order.reduce<{ d: number; k: number; lane: number }[]>((acc, o) => {
    const prev = acc[acc.length - 1];
    return [...acc, { ...o, lane: prev && x(o.d) - x(prev.d) < 9 ? (prev.lane + 1) % 3 : 0 }];
  }, []);
  const ticks = Array.from({ length: Math.floor(max / 2) + 1 }, (_, i) => i * 2);
  const first = order[0], second = order[1];

  return (
    <div className="wx-near">
      <div className="track" role="img" aria-label={`Distance to each style's centre, nearest first: ${order.map((o) => `${archetypes[o.k].code} ${fmtDist(o.d)}`).join(", ")}.`}>
        <div className="line" />
        <span className="me"><i /><b className="mono">{label}</b></span>
        {placed.map(({ d, k, lane }) => {
          const a = archetypes[k];
          return (
            <span key={k} className={`ctr${k === cluster ? " on" : ""}`} style={{ left: `${x(d)}%`, ["--c" as string]: a.color, ["--lane" as string]: lane }}>
              <i /><b className="mono">{a.code}</b>
            </span>
          );
        })}
        <div className="ticks mono" aria-hidden="true">{ticks.map((t) => <span key={t} style={{ left: `${x(t)}%` }}>{t}</span>)}</div>
      </div>
      <p className="mono cap" aria-hidden="true">← more alike · style distance · less alike →</p>
      <ol className="wx-near-list">
        {order.map(({ d, k }, i) => {
          const a = archetypes[k];
          return (
            <li key={k} className={k === cluster ? "on" : undefined}>
              <span className="mono rk">{i === 0 ? "Closest" : `${i + 1}${["", "nd", "rd", "th", "th"][i]}`}</span>
              <span className="nm"><i style={{ background: a.color }} />{a.code} · {a.label}</span>
              <span className="mono">{fmtDist(d)}{i > 0 && <small> +{fmtDist(d - first.d)}</small>}</span>
            </li>
          );
        })}
      </ol>
      <p className="wx-small">
        Nearest centre: {archetypes[first.k].code} {archetypes[first.k].label}. The next nearest, {archetypes[second.k].code}, is {fmtDist(second.d - first.d)} further away
        {second.d - first.d < 0.5 ? ", so this season mixes both styles." : "."} Distance runs across all 20 behaviours; it is not a percentage and says nothing about quality.
      </p>
    </div>
  );
}
