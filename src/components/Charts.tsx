import { readCsv, type Chart } from "@/lib/content";

/*
  Native charts in the site's palette, drawn as plain SVG on the server: no chart library, no client JS.
  Each chart reads a CSV that sits next to the project file (content/projects/<slug>/<file>).
  Palette rule: ink and greys for context, red only for the thing the reader should look at.
  If the CSV has a `source` column, its distinct values are printed under the chart.
*/

const INK = "var(--ink)", RED = "var(--accent)", GREY = "var(--rule)", MUTED = "#8a877f";
const GROUPS = [RED, INK, "#8a877f", "#b9b6ad", "#5d5b56", "#d8a39b"];
type R = Record<string, string>;
const W = 720, LW = 250; // canvas width, label column width

const num = (s: string | undefined) => Number(String(s ?? "").replace(/[₹€$,%\s+]/g, "").replace("−", "-"));
const round = (v: number) => { const c = Number(v.toFixed(6)); return Math.abs(c) >= 100 ? Math.round(c) : Math.round(c * 100) / 100; };
/** unit "₹" or "₹ Cr" → prefix ₹ (+ suffix); "%" or " px" → suffix. Minus signs are typographic. */
function fmt(v: number, unit = "") {
  const a = Math.abs(round(v)), s = a >= 1000 ? a.toLocaleString("en-IN") : String(a), sign = v < 0 ? "−" : "";
  return unit.startsWith("₹") ? `${sign}₹${s}${unit.slice(1)}` : `${sign}${s}${unit}`;
}
function fmtRange(lo: number, hi: number, unit = "") {
  if (lo === hi) return fmt(lo, unit);
  return unit.startsWith("₹") ? `₹${round(lo)}–${round(hi)}${unit.slice(1)}` : `${round(lo)}–${round(hi)}${unit}`;
}
/** "{a}–{b} {c}" with row values; "x–x" collapses to "x", empty/zero ranges disappear. */
function fill(tpl: string | undefined, r: R) {
  if (!tpl) return "";
  return tpl.replace(/\{(\w+)\}/g, (_, k) => r[k] ?? "").replace(/(\d[\d,.]*)–\1(?!\d)/g, "$1").replace(/^0 /, "").trim();
}

export function ChartView({ slug, c }: { slug: string; c: Chart }) {
  const rows = readCsv(slug, c.file);
  if (!rows.length) {
    if (process.env.NODE_ENV === "production" && !process.env.SHOW_TODOS) return null;
    return <div className="chart pending">Chart waiting for data: <code>content/projects/{slug}/{c.file}</code> ({c.title})</div>;
  }
  const sources = sourceLine(rows);
  return (
    <figure className="chart">
      <figcaption>{c.title}</figcaption>
      {c.kind === "bar" && <Bar rows={rows} c={c} />}
      {c.kind === "range" && <Range rows={rows} c={c} />}
      {c.kind === "bridge" && <Bridge rows={rows} c={c} />}
      {c.kind === "waterfall" && <Waterfall rows={rows} c={c} />}
      {c.kind === "scatter" && <Scatter rows={rows} c={c} />}
      {c.kind === "heatmap" && <Heatmap rows={rows} c={c} />}
      {c.kind === "line" && <Line rows={rows} c={c} />}
      {c.kind === "paired" && <Paired rows={rows} c={c} />}
      {c.note && <p className="note">{c.note}</p>}
      {sources && <p className="note src">Source: {sources}</p>}
    </figure>
  );
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** Splits a label into at most two lines of about `max` characters. */
function wrap(t: string, max = 26): string[] {
  if (t.length <= max) return [t];
  const words = t.split(" "); let a = "";
  while (words.length && (a + " " + words[0]).trim().length <= max) a = (a + " " + words.shift()).trim();
  return [a, words.join(" ")];
}
function Label({ x, y, main, sub, bold }: { x: number; y: number; main: string; sub?: string; bold?: boolean }) {
  const lines = wrap(cap(main));
  const top = y - (lines.length - 1) * 8 - (sub ? 6 : 0);
  return (
    <>
      <text className="lbl" x={x} y={top} textAnchor="end" fontWeight={bold ? 600 : 400}>
        {lines.map((l, i) => <tspan key={i} x={x} dy={i ? 17 : 0}>{l}</tspan>)}
      </text>
      {sub && <text x={x} y={top + (lines.length - 1) * 17 + 15} textAnchor="end">{sub}</text>}
    </>
  );
}
/** Distinct source notes, with "… row 5", "… row 9" folded into "… rows 5, 9". */
function sourceLine(rows: R[]) {
  const parts = [...new Set(rows.flatMap((r) => (r.source ?? "").split(";").map((x) => x.trim())).filter(Boolean))];
  const byStem = new Map<string, string[]>(); const out: string[] = [];
  for (const p of parts) { const m = p.match(/^(.*?)\s+row\s+(\d+)$/); if (m) { if (!byStem.has(m[1])) { byStem.set(m[1], []); out.push(m[1]); } byStem.get(m[1])!.push(m[2]); } else out.push(p); }
  return out.map((p) => (byStem.has(p) ? `${p}, rows ${byStem.get(p)!.join(", ")}` : p)).join("; ");
}

function Bar({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "bar" }> }) {
  const hi = rows.map((r) => num(c.high ? r[c.high] : r[c.value!]));
  const lo = rows.map((r, i) => (c.low ? num(r[c.low]) : hi[i]));
  const min = Math.min(0, ...lo), max = Math.max(0, ...hi);
  const wrapped = rows.some((r) => wrap(r[c.label]).length > 1);
  const rh = c.detail || wrapped ? 48 : 34, H = rows.length * rh + 8, pad = min < 0 ? 70 : 0, bw = W - LW - 90 - pad;
  const X = (v: number) => LW + pad + ((v - min) / (max - min || 1)) * bw;
  const strongest = hi.reduce((b, v, i, a) => (Math.abs(v) > Math.abs(a[b]) ? i : b), 0);
  const isHi = (r: R, i: number) => (c.highlightCol ? r[c.highlightCol] === (c.highlightWhen ?? "yes") : c.highlight ? r[c.label] === c.highlight : i === strongest);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.title}>
      {min < 0 && <line x1={X(0)} x2={X(0)} y1={0} y2={H} stroke={GREY} />}
      {rows.map((r, i) => {
        const y = i * rh + 4, mid = y + rh / 2 - 2, red = isHi(r, i), v = hi[i];
        const x0 = Math.min(X(0), X(v)), w = Math.max(2, Math.abs(X(v) - X(0)));
        const solid = c.low ? Math.max(0, Math.abs(X(lo[i]) - X(0))) : w;
        const label = c.low ? fmtRange(lo[i], hi[i], c.unit) : fmt(v, c.unit);
        return (
          <g key={i}>
            <title>{`${r[c.label]}: ${label}`}</title>
            <Label x={LW - 12} y={mid + 4} main={r[c.label] + (c.labelSuffix ?? "")} sub={fill(c.detail, r)} />
            <rect x={x0} y={mid - 10} width={w} height={20} fill={red ? RED : v < 0 ? MUTED : INK} fillOpacity={c.low ? 0.35 : 1} />
            {c.low && <rect x={v < 0 ? X(0) - solid : X(0)} y={mid - 10} width={Math.max(solid, 2)} height={20} fill={red ? RED : INK} />}
            <text className="val" x={v < 0 ? x0 - 8 : x0 + w + 8} y={mid + 6} textAnchor={v < 0 ? "end" : "start"}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Range({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "range" }> }) {
  const lo = rows.map((r) => num(r[c.low])), hi = rows.map((r) => num(r[c.high]));
  const max = Math.max(...hi) || 1, rh = c.detail ? 96 : 48, H = rows.length * rh + 28, bw = W - LW - 150, X = (v: number) => LW + 10 + (v / max) * bw;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.title}>
      <line x1={LW} x2={LW} y1={0} y2={H - 20} stroke={GREY} />
      <text x={LW} y={H - 4}>0</text>
      {rows.map((r, i) => {
        const y = i * rh + rh / 2 + 6;
        return (
          <g key={i}>
            <title>{`${r[c.label]}: ${fmtRange(lo[i], hi[i], c.unit)}`}</title>
            <foreignObject x={0} y={y - rh / 2 + 4} width={LW - 14} height={rh - 8}>
              <div style={{ font: "15px/1.25 var(--body)", color: "var(--ink)", textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                <span>{r[c.label]}</span>
                {c.detail && <span style={{ font: "11px/1.3 var(--mono)", color: "var(--muted)", marginTop: 2 }}>{fill(c.detail, r)}</span>}
              </div>
            </foreignObject>
            <line x1={X(lo[i])} x2={X(hi[i])} y1={y} y2={y} stroke={INK} strokeWidth={3} />
            <line x1={X(lo[i])} x2={X(lo[i])} y1={y - 9} y2={y + 9} stroke={INK} strokeWidth={2} />
            <line x1={X(hi[i])} x2={X(hi[i])} y1={y - 9} y2={y + 9} stroke={INK} strokeWidth={2} />
            <circle cx={X((lo[i] + hi[i]) / 2)} cy={y} r={6} fill={RED} />
            <text className="val" x={X(hi[i]) + 10} y={y + 5}>{fmtRange(lo[i], hi[i], c.unit)}</text>
          </g>
        );
      })}
    </svg>
  );
}

type Step = { label: string; from: number; to: number; total: boolean; x: number };
function StepBars({ bars, unit, title }: { bars: Step[]; unit: string; title: string }) {
  const lo = Math.min(0, ...bars.flatMap((x) => [x.from, x.to])), hi = Math.max(0, ...bars.flatMap((x) => [x.from, x.to]));
  const rh = 38, H = bars.length * rh + 10, bw = W - LW - 100, X = (n: number) => LW + ((n - lo) / (hi - lo || 1)) * bw;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      <line x1={X(0)} x2={X(0)} y1={0} y2={H} stroke={GREY} />
      {bars.map((b, i) => {
        const y = i * rh + 5, l = Math.min(X(b.from), X(b.to)), w = Math.max(2, Math.abs(X(b.to) - X(b.from)));
        const fill = b.total ? (b.x < 0 ? RED : INK) : b.x < 0 ? RED : MUTED;
        const next = bars[i + 1];
        return (
          <g key={i}>
            <title>{`${b.label}: ${fmt(b.x, unit)}`}</title>
            <text className="lbl" x={LW - 12} y={y + 22} textAnchor="end" fontWeight={b.total ? 600 : 400}>{b.label}</text>
            <rect x={l} y={y + 7} width={w} height={rh - 14} fill={fill} />
            {next && !next.total && <line x1={X(b.to)} x2={X(b.to)} y1={y + rh - 7} y2={y + rh + 7} stroke={INK} strokeDasharray="2 2" />}
            <text className={b.total ? "val" : undefined} x={l + w + 8} y={y + 23}>{(b.total || b.x < 0 ? "" : "+") + fmt(b.x, unit)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Bridge({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "bridge" }> }) {
  const use = rows.filter((r) => !c.typeCol || !c.skip.includes(r[c.typeCol]));
  const b = use.map((r) => num(r[c.before])), a = use.map((r) => num(r[c.after]));
  const start = b.reduce((x, y) => x + y, 0), end = a.reduce((x, y) => x + y, 0);
  let run = start;
  const steps = use.map((r, i) => ({ label: r[c.label], d: a[i] - b[i] })).filter((s) => Math.abs(s.d) > 1e-9)
    .map((s) => { const f = run; run += s.d; return { label: s.label, from: f, to: run, total: false, x: s.d }; });
  const bars: Step[] = [{ label: c.startLabel, from: 0, to: start, total: true, x: start }, ...steps, { label: c.endLabel, from: 0, to: end, total: true, x: end }];
  return <StepBars bars={bars} unit={c.unit} title={c.title} />;
}

/** First row = starting total, last row = ending total, rows between = changes. */
function Waterfall({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "waterfall" }> }) {
  let run = 0;
  const bars = rows.map((r, i) => {
    const x = num(r[c.value]), total = i === 0 || i === rows.length - 1;
    const from = total ? 0 : run, to = total ? x : run + x; run = to;
    return { label: r[c.label], from, to, total, x };
  });
  return <StepBars bars={bars} unit={c.unit} title={c.title} />;
}

function Scatter({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "scatter" }> }) {
  const xs = rows.map((r) => num(r[c.x])), ys = rows.map((r) => num(r[c.y]));
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)], [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const dx = (x1 - x0) * 0.06 || 1, dy = (y1 - y0) * 0.06 || 1, H = 460, L = 56, B = 40;
  const X = (v: number) => L + ((v - x0 + dx) / (x1 - x0 + 2 * dx)) * (W - L - 10);
  const Y = (v: number) => H - B - ((v - y0 + dy) / (y1 - y0 + 2 * dy)) * (H - B - 10);
  const groups = c.group ? [...new Set(rows.map((r) => r[c.group!]))] : [];
  const color = (r: R) => (c.group ? GROUPS[groups.indexOf(r[c.group]) % GROUPS.length] : INK);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.title}>
        <line x1={L} x2={W - 10} y1={H - B} y2={H - B} stroke={GREY} />
        <line x1={L} x2={L} y1={10} y2={H - B} stroke={GREY} />
        <text x={(L + W) / 2} y={H - 8} textAnchor="middle">{c.xLabel}</text>
        <text x={14} y={(H - B) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(H - B) / 2})`}>{c.yLabel}</text>
        {rows.map((r, i) => (
          <circle key={i} cx={X(xs[i])} cy={Y(ys[i])} r={5} fill={color(r)} fillOpacity={0.85} stroke="var(--paper)" strokeWidth={1}>
            <title>{[c.name && r[c.name], c.group && r[c.group]].filter(Boolean).join(" · ")}</title>
          </circle>
        ))}
      </svg>
      {groups.length > 1 && <Legend items={groups.map((g, i) => [g, GROUPS[i % GROUPS.length]])} />}
    </>
  );
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <p className="note legend">
      {items.map(([g, col]) => <span key={g}><i style={{ background: col }} />{g}</span>)}
    </p>
  );
}

function Heatmap({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "heatmap" }> }) {
  const rs = [...new Set(rows.map((r) => r[c.row]))], cs = [...new Set(rows.map((r) => r[c.col]))];
  const max = Math.max(...rows.map((r) => Math.abs(num(r[c.value])))) || 1;
  const L = 170, T = cs.some((k) => k.length > 10) ? 120 : 40, cw = Math.min(cs.length > 4 ? 64 : 140, (W - L) / cs.length), ch = cs.length > 4 ? 40 : 64, H = T + rs.length * ch + 4;
  const cell = (rk: string, ck: string) => rows.find((r) => r[c.row] === rk && r[c.col] === ck);
  const tilt = T > 60;
  const whole = rows.every((r) => Number.isInteger(num(r[c.value])));
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${L + cs.length * cw + 10} ${H}`} role="img" aria-label={c.title} style={{ maxWidth: L + cs.length * cw + 10 }}>
        {cs.map((k, j) => <text key={k} x={L + j * cw + cw / 2} y={T - 12} textAnchor={tilt ? "start" : "middle"} transform={tilt ? `rotate(-40 ${L + j * cw + cw / 2} ${T - 12})` : undefined}>{k}</text>)}
        {rs.map((rk, i) => (
          <g key={rk}>
            <text className="lbl" x={L - 12} y={T + i * ch + ch / 2 + 5} textAnchor="end">{rk}</text>
            {cs.map((ck) => {
              const j = cs.indexOf(ck), r = cell(rk, ck), v = r ? num(r[c.value]) : NaN, a = isNaN(v) ? 0 : Math.abs(v) / max;
              return (
                <g key={ck}>
                  <title>{`${rk} · ${ck}: ${isNaN(v) ? "n/a" : v}`}</title>
                  <rect x={L + j * cw + 1} y={T + i * ch + 1} width={cw - 2} height={ch - 2} fill={v >= 0 ? RED : "#5d5b56"} fillOpacity={0.08 + a * 0.85} />
                  {!isNaN(v) && <text x={L + j * cw + cw / 2} y={T + i * ch + ch / 2 + 5} textAnchor="middle" className="val" style={{ fill: a > 0.55 ? "#fff" : "var(--ink)" }}>{whole ? v : v.toFixed(1)}</text>}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

function Line({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "line" }> }) {
  const xs = rows.map((r) => num(r[c.x]));
  const all = c.series.flatMap((s) => rows.map((r) => num(r[s.col])));
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)], ymin = Math.min(0, ...all), ymax = Math.max(0, ...all);
  const H = 340, L = 84, B = 40, T = 16, RW = 150;
  const X = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - RW);
  const Y = (v: number) => T + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - B - T);
  const ticks = [ymin, 0, ymax].filter((v, i, a) => a.indexOf(v) === i);
  const cols = [RED, INK, MUTED];
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.title}>
        {ticks.map((t) => <g key={t}><line x1={L} x2={W - RW + 10} y1={Y(t)} y2={Y(t)} stroke={t === 0 ? INK : GREY} strokeWidth={t === 0 ? 1 : 0.6} /><text x={L - 8} y={Y(t) + 4} textAnchor="end">{fmt(t, c.unit)}</text></g>)}
        {xs.filter((x, i) => i === 0 || X(x) - X(xs[i - 1]) > 34).filter((x) => !c.mark || x === c.mark.x || Math.abs(X(x) - X(c.mark.x)) > 34).map((x) => <text key={x} x={X(x)} y={H - B + 18} textAnchor="middle">{x.toLocaleString("en-IN")}</text>)}
        <text x={(L + W - RW) / 2} y={H - 4} textAnchor="middle">{c.xLabel}</text>
        {c.mark && <g><line x1={X(c.mark.x)} x2={X(c.mark.x)} y1={T} y2={H - B} stroke={INK} strokeDasharray="3 3" /><text x={X(c.mark.x) + 6} y={T + 10} style={{ fill: "var(--ink)" }}>{c.mark.label}</text></g>}
        {c.series.map((s, si) => {
          const pts = rows.map((r) => [X(num(r[c.x])), Y(num(r[s.col]))] as const);
          const last = rows[rows.length - 1];
          return (
            <g key={s.col}>
              <polyline fill="none" stroke={cols[si % 3]} strokeWidth={2.5} points={pts.map((p) => p.join(",")).join(" ")} />
              {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={cols[si % 3]}><title>{`${s.label}, ${rows[i][c.x]}: ${fmt(num(rows[i][s.col]), c.unit)}`}</title></circle>)}
              <text className="val" x={pts[pts.length - 1][0] + 10} y={pts[pts.length - 1][1] + 5} style={{ fill: cols[si % 3] }}>{fmt(num(last[s.col]), c.unit)}</text>
            </g>
          );
        })}
      </svg>
      <Legend items={c.series.map((s, i) => [s.label, cols[i % 3]])} />
    </>
  );
}

/** Two (or more) bars per row, each row on its own scale, so metrics with different units can sit together. */
function Paired({ rows, c }: { rows: R[]; c: Extract<Chart, { kind: "paired" }> }) {
  type Item = { name: string; v: number };
  let groups: { label: string; unit: string; better?: string; items: Item[] }[];
  if (c.series) {
    groups = rows.map((r) => ({ label: r[c.label], unit: c.unit, items: c.series!.map((s) => ({ name: s.label, v: num(r[s.col]) })) }));
  } else {
    const keys = [...new Set(rows.map((r) => r[c.label]))];
    groups = keys.map((k) => {
      const rs = rows.filter((r) => r[c.label] === k);
      return { label: k, unit: c.unitCol ? rs[0][c.unitCol] : c.unit, better: c.betterCol ? rs[0][c.betterCol] : undefined, items: rs.map((r) => ({ name: r[c.seriesCol!], v: num(r[c.value!]) })) };
    });
  }
  const names = groups[0]?.items.map((x) => x.name) ?? [];
  const bh = 14, gap = 4, gh = names.length * (bh + gap) + 18, H = groups.length * gh + 6, bw = W - LW - 110;
  const unitText = (u: string, v: number) => (u === "%" ? `${round(v)}%` : u.startsWith("₹") ? fmt(v, u) : u && !/count|LTIFR/i.test(u) ? `${round(v)} ${u}` : String(round(v)));
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.title}>
        {groups.map((g, gi) => {
          const max = Math.max(...g.items.map((x) => Math.abs(x.v))) || 1, y0 = gi * gh + 6;
          const best = g.better ? (g.better === "lower" ? Math.min(...g.items.map((x) => x.v)) : Math.max(...g.items.map((x) => x.v))) : undefined;
          return (
            <g key={g.label}>
              <Label x={LW - 12} y={y0 + (names.length * (bh + gap)) / 2 + 3} main={g.label} />
              {g.items.map((x, k) => {
                const y = y0 + k * (bh + gap), red = c.highlight ? x.name === c.highlight : best !== undefined && x.v === best && g.items.filter((z) => z.v === best).length === 1;
                return (
                  <g key={x.name}>
                    <title>{`${g.label}, ${x.name}: ${unitText(g.unit, x.v)}`}</title>
                    <rect x={LW} y={y} width={Math.max(2, (Math.abs(x.v) / max) * bw)} height={bh} fill={red ? RED : k === 0 ? INK : MUTED} />
                    <text x={LW + Math.max(2, (Math.abs(x.v) / max) * bw) + 8} y={y + bh - 2} style={{ fill: "var(--ink)" }}>{unitText(g.unit, x.v)}</text>
                  </g>
                );
              })}
              {gi < groups.length - 1 && <line x1={0} x2={W} y1={y0 + gh - 9} y2={y0 + gh - 9} stroke={GREY} strokeWidth={0.6} />}
            </g>
          );
        })}
      </svg>
      <Legend items={names.map((n, k) => [n, k === 0 ? INK : MUTED])} />
    </>
  );
}
