import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";

const root = path.join(process.cwd(), "content");
const read = (p: string) => YAML.parse(fs.readFileSync(path.join(root, p), "utf8"));
const parse = <T extends z.ZodTypeAny>(schema: T, file: string): z.infer<T> => {
  const r = schema.safeParse(read(file));
  if (!r.success) throw new Error(`content/${file}:\n${z.prettifyError(r.error)}`);
  return r.data;
};

const Photo = z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() });
const Stat = z.object({ value: z.string(), label: z.string() });
const Table = z.object({ caption: z.string(), columns: z.array(z.string()), rows: z.array(z.array(z.string())), source: z.string().optional() })
  .refine((t) => t.rows.every((r) => r.length === t.columns.length), { message: "a table row has a different number of cells than the columns (a comma inside [ ] splits a cell: quote it)" });
const Link = z.object({ label: z.string(), href: z.string() });

// A chart reads a CSV that sits next to the project file: content/projects/<slug>/<file>.
// Columns are named in the chart spec, so the CSV can carry extra columns.
const Series = z.object({ col: z.string(), label: z.string() });
const base = { file: z.string(), title: z.string(), note: z.string().optional(), unit: z.string().default("") };
const Chart = z.discriminatedUnion("kind", [
  // Horizontal bars. `value`, or `low` + `high` for a range like "4–5". `detail` is a template such as "{effort_low} {effort_measure}".
  z.object({ kind: z.literal("bar"), ...base, label: z.string(), labelSuffix: z.string().optional(), value: z.string().optional(), low: z.string().optional(), high: z.string().optional(), detail: z.string().optional(), highlight: z.string().optional(), highlightCol: z.string().optional(), highlightWhen: z.string().optional() }),
  z.object({ kind: z.literal("range"), ...base, label: z.string(), low: z.string(), high: z.string(), detail: z.string().optional() }),
  // Bridge: start total → change per line item → end total. Rows whose typeCol is in `skip` (subtotals, totals) are ignored.
  z.object({ kind: z.literal("bridge"), ...base, label: z.string(), before: z.string(), after: z.string(), startLabel: z.string(), endLabel: z.string(), typeCol: z.string().optional(), skip: z.array(z.string()).default(["subtotal", "total"]) }),
  z.object({ kind: z.literal("waterfall"), ...base, label: z.string(), value: z.string() }),
  z.object({ kind: z.literal("scatter"), ...base, x: z.string(), y: z.string(), group: z.string().optional(), name: z.string().optional(), xLabel: z.string(), yLabel: z.string() }),
  z.object({ kind: z.literal("heatmap"), ...base, row: z.string(), col: z.string(), value: z.string() }),
  // Line on a numeric x axis; one line per series column (wide CSV). First series is the red one.
  z.object({ kind: z.literal("line"), ...base, x: z.string(), xLabel: z.string(), series: z.array(Series).min(1), mark: z.object({ x: z.number(), label: z.string() }).optional() }),
  // Paired bars per row, each row on its own scale (different units allowed). Wide: `series`. Long: `seriesCol` + `value`.
  z.object({ kind: z.literal("paired"), ...base, label: z.string(), series: z.array(Series).optional(), seriesCol: z.string().optional(), value: z.string().optional(), unitCol: z.string().optional(), betterCol: z.string().optional(), highlight: z.string().optional() }),
]);
export type Chart = z.infer<typeof Chart>;

const Lead = z.object({
  kind: z.enum(["image", "video", "chart"]),
  src: z.string().optional(), poster: z.string().optional(), alt: z.string().default(""),
  caption: z.string().optional(), chart: z.number().optional(), // index into charts[] when kind = chart
});

// A story-ordered page. When a project has `sections`, the page shows them in this order instead of the
// default Problem / What I did / In action / Results / Story. Each block is one thing, in reading order.
// chart and table are indexes into charts[] and results[]; screens are file names from screens.csv.
const Block = z.union([
  z.object({ p: z.string() }).strict(),
  z.object({ list: z.array(z.string()) }).strict(),
  z.object({ callout: z.object({ label: z.string(), text: z.string() }) }).strict(),
  z.object({ items: z.array(z.object({ title: z.string(), text: z.string(), tag: z.string().optional() })) }).strict(),
  z.object({ cards: z.array(z.object({ title: z.string(), price: z.string(), lines: z.array(z.string()) })), foot: z.string().optional() }).strict(),
  z.object({ chart: z.number().int() }).strict(),
  z.object({ table: z.number().int() }).strict(),
  z.object({ note: z.string() }).strict(),
  z.object({ screens: z.array(z.string()).min(1) }).strict(),
  z.object({ button: Link }).strict(),
]);
export type Block = z.infer<typeof Block>;
const Section = z.object({ title: z.string(), blocks: z.array(Block).min(1) }).strict();

export const Project = z.object({
  slug: z.string(),
  draft: z.boolean().default(false), // true = built but hidden until ready (shown with SHOW_DRAFTS=1)
  rank: z.number(),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  type: z.enum(["venture", "case", "analytics", "build", "campaign"]),
  // Where it came from. Shown as a badge on every card and page so a reader never mistakes a class project for the business.
  origin: z.enum(["venture", "coursework", "personal"]),
  originNote: z.string().optional(), // short, e.g. "Semester 7"
  section: z.string(),
  title: z.string(),
  cardTitle: z.string(),
  cardLine: z.string(),
  hero: Stat.extend({}),
  year: z.string(),
  team: z.string(),
  tools: z.array(z.string()),
  stats: z.array(Stat).optional(),
  context: z.string().optional(),
  answer: z.string().optional(),
  problem: z.string().optional(), // required unless the page uses `sections`
  did: z.array(z.string()).default([]),
  sections: z.array(Section).optional(),
  results: z.array(Table).default([]),
  method: z.string().optional(),
  notes: z.array(z.string()).optional(),
  story: z.object({ title: z.string(), text: z.string() }).optional(),
  skills: z.array(z.string()).default([]),
  links: z.array(Link).default([]), // other files: decks, Figma, papers
  code: z.string().url().optional(), // GitHub repo, or the project's folder in case-studies
  demo: z.string().url().optional(), // live Streamlit app
  lead: Lead.optional(),
  charts: z.array(Chart).default([]),
  // Never rendered. The leak check fails the build if this text appears in the output.
  internal: z.string().optional(),
}).strict();
export type Project = z.infer<typeof Project>;

const Site = z.object({
  name: z.string(), location: z.string(), email: z.string(),
  links: z.object({ linkedin: z.string(), github: z.string(), resume: z.string() }),
  positioning: z.string(), subline: z.string(),
  proof: z.array(Stat),
  heroPhoto: Photo,
  lookingFor: z.string(),
  closing: z.string(),
});
const Chapter = z.object({
  key: z.string(), title: z.string(), years: z.string(), pull: z.string(), text: z.string(),
  long: z.array(z.string()).default([]),
  photo: Photo,
  proof: z.array(z.object({ value: z.string(), what: z.string(), source: z.string(), href: z.string().optional() })),
});
const Experience = z.object({
  photos: z.array(Photo),
  work: z.array(z.object({
    org: z.string(), sub: z.string(), role: z.string(), dates: z.string(), current: z.boolean().default(false),
    line: z.string(), owned: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
    note: z.string().optional(), tools: z.array(z.string()), href: z.string().optional(),
  })),
  leadership: z.array(z.object({ dates: z.string(), role: z.string(), org: z.string(), line: z.string() })),
});
const Stage = z.enum(["Idea", "Building", "Testing", "Live"]);
/** Now items still being worked on (Live ones are shipped and stay listed as proof, not as in-progress work). */
export const inProgress = <T extends { stage: string }>(items: T[]) => items.filter((b) => b.stage !== "Live");
const About = z.object({
  photo: Photo, lede: z.string(), body: z.array(z.string()), whyConsulting: z.string().default(""),
  facts: z.array(z.object({ label: z.string(), value: z.string() })),
  off: z.array(z.object({ title: z.string(), text: z.string(), photo: z.string() })),
  now: z.object({
    updated: z.string().regex(/^\d{4}-\d{2}$/),
    building: z.array(z.object({ name: z.string(), stage: Stage, tech: z.string(), line: z.string(), doneWhen: z.string() })),
    learning: z.array(z.object({ kind: z.string(), topic: z.string(), detail: z.string() })),
    log: z.array(z.object({ date: z.string(), text: z.string() })),
  }),
});

export const STAGES = Stage.options;

export function getProjects(): Project[] {
  const dir = path.join(root, "projects");
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => checkProject(parse(Project, `projects/${f}`), f))
    .sort((a, b) => a.rank - b.rank);
}
/** Rules the schema can't express: a default page needs problem + did; section blocks must point at real charts and tables. */
function checkProject(p: Project, f: string): Project {
  const bad = (m: string) => { throw new Error(`content/projects/${f}: ${m}`); };
  if (!p.sections) {
    if (!p.problem || !p.did.length) bad("needs `problem` and `did` (or `sections`)");
    return p;
  }
  for (const s of p.sections) for (const b of s.blocks) {
    if ("chart" in b && !p.charts[b.chart]) bad(`section "${s.title}": chart ${b.chart} doesn't exist (charts are numbered from 0)`);
    if ("table" in b && !p.results[b.table]) bad(`section "${s.title}": table ${b.table} doesn't exist (results are numbered from 0)`);
  }
  return p;
}
/** The only project fields that may reach the browser (client components). Never pass a whole Project. */
export type CardData = Pick<Project, "slug" | "type" | "origin" | "originNote" | "section" | "cardTitle" | "cardLine" | "hero" | "year" | "team" | "tools">;
export const toCard = ({ slug, type, origin, originNote, section, cardTitle, cardLine, hero, year, team, tools }: Project): CardData =>
  ({ slug, type, origin, originNote, section, cardTitle, cardLine, hero, year, team, tools });
export { originLabel } from "./origin";
const showDrafts = () => !!process.env.SHOW_DRAFTS;
export const getPagedProjects = () => getProjects().filter((p) => p.tier < 3 && (!p.draft || showDrafts()));
export const getProject = (slug: string) => getPagedProjects().find((p) => p.slug === slug);
/** Projects with their own page under src/app/work/<slug>/ (not rendered by /work/[slug]). */
export const CUSTOM_PAGES = new Set(["decoding-winger-playstyles"]);
export const getSite = () => parse(Site, "site.yaml");
export const getChapters = () => parse(z.object({ chapters: z.array(Chapter).length(6) }), "story.yaml").chapters;
export const getExperience = () => parse(Experience, "experience.yaml");
export const getAbout = () => parse(About, "about.yaml");

/** Consulting side = case studies and campaigns; analytics side = models and builds. */
export const side = (p: Project) => (p.type === "venture" || p.type === "case" || p.type === "campaign" ? "consulting" : "analytics");

export const monthName = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${y}`;
};

/** Reads a chart's CSV from content/projects/<slug>/<file>. Returns [] if the file isn't there yet. */
export function readCsv(slug: string, file: string): Record<string, string>[] {
  const p = path.join(root, "projects", slug, file);
  if (!fs.existsSync(p)) return [];
  const [head, ...lines] = fs.readFileSync(p, "utf8").replace(/^﻿/, "").trim().split(/\r?\n/).map(splitCsvLine);
  return lines.filter((l) => l.some(Boolean)).map((l) => Object.fromEntries(head.map((h, i) => [h.trim(), (l[i] ?? "").trim()])));
}
function splitCsvLine(line: string): string[] {
  const out: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur); return out;
}

/**
 * Screenshots and short clips for a project page. The project repo's portfolio/screens/ folder is copied to
 * public/work/<slug>/screens/ and its screens.csv (file, alt, caption) to content/projects/<slug>/ by the import.
 * Rows whose file is missing are skipped, so a half-finished import never shows a broken image.
 */
export type Screen = { src: string; alt: string; caption: string; video: boolean; poster?: string; phone: boolean };
export function readScreens(slug: string): Screen[] {
  const pub = path.join(process.cwd(), "public", "work", slug, "screens");
  return readCsv(slug, "screens.csv")
    .filter((r) => r.file && r.alt && fs.existsSync(path.join(pub, r.file)))
    .map((r) => {
      const video = /\.mp4$/i.test(r.file);
      const posterFile = r.file.replace(/\.mp4$/i, ".jpg");
      return {
        src: `/work/${slug}/screens/${r.file}`, alt: r.alt, caption: r.caption ?? "", video, phone: r.size === "phone",
        poster: video && fs.existsSync(path.join(pub, posterFile)) ? `/work/${slug}/screens/${posterFile}` : undefined,
      };
    });
}
