import Image from "next/image";
import Link from "next/link";
import { getAbout, getChapters, getExperience, getPagedProjects, getSite, monthName, toCard } from "@/lib/content";
import StoryScene from "@/components/StoryScene";
import { SideTabs } from "@/components/Pickers";
import { SecHead, Venture } from "@/components/bits";
import { OffTiles } from "@/components/Off";

export default function Home() {
  const site = getSite();
  const chapters = getChapters();
  const projects = getPagedProjects();
  const xp = getExperience();
  const about = getAbout();
  const business = projects.filter((p) => p.origin === "venture");
  const rest = projects.filter((p) => p.origin !== "venture");
  const from = (o: string) => rest.filter((p) => p.origin === o).length;

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div>
            <h1 className="d">{site.positioning}</h1>
            <p className="sub">{site.subline}</p>
            <div className="proof">{site.proof.map((s) => <div key={s.label}><b className="d">{s.value}</b><span className="mono">{s.label}</span></div>)}</div>
            <div className="herocta"><a className="btn" href="#homework">See the work ↓</a><a className="more-link" href={site.links.resume} target="_blank" rel="noopener">Download resume</a></div>
          </div>
          <div className="portrait">
            <Image className="ph" src={site.heroPhoto.src} alt={site.heroPhoto.alt} width={1200} height={1500} preload sizes="(max-width: 860px) 340px, 440px" />
          </div>
        </div>
      </header>

      <StoryScene chapters={chapters.map((c, i) => ({
        title: c.title, text: c.text,
        stat: i === chapters.length - 1 ? "Let's talk" : c.proof[0]?.value ?? "",
        statLabel: i === chapters.length - 1 ? site.lookingFor : c.proof[0]?.what ?? "",
      }))} />

      <section className="workband" id="homework">
        <div className="wrap">
          <SecHead eyebrow="02 · Work" title="One business. The rest is practice." more={{ href: "/work", label: "All work →" }} />
          <p className="worklede">Code1o1 is a business I co-founded and still run, with paying clients. Everything below it is coursework or a project I started in my own time, and each one is labelled.</p>
          {business.map((p) => <Venture key={p.slug} p={p} />)}
          <div className="tally">
            <span><b>{rest.length}</b>projects</span>
            <span><b>{from("coursework")}</b>from coursework</span>
            <span><b>{from("personal")}</b>personal</span>
            <span><b>{about.now.building.length}</b>in progress</span>
          </div>
          <SideTabs projects={rest.map(toCard)} />
        </div>
      </section>

      <div className="wrap">
        <SecHead eyebrow="03 · Experience" title="Where I've done it." more={{ href: "/experience", label: "All experience →" }} />
        <div className="xteaser">
          {xp.work.map((x) => (
            <Link key={x.org} href="/experience">
              {x.current && <span className="cur">Current</span>}
              <b>{x.org}</b><span className="r">{x.role}</span><time>{x.dates}</time>
            </Link>
          ))}
        </div>

        <SecHead eyebrow="04 · About" title="Right now, and off the clock." more={{ href: "/about", label: "More about me →" }} />
        <section className="now">
          <div className="p"><p className="mono upd">Updated {monthName(about.now.updated)}</p><p style={{ margin: "12px 0 0", color: "var(--night-muted)" }}>{about.now.building.length} things in progress. Updated monthly.</p></div>
          <div className="p"><p className="mono">Building</p><ul>{about.now.building.map((b) => <li key={b.name}>{b.name}<span>{b.stage}</span></li>)}</ul></div>
          <div className="p"><p className="mono">Learning</p><ul>{about.now.learning.map((l) => <li key={l.topic}>{l.topic}<span>{l.kind}</span></li>)}</ul></div>
        </section>
        <OffTiles items={about.off} style={{ marginTop: 1, borderTop: 0 }} />
      </div>
    </>
  );
}
