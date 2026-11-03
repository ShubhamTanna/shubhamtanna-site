"use client";
import Link from "next/link";
import { useState } from "react";
import type { CardData } from "@/lib/content";
import { Card } from "./bits";

const NOTES = {
  consulting: "Case studies on pricing, strategy and markets. Problems that end in a decision.",
  analytics: "Models, data and tools I built. Each one judged on whether it holds up.",
};
type Side = keyof typeof NOTES;
const sideOf = (p: CardData): Side => (p.type === "venture" || p.type === "case" || p.type === "campaign" ? "consulting" : "analytics");

/** Home: Consulting / Analytics tabs, five cards each, the first one large. */
export function SideTabs({ projects }: { projects: CardData[] }) {
  const [side, setSide] = useState<Side>("consulting");
  const list = projects.filter((p) => sideOf(p) === side);
  const more = list.length - 5;
  return (
    <>
      <div className="side-tabs" role="tablist" aria-label="Pick a side">
        {(["consulting", "analytics"] as Side[]).map((s) => (
          <button key={s} type="button" role="tab" id={`tab-${s}`} aria-selected={side === s} aria-controls="rows" onClick={() => setSide(s)}>
            {s === "consulting" ? "Consulting" : "Analytics"}<sup>{projects.filter((p) => sideOf(p) === s).length}</sup>
          </button>
        ))}
      </div>
      <p className="side-note">{NOTES[side]}</p>
      <div className="cards home" id="rows" role="tabpanel" aria-labelledby={`tab-${side}`}>
        {list.slice(0, 5).map((p) => <Card key={p.slug} p={p} />)}
      </div>
      <div className="below">
        <span className="mono" style={{ color: "var(--muted)" }}>{more > 0 ? `+${more} more ${side} projects on the Work page` : ""}</span>
        <Link className="btn" href="/work">See all work →</Link>
      </div>
    </>
  );
}

const TYPES = [["all", "All"], ["case", "Case studies"], ["analytics", "Analytics & ML"], ["build", "Builds"], ["campaign", "Campaigns & product"]] as const;

/** Work page: type filters with counts. */
export function WorkGrid({ projects }: { projects: CardData[] }) {
  const [k, setK] = useState<string>("all");
  const match = (p: CardData, t: string) => t === "all" || p.type === t || p.origin === t;
  const count = (t: string) => projects.filter((p) => match(p, t)).length;
  const shown = projects.filter((p) => match(p, k));
  return (
    <>
      <div className="filters" aria-label="Filter projects">
        {TYPES.filter(([t]) => count(t) > 0).map(([t, label]) => (
          <button key={t} type="button" aria-pressed={k === t} onClick={() => setK(t)}>{label}<sup>{count(t)}</sup></button>
        ))}
      </div>
      <div className="cards">{shown.map((p) => <Card key={p.slug} p={p} />)}</div>
    </>
  );
}
