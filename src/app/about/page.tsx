import type { Metadata } from "next";
import Image from "next/image";
import { getAbout, getSite, monthName, STAGES } from "@/lib/content";
import { SecHead, Todo } from "@/components/bits";
import { OffTiles } from "@/components/Off";

export const metadata: Metadata = { title: "About", description: "Who I am, what I'm building right now, and what I do off the clock." };

export default function AboutPage() {
  const a = getAbout();
  const site = getSite();
  return (
    <div className="wrap">
      <div className="ab-intro">
        <figure className="abph"><Image className="ph" src={a.photo.src} alt={a.photo.alt} width={1000} height={1250} sizes="(max-width: 820px) 340px, 460px" /></figure>
        <div>
          <span className="mono" style={{ color: "var(--muted)" }}>About</span>
          <h1 className="d">Hi, I&apos;m Shubham.</h1>
          <p className="lede">{a.lede}</p>
          {a.body.map((p, i) => <p key={i}>{p}</p>)}
          {a.whyConsulting ? <p>{a.whyConsulting}</p> : <Todo>Your words: why consulting, in two or three lines.</Todo>}
          <div className="abfacts">{a.facts.map((f) => <div key={f.label}><span>{f.label}</span><p>{f.value}</p></div>)}</div>
        </div>
      </div>

      <SecHead eyebrow="Off the clock" title="Outside work." />
      <OffTiles items={a.off} />

      <SecHead id="now" eyebrow="Currently" title="What I'm building right now." />
      <div className="statusbar">
        <div><span>Looking for</span><p>{site.lookingFor}</p></div>
        <div><span>Based in</span><p>{site.location.split(",")[0]}</p></div>
        <div><span>In progress</span><p>{a.now.building.length} projects</p></div>
        <div><span>Updated</span><p>{monthName(a.now.updated)}</p></div>
      </div>
      <div className="nowcards" style={{ marginTop: 24 }}>
        {a.now.building.map((b) => {
          const k = STAGES.indexOf(b.stage);
          return (
            <div key={b.name}>
              <h3 className="d">{b.name}</h3>
              <p>{b.line}</p>
              <div className="track">{STAGES.map((s, j) => <i key={s} className={j <= k ? "on" : undefined} />)}</div>
              <div className="tracklbl">{STAGES.map((s, j) => (j === k ? <b key={s}>{s}</b> : <span key={s}>{s}</span>))}</div>
              <span className="mono" style={{ color: "var(--night-muted)" }}>{b.tech}</span>
              <p className="done"><span>Done when</span>{b.doneWhen}</p>
            </div>
          );
        })}
      </div>

      <SecHead eyebrow="Learning" title="Outside work, I'm learning." />
      <div className="learn">
        {a.now.learning.map((l) => (
          <div key={l.topic}><span className="kind">{l.kind}</span><h3>{l.topic}</h3>{l.detail ? <p>{l.detail}</p> : <Todo>Add the detail.</Todo>}</div>
        ))}
      </div>

      <SecHead eyebrow="Log" title="Recently." />
      <ol className="log">{a.now.log.map((l) => <li key={l.date + l.text}><time>{l.date}</time><p>{l.text}</p></li>)}</ol>
    </div>
  );
}
