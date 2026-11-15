// Runs in <head>, before the first paint, so neither the theme nor the language flashes.
// The theme: Light, Dark or System (the default), as picked in the header's theme menu or the footer and kept for the
// next visit. ?theme=light|dark pins one without keeping it (the design board uses it). data-theme is always light or
// dark, so site.css writes the dark tokens once: System takes the system's theme here, and follows it when it changes.
// site.js applies a theme picked on the page through window.applyTheme.
// The language, English, Portuguese (Brazil), Spanish, French, German, Italian, Polish, Dutch,
// Turkish, Indonesian or Japanese, or Portugal's Portuguese (pt-PT), a variant of pt: ?lang=, then the last one picked in the language menu, then
// the browser's languages in order of preference, English when none of them is one of ours.
(function () {
  const SUPPORTED = ["en", "pt", "es", "fr", "de", "it", "pl", "nl", "tr", "id", "ja"];
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; } // storage blocked
  }

  // A variant is a regional overlay on its language: data-lang is the language (pt, so the legal pages' blocks and the
  // languages' words apply) and data-variant the variant (pt-PT), whose words, where it has its own, win over pt's.
  // Only the exact tag picks one: every other pt-* browser language stays pt.
  const VARIANTS = ["pt-PT"];
  const normalize = (tag) => VARIANTS.find((variant) => variant.toLowerCase() === String(tag).toLowerCase()) || String(tag).toLowerCase().split("-")[0];
  const known = (code) => SUPPORTED.includes(code) || VARIANTS.includes(code);

  // First, so the scripts that read data-lang have it even if the theme below fails.
  const preferred = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])
    .map(normalize)
    .find(known);
  const pick = [params.get("lang"), stored("lang"), preferred].find(known) || "en";
  const variant = VARIANTS.includes(pick) ? pick : "";
  const lang = variant ? variant.split("-")[0] : pick;
  root.dataset.lang = lang;
  if (variant) root.dataset.variant = variant;
  root.lang = variant || { en: "en", pt: "pt-BR", es: "es", fr: "fr", de: "de", it: "it", pl: "pl", nl: "nl", tr: "tr", id: "id", ja: "ja" }[lang];
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
