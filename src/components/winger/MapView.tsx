"use client";
// Style map: every spell placed by the research's saved principal components (PC1, PC2 and, in 3D, PC3),
// coloured by its closest style. Same scale on every axis. Selecting a dot makes it the explorer's footballer.
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXPLORE, type CatalogRow, type Meta } from "@/lib/winger-types";
import { PCA_AXES, season } from "@/lib/winger-format";
import { loadCatalog } from "./PlayerSearch";
import { useSelection } from "./Selection";

const X0 = -8.5, X1 = 12.5, Y0 = -6.5, Y1 = 7;

export default function MapView({ meta }: { meta: Meta }) {
  const { focus, set } = useSelection();
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [off, setOff] = useState<Set<number>>(new Set());
  const [hover, setHover] = useState<CatalogRow | null>(null);
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const slug = p.get("p");
    loadCatalog().then((r) => { setRows(r); if (slug && r.some((x) => x.slug === slug)) set({ focus: slug }); });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read after hydration
    if (p.get("view") === "3d") setMode("3d");
  }, [set]);
  const picked = useMemo(() => rows?.find((r) => r.slug === focus) ?? null, [rows, focus]);
  const pick = useCallback((r: CatalogRow) => set({ focus: r.slug, style: r.cluster }), [set]);
  const switchMode = (m: "2d" | "3d") => { setMode(m); const u = new URL(location.href); if (m === "3d") u.searchParams.set("view", "3d"); else u.searchParams.delete("view"); history.replaceState(null, "", u); };
  // Each style's average position: where its seasons gather on the map.
  const centres = useMemo(() => meta.archetypes.map((a) => {
    const m = (rows ?? []).filter((r) => r.cluster === a.id);
    const avg = (k: "pc1" | "pc2" | "pc3") => m.reduce((s, r) => s + r[k], 0) / (m.length || 1);
    return { a, x: avg("pc1"), y: avg("pc2"), z: avg("pc3") };
  }), [rows, meta.archetypes]);
  const show = hover ?? picked;
  const p3 = meta.pca[0].pct + meta.pca[1].pct + meta.pca[2].pct, p2 = meta.pca[0].pct + meta.pca[1].pct;

  return (
    <div className="wx-map2">
      <div className="wx-map-guide">
        <div><b>Each dot is one footballer at one club in one season.</b> Its colour is the style whose centre it sits nearest across all 20 behaviours.</div>
        <div><b>Nearby dots are alike on the directions shown.</b> They may still differ on other behaviours the map cannot show; Compare checks all 20.</div>
        <div><b>What the directions mean.</b> The map uses the directions in which wingers differ most (principal components). <b className="dir">Right</b> goes with {PCA_AXES[0].high}; left with {PCA_AXES[0].low}. <b className="dir">Up</b> goes with {PCA_AXES[1].high}; down with {PCA_AXES[1].low}.{mode === "3d" && <> <b className="dir">PC3</b> goes with {PCA_AXES[2].high} at one end and {PCA_AXES[2].low} at the other.</>}</div>
      </div>

      <div className="wx-map-tools">
        <div className="wx-map-legend" role="group" aria-label="Show or hide styles">
          {meta.archetypes.map((a) => (
            <button key={a.id} type="button" aria-pressed={!off.has(a.id)} onClick={() => { const n = new Set(off); if (n.has(a.id)) n.delete(a.id); else n.add(a.id); setOff(n); }}>
              <i style={{ background: a.color }} aria-hidden="true" />{a.code} {a.label}
            </button>
          ))}
        </div>
        <div className="wx-seg" role="group" aria-label="Map view">
          <button type="button" aria-pressed={mode === "2d"} onClick={() => switchMode("2d")}>2D</button>
          <button type="button" aria-pressed={mode === "3d"} onClick={() => switchMode("3d")}>3D</button>
        </div>
      </div>

      {!rows ? <p className="wx-pending">Loading 1,396 spells…</p> : mode === "2d"
        ? <Flat meta={meta} rows={rows} off={off} picked={picked} centres={centres} onHover={setHover} onPick={pick} />
        : <Cube meta={meta} rows={rows} off={off} picked={picked} centres={centres} onHover={setHover} onPick={pick} />}

      <div className="wx-readout" aria-live="polite">
        {show ? (
          <>
            <i style={{ background: meta.archetypes[show.cluster].color }} aria-hidden="true" />
            <span><b>{show.player}</b> {show.club} · {season(show.season)} · {meta.archetypes[show.cluster].code} {meta.archetypes[show.cluster].label}{show === picked ? " · selected" : ""}</span>
            {show === picked && <Link className="mono" href={`${EXPLORE}/players/${show.slug}`}>Open profile →</Link>}
          </>
        ) : <span>{mode === "2d" ? "Hover or tap a dot to see whose season it is. Select one to follow that footballer across the explorer." : "Drag to turn the cloud. Hover or tap a dot to see whose season it is."}</span>}
      </div>
      <p className="wx-small">
        {mode === "2d"
          ? `The two directions shown keep ${p2.toFixed(0)}% of the differences between seasons (PC1 ${meta.pca[0].pct.toFixed(1)}%, PC2 ${meta.pca[1].pct.toFixed(1)}%). The 3D view adds a third (PC3 ${meta.pca[2].pct.toFixed(1)}%), keeping ${p3.toFixed(0)}%.`
          : `Three directions keep ${p3.toFixed(0)}% of the differences between seasons (PC1 ${meta.pca[0].pct.toFixed(1)}%, PC2 ${meta.pca[1].pct.toFixed(1)}%, PC3 ${meta.pca[2].pct.toFixed(1)}%).`}{" "}
        Either way some differences are hidden, so closeness on the map is approximate. Similar seasons, styles and comparisons elsewhere in the explorer always use all 20 behaviours. Labels mark each style’s average position.
      </p>
    </div>
  );
}

type ViewProps = {
  meta: Meta; rows: CatalogRow[]; off: Set<number>; picked: CatalogRow | null;
  centres: { a: Meta["archetypes"][number]; x: number; y: number; z: number }[];
  onHover: (r: CatalogRow | null) => void; onPick: (r: CatalogRow) => void;
};

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// 2D: drawn in real pixels so text stays readable at every width.
function Flat({ meta, rows, off, picked, centres, onHover, onPick }: ViewProps) {
  const [ref, W] = useWidth();
  const padL = 30, padB = 26;
  const k = W ? (W - padL - 8) / (X1 - X0) : 1;
  const H = (Y1 - Y0) * k;
  const px = (v: number) => padL + (v - X0) * k, py = (v: number) => (Y1 - v) * k;
  const r = Math.max(2.4, Math.min(4, k * 0.07));
  const ticksX = [-8, -4, 0, 4, 8, 12], ticksY = [-4, 0, 4];
  return (
    <figure className="wx-flat" ref={ref}>
      {W > 0 && (
        <svg width={W} height={H + padB} role="img" aria-label={`Map of ${meta.nSpells} spells on the first two principal components, coloured by closest style`}
          onMouseLeave={() => onHover(null)}
          onClick={(e) => {
            // Nearest visible dot within ~16px of the tap or click: dots are small, fingers are not.
            const bb = (e.currentTarget as SVGSVGElement).getBoundingClientRect(), cx = e.clientX - bb.left, cy = e.clientY - bb.top;
            let best: CatalogRow | null = null, bd = 16 * 16;
            for (const s of rows) { if (off.has(s.cluster)) continue; const d = (px(s.pc1) - cx) ** 2 + (py(s.pc2) - cy) ** 2; if (d < bd) { bd = d; best = s; } }
            if (best) onPick(best);
          }}>
          {ticksX.map((t) => <g key={`x${t}`}><line x1={px(t)} x2={px(t)} y1={0} y2={H} className={t ? "g" : "g0"} /><text x={px(t)} y={H + 16} textAnchor="middle">{t}</text></g>)}
          {ticksY.map((t) => <g key={`y${t}`}><line y1={py(t)} y2={py(t)} x1={padL} x2={W - 8} className={t ? "g" : "g0"} /><text x={padL - 8} y={py(t) + 4} textAnchor="end">{t}</text></g>)}
          <g className="dots">
            {rows.map((s, i) => off.has(s.cluster) ? null : (
              <circle key={s.slug} data-i={i} cx={px(s.pc1)} cy={py(s.pc2)} r={r} fill={meta.archetypes[s.cluster].color}
                onMouseEnter={() => onHover(s)}><title>{`${s.player}, ${s.club} ${season(s.season)}`}</title></circle>
            ))}
          </g>
          {picked && !off.has(picked.cluster) && (
            <g className="pick" pointerEvents="none">
              <line x1={padL} x2={W - 8} y1={py(picked.pc2)} y2={py(picked.pc2)} />
              <line x1={px(picked.pc1)} x2={px(picked.pc1)} y1={0} y2={H} />
              <circle cx={px(picked.pc1)} cy={py(picked.pc2)} r={r * 2.4} fill={meta.archetypes[picked.cluster].color} />
            </g>
          )}
        </svg>
      )}
      {W > 0 && centres.filter((c) => !off.has(c.a.id)).map((c) => (
        <span key={c.a.id} className="ctr-lab mono" style={{ left: px(c.x), top: py(c.y), ["--c" as string]: c.a.color }}>{c.a.code} {c.a.label}</span>
      ))}
      {W > 0 && picked && !off.has(picked.cluster) && (
        <span className={`pick-lab${px(picked.pc1) > W * (W < 600 ? 0.45 : 0.6) ? " left" : ""}`} style={{ left: px(picked.pc1), top: py(picked.pc2) }}>
          <b>{picked.player}</b> <span className="nw">{season(picked.season)}</span>
        </span>
      )}
      {W > 0 && <>
        <span className="ax-lab mono x0" style={{ top: py(0) }}>← {PCA_AXES[0].short[0]}</span>
        <span className="ax-lab mono x1" style={{ top: py(0) }}>{PCA_AXES[0].short[1]} →</span>
        <span className="ax-lab mono y1" style={{ left: px(0) }}>↑ {PCA_AXES[1].short[1]}</span>
        <span className="ax-lab mono y0" style={{ left: px(0), top: H }}>↓ {PCA_AXES[1].short[0]}</span>
      </>}
      <figcaption className="mono"><span>PC1 · {meta.pca[0].pct.toFixed(1)}% of variation</span><span>PC2 · {meta.pca[1].pct.toFixed(1)}%</span></figcaption>
      {/* Phones: direction labels move under the chart instead of sitting on the dots. */}
      <ul className="ax-key mono">
        <li>→ {PCA_AXES[0].short[1]}</li><li>← {PCA_AXES[0].short[0]}</li>
        <li>↑ {PCA_AXES[1].short[1]}</li><li>↓ {PCA_AXES[1].short[0]}</li>
      </ul>
    </figure>
  );
}

// 3D: canvas, drag (or arrow keys) to rotate. Orthographic, same scale on all three axes.
function Cube({ meta, rows, off, picked, centres, onHover, onPick }: ViewProps) {
  const [ref, W] = useWidth();
  const cv = useRef<HTMLCanvasElement>(null);
  const [rot, setRot] = useState({ yaw: -0.6, pitch: 0.35 });
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const proj = useRef<{ i: number; x: number; y: number }[]>([]);
  const H = Math.min(Math.round(W * 0.75), 680);

  useEffect(() => {
    const c = cv.current; if (!c || !W) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext("2d")!; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const cs = getComputedStyle(c);
    const ink = cs.getPropertyValue("--ink").trim() || "#121211", muted = cs.getPropertyValue("--muted").trim() || "#6b6a65", paper = cs.getPropertyValue("--paper").trim() || "#e8e7e2";
    const s = Math.min(W, H) / 15, cx = W / 2, cy = H / 2;
    const { yaw, pitch } = rot, cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const P = (x: number, y: number, z: number) => {
      const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      return { x: cx + x1 * s, y: cy - y2 * s, d: z2 };
    };
    // Axes through the origin.
    g.lineWidth = 1; g.font = "11px ui-monospace, monospace";
    ([[0, [9, 0, 0]], [1, [0, 7, 0]], [2, [0, 0, 7]]] as const).forEach(([n, [ax, ay, az]]) => {
      const a = P(-ax, -ay, -az), b = P(ax, ay, az);
      g.strokeStyle = muted; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.setLineDash([]);
      g.fillStyle = ink; g.fillText(`${PCA_AXES[n].pc}: ${PCA_AXES[n].short[1]}`, b.x + 4, b.y - 4);
      g.fillStyle = muted; g.fillText(PCA_AXES[n].short[0], a.x + 4, a.y + 14);
    });
    // Points, far to near.
    const pts = rows.map((r, i) => ({ r, i, ...P(r.pc1, r.pc2, r.pc3) })).filter((p) => !off.has(p.r.cluster)).sort((a, b) => a.d - b.d);
    const rad = Math.max(2.2, s * 0.13);
    for (const p of pts) {
      g.globalAlpha = 0.45 + 0.4 * Math.min(1, Math.max(0, (p.d + 10) / 20));
      g.fillStyle = meta.archetypes[p.r.cluster].color; g.beginPath(); g.arc(p.x, p.y, rad, 0, 7); g.fill();
      g.globalAlpha = 0.5; g.strokeStyle = paper; g.lineWidth = 0.6; g.stroke();
    }
    g.globalAlpha = 1;
    proj.current = pts.map((p) => ({ i: p.i, x: p.x, y: p.y }));
    // Style labels at each style's average position.
    g.font = "600 12px ui-monospace, monospace";
    for (const c of centres) {
      if (off.has(c.a.id)) continue;
      const q = P(c.x, c.y, c.z), t = c.a.code, w = g.measureText(t).width + 10;
      g.fillStyle = paper; g.strokeStyle = c.a.color; g.lineWidth = 2; g.fillRect(q.x - w / 2, q.y - 9, w, 18); g.strokeRect(q.x - w / 2, q.y - 9, w, 18);
      g.fillStyle = ink; g.fillText(t, q.x - w / 2 + 5, q.y + 4);
    }
    if (picked && !off.has(picked.cluster)) {
      const q = P(picked.pc1, picked.pc2, picked.pc3);
      g.fillStyle = meta.archetypes[picked.cluster].color; g.strokeStyle = ink; g.lineWidth = 2.5;
      g.beginPath(); g.arc(q.x, q.y, rad * 2.4, 0, 7); g.fill(); g.stroke();
      g.font = "600 14px Georgia, serif"; const t = `${picked.player} ${season(picked.season)}`, w = g.measureText(t).width + 14;
      const lx = q.x + w + 16 > W ? q.x - w - 12 : q.x + 12;
      g.fillStyle = ink; g.fillRect(lx, q.y - 26, w, 22); g.fillStyle = paper; g.fillText(t, lx + 7, q.y - 10);
    }
  }, [W, H, rot, rows, off, picked, centres, meta.archetypes]);

  const near = (e: React.PointerEvent) => {
    const b = cv.current!.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    let best: { i: number; d: number } | null = null;
    for (const p of proj.current) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < 100 && (!best || d <= best.d)) best = { i: p.i, d }; }
    return best ? rows[best.i] : null;
  };
  return (
    <figure className="wx-cube" ref={ref}>
      {W > 0 && (
        <canvas ref={cv} style={{ width: W, height: H }} tabIndex={0}
          role="img" aria-label={`3D map of ${meta.nSpells} spells on PC1, PC2 and PC3, coloured by closest style. Drag or use the arrow keys to rotate.`}
          onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (d) {
              const dx = e.clientX - d.x, dy = e.clientY - d.y;
              if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
              if (d.moved) { setRot((r) => ({ yaw: r.yaw + dx * 0.008, pitch: Math.max(-1.4, Math.min(1.4, r.pitch + dy * 0.008)) })); d.x = e.clientX; d.y = e.clientY; }
            } else onHover(near(e));
          }}
          onPointerUp={(e) => { const d = drag.current; drag.current = null; if (d && !d.moved) { const r = near(e); if (r) onPick(r); } }}
          onPointerLeave={() => onHover(null)}
          onKeyDown={(e) => {
            const m: Record<string, [number, number]> = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.12], ArrowDown: [0, 0.12] };
            if (m[e.key]) { e.preventDefault(); setRot((r) => ({ yaw: r.yaw + m[e.key][0], pitch: Math.max(-1.4, Math.min(1.4, r.pitch + m[e.key][1])) })); }
          }} />
      )}
      <figcaption className="mono">
        <span>Drag or use arrow keys to rotate</span>
        <button type="button" onClick={() => setRot({ yaw: -0.6, pitch: 0.35 })}>Reset view</button>
      </figcaption>
    </figure>
  );
}
