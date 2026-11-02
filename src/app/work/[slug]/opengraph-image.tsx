import { getPagedProjects, getProject } from "@/lib/content";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "Project by Shubham Tanna";
export const size = ogSize;
export const contentType = "image/png";
export function generateStaticParams() { return getPagedProjects().map((p) => ({ slug: p.slug })); }

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug)!;
  return ogImage({ kicker: p.section, title: p.cardTitle, stat: p.hero.value, statLabel: p.hero.label });
}
