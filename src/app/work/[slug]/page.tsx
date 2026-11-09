import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CUSTOM_PAGES, getPagedProjects, getProject, originLabel, readScreens, type Block, type Project, type Screen } from "@/lib/content";
import { Origin } from "@/components/bits";
import { ChartView } from "@/components/Charts";

const codeLabel = (url: string) => (url.includes("/case-studies/") ? "Case files on GitHub" : "Code on GitHub");

export function generateStaticParams() {
  return getPagedProjects().filter((p) => !CUSTOM_PAGES.has(p.slug)).map((p) => ({ slug: p.slug }));
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
  const files = [...(p.demo ? [{ label: "Live demo (may take ~30 s to wake)", href: p.demo }] : []), ...(p.code ? [{ label: codeLabel(p.code), href: p.code }] : []), ...p.links];
  const screens = readScreens(p.slug);
  let n = 0;
  const num = () => String(++n).padStart(2, "0");
  const story = !!p.sections;

  return (
    <article className="page-project">
      <header className="cband"><div className="wrap">
        <Link className="back" href="/work">← All work</Link>
        <div className="grid2">
          <div><Origin p={p} /><span className="kicker">{p.section} · {p.year}</span><h1>{p.title}</h1></div>
          {story
            ? <div className="deck"><p>{p.cardLine}</p>{p.context && <p className="ctx">{p.context}</p>}</div>
            : <div className="hero"><b>{p.hero.value}</b><span>{p.hero.label}</span></div>}
        </div>
      </div></header>

      <div className="wrap"><div className="cbody">
        <div className="glance">
          <div><span>Role</span><p>{p.team}</p></div>
          <div><span>Year</span><p>{p.year}</p></div>
          <div><span>Origin</span><p>{originLabel(p)}</p></div>
          <div><span>Tools</span><p>{p.tools.join(", ")}</p></div>
        </div>
        {!story && <div className="answer2"><span>{p.answer ? "The answer" : "In one line"}</span><p>{p.answer ?? p.cardLine}</p></div>}
        {(p.demo || p.code) && (
          <div className="actions">
            {p.demo && <a className="btn" href={p.demo} target="_blank" rel="noopener">Live demo (may take ~30 s to wake) ↗</a>}
            {p.code && <a className="outline" href={p.code} target="_blank" rel="noopener">{codeLabel(p.code)} ↗</a>}
          </div>
        )}

        {p.lead?.kind === "image" && p.lead.src && (
          <figure className="lead"><Image src={p.lead.src} alt={p.lead.alt} width={1600} height={1000} sizes="(max-width: 1080px) 100vw, 1040px" />{p.lead.caption && <figcaption>{p.lead.caption}</figcaption>}</figure>
        )}
        {p.lead?.kind === "video" && p.lead.src && (
          <figure className="lead"><video src={p.lead.src} poster={p.lead.poster} muted loop playsInline autoPlay controls preload="metadata" aria-label={p.lead.alt} />{p.lead.caption && <figcaption>{p.lead.caption}</figcaption>}</figure>
        )}
        {!story && leadChart >= 0 && p.charts[leadChart] && <div className="lead"><ChartView slug={p.slug} c={p.charts[leadChart]} /></div>}

        {!story && p.stats && <div className="stats">{p.stats.map((s) => <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}</div>}

        {story ? p.sections!.map((sec) => (
          <section key={sec.title} className="csec"><h2><i>{num()}</i><b>{sec.title}</b></h2><div className="sblocks">
            {sec.blocks.map((b, i) => <SectionBlock key={i} b={b} p={p} screens={screens} />)}
          </div></section>
        )) : <>
        <section className="csec"><h2><i>{num()}</i><b>The problem</b></h2><div><p>{p.problem}</p>{p.context && <p className="ctx">{p.context}</p>}</div></section>
        <section className="csec"><h2><i>{num()}</i><b>What I did</b></h2><div><ul>{p.did.map((d) => <li key={d}>{d}</li>)}</ul></div></section>

        {screens.length > 0 && (
          <section className="csec"><h2><i>{num()}</i><b>In action</b></h2><Shots list={screens} /></section>
        )}

        {(p.charts.length > 0 || p.results.length > 0 || p.method || p.notes) && (
          <section className="csec"><h2><i>{num()}</i><b>Results</b></h2><div>
            {p.charts.map((c, i) => (i === leadChart ? null : <ChartView key={c.file} slug={p.slug} c={c} />))}
            {p.results.map((t) => <ResultTable key={t.caption} t={t} />)}
            {p.method && <p className="ctx"><b>Assumptions.</b> {p.method}</p>}
            {p.notes?.map((x) => <p key={x}>{x}</p>)}
          </div></section>
        )}

        {p.story && <section className="csec"><h2><i>{num()}</i><b>{p.story.title}</b></h2><div><p>{p.story.text}</p></div></section>}

        </>}

        {files.length > 0 && (
          <section className="csec"><h2><i>{num()}</i><b>Files</b></h2><div className="files">{files.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener">{l.label} ↗</a>)}</div></section>
        )}
      </div></div>

      <Link className="nextband" href={`/work/${next.slug}`}><div className="wrap"><div><span className="k">Next project</span><h2>{next.cardTitle}</h2></div><b>{next.hero.value} →</b></div></Link>
    </article>
  );
}

/** Consecutive phone-size screens share a row; everything else is full width. */
function Shots({ list, frame }: { list: Screen[]; frame?: boolean }) {
  return (
    <div className="shots">
      {list.reduce<Screen[][]>((g, s) => { const last = g[g.length - 1]; if (s.phone && last?.[0].phone) last.push(s); else g.push([s]); return g; }, []).map((grp) => (
        <div key={grp[0].src} className={grp[0].phone ? `row phone${frame ? " framed" : ""}${grp.length === 4 ? " four" : ""}` : "row"}>
          {grp.map((s) => (
            <figure key={s.src}>
              {s.video
                ? <video src={s.src} poster={s.poster} muted loop playsInline controls preload="metadata" aria-label={s.alt} />
                : <a href={s.src} target="_blank" rel="noopener" aria-label={`${s.alt} (opens full size)`}><Image src={s.src} alt={s.alt} width={1600} height={1000} sizes={s.phone ? "(max-width: 700px) 50vw, 300px" : "(max-width: 1080px) 100vw, 900px"} /></a>}
              {s.caption && <figcaption>{s.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

function ResultTable({ t }: { t: Project["results"][number] }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 28 }}>
      <table>
        <caption>{t.caption}</caption>
        <thead><tr>{t.columns.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
        <tbody>{t.rows.map((r, i) => <tr key={i} className={/^total|break-even/i.test(r[0]) ? "total" : undefined}>{r.map((cell, j) => (j === 0 ? <th key={j} scope="row" style={{ font: "inherit", textTransform: "none", letterSpacing: 0, color: "inherit" }}>{cell}</th> : <td key={j}>{cell}</td>))}</tr>)}</tbody>
      </table>
      {t.source && <p className="tsrc" style={{ marginTop: 10 }}>Source: {t.source}</p>}
    </div>
  );
}

/** One block of a story-ordered page (see `sections` in content.ts). */
function SectionBlock({ b, p, screens }: { b: Block; p: Project; screens: Screen[] }) {
  if ("p" in b) return <p>{b.p}</p>;
  if ("list" in b) return <ul>{b.list.map((x) => <li key={x}>{x}</li>)}</ul>;
  if ("note" in b) return <p className="ctx">{b.note}</p>;
  if ("callout" in b) return <div className="callout"><span>{b.callout.label}</span><p>{b.callout.text}</p></div>;
  if ("items" in b) return (
    <dl className="items">{b.items.map((x) => (
      <div key={x.title} className={x.tag ? "key" : undefined}><dt>{x.title}{x.tag && <i>{x.tag}</i>}</dt><dd>{x.text}</dd></div>
    ))}</dl>
  );
  if ("cards" in b) return (
    <div className="plans">
      <div className="grid">{b.cards.map((c) => (
        <div key={c.title}><span>{c.title}</span><b>{c.price}</b><ul>{c.lines.map((l) => <li key={l}>{l}</li>)}</ul></div>
      ))}</div>
      {b.foot && <p className="foot">{b.foot}</p>}
    </div>
  );
  if ("chart" in b) return <ChartView slug={p.slug} c={p.charts[b.chart]} />;
  if ("table" in b) return <ResultTable t={p.results[b.table]} />;
  if ("button" in b) return <p className="sbtn"><a className="btn" href={b.button.href} target="_blank" rel="noopener">{b.button.label} ↗</a></p>;
  const list = b.screens.map((f) => screens.find((s) => s.src.endsWith(`/${f}`))).filter((s): s is Screen => !!s);
  return list.length ? <Shots list={list} frame /> : null;
}
