import type { Metadata } from "next";
import { getPagedProjects, getProjects, toCard } from "@/lib/content";
import { WorkGrid } from "@/components/Pickers";
import { Jump } from "@/components/bits";

export const metadata: Metadata = { title: "Work", description: "Case studies, models and builds: each with the number it moved and how." };

export default function WorkPage() {
  const paged = getPagedProjects();
  const smaller = getProjects().filter((p) => p.tier === 3);
  const n = (t: string) => paged.filter((p) => p.type === t).length;
  return (
    <div className="wrap">
      <div className="pagehead">
        <h1 className="d">Work</h1>
        <p>{paged.length} projects: {n("case")} consulting-style case studies, {n("analytics")} models, and {n("build") + n("campaign")} builds and products. Every one opens its own page.</p>
      </div>
      <WorkGrid projects={paged.map(toCard)} />
      {smaller.length > 0 && (
        <section className="smaller" aria-labelledby="smaller-h">
          <h2 id="smaller-h">Smaller builds</h2>
          <p>Earlier and side projects, in one line each.</p>
          <ul>
            {smaller.map((p) => {
              const repo = p.links.find((l) => /github\.com/.test(l.href));
              return (
                <li key={p.slug}>
                  <b>{repo ? <a href={repo.href}>{p.cardTitle}</a> : p.cardTitle}</b>
                  <p>{p.cardLine}</p>
                  <span>{p.year} · {p.team}</span>
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
