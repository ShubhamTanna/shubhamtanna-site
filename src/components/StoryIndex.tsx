"use client";
import { useEffect, useState } from "react";

/** Sticky chapter index on the Story page; highlights the chapter in view. */
export default function StoryIndex({ items }: { items: { key: string; title: string }[] }) {
  const [cur, setCur] = useState(items[0]?.key);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCur(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" });
    items.forEach((i) => { const el = document.getElementById(i.key); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <ol className="st-index">
      {items.map((c, i) => (
        <li key={c.key}><a href={`#${c.key}`} className={cur === c.key ? "cur" : undefined}><span>{String(i + 1).padStart(2, "0")}</span><b>{c.title}</b></a></li>
      ))}
    </ol>
  );
}
