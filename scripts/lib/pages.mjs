// What the scripts that write a page's text share: build-legal.mjs and build-release-notes.mjs.

/** The languages a page's blocks are written in, in their order. English is what every other language is checked against. */
export const LANGS = ["pt", "pt-PT", "en", "es", "fr", "de", "it", "pl", "nl", "tr", "id", "ja", "ru", "uk", "ko", "ar", "hi", "zh", "he", "th", "vi", "zh-Hant", "sv", "cs", "ro", "bn", "ms", "el", "hu", "fil", "ur", "hr", "sr", "sk", "nb", "fa", "sw", "ta", "te", "mr", "bg", "ca", "da", "fi", "lv", "et"];

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
