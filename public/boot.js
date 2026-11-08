// Runs in <head>, before the first paint, so neither the theme nor the language flashes.
// The theme: Light, Dark or System (the default, which the CSS follows through prefers-color-scheme), as picked in the
// header's theme menu or the footer and kept for the next visit. ?theme=light|dark pins one without keeping it (the
// design board uses it).
// The language, English, Portuguese (Brazil), Spanish or French: ?lang=, then the last one picked in the language menu, then
// the browser's languages in order of preference, English when none of them is one of ours.
(function () {
  const SUPPORTED = ["en", "pt", "es", "fr"];
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; } // storage blocked
  }

  const theme = [params.get("theme"), stored("theme")].find((t) => ["light", "dark", "system"].includes(t)) || "system";
  root.dataset.themePref = theme;
  if (theme !== "system") root.dataset.theme = theme;

  const preferred = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])
    .map((tag) => tag.toLowerCase().split("-")[0])
    .find((code) => SUPPORTED.includes(code));
  const lang = [params.get("lang"), stored("lang"), preferred].find((code) => SUPPORTED.includes(code)) || "en";
  root.dataset.lang = lang;
  root.lang = { en: "en", pt: "pt-BR", es: "es", fr: "fr" }[lang];

  // Motion: the landing's hero comes in and its sections rise as they scroll into view (site.css, site.js). Not with
  // reduced motion, and not when the design board pins a theme, so its captures show every section.
  const still = params.has("theme") || !("IntersectionObserver" in window)
    || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (!still) root.classList.add("motion");
})();
