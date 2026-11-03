// No server imports here: client components use this too.
type O = { origin: "venture" | "coursework" | "personal"; originNote?: string };
/** The badge text: "Real business", "Coursework · Semester 7", "Personal project". */
export const originLabel = (p: O) =>
  p.origin === "venture" ? "Real business" : p.origin === "personal" ? "Personal project" : `Coursework${p.originNote ? ` · ${p.originNote}` : ""}`;
