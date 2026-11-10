#!/usr/bin/env node
// Fails when a language misses a string the site shows, so no page ships half translated:
//
// - Each page's window.SITE_STRINGS has every translated language, each with a non-empty value for every key the
//   page's data-i18n, data-i18n-html and data-i18n-label use, and no key the page no longer uses (title and
//   description are read by site.js itself).
//   A legal page (one with blocks written per language, data-lang) is checked in the legal languages only, since
//   French, German, Italian and Polish read it all in English (docs/design.md), and has one block of each legal
//   language for every English one.
// - Every dictionary of the scripts keyed by language (const TEXT = { en: …, pt: … }, PAPER, CURRENCY…) has every
//   language, with the same keys, the same shapes, the same {placeholders} and the same function arities as English.
//
// The languages come from SUPPORTED in public/boot.js, the one list the site picks a language from. Run it with
// `npm run check:translations`; CI runs it on every pull request (.github/workflows/translations.yml).
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
// The legal pages are written in full in these languages only; the others read the English text.
const LEGAL_LANGS = ["en", "pt", "es", "nl", "tr", "id", "ja"];
// Keys of SITE_STRINGS that site.js reads by name instead of from a data-i18n attribute.
const PAGE_KEYS = ["title", "description"];
// Keys whose English markup is right in every language but the ones that set them: the product's name is Blitz Split
// in every language but Portuguese.
const ENGLISH_BY_DEFAULT = ["name"];
// Dictionaries of formats, not words: each language has its own shape (a currency's prefix, separators and suffix),
// so only their languages are checked.
const FORMATS = ["CURRENCY"];

const errors = [];
const fail = (file, message) => errors.push(`${relative(ROOT, file)}: ${message}`);

// The end of the bracketed literal that opens at `start`, skipping strings, template literals and comments.
function closingBracket(source, start) {
  const stack = [];
  let i = start;
  while (i < source.length) {
    const c = source[i];
    const top = stack[stack.length - 1];
    if (top === "`") {
      if (c === "\\") i++;
      else if (c === "`") stack.pop();
      else if (c === "$" && source[i + 1] === "{") { stack.push("${"); i++; }
    } else if (c === "'" || c === '"') {
      for (i++; source[i] !== c; i++) if (source[i] === "\\") i++;
    } else if (c === "/" && source[i + 1] === "/") {
      i = source.indexOf("\n", i);
    } else if (c === "/" && source[i + 1] === "*") {
      i = source.indexOf("*/", i) + 1;
    } else if (c === "`") {
      stack.push("`");
    } else if (c === "{" || c === "[" || c === "(") {
      stack.push(c);
    } else if (c === "}" || c === "]" || c === ")") {
      const open = stack.pop();
      if (open === "${" && c === "}") { i++; continue; }
      if (stack.length === 0) return i;
    }
    i++;
  }
  throw new Error(`no closing bracket for the literal at ${start}`);
}

// Evaluates a literal of the site's own source; its functions are only compared, never called.
const evaluate = (literal) => vm.runInNewContext(`(${literal})`, {});

const languages = (() => {
  const boot = readFileSync(join(PUBLIC, "boot.js"), "utf8");
  const match = boot.match(/const SUPPORTED = (\[[^\]]*\])/);
  if (!match) throw new Error("public/boot.js has no `const SUPPORTED = [...]` to read the languages from");
  return evaluate(match[1]);
})();
const translated = languages.filter((lang) => lang !== "en");

// Unique, since a language may write a placeholder once per plural form ("{a} na {n} osoby.|{a} na {n} osób.").
const placeholders = (text) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort().join(",");
const shape = (value) => (Array.isArray(value) ? "array" : value === null ? "null" : typeof value);

// Compares a language's value with English's, reporting each difference under its path.
function compare(file, path, english, other) {
  if (other === undefined) return fail(file, `${path} is missing`);
  if (shape(english) !== shape(other)) return fail(file, `${path} is ${shape(other)}, but English's is ${shape(english)}`);
  if (typeof english === "string") {
    if (english.trim() !== "" && other.trim() === "") fail(file, `${path} is empty`);
    if (placeholders(english) !== placeholders(other)) {
      fail(file, `${path} has the placeholders {${placeholders(other)}}, but English has {${placeholders(english)}}`);
    }
  } else if (typeof english === "function") {
    if (english.length !== other.length) fail(file, `${path} takes ${other.length} argument(s), but English's takes ${english.length}`);
  } else if (Array.isArray(english)) {
    if (english.length !== other.length) fail(file, `${path} has ${other.length} item(s), but English has ${english.length}`);
    english.forEach((item, index) => compare(file, `${path}[${index}]`, item, other[index]));
  } else if (shape(english) === "object") {
    for (const key of Object.keys(english)) compare(file, `${path}.${key}`, english[key], other[key]);
    for (const key of Object.keys(other)) if (!(key in english)) fail(file, `${path}.${key} isn't in English`);
  }
}

function checkPage(file) {
  const html = readFileSync(file, "utf8");
  const used = new Set([...html.matchAll(/\sdata-i18n(?:-html|-label)?="([^"]+)"/g)].map((m) => m[1]));

  const blocks = [...html.matchAll(/\sdata-lang="([^"]+)"/g)].map((m) => m[1]);
  const pageLangs = blocks.length > 0 ? LEGAL_LANGS.filter((lang) => lang !== "en") : translated;

  const at = html.indexOf("window.SITE_STRINGS = {");
  if (used.size > 0 && at < 0) fail(file, "uses data-i18n keys but sets no window.SITE_STRINGS");
  if (at >= 0) {
    const open = html.indexOf("{", at);
    const strings = evaluate(html.slice(open, closingBracket(html, open) + 1));
    for (const lang of Object.keys(strings)) if (!pageLangs.includes(lang)) fail(file, `SITE_STRINGS.${lang} isn't a language of this page`);
    for (const lang of pageLangs) {
      const dict = strings[lang];
      if (!dict) { fail(file, `SITE_STRINGS has no ${lang}`); continue; }
      for (const key of used) {
        if (dict[key] === undefined) {
          if (!ENGLISH_BY_DEFAULT.includes(key)) fail(file, `SITE_STRINGS.${lang}.${key} is missing`);
        }
        else if (String(dict[key]).trim() === "") fail(file, `SITE_STRINGS.${lang}.${key} is empty`);
      }
      for (const key of Object.keys(dict)) {
        if (!used.has(key) && !PAGE_KEYS.includes(key)) fail(file, `SITE_STRINGS.${lang}.${key} isn't used by the page`);
      }
    }
  }

  if (blocks.length > 0) {
    const count = (lang) => blocks.filter((block) => block === lang).length;
    for (const lang of new Set(blocks)) if (!LEGAL_LANGS.includes(lang)) fail(file, `a data-lang="${lang}" block isn't a legal language`);
    for (const lang of LEGAL_LANGS) {
      if (count(lang) !== count("en")) fail(file, `${count(lang)} data-lang="${lang}" block(s) for ${count("en")} in English`);
    }
  }
}

function checkScript(file) {
  const source = readFileSync(file, "utf8");
  // A dictionary keyed by language: a constant whose first key is a language.
  const declaration = new RegExp(`const (\\w+) = \\{\\s*(?:${languages.join("|")}):`, "g");
  for (const match of source.matchAll(declaration)) {
    const open = source.indexOf("{", match.index);
    const dict = evaluate(source.slice(open, closingBracket(source, open) + 1));
    const name = match[1];
    for (const lang of Object.keys(dict)) if (!languages.includes(lang)) fail(file, `${name}.${lang} isn't a language of the site`);
    if (FORMATS.includes(name)) {
      for (const lang of languages) if (!dict[lang]) fail(file, `${name} has no ${lang}`);
      continue;
    }
    if (!dict.en) { fail(file, `${name} has no English to compare the other languages with`); continue; }
    for (const lang of translated) compare(file, `${name}.${lang}`, dict.en, dict[lang]);
  }
}

const files = (dir, extension) => readdirSync(dir).filter((name) => name.endsWith(extension)).map((name) => join(dir, name));
files(PUBLIC, ".html").forEach(checkPage);
[...files(PUBLIC, ".js"), ...files(join(ROOT, "src"), ".js")].forEach(checkScript);

if (errors.length > 0) {
  console.error(`❌ ${errors.length} missing or mismatched translation(s):`);
  errors.forEach((error) => console.error(`   ${error}`));
  process.exit(1);
}
console.log(`✅ Every page and script has its strings in ${languages.length} languages (${languages.join(", ")})`);
