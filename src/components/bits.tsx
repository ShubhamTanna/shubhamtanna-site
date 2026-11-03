import Link from "next/link";
import type { CardData, Project } from "@/lib/content";
import { originLabel } from "@/lib/origin";

export function Origin({ p }: { p: Pick<Project, "origin" | "originNote"> }) {
  return <span className={`origin o-${p.origin}`}>{originLabel(p)}</span>;
}

export function Card({ p }: { p: CardData }) {
  return (
    <Link className="card" href={`/work/${p.slug}`} data-type={p.type}>
      <div className="cover"><Origin p={p} /><div className="big d">{p.hero.value}</div><span className="hl">{p.hero.label}</span></div>
      <div className="body">
        <span className="mono">{p.section}</span>
        <h3>{p.cardTitle}</h3>
        <p className="l">{p.cardLine}</p>
        <div className="meta">
          <span className="mono">{p.year} · {p.team}</span>
          {p.tools.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
      </div>
    </Link>
  );
}

export function SecHead({ eyebrow, title, more, id }: { eyebrow: string; title: string; more?: { href: string; label: string }; id?: string }) {
  return (
    <div className="sec-head" id={id}>
      <span className="eyebrow"><i />{eyebrow}</span>
      <div className="right"><h2>{title}</h2>{more && <Link className="more-link" href={more.href}>{more.label}</Link>}</div>
    </div>
  );
}

export function Jump({ href, label }: { href: string; label: string }) {
  return <Link className="jump" href={href}><span className="mono">Next</span><b>{label}</b></Link>;
}

/** Shown only in development: a visible marker where Shubham's own words are still missing. */
export function Todo({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && !process.env.SHOW_TODOS) return null;
  return <p className="todo">{children}</p>;
}

/** Keeps brand names in their own case inside UPPERCASE labels (Code1o1 would otherwise read "CODE101"). */
const BRANDS = /(Code1o1)/;
export function keepCase(text: string) {
  return text.split(BRANDS).map((part, i) => (BRANDS.test(part) ? <span key={i} className="nc">{part}</span> : part));
}

/** The business, set apart from the projects: dark band, red stamp, its own numbers. Server only. */
export function Venture({ p }: { p: Project }) {
  return (
    <Link className="venture" href={`/work/${p.slug}`}>
      <div className="vhead">
        <span className="stamp">Real business</span>
        <span className="vdate">Not a class project · {p.team} · {p.year}</span>
      </div>
      <h3 className="d">{p.cardTitle}</h3>
      <p>{p.cardLine}</p>
      {p.stats && <div className="vstats">{p.stats.map((s) => <div key={s.label}><b className="d">{s.value}</b><span>{s.label}</span></div>)}</div>}
      <span className="vgo">Read how I built it →</span>
    </Link>
  );
}
