// RFC 4180 CSV parsing and typed rows for the winger research bundle.
// The bundle quotes JSON arrays and free text, so splitting on commas is not safe.
import fs from "node:fs";
import crypto from "node:crypto";

export function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [], field = "", i = 0, q = false;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        q = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { q = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\n" || c === "\r") {
      row.push(field); field = ""; rows.push(row); row = [];
      if (c === "\r" && text[i + 1] === "\n") i++;
      i++; continue;
    }
    field += c; i++;
  }
  if (q) throw new Error("CSV ends inside a quoted field");
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Converts cells using the manifest's schema for that file: integer, number, boolean, string.
export function typedRows(text, schema, file) {
  const [head, ...body] = parseCSV(text);
  const names = schema.map((s) => s.name);
  if (head.join(",") !== names.join(",")) throw new Error(`${file}: header does not match the manifest schema`);
  return body.map((cells, r) => {
    if (cells.length !== names.length) throw new Error(`${file} row ${r + 2}: ${cells.length} cells, expected ${names.length}`);
    const o = {};
    schema.forEach((s, k) => {
      const v = cells[k];
      if (v === "" && !s.nullable && s.type !== "string") throw new Error(`${file} row ${r + 2}: ${s.name} is empty`);
      if (s.type === "integer" || s.type === "number") {
        const x = Number(v);
        if (!Number.isFinite(x)) throw new Error(`${file} row ${r + 2}: ${s.name}=${v} is not finite`);
        if (s.type === "integer" && !Number.isInteger(x)) throw new Error(`${file} row ${r + 2}: ${s.name}=${v} is not an integer`);
        o[s.name] = x;
      } else if (s.type === "boolean") {
        if (v !== "true" && v !== "false") throw new Error(`${file} row ${r + 2}: ${s.name}=${v} is not true/false`);
        o[s.name] = v === "true";
      } else o[s.name] = v;
    });
    return o;
  });
}

export const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
export const readBuf = (p) => fs.readFileSync(p);

// Accent-free, lowercase URL slug.
export const slugify = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// "2022-2023" → "2022-23"
export const shortSeason = (s) => `${s.slice(0, 4)}-${s.slice(7, 9)}`;
export const spellSlug = (r) => `${slugify(r.player)}-${slugify(r.squad)}-${shortSeason(r.season)}`;
