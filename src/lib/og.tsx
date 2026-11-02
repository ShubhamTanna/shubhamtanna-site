import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };
const f = (p: string) => readFile(join(process.cwd(), "node_modules", p));

/** The link-preview card: paper background, big serif line, one red number. */
// The bundled fonts have no arrow glyph, so arrows become words in the preview image.
const clean = (t?: string) => t?.replace(/\s*→\s*/g, " to ");

export async function ogImage(input: { kicker: string; title: string; stat?: string; statLabel?: string }) {
  const kicker = clean(input.kicker)!, title = clean(input.title)!, stat = clean(input.stat), statLabel = clean(input.statLabel);
  const [display, displayExt, mono] = await Promise.all([
    f("@fontsource/playfair-display/files/playfair-display-latin-900-normal.woff"),
    f("@fontsource/playfair-display/files/playfair-display-latin-ext-900-normal.woff"),
    f("@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#e8e7e2", color: "#121211", padding: "56px 64px", borderLeft: "24px solid #ff0000" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mono, DisplayExt", fontSize: 24, letterSpacing: 2, textTransform: "uppercase", color: "#5d5b56" }}>
          <span>{kicker}</span><span>shubhamtanna.in</span>
        </div>
        <div style={{ display: "flex", fontFamily: "Display, DisplayExt", fontSize: title.length > 60 ? 64 : 80, lineHeight: 1.02, letterSpacing: -1 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderTop: "3px solid #121211", paddingTop: 22 }}>
          <div style={{ display: "flex", fontFamily: "Display, DisplayExt", fontSize: 40 }}>Shubham Tanna</div>
          {stat ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontFamily: "Display, DisplayExt", fontSize: 64, color: "#ff0000", lineHeight: 1 }}>{stat}</span>
              {statLabel && <span style={{ fontFamily: "Mono, DisplayExt", fontSize: 20, color: "#5d5b56", marginTop: 6 }}>{statLabel}</span>}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Display", data: display, weight: 900, style: "normal" }, { name: "DisplayExt", data: displayExt, weight: 900, style: "normal" }, { name: "Mono", data: mono, weight: 500, style: "normal" }] },
  );
}
