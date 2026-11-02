import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getChapters, getSite } from "@/lib/content";
import { Jump, Todo } from "@/components/bits";
import StoryIndex from "@/components/StoryIndex";

export const metadata: Metadata = { title: "Story", description: "Build, sell, teach, price, analyse: how I got here, in six chapters." };

export default function StoryPage() {
  const chapters = getChapters();
  const site = getSite();
  const last = chapters.length - 1;
  return (
    <div className="wrap">
      <div className="st-intro">
        <div><span className="mono" style={{ color: "var(--muted)" }}>Story</span><h1>How I got here</h1></div>
        <p>Six chapters, each with the numbers behind it.</p>
      </div>
      <div className="st">
        <StoryIndex items={chapters.map((c) => ({ key: c.key, title: c.title }))} />
        <div>
          {chapters.map((c, i) => (
            <article className="chap" id={c.key} key={c.key}>
              <div className="meta"><span>{String(i + 1).padStart(2, "0")} / 06</span><span className="yr">{c.years}</span></div>
              <div className="spread">
                <div>
                  <h2>{c.title}</h2>
                  <p className="pull">{c.pull}</p>
                  <figure className="cph">
                    <Image className="ph" src={c.photo.src} alt={c.photo.alt} width={1400} height={1050} sizes="(max-width: 900px) 100vw, 480px" />
                    {c.photo.caption && <figcaption>{c.photo.caption}</figcaption>}
                  </figure>
                </div>
                <div className="body">
                  <p>{c.text}</p>
                  {c.long.map((para, k) => <p key={k}>{para}</p>)}
                  {c.long.length === 0 && <Todo>Your longer story for this chapter goes here: two or three paragraphs, in your words.</Todo>}
                </div>
              </div>
              {i === last ? (
                <div className="proofrow cta"><a className="ptile" href="#contact"><div><b>Open to work</b><p className="what" style={{ margin: "8px 0 0" }}>{site.lookingFor}.</p></div><span className="act">Let&apos;s talk →</span></a></div>
              ) : (
                <div className="proofrow">
                  {c.proof.map((t) => {
                    const inner = <><b className={t.value.length > 9 ? "long" : undefined}>{t.value}</b><span className="what">{t.what}</span><span className="src"><span>{t.source}</span>{t.href && <span>→</span>}</span></>;
                    return t.href ? <Link key={t.value} className="ptile" href={t.href}>{inner}</Link> : <div key={t.value} className="ptile">{inner}</div>;
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
      <Jump href="/work" label="The work →" />
    </div>
  );
}
