"use client";
// Side-by-side comparison: footballer A in the left column, B in the right, behaviours down the middle.
// Each side's bar grows from the average winger in that footballer's style colour.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DATA, EXPLORE, type CatalogRow, type Meta, type Spell } from "@/lib/winger-types";
import { distanceParts, fmtDist, fmtZ, fold, haystack, onColor, ordinal, sdText, SEARCH_HINT, season, skewed, skewNote } from "@/lib/winger-format";
import { loadCatalog } from "./PlayerSearch";
import { useSelection } from "./Selection";

const spellCache = new Map<string, Promise<Spell>>();
export const loadSpell = (slug: string) => {
  if (!spellCache.has(slug)) spellCache.set(slug, fetch(`${DATA}/spells/${slug}.json`).then((r) => { if (!r.ok) throw new Error(slug); return r.json(); }));
  return spellCache.get(slug)!;
};

export function Picker({ label, value, onPick, rows, placeholder = SEARCH_HINT }: {
  label: string; value: CatalogRow | undefined; onPick: (slug: string) => void; rows: CatalogRow[]; placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const w = fold(q).split(/\s+/).filter(Boolean);
    return w.length ? rows.filter((r) => w.every((x) => haystack(r).includes(x))).slice(0, 8) : [];
  }, [q, rows]);
  return (
    <div className="wx-pick">
      <label><span className="mono">{label}</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={value ? `Change: ${placeholder.replace(/^e\.g\. /, "")}` : placeholder} autoComplete="off" />
      </label>
      {hits.length > 0 && (
        <ul>{hits.map((r) => <li key={r.slug}><button type="button" onClick={() => { onPick(r.slug); setQ(""); }}>{r.player} <span>{r.club} · {season(r.season)}</span></button></li>)}</ul>
      )}
    </div>
  );
}

const DEFAULT: [string, string] = ["phil-foden-manchester-city-2023-24", "jeremy-doku-manchester-city-2023-24"];

export default function CompareView({ meta }: { meta: Meta }) {
  const { focus, compare, set } = useSelection();
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [ab, setAb] = useState<[string | null, string | null]>([null, null]);
  const [spells, setSpells] = useState<[Spell | null, Spell | null]>([null, null]);
  const [all, setAll] = useState(true);

  useEffect(() => { loadCatalog().then(setRows); }, []);
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read after hydration
    setAb([p.get("a") ?? focus ?? DEFAULT[0], p.get("b") ?? compare ?? DEFAULT[1]]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // The explorer-wide footballer bar can change A from here too.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the shared selection
    if (focus && ab[0] && focus !== ab[0] && focus !== ab[1]) setAb([focus, ab[1]]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);
  useEffect(() => {
    const [a, b] = ab;
    if (!a && !b) return;
    const u = new URL(location.href);
    for (const [k, v] of [["a", a], ["b", b]] as const) { if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); }
    history.replaceState(null, "", u);
    set({ ...(a ? { focus: a } : {}), ...(b ? { compare: b } : {}) });
    Promise.all([a ? loadSpell(a).catch(() => null) : null, b ? loadSpell(b).catch(() => null) : null]).then((x) => setSpells(x as [Spell | null, Spell | null]));
  }, [ab, set]);

  const row = (slug: string | null) => rows.find((r) => r.slug === slug);
  const [A, B] = spells;
  const cmp = A && B ? distanceParts(A.fp.map((r) => r[1]), B.fp.map((r) => r[1])) : null;
  const [q1, q2, q3] = meta.nearestQuartiles;
  const F = meta.features;
  const topK = cmp ? cmp.parts.slice(0, 5).map((p) => p.k) : [];
  const share = (k: number) => (cmp ? cmp.parts.find((p) => p.k === k)!.sq / cmp.total : 0);

  const Side = ({ s, k }: { s: Spell; k: number }) => {
    const [, z, pct] = s.fp[k];
    const c = meta.archetypes[s.cluster].color;
    return (
      <div className="side">
        {/* Bars show percentile rank: from the middle season (50th) towards 0 or 100. Bounded, so one extreme value
            cannot squash the rest; the exact SD stays printed beside it. */}
        <div className="trk" role="img" aria-label={`${s.player}: ${ordinal(pct)} percentile, ${sdText(z)}`}>
          <i className="mid" style={{ left: "50%" }} />
          <i className="bar" style={{ left: `${Math.min(50, pct)}%`, width: `${Math.max(0.8, Math.abs(pct - 50))}%`, background: c }} />
        </div>
        <span className="mono v">{ordinal(pct)}<small> · {fmtZ(z)}{skewed(pct, z) ? " †" : ""}</small></span>
      </div>
    );
  };
  const Row = ({ k }: { k: number }) => (
    <li className={topK.includes(k) ? "top" : undefined}>
      <Side s={A!} k={k} />
      <div className="mid-col"><b>{F[k].name}{F[k].unitStatus === "unresolved_physical_unit" ? "*" : ""}</b>{topK.includes(k) && <span className="mono">{Math.round(share(k) * 100)}% of the gap</span>}</div>
      <Side s={B!} k={k} />
    </li>
  );

  return (
    <div className="wx-compare2">
      <div className="wx-cols head">
        {[0, 1].map((i) => {
          const s = spells[i], c = s && meta.archetypes[s.cluster];
          return (
            <div key={i} className="who" style={c ? { ["--c" as string]: c.color, ["--on" as string]: onColor(c.color) } : undefined}>
              {s && c ? (
                <Link href={`${EXPLORE}/players/${s.slug}`} className="card">
                  <span className="mono tag">{i ? "B" : "A"} · {c.code} {c.label}</span>
                  <b className="d">{s.player}</b>
                  <span>{s.club} · {season(s.season)}</span>
                </Link>
              ) : <div className="card empty"><span className="mono tag">{i ? "B" : "A"}</span><b className="d">Choose a footballer</b></div>}
              <Picker label={`Change ${i ? "B" : "A"}`} value={row(ab[i])} rows={rows} onPick={(slug) => setAb(i ? [ab[0], slug] : [slug, ab[1]])} />
            </div>
          );
        })}
      </div>

      {A && B && cmp && (
        <>
          <div className="wx-gap">
            <span className="mono">Style distance between them</span>
            <b className="d">{fmtDist(cmp.distance)}</b>
            <p>{cmp.distance <= q1 ? "Very close: about as near as a typical closest match." : cmp.distance <= q3 ? "Close: in the range of typical closest matches." : "Further apart than most seasons are from their closest match."} For reference, half of all spells have another footballer’s season within {fmtDist(q2)}. {A.cluster === B.cluster ? `Both sit closest to ${meta.archetypes[A.cluster].label}.` : `A sits closest to ${meta.archetypes[A.cluster].code}, B to ${meta.archetypes[B.cluster].code}.`}</p>
          </div>

          <div className="wx-cols-key mono" aria-hidden="true">
            <span>Each bar shows rank among all 1,396 winger seasons, growing from the middle season (50th percentile) to the right for more, to the left for less. Numbers: percentile · SD from the mean.</span>
          </div>

          <h3 className="wx-label mono">Where they differ most</h3>
          <ol className="wx-cols rows">{topK.map((k) => <Row key={k} k={k} />)}</ol>

          <button type="button" className="wx-all mono" aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Hide the other behaviours" : "Show all 20 behaviours"}</button>
          {all && meta.families.map((fam) => {
            const ks = F.map((f, k) => (f.family === fam && !topK.includes(k) ? k : -1)).filter((k) => k >= 0);
            return ks.length ? (
              <section key={fam}>
                <h3 className="wx-label mono">{fam}</h3>
                <ol className="wx-cols rows">{ks.map((k) => <Row key={k} k={k} />)}</ol>
              </section>
            ) : null;
          })}
          <p className="wx-small">Style distance is the research’s own measure: straight-line distance across all 20 standardized behaviours. It is not a similarity percentage and says nothing about which player is better. Percentile is rank among all 1,396 spells; SD is distance from the all-spell mean.{[A, B].some((s) => s.fp.some((r) => skewed(r[2], r[1]))) ? ` † ${skewNote}` : ""}</p>
        </>
      )}
    </div>
  );
}
