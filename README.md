# shubhamtanna.in

Personal site of Shubham Tanna: consulting, strategy and decision analytics. Next.js on Vercel.

## Editing the words (no code needed)

All text lives in `content/`. Edit a file on GitHub, commit, and Vercel redeploys in about a minute.

| File | What's in it |
| --- | --- |
| `content/site.yaml` | Headline, subline, the three hero numbers, email, LinkedIn, GitHub |
| `content/story.yaml` | The six chapters: short text, longer story (`long`), pull quote, photo, proof tiles |
| `content/experience.yaml` | Work roles and leadership |
| `content/about.yaml` | Intro, why consulting, Off the clock, and the monthly **Now** section |
| `content/projects/<slug>.yaml` | One file per project. `tier: 1` full page, `2` short page, `3` one line in Smaller builds |
| `content/projects/<slug>/` | That project's chart CSVs and `facts.md` |

Private credibility notes live in `content/private/internal-notes.yaml`, which is gitignored and never published. When it is present, the build fails if any of its text appears on the site. Each project's `facts.md` (copied from its repo, also gitignored here) is the source for every number.

## Adding a project's outputs

From a project repo that follows the portfolio layout (`portfolio/facts.md`, `chart-*.csv`, `table.csv`, `lead.*`, `files/`):

```
npm run import -- ../repo-name <slug>
npm run import -- ../case-studies tata-motors --sub tata-motors
```

It copies the files, wires the charts, and lists any CSV column the chart needs but can't find.

## Commands

```
npm run dev      # local preview at localhost:3000
npm run build    # production build + leak check
npm start        # serve the build
npm run qa       # 8-size check against a running server (QA_URL to point at a Vercel preview)
```

Design rules: [DESIGN.md](DESIGN.md).
