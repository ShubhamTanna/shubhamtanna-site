// One-off (2 Nov 2026): pulls each repo's portfolio/ folder into the site and rewrites project
// content to match its facts.md. Every number below is copied from a facts.md or a CSV.
// Run from the site root: node scripts/apply-facts-2026-11-02.mjs ../repos
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const R = path.resolve(process.argv[2] ?? "../repos");
const MAP = {
  "code1o1": "case-studies/code1o1", "aur-sunao": "case-studies/aur-sunao", "tata-motors": "case-studies/tata-motors",
  "adani-vs-reliance": "case-studies/adani-vs-reliance", "epl-transfer-value": "case-studies/epl-transfer-value",
  "getawayguru": "case-studies/getawayguru", "hope-for-recovery": "case-studies/hope-for-recovery", "linkup": "case-studies/linkup",
  "player-detection": "football-player-detection", "esg-sentiment": "esg-sentiment-classifier", "research-buddy": "research-buddy",
  "compiler-lab": "shift-reduce-parser", "autobot": "autobot-ros2-simulation", "breakout": "tilt-breakout-arduino",
};
const GH = "https://github.com/ShubhamTanna";
const REPO = {
  "player-detection": `${GH}/football-player-detection`, "esg-sentiment": `${GH}/esg-sentiment-classifier`, "research-buddy": `${GH}/research-buddy`,
  "compiler-lab": `${GH}/shift-reduce-parser`, "autobot": `${GH}/autobot-ros2-simulation`, "breakout": `${GH}/tilt-breakout-arduino`,
};
const caseRepo = (slug) => `${GH}/case-studies/tree/main/${slug}`;

// copy CSVs and facts.md next to each project file
for (const [slug, dir] of Object.entries(MAP)) {
  const src = path.join(R, dir, "portfolio"), dst = `content/projects/${slug}`;
  if (!fs.existsSync(src)) continue;
  fs.rmSync(dst, { recursive: true, force: true }); fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) if (/\.(csv|md)$/.test(f)) fs.copyFileSync(path.join(src, f), path.join(dst, f));
}

// Known CSV error in the repo (2 Nov): an unquoted comma in "₹8,000/year" splits the first Tata row. Quote it here.
{ const f = "content/projects/tata-motors/chart-2.csv";
  if (fs.existsSync(f)) fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/^Trust Assurance service subscription \(₹8,000\/year\),/m, '"Trust Assurance service subscription (₹8,000/year)",')); }

function csv(slug, file) {
  const text = fs.readFileSync(`content/projects/${slug}/${file}`, "utf8").trim();
  const rows = text.split(/\r?\n/).map((line) => {
    const out = []; let cur = "", q = false;
    for (let i = 0; i < line.length; i++) { const c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c; }
    out.push(cur); return out;
  });
  return rows;
}
/** table.csv → a results table; drops the source column and keeps its values as a source line. */
function table(slug, caption, file = "table.csv", { drop = [], rename = {} } = {}) {
  const [h, ...rows] = csv(slug, file);
  const keep = h.map((c, i) => [c, i]).filter(([c]) => c !== "source" && !drop.includes(c));
  const si = h.indexOf("source");
  const sources = si >= 0 ? [...new Set(rows.map((r) => r[si]).filter(Boolean))] : [];
  return { caption, columns: keep.map(([c]) => rename[c] ?? (c.charAt(0).toUpperCase() + c.slice(1)).replace(/_/g, " ")), rows: rows.map((r) => keep.map(([, i]) => r[i] ?? "")), ...(sources.length ? { source: sources.join("; ") } : {}) };
}
function edit(slug, fn) {
  const p = `content/projects/${slug}.yaml`;
  const doc = YAML.parseDocument(fs.readFileSync(p, "utf8"));
  const o = doc.toJSON(); fn(o);
  for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
  const head = fs.readFileSync(p, "utf8").split("\n").filter((l) => l.startsWith("#")).join("\n");
  fs.writeFileSync(p, head + "\n\n" + YAML.stringify(o, { lineWidth: 0 }));
}

// ---------- Tier 1 ----------
edit("code1o1", (o) => {
  o.tier = 1;
  o.stats = [{ value: "14", label: "paying clients" }, { value: "~₹2.6L", label: "revenue, Apr 2025 – Oct 2026" }, { value: "~400", label: "hours taught" }];
  o.charts = [{ kind: "bar", file: "chart-1.csv", title: "Every home visit closed. About 1% of cold calls did.", label: "channel", low: "paying_clients_low", high: "paying_clients_high", detail: "{effort_low}–{effort_high} {effort_measure}", highlight: "In-home consultations", note: "Paying clients by channel, with the effort behind each. Faded bars show a range (cold calls: 4–5 clients)." }];
  o.lead = { kind: "image", src: "/img/build.jpg", alt: "The Code1o1 stall", caption: "The Code1o1 stall" };
  o.results = [
    { caption: "The venture so far", columns: ["Metric", "Value"], rows: [["Paying clients", "14"], ["Students taught", "16, Grade 5 to college"], ["Revenue", "About ₹2.6 lakh (Apr 2025 – Oct 2026)"], ["Teaching delivered", "About 400 hours (about ₹650 per hour)"], ["Courses", "11, with 17 enrolments"], ["Advertising spend", "₹0"]], source: "Founders' records and course catalogue" },
    table("code1o1", "The course catalogue", "table.csv", { rename: { for: "For", fee_inr: "Fee (₹)", enrolments: "Enrolled" } }),
  ];
  o.links = [{ label: "Case files on GitHub", href: caseRepo("code1o1") }];
});

edit("aur-sunao", (o) => {
  o.tier = 1;
  o.charts = [
    { kind: "bridge", file: "chart-1.csv", title: "Same ₹499 price, from −₹262 to +₹154 a subscriber", label: "line_item", before: "original_plan_inr", after: "recommended_plan_inr", typeCol: "type", startLabel: "Original plan", endLabel: "Recommended plan", unit: "₹", note: "Contribution per subscriber per month. Bars between show what changed." },
    { kind: "line", file: "chart-2.csv", title: "The original plan loses more with every subscriber. The redesign breaks even at 440.", x: "subscribers", xLabel: "Subscribers", series: [{ col: "monthly_profit_recommended_plan_inr", label: "Recommended plan" }, { col: "monthly_profit_original_plan_inr", label: "Original plan" }], unit: "₹", mark: { x: 440, label: "Break-even: 440" }, note: "Monthly profit after fixed costs (₹70,000 original, ₹67,500 recommended)." },
  ];
  o.lead = { kind: "chart", chart: 0 };
  const survey = (o.results ?? []).find((t) => /survey/i.test(t.caption));
  o.results = [table("aur-sunao", "Original vs recommended plan", "table.csv", { rename: { metric: "", original_plan: "Original", recommended_plan: "Recommended" } }), ...(survey ? [survey] : [])];
  o.method = "80% payout share (the team's own split), 80% usage of included minutes, Razorpay's 2.36% gateway fee, 15% of subscribers buying one ₹450 counsellor session a month at ₹79 margin, and fixed costs from the team's FY25 snapshot. Break-even = ₹67,500 ÷ ₹153.5 = 440 subscribers. Across 50–100% usage and 60–85% payout share, break-even ranges from 193 to 1,837 subscribers.";
  o.links = [{ label: "Deck, model and survey on GitHub", href: caseRepo("aur-sunao") }, ...(o.links ?? []).filter((l) => /figma/i.test(l.href))];
});

edit("tata-motors", (o) => {
  o.tier = 1;
  o.hero = { value: "5% → 14%", label: "market share, FY20 to FY23" };
  o.stats = [{ value: "~5% → ~14%", label: "passenger-vehicle share, FY20 to FY23" }, { value: "#3", label: "PV maker, 9,220 units behind Hyundai in H1 FY23" }, { value: "₹70–120 Cr", label: "a year, from the two sized fixes" }];
  o.charts = [
    { kind: "bar", file: "chart-1.csv", title: "Tata nearly tripled its share in three years", label: "fiscal_year", value: "pv_market_share_pct", unit: "%", highlight: "FY23", note: "Passenger-vehicle market share. Only FY20 and FY23 are sourced, so no line is drawn between them." },
    { kind: "range", file: "chart-2.csv", title: "Two of the three fixes are worth ₹70–120 Cr a year", label: "recommendation", low: "low_inr_cr_per_year", high: "high_inr_cr_per_year", unit: "₹ Cr", detail: "{key_assumption}", note: "Fix 3, a cross-group loyalty tier (Taj, Air India, Croma), assumes an 8% retention lift over five years and has no ₹ estimate, so it isn't on this chart." },
  ];
  o.lead = { kind: "chart", chart: 0 };
  const stands = (o.results ?? []).find((t) => /stands/i.test(t.caption));
  o.results = [...(stands ? [stands] : []), table("tata-motors", "How the segmentation worked", "table.csv", { rename: { segmentation_variable: "Variable", target_group: "Target group", example_models: "Models", why_it_worked: "Why it worked" } })];
  o.links = [{ label: "Report and deck on GitHub", href: caseRepo("tata-motors") }];
});

edit("adani-vs-reliance", (o) => {
  o.tier = 1;
  o.charts = [{ kind: "paired", file: "chart-1.csv", title: "Reliance leads on safety, women in the workforce and CSR", label: "metric", seriesCol: "company", value: "value", unitCol: "unit", betterCol: "better_when", note: "Each metric is on its own scale. Red marks the better result. Renewable share isn't like-for-like: Adani reports share of electricity, Reliance share of total energy." }];
  o.lead = { kind: "chart", chart: 0 };
  o.results = [table("adani-vs-reliance", "The 10-metric scorecard: Reliance 5, Adani 3, even 2", "table.csv", { rename: { metric: "Metric", unit: "Measure", adani_enterprises: "Adani Enterprises", reliance_industries: "Reliance Industries", edge: "Edge", year: "Year" } })];
  o.links = [{ label: "Deck on GitHub", href: caseRepo("adani-vs-reliance") }];
});

edit("player-detection", (o) => {
  o.tier = 1;
  o.stats = [{ value: "0.83", label: "test mAP@0.5, all classes (960 px)" }, { value: "0.29 → 0.43", label: "ball mAP@0.5, 640 → 960 px (validation)" }, { value: "~4 fps", label: "244 ms a frame on a 2-core CPU" }];
  o.answer = "A small model can pull usable detections straight from broadcast frames on an ordinary CPU. Choosing the inference resolution on validation data lifted ball detection from 0.29 to 0.43 without retraining, and the rebuilt model matches v1 overall while beating it on 3 of 4 classes.";
  o.charts = [
    { kind: "paired", file: "chart-1.csv", title: "Players are easy. The ball is the hard part.", label: "class", series: [{ col: "map50_v2_yolov8n", label: "v2: YOLOv8-nano (2026)" }, { col: "map50_v1_roboflow", label: "v1: Roboflow (2025)" }], note: "Test-set mAP@0.5 by class. Test frames share clips with training frames, so these are an upper bound for unseen matches." },
    { kind: "bar", file: "chart-2.csv", title: "960 px finds the ball best, at a cost in speed", label: "inference_size_px", value: "map50_ball", labelSuffix: " px", detail: "{ms_per_frame_cpu} ms a frame on CPU", highlight: "960", note: "Ball mAP@0.5 on the validation set, by inference size." },
  ];
  o.lead = { kind: "video", src: "/work/player-detection/lead.mp4", poster: "/work/player-detection/lead-poster.jpg", alt: "Detections on a Bundesliga broadcast clip", caption: "Detections on a broadcast clip" };
  o.results = [table("player-detection", "Setup", "table.csv", { rename: { item: "", value: "" } })];
  o.links = [{ label: "Code and notebook on GitHub", href: REPO["player-detection"] }];
});

// ---------- Tier 2 ----------
edit("epl-transfer-value", (o) => {
  o.tier = 2;
  o.hero = { value: "R² 0.684", label: "of market value explained" };
  o.charts = [{ kind: "bar", file: "chart-1.csv", title: "Age and club rank drag value down; goals and minutes push it up", label: "predictor", value: "t_value", highlightCol: "significant_at_0_001", highlightWhen: "yes", note: "t-values from the 15-variable regression. Red: significant at p < 0.001. Replication of Li (2020)." }];
  o.lead = { kind: "chart", chart: 0 };
  o.results = [table("epl-transfer-value", "Model fit", "table.csv", { rename: { metric: "", value: "" } })];
  o.links = [{ label: "Report on GitHub", href: caseRepo("epl-transfer-value") }];
});

edit("getawayguru", (o) => {
  o.tier = 2;
  o.hero = { value: "30.8%", label: "of respondents cite a better deal as a reason to cancel" };
  o.stats = [{ value: "91", label: "people surveyed" }, { value: "30.8%", label: "cite a better deal as a reason to cancel" }, { value: "69.2%", label: "name Lonavala for a spontaneous trip" }];
  o.charts = [{ kind: "bar", file: "chart-1.csv", title: "Nearly a third would cancel for a better deal", label: "cancellation_reason", value: "pct_of_respondents", unit: "%", highlight: "Found a better deal", note: "Reasons for last-minute cancellation, n = 91. Multi-select, so shares add up to more than 100%." }];
  o.lead = { kind: "chart", chart: 0 };
  o.results = [table("getawayguru", "The survey", "table.csv", { rename: { item: "", value: "" } })];
  o.links = [{ label: "Deck and wireframes on GitHub", href: caseRepo("getawayguru") }];
});

edit("esg-sentiment", (o) => {
  o.tier = 2;
  o.hero = { value: "2 of 5", label: "real-world sentences right, after 86.84% on the test set" };
  o.stats = [{ value: "86.84%", label: "test accuracy, 228 sentences" }, { value: "2 of 5", label: "real-world sentences right" }, { value: "16", label: "test sentences also in training" }];
  o.charts = [{ kind: "heatmap", file: "chart-1.csv", title: "On the test set, the errors are balanced", row: "actual", col: "predicted", value: "count", note: "Confusion matrix, 228 test sentences. Rows: actual label. Columns: predicted." }];
  o.results = [table("esg-sentiment", "Five real-world sentences: 2 right", "table.csv", { rename: { sentence: "Sentence", human_label: "Actual", model_prediction: "Model", correct: "Right?" } })];
  o.team = "Group · I built the SVM";
  o.links = [{ label: "Code and notebook on GitHub", href: REPO["esg-sentiment"] }];
});

edit("research-buddy", (o) => { o.tier = 2; o.links = [{ label: "Code on GitHub", href: REPO["research-buddy"] }]; });
edit("linkup", (o) => {
  o.tier = 2;
  o.lead = { kind: "image", src: "/work/linkup/lead.jpg", alt: "Three LinkUp screens: search, an event page and chat", caption: "Search, an event page and chat, from the 12-screen prototype" };
  o.links = [{ label: "Clickable Figma prototype", href: "https://www.figma.com/make/6spFKuaMeWx5lGuVpw8IaR/High-Fidelity-Prototype-for-LinkUp?t=tJgPGC80Ob4lb3Hz-1" }];
});

// ---------- Tier 3: one line, link to GitHub ----------
edit("compiler-lab", (o) => { o.tier = 3; o.cardTitle = "Shift-reduce parsing visualiser"; o.links = [{ label: "Code on GitHub", href: REPO["compiler-lab"] }]; });
edit("autobot", (o) => { o.tier = 3; o.links = [{ label: "Code and paper on GitHub", href: REPO["autobot"] }]; });
edit("breakout", (o) => { o.tier = 3; o.links = [{ label: "Code on GitHub", href: REPO["breakout"] }]; });
edit("hope-for-recovery", (o) => { o.tier = 3; o.links = [{ label: "Campaign files on GitHub", href: caseRepo("hope-for-recovery") }]; });

console.log("Applied facts to 14 projects.");
