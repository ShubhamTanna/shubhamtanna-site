import type { Metadata } from "next";
import Link from "next/link";
import { EXPLORE, getMeta } from "@/lib/winger";

// Case study shell. Content is written after the explorer's structure settles. Not indexed until launch.
export const metadata: Metadata = { title: "Decoding winger playstyles", robots: { index: false, follow: false } };

export default function CaseStudy() {
  const m = getMeta();
  return (
    <article className="page-project">
      <header className="cband"><div className="wrap">
        <Link className="back" href="/work">← All work</Link>
        <div className="grid2">
          <div><span className="kicker">Analytics &amp; ML · 2026 · Personal project</span><h1>Decoding winger playstyles</h1></div>
          <div className="hero"><b>{m.archetypes.length}</b><span>attacking styles from {m.nSpells.toLocaleString("en-US")} player–club–season spells</span></div>
        </div>
      </div></header>
      <section className="wrap">
        <div className="head"><h2 className="d">Case study in progress</h2></div>
        <p>The write-up lands with the explorer. Until then, <Link href={EXPLORE} style={{ display: "inline-block", paddingBlock: 4 }}>open the Winger Style Explorer →</Link></p>
      </section>
    </article>
  );
}
