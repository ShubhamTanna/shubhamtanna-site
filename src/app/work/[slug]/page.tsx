import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPagedProjects, getProject } from "@/lib/content";
import { ChartView } from "@/components/Charts";

export function generateStaticParams() {
  return getPagedProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.cardTitle, description: p.cardLine } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const all = getPagedProjects();
  const next = all[(all.findIndex((x) => x.slug === slug) + 1) % all.length];
  const leadChart = p.lead?.kind === "chart" && p.lead.chart !== undefined ? p.lead.chart : -1;
  const files = p.links;
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <article className="page-project">
      <header className="cband"><div className="wrap">
        <Link className="back" href="/work">← All work</Link>
        <div className="grid2">
          <div><span className="kicker">{p.section} · {p.year}</span><h1>{p.title}</h1></div>
          <div className="hero"><b>{p.hero.value}</b><span>{p.hero.label}</span></div>
        </div>
      </div></header>

      <div className="wrap"><div className="cbody">
        <div className="glance">
          <div><span>Role</span><p>{p.team}</p></div>
          <div><span>Year</span><p>{p.year}</p></div>
          <div><span>Type</span><p>{p.section}</p></div>
          <div><span>Tools</span><p>{p.tools.join(", ")}</p></div>
        </div>
        <div className="answer2"><span>{p.answer ? "The answer" : "In one line"}</span><p>{p.answer ?? p.cardLine}</p></div>

        {p.lead?.kind === "image" && p.lead.src && (
          <figure className="lead"><Image src={p.lead.src} alt={p.lead.alt} width={1600} height={1000} sizes="(max-width: 1080px) 100vw, 1040px" />{p.lead.caption && <figcaption>{p.lead.caption}</figcaption>}</figure>
        )}
        {p.lead?.kind === "video" && p.lead.src && (
          <figure className="lead"><video src={p.lead.src} poster={p.lead.poster} muted loop playsInline autoPlay controls preload="metadata" aria-label={p.lead.alt} />{p.lead.caption && <figcaption>{p.lead.caption}</figcaption>}</figure>
        )}
        {leadChart >= 0 && p.charts[leadChart] && <div className="lead"><ChartView slug={p.slug} c={p.charts[leadChart]} /></div>}

        {p.stats && <div className="stats">{p.stats.map((s) => <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}</div>}

        <section className="csec"><h2><i>{num()}</i><b>The problem</b></h2><div><p>{p.problem}</p>{p.context && <p className="ctx">{p.context}</p>}</div></section>
        <section className="csec"><h2><i>{num()}</i><b>What I did</b></h2><div><ul>{p.did.map((d) => <li key={d}>{d}</li>)}</ul></div></section>

        {(p.charts.length > 0 || p.results.length > 0 || p.method || p.notes) && (
          <section className="csec"><h2><i>{num()}</i><b>Results</b></h2><div>
            {p.charts.map((c, i) => (i === leadChart ? null : <ChartView key={c.file} slug={p.slug} c={c} />))}
            {p.results.map((t) => (
              <div key={t.caption} style={{ overflowX: "auto", marginBottom: 28 }}>
                <table>
                  <caption>{t.caption}</caption>
                  <thead><tr>{t.columns.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                  <tbody>{t.rows.map((r, i) => <tr key={i} className={/^total|break-even/i.test(r[0]) ? "total" : undefined}>{r.map((cell, j) => (j === 0 ? <th key={j} scope="row" style={{ font: "inherit", textTransform: "none", letterSpacing: 0, color: "inherit" }}>{cell}</th> : <td key={j}>{cell}</td>))}</tr>)}</tbody>
                </table>
                {t.source && <p className="tsrc" style={{ marginTop: 10 }}>Source: {t.source}</p>}
              </div>
            ))}
            {p.method && <p className="ctx"><b>Assumptions.</b> {p.method}</p>}
            {p.notes?.map((x) => <p key={x}>{x}</p>)}
          </div></section>
        )}

        {p.story && <section className="csec"><h2><i>{num()}</i><b>{p.story.title}</b></h2><div><p>{p.story.text}</p></div></section>}

        {files.length > 0 && (
          <section className="csec"><h2><i>{num()}</i><b>Files</b></h2><div className="files">{files.map((l) => <a key={l.href} href={l.href} rel="noopener">{l.label} ↗</a>)}</div></section>
        )}
      </div></div>

      <Link className="nextband" href={`/work/${next.slug}`}><div className="wrap"><div><span className="k">Next project</span><h2>{next.cardTitle}</h2></div><b>{next.hero.value} →</b></div></Link>
    </article>
  );
}
