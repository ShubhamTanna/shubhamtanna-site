import CompareView from "@/components/winger/CompareView";
import { getMeta } from "@/lib/winger";

export const metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <section className="wrap wx-page">
      <div className="wx-pagehead">
        <p className="mono">Compare</p>
        <h1 className="d">Two seasons, side by side</h1>
        <p>Pick any two spells. The comparison shows how far apart their styles are and which behaviours drive the gap.</p>
      </div>
      <CompareView meta={getMeta()} />
    </section>
  );
}
