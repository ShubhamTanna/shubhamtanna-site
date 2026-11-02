# Design rules

The locked design (prototype v13, Nov 2026). Change these rules deliberately, not page by page.

## Palette: paper, ink, one red

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#e8e7e2` | Page background |
| `--panel` | `#dfded8` | Tiles, glance strips, the Work band |
| `--ink` | `#121211` | Text, rules, buttons on paper |
| `--muted` | `#5d5b56` | Secondary text |
| `--rule` | `#c7c5bd` | Hairlines between cells |
| `--night` | `#151515` | Dark bands: story scene, project title band, Now, footer |
| `--accent` | `#ff0000` | The one red: big numbers, the CTA, the thing to look at |
| `--accent-text` | `#c8141a` | Small red text on paper (pure red fails contrast at small sizes) |
| `--on-accent` | `#121211` | Text on red. Never white: white on #ff0000 fails contrast. |

**Red is for one thing per view.** A chart has one red series; a page has one red number in its title band.

## Type

- **Display:** Playfair Display 900 (700 for sub-heads and pull quotes). Statements, headlines, big numbers. Lining figures always.
- **Body:** Newsreader (variable, optical sizes). 18px base, 1.6 line height.
- **Labels:** JetBrains Mono 400–600. Eyebrows, metadata, chart axes. Never body copy. 11px minimum.

Fonts are self-hosted from `@fontsource` (no Google Fonts request at runtime).

## Layout

- Max width 1280px; side gutter `max(20px, safe-area)`.
- Section head = eyebrow (red square + mono label) + serif h2, a 1.5px ink rule above.
- Grids use 1px gaps on a `--rule` background, so cells read as a table.
- Every page ends with a "Next" jump to the next page in the story: Home → Story → Work → Experience → About.

## Motion

Two signature interactions only: the pinned story scene on Home and the Consulting / Analytics tabs. Everything else is a 0.15–0.2s hover. Reduced-motion users and short screens (under 520px tall) get the story as a static list.

## Photos

Real moments, colour, graded warm (R×1.03, B×0.97, saturation 0.9, contrast 1.08). 4:5 for portraits, 4:3 for chapter and Off-the-clock photos. Served through `next/image` (AVIF/WebP, sized per screen).

## Charts

Drawn natively from CSV (`src/components/Charts.tsx`), never as images. Ink and greys for context, red for the one series that matters. Titles state the finding, not the topic. Kinds: bar, range, bridge, waterfall, scatter, heatmap, line.

## Copy

Short sentences, numbers first, no adjectives where a number fits. Every number on the site traces to a `facts.md` or the project YAML.

## Checks before any deploy

`npm run build` (fails on leaked internal notes) and `npm run qa` (8 screen sizes: no sideways scroll, tap targets ≥ 24px, no text under 11px, no console errors, no broken links).
