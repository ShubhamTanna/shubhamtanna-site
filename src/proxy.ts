import { NextResponse, type NextRequest } from "next/server";
import index from "./generated/route-index.json";

// Real 404 status for unknown project and footballer addresses. Pages stream, and once streaming starts the
// status is fixed at 200, so the check has to happen here, before rendering. The slug lists come from
// scripts/route-index.mjs at build time.
const work = new Set(index.work), players = new Set(index.players);
const EXPLORER = "/work/decoding-winger-playstyles";

export function proxy(req: NextRequest) {
  const parts = req.nextUrl.pathname.split("/").filter(Boolean);
  const slug = decodeURIComponent(parts[parts.length - 1] ?? "");
  const known = req.nextUrl.pathname.startsWith(`${EXPLORER}/explore/players/`) ? players.has(slug) : slug === EXPLORER.split("/")[2] || work.has(slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL("/not-found-page", req.url), { status: 404 });
}

export const config = { matcher: ["/work/:slug", "/work/decoding-winger-playstyles/explore/players/:slug"] };
