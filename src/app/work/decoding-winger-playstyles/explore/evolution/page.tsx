import EvolutionView from "@/components/winger/EvolutionView";
import { getCatalog, getMeta } from "@/lib/winger";
import { season } from "@/lib/winger-format";

export const metadata = { title: "Evolution" };

// Main view: one footballer across seasons. Secondary: how the mix of styles changed across all wingers.
export default function EvolutionPage() {
  const m = getMeta();
  const rows = getCatalog();
  const seasons = [...new Set(rows.map((r) => r.season))].sort();
  const share = seasons.map((s) => {
    const inS = rows.filter((r) => r.season === s);
    return { s, n: inS.length, by: m.archetypes.map((a) => inS.filter((r) => r.cluster === a.id).length) };
  });
  return (
    <>
      <section className="wrap wx-page">
        <div className="wx-pagehead">
          <p className="mono">Evolution</p>
          <h1 className="d">How a footballer’s style changed</h1>
          <p>Follow one winger through every club spell that met the 1,125-minute bar on its own: the style centre each spell sat nearest, how far it was from every centre, its path across the style map, and the largest measured differences between any two spells.</p>
        </div>
        <EvolutionView meta={m} />
      </section>

      <section className="wrap wx-page" id="all-wingers">
        <div className="head"><h2 className="d">Across all wingers</h2>
          <p className="wx-note">Share of each season’s winger spells closest to each style. Counts depend on who met the minutes bar that season, so read small moves cautiously.</p>
        </div>
        <div className="wx-evo" role="table" aria-label="Style share by season">
          {share.map(({ s, n, by }) => (
            <div key={s} className="row" role="row">
              <span className="mono" role="rowheader">{season(s)} <small>{n}</small></span>
              <span className="stack" role="cell" aria-label={m.archetypes.map((a, i) => `${a.code} ${Math.round((by[i] / n) * 100)}%`).join(", ")}>
                {by.map((c, i) => <i key={i} style={{ width: `${(c / n) * 100}%`, background: m.archetypes[i].color }} title={`${m.archetypes[i].code} ${m.archetypes[i].label}: ${c} of ${n}`} />)}
              </span>
            </div>
          ))}
        </div>
        <div className="wx-evo-key mono">{m.archetypes.map((a) => <span key={a.id}><i style={{ background: a.color }} />{a.code} {a.label}</span>)}</div>
      </section>
    </>
  );
}
