"use client";
// Shared explorer selection: the active style, the footballer spell in focus, and a spell to compare with.
// Lives in the explorer layout, so it survives moving between tools. Also kept in sessionStorage so a
// reload keeps it. Every tool also accepts the same values in its URL, which wins when present.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Sel = { style: number; focus: string | null; compare: string | null };
type Ctx = Sel & { set: (patch: Partial<Sel>) => void };
const KEY = "winger-selection";
const C = createContext<Ctx | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [sel, setSel] = useState<Sel>({ style: 0, focus: null, compare: null });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read after hydration
    try { const s = JSON.parse(sessionStorage.getItem(KEY) ?? "null"); if (s) setSel((p) => ({ ...p, ...s })); } catch {}
  }, []);
  const set = useCallback((patch: Partial<Sel>) => {
    setSel((p) => {
      const n = { ...p, ...patch };
      try { sessionStorage.setItem(KEY, JSON.stringify(n)); } catch {}
      return n;
    });
  }, []);
  const v = useMemo(() => ({ ...sel, set }), [sel, set]);
  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useSelection(): Ctx {
  const v = useContext(C);
  if (!v) throw new Error("useSelection outside SelectionProvider");
  return v;
}

// Marks a spell as the focus when its profile page opens.
export function FocusOn({ slug, style }: { slug: string; style: number }) {
  const { set } = useSelection();
  useEffect(() => { set({ focus: slug, style }); }, [slug, style, set]);
  return null;
}
