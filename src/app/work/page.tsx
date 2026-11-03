import type { Metadata } from "next";
import { getPagedProjects, getProjects, originLabel, toCard } from "@/lib/content";
import { WorkGrid } from "@/components/Pickers";
import { Jump, Venture } from "@/components/bits";

export const metadata: Metadata = { title: "Work", description: "Code1o1, the business I co-founded, plus coursework and personal projects: each with the number it moved and how." };

export default function WorkPage() {
  const paged = getPagedProjects();
  const smaller = getProjects().filter((p) => p.tier === 3);
  const business = paged.filter((p) => p.origin === "venture");
  const rest = paged.filter((p) => p.origin !== "venture");
  const from = (o: string) => rest.filter((p) => p.origin === o).length;
  return (
    <div className="wrap">
      <div className="pagehead">
        <h1 className="d">Work</h1>
        <p>One business I co-founded and run, and {rest.length} projects: {from("coursework")} from college coursework, {from("personal")} I started on my own. Each one is labelled with where it came from.</p>
      </div>
      <h2 className="workh">The business</h2>
      {business.map((p) => <Venture key={p.slug} p={p} />)}
      <h2 className="workh">Projects</h2>
      <p className="workh-sub">Coursework and personal projects. Real data and real analysis, but built for a grade or for myself, not for a customer.</p>
      <WorkGrid projects={rest.map(toCard)} />
      {smaller.length > 0 && (
        <section className="smaller" aria-labelledby="smaller-h">
          <h2 id="smaller-h">Smaller builds</h2>
          <p>Earlier and side projects, in one line each.</p>
          <ul>
            {smaller.map((p) => {
              return (
                <li key={p.slug}>
                  <b>{p.code ? <a href={p.code} target="_blank" rel="noopener">{p.cardTitle}</a> : p.cardTitle}</b>
                  <p>{p.cardLine}{p.demo && <> <a className="demo" href={p.demo} target="_blank" rel="noopener">Live demo (may take ~30 s to wake) ↗</a></>}</p>
                  <span>{p.year} · {p.team} · {originLabel(p)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <Jump href="/experience" label="Where I've worked →" />
    </div>
  );
}
