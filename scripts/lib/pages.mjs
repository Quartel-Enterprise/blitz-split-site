// What the scripts that write a page's text share: build-legal.mjs and build-release-notes.mjs.

import { readFileSync } from "node:fs";

// Why: public/boot.js's SUPPORTED and VARIANTS are the one list the site picks a language from, so the pages are built
// in the same languages, read from there as check-translations.mjs does.
const boot = readFileSync(new URL("../../public/boot.js", import.meta.url), "utf8");
const listOf = (name) => JSON.parse(boot.match(new RegExp(`const ${name} = (\\[[^\\]]*\\])`))[1]);

/** The languages a page's blocks are written in, in their order: Portuguese and its variants, English, which every other
 * language is checked against, then the rest in SUPPORTED's order. */
export const LANGS = ["pt", ...listOf("VARIANTS"), "en", ...listOf("SUPPORTED").filter((lang) => lang !== "pt" && lang !== "en")];

export const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** An icon of the page's own sprite. */
export const ICON = (name) => `<svg class="icon"><use href="#i-${name}"/></svg>`;

/** Whether a value is a real day written YYYY-MM-DD. */
export const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
  // Why: Date.parse rolls an impossible date over (2026-02-31 is March 3) instead of failing.
  && !Number.isNaN(Date.parse(value)) && new Date(Date.parse(value)).toISOString().startsWith(value);

/** A YYYY-MM-DD day in a language's long format ("November 5, 2026"), whatever the machine's time zone. */
export function longDate(locale, date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

const OPEN = '  <main id="main">\n';
const CLOSE = "\n  </main>";

/** A page's HTML with `text` between <main> and </main>, the rest as it was; null when the page has no such place. */
export function withMain(html, text) {
  const start = html.indexOf(OPEN);
  const end = html.indexOf(CLOSE);
  return start < 0 || end < start ? null : html.slice(0, start + OPEN.length) + text + html.slice(end);
}
