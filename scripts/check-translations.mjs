#!/usr/bin/env node
// Fails when a language misses a string the site shows, so no page ships half translated:
//
// - Each page's window.SITE_STRINGS has every translated language, each with a non-empty value for every key the
//   page's data-i18n, data-i18n-html and data-i18n-label use, and no key the page no longer uses (title and
//   description are read by site.js itself).
//   A legal page (one with blocks written per language, data-lang) has one block of each legal language for every
//   English one.
// - Every dictionary of the scripts keyed by language (const TEXT = { en: …, pt: … }, PAPER, CURRENCY…) has every
//   language, with the same keys, the same shapes, the same {placeholders} and the same function arities as English.
//
// - The contact address is the same everywhere it is typed by hand: every mailto: link of a page, the address it
//   shows, and the address public/llms.txt names are the one the legal Markdown (public/legal/*.md) publishes.
//
// A regional variant (pt-PT) overlays its language with only the words it says differently: every page and script may
// carry one, each of whose entries must match English's shape and placeholders, and none of whose keys may be unknown.
// The languages come from SUPPORTED in public/boot.js, the one list the site picks a language from. Run it with
// `npm run check:translations`; CI runs it on every pull request (.github/workflows/translations.yml).
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
// Keys of SITE_STRINGS that site.js reads by name instead of from a data-i18n attribute.
const PAGE_KEYS = ["title", "description"];
// Keys whose English markup is right in every language but the ones that set them: the product's name is Blitz Split
// in every language but Portuguese.
const ENGLISH_BY_DEFAULT = ["name"];
// Dictionaries of formats, not words: each language has its own shape (a currency's prefix, separators and suffix),
// so only their languages are checked.
const FORMATS = ["CURRENCY"];
// Tables keyed by language that hold no words, only for some languages: the language picker's chips (site.js), the
// codes that differ from a language's own. Only their keys are checked.
const NOT_WORDS = ["LANGUAGE_CHIPS"];

const errors = [];
const fail = (file, message) => errors.push(`${relative(ROOT, file)}: ${message}`);
// The contact address's own errors, told apart from a missing translation.
const contactErrors = [];
const failContact = (file, message) => contactErrors.push(`${relative(ROOT, file)}: ${message}`);

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

const boot = readFileSync(join(PUBLIC, "boot.js"), "utf8");
const languages = (() => {
  const match = boot.match(/const SUPPORTED = (\[[^\]]*\])/);
  if (!match) throw new Error("public/boot.js has no `const SUPPORTED = [...]` to read the languages from");
  return evaluate(match[1]);
})();
const variants = (() => {
  const match = boot.match(/const VARIANTS = (\[[^\]]*\])/);
  return match ? evaluate(match[1]) : [];
})();
const translated = languages.filter((lang) => lang !== "en");
// The languages the legal pages are written in full: every language the site speaks, and each variant.
const LEGAL_LANGS = [...languages, ...variants];

// Unique, since a language may write a placeholder once per plural form ("{a} na {n} osoby.|{a} na {n} osób.").
const placeholders = (text) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort().join(",");
const shape = (value) => (Array.isArray(value) ? "array" : value === null ? "null" : typeof value);

// Compares a language's value with English's, reporting each difference under its path.
function compare(file, path, english, other, partial = false) {
  if (other === undefined) return partial ? undefined : fail(file, `${path} is missing`);
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
    english.forEach((item, index) => compare(file, `${path}[${index}]`, item, other[index], partial));
  } else if (shape(english) === "object") {
    for (const key of Object.keys(english)) compare(file, `${path}.${key}`, english[key], other[key], partial);
    for (const key of Object.keys(other)) if (!(key in english)) fail(file, `${path}.${key} isn't in English`);
  }
}

function checkPage(file) {
  const html = readFileSync(file, "utf8");
  const used = new Set([...html.matchAll(/\sdata-i18n(?:-html|-label)?="([^"]+)"/g)].map((m) => m[1]));

  const blocks = [...html.matchAll(/\sdata-lang="([^"]+)"/g)].map((m) => m[1]);
  const pageLangs = blocks.length > 0 ? LEGAL_LANGS.filter((lang) => lang !== "en" && !variants.includes(lang)) : translated;

  const at = html.indexOf("window.SITE_STRINGS = {");
  if (used.size > 0 && at < 0) fail(file, "uses data-i18n keys but sets no window.SITE_STRINGS");
  if (at >= 0) {
    const open = html.indexOf("{", at);
    const strings = evaluate(html.slice(open, closingBracket(html, open) + 1));
    for (const lang of Object.keys(strings)) if (!pageLangs.includes(lang) && !variants.includes(lang)) fail(file, `SITE_STRINGS.${lang} isn't a language of this page`);
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
    // A variant's words are partial, but each one must be a key the page uses.
    for (const variant of variants) {
      for (const [key, value] of Object.entries(strings[variant] || {})) {
        if (!used.has(key) && !PAGE_KEYS.includes(key)) fail(file, `SITE_STRINGS.${variant}.${key} isn't used by the page`);
        else if (String(value).trim() === "") fail(file, `SITE_STRINGS.${variant}.${key} is empty`);
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
  const declaration = new RegExp(`const (\\w+) = (?:window\\.localized\\()?\\{\\s*(?:${languages.join("|")}):`, "g");
  for (const match of source.matchAll(declaration)) {
    const open = source.indexOf("{", match.index);
    const dict = evaluate(source.slice(open, closingBracket(source, open) + 1));
    const name = match[1];
    for (const lang of Object.keys(dict)) if (!languages.includes(lang) && !variants.includes(lang)) fail(file, `${name}.${lang} isn't a language of the site`);
    if (NOT_WORDS.includes(name)) continue;
    if (FORMATS.includes(name)) {
      for (const lang of languages) if (!dict[lang]) fail(file, `${name} has no ${lang}`);
      // A variant's format has the same parts as its language's: a missing separator would print "undefined".
      for (const variant of variants) {
        const base = dict[variant.split("-")[0]];
        if (dict[variant] && base && (dict[variant].length < base.length || dict[variant].some((part) => typeof part !== "string"))) {
          fail(file, `${name}.${variant} has ${dict[variant].length} part(s) of text, but ${variant.split("-")[0]}'s has ${base.length}`);
        }
      }
      continue;
    }
    if (!dict.en) { fail(file, `${name} has no English to compare the other languages with`); continue; }
    for (const lang of translated) compare(file, `${name}.${lang}`, dict.en, dict[lang]);
    for (const variant of variants) if (dict[variant]) compare(file, `${name}.${variant}`, dict.en, dict[variant], true);
  }
}

// The address the legal Markdown publishes is the site's one contact address. The footers, the Support page and
// llms.txt type it by hand, since the site has no build, so a change of address that misses one of them fails here.
const LEGAL = join(PUBLIC, "legal");
const ADDRESS = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const addressesOf = (text) => [...new Set(text.match(ADDRESS) || [])];

function legalAddress() {
  const published = new Map();
  for (const file of files(LEGAL, ".md")) {
    const links = [...readFileSync(file, "utf8").matchAll(/\]\(mailto:([^)\s]+)\)/g)].map((m) => m[1]);
    if (links.length === 0) failContact(file, "publishes no contact address (a mailto: link)");
    for (const address of links) published.set(address, [...(published.get(address) || []), file]);
  }
  if (published.size > 1) {
    for (const [address, where] of published) failContact(where[0], `publishes ${address}, one of ${published.size} contact addresses in ${relative(ROOT, LEGAL)}/ (${where.length} file(s) have this one): the site has one`);
  }
  return published.size === 1 ? [...published.keys()][0] : null;
}

function checkContact(file, address) {
  const text = readFileSync(file, "utf8");
  if (!file.endsWith(".html")) {
    for (const other of addressesOf(text)) if (other !== address) failContact(file, `names ${other}, but the legal Markdown publishes ${address}`);
    return;
  }
  for (const [, href, shown] of text.matchAll(/<a\b[^>]*\shref="mailto:([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (href !== address) failContact(file, `a link writes to mailto:${href}, but the legal Markdown publishes ${address}`);
    // Read off the link's markup as it is: an address is found among the tags, with no need to take them out.
    for (const other of addressesOf(shown)) {
      if (other !== address) failContact(file, `a mailto: link shows ${other}, but the legal Markdown publishes ${address}`);
    }
  }
}

const files = (dir, extension) => readdirSync(dir).filter((name) => name.endsWith(extension)).map((name) => join(dir, name));
// Why pages/ too: a page whose text is written at deploy keeps its hand-written shell, with its strings, there.
[...files(PUBLIC, ".html"), ...files(join(ROOT, "pages"), ".html")].forEach(checkPage);
[...files(PUBLIC, ".js"), ...files(join(ROOT, "src"), ".js")].forEach(checkScript);
const address = legalAddress();
if (address) [...files(PUBLIC, ".html"), ...files(join(ROOT, "pages"), ".html"), join(PUBLIC, "llms.txt")].forEach((file) => checkContact(file, address));

if (errors.length > 0) {
  console.error(`❌ ${errors.length} missing or mismatched translation(s):`);
  errors.forEach((error) => console.error(`   ${error}`));
}
if (contactErrors.length > 0) {
  console.error(`❌ ${contactErrors.length} place(s) where the contact address isn't the one the legal Markdown publishes:`);
  contactErrors.forEach((error) => console.error(`   ${error}`));
}
if (errors.length > 0 || contactErrors.length > 0) process.exit(1);
console.log(`✅ Every page writes to the contact address the legal Markdown publishes (${address})`);
console.log(`✅ Every page and script has its strings in ${languages.length} languages (${languages.join(", ")})`);
