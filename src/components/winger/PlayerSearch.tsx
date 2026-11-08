"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DATA, EXPLORE, decodeCatalog, type Archetype, type CatalogRow } from "@/lib/winger-types";
import { fold, haystack, SEARCH_HINT, season } from "@/lib/winger-format";

let cache: Promise<CatalogRow[]> | null = null;
export const loadCatalog = () => (cache ??= fetch(`${DATA}/catalog.json`).then((r) => r.json()).then(decodeCatalog));

export default function PlayerSearch({ archetypes, leagues, seasons }: { archetypes: Archetype[]; leagues: string[]; seasons: string[] }) {
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [style, setStyle] = useState<number | null>(null);
  const [league, setLeague] = useState("");
  const [yr, setYr] = useState("");
  const [n, setN] = useState(40);
  useEffect(() => { loadCatalog().then(setRows, () => setErr(true)); }, []);

  const hits = useMemo(() => {
    if (!rows) return [];
    const words = fold(q).split(/\s+/).filter(Boolean);
    return rows
      .filter((r) => (style === null || r.cluster === style) && (!league || r.comp === league) && (!yr || r.season === yr))
      .filter((r) => { const h = haystack(r); return words.every((w) => h.includes(w)); })
      .sort((a, b) => a.player.localeCompare(b.player) || a.season.localeCompare(b.season));
  }, [rows, q, style, league, yr]);

  return (
    <div className="wx-search">
      <div className="wx-filters">
        <label className="q"><span className="mono">Search footballer or club</span>
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setN(40); }} placeholder={SEARCH_HINT} autoComplete="off" />
        </label>
        <label><span className="mono">League</span>
          <select value={league} onChange={(e) => setLeague(e.target.value)}><option value="">All</option>{leagues.map((l) => <option key={l}>{l}</option>)}</select>
        </label>
        <label><span className="mono">Season</span>
          <select value={yr} onChange={(e) => setYr(e.target.value)}><option value="">All</option>{seasons.map((s) => <option key={s} value={s}>{season(s)}</option>)}</select>
        </label>
        <div className="styles" role="group" aria-label="Style">
          <button type="button" aria-pressed={style === null} onClick={() => setStyle(null)}>All styles</button>
          {archetypes.map((a) => (
            <button key={a.id} type="button" aria-pressed={style === a.id} onClick={() => setStyle(style === a.id ? null : a.id)}>
              <i style={{ background: a.color }} aria-hidden="true" />{a.code}<span className="sr"> {a.label}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mono wx-count" aria-live="polite">{err ? "Couldn’t load the footballer list." : rows ? `${hits.length.toLocaleString("en-US")} spells` : "Loading…"}</p>
      <ol className="wx-list">
        {hits.slice(0, n).map((r) => (
          <li key={r.slug}>
            <span className="rank mono"><i className="sw" style={{ background: archetypes[r.cluster].color }} aria-hidden="true" />{archetypes[r.cluster].code}</span>
            <Link href={`${EXPLORE}/players/${r.slug}`}><b>{r.player}</b><span>{r.club} · {r.comp}</span></Link>
            <span className="mono season">{season(r.season)}</span>
            <span className="mono dist">{r.minutes.toLocaleString("en-US")}′</span>
          </li>
        ))}
      </ol>
      {hits.length > n && <button type="button" className="more-link wx-more" onClick={() => setN(n + 80)}>Show more ↓</button>}
    </div>
  );
}
