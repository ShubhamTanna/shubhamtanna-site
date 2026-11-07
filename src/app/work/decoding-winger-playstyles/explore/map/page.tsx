import MapView from "@/components/winger/MapView";
import { getMeta } from "@/lib/winger";

export const metadata = { title: "Style map" };

export default function MapPage() {
  return (
    <section className="wrap wx-page">
      <div className="wx-pagehead">
        <p className="mono">Map</p>
        <h1 className="d">All 1,396 seasons on one map</h1>
        <p>Each dot is one spell, placed by its two strongest patterns of variation and coloured by its closest style.</p>
      </div>
      <MapView meta={getMeta()} />
    </section>
  );
}
