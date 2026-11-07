// Working fingerprint: one row per behaviour, grouped by family. Plain words first, numbers second.
// The axis widens to fit every value shown (the research contract forbids clipping). Not the final visual.
import type { Feature } from "@/lib/winger-types";
import { fmtRaw, fmtZ, shareText, skewed, skewNote } from "@/lib/winger-format";

type Row = [raw: number, z: number, pct: number, centroidZ: number];

export default function Fingerprint({ fp, features, families, color, code, selected }: {
  fp: Row[]; features: Feature[]; families: string[]; color: string; code: string; selected?: string;
}) {
  const vals = fp.flatMap((r) => [r[1], r[3]]);
  const lo = Math.floor(Math.min(-3, ...vals)), hi = Math.ceil(Math.max(3, ...vals));
  const x = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t++) if (t % (hi - lo > 8 ? 2 : 1) === 0) ticks.push(t);

  return (
    <div className="wx-fp">
      <div className="wx-fp-key mono">
        <span><i className="k-band" />Most spells (middle band, ±1 SD)</span>
        <span><i className="k-mid" />All-spell mean</span>
        <span><i className="k-dia" style={{ borderColor: color }} />{code} style average</span>
        <span><i className="k-dot" style={{ background: color }} />This spell</span>
      </div>
      <div className="wx-fp-axis mono" aria-hidden="true">
        <span />
        <div className="track">{ticks.map((t) => <span key={t} style={{ left: x(t) }}>{t === 0 ? "mean" : fmtZ(t).replace(".00", "")}</span>)}</div>
        <span />
      </div>
      {families.map((fam) => {
        const ks = features.map((f, k) => (f.family === fam ? k : -1)).filter((k) => k >= 0);
        if (!ks.length) return null;
        return (
          <div key={fam} className="wx-fp-fam">
            <p className="mono">{fam}</p>
            {ks.map((k) => {
              const f = features[k], [raw, z, pct, cz] = fp[k];
              const sel = selected === f.key;
              return (
                <div key={f.key} className={`wx-fp-row${sel ? " sel" : ""}`}>
                  <div className="lab">
                    <b>{f.name}</b>
                    <span>{shareText(pct)}{skewed(pct, z) ? " †" : ""}</span>
                  </div>
                  <div className="track" role="img" aria-label={`${f.name}: ${fmtZ(z)} standard deviations from the all-spell mean; ${code} average ${fmtZ(cz)}`}>
                    <i className="band" style={{ left: x(-1), width: `calc(${x(1)} - ${x(-1)})` }} />
                    <i className="mid" style={{ left: x(0) }} />
                    <i className="dia" style={{ left: x(cz), borderColor: color }} />
                    <i className="dot" style={{ left: x(z), background: color }} />
                    {sel && <i className="ring" style={{ left: x(z) }} />}
                  </div>
                  <div className="num mono">
                    <span title={f.unitStatus === "unresolved_physical_unit" ? "Source-reported distance; physical unit not confirmed" : f.unit}>{fmtRaw(f, raw)}{f.unitStatus === "unresolved_physical_unit" ? "*" : ""}</span>
                    <span>{fmtZ(z)} SD</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <p className="wx-small">Dots show how far this spell sits from the all-spell mean, in standard deviations (SD); the tick marks the mean. Percent figures are percentile rank among all 1,396 spells. Both describe behaviour, not quality.{fp.some((r) => skewed(r[2], r[1])) ? ` † ${skewNote}` : ""}{features.some((f) => f.unitStatus === "unresolved_physical_unit") ? " * Average shot distance is source-reported; its physical unit is not confirmed." : ""}</p>
    </div>
  );
}
