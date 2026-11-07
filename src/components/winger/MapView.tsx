"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EXPLORE, type CatalogRow, type Meta } from "@/lib/winger-types";
import { season } from "@/lib/winger-format";
import { loadCatalog } from "./PlayerSearch";
import { useSelection } from "./Selection";

// PCA map: original saved PC1/PC2, one shared scale on both axes, every spell visible in its style colour.
const X0 = -8.5, X1 = 12.5, Y0 = -6.5, Y1 = 7, S = 10;
const px = (v: number) => (v - X0) * S, py = (v: number) => (Y1 - v) * S;

export default function MapView({ meta }: { meta: Meta }) {
  const router = useRouter();
  const { focus } = useSelection();
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [off, setOff] = useState<Set<number>>(new Set());
  const [hover, setHover] = useState<CatalogRow | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    loadCatalog().then(setRows);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read after hydration
    setSel(new URLSearchParams(location.search).get("p") ?? focus);
  }, [focus]);
  const picked = useMemo(() => rows?.find((r) => r.slug === sel) ?? null, [rows, sel]);
  const show = hover ?? picked;
  const ticksX = [-8, -4, 0, 4, 8, 12], ticksY = [-4, 0, 4];

  return (
    <div className="wx-map">
      <div className="wx-map-legend" role="group" aria-label="Show or hide styles">
        {meta.archetypes.map((a) => (
          <button key={a.id} type="button" aria-pressed={!off.has(a.id)} onClick={() => { const n = new Set(off); if (n.has(a.id)) n.delete(a.id); else n.add(a.id); setOff(n); }}>
            <i style={{ background: a.color }} aria-hidden="true" />{a.code} {a.label}
          </button>
        ))}
      </div>
      <figure>
        <svg viewBox={`-30 -6 ${(X1 - X0) * S + 36} ${(Y1 - Y0) * S + 26}`} role="img" aria-label={`Map of ${meta.nSpells} spells on the first two principal components, coloured by style`}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => { const i = (e.target as SVGElement).dataset?.i; if (i && rows) router.push(`${EXPLORE}/players/${rows[+i].slug}`); }}>
          {ticksX.map((t) => <g key={`x${t}`}><line x1={px(t)} x2={px(t)} y1={0} y2={(Y1 - Y0) * S} className={t ? "g" : "g0"} /><text x={px(t)} y={(Y1 - Y0) * S + 12} textAnchor="middle">{t}</text></g>)}
          {ticksY.map((t) => <g key={`y${t}`}><line y1={py(t)} y2={py(t)} x1={0} x2={(X1 - X0) * S} className={t ? "g" : "g0"} /><text x={-6} y={py(t) + 3} textAnchor="end">{t}</text></g>)}
          {rows?.map((r, i) => off.has(r.cluster) ? null : (
            <circle key={r.slug} data-i={i} cx={px(r.pc1)} cy={py(r.pc2)} r={1.15} fill={meta.archetypes[r.cluster].color} fillOpacity={0.8}
              onMouseEnter={() => setHover(r)}><title>{`${r.player}, ${r.club} ${season(r.season)}`}</title></circle>
          ))}
          {picked && <circle cx={px(picked.pc1)} cy={py(picked.pc2)} r={3.4} className="ring" />}
        </svg>
        <figcaption className="mono">
          <span>PC1 · {meta.pca[0].pct.toFixed(1)}% of variation →</span>
          <span>↑ PC2 · {meta.pca[1].pct.toFixed(1)}%</span>
        </figcaption>
      </figure>
      <p className="wx-readout" aria-live="polite">
        {show ? <>{show.player}, {show.club} · {season(show.season)} · {meta.archetypes[show.cluster].code} {meta.archetypes[show.cluster].label}</> : rows ? "Hover a dot to see who it is; select it to open the profile." : "Loading 1,396 spells…"}
      </p>
      <p className="wx-small">The map squeezes 20 behaviours into two directions that keep {(meta.pca[0].pct + meta.pca[1].pct).toFixed(0)}% of the variation, so closeness here is approximate. Similarity elsewhere in the explorer uses all 20 behaviours.</p>
    </div>
  );
}
