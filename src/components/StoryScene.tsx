"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Ch = { title: string; text: string; stat: string; statLabel: string };

/**
 * Home's pinned story: six words fill in one by one as you scroll, each with its number.
 * Falls back to a static list with reduced motion or on short screens (phone held sideways).
 */
export default function StoryScene({ chapters }: { chapters: Ch[] }) {
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [i, setI] = useState(0);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce), (max-height: 520px)");
    const decide = () => setLive(!still.matches);
    decide();
    still.addEventListener("change", decide);
    return () => still.removeEventListener("change", decide);
  }, []);

  useEffect(() => {
    if (!live) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(), span = el.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / span));
      setI(Math.min(chapters.length - 1, Math.floor(p * chapters.length * 0.999)));
      setHint(p <= 0.02);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", update);
    update();
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", update); };
  }, [live, chapters.length]);

  const n = (k: number) => String(k + 1).padStart(2, "0");
  return (
    <section ref={ref} className={`scene${live ? " live" : ""}`} aria-label="How I got here">
      <div className="stick">
        <div key={i} className="ghost pop" aria-hidden="true">{n(i)}</div>
        <div className="wrap">
          <div className="top"><span className="eyebrow"><i />01 · Story · six chapters</span></div>
          <div className="scene-stage">
            <ol className="words" aria-hidden="true">
              {chapters.map((c, k) => (
                <li key={c.title} className={`w${!live || k <= i ? " on" : ""}${live && k === i ? " cur" : ""}`}><span>{n(k)}</span>{c.title}</li>
              ))}
            </ol>
            <div>
              <div className="details">
                {chapters.map((c, k) => (
                  <div key={c.title} className={`det${!live || k === i ? " cur" : ""}`}>
                    <span className="mono">{n(k)} / 06 · {c.title}</span>
                    <b className="stat">{c.stat}</b>
                    <span className="statl">{c.statLabel}</span>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="segs" aria-hidden="true">{chapters.map((c, k) => <i key={c.title} className={!live || k <= i ? "on" : ""} />)}</div>
              <div className="go"><Link className="more-link" href="/story">Read the full story →</Link></div>
            </div>
          </div>
        </div>
        <span className="hint" style={{ opacity: hint ? 1 : 0 }}>Scroll</span>
      </div>
    </section>
  );
}
