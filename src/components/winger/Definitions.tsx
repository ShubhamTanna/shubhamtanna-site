// What each behaviour measures, from the research feature dictionary (features.csv: interpretation, limitations).
// A disclosure, so the definitions are available on touch screens too, not only as hover titles.
import type { Feature } from "@/lib/winger-types";

export default function Definitions({ features }: { features: Feature[] }) {
  return (
    <details className="wx-defs">
      <summary className="mono">What each behaviour measures</summary>
      <dl>
        {features.map((f) => (
          <div key={f.key}>
            <dt>{f.name}{f.unitStatus === "unresolved_physical_unit" ? "*" : ""} <span className="mono">{f.family}</span></dt>
            <dd>{f.interpretation}{f.limitations ? <small> {f.limitations.replace(/\s*Notebook \d+[^.]*\.?/g, "").trim()}</small> : null}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
