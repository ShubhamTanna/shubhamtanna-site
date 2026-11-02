import { getSite } from "@/lib/content";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "Shubham Tanna: consulting, strategy and decision analytics";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const s = getSite();
  return ogImage({ kicker: "Consulting · Strategy · Decision analytics", title: s.positioning, stat: s.proof[0]?.value, statLabel: s.proof[0]?.label });
}
