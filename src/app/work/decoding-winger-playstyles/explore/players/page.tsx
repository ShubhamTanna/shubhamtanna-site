import PlayerSearch from "@/components/winger/PlayerSearch";
import { getCatalog, getMeta } from "@/lib/winger";

export const metadata = { title: "Footballers" };

export default function PlayersPage() {
  const m = getMeta();
  const seasons = [...new Set(getCatalog().map((r) => r.season))].sort();
  return (
    <section className="wrap wx-page">
      <div className="wx-pagehead">
        <p className="mono">Footballers</p>
        <h1 className="d">Every winger season, searchable</h1>
        <p>{m.nSpells.toLocaleString("en-US")} spells by {m.nPlayers} footballers. A spell is one player at one club in one season. A transfer can produce two observations if both club spells qualify on their own.</p>
      </div>
      <PlayerSearch archetypes={m.archetypes} leagues={m.leagues} seasons={seasons} />
    </section>
  );
}
