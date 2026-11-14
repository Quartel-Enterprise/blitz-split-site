// Writes what each version of the app changed, from release-notes/<language>/<version>.json, the one place the notes
// are written, into the two things that are read:
//
// - public/release-notes/<language>.json, the feed the apps download: every version of that language, newest first.
// - public/release-notes.html, the page, between <main> and </main>: a block per language, newest first.
//
//   node scripts/build-release-notes.mjs           writes the feeds and the page
//   node scripts/build-release-notes.mjs --check   fails when one isn't what the notes give (CI)
//
// docs/release-notes.md says what a version's file takes.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON, escapeHtml, isDate, longDate, withMain } from "./lib/pages.mjs";

// The paths below are the repository's, wherever the script is run from.
process.chdir(join(dirname(fileURLToPath(import.meta.url)), ".."));

// The order of the page's blocks. English is what every other language is checked against.
const LANGS = ["pt", "en", "es", "fr", "de", "it", "pl", "nl", "tr", "id", "ja"];
const SOURCE_DIR = "release-notes";
const FEED_DIR = "public/release-notes";
const PAGE = "public/release-notes.html";
// The platforms a note names, in the order the page lists them; "all" stands alone, for every one of them.
const PLATFORMS = ["android", "ios", "mac", "web"];
// A version's name as the app's version.properties and its beta tags write it: 3.1.0, 3.1.0-beta_2.
// Why no leading zero: 3.01.0 and 3.1.0 would be two files of one version.
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-beta_([1-9]\d*))?$/;

const CHROME = {
  pt: { language: "Português", brand: "Bora Rachar", locale: "pt-BR", title: "Novidades", lead: "O que mudou em cada versão do app.", showBeta: "Mostrar versões beta", beta: "Beta", empty: "Ainda não há uma versão estável. Ative as versões beta para ver o que está em teste.", platforms: { android: "Android", ios: "iPhone e iPad", mac: "Mac", web: "Web" } },
  en: { language: "English", brand: "Blitz Split", locale: "en-US", title: "What's new", lead: "What changed in each version of the app.", showBeta: "Show beta versions", beta: "Beta", empty: "There is no stable version yet. Turn on beta versions to see what is being tested.", platforms: { android: "Android", ios: "iPhone and iPad", mac: "Mac", web: "Web" } },
  es: { language: "Español", brand: "Blitz Split", locale: "es", title: "Novedades", lead: "Qué cambió en cada versión de la app.", showBeta: "Mostrar versiones beta", beta: "Beta", empty: "Todavía no hay una versión estable. Activa las versiones beta para ver lo que está en pruebas.", platforms: { android: "Android", ios: "iPhone y iPad", mac: "Mac", web: "Web" } },
  fr: { language: "Français", brand: "Blitz Split", locale: "fr", title: "Nouveautés", lead: "Ce qui a changé dans chaque version de l’application.", showBeta: "Afficher les versions bêta", beta: "Bêta", empty: "Il n’y a pas encore de version stable. Activez les versions bêta pour voir ce qui est en test.", platforms: { android: "Android", ios: "iPhone et iPad", mac: "Mac", web: "Web" } },
  de: { language: "Deutsch", brand: "Blitz Split", locale: "de", title: "Neuigkeiten", lead: "Was sich in jeder Version der App geändert hat.", showBeta: "Beta-Versionen anzeigen", beta: "Beta", empty: "Es gibt noch keine stabile Version. Schalte die Beta-Versionen ein, um zu sehen, was gerade getestet wird.", platforms: { android: "Android", ios: "iPhone und iPad", mac: "Mac", web: "Web" } },
  it: { language: "Italiano", brand: "Blitz Split", locale: "it", title: "Novità", lead: "Cosa è cambiato in ogni versione dell’app.", showBeta: "Mostra versioni beta", beta: "Beta", empty: "Non c’è ancora una versione stabile. Attiva le versioni beta per vedere cosa è in prova.", platforms: { android: "Android", ios: "iPhone e iPad", mac: "Mac", web: "Web" } },
  pl: { language: "Polski", brand: "Blitz Split", locale: "pl", title: "Co nowego", lead: "Co zmieniło się w każdej wersji aplikacji.", showBeta: "Pokaż wersje beta", beta: "Beta", empty: "Nie ma jeszcze wersji stabilnej. Włącz wersje beta, aby zobaczyć, co jest testowane.", platforms: { android: "Android", ios: "iPhone i iPad", mac: "Mac", web: "Web" } },
  nl: { language: "Nederlands", brand: "Blitz Split", locale: "nl", title: "Wat is er nieuw", lead: "Wat er in elke versie van de app is veranderd.", showBeta: "Bètaversies tonen", beta: "Bèta", empty: "Er is nog geen stabiele versie. Zet bètaversies aan om te zien wat er wordt getest.", platforms: { android: "Android", ios: "iPhone en iPad", mac: "Mac", web: "Web" } },
  tr: { language: "Türkçe", brand: "Blitz Split", locale: "tr", title: "Yenilikler", lead: "Uygulamanın her sürümünde neler değişti.", showBeta: "Beta sürümlerini göster", beta: "Beta", empty: "Henüz kararlı bir sürüm yok. Nelerin test edildiğini görmek için beta sürümlerini aç.", platforms: { android: "Android", ios: "iPhone ve iPad", mac: "Mac", web: "Web" } },
  id: { language: "Bahasa Indonesia", brand: "Blitz Split", locale: "id", title: "Yang baru", lead: "Apa yang berubah di setiap versi aplikasi.", showBeta: "Tampilkan versi beta", beta: "Beta", empty: "Belum ada versi stabil. Aktifkan versi beta untuk melihat apa yang sedang diuji.", platforms: { android: "Android", ios: "iPhone dan iPad", mac: "Mac", web: "Web" } },
  ja: { language: "日本語", brand: "Blitz Split", locale: "ja", title: "新機能", lead: "アプリの各バージョンでの変更点。", showBeta: "ベータ版を表示", beta: "ベータ", empty: "安定版はまだありません。ベータ版を表示すると、テスト中の内容を確認できます。", platforms: { android: "Android", ios: "iPhoneとiPad", mac: "Mac", web: "Web" } },
};

class NotesError extends Error {}
const fail = (file, message) => { throw new NotesError(`${file}: ${message}`); };

// --- The notes ------------------------------------------------------------------------------------------------------

/** A version's name as numbers to order by: a version's betas come before it, in their own order. */
function versionKey(name) {
  const [, major, minor, patch, beta] = VERSION.exec(name);
  return [Number(major), Number(minor), Number(patch), beta === undefined ? Infinity : Number(beta)];
}
const newestFirst = (a, b) => {
  const [x, y] = [versionKey(a), versionKey(b)];
  const at = x.findIndex((part, index) => part !== y[index]);
  return at < 0 ? 0 : y[at] > x[at] ? 1 : -1;
};

/** A version's file: the day it came out and its notes, each a text and the platforms it is for. */
function readVersion(file) {
  let release;
  try { release = JSON.parse(readFileSync(file, "utf8")); } catch (error) { fail(file, `not JSON: ${error.message}`); }
  const only = (value, keys, what) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) fail(file, `${what} is an object`);
    const other = Object.keys(value).find((key) => !keys.includes(key));
    if (other) fail(file, `${what} takes only ${keys.join(" and ")}, not ${other}`);
  };
  only(release, ["date", "notes"], "the file");
  if (!isDate(release.date)) fail(file, "date is YYYY-MM-DD");
  if (!Array.isArray(release.notes) || release.notes.length === 0) fail(file, "notes is a list with at least one note");
  release.notes.forEach((note, index) => {
    const what = `note ${index + 1}`;
    only(note, ["text", "platforms"], what);
    // Why: the apps and the page draw a note as one plain line.
    if (typeof note.text !== "string" || note.text.trim() === "" || note.text !== note.text.trim() || /[\n\r\t]/.test(note.text)) {
      fail(file, `${what}'s text is one line, with no space around it`);
    }
    // Why: the apps draw the text as it is, so a tag or **bold** would show as written.
    if (/[<>`]|\*\*|__|\]\(/.test(note.text)) fail(file, `${what}'s text is plain, with no Markdown and no HTML`);
    const platforms = note.platforms;
    if (!Array.isArray(platforms) || platforms.length === 0) fail(file, `${what}'s platforms is a list: ["all"], or some of ${PLATFORMS.join(", ")}`);
    if (platforms.join() === "all") return;
    const unknown = platforms.find((platform) => !PLATFORMS.includes(platform));
    if (unknown !== undefined) fail(file, `${what}'s platforms takes "all" alone, or some of ${PLATFORMS.join(", ")}, not ${JSON.stringify(unknown)}`);
    if (new Set(platforms).size !== platforms.length) fail(file, `${what} names a platform twice`);
    if (platforms.length === PLATFORMS.length) fail(file, `${what} names every platform: write ["all"]`);
    if (platforms.join() !== PLATFORMS.filter((platform) => platforms.includes(platform)).join()) fail(file, `${what}'s platforms come in the order ${PLATFORMS.join(", ")}`);
  });
  return release;
}

/** Every language's versions, newest first, each language checked against English's. */
function loadNotes() {
  // Why: a hidden file a system leaves (macOS's .DS_Store) isn't a misnamed language or version.
  const visible = (dir) => readdirSync(dir).filter((name) => !name.startsWith("."));
  for (const name of visible(SOURCE_DIR)) if (!LANGS.includes(name)) fail(`${SOURCE_DIR}/${name}`, "not a language of the release notes");
  const notes = {};
  for (const lang of LANGS) {
    const dir = `${SOURCE_DIR}/${lang}`;
    try { statSync(dir); } catch { fail(dir, "the folder is missing: every language has every version"); }
    notes[lang] = {};
    for (const name of visible(dir)) {
      const version = name.replace(/\.json$/, "");
      if (!name.endsWith(".json") || !VERSION.test(version)) fail(`${dir}/${name}`, "a version's file is <version>.json: 3.1.0.json, 3.1.0-beta_2.json");
      notes[lang][version] = readVersion(`${dir}/${name}`);
    }
  }
  const versions = Object.keys(notes.en).sort(newestFirst);
  if (versions.length === 0) fail(`${SOURCE_DIR}/en`, "no version yet");
  for (const lang of LANGS) {
    const dir = `${SOURCE_DIR}/${lang}`;
    const extra = Object.keys(notes[lang]).find((version) => !versions.includes(version));
    if (extra) fail(`${dir}/${extra}.json`, "English has no such version");
    for (const version of versions) {
      const file = `${dir}/${version}.json`;
      const [release, english] = [notes[lang][version], notes.en[version]];
      if (!release) fail(file, "the file is missing: every language has every version");
      if (release.date !== english.date) fail(file, `date is ${release.date}, and ${english.date} in English`);
      if (release.notes.length !== english.notes.length) fail(file, `${release.notes.length} note(s) for ${english.notes.length} in English`);
      release.notes.forEach((note, index) => {
        if (note.platforms.join() !== english.notes[index].platforms.join()) fail(file, `note ${index + 1} is for ${note.platforms.join(", ")}, and for ${english.notes[index].platforms.join(", ")} in English`);
      });
    }
  }
  return LANGS.map((lang) => ({ lang, releases: versions.map((version) => ({ version, beta: version.includes("-beta_"), ...notes[lang][version] })) }));
}

// --- The feed and the page ------------------------------------------------------------------------------------------

/** What the apps download: a language's versions, newest first. `beta` is the version's name saying so. */
const feed = (releases) => `${JSON.stringify({ releases }, null, 2)}\n`;


function renderRelease(lang, chrome, release) {
  const [name, betaNumber] = release.version.split("-beta_");
  const date = longDate(chrome.locale, release.date);
  return [
    `        <article class="release" id="${lang}-${release.version}"${release.beta ? " data-beta" : ""}>`,
    `          <header>`,
    `            <h2>${name}</h2>`,
    ...(release.beta ? [`            <span class="release-beta">${chrome.beta} ${betaNumber}</span>`] : []),
    `            <time datetime="${release.date}">${date}</time>`,
    `          </header>`,
    `          <ul>`,
    ...release.notes.map((note) => {
      const platforms = note.platforms.join() === "all" ? "" : ` <span class="release-platforms">${note.platforms.map((platform) => `<span>${chrome.platforms[platform]}</span>`).join("")}</span>`;
      return `            <li>${escapeHtml(note.text)}${platforms}</li>`;
    }),
    `          </ul>`,
    `        </article>`,
  ];
}

/** A language's block of the page: the hero, with the switch that shows the beta versions, and the versions. */
function renderLanguage({ lang, releases }) {
  const chrome = CHROME[lang];
  return [
    `    <!-- ============================ ${chrome.language} ============================ -->`,
    `    <div data-lang="${lang}">`,
    `      <div class="legal-hero">`,
    `        <div class="wrap">`,
    `          <a class="crumbs" href="/">${ICON("left")}${chrome.brand}</a>`,
    `          <h1>${escapeHtml(chrome.title)}</h1>`,
    `          <p class="release-lead">${escapeHtml(chrome.lead)}</p>`,
    `          <label class="beta-switch"><input type="checkbox" role="switch" data-show-beta>${escapeHtml(chrome.showBeta)}</label>`,
    `        </div>`,
    `      </div>`,
    `      <div class="wrap releases">`,
    // Why: until the first stable version, the page would open with nothing on it.
    ...(releases.every((release) => release.beta) ? [`        <p class="releases-empty">${escapeHtml(chrome.empty)}</p>`] : []),
    ...releases.flatMap((release) => renderRelease(lang, chrome, release)),
    `      </div>`,
    `    </div>`,
  ];
}

function build(check) {
  const notes = loadNotes();
  const html = readFileSync(PAGE, "utf8");
  const page = withMain(html, notes.flatMap(renderLanguage).join("\n"));
  if (page === null) fail(PAGE, "no <main id=\"main\"> … </main> to write the versions in");
  const outputs = [
    ...notes.map(({ lang, releases }) => [`${FEED_DIR}/${lang}.json`, feed(releases)]),
    [PAGE, page],
  ];
  // Why: a check writes nothing, not even the folder.
  if (!check) mkdirSync(FEED_DIR, { recursive: true });
  // Why: a feed nobody writes anymore would still be served, and read by an app.
  const feeds = outputs.map(([file]) => file);
  for (const name of existsSync(FEED_DIR) ? readdirSync(FEED_DIR) : []) if (!name.startsWith(".") && !feeds.includes(`${FEED_DIR}/${name}`)) fail(`${FEED_DIR}/${name}`, "not a language's feed: delete it");
  let stale = false;
  for (const [file, next] of outputs) {
    let current = null;
    try { current = readFileSync(file, "utf8"); } catch { /* a feed not written yet */ }
    if (next === current) continue;
    if (check) {
      console.error(`${file} isn't what ${SOURCE_DIR}/ gives: run npm run build:release-notes and commit it.`);
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
  if (!(error instanceof NotesError)) throw error;
  console.error(error.message);
  process.exit(1);
}
