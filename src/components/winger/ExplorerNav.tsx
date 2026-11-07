"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EXPLORE } from "@/lib/winger-types";
import { useSelection } from "./Selection";

// Tool links carry the current selection, so moving between tools keeps the same footballer.
export default function ExplorerNav() {
  const path = usePathname();
  const { focus, compare, style } = useSelection();
  const q = (o: Record<string, string | null | undefined>) => {
    const p = new URLSearchParams(Object.entries(o).filter((e): e is [string, string] => !!e[1]));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const tools = [
    { href: `${EXPLORE}${q({ style: `c${style}` })}`, base: EXPLORE, label: "Styles", exact: true },
    { href: focus ? `${EXPLORE}/players/${focus}` : `${EXPLORE}/players`, base: `${EXPLORE}/players`, label: "Footballers" },
    { href: `${EXPLORE}/compare${q({ a: focus, b: compare })}`, base: `${EXPLORE}/compare`, label: "Compare" },
    { href: `${EXPLORE}/map${q({ p: focus })}`, base: `${EXPLORE}/map`, label: "Map" },
    { href: `${EXPLORE}/evolution`, base: `${EXPLORE}/evolution`, label: "Evolution" },
  ];
  const on = (t: (typeof tools)[number]) => (t.exact ? path === t.base : path === t.base || path.startsWith(t.base + "/"));
  return (
    <nav className="wx-tools" aria-label="Explorer tools">
      {tools.map((t) => (
        <Link key={t.label} href={t.href} aria-current={on(t) ? "page" : undefined}>{t.label}</Link>
      ))}
    </nav>
  );
}
