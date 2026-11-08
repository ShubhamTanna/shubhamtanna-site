"use client";
// The footballer currently being viewed, shown under the explorer bar on every tool, with a way to change it
// from anywhere. Changing it on a profile page opens that profile; elsewhere the tool follows the new choice.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EXPLORE, type Archetype, type CatalogRow } from "@/lib/winger-types";
import { fold, haystack, SEARCH_HINT, season } from "@/lib/winger-format";
import { loadCatalog } from "./PlayerSearch";
import { useSelection } from "./Selection";

export default function FocusBar({ archetypes }: { archetypes: Archetype[] }) {
  const { focus, compare, set } = useSelection();
  const path = usePathname();
  const router = useRouter();
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  useEffect(() => { loadCatalog().then(setRows); }, []);
  useEffect(() => {
    if (!rows.length) return;
    if (focus && !rows.some((x) => x.slug === focus)) set({ focus: null });
    if (compare && !rows.some((x) => x.slug === compare)) set({ compare: null });
  }, [rows, focus, compare, set]);
  const r = rows.find((x) => x.slug === focus);
  const hits = useMemo(() => {
    const w = fold(q).split(/\s+/).filter(Boolean);
    return w.length ? rows.filter((x) => w.every((t) => haystack(x).includes(t))).slice(0, 8) : [];
  }, [q, rows]);
  const onProfile = path.startsWith(`${EXPLORE}/players/`);
  const pick = (slug: string) => {
    setOpen(false); setQ("");
    if (onProfile) router.push(`${EXPLORE}/players/${slug}`);
    else set({ focus: slug });
  };
  const a = r && archetypes[r.cluster];

  return (
    <div className="wx-focus" style={a ? { ["--c" as string]: a.color } : undefined}>
      <div className="wrap">
        <span className="mono lab">Viewing</span>
        {r && a ? (
          <p className="who">
            <i aria-hidden="true" />
            <b>{r.player}</b>
            <span>{r.club} · {season(r.season)} · {a.code} {a.label}</span>
          </p>
        ) : <p className="who none">No footballer chosen yet</p>}
        <div className="acts">
          {r && !onProfile && <Link className="mono" href={`${EXPLORE}/players/${r.slug}`}>Profile →</Link>}
          <button type="button" className="mono" aria-expanded={open} onClick={() => setOpen(!open)}>{r ? "Change footballer" : "Choose a footballer"}</button>
          {r && !onProfile && <button type="button" className="mono x" aria-label="Clear the footballer" onClick={() => set({ focus: null })}>Clear</button>}
        </div>
        {open && (
          <div className="find wx-pick">
            <label><span className="sr">Search a footballer</span>
              <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={SEARCH_HINT} autoComplete="off" onKeyDown={(e) => e.key === "Escape" && setOpen(false)} />
            </label>
            {hits.length > 0 && <ul>{hits.map((x) => <li key={x.slug}><button type="button" onClick={() => pick(x.slug)}>{x.player} <span>{x.club} · {season(x.season)}</span></button></li>)}</ul>}
          </div>
        )}
      </div>
    </div>
  );
}
