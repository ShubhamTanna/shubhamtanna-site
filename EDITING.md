# Editing shubhamtanna.in: workbook and manual

Everything you need to change the words, photos and files on your site, and get them live. No coding needed.

**The short version:** open the file on GitHub → click the pencil → change the words → **Commit changes**. Vercel puts it live in 1–2 minutes. If you break something, the live site stays on the last good version and Vercel tells you what went wrong.

**How this file is organised**

| Part | Use it when | Sections |
| --- | --- | --- |
| **A. Copy workbook** | You sit down to improve the writing on the site. Work through it top to bottom and tick boxes as you go. | A0–A8 |
| **B. Manual** | You need to know *how* to do something: find a field, edit, upload, deploy, fix an error. The workbook points here. | 1–9 |

> Tip: GitHub shows this file nicely formatted, and its checkboxes are just text. To tick one, edit this file and change `- [ ]` to `- [x]`. That way your progress is saved in the repo.

---

# Part A: Copy workbook

## A0. Before you start (read once)

**What's already done:** every number on the site is checked against your facts files, your resume and the projects chat. You are not fixing facts. You're making the words sound like *you*.

**Why it matters:** much of the text on the Story and About pages was drafted for you from your facts. Every number is right, but the sentences aren't yours yet. In an interview, "you wrote this on your site, tell me more" only works if you'd say it that way.

**The three tiers**

| Tier | Meaning | Time |
| --- | --- | --- |
| 1. Must do | Missing, or will go out of date | ~15 min now, plus 10 min a month |
| 2. Recommended | Drafted for you; interviewers will quote it back | ~3–4 hours in total, over several sittings |
| 3. Polish | Already fine; this makes it better | Whenever you like |

**Voice rules** (the whole site follows these)

1. First person, short sentences. One idea per sentence.
2. Concrete beats abstract: "about 500 cold calls brought in 4 or 5 clients" beats "I learned the value of persistence".
3. Only numbers already on the site. New numbers go into a `facts.md` first (section 8).
4. Banned words: passionate, leveraged, synergy, results-driven, dynamic, spearheaded, journey, honed.
5. Say "paying clients", never "families". Write the brand as **Code1o1**.
6. **The table test:** would you say this sentence out loud to a consultant across a table? If not, rewrite it.

**The read-aloud routine** (for every paragraph you rewrite)

1. Draft it in your notes app first, not in GitHub.
2. Read it out loud. Wherever you stumble, the sentence is too long.
3. Cut a third. It's almost always better.
4. Then paste it into the file.

**Where things are:** every task below names the **file** and a **phrase to search for**. Open the file (section 2), press **Ctrl+F** (Cmd+F on a Mac), and type the phrase. Line numbers move as you edit; phrases don't.

**Plan your sittings**

| Sitting | What | Method (section 2) | Time |
| --- | --- | --- | --- |
| 1 | Tier 1, tasks 1.1–1.2 | A (phone is fine) | 5 min |
| 2 | Tier 2, tasks 2.1–2.3 (your positioning, written together) | B (laptop) | 60 min |
| 3–6 | Tier 2, task 2.4 (story chapters, one or two per sitting) | B | 30–45 min each |
| 7 | Tier 2, tasks 2.5–2.6 | B | 30 min |
| Later | Tier 3, any order | A or B | 10–20 min each |
| Monthly | A5 (Now section) | A | 10 min |

After every sitting: commit, check it's live (section 6), then do **A7** (review).

---

## A1. Tier 1: Must do

### 1.1 Learning: the game theory book
- [ ] Done

- **On the site:** About page → Now → Learning → card "Game theory". On the live site there's an empty space under the title.
- **File:** `content/about.yaml`. **Search for:** `topic: Game theory`
- **Now:**
  ```yaml
      - kind: Reading
        topic: Game theory
        detail: ""
  ```
- **Change:** put the book's name between the quotes, e.g. `detail: "The Art of Strategy, Dixit and Nalebuff"`.
- **Watch out:** keep the quotes if the text has a `: ` (colon then space) in it.

### 1.2 Learning: the chess opening
- [ ] Done

- **On the site:** About → Now → Learning → card "A new chess opening".
- **File:** `content/about.yaml`. **Search for:** `topic: A new chess opening`
- **Change:** `detail: ""` → e.g. `detail: "The Caro-Kann, as Black"`.

### 1.3 Yocket: the placeholder note
- [ ] Done

- **On the site:** Experience → Yocket, a small line under the bullet points.
- **File:** `content/experience.yaml`. **Search for:** `note: Results in progress`
- **Now:** `note: Results in progress. Numbers go here once the research lands.`
- **Change, choose one:**
  - **No results yet:** delete the whole `note:` line. A missing result reads better than a promise.
  - **Results in:** replace it with one line on the outcome, e.g. `note: "No-show research led to X; recommendations now in use."`. Every number in it must be real and recorded somewhere you can show.

### 1.4 When the Yocket internship ends (Dec 2026)
- [ ] Done

All four go in **one commit** (Method B):

1. `content/experience.yaml`, Yocket block: `dates: Sep – Dec 2026` stays, and `current: true` → `current: false`. If you start a new job, add it at the top of `work:` (recipe in section 5) with `current: true`.
2. `content/site.yaml` → `subline:` still says "Business Operations Intern, Yocket". Update it to what you are now.
3. `content/about.yaml` → `lede:` says "Right now I'm a Business Operations Intern at Yocket…". Update it.
4. `content/story.yaml`, Next chapter (search for `key: next`), first paragraph: "Right now I'm a Business Operations Intern at Yocket…". Update it.
5. Add a line at the top of the Now `log:` (see A5).

### 1.5 The Now section, every month
- [ ] Set a monthly phone reminder, then follow **A5** each time.

---

## A2. Tier 2: Recommended (drafted for you; make it yours)

Do these in order. 2.1–2.3 are your positioning, so write them **in one sitting** so they tell one story.

### 2.1 Why consulting (the most important paragraph on the site)
- [ ] Drafted in notes
- [ ] Read aloud
- [ ] Committed

- **On the site:** About page, the paragraph under the intro.
- **File:** `content/about.yaml`. **Search for:** `whyConsulting:`
- **Now:**
  > Every role I've enjoyed had the same shape: an unclear problem, a decision someone had to make, and the job of getting to the answer with real numbers. Consulting is that shape, full time. I do my best work when I own a problem from a blank page, and I'd rather be stretched by hard problems than comfortable in easy ones.
- **What's weak about it:** it's general. Anyone could have written it.
- **Write it with this structure** (3–4 sentences):
  1. **A specific moment.** e.g. the Code1o1 funnel: about 500 cold calls brought in 4–5 clients, yet all 4 home visits converted. Or being handed Yocket's no-show problem that nobody could explain.
  2. **What you did with it.** The analysis, and the decision it led to.
  3. **What you noticed about yourself.** e.g. you liked the figuring-out more than the selling.
  4. **Why consulting is that, full time.**
- **Format:** it's one line in the file and it contains colons, so keep the **double quotes** around the whole thing.
  ```yaml
  whyConsulting: "Your first sentence. Your second: with a colon is fine inside quotes. Your third."
  ```
- **This is your interview answer.** Practise saying it after you write it.

### 2.2 Home headline and the line under it
- [ ] Decided
- [ ] Committed

- **On the site:** the first thing anyone sees on Home.
- **File:** `content/site.yaml`. **Search for:** `positioning:` and `subline:`
- **Now:**
  - `positioning: Most graduates have case studies. I have customers.`
  - `subline: Co-founder, Code1o1 · Business Operations Intern, Yocket · Mumbai. Looking for management consulting, strategy consulting and decision analytics roles.`
- **Decide, don't just accept:** the headline is strong and matches the Work section ("One business. The rest is practice."). Keep it only if you can defend it out loud to a consultant who has case studies. Rewrite it if it doesn't sound like you.
- **Rules:** the headline has to fit on 3 lines on a laptop, so keep it under ~60 characters. It's also the description shown in Google and link previews.

### 2.3 The Next chapter (your pitch)
- [ ] Drafted
- [ ] Read aloud
- [ ] Committed

- **On the site:** Story page, chapter 06 "Next", plus the last step of the home scroll story.
- **File:** `content/story.yaml`. **Search for:** `key: next`
- **Fields to rewrite:** `pull:` (the big quote), `text:` (the short version on Home) and `long:` (the full paragraphs).
- **Should answer:** what you want next, why, and why you're ready for it. It must agree with 2.1. Read them side by side.

### 2.4 The six pull quotes and the story chapters
Do one or two chapters per sitting. For each chapter, rewrite `pull:` (one big sentence) and `long:` (the paragraphs). `text:` is the short version shown on Home; keep it to 1–2 sentences.

| Chapter | Search for | Pull quote now | Priority | Done (write ✓) |
| --- | --- | --- | --- | --- |
| Build | `key: build` | "I started a company before I finished my degree." | High: the Code1o1 origin story |  |
| Sell | `key: sell` | "2,500 cold calls taught me what actually converts." | High: must read as insight, not sales |  |
| Teach | `key: teach` | "It started as volunteering. It became a company." | Medium |  |
| Price | `key: price` | "Every price is a decision someone will push back on." | Medium |  |
| Analyse | `key: analyse` | "I like questions that end in a number you can act on." | Medium |  |
| Next | `key: next` | (done in 2.3) | |  |

**How `long:` works:** each paragraph is one line starting with `- `, indented exactly like the lines already there. 2–3 paragraphs per chapter.
```yaml
    long:
      - First paragraph, all on one line, however long it is.
      - "Second paragraph: it has a colon followed by a space, so it's in double quotes."
      - Third paragraph.
```
**Don't touch** in a chapter: `key`, `years`, `photo`, or `proof` (the number tiles). There must always be exactly 6 chapters.

### 2.5 About intro
- [ ] Done

- **File:** `content/about.yaml`. **Search for:** `lede:` (the opening paragraph) and `body:` (the paragraphs below it).
- `body:` has only one paragraph today. Add a second, about **how you think**: what you do first when a problem lands on your desk. Same format as `long:` above.

### 2.6 The closing line
- [ ] Done

- **On the site:** the big line in the dark footer of every page.
- **File:** `content/site.yaml`. **Search for:** `closing:`
- **Now:** `Hiring for consulting or analytics? Let's talk.`
- Keep it short; it's huge on screen. Change it only if you have a better one.

---

## A3. Tier 3: Polish (optional, any order)

### 3.1 Experience page should match your resume
- [ ] Done

- **File:** `content/experience.yaml`. **Search for:** `Sold 40+ premium tickets`
- The BizDateUp line opens with ticket sales; your resume opens with the venue negotiation. Reorder the sentence the same way, e.g.:
  `line: Main point of contact negotiating venue contracts with The Lalit, JW Marriott and Novotel for the Startup Investors Conclave 2024. Sold 40+ premium tickets at ₹5,000 each.`
- JLR (search `commission tracking`) already leads with the Excel model. Leave it.

### 3.2 Code1o1's story vs your resume
- [ ] Done

- **File:** `content/story.yaml`. **Search for:** `Today it runs on weekends`
- The Build chapter ends "Today it runs on weekends with our existing students." Your resume says you "stopped cold calling and moved all acquisition to word of mouth and in-person pitching". Both can be true, but a reader should get **one** story. Add the switch in your words, in the Build or Sell chapter.

### 3.3 One technical wording fix
- [ ] Done

- **File:** `content/story.yaml`. **Search for:** `0.83 mAP on an ordinary CPU`
- Accuracy isn't measured "on" a CPU. Change it to: `at 0.83 mAP, fast enough for an ordinary CPU`. Keep the paragraph's double quotes.

### 3.4 Off the clock
- [ ] Done

- **File:** `content/about.yaml`. **Search for:** `title: Motorcycles`
- "I ride, Mumbai traffic permitting." Add one real detail: what you ride, or a ride you've done. "Yes, plural." (Cats) is good. Leave it.

### 3.5 Project story boxes
- [ ] Done

- Only Code1o1 ("The ₹500 sign") and Player Detection have a short behind-the-scenes box. One for **Aur Sunao** or **Tata** would add personality.
- **File:** `content/projects/aur-sunao.yaml` (or `tata-motors.yaml`). Add this at the top level (no indentation), e.g. just above `charts:`:
  ```yaml
  story:
    title: A short title
    text: "Two or three sentences: what surprised you, or what went wrong first."
  ```
- Any number in it must already be in that project's facts.md.

### 3.6 Research Buddy's headline number
- [ ] Done

- "2 databases" is the weakest card on the Work page. If you time one search (both sources at once vs by hand), ask the projects chat to add the result to Research Buddy's facts.md. Then change `hero:` in `content/projects/research-buddy.yaml`.

---

## A4. Don't touch these (they're not copy)

| Don't edit | Why | How it does change |
| --- | --- | --- |
| Any number (stats, tiles, chart values) | Must match facts.md | Projects chat → re-import (section 7) |
| `key`, `slug`, `tier`, `rank`, `type`, `origin`, `draft` | They control layout and links | Ask Claude |
| `charts:` specs, `file:`, `src:`, links | Break the build or the images | Ask Claude |
| Screenshot captions under "In action" | They live in each project repo's `screens.csv` | Projects chat → re-import |
| Project card text (`cardTitle`, `cardLine`, `answer`, etc.) | Written from the handoff doc; fine as is | You can edit the words, but not the numbers |

---

## A5. Monthly routine: the Now section (10 minutes)

- [ ] First week of the month, Method A, `content/about.yaml`, under `now:`

1. `updated: 2026-11` → this month, in `YYYY-MM` format (e.g. `2026-12`).
2. Under `building:`, move each `stage:` along. Only these four words work: `Idea`, `Building`, `Testing`, `Live`. Remove anything that's finished or dropped.
3. Under `learning:`, update anything that's changed.
4. Add one line at the **top** of `log:`:
   ```yaml
     log:
       - date: Dec 2026
         text: What happened, in one line.
   ```
5. Commit message: `Now: Dec 2026`.

---

## A6. One edit, start to finish (worked example)

Task 1.1, on your phone:

1. Open https://github.com/ShubhamTanna/shubhamtanna-site → `content` → `about.yaml`.
2. Tap `…` → **Edit file**. Search for `Game theory`.
3. Change `detail: ""` to `detail: "The Art of Strategy, Dixit and Nalebuff"`.
4. Check: the indentation is the same as the line above, and the quotes are still there.
5. **Commit changes…** → message `About: add game theory book` → **Commit changes**.
6. Open Vercel → Deployments. Wait for **Ready** (about a minute). If it says **Error**, see section 6.
7. Open https://shubhamtanna.in/about on your phone (close and reopen the tab) and check the card.
8. Tick the box in this file.

---

## A7. After each sitting: the review (don't skip)

The worst outcome isn't a clumsy sentence. It's a sentence that contradicts your resume or your facts. After each sitting, send Claude:

> *"Review my copy changes in shubhamtanna-site: [files you edited]. Check them against my facts files, my resume and the rest of the site."*

Claude checks every claim, flags anything that clashes, and fixes formatting slips.

---

## A8. Progress log

Add one row per sitting (edit this file, Method A).

| Date | Tasks | Commit message | Reviewed? |
| --- | --- | --- | --- |
| | | | |

---

# Part B: Manual

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
| About: **Now** section (building, learning, log) | `content/about.yaml` | `now` (see section 5 and workbook A5) |
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
| `origin` | Where it came from: `venture` (Code1o1 only: gets the dark "Real business" block), `coursework` or `personal`. Shown as a badge on every card and page |
| `originNote` | Short detail after the badge, e.g. `"Semester 7"` → COURSEWORK · SEMESTER 7 |
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
- Update `learning` when it changes (blank ones: workbook tasks 1.1 and 1.2).

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

### Screenshots and clips ("In action" on a project page)

They come from the project repo, like charts: `portfolio/screens/` holds the images (PNG or JPG) and short clips (MP4, under 8 MB), and `portfolio/screens.csv` says which ones show, in order:

```
file,alt,caption,size
01-demo.png,"The live demo classifying a sentence as negative","The live demo: the call and the words that drove it",
02-home.png,"The app's home screen","Home: listeners available now",phone
```

`size` is empty for full-width screenshots, or `phone` for phone screens (they sit three to a row). For a clip, add a same-named `.jpg` as its still frame (`03-search.mp4` + `03-search.jpg`). Then re-import. To reword a caption, edit `screens.csv` in the project repo and re-import.

### Pages that tell a story in your own order (`sections`)

Most project pages use the fixed order: problem, what I did, in action, results. A project can instead list its own `sections:` in its YAML, and the page then shows them in that order (Aur Sunao does this; search `sections:` in `content/projects/aur-sunao.yaml`). Each section has a `title` and `blocks`, one per line of the page:

| Block | What it shows |
|---|---|
| `p: text` | a paragraph |
| `list: [...]` | bullet points |
| `callout: {label, text}` | a highlighted box, e.g. a persona |
| `items: [{title, text, tag}]` | a list of named things (features, credits); `tag` adds a red label like "Core feature" |
| `cards: [{title, price, lines}]` + optional `foot` | side-by-side plan cards |
| `chart: 0` | a chart from `charts:`, numbered from 0 |
| `table: 0` | a table from `results:`, numbered from 0 |
| `note: text` | a small grey note, e.g. a caveat under a chart |
| `screens: [01-home.png, ...]` | screenshots by file name from `screens.csv`; phone screens get a phone frame |
| `button: {label, href}` | a red button that opens in a new tab |

On these pages the hero shows the card line and `context` instead of the big number. The big number (`hero`) still shows on cards. A wrong chart or table number stops the build with a message saying which one.

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
