// Writes the legal pages' text, between <main> and </main> of public/privacy.html and public/terms.html, from the
// Markdown of public/legal/<page>.<language>.md: the one place the legal text is written. The apps read the same
// Markdown files and draw them natively, so they take only the constructs docs/legal.md lists, and anything else
// fails here instead of showing wrong in an app.
//
//   node scripts/build-legal.mjs           writes the pages
//   node scripts/build-legal.mjs --check   fails when a page isn't what its Markdown gives (CI)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const PAGES = ["privacy", "terms"];
// The order of the pages' blocks. English is what every other language is checked against.
const LANGS = ["pt", "en", "es", "nl", "tr", "id", "ja"];
const LEGAL_DIR = "public/legal";

const CHROME = {
  pt: { language: "Português", brand: "Bora Rachar", locale: "pt-BR", updated: { privacy: "Atualizada em {date}", terms: "Atualizados em {date}" }, read: "Leitura de {n} minutos", toc: "Nesta página" },
  en: { language: "English", brand: "Blitz Split", locale: "en-US", updated: "Updated {date}", read: "{n} min read", toc: "On this page" },
  es: { language: "Español", brand: "Blitz Split", locale: "es", updated: { privacy: "Actualizada el {date}", terms: "Actualizados el {date}" }, read: "Lectura de {n} minutos", toc: "En esta página" },
  nl: { language: "Nederlands", brand: "Blitz Split", locale: "nl", updated: "Bijgewerkt op {date}", read: "{n} minuten lezen", toc: "Op deze pagina" },
  tr: { language: "Türkçe", brand: "Blitz Split", locale: "tr", updated: "Güncelleme: {date}", read: "{n} dakikalık okuma", toc: "Bu sayfada" },
  id: { language: "Bahasa Indonesia", brand: "Blitz Split", locale: "id", updated: "Diperbarui {date}", read: "Dibaca {n} menit", toc: "Di halaman ini" },
  ja: { language: "日本語", brand: "Blitz Split", locale: "ja", updated: "{date}更新", read: "読了時間：約{n}分", toc: "このページの内容" },
};
// The reading time every language shows is the English text's, at this pace.
const WORDS_PER_MINUTE = 180;

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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.updated || "")) fail(file, 1, "the front matter needs updated: YYYY-MM-DD");
  if (Object.keys(meta).length !== 2) fail(file, 1, "the front matter takes only title and updated");
  const body = lines.slice(end + 1);
  return { meta, blocks: parseBlocks(file, body, end + 2, false), words: body.join(" ").split(/\s+/).filter((word) => /\p{L}/u.test(word)).length };
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
      if (/^(\d+\.|\*|\+|```|~~~|---|    |\t)/.test(line)) fail(file, at, "not a construct the legal pages take (docs/legal.md)");
      blocks.push({ kind: "paragraph", at, text: line });
      i++;
    }
  }
  return blocks;
}

// --- Inline text ----------------------------------------------------------------------------------------------------

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
    else if (match[2] !== undefined) html += `<a href="${escapeHtml(address(file, at, lang, match[3]))}">${inline(file, at, lang, match[2])}</a>`;
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
  return match[2] ? `/${match[1]}#${lang}-${match[2]}` : href;
}

// --- Blocks to HTML -------------------------------------------------------------------------------------------------

const ICON = (name) => `<svg class="icon"><use href="#i-${name}"/></svg>`;

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
      const row = (cells) => `<tr>${cells.map((cell, index) => `<td data-label="${labels[index]}">${text(cell)}</td>`).join("")}</tr>`;
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
function renderLanguage(page, lang, file, doc, minutes) {
  const chrome = CHROME[lang];
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

  const [year, month, day] = doc.meta.updated.split("-").map(Number);
  const date = new Intl.DateTimeFormat(chrome.locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
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
    `            <span>${ICON("clock")}${chrome.read.replace("{n}", minutes)}</span>`,
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
 *  language may still say something of its own (Spanish explains that it names the app's buttons in English). */
const shape = (blocks) => blocks
  .filter((block) => block.kind === "section" || block.kind === "table")
  .map((block) => (block.kind === "table" ? `table(${block.header.length}x${block.rows.length})` : "section"))
  .join(" ");

function renderPage(page) {
  const docs = {};
  for (const lang of LANGS) {
    const file = `${LEGAL_DIR}/${page}.${lang}.md`;
    let source;
    try { source = readFileSync(file, "utf8"); } catch { fail(file, 1, "the file is missing: every legal language has every page"); }
    docs[lang] = { file, ...parse(file, source) };
  }
  const english = docs.en;
  for (const lang of LANGS) {
    const doc = docs[lang];
    if (doc.meta.updated !== english.meta.updated) fail(doc.file, 1, `updated is ${doc.meta.updated}, and ${english.meta.updated} in English`);
    if (shape(doc.blocks) !== shape(english.blocks)) fail(doc.file, 1, "the sections and their tables aren't English's: the same sections in the same order, each with the same tables");
  }
  const minutes = String(Math.ceil(english.words / WORDS_PER_MINUTE));
  return LANGS.flatMap((lang) => renderLanguage(page, lang, docs[lang].file, docs[lang], minutes)).join("\n");
}

const OPEN = '  <main id="main">\n';
const CLOSE = "\n  </main>";

function build(check) {
  const known = new Set(PAGES.flatMap((page) => LANGS.map((lang) => `${page}.${lang}.md`)));
  for (const name of readdirSync(LEGAL_DIR)) if (!known.has(name)) fail(`${LEGAL_DIR}/${name}`, 1, "not a page and a language of the legal pages");
  let stale = false;
  for (const page of PAGES) {
    const file = `public/${page}.html`;
    const html = readFileSync(file, "utf8");
    const start = html.indexOf(OPEN);
    const end = html.indexOf(CLOSE);
    if (start < 0 || end < start) fail(file, 1, "no <main id=\"main\"> … </main> to write the text in");
    const next = html.slice(0, start + OPEN.length) + renderPage(page) + html.slice(end);
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
