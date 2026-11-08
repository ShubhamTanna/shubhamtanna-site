import type { Metadata } from "next";
import Link from "next/link";
import "./explorer.css";
import { SelectionProvider } from "@/components/winger/Selection";
import ExplorerNav from "@/components/winger/ExplorerNav";
import FocusBar from "@/components/winger/FocusBar";
import { BASE, EXPLORE, getMeta } from "@/lib/winger";

// Not indexed until the coordinated launch.
export const metadata: Metadata = {
  title: { default: "Winger Style Explorer", template: "%s · Winger Style Explorer" },
  description: "Explore five attacking styles across 1,396 qualifying winger spells (player, club, season) from Europe’s top five leagues, 2017–18 to 2023–24.",
};

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  const m = getMeta();
  return (
    <SelectionProvider>
      <div className="wx">
        <header className="wx-bar">
          <div className="wrap">
            <Link className="wx-brand" href={EXPLORE}>
              <span className="wx-stripes" aria-hidden="true">{m.archetypes.map((a) => <i key={a.id} style={{ background: a.color }} />)}</span>
              <span>Winger Style Explorer</span>
            </Link>
            <ExplorerNav />
          </div>
        </header>
        <FocusBar archetypes={m.archetypes} />
        {children}
        <footer className="wx-foot">
          <div className="wrap">
            <p>{m.nSpells.toLocaleString("en-US")} player-club-seasons · {m.nPlayers} footballers · {m.leagues.length} leagues · {m.seasons[0].replace("-", "–")} to {m.seasons[1].replace("-", "–")} · at least {m.minimumMinutes.toLocaleString("en-US")} minutes each</p>
            <p>Styles describe how a winger attacked, not how well. <Link href={BASE}>How this was built →</Link></p>
            <p className="wx-ver">Data {m.dataVersion} · schema {m.schemaVersion} · FBref data via Kaggle</p>
          </div>
        </footer>
      </div>
    </SelectionProvider>
  );
}
