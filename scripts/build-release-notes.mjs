// Writes what each version of the app changed, from release-notes/<language>/<version>.json, the one place the notes
// are written, into the two things that are read:
//
// - public/release-notes/<language>.json, the feed the apps download: every version of that language, newest first.
// - public/release-notes.html, the page: pages/release-notes.html with a block per language, newest first.
//
// Neither is in git: `wrangler deploy` and `wrangler dev` write them first (wrangler.jsonc's build).
//
//   node scripts/build-release-notes.mjs           writes the feeds and the page
//   node scripts/build-release-notes.mjs --check   only fails on a wrong file, writing nothing (CI)
//
// docs/release-notes.md says what a version's file takes.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON, LANGS, escapeHtml, isDate, longDate, withMain } from "./lib/pages.mjs";

// The paths below are the repository's, wherever the script is run from.
process.chdir(join(dirname(fileURLToPath(import.meta.url)), ".."));

const SOURCE_DIR = "release-notes";
const FEED_DIR = "public/release-notes";
// The page's shell, written by hand: its header, its footer and its strings, with nothing between <main> and </main>.
const TEMPLATE = "pages/release-notes.html";
const PAGE = "public/release-notes.html";
// The platforms a note names, in the order the page lists them; "all" stands alone, for every one of them.
const PLATFORMS = ["android", "ios", "mac", "web"];
// A version's name as the app's version.properties and its beta tags write it: 3.1.0, 3.1.0-beta_2.
// Why no leading zero: 3.01.0 and 3.1.0 would be two files of one version.
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-beta_([1-9]\d*))?$/;

const CHROME = {
  pt: { language: "Português", brand: "Bora Rachar", locale: "pt-BR", title: "Novidades", lead: "O que mudou em cada versão do app.", showBeta: "Mostrar versões beta", beta: "Beta", empty: "Ainda não há uma versão estável. Ative as versões beta para ver o que está em teste.", platforms: { android: "Android", ios: "iPhone e iPad", mac: "Mac", web: "Web" } },
  "pt-PT": { language: "Português (Portugal)", brand: "Blitz Split", locale: "pt-PT", title: "Novidades", lead: "O que mudou em cada versão da app.", showBeta: "Mostrar versões beta", beta: "Beta", empty: "Ainda não há uma versão estável. Ativa as versões beta para ver o que está em teste.", platforms: { android: "Android", ios: "iPhone e iPad", mac: "Mac", web: "Web" } },
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
  ru: { language: "Русский", brand: "Blitz Split", locale: "ru", title: "Что нового", lead: "Что изменилось в каждой версии приложения.", showBeta: "Показывать бета-версии", beta: "Бета", empty: "Стабильной версии пока нет. Включи бета-версии, чтобы увидеть, что сейчас тестируется.", platforms: { android: "Android", ios: "iPhone и iPad", mac: "Mac", web: "Веб" } },
  uk: { language: "Українська", brand: "Blitz Split", locale: "uk", title: "Що нового", lead: "Що змінилося в кожній версії застосунку.", showBeta: "Показувати бета-версії", beta: "Бета", empty: "Стабільної версії ще немає. Увімкни бета-версії, щоб побачити, що зараз тестується.", platforms: { android: "Android", ios: "iPhone і iPad", mac: "Mac", web: "Веб" } },
  ko: { language: "한국어", brand: "Blitz Split", locale: "ko", title: "새로운 기능", lead: "앱의 버전마다 바뀐 내용이에요.", showBeta: "베타 버전 보기", beta: "베타", empty: "아직 정식 버전이 없어요. 베타 버전을 켜면 테스트 중인 내용을 볼 수 있어요.", platforms: { android: "Android", ios: "iPhone 및 iPad", mac: "Mac", web: "웹" } },
  ar: { language: "العربية", brand: "Blitz Split", locale: "ar-u-nu-latn", title: "ما الجديد", lead: "ما الذي تغيّر في كل إصدار من التطبيق.", showBeta: "عرض الإصدارات التجريبية", beta: "تجريبي", empty: "لا يوجد إصدار مستقر بعد. يمكن تشغيل الإصدارات التجريبية لمعرفة ما يتم اختباره.", platforms: { android: "Android", ios: "iPhone وiPad", mac: "Mac", web: "الويب" } },
  hi: { language: "हिन्दी", brand: "Blitz Split", locale: "hi", title: "नया क्या है", lead: "ऐप के हर वर्शन में क्या बदला।", showBeta: "बीटा वर्शन दिखाएं", beta: "बीटा", empty: "अभी कोई स्टेबल वर्शन नहीं है। जो टेस्ट हो रहा है उसे देखने के लिए बीटा वर्शन चालू करें।", platforms: { android: "Android", ios: "iPhone और iPad", mac: "Mac", web: "वेब" } },
  zh: { language: "中文（简体）", brand: "Blitz Split", locale: "zh-Hans", title: "更新说明", lead: "应用每个版本的变化。", showBeta: "显示测试版", beta: "测试版", empty: "还没有正式版。打开测试版，看看正在测试的内容。", platforms: { android: "Android", ios: "iPhone和iPad", mac: "Mac", web: "网页版" } },
  he: { language: "עברית", brand: "Blitz Split", locale: "he", title: "מה חדש", lead: "מה השתנה בכל גרסה של האפליקציה.", showBeta: "הצגת גרסאות בטא", beta: "בטא", empty: "עדיין אין גרסה יציבה. אפשר להפעיל את גרסאות הבטא כדי לראות מה נמצא בבדיקה.", platforms: { android: "Android", ios: "iPhone ו-iPad", mac: "Mac", web: "ווב" } },
  th: { language: "ไทย", brand: "Blitz Split", locale: "th", title: "บันทึกประจำรุ่น", lead: "สิ่งที่เปลี่ยนไปในแอปแต่ละเวอร์ชัน", showBeta: "แสดงเวอร์ชันเบต้า", beta: "เบต้า", empty: "ยังไม่มีเวอร์ชันเสถียร เปิดเวอร์ชันเบต้าเพื่อดูสิ่งที่กำลังทดสอบอยู่", platforms: { android: "Android", ios: "iPhone และ iPad", mac: "Mac", web: "เว็บ" } },
  vi: { language: "Tiếng Việt", brand: "Blitz Split", locale: "vi", title: "Ghi chú phát hành", lead: "Những thay đổi trong mỗi phiên bản của ứng dụng.", showBeta: "Hiện các phiên bản beta", beta: "Beta", empty: "Chưa có phiên bản ổn định. Hãy bật các phiên bản beta để xem những gì đang được thử nghiệm.", platforms: { android: "Android", ios: "iPhone và iPad", mac: "Mac", web: "Web" } },
  "zh-Hant": { language: "中文（繁體）", brand: "Blitz Split", locale: "zh-Hant", title: "版本資訊", lead: "App每個版本的變化。", showBeta: "顯示測試版", beta: "測試版", empty: "還沒有正式版。開啟測試版即可查看正在測試的內容。", platforms: { android: "Android", ios: "iPhone和iPad", mac: "Mac", web: "網頁版" } },
  sv: { language: "Svenska", brand: "Blitz Split", locale: "sv", title: "Versionsinformation", lead: "Vad som har ändrats i varje version av appen.", showBeta: "Visa betaversioner", beta: "Beta", empty: "Det finns ingen stabil version än. Slå på betaversioner för att se vad som testas.", platforms: { android: "Android", ios: "iPhone och iPad", mac: "Mac", web: "Webben" } },
  cs: { language: "Čeština", brand: "Blitz Split", locale: "cs", title: "Poznámky k vydání", lead: "Co se změnilo v každé verzi aplikace.", showBeta: "Zobrazit beta verze", beta: "Beta", empty: "Zatím neexistuje stabilní verze. Zapni beta verze a uvidíš, co se testuje.", platforms: { android: "Android", ios: "iPhone a iPad", mac: "Mac", web: "Web" } },
  ro: { language: "Română", brand: "Blitz Split", locale: "ro", title: "Note de versiune", lead: "Ce s-a schimbat în fiecare versiune a aplicației.", showBeta: "Arată versiunile beta", beta: "Beta", empty: "Nu există încă o versiune stabilă. Activează versiunile beta ca să vezi ce se testează.", platforms: { android: "Android", ios: "iPhone și iPad", mac: "Mac", web: "Web" } },
  bn: { language: "বাংলা", brand: "Blitz Split", locale: "bn-u-nu-latn", title: "নতুন কী আছে", lead: "অ্যাপের প্রতিটি ভার্সনে কী বদলেছে।", showBeta: "বেটা ভার্সন দেখান", beta: "বেটা", empty: "এখনও কোনো স্থিতিশীল ভার্সন নেই। কী পরীক্ষা করা হচ্ছে তা দেখতে বেটা ভার্সন চালু করুন।", platforms: { android: "Android", ios: "iPhone ও iPad", mac: "Mac", web: "ওয়েব" } },
  ms: { language: "Bahasa Melayu", brand: "Blitz Split", locale: "ms", title: "Apa yang baharu", lead: "Perubahan dalam setiap versi aplikasi.", showBeta: "Tunjukkan versi beta", beta: "Beta", empty: "Belum ada versi stabil. Hidupkan versi beta untuk melihat perkara yang sedang diuji.", platforms: { android: "Android", ios: "iPhone dan iPad", mac: "Mac", web: "Web" } },
  el: { language: "Ελληνικά", brand: "Blitz Split", locale: "el", title: "Τι νέο υπάρχει", lead: "Τι άλλαξε σε κάθε έκδοση της εφαρμογής.", showBeta: "Εμφάνιση εκδόσεων beta", beta: "Beta", empty: "Δεν υπάρχει ακόμα σταθερή έκδοση. Ενεργοποίησε τις εκδόσεις beta για να δεις τι δοκιμάζεται.", platforms: { android: "Android", ios: "iPhone και iPad", mac: "Mac", web: "Web" } },
  hu: { language: "Magyar", brand: "Blitz Split", locale: "hu", title: "Újdonságok", lead: "Mi változott az alkalmazás egyes verzióiban.", showBeta: "Béta verziók megjelenítése", beta: "Béta", empty: "Még nincs stabil verzió. Kapcsold be a béta verziókat, hogy lásd, mit tesztelünk.", platforms: { android: "Android", ios: "iPhone és iPad", mac: "Mac", web: "Web" } },
  fil: { language: "Filipino", brand: "Blitz Split", locale: "fil", title: "Ano ang bago", lead: "Ano ang nagbago sa bawat bersyon ng app.", showBeta: "Ipakita ang mga beta na bersyon", beta: "Beta", empty: "Wala pang stable na bersyon. I-on ang mga beta na bersyon para makita ang sinusubukan.", platforms: { android: "Android", ios: "iPhone at iPad", mac: "Mac", web: "Web" } },
  ur: { language: "اردو", brand: "Blitz Split", locale: "ur-u-nu-latn", title: "نیا کیا ہے", lead: "ایپ کے ہر ورژن میں کیا بدلا۔", showBeta: "بیٹا ورژن دکھائیں", beta: "بیٹا", empty: "ابھی کوئی مستحکم ورژن نہیں۔ جانچ میں موجود چیزیں دیکھنے کے لیے بیٹا ورژن آن کریں۔", platforms: { android: "Android", ios: "iPhone اور iPad", mac: "Mac", web: "ویب" } },
  hr: { language: "Hrvatski", brand: "Blitz Split", locale: "hr", title: "Novosti", lead: "Što se promijenilo u svakoj verziji aplikacije.", showBeta: "Prikaži beta verzije", beta: "Beta", empty: "Još nema stabilne verzije. Uključi beta verzije da vidiš što se testira.", platforms: { android: "Android", ios: "iPhone i iPad", mac: "Mac", web: "Web" } },
  sr: { language: "Srpski", brand: "Blitz Split", locale: "sr-Latn", title: "Novosti", lead: "Šta se promenilo u svakoj verziji aplikacije.", showBeta: "Prikaži beta verzije", beta: "Beta", empty: "Stabilna verzija još ne postoji. Uključi beta verzije da vidiš šta se testira.", platforms: { android: "Android", ios: "iPhone i iPad", mac: "Mac", web: "Veb" } },
  sk: { language: "Slovenčina", brand: "Blitz Split", locale: "sk", title: "Novinky", lead: "Čo sa zmenilo v každej verzii aplikácie.", showBeta: "Zobraziť beta verzie", beta: "Beta", empty: "Zatiaľ neexistuje stabilná verzia. Zapni beta verzie a uvidíš, čo sa testuje.", platforms: { android: "Android", ios: "iPhone a iPad", mac: "Mac", web: "Web" } },
  sw: { language: "Kiswahili", brand: "Blitz Split", locale: "sw", title: "Kipya ni nini", lead: "Kilichobadilika katika kila toleo la programu.", showBeta: "Onyesha matoleo ya beta", beta: "Beta", empty: "Bado hakuna toleo thabiti. Washa matoleo ya beta ili uone kinachojaribiwa.", platforms: { android: "Android", ios: "iPhone na iPad", mac: "Mac", web: "Wavuti" } },
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
    `          <p class="hero-lead">${escapeHtml(chrome.lead)}</p>`,
    `          <label class="beta-switch"><input type="checkbox" role="switch" data-show-beta>${escapeHtml(chrome.showBeta)}</label>`,
    `        </div>`,
    `      </div>`,
    `      <div class="wrap page-body releases">`,
    // Why: until the first stable version, the page would open with nothing on it.
    ...(releases.every((release) => release.beta) ? [`        <p class="releases-empty">${escapeHtml(chrome.empty)}</p>`] : []),
    ...releases.flatMap((release) => renderRelease(lang, chrome, release)),
    `      </div>`,
    `    </div>`,
  ];
}

function build(check) {
  const notes = loadNotes();
  const page = withMain(readFileSync(TEMPLATE, "utf8"), notes.flatMap(renderLanguage).join("\n"));
  if (page === null) fail(TEMPLATE, "no <main id=\"main\"> … </main> to write the versions in");
  // Why: a check only reads the notes and draws them, which is where a wrong file fails; nothing is written.
  if (check) return;
  mkdirSync(FEED_DIR, { recursive: true });
  const feeds = notes.map(({ lang }) => `${lang}.json`);
  for (const { lang, releases } of notes) writeFileSync(`${FEED_DIR}/${lang}.json`, feed(releases));
  // Why: a feed nobody writes anymore would still be served, and read by an app. Only the stale ones go, after the
  // others are written, so `wrangler dev` rebuilding never serves a 404 for a feed that exists.
  for (const name of readdirSync(FEED_DIR)) if (!feeds.includes(name)) rmSync(`${FEED_DIR}/${name}`, { recursive: true, force: true });
  writeFileSync(PAGE, page);
  console.log(`Wrote ${PAGE} and ${notes.length} feeds in ${FEED_DIR}/ (${notes[0].releases.length} versions)`);
}

try {
  build(process.argv.includes("--check"));
} catch (error) {
  if (!(error instanceof NotesError)) throw error;
  console.error(error.message);
  process.exit(1);
}
