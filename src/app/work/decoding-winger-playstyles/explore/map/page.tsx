import MapView from "@/components/winger/MapView";
import { getMeta } from "@/lib/winger";

export const metadata = { title: "Style map" };

export default function MapPage() {
  return (
    <section className="wrap wx-page">
      <div className="wx-pagehead">
        <p className="mono">Map</p>
        <h1 className="d">All 1,396 spells on one map</h1>
        <p>All 1,396 qualifying spells from 2017–18 to 2023–24 on one picture, placed by the directions in which wingers differ most. You can see where each style gathers, where styles overlap, and which spells sit between them.</p>
      </div>
      <MapView meta={getMeta()} />
    </section>
  );
}
