# Editing shubhamtanna.in

How to change any text, photo or file on the site, and get it live. No coding needed for 95% of changes.

**The short version:** open the file on GitHub → click the pencil → change the words → **Commit changes**. Vercel puts it live in about 1–2 minutes. If you break something, the live site stays on the last good version and Vercel tells you what's wrong.

---

## 1. Where every piece of text lives

All the words are in the `content/` folder of the repo: https://github.com/ShubhamTanna/shubhamtanna-site/tree/main/content

| On the site | File | Field |
| --- | --- | --- |
| **Home**: big headline ("Most graduates have case studies…") | `content/site.yaml` | `positioning` |
| Home: line under the headline | `content/site.yaml` | `subline` |
| Home: the three numbers (14 / ~₹2.6L / ₹0) | `content/site.yaml` | `proof` (each has `value` and `label`) |
| Home: hero photo | `content/site.yaml` | `heroPhoto` |
| "Looking for" line (Home, Story, About) | `content/site.yaml` | `lookingFor` |
| Dark footer headline ("Hiring for consulting…") | `content/site.yaml` | `closing` |
| Email, LinkedIn, GitHub, resume link | `content/site.yaml` | `email`, `links` |
| **Story** page and the home scroll story: six chapters | `content/story.yaml` | one block per chapter (see 1a) |
| **Experience** page: jobs | `content/experience.yaml` | `work` |
| Experience: leadership and volunteering | `content/experience.yaml` | `leadership` |
| Experience: photo strip at the top | `content/experience.yaml` | `photos` |
| **About** page: intro paragraph | `content/about.yaml` | `lede` |
| About: longer paragraphs | `content/about.yaml` | `body` |
| About: why consulting | `content/about.yaml` | `whyConsulting` |
| About: Education / Based in / Languages / Tools | `content/about.yaml` | `facts` |
| About: Off the clock (Football, Motorcycles, Cats) | `content/about.yaml` | `off` |
| About: **Now** section (building, learning, log) | `content/about.yaml` | `now` (see section 5) |
| **Work** cards and **every project page** | `content/projects/<project>.yaml` | one file per project (see 1b) |

### 1a. A story chapter (`content/story.yaml`)

```yaml
  - key: price                 # don't change: it's the page anchor (#price)
    title: Price               # the chapter word
    years: 2025–now
    pull: Every price is a decision someone will push back on.   # big quote
    text: Short version, shown on the home page scroll story.
    long:                      # the full story, one line per paragraph
      - First paragraph.
      - Second paragraph.
    photo:
      src: /img/price.jpg
      alt: What the photo shows, for screen readers
      caption: "Pricing in public: the Code1o1 stall"
    proof:                     # the number tiles under the chapter
      - value: ~₹18,600
        what: revenue per client
        source: Code1o1
        href: /work/code1o1    # optional: makes the tile a link
```

There must always be exactly **6 chapters**. The build fails with 5 or 7.

### 1b. A project (`content/projects/<project>.yaml`)

The file names: `code1o1`, `aur-sunao`, `tata-motors`, `adani-vs-reliance`, `player-detection`, `epl-transfer-value`, `getawayguru`, `esg-sentiment`, `research-buddy`, `linkup`, `hope-for-recovery`, `compiler-lab` (Shift-reduce), `autobot`, `breakout`, `winger-classification`.

| Field | Where it shows |
| --- | --- |
| `cardTitle`, `cardLine` | The card on Home and Work |
| `hero` (`value`, `label`) | The big number on the card |
| `title` | Project page heading |
| `context` | Small line under the heading (course, semester, team) |
| `answer` | The bold "answer first" paragraph at the top |
| `stats` | Number row near the top |
| `problem` | "The problem" |
| `did` | "What I did" (one line per bullet) |
| `results` | Tables (`caption`, `columns`, `rows`, optional `source`) |
| `method`, `notes` | Method paragraph and the "Assumptions." notes |
| `story` | The short story box |
| `skills`, `tools` | Tags |
| `code` | **Code on GitHub** button (repo or case-studies folder) |
| `demo` | **Live demo** button |
| `links` | Other files (decks, PDFs, Figma) |
| `charts` | Chart titles and notes. The numbers come from the CSVs, not from here |
| `tier` | `1` full page, `2` short page, `3` one line in "Smaller builds" |
| `rank` | Order on the Work page (1 = first) |
| `draft: true` | Hidden from the live site (winger project until it's ready) |

### 1c. Text that lives in code (rarely changes)

Headings that are the same on every page, like "The problem", "What I did", "Smaller builds", "Hire me", "Download resume", the "Next" box labels and the demo button text, are in `src/app/…/page.tsx` and `src/components/`. To change one: search the repo for the exact words (press `/` on GitHub, or use the search box at the top of the repo), open the `.tsx` file, change **only the words between `>` and `<`**, and commit. Don't touch anything else on that line. If unsure, ask Claude.

Browser tab titles and link-preview descriptions come from the same YAML fields above (`subline`, `title`, `cardLine`), so they update on their own.

---

## 2. How to edit (pick one)

### Method A: GitHub website. Best for one quick change, works on your phone

1. Go to https://github.com/ShubhamTanna/shubhamtanna-site and open `content/`, then the file.
2. Click the **pencil icon** (top right of the file). On the phone: the `…` menu → **Edit file**.
3. Change the words. Keep the indentation (the spaces at the start of lines) exactly as it was.
4. Click **Commit changes…** (green button). Write a short message like `Story: reword Price chapter`. Leave **Commit directly to the main branch** selected. Click **Commit changes**.
5. Wait 1–2 minutes, then refresh https://shubhamtanna.in.

### Method B: github.dev. Best for many changes across several files (laptop)

1. On the repo page, press the **`.`** key (full stop). A VS Code editor opens in the browser.
2. Open and edit as many files as you like (left sidebar → `content/`).
3. Click the **Source Control** icon (third icon on the left, it shows a number). Type a message, click **Commit & Push**.
4. One deploy covers all the changes.

### Method C: on your laptop, with a preview before it goes live (optional)

Only if you want to see changes before publishing. One-time setup: install Node 22 and Git, then:

```bash
git clone https://github.com/ShubhamTanna/shubhamtanna-site.git
cd shubhamtanna-site
npm ci
npm run dev        # open http://localhost:3000, it refreshes as you save
```

When happy: `git add -A && git commit -m "your message" && git push`.

---

## 3. YAML rules (the format the content files use)

YAML is just `field: value`, with indentation showing what belongs to what. Five rules cover nearly every mistake:

1. **Indent with spaces, never tabs.** Two spaces per level. Copy the indentation of the line above.
2. **A list item starts with `- `** (dash, space). Each item lines up with the others.
3. **Wrap the text in double quotes if it contains `: ` (colon then space), or starts with a symbol** like `#`, `-`, `*`, `[`, `{`, `>`, `|`, `@`, `` ` ``, `%`, `!`, `&` or `?`.
   - ✅ `caption: "Pricing in public: the Code1o1 stall"`
   - ❌ `caption: Pricing in public: the Code1o1 stall` (build fails: the second colon confuses it)
4. **Inside double quotes, write a straight `"` as `\"`**. Easier: use curly quotes “ ” or single quotes ' inside the text. Apostrophes (I'm, didn't) are fine anywhere.
5. **Numbers that should stay text get quotes:** `value: "14"`, `year: "2025"`. `₹`, `~`, `–` and `→` are all fine as normal characters.

A **long paragraph** stays on one line. That's fine: GitHub wraps it on screen, and so does the site.

Before you commit, compare your edit with the lines around it. If the shape matches, it's almost always right.

---

## 4. Uploading files (photos, resume, PDFs)

Everything the site serves as a file sits in `public/`:

| What | Where | How the site refers to it |
| --- | --- | --- |
| Photos | `public/img/` | `/img/name.jpg` |
| Resume | `public/resume.pdf` | `/resume.pdf` |
| Project media (lead video or image) | `public/work/<project>/` | `/work/<project>/lead.jpg` |

### Replace your resume

1. Name your new file exactly **`resume.pdf`** (lowercase).
2. Go to the `public/` folder on GitHub → **Add file** → **Upload files** → drag it in.
3. GitHub replaces the old one because the name matches. Commit.
4. Every "Download resume" and "Resume" button now gets the new file. Nothing else to change.

### Replace a photo (same slot)

Upload a new file with the **same name** into `public/img/` (e.g. `price.jpg`). It replaces the old one. Commit.

### Add a new photo

1. Prepare it: JPG, about **1600 px on the long side, under 500 KB** (https://squoosh.app does this in the browser). Name it in lowercase, no spaces: `yocket-team.jpg`.
2. `public/img/` → **Add file** → **Upload files** → commit.
3. Point a YAML field at it, e.g. in `experience.yaml`:
   ```yaml
   photos:
     - src: /img/yocket-team.jpg
       alt: The Yocket sales team in Mumbai
       caption: With the Yocket sales team
   ```
   `alt` is required: describe what's in the photo.

### Delete a file

Open it on GitHub → `…` menu → **Delete file** → commit. First remove every YAML line that points to it, or the image will show as broken.

---

## 5. Recipes for common changes

**Update the Now section (do this monthly, it keeps the site looking alive).** In `content/about.yaml`, under `now:`:

- Change `updated: 2026-11` to the current year and month (`YYYY-MM` format, e.g. `2026-12`).
- Move a project's `stage` along: `Idea` → `Building` → `Testing` → `Live` (only those four words work).
- Add a line at the **top** of `log:`
  ```yaml
    log:
      - date: Dec 2026
        text: What happened, in one line.
  ```
- Fill in the blanks in `learning` (`detail: ""` for the game theory book and the chess opening; put the text between the quotes).

**Change the home page numbers.** `content/site.yaml` → `proof`. Only use a number that is in that project's `facts.md`. If it changes there, change it here and in `story.yaml` / `about.yaml` wherever else it appears (search the repo for the old number).

**Add a job.** Copy an existing block under `work:` in `experience.yaml` (from `- org:` down to just before the next `- org:`), paste it at the top of the list, and edit it. Set `current: true` only on the job you hold now, and set the old one to `false`.

**Change a project's live demo or code link.** That project's YAML → `demo:` or `code:`. The URL must start with `https://`.

**Hide a project without deleting it.** Add `draft: true` to its YAML. Set it to `false` (or delete the line) to bring it back.

**Show the winger project when it's ready.** Its outputs need to be imported first (section 7), then change `draft: true` to `draft: false` in `content/projects/winger-classification.yaml`.

**Reword a chart's title or note.** The project YAML → `charts:` → `title:` / `note:`. The bars themselves come from the CSV and change only when the CSV does.

---

## 6. Deploying: what happens after you commit

You don't deploy by hand. Every commit to `main` makes Vercel build and publish the site.

1. Open https://vercel.com/shubhamtannas-projects/shubhamtanna-site → **Deployments**. The newest one is at the top.
2. **Building** (about a minute) → **Ready** = live on https://shubhamtanna.in.
3. Hard-refresh to see it: Ctrl+Shift+R (Windows), Cmd+Shift+R (Mac). On a phone, close the tab and reopen.

### If the deployment says **Error**

- **The live site is unaffected.** It keeps showing the last good version.
- Click the failed deployment → **Build Logs**. Scroll to the red text. The error names the file and the problem, e.g.
  ```
  content/story.yaml:
  ✖ Invalid input: expected string, received undefined
    → at chapters[3].pull
  ```
  That means: in `story.yaml`, the 4th chapter (counting from 0) is missing `pull`. A `YAMLParseError … line 92` means a formatting slip on that line, usually a missing quote around text containing `: ` or a wrong indent.
- Fix the file on GitHub and commit again. A new deployment starts.
- `Leak check failed` means a private note from `internal-notes.yaml` ended up in public text. Remove that sentence.

### Undo a change

- **Quick:** Vercel → Deployments → the last good one → `…` → **Instant Rollback** (Vercel may label it **Promote to Production**). The site goes back immediately. Then fix the file on GitHub, or your next commit will bring the change back.
- **Proper:** on GitHub, open the file → **History** → open the commit → copy the old text back → commit.

### Link previews (LinkedIn, WhatsApp)

They are cached by those apps for days. To refresh LinkedIn's: https://www.linkedin.com/post-inspector/ → paste your URL → **Inspect**.

---

## 7. Adding or updating a project's charts and numbers

Charts read the CSVs in `content/projects/<project>/`, which come from each project's GitHub repo (`portfolio/` folder). Don't edit those CSVs here: fix them in the project repo, then re-import. This needs Method C (laptop), or ask Claude:

```bash
# from a folder that has the site and the project repos side by side
cd shubhamtanna-site
npm run import -- --all ../          # re-import every project
npm run import -- ../case-studies tata-motors --sub tata-motors   # just one
```

It copies the CSVs and `facts.md`, and lists any chart whose columns don't match. Then commit and push.

---

## 8. Rules that keep the site credible

- **Every number must be in that project's `facts.md`.** If it isn't there, it doesn't go on the site.
- "Paying clients", never "families". Revenue per client is **~₹18,600**.
- **Code1o1** is written with a lowercase `o`. Small captions and labels are shown in capitals by design; the site keeps Code1o1 in its own case automatically. To protect another brand name the same way, add it to the `BRANDS` line in `src/components/bits.tsx`: `/(Code1o1|NewBrand)/`.
- Private notes go only in `content/private/internal-notes.yaml`, which never leaves your laptop. Never put them in a project YAML.
- Monte Carlo stays private until the student's capstone is done.

---

## 9. Getting Claude to do it

For anything bigger (a new page section, a new project, a layout change), open a chat with the repo attached and say what you want, e.g. *"In shubhamtanna-site, add my Yocket results to the Experience page: …"*. Claude edits, builds, checks every page at phone and desktop sizes, and pushes. Same deploy flow as above.

---

### Quick checklist before you commit

- [ ] Indentation matches the lines around it
- [ ] Text with `: ` in it is in double quotes
- [ ] Every new number is in a `facts.md`
- [ ] New photo has `alt` text and is under 500 KB
- [ ] After 2 minutes: Vercel shows **Ready**, and the page looks right on your phone
