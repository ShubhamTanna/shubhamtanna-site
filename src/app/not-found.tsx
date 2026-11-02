import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="pagehead">
        <span className="mono" style={{ color: "var(--muted)" }}>404</span>
        <h1 className="d">Nothing here.</h1>
        <p>The page you wanted doesn&apos;t exist, or it moved.</p>
      </div>
      <p style={{ display: "flex", gap: 24, flexWrap: "wrap" }}><Link className="more-link" href="/">Home →</Link><Link className="more-link" href="/work">The work →</Link></p>
    </div>
  );
}
