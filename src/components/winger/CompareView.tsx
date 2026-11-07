"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DATA, EXPLORE, type CatalogRow, type Meta, type Spell } from "@/lib/winger-types";
import { distanceParts, fmtDist, sdText, season, shareText, skewed, skewNote } from "@/lib/winger-format";
import { loadCatalog } from "./PlayerSearch";
import { useSelection } from "./Selection";

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const spellCache = new Map<string, Promise<Spell>>();
export const loadSpell = (slug: string) => {
  if (!spellCache.has(slug)) spellCache.set(slug, fetch(`${DATA}/spells/${slug}.json`).then((r) => { if (!r.ok) throw new Error(slug); return r.json(); }));
  return spellCache.get(slug)!;
};

function Picker({ label, value, onPick, rows }: { label: string; value: CatalogRow | undefined; onPick: (slug: string) => void; rows: CatalogRow[] }) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const w = fold(q).split(/\s+/).filter(Boolean);
    return w.length ? rows.filter((r) => w.every((x) => fold(`${r.player} ${r.club} ${r.season}`).includes(x))).slice(0, 8) : [];
  }, [q, rows]);
  return (
    <div className="wx-pick">
      <label><span className="mono">{label}</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={value ? `${value.player}, ${season(value.season)}` : "Search a footballer"} autoComplete="off" />
      </label>
      {hits.length > 0 && (
        <ul>{hits.map((r) => <li key={r.slug}><button type="button" onClick={() => { onPick(r.slug); setQ(""); }}>{r.player} <span>{r.club} · {season(r.season)}</span></button></li>)}</ul>
      )}
    </div>
  );
}

export default function CompareView({ meta }: { meta: Meta }) {
  const { focus, compare, set } = useSelection();
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [ab, setAb] = useState<[string | null, string | null]>([null, null]);
  const [spells, setSpells] = useState<[Spell | null, Spell | null]>([null, null]);

  useEffect(() => { loadCatalog().then(setRows); }, []);
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read after hydration
    setAb([p.get("a") ?? focus, p.get("b") ?? compare]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const [a, b] = ab;
    const u = new URL(location.href);
    for (const [k, v] of [["a", a], ["b", b]] as const) { if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); }
    history.replaceState(null, "", u);
    if (a || b) set({ ...(a ? { focus: a } : {}), ...(b ? { compare: b } : {}) });
    Promise.all([a ? loadSpell(a).catch(() => null) : null, b ? loadSpell(b).catch(() => null) : null]).then((x) => setSpells(x as [Spell | null, Spell | null]));
  }, [ab, set]);

  const row = (slug: string | null) => rows.find((r) => r.slug === slug);
  const [A, B] = spells;
  const cmp = A && B ? distanceParts(A.fp.map((r) => r[1]), B.fp.map((r) => r[1])) : null;
  const ca = A && meta.archetypes[A.cluster], cb = B && meta.archetypes[B.cluster];
  const [q1, q2, q3] = meta.nearestQuartiles;

  return (
    <div className="wx-compare">
      <div className="wx-pickers">
        <Picker label="Footballer A" value={row(ab[0])} rows={rows} onPick={(s) => setAb([s, ab[1]])} />
        <Picker label="Footballer B" value={row(ab[1])} rows={rows} onPick={(s) => setAb([ab[0], s])} />
      </div>
      {!(A && B) ? <p className="wx-pending">Choose two spells to compare. Tip: open a footballer and use Compare next to any similar season.</p> : (
        <>
          <div className="wx-vs">
            {[A, B].map((s, i) => { const c = meta.archetypes[s.cluster]; return (
              <Link key={i} href={`${EXPLORE}/players/${s.slug}`} className="side" style={{ borderTopColor: c.color }}>
                <span className="mono">{i ? "B" : "A"} · {c.code} {c.label}</span>
                <b className="d">{s.player}</b><span>{s.club} · {season(s.season)}</span>
              </Link>); })}
            <div className="dist">
              <span className="mono">Style distance</span>
              <b className="d">{fmtDist(cmp!.distance)}</b>
              <span>{cmp!.distance <= q1 ? "Very close: about as near as a typical closest match." : cmp!.distance <= q3 ? "Close: in the range of typical closest matches." : "Further apart than most spells’ closest match."} Half of all spells have a closest match within {fmtDist(q2)}.</span>
            </div>
          </div>
          <h3 className="mono wx-label">Where they differ most</h3>
          <ol className="wx-diff">
            {cmp!.parts.slice(0, 5).map(({ k }) => {
              const f = meta.features[k];
              return (
                <li key={k}>
                  <b>{f.name}</b>
                  <span>A: {shareText(A.fp[k][2])}, {sdText(A.fp[k][1])}{skewed(A.fp[k][2], A.fp[k][1]) ? " †" : ""}</span>
                  <span>B: {shareText(B.fp[k][2])}, {sdText(B.fp[k][1])}{skewed(B.fp[k][2], B.fp[k][1]) ? " †" : ""}</span>
                  <span className="mono">{((cmp!.parts.find((p) => p.k === k)!.sq / cmp!.total) * 100).toFixed(0)}% of the squared distance</span>
                </li>
              );
            })}
          </ol>
          <p className="wx-small">Distance is the research’s own measure: straight-line distance across all 20 standardized behaviours. It is not a similarity percentage, and it says nothing about which player is better. Percent figures are percentile rank among all spells; SD is distance from the all-spell mean.{cmp!.parts.slice(0, 5).some(({ k }) => skewed(A.fp[k][2], A.fp[k][1]) || skewed(B.fp[k][2], B.fp[k][1])) ? ` † ${skewNote}` : ""} {ca && cb && ca.id === cb.id ? `Both seasons sit closest to ${ca.label}.` : ""}</p>
        </>
      )}
    </div>
  );
}
