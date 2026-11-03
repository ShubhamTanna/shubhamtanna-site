import { getSite } from "@/lib/content";

export default function Footer() {
  const s = getSite();
  return (
    <footer className="close" id="contact">
      <div className="wrap">
        <h2 className="d">{s.closing}</h2>
        <div className="contacts">
          <a className="btn" href={s.links.resume} target="_blank" rel="noopener">Download resume</a>
          {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          {s.links.linkedin && <a href={s.links.linkedin} target="_blank" rel="me noopener">LinkedIn</a>}
          {s.links.github && <a href={s.links.github} target="_blank" rel="me noopener">GitHub</a>}
        </div>
        <div className="mark d" aria-hidden="true">{s.name}</div>
        <div className="foot mono"><span>{s.location}</span><span>© {s.name}</span></div>
      </div>
    </footer>
  );
}
