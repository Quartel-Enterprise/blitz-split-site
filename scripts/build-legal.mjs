// Writes the legal pages' text, between <main> and </main> of public/privacy.html and public/terms.html, from the
// Markdown of public/legal/<page>.<language>.md: the one place the legal text is written. The apps read the same
// Markdown files and draw them natively, so they take only the constructs docs/legal.md lists, and anything else
// fails here instead of showing wrong in an app.
//
//   node scripts/build-legal.mjs           writes the pages
//   node scripts/build-legal.mjs --check   fails when a page isn't what its Markdown gives (CI)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON, LANGS, escapeHtml, isDate, longDate, withMain } from "./lib/pages.mjs";

// The paths below are the repository's, wherever the script is run from.
process.chdir(join(dirname(fileURLToPath(import.meta.url)), ".."));

const PAGES = ["privacy", "terms"];
const LEGAL_DIR = "public/legal";

// Arabic counts in six forms (zero, one, two, few: 3–10, many: 11–99, other), picked as Intl.PluralRules("ar") says.
const ARABIC_MINUTES = { zero: "{n} دقيقة", one: "دقيقة واحدة", two: "دقيقتان", few: "{n} دقائق", many: "{n} دقيقة", other: "{n} دقيقة" };
const arabicPlural = new Intl.PluralRules("ar");
const arabicMinutes = (n) => ARABIC_MINUTES[arabicPlural.select(Number(n))].replace("{n}", n);

const CHROME = {
  pt: { language: "Português", brand: "Bora Rachar", locale: "pt-BR", updated: { privacy: "Atualizada em {date}", terms: "Atualizados em {date}" }, read: "Leitura de {n} minutos", toc: "Nesta página" },
  "pt-PT": { language: "Português (Portugal)", brand: "Blitz Split", locale: "pt-PT", updated: { privacy: "Atualizada em {date}", terms: "Atualizados em {date}" }, read: "Leitura de {n} minutos", toc: "Nesta página" },
  en: { language: "English", brand: "Blitz Split", locale: "en-US", updated: "Updated {date}", read: "{n} min read", toc: "On this page" },
  es: { language: "Español", brand: "Blitz Split", locale: "es", updated: { privacy: "Actualizada el {date}", terms: "Actualizados el {date}" }, read: "Lectura de {n} minutos", toc: "En esta página" },
  fr: { language: "Français", brand: "Blitz Split", locale: "fr", updated: { privacy: "Mise à jour le {date}", terms: "Mises à jour le {date}" }, read: "Lecture de {n} min", toc: "Sur cette page" },
  de: { language: "Deutsch", brand: "Blitz Split", locale: "de", updated: "Aktualisiert am {date}", read: "{n} Min. Lesezeit", toc: "Auf dieser Seite" },
  it: { language: "Italiano", brand: "Blitz Split", locale: "it", updated: { privacy: "Aggiornata il {date}", terms: "Aggiornati il {date}" }, read: "Lettura di {n} minuti", toc: "In questa pagina" },
  pl: { language: "Polski", brand: "Blitz Split", locale: "pl", updated: "Aktualizacja: {date}", read: "{n} min czytania", toc: "Na tej stronie" },
  nl: { language: "Nederlands", brand: "Blitz Split", locale: "nl", updated: "Bijgewerkt op {date}", read: "{n} minuten lezen", toc: "Op deze pagina" },
  tr: { language: "Türkçe", brand: "Blitz Split", locale: "tr", updated: "Güncelleme: {date}", read: "{n} dakikalık okuma", toc: "Bu sayfada" },
  id: { language: "Bahasa Indonesia", brand: "Blitz Split", locale: "id", updated: "Diperbarui {date}", read: "Dibaca {n} menit", toc: "Di halaman ini" },
  ja: { language: "日本語", brand: "Blitz Split", locale: "ja", updated: "{date}更新", read: "読了時間：約{n}分", toc: "このページの内容" },
  ru: { language: "Русский", brand: "Blitz Split", locale: "ru", updated: "Обновлено {date}", read: "{n} мин чтения", toc: "На этой странице" },
  uk: { language: "Українська", brand: "Blitz Split", locale: "uk", updated: "Оновлено {date}", read: "{n} хв читання", toc: "На цій сторінці" },
  ko: { language: "한국어", brand: "Blitz Split", locale: "ko", updated: "{date} 업데이트", read: "{n}분 분량", toc: "이 페이지의 내용" },
  ar: { language: "العربية", brand: "Blitz Split", locale: "ar-u-nu-latn", updated: "آخر تحديث: {date}", read: (n) => `مدة القراءة: ${arabicMinutes(n)}`, toc: "في هذه الصفحة" },
  hi: { language: "हिन्दी", brand: "Blitz Split", locale: "hi", updated: "{date} को अपडेट किया गया", read: "{n} मिनट में पढ़ें", toc: "इस पेज पर" },
  zh: { language: "中文（简体）", brand: "Blitz Split", locale: "zh-Hans", updated: "更新于{date}", read: "阅读约需{n}分钟", toc: "本页内容" },
  he: { language: "עברית", brand: "Blitz Split", locale: "he", updated: "עדכון אחרון: {date}", read: "זמן קריאה: {n} דק׳", toc: "בדף הזה" },
  th: { language: "ไทย", brand: "Blitz Split", locale: "th", updated: "อัปเดตเมื่อ {date}", read: "ใช้เวลาอ่าน {n} นาที", toc: "ในหน้านี้" },
  vi: { language: "Tiếng Việt", brand: "Blitz Split", locale: "vi", updated: "Cập nhật ngày {date}", read: "{n} phút đọc", toc: "Trong trang này" },
  "zh-Hant": { language: "中文（繁體）", brand: "Blitz Split", locale: "zh-Hant", updated: "更新於{date}", read: "閱讀約需{n}分鐘", toc: "本頁內容" },
  sv: { language: "Svenska", brand: "Blitz Split", locale: "sv", updated: "Uppdaterad {date}", read: "{n} min läsning", toc: "På den här sidan" },
  cs: { language: "Čeština", brand: "Blitz Split", locale: "cs", updated: "Aktualizováno {date}", read: "{n} min čtení", toc: "Na této stránce" },
  ro: { language: "Română", brand: "Blitz Split", locale: "ro", updated: "Actualizat la {date}", read: "{n} min de citit", toc: "Pe această pagină" },
  bn: { language: "বাংলা", brand: "Blitz Split", locale: "bn-u-nu-latn", updated: "আপডেট: {date}", read: "পড়তে {n} মিনিট", toc: "এই পৃষ্ঠায়" },
  ms: { language: "Bahasa Melayu", brand: "Blitz Split", locale: "ms", updated: "Dikemas kini pada {date}", read: "{n} min bacaan", toc: "Di halaman ini" },
  el: { language: "Ελληνικά", brand: "Blitz Split", locale: "el", updated: "Ενημερώθηκε: {date}", read: "{n} λεπ. ανάγνωσης", toc: "Σε αυτή τη σελίδα" },
  hu: { language: "Magyar", brand: "Blitz Split", locale: "hu", updated: "Frissítve: {date}", read: "{n} perc olvasás", toc: "Ezen az oldalon" },
  fil: { language: "Filipino", brand: "Blitz Split", locale: "fil", updated: "Na-update: {date}", read: "Babasahin sa {n} min", toc: "Sa pahinang ito" },
  ur: { language: "اردو", brand: "Blitz Split", locale: "ur-u-nu-latn", updated: "آخری تازہ کاری: {date}", read: "پڑھنے کا وقت: {n} منٹ", toc: "اس صفحے پر" },
  hr: { language: "Hrvatski", brand: "Blitz Split", locale: "hr", updated: "Ažurirano {date}", read: "{n} min čitanja", toc: "Na ovoj stranici" },
  sr: { language: "Srpski", brand: "Blitz Split", locale: "sr-Latn", updated: "Ažurirano {date}", read: "{n} min čitanja", toc: "Na ovoj stranici" },
  sk: { language: "Slovenčina", brand: "Blitz Split", locale: "sk", updated: "Aktualizované {date}", read: "{n} min čítania", toc: "Na tejto stránke" },
  nb: { language: "Norsk bokmål", brand: "Blitz Split", locale: "nb", updated: "Oppdatert {date}", read: "{n} min lesetid", toc: "På denne siden" },
  fa: { language: "فارسی", brand: "Blitz Split", locale: "fa-u-nu-latn-ca-gregory", updated: "آخرین به‌روزرسانی: {date}", read: "زمان مطالعه: {n} دقیقه", toc: "در این صفحه" },
  sw: { language: "Kiswahili", brand: "Blitz Split", locale: "sw", updated: "Imesasishwa {date}", read: "Dakika {n} za kusoma", toc: "Kwenye ukurasa huu" },
  ta: { language: "தமிழ்", brand: "Blitz Split", locale: "ta", updated: "புதுப்பிக்கப்பட்டது: {date}", read: "படிக்க {n} நிமிடம்", toc: "இந்தப் பக்கத்தில்" },
  te: { language: "తెలుగు", brand: "Blitz Split", locale: "te", updated: "చివరి అప్‌డేట్: {date}", read: (n) => `చదవడానికి ${n} ${Number(n) === 1 ? "నిమిషం" : "నిమిషాలు"}`, toc: "ఈ పేజీలో" },
  mr: { language: "मराठी", brand: "Blitz Split", locale: "mr-u-nu-latn", updated: "शेवटचे अपडेट: {date}", read: (n) => `वाचायला ${n} ${Number(n) === 1 ? "मिनिट" : "मिनिटे"}`, toc: "या पेजवर" },
  bg: { language: "Български", brand: "Blitz Split", locale: "bg", updated: "Обновено на {date}", read: "{n} мин. четене", toc: "На тази страница" },
  ca: { language: "Català", brand: "Blitz Split", locale: "ca", updated: "Actualitzat el {date}", read: "{n} min de lectura", toc: "En aquesta pàgina" },
  da: { language: "Dansk", brand: "Blitz Split", locale: "da", updated: "Opdateret {date}", read: "{n} min. læsetid", toc: "På denne side" },
  fi: { language: "Suomi", brand: "Blitz Split", locale: "fi", updated: "Päivitetty {date}", read: "Lukuaika {n} min", toc: "Tällä sivulla" },
  lv: { language: "Latviešu", brand: "Blitz Split", locale: "lv", updated: "Atjaunināts: {date}", read: "Lasīšanas laiks: {n} min", toc: "Šajā lapā" },
};
// The characters a language's reader takes in per minute, as the IReST study measured them (Trauzettel-Klosinski and
// Dietz, IOVS 2012). Why characters: what a word is differs too much between languages to compare their texts by words.
const CHARACTERS_PER_MINUTE = {
  ar: 612, de: 920, en: 987, es: 1025, fr: 998, he: 833, it: 950, ja: 357, nl: 978, pl: 916, pt: 913, "pt-PT": 913,
  ru: 986, sv: 917, tr: 1054, zh: 255, "zh-Hant": 255, fi: 1078,
  // Why: the study has no Korean, and a Hangul block is one syllable, so this is its average of syllables per minute.
  ko: 370,
  // Why: the study has no Ukrainian, and Russian is the closest language it measured, in the same script.
  uk: 986,
  // Why: the study has no Bulgarian either, and Russian is the closest language it measured, in the same script.
  bg: 986,
  // Why: the study has no Urdu, and Arabic is the closest language it measured, in the same script.
  ur: 612,
  // Why: the study has no Norwegian, and Swedish is the closest language it measured.
  nb: 917,
  // Why: the study has no Persian, and Arabic is the closest language it measured, in the same script.
  fa: 612,
  // Why: the study has no Danish, and Swedish is the closest language it measured.
  da: 917,
};
// The study's median without Chinese and Japanese, for a language it didn't measure. Why without them: a character of
// theirs holds far more than a letter, so they would slow down every language written with letters.
const DEFAULT_CHARACTERS_PER_MINUTE = 950;
// The languages whose pace is per syllable or ideograph: the Latin letters and digits in their texts (the companies'
// names, an address, a date) go at the default pace, since a reader doesn't take one Latin letter as long as a syllable.
const SYLLABLE_PACED = new Set(["ja", "ko", "zh", "zh-Hant"]);

// Each page's sections' anchors by language, read before any page is written, so a link to a section checks it exists.
const ANCHORS = {};

class LegalError extends Error {}
const fail = (file, line, message) => { throw new LegalError(`${file}:${line}: ${message}`); };

// --- Markdown to blocks ---------------------------------------------------------------------------------------------

/** The document of a Markdown file: its front matter and its blocks, a callout holding blocks of its own. */
function parse(file, source) {
  const lines = source.replace(/\n$/, "").split("\n");
  if (lines[0] !== "---") fail(file, 1, "the file must start with its front matter (---)");
  const end = lines.indexOf("---", 1);
  if (end < 0) fail(file, 1, "the front matter has no closing ---");
  const meta = {};
  for (let i = 1; i < end; i++) {
    const match = /^([a-z]+): (.+)$/.exec(lines[i]);
    if (!match) fail(file, i + 1, "a front matter line is `key: value`");
    meta[match[1]] = match[2];
  }
  if (!meta.title) fail(file, 1, "the front matter needs a title");
  if (!isDate(meta.updated)) fail(file, 1, "the front matter needs updated: YYYY-MM-DD");
  if (Object.keys(meta).length !== 2) fail(file, 1, "the front matter takes only title and updated");
  const body = lines.slice(end + 1);
  return { meta, blocks: parseBlocks(file, body, end + 2, false) };
}

/** The texts a block shows, with the Markdown still in them. */
function blockTexts(block) {
  switch (block.kind) {
    case "list": return block.items;
    case "table": return [...block.header, ...block.rows.flat()];
    case "callout": return [block.title, ...blockTexts(block.body)];
    default: return [block.text];
  }
}

/** The minutes a language's reader takes over a text: its letters, marks and digits, without the links' addresses. */
function readingMinutes(lang, blocks) {
  const shown = blocks.flatMap(blockTexts).join(" ").replace(/\]\([^)\s]+\)/g, "").replace(/<\/?mark>/g, "");
  // Why NFC: a letter written as a base and a combining accent is still one letter to its reader. Why marks: a Hindi or
  // Thai vowel sign is a vowel, which the languages the paces were measured in write as a letter. Why not an Indic virama
  // (Hindi's halant, Bengali's hasanta, Tamil's pulli…): it takes the vowel away from a letter, and most words have one.
  const characters = shown.normalize("NFC").match(/(?![\u094D\u09CD\u0A4D\u0ACD\u0B4D\u0BCD\u0C4D\u0CCD\u0D4D])[\p{L}\p{M}\p{N}]/gu) ?? [];
  const latin = SYLLABLE_PACED.has(lang) ? characters.filter((character) => /[\p{Script=Latin}\p{Nd}]/u.test(character)).length : 0;
  return Math.ceil((characters.length - latin) / (CHARACTERS_PER_MINUTE[lang] ?? DEFAULT_CHARACTERS_PER_MINUTE) + latin / DEFAULT_CHARACTERS_PER_MINUTE);
}

function parseBlocks(file, lines, firstLine, inCallout) {
  const blocks = [];
  let i = 0;
  const lineOf = (index) => firstLine + index;
  // The lines from i while they match, as one block.
  const take = (pattern) => {
    const start = i;
    while (i < lines.length && pattern.test(lines[i])) i++;
    return lines.slice(start, i);
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line === "") { i++; continue; }
    if (i > 0 && lines[i - 1] !== "") fail(file, lineOf(i), "a blank line must come between two blocks");
    const at = lineOf(i);
    if (line.startsWith("## ")) {
      const match = /^## (.+) \{#([a-z0-9-]+)\}$/.exec(line);
      if (!match) fail(file, at, "a section is `## Title {#anchor}`");
      if (inCallout) fail(file, at, "a callout takes no section");
      // Why: the title is also the link of its entry in the page's list of sections, and a link can't hold another.
      if (match[1].includes("](")) fail(file, at, "a section's title takes no link");
      blocks.push({ kind: "section", at, text: match[1], anchor: match[2] });
      i++;
    } else if (line.startsWith("### ")) {
      if (inCallout) fail(file, at, "a callout takes no heading");
      blocks.push({ kind: "heading", at, text: line.slice(4) });
      i++;
    } else if (line.startsWith("#")) {
      fail(file, at, "only ## and ### headings");
    } else if (line.startsWith("- ")) {
      blocks.push({ kind: "list", at, items: take(/^- /).map((item) => item.slice(2)) });
    } else if (line.startsWith("|")) {
      if (inCallout) fail(file, at, "a callout takes no table");
      const rows = take(/^\|/).map((row, index) => {
        if (!/^\| .+ \|$/.test(row)) fail(file, at + index, "a table row is `| cell | cell |`");
        return row.slice(2, -2).split(" | ");
      });
      if (rows.length < 3 || rows[1].some((cell) => cell !== "---")) fail(file, at, "a table is a header row, `| --- |` and rows");
      if (rows.some((row) => row.length !== rows[0].length)) fail(file, at, "every row of a table has the header's cells");
      blocks.push({ kind: "table", at, header: rows[0], rows: rows.slice(2) });
    } else if (line.startsWith(">")) {
      if (inCallout) fail(file, at, "a callout takes no callout");
      const quoted = take(/^>/).map((row, index) => {
        if (row !== ">" && !row.startsWith("> ")) fail(file, at + index, "a callout line is `> text` or `>`");
        return row.slice(2);
      });
      const title = /^\*\*(.+)\*\*$/.exec(quoted[0]);
      if (!title || quoted[1] !== "") fail(file, at, "a callout starts with `> **Title**` and a `>` line");
      const body = parseBlocks(file, quoted.slice(2), at + 2, true);
      if (body.length !== 1) fail(file, at, "a callout holds its title and one paragraph or list");
      blocks.push({ kind: "callout", at, title: title[1], body: body[0] });
    } else {
      // A numbered or `*`/`+` list, code, a rule or an indented block; a paragraph may still start with **bold**.
      if (/^(\d+\.\s|[*+]\s|```|~~~|---|    |\t)/.test(line)) fail(file, at, "not a construct the legal pages take (docs/legal.md)");
      blocks.push({ kind: "paragraph", at, text: line });
      i++;
    }
  }
  return blocks;
}

// --- Inline text ----------------------------------------------------------------------------------------------------

// An attribute's value, from text already escaped as HTML: no tags, and no quote to close it early.
const attribute = (html) => html.replace(/<[^>]*>/g, "").replace(/"/g, "&quot;");

/** A text with **bold**, [links](address) and <mark>what is still to decide</mark>, as HTML. */
function inline(file, at, lang, text) {
  let html = "";
  let rest = text;
  const token = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|<mark>(.+?)<\/mark>/;
  while (rest) {
    const match = token.exec(rest);
    const plain = match ? rest.slice(0, match.index) : rest;
    if (/[*[\]<>`\\]|(^|\s)_|_(\s|$)/.test(plain)) fail(file, at, `"${plain.trim()}" has Markdown the legal pages don't take (docs/legal.md)`);
    html += escapeHtml(plain);
    if (!match) break;
    if (match[1] !== undefined) html += `<strong>${inline(file, at, lang, match[1])}</strong>`;
    else if (match[2] !== undefined) html += `<a href="${attribute(escapeHtml(address(file, at, lang, match[3])))}">${inline(file, at, lang, match[2])}</a>`;
    else html += `<span class="todo">${inline(file, at, lang, match[4])}</span>`;
    rest = rest.slice(match.index + match[0].length);
  }
  return html;
}

/** A link's address on the page: a section of a legal page is `/page#anchor` in Markdown and `/page#language-anchor` here. */
function address(file, at, lang, href) {
  if (/^mailto:[^@\s]+@[^@\s]+$/.test(href) || /^https:\/\//.test(href)) return href;
  const match = /^\/(privacy|terms)(?:#([a-z0-9-]+))?$/.exec(href);
  if (!match) fail(file, at, `a link goes to /privacy, /terms, one of their sections, https:// or mailto:, not ${href}`);
  // Why: each language names its own anchors (#keep, #tempo), so a link copied from another language goes nowhere.
  if (match[2] && !ANCHORS[match[1]][lang].includes(match[2])) fail(file, at, `${match[1]} has no section {#${match[2]}} in this language`);
  return match[2] ? `/${match[1]}#${lang}-${match[2]}` : href;
}

// --- Blocks to HTML -------------------------------------------------------------------------------------------------

function renderBlock(file, lang, block, pad) {
  const text = (value) => inline(file, block.at, lang, value);
  switch (block.kind) {
    case "heading": return [`${pad}<h3>${text(block.text)}</h3>`];
    case "paragraph": return [`${pad}<p>${text(block.text)}</p>`];
    case "list": return [`${pad}<ul>`, ...block.items.map((item) => `${pad}  <li>${text(item)}</li>`), `${pad}</ul>`];
    case "callout":
      if (block.body.kind !== "paragraph") fail(file, block.at, "a callout inside a section holds a paragraph");
      return [`${pad}<div class="callout">`, `${pad}  <strong>${text(block.title)}</strong>`, `${pad}  ${text(block.body.text)}`, `${pad}</div>`];
    case "table": {
      const labels = block.header.map((cell) => text(cell));
      const row = (cells) => `<tr>${cells.map((cell, index) => `<td data-label="${attribute(labels[index])}">${text(cell)}</td>`).join("")}</tr>`;
      return [
        `${pad}<div class="table-wrap">`,
        `${pad}  <table>`,
        `${pad}    <thead><tr>${labels.map((label) => `<th>${label}</th>`).join("")}</tr></thead>`,
        `${pad}    <tbody>`,
        ...block.rows.map((cells) => `${pad}      ${row(cells)}`),
        `${pad}    </tbody>`,
        `${pad}  </table>`,
        `${pad}</div>`,
      ];
    }
    default: return fail(file, block.at, `a ${block.kind} can't come here`);
  }
}

/** A language's block of a page: the hero, the sections' list and the text. */
function renderLanguage(page, lang, file, doc) {
  const chrome = CHROME[lang];
  const minutes = String(readingMinutes(lang, doc.blocks));
  const [summary, ...rest] = doc.blocks;
  if (summary?.kind !== "callout" || summary.body.kind !== "list") fail(file, summary?.at ?? 1, "the text starts with its summary: a callout holding a list");
  if (rest[0]?.kind !== "section") fail(file, rest[0]?.at ?? 1, "a section (##) comes after the summary");
  const sections = [];
  for (const block of rest) {
    if (block.kind === "section") sections.push({ ...block, blocks: [] });
    else sections[sections.length - 1].blocks.push(block);
  }
  const anchors = sections.map((section) => section.anchor);
  const repeated = anchors.find((anchor, index) => anchors.indexOf(anchor) !== index);
  if (repeated) fail(file, 1, `two sections are {#${repeated}}`);

  const date = longDate(chrome.locale, doc.meta.updated);
  const updated = (typeof chrome.updated === "string" ? chrome.updated : chrome.updated[page]).replace("{date}", date);
  const text = (at, value) => inline(file, at, lang, value);

  return [
    `    <!-- ============================ ${chrome.language} ============================ -->`,
    `    <div data-lang="${lang}">`,
    `      <div class="legal-hero">`,
    `        <div class="wrap">`,
    `          <a class="crumbs" href="/">${ICON("left")}${chrome.brand}</a>`,
    `          <h1>${escapeHtml(doc.meta.title)}</h1>`,
    `          <div class="meta">`,
    `            <span>${ICON("cal")}${updated}</span>`,
    `            <span>${ICON("clock")}${typeof chrome.read === "function" ? chrome.read(minutes) : chrome.read.replace("{n}", minutes)}</span>`,
    `          </div>`,
    `        </div>`,
    `      </div>`,
    `      <div class="wrap legal-layout">`,
    `        <aside class="toc">`,
    `          <details>`,
    `            <summary>${chrome.toc}${ICON("down")}</summary>`,
    `            <ol>`,
    ...sections.map((section) => `              <li><a href="#${lang}-${section.anchor}">${text(section.at, section.text)}</a></li>`),
    `            </ol>`,
    `          </details>`,
    `        </aside>`,
    ``,
    `        <article class="prose">`,
    `          <div class="summary-card">`,
    `            <h2>${ICON("shield")}${text(summary.at, summary.title)}</h2>`,
    `            <ul>`,
    ...summary.body.items.map((item) => `              <li>${ICON("check")}${text(summary.at, item)}</li>`),
    `            </ul>`,
    `          </div>`,
    ...sections.flatMap((section, index) => [
      ``,
      `          <section id="${lang}-${section.anchor}">`,
      `            <h2><span class="n">${index + 1}</span>${text(section.at, section.text)}</h2>`,
      ...section.blocks.flatMap((block) => renderBlock(file, lang, block, "            ")),
      `          </section>`,
    ]),
    `        </article>`,
    `      </div>`,
    `    </div>`,
  ];
}

// --- Pages ----------------------------------------------------------------------------------------------------------

/** What every language's text shares with English's: its sections, and each one's tables by columns and rows. A
 *  language may still word a paragraph or a list its own way. */
const shape = (blocks) => blocks
  .filter((block) => block.kind === "section" || block.kind === "table")
  .map((block) => (block.kind === "table" ? `table(${block.header.length}x${block.rows.length})` : "section"))
  .join(" ");

/** A page's documents by language, checked against English's, its sections' anchors kept in ANCHORS. */
function loadPage(page) {
  const docs = {};
  for (const lang of LANGS) {
    const file = `${LEGAL_DIR}/${page}.${lang}.md`;
    let source;
    try { source = readFileSync(file, "utf8"); } catch { fail(file, 1, "the file is missing: every legal language has every page"); }
    docs[lang] = { file, ...parse(file, source) };
  }
  const english = docs.en;
  ANCHORS[page] = {};
  for (const lang of LANGS) {
    const doc = docs[lang];
    if (doc.meta.updated !== english.meta.updated) fail(doc.file, 1, `updated is ${doc.meta.updated}, and ${english.meta.updated} in English`);
    if (shape(doc.blocks) !== shape(english.blocks)) fail(doc.file, 1, "the sections and their tables aren't English's: the same sections in the same order, each with the same tables");
    ANCHORS[page][lang] = doc.blocks.filter((block) => block.kind === "section").map((block) => block.anchor);
  }
  return docs;
}

function renderPage(page, docs) {
  return LANGS.flatMap((lang) => renderLanguage(page, lang, docs[lang].file, docs[lang])).join("\n");
}

function build(check) {
  const known = new Set(PAGES.flatMap((page) => LANGS.map((lang) => `${page}.${lang}.md`)));
  // Why: a hidden file a system leaves (macOS's .DS_Store) isn't a misnamed legal text.
  for (const name of readdirSync(LEGAL_DIR)) if (!name.startsWith(".") && !known.has(name)) fail(`${LEGAL_DIR}/${name}`, 1, "not a page and a language of the legal pages");
  const docs = Object.fromEntries(PAGES.map((page) => [page, loadPage(page)]));
  let stale = false;
  for (const page of PAGES) {
    const file = `public/${page}.html`;
    const html = readFileSync(file, "utf8");
    const next = withMain(html, renderPage(page, docs[page]));
    if (next === null) fail(file, 1, "no <main id=\"main\"> … </main> to write the text in");
    if (next === html) continue;
    if (check) {
      console.error(`${file} isn't what ${LEGAL_DIR}/${page}.*.md gives: run npm run build:legal and commit it.`);
      stale = true;
    } else {
      writeFileSync(file, next);
      console.log(`Wrote ${file}`);
    }
  }
  return stale;
}

try {
  if (build(process.argv.includes("--check"))) process.exit(1);
} catch (error) {
  if (!(error instanceof LegalError)) throw error;
  console.error(error.message);
  process.exit(1);
}
