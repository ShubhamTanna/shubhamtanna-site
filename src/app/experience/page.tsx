import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getExperience, getSite } from "@/lib/content";
import { Jump } from "@/components/bits";

export const metadata: Metadata = { title: "Experience", description: "Where I've worked, what I owned, and what came of it." };

export default function ExperiencePage() {
  const xp = getExperience();
  const site = getSite();
  return (
    <div className="wrap">
      <div className="pagehead"><h1 className="d">Experience</h1><p>Where I&apos;ve worked, what I owned, and what came of it.</p></div>
      <div className="xstrip">
        {xp.photos.map((p, i) => (
          <figure key={p.src}>
            <Image className="ph" src={p.src} alt={p.alt} width={1200} height={900} sizes={i === 0 ? "(max-width: 760px) 100vw, 480px" : "(max-width: 760px) 50vw, 380px"} />
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="xjump">
        <a href="#work">Work <sup>{xp.work.length}</sup></a>
        <a href="#leadership">Leadership <sup>{xp.leadership.length}</sup></a>
        <a href={site.links.resume}>Full resume →</a>
      </div>
      <div id="work" className="xgroup">
        <h2 className="mono">Work</h2>
        {xp.work.map((x) => (
          <article className="xrole" key={x.org + x.dates}>
            <div className="when"><span className="org">{x.org}</span><span className="sub">{x.sub}</span><time>{x.dates}</time>{x.current && <span className="now">Current</span>}</div>
            <div>
              <h3>{x.role}</h3>
              <p className="line">{x.line}</p>
              {x.owned && <div className="owned">{x.owned.map((o) => <div key={o.title}><b>{o.title}</b><p>{o.text}</p></div>)}</div>}
              {x.note && <p className="note">{x.note}</p>}
              <div className="chips">{x.tools.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              {x.href && <Link className="more-link case" href={x.href}>Read the case study →</Link>}
            </div>
          </article>
        ))}
      </div>
      <div id="leadership" className="xgroup">
        <h2 className="mono">Leadership and volunteering</h2>
        {xp.leadership.map((l) => (
          <div className="exprow" key={l.org + l.dates}><time>{l.dates}</time><div><b>{l.role}</b><span className="org">{l.org}</span><p>{l.line}</p></div><span className="go" /></div>
        ))}
      </div>
      <Jump href="/about" label="About me →" />
    </div>
  );
}
