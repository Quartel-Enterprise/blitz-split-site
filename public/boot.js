// Runs in <head>, before the first paint, so neither the theme nor the language flashes.
// The theme: Light, Dark or System (the default), as picked in the header's theme menu or the footer and kept for the
// next visit. ?theme=light|dark pins one without keeping it (the design board uses it). data-theme is always light or
// dark, so site.css writes the dark tokens once: System takes the system's theme here, and follows it when it changes.
// site.js applies a theme picked on the page through window.applyTheme.
// The language, English, Portuguese (Brazil), Spanish, French, German, Italian, Polish, Dutch,
// Turkish, Indonesian or Japanese: ?lang=, then the last one picked in the language menu, then
// the browser's languages in order of preference, English when none of them is one of ours.
(function () {
  const SUPPORTED = ["en", "pt", "es", "fr", "de", "it", "pl", "nl", "tr", "id", "ja"];
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; } // storage blocked
  }

  // First, so the scripts that read data-lang have it even if the theme below fails.
  const preferred = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])
    .map((tag) => tag.toLowerCase().split("-")[0])
    .find((code) => SUPPORTED.includes(code));
  const lang = [params.get("lang"), stored("lang"), preferred].find((code) => SUPPORTED.includes(code)) || "en";
  root.dataset.lang = lang;
  root.lang = { en: "en", pt: "pt-BR", es: "es", fr: "fr", de: "de", it: "it", pl: "pl", nl: "nl", tr: "tr", id: "id", ja: "ja" }[lang];

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
  const still = params.has("theme") || !("IntersectionObserver" in window)
    || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (!still) root.classList.add("motion");
})();
