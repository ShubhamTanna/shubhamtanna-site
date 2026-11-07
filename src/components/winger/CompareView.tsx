"use client";
// Side-by-side comparison: footballer A in the left column, B in the right, behaviours down the middle.
// Each side's bar grows from the average winger in that footballer's style colour.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DATA, EXPLORE, type CatalogRow, type Meta, type Spell } from "@/lib/winger-types";
import { distanceParts, fmtDist, fmtZ, fold, haystack, onColor, pctShort, sdText, SEARCH_HINT, season, shareText, SHOT_UNIT_NOTE, signedBar, skewed, skewNote } from "@/lib/winger-format";
import { loadCatalog } from "./PlayerSearch";
import Definitions from "./Definitions";
import { useSelection } from "./Selection";

const spellCache = new Map<string, Promise<Spell>>();
export const loadSpell = (slug: string) => {
  // Check the catalogue first, so an unknown footballer (old link, edited URL) never triggers a 404 request.
  if (!spellCache.has(slug)) spellCache.set(slug, loadCatalog().then((rows) => {
    if (!rows.some((r) => r.slug === slug)) throw new Error(`unknown footballer: ${slug}`);
    return fetch(`${DATA}/spells/${slug}.json`).then((r) => { if (!r.ok) { void r.body?.cancel(); throw new Error(slug); } return r.json(); });
  }));
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
    // Share the choice with the other tools only once each footballer has actually loaded.
    Promise.all([a ? loadSpell(a).catch(() => null) : null, b ? loadSpell(b).catch(() => null) : null]).then((x) => {
      const [A, B] = x as [Spell | null, Spell | null];
      setSpells([A, B]);
      if (A || B) set({ ...(A ? { focus: A.slug } : {}), ...(B ? { compare: B.slug } : {}) });
    });
  }, [ab, set]);

  const row = (slug: string | null) => rows.find((r) => r.slug === slug);
  const [A, B] = spells;
  const cmp = A && B ? distanceParts(A.fp.map((r) => r[1]), B.fp.map((r) => r[1])) : null;
  const [q1, q2, q3] = meta.nearestQuartiles;
  const F = meta.features;
  const same = !!cmp && cmp.total === 0; // identical measured profiles: nothing to apportion
  const topK = cmp && !same ? cmp.parts.slice(0, 5).map((p) => p.k) : [];
  const share = (k: number) => (cmp ? cmp.parts.find((p) => p.k === k)!.sq / cmp.total : 0);

  const Side = ({ s, k }: { s: Spell; k: number }) => {
    const [, z, pct] = s.fp[k];
    const c = meta.archetypes[s.cluster].color;
    return (
      <div className="side">
        {/* Bars show percentile rank: from the middle season (50th) towards 0 or 100. Bounded, so one extreme value
            cannot squash the rest; the exact SD stays printed beside it. */}
        <div className="trk" role="img" aria-label={`${s.player}: ${shareText(pct)}, ${sdText(z)}`}>
          <i className="mid" style={{ left: "50%" }} />
          {(() => { const b = signedBar(pct, 50); return b && <i className="bar" style={{ left: `${b.left}%`, width: `${b.width}%`, background: c }} />; })()}
        </div>
        <span className="mono v">{pctShort(pct)}<small> · {fmtZ(z)}{skewed(pct, z) ? " †" : ""}</small></span>
      </div>
    );
  };
  const Row = ({ k }: { k: number }) => (
    <li className={topK.includes(k) ? "top" : undefined}>
      <Side s={A!} k={k} />
      <div className="mid-col"><b>{F[k].name}{F[k].unitStatus === "unresolved_physical_unit" ? "*" : ""}</b>{topK.includes(k) && <span className="mono">{Math.round(share(k) * 100)}% of the total squared difference</span>}</div>
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
            <p>{same
              ? "These measured profiles coincide. Distance: 0. There are no differences to apportion."
              : <>For reference, compared with each spell’s nearest other footballer in this dataset: a quarter are within {fmtDist(q1)}, half within {fmtDist(q2)} and three quarters within {fmtDist(q3)}. {cmp.distance <= q3 ? "This pair is within that range." : "This pair is further apart than three quarters of those nearest matches."} There is no universal threshold for a good match.</>}{" "}
              {A.cluster === B.cluster ? `Both sit nearest the ${meta.archetypes[A.cluster].label} centre.` : `A sits nearest ${meta.archetypes[A.cluster].code}, B nearest ${meta.archetypes[B.cluster].code}.`}</p>
          </div>

          <div className="wx-cols-key mono" aria-hidden="true">
            <span>Each bar shows percentile rank among all 1,396 qualifying spells, growing from the middle rank (50th) to the right for higher values, to the left for lower. Numbers: percentile · SD from the mean.</span>
          </div>

          {!same && <>
            <h3 className="wx-label mono">Largest differences</h3>
            <ol className="wx-cols rows">{topK.map((k) => <Row key={k} k={k} />)}</ol>
          </>}

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
          <p className="wx-small">Style distance is the research’s own measure: straight-line distance across all 20 standardized behaviours. It is not a similarity percentage and says nothing about which player is better. “Share of the total squared difference” is each behaviour’s squared difference divided by the sum across all 20; the style distance is the square root of that sum. Percentile is rank among all 1,396 spells; SD is distance from the all-spell mean.{[A, B].some((s) => s.fp.some((r) => skewed(r[2], r[1]))) ? ` † ${skewNote}` : ""} {SHOT_UNIT_NOTE}</p>
          <Definitions features={F} />
        </>
      )}
    </div>
  );
}
