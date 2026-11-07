import MapView from "@/components/winger/MapView";
import { getMeta } from "@/lib/winger";

export const metadata = { title: "Style map" };

export default function MapPage() {
  return (
    <section className="wrap wx-page">
      <div className="wx-pagehead">
        <p className="mono">Map</p>
        <h1 className="d">All 1,396 seasons on one map</h1>
        <p>Every winger season from 2017 to 2024 on one picture. Seasons that played alike sit together, so you can see where each style lives, where styles overlap, and which footballers sit between them.</p>
      </div>
      <MapView meta={getMeta()} />
    </section>
  );
}
