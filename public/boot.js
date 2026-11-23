// Runs in <head>, before the first paint, so neither the theme nor the language flashes.
// The theme: Light, Dark or System (the default), as picked in the header's theme menu or the footer and kept for the
// next visit. ?theme=light|dark pins one without keeping it (the design board uses it). data-theme is always light or
// dark, so site.css writes the dark tokens once: System takes the system's theme here, and follows it when it changes.
// site.js applies a theme picked on the page through window.applyTheme.
// The language, English, Portuguese (Brazil), Spanish, French, German, Italian, Polish, Dutch,
// Turkish, Indonesian, Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai, Vietnamese,
// Traditional Chinese, Swedish, Czech, Romanian, Bengali, Malay, Greek, Hungarian, Filipino, Urdu, Croatian, Serbian, Slovak, Norwegian (Bokmål), Persian or Tamil, or Portugal's Portuguese (pt-PT), a variant of pt: ?lang=, then the last one picked in the language picker, then
// the browser's languages in order of preference, English when none of them is one of ours. A Traditional Chinese
// browser language (zh-Hant, zh-TW, zh-HK, zh-MO) picks Traditional Chinese, zh-Hant, as in the apps; every other zh-* stays zh.
(function () {
  const SUPPORTED = ["en", "pt", "es", "fr", "de", "it", "pl", "nl", "tr", "id", "ja", "ru", "uk", "ko", "ar", "hi", "zh", "he", "th", "vi", "zh-Hant", "sv", "cs", "ro", "bn", "ms", "el", "hu", "fil", "ur", "hr", "sr", "sk", "nb", "fa", "ta"];
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; } // storage blocked
  }

  // A variant is a regional overlay on its language: data-lang is the language (pt, so the legal pages' blocks and the
  // languages' words apply) and data-variant the variant (pt-PT), whose words, where it has its own, win over pt's.
  // Only that tag picks one, in any case (pt-pt, pt_PT): every other pt-* browser language stays pt.
  const VARIANTS = ["pt-PT"];
  const variantOf = (tag) => VARIANTS.find((variant) => variant.toLowerCase() === String(tag).toLowerCase().replace("_", "-"));
  // Hebrew's legacy code, iw (Android's, and older browsers'), is Hebrew: iw and iw-* pick he. Tagalog's, tl, is how
  // Android and older browsers name Filipino: tl and tl-* pick fil. Norwegian's macrolanguage, no, and Nynorsk, nn, pick
  // Bokmål, nb, as the apps do: the site writes Bokmål, which answers every Norwegian tag.
  const LEGACY = { iw: "he", tl: "fil", no: "nb", nn: "nb" };
  const canonical = (code) => LEGACY[code] || code;
  const known = (code) => SUPPORTED.includes(code) || VARIANTS.includes(code);
  // Traditional Chinese, as the apps tell it: by its script when the tag has one (zh-Hant-CN is Traditional, zh-Hans-HK
  // Simplified), else by a region that writes it (Taiwan, Hong Kong, Macau).
  const traditional = (tag) => {
    const [language, ...rest] = String(tag).toLowerCase().split(/[-_]/);
    if (language !== "zh") return false;
    const script = rest.find((part) => part.length === 4);
    return script ? script === "hant" : rest.some((part) => ["tw", "hk", "mo"].includes(part));
  };
  // Why: Traditional Chinese is a language of its own, with its whole tag as its code, "zh-Hant", as the apps' legal
  // pages and release notes ask for it; the bare "zh" is Simplified's.
  const TRADITIONAL = "zh-Hant";
  // A tag as the site reads it, from the browser or from ?lang= alike: Traditional Chinese or a variant (pt-PT) by
  // the whole tag, every other language by its first subtag (zh-CN is zh, EN is en).
  const normalize = (tag) => (traditional(tag) ? TRADITIONAL : variantOf(tag) || canonical(String(tag).toLowerCase().split(/[-_]/)[0]));

  // First, so the scripts that read data-lang have it even if the theme below fails.
  const preferred = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])
    .map(normalize)
    .find(known);
  // What the visitor chose, by ?lang= or in the language picker; none, and the site follows the browser's languages:
  // the picker's "System", which data-lang-pref says for site.js.
  const chosen = [params.get("lang"), stored("lang")].map((code) => code && normalize(code)).find(known);
  const pick = chosen || preferred || "en";
  root.dataset.langPref = chosen || "system";
  const variant = VARIANTS.includes(pick) ? pick : "";
  const lang = variant ? variant.split("-")[0] : pick;
  root.dataset.lang = lang;
  if (variant) root.dataset.variant = variant;
  // Every language's tag is its code (Traditional Chinese's, zh-Hant, too), but Brazil's Portuguese, pt-BR, Simplified
  // Chinese, zh-Hans, and Serbian, sr-Latn, which the site writes in the Latin script.
  root.lang = variant || { pt: "pt-BR", zh: "zh-Hans", sr: "sr-Latn" }[lang] || lang;
  // Arabic, Hebrew, Urdu and Persian (and any later right-to-left language) read right to left: the page mirrors, as site.css writes its sides
  // as start and end; src/index.js says the same of a link preview's page.
  // Why: its own copy of src/index.js's RIGHT_TO_LEFT, since this script runs alone in <head>, before any module, and
  // the Worker can't import a page's script; add a right-to-left language to both, and only once SUPPORTED has it.
  const RIGHT_TO_LEFT = ["ar", "he", "ur", "fa"];
  root.dir = RIGHT_TO_LEFT.includes(lang) ? "rtl" : "ltr";
  // A table keyed by language, with the variant's own entries over its language's, objects merged key by key: the words Portugal says
  // differently, the rest falling back to pt. A table without the variant is returned as the language's.
  const plain = (value) => value && typeof value === "object" && !Array.isArray(value);
  const merge = (base, over) => {
    if (!plain(base) || !plain(over)) return over;
    const out = { ...base };
    for (const key in over) out[key] = merge(base[key], over[key]);
    return out;
  };
  window.localized = (table) => (variant && table[variant] ? merge(table[lang], table[variant]) : table[lang]);

  const theme = [params.get("theme"), stored("theme")].find((t) => ["light", "dark", "system"].includes(t)) || "system";
  const systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function applyTheme(pref) {
    root.dataset.themePref = pref;
    root.dataset.theme = pref === "system" ? (systemDark && systemDark.matches ? "dark" : "light") : pref;
  }
  window.applyTheme = applyTheme;
  applyTheme(theme);
  if (systemDark) {
    const follow = () => { if (root.dataset.themePref === "system") applyTheme("system"); };
    // Safari before 14 only has addListener.
    if (systemDark.addEventListener) systemDark.addEventListener("change", follow);
    else if (systemDark.addListener) systemDark.addListener(follow);
  }

  // Motion: the landing's hero comes in and its sections rise as they scroll into view (site.css, site.js). Not with
  // reduced motion, and not when the design board pins a theme, so its captures show every section.
  // The release notes' "Show beta versions", kept for the next visit: on here, site.css shows the beta versions from
  // the first paint instead of once site.js checks the switch. ?beta=on|off pins it without keeping it (the design
  // board uses it), and a link to a beta version's card (#en-3.1.0-beta_2) shows that card whatever was kept.
  const beta = ["on", "off"].find((value) => value === params.get("beta"))
    || (/-beta_\d+$/.test(location.hash) ? "on" : stored("beta"));
  if (beta === "on") root.dataset.beta = "on";

  const still = params.has("theme") || !("IntersectionObserver" in window)
    || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (!still) root.classList.add("motion");
})();
