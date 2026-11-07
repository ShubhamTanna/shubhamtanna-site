"use client";
// Individual evolution: one footballer's qualifying spells, season by season. Every number shown is the
// research's own (style, centroid distances, PC1/PC2, z, percentile); only differences between seasons are new.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EXPLORE, type CatalogRow, type Meta, type Spell } from "@/lib/winger-types";
import { distanceParts, fmtDist, fmtZ, fold, haystack, lc, PCA_AXES, pctShort, SEARCH_HINT, season, shareText, SHOT_UNIT_NOTE } from "@/lib/winger-format";
import { loadCatalog } from "./PlayerSearch";
import { loadSpell } from "./CompareView";
import Definitions from "./Definitions";
import { useSelection } from "./Selection";

const DEFAULT = "riyad-mahrez-leicester-city-2017-18";
// Spells in the same season share one time slot: the data does not say which club came first.
const slots = (spells: { season: string }[]) => { const u = [...new Set(spells.map((s) => s.season))]; return spells.map((s) => u.indexOf(s.season)); };
const clubShort = (c: string) => c.split(" ")[0];
const tag = (r: { season: string; club: string }, multiClub: boolean) => (multiClub ? `${season(r.season)} · ${r.club}` : season(r.season));

export default function EvolutionView({ meta }: { meta: Meta }) {
  const { focus, set } = useSelection();
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [spells, setSpells] = useState<Spell[] | null>(null);
  const [pair, setPair] = useState<[number, number]>([0, 1]);
  const [all, setAll] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { loadCatalog().then(setRows); }, []);
  const byPlayer = useMemo(() => {
    const m = new Map<number, CatalogRow[]>();
    for (const r of rows ?? []) m.set(r.playerKey, [...(m.get(r.playerKey) ?? []), r]);
    for (const l of m.values()) l.sort((a, b) => a.season.localeCompare(b.season) || a.club.localeCompare(b.club));
    return m;
  }, [rows]);
  const multi = (s: string | null) => { const r = rows?.find((x) => x.slug === s); return r && byPlayer.get(r.playerKey)!.length > 1 ? r : undefined; };

  // Footballer from ?p=, else the explorer's footballer if they have several seasons, else a default.
  // Afterwards, follow the footballer bar whenever it changes to someone with several seasons.
  const [single, setSingle] = useState<CatalogRow | null>(null);
  useEffect(() => {
    if (!rows) return;
    const cur = rows.find((x) => x.slug === slug);
    if (!slug) {
      const p = new URLSearchParams(location.search).get("p");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read after hydration
      setSlug((multi(p) ?? multi(focus) ?? multi(DEFAULT))?.slug ?? null);
    } else if (focus && cur) {
      const f = rows.find((x) => x.slug === focus);
      if (f && f.playerKey !== cur.playerKey) { if (multi(focus)) { setSlug(focus); setSpells(null); setSingle(null); } else setSingle(f); }
    }
    if (!slug) {
      const p = new URLSearchParams(location.search).get("p");
      const asked = rows.find((x) => x.slug === p) ?? rows.find((x) => x.slug === focus);
      if (asked && !multi(asked.slug)) setSingle(asked);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, focus]);

  const row = rows?.find((r) => r.slug === slug);
  const career = useMemo(() => (row ? byPlayer.get(row.playerKey)! : []), [row, byPlayer]);
  useEffect(() => {
    if (!career.length) return;
    let live = true;
    // Default pair: the first season against the season most different from it in style.
    Promise.all(career.map((c) => loadSpell(c.slug))).then((s) => {
      if (!live) return;
      const d = s.map((x) => distanceParts(s[0].fp.map((r) => r[1]), x.fp.map((r) => r[1])).distance);
      setSpells(s); setPair([0, d.indexOf(Math.max(...d))]);
    });
    if (!focus) set({ focus: career[0].slug });
    const u = new URL(location.href); u.searchParams.set("p", career[0].slug); history.replaceState(null, "", u);
    return () => { live = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [career]);

  const hits = useMemo(() => {
    const w = fold(q).split(/\s+/).filter(Boolean);
    if (!w.length) return [];
    const seen = new Set<number>();
    return (rows ?? []).filter((r) => byPlayer.get(r.playerKey)!.length > 1 && w.every((x) => haystack(r).includes(x)) && !seen.has(r.playerKey) && seen.add(r.playerKey)).slice(0, 8);
  }, [q, rows, byPlayer]);

  const pick = (s: string) => { setSlug(s); setSpells(null); setQ(""); setAll(false); setSingle(null); set({ focus: s }); };
  const nMulti = useMemo(() => [...byPlayer.values()].filter((l) => l.length > 1).length, [byPlayer]);

  if (!rows) return <p className="wx-pending">Loading 1,396 spells…</p>;
  const ok = spells && spells.length === career.length && spells[0].slug === career[0].slug;
  const multiClub = new Set(career.map((c) => c.season)).size < career.length;

  return (
    <div className="wx-evo2">
      <div className="wx-pick wx-evo-pick">
        <label><span className="mono">Footballer · {nMulti} with two or more seasons</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={SEARCH_HINT} autoComplete="off" />
        </label>
        {hits.length > 0 && <ul>{hits.map((r) => <li key={r.slug}><button type="button" onClick={() => pick(r.slug)}>{r.player} <span>{byPlayer.get(r.playerKey)!.length} seasons</span></button></li>)}</ul>}
      </div>

      {single && row && single.playerKey !== row.playerKey && (
        <p className="wx-note-box">{single.player} has only one qualifying season ({single.club}, {season(single.season)}), so there is no change to show. Showing {row.player} instead; search above for another footballer.</p>
      )}
      {!row || !ok ? <p className="wx-pending">Loading seasons…</p> : (
        <Journey meta={meta} spells={spells} multiClub={multiClub} pair={pair} setPair={setPair} all={all} setAll={setAll}
          onCompare={() => set({ focus: spells[pair[0]].slug, compare: spells[pair[1]].slug })} />
      )}
    </div>
  );
}

function Journey({ meta, spells, multiClub, pair, setPair, all, setAll, onCompare }: {
  meta: Meta; spells: Spell[]; multiClub: boolean; pair: [number, number]; setPair: (p: [number, number]) => void;
  all: boolean; setAll: (v: boolean) => void; onCompare: () => void;
}) {
  const A = meta.archetypes, F = meta.features;
  const first = spells[0];
  const styles = new Set(spells.map((s) => s.cluster));
  const [i, j] = pair;
  // Always compare in time order; two clubs in the same season have no known order, so they are A and B.
  const slot = slots(spells);
  const [a1, b1] = slot[i] <= slot[j] ? [i, j] : [j, i];
  const S1 = spells[a1], S2 = spells[b1], tie = slot[a1] === slot[b1];
  const cmp = distanceParts(S1.fp.map((r) => r[1]), S2.fp.map((r) => r[1]));
  const same = cmp.total === 0;
  const ks = same ? [] : all ? F.map((_, k) => k) : cmp.parts.slice(0, 6).map((p) => p.k);
  const [, q2] = meta.nearestQuartiles;
  const nSeasons = new Set(spells.map((s) => s.season)).size;
  const L1 = tie ? `Spell A · ${S1.club}` : tag(S1, true), L2 = tie ? `Spell B · ${S2.club}` : tag(S2, true);
  // Change in words: exact tie = unchanged; same rounded rank = say so and give the measured direction.
  const change = (k: number) => {
    const [, z1, p1] = S1.fp[k], [, z2, p2] = S2.fp[k];
    if (z1 === z2) return { dir: 0, text: `Unchanged, ${shareText(p1)}` };
    const up = z2 > z1, verb = tie ? (up ? "Higher at" : "Lower at") : up ? "Up" : "Down";
    const where = tie ? ` ${S2.club} than at ${S1.club}` : "";
    if (pctShort(p1) === pctShort(p2)) return { dir: up ? 1 : -1, text: `${verb}${where}: still ${shareText(p2)}, ${fmtZ(z1)} → ${fmtZ(z2)} SD` };
    return { dir: up ? 1 : -1, text: tie ? `${verb}${where}: ${pctShort(p1)} vs ${pctShort(p2)} percentile` : `${verb} from the ${pctShort(p1)} to the ${pctShort(p2)} percentile` };
  };
  // One scale for every row shown, widened to fit (never clipped).
  const lim = Math.max(3, Math.ceil(Math.max(...ks.flatMap((k) => [Math.abs(S1.fp[k][1]), Math.abs(S2.fp[k][1])]))));
  const x = (z: number) => ((z + lim) / (2 * lim)) * 100;

  return (
    <>
      <header className="wx-evo-head">
        <h2 className="d">{first.player}</h2>
        <p>{spells.length} qualifying club spells{spells.length !== nSeasons ? ` across ${nSeasons} seasons` : ""} · {styles.size === 1 ? `nearest to the ${A[first.cluster].label} centre every time` : `nearest to ${styles.size} different style centres over time`}</p>
      </header>

      {/* 1 · Style by season */}
      <ol className="wx-evo-time" aria-label="Closest style by season">
        {spells.map((s, n) => {
          const a = A[s.cluster];
          return (
            <li key={s.slug} className={n === i || n === j ? "on" : undefined}>
              <span className="mono">{tag(s, multiClub)}</span>
              <Link href={`${EXPLORE}/players/${s.slug}`} style={{ borderTopColor: a.color }}>
                <b>{a.code}</b><span>{a.label}</span>
              </Link>
              <small className="mono">{s.club}{s.robust.allThree ? "" : ` · changed in ${[s.robust.familyBalanced, s.robust.equalPlayerWeight, s.robust.extremeTrimmed].filter((x) => x !== s.cluster).length} of 3 sensitivity checks`}</small>
            </li>
          );
        })}
      </ol>
      {multiClub && <p className="wx-small">Two clubs in the same season share one place on the timeline: the data does not say which came first.</p>}
      <p className="wx-small">Each club spell needed at least 1,125 minutes on its own, so a gap does not mean he stopped playing. Changes describe how measured behaviour moved, not whether he got better or worse, or why.</p>

      <div className="wx-evo-grid">
        {/* 2 · Distance to each style centre */}
        <section>
          <h3 className="mono wx-label">Distance to each style’s centre</h3>
          <Distances meta={meta} spells={spells} multiClub={multiClub} pair={pair} />
          <p className="wx-small">Distance across all 20 behaviours; lower means closer. Each season is assigned to the style it sits nearest (large dot), so lines crossing at the bottom mean the closest style changed.</p>
        </section>
        {/* 3 · PCA path */}
        <section>
          <h3 className="mono wx-label">Path on the style map</h3>
          <Path meta={meta} spells={spells} multiClub={multiClub} pair={pair} />
          <p className="wx-small">Right goes with {PCA_AXES[0].high}; up goes with {PCA_AXES[1].high}. The two directions keep {(meta.pca[0].pct + meta.pca[1].pct).toFixed(0)}% of the variation in all 20 behaviours, so distances on the map are approximate.</p>
        </section>
      </div>

      {/* 4 · Two seasons compared */}
      <section className="wx-evo-diff">
        <div className="head">
          <h3 className="d">What changed</h3>
          <div className="wx-evo-sel">
            {(["From", "To"] as const).map((lab, side) => (
              <label key={lab}><span className="mono">{lab}</span>
                <select value={pair[side]} onChange={(e) => { const v = Number(e.target.value); setPair(side ? [i, v] : [v, j]); }}>
                  {spells.map((s, n) => <option key={s.slug} value={n}>{tag(s, true)} · {A[s.cluster].code}</option>)}
                </select>
              </label>
            ))}
          </div>
        </div>
        {i === j ? <p className="wx-pending">Choose two different spells.</p> : (<>
          <div className="wx-evo-sum">
            <div className="move">
              <span className="season" style={{ ["--c" as string]: A[S1.cluster].color }}><b className="mono">{L1}{tie ? ` · ${season(S1.season)}` : ""}</b><span>{A[S1.cluster].code} {A[S1.cluster].label}</span></span>
              <span className="arrow" aria-hidden="true">{tie ? "vs" : "→"}</span>
              <span className="season" style={{ ["--c" as string]: A[S2.cluster].color }}><b className="mono">{L2}{tie ? ` · ${season(S2.season)}` : ""}</b><span>{A[S2.cluster].code} {A[S2.cluster].label}</span></span>
            </div>
            <p>
              {tie && "Two club spells in the same season, compared side by side: the data does not say which came first. "}
              {S1.cluster === S2.cluster ? `Both spells sit nearest the ${A[S1.cluster].label} centre, ` : tie ? `Spell A sits nearest ${A[S1.cluster].label}, Spell B nearest ${A[S2.cluster].label}, ` : `The nearest style centre changed from ${A[S1.cluster].label} to ${A[S2.cluster].label}, `}
              {same ? "and the two measured profiles coincide: distance 0, so there are no differences to apportion. " : `and the two spells are ${fmtDist(cmp.distance)} apart in style. For reference, half of all spells have their nearest other footballer within ${fmtDist(q2)}. `}
              {!same && <>Largest differences: {cmp.parts.slice(0, 3).map((pp, n) => <span key={pp.k}>{n ? (n === 2 ? " and " : ", ") : ""}<b>{lc(F[pp.k].name)}</b> {change(pp.k).text.charAt(0).toLowerCase() + change(pp.k).text.slice(1)}</span>)}.{" "}</>}
              <Link href={`${EXPLORE}/compare?a=${S1.slug}&b=${S2.slug}`} onClick={onCompare}>Open both in Compare →</Link>
            </p>
          </div>
          <div className="wx-dumb-key mono" aria-hidden="true">
            <span><i className="o" style={{ borderColor: A[S1.cluster].color }} />{L1}</span>
            <span><i className="f" style={{ background: A[S2.cluster].color }} />{L2}</span>
            <span><i className="m" />Average winger</span><span><i className="b" />Within 1 SD of the mean</span>
          </div>
          <ol className="wx-dumb" style={{ ["--c1" as string]: A[S1.cluster].color, ["--c2" as string]: A[S2.cluster].color }}>
            {ks.map((k) => {
              const f = F[k], [, z1] = S1.fp[k], [, z2] = S2.fp[k];
              const share = cmp.parts.find((p) => p.k === k)!.sq / cmp.total;
              const ch = change(k), up = ch.dir > 0;
              return (
                <li key={k}>
                  <div className="lab">
                    <b>{f.name}{f.unitStatus === "unresolved_physical_unit" ? "*" : ""}</b>
                    <span className={`chg ${ch.dir > 0 ? "up" : ch.dir < 0 ? "dn" : ""}`}>{ch.dir !== 0 && <i aria-hidden="true">{up ? "▲" : "▼"}</i>} {ch.text}</span>
                    <span className="mono sd">{fmtZ(z1)} {tie ? "vs" : "→"} {fmtZ(z2)} SD from the mean{all ? "" : ` · ${Math.round(share * 100)}% of the total squared difference`}</span>
                  </div>
                  <div className="trk" role="img" aria-label={`${f.name}: ${ch.text} (${fmtZ(z1)} ${tie ? "versus" : "to"} ${fmtZ(z2)} SD)`}>
                    <i className="b" style={{ left: `${x(-1)}%`, width: `${x(1) - x(-1)}%` }} />
                    <i className="m" style={{ left: `${x(0)}%` }} />
                    {ch.dir !== 0 && <i className={`ln ${up ? "up" : "dn"}${tie ? " tie" : ""}`} style={{ left: `${Math.min(x(z1), x(z2))}%`, width: `${Math.abs(x(z2) - x(z1))}%` }} />}
                    <i className="o" style={{ left: `${x(z1)}%` }} />
                    <i className="f" style={{ left: `${x(z2)}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
          <button type="button" className="wx-all mono" aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Show the six largest differences" : "Show all 20 behaviours"}</button>
          <p className="wx-small">{all ? "All 20 behaviours in research order." : "The six largest differences: each behaviour’s squared difference as a share of the total squared difference across all 20 (the style distance is the square root of that total)."} {tie ? "The hollow dot is Spell A, the filled dot Spell B; no order in time is implied." : "The hollow dot is the earlier spell, the filled dot the later; the arrow shows the direction of change."} The page opens on the first spell and the spell most different from it; choose any two. Percentile rank and SD from the mean can disagree on uneven distributions; both are shown as measured.{F.some((f) => f.unitStatus === "unresolved_physical_unit") ? ` ${SHOT_UNIT_NOTE}` : ""}</p>
          <Definitions features={F} />
        </>)}
      </section>
    </>
  );
}

// Distances to the five centres, one line per style across the footballer's seasons.
function Distances({ meta, spells, multiClub, pair }: { meta: Meta; spells: Spell[]; multiClub: boolean; pair: [number, number] }) {
  const W = 520, H = 240, L = 34, R = 44, T = 12, B = 46;
  const max = Math.ceil(Math.max(...spells.flatMap((s) => s.distToCluster)));
  const slot = slots(spells), nSlots = Math.max(...slot) + 1;
  const xs = (n: number) => L + (nSlots === 1 ? 0.5 : slot[n] / (nSlots - 1)) * (W - L - R);
  const ys = (d: number) => H - B - (d / max) * (H - T - B); // 0 at the bottom: lower means closer
  // End labels, nudged apart so they don't collide.
  const ends = meta.archetypes.map((a) => ({ a, y: ys(spells[spells.length - 1].distToCluster[a.id]) })).sort((p, q) => p.y - q.y);
  for (let n = 1; n < ends.length; n++) ends[n].y = Math.max(ends[n].y, ends[n - 1].y + 11); // sorted top-down
  return (
    <svg className="wx-dist-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Distance to each style centre by season. ${spells.map((s) => `${season(s.season)}: closest ${meta.archetypes[s.cluster].code}`).join("; ")}.`}>
      {[0, max / 2, max].map((d) => <g key={d}><line x1={L} x2={W - R} y1={ys(d)} y2={ys(d)} className="g" /><text x={L - 6} y={ys(d) + 3} textAnchor="end">{d.toFixed(d % 1 ? 1 : 0)}</text></g>)}
      {spells.map((s, n) => slot.indexOf(slot[n]) === n && <text key={s.slug} x={xs(n)} y={H - B + 16} textAnchor="middle" className={spells.some((_, m) => slot[m] === slot[n] && (m === pair[0] || m === pair[1])) ? "on" : undefined}>{season(s.season).replace(/^20/, "")}{multiClub && slot.filter((v) => v === slot[n]).length > 1 ? "×2" : ""}</text>)}
      {meta.archetypes.map((a) => (
        <g key={a.id}>
          {/* Segments only between consecutive seasons; two clubs in one season are not joined (no known order). */}
          {spells.flatMap((_, u) => spells.map((__, v) => [u, v] as const)).filter(([u, v]) => slot[v] === slot[u] + 1).map(([u, v]) => (
            <line key={`${u}-${v}`} x1={xs(u)} y1={ys(spells[u].distToCluster[a.id])} x2={xs(v)} y2={ys(spells[v].distToCluster[a.id])} stroke={a.color} strokeWidth={2} />
          ))}
          {spells.map((s, n) => s.cluster === a.id
            ? <circle key={n} cx={xs(n)} cy={ys(s.distToCluster[a.id])} r={4.5} fill={a.color} stroke="var(--ink)" strokeWidth={1.2}><title>{`${season(s.season)}: closest to ${a.code}, ${fmtDist(s.distToCluster[a.id])}`}</title></circle>
            : <circle key={n} cx={xs(n)} cy={ys(s.distToCluster[a.id])} r={2.2} fill={a.color} />)}
        </g>
      ))}
      {ends.map(({ a, y }) => <text key={a.id} x={W - R + 6} y={y + 3} className="end">{a.code}</text>)}
      <text x={L} y={H - 6} className="cap">Season · large dot = closest style that season</text>
    </svg>
  );
}

// The footballer's seasons on PC1/PC2, joined in order, over nearby spells in faint style colour.
// Zoomed to this footballer's seasons (equal scale on both axes, at least 6 units across).
function Path({ meta, spells, pair }: { meta: Meta; spells: Spell[]; multiClub?: boolean; pair: [number, number] }) {
  const [rows, setRows] = useState<CatalogRow[]>([]);
  useEffect(() => { loadCatalog().then(setRows); }, []);
  const W = 520, H = 360;
  const xs = spells.map((s) => s.pc[0]), ys = spells.map((s) => s.pc[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(6, (Math.max(...xs) - Math.min(...xs)) * 1.5, ((Math.max(...ys) - Math.min(...ys)) * 1.5 * W) / H);
  const k = W / span;
  const px = (v: number) => W / 2 + (v - cx) * k, py = (v: number) => H / 2 - (v - cy) * k;
  const inView = (r: CatalogRow) => { const x = px(r.pc1), y = py(r.pc2); return x >= 0 && x <= W && y >= 0 && y <= H; };
  const pts = spells.map((s) => [px(s.pc[0]), py(s.pc[1])] as const);
  const slot = slots(spells);
  const tick = Math.max(1, Math.round(span / 6));
  const gx: number[] = [], gy: number[] = [];
  for (let t = Math.ceil((cx - span / 2) / tick) * tick; t <= cx + span / 2; t += tick) gx.push(t);
  for (let t = Math.ceil((cy - (span * H) / W / 2) / tick) * tick; t <= cy + (span * H) / W / 2; t += tick) gy.push(t);
  return (
    <svg className="wx-path" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Path across the style map: ${spells.map((s) => `${season(s.season)} PC1 ${s.pc[0].toFixed(1)}, PC2 ${s.pc[1].toFixed(1)}`).join("; ")}`}>
      <defs><marker id="wx-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="var(--ink)" /></marker></defs>
      <rect width={W} height={H} fill="none" stroke="var(--rule)" />
      {gx.map((t) => <g key={`x${t}`}><line x1={px(t)} x2={px(t)} y1={0} y2={H} className={t ? "g" : "g0"} /><text x={px(t) + 3} y={H - 4} className="ax">{t}</text></g>)}
      {gy.map((t) => <g key={`y${t}`}><line y1={py(t)} y2={py(t)} x1={0} x2={W} className={t ? "g" : "g0"} /><text x={4} y={py(t) - 3} className="ax">{t}</text></g>)}
      {rows.filter(inView).map((r) => <circle key={r.slug} cx={px(r.pc1)} cy={py(r.pc2)} r={2.4} fill={meta.archetypes[r.cluster].color} fillOpacity={0.4} />)}
      {spells.flatMap((_, a) => spells.map((__, b) => [a, b] as const)).filter(([a, b]) => slot[b] === slot[a] + 1 || (slot[b] === slot[a] && b > a)).map(([a, b]) => {
        const [x0, y0] = pts[a], [x1, y1] = pts[b], dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, r = 9;
        if (len <= 2 * r) return null;
        const tie = slot[a] === slot[b];
        return <line key={`${a}-${b}`} x1={x0 + (dx / len) * r} y1={y0 + (dy / len) * r} x2={x1 - (dx / len) * r} y2={y1 - (dy / len) * r} className={tie ? "seg tie" : "seg"} markerEnd={tie ? undefined : "url(#wx-ar)"} />;
      })}
      {spells.map((s, n) => (
        <g key={s.slug}>
          <circle cx={pts[n][0]} cy={pts[n][1]} r={n === pair[0] || n === pair[1] ? 8 : 6} fill={meta.archetypes[s.cluster].color} stroke="var(--ink)" strokeWidth={1.6} />
          <text x={pts[n][0] + 10} y={pts[n][1] - 8} className="lbl">{season(s.season).replace(/^20/, "")}{slot.filter((v) => v === slot[n]).length > 1 ? ` ${clubShort(s.club)}` : ""}</text>
        </g>
      ))}
      <text x={W - 6} y={14} textAnchor="end" className="ax">PC1 → · ↑ PC2 · zoomed to these seasons</text>
    </svg>
  );
}
