// Behavioural fingerprint: one bold bar per behaviour, growing from the average winger (centre) towards less
// (left) or more (right), in the style colour. Grouped by the eight families. The axis widens to fit every value
// (the research contract forbids clipping). Words come from percentile rank; SD is distance from the mean.
import type { Feature } from "@/lib/winger-types";
import { fmtRaw, fmtZ, sdText, shareText, SHOT_UNIT_NOTE, signedBar, skewed, skewNote } from "@/lib/winger-format";
import Definitions from "./Definitions";

type Row = [raw: number, z: number, pct: number, centroidZ: number];

export default function Fingerprint({ fp, features, families, color, code, selected }: {
  fp: Row[]; features: Feature[]; families: string[]; color: string; code: string; selected?: string;
}) {
  const L = Math.max(3, Math.ceil(Math.max(...fp.flatMap((r) => [Math.abs(r[1]), Math.abs(r[3])]))));
  const x = (v: number) => ((v + L) / (2 * L)) * 100;
  const ticks = Array.from({ length: 2 * L + 1 }, (_, i) => i - L).filter((t) => L <= 4 || t % 2 === 0);
  // Standouts: the three behaviours furthest from the mean, in words.
  const top = fp.map((r, k) => ({ k, raw: r[0], z: r[1], pct: r[2] })).sort((p, q) => Math.abs(q.z) - Math.abs(p.z)).slice(0, 3);

  return (
    <div className="wx-fp2" style={{ ["--c" as string]: color }}>
      <ol className="wx-fp-top">
        {top.map(({ k, raw, z, pct }) => (
          <li key={k}>
            <span className="big d">{fmtRaw(features[k], raw)}{features[k].unitStatus === "unresolved_physical_unit" ? "*" : ""}</span>
            <b>{features[k].name}</b>
            <span>{shareText(pct).charAt(0).toUpperCase() + shareText(pct).slice(1)} · {sdText(z)}</span>
          </li>
        ))}
      </ol>
      <div className="wx-fp-key mono">
        <span><i className="k-bar" />This season</span>
        <span><i className="k-band" />Within 1 SD of the mean</span>
        <span><i className="k-mid" />Average winger</span>
        <span><i className="k-avg" />{code} style average</span>
      </div>
      <div className="wx-fp-axis mono" aria-hidden="true">
        <span>← less</span>
        <div className="track">{ticks.map((t) => <span key={t} style={{ left: `${x(t)}%` }}>{t === 0 ? "avg" : fmtZ(t).replace(".00", "")}</span>)}</div>
        <span className="r">more →</span>
      </div>
      {families.map((fam) => {
        const ks = features.map((f, k) => (f.family === fam ? k : -1)).filter((k) => k >= 0);
        if (!ks.length) return null;
        return (
          <section key={fam} className="wx-fp-fam">
            <p className="mono fam">{fam}</p>
            {ks.map((k) => {
              const f = features[k], [raw, z, pct, cz] = fp[k];
              const star = f.unitStatus === "unresolved_physical_unit" ? "*" : "";
              return (
                <div key={f.key} className={`wx-fp-row${selected === f.key ? " sel" : ""}`}>
                  <div className="lab">
                    <b>{f.name}{star}</b>
                    <span>{shareText(pct).charAt(0).toUpperCase() + shareText(pct).slice(1)}{skewed(pct, z) ? " †" : ""}</span>
                  </div>
                  <div className="track" role="img" aria-label={`${f.name}: ${shareText(pct)}, ${sdText(z)}. ${code} average ${fmtZ(cz)} SD.`}>
                    <i className="band" style={{ left: `${x(-1)}%`, width: `${x(1) - x(-1)}%` }} />
                    {(() => { const b = signedBar(x(z), x(0), 0.6); return b && <i className={`bar ${z < 0 ? "neg" : ""}`} style={{ left: `${b.left}%`, width: `${b.width}%` }} />; })()}
                    <i className="mid" style={{ left: `${x(0)}%` }} />
                    <i className="avg" style={{ left: `${x(cz)}%` }} title={`${code} average: ${fmtZ(cz)} SD`} />
                  </div>
                  <div className="num mono">
                    <b title={star ? "Source-reported distance; physical unit not confirmed" : f.unit}>{fmtRaw(f, raw)}{star}</b>
                    <span>{fmtZ(z)} SD</span>
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
      <p className="wx-small">Bars grow from the mean of all qualifying spells: right means a higher value than the mean, left a lower one, measured in standard deviations (SD). Percentile is this spell’s rank among all 1,396 qualifying spells (repeated footballers included); it is a rank, not a probability, a percent increase or the exact share below. Both describe behaviour, not quality.{fp.some((r) => skewed(r[2], r[1])) ? ` † ${skewNote}` : ""}{features.some((f) => f.unitStatus === "unresolved_physical_unit") ? ` ${SHOT_UNIT_NOTE}` : ""}</p>
      <Definitions features={features} />
    </div>
  );
}
