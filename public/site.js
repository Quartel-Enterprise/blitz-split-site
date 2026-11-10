// Shared by every page of the site: theme, language and the small behaviors of the header and the legal pages.
// The markup is in English; a page sets window.SITE_STRINGS = { pt: { key: "…" }, es: { … }, fr: …, de: …, it: …, pl: …, nl: …, tr: …, id: …, ja: … }
// before this script, and blocks written per language carry data-lang="en", "pt", "es", "nl", "tr", "id" or "ja".
(function () {
  const params = new URLSearchParams(location.search);
  // boot.js, in <head>, already picked the theme and the language.
  const lang = document.documentElement.dataset.lang;
  // analytics.js, which runs before this script, sends the events; docs/analytics.md lists them.
  const track = (name, params) => window.track?.(name, params);
  // Where a link or button sits: the header's menus, the rest of the header or the footer.
  const originOf = (el) => (el.closest("details") && el.closest(".site-header") ? "header_menu"
    : el.closest(".site-header") ? "header" : el.closest(".site-footer") ? "footer" : "content");

  const dict = (window.SITE_STRINGS || {})[lang];
  if (dict) {
    if (dict.title) document.title = dict.title;
    if (dict.description) document.querySelector('meta[name="description"]')?.setAttribute("content", dict.description);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = dict[el.dataset.i18n];
      if (value !== undefined) el.textContent = value;
    });
    // Only the site's own static strings, never anything read from the URL.
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const value = dict[el.dataset.i18nHtml];
      if (value !== undefined) el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => {
      const value = dict[el.dataset.i18nLabel];
      if (value !== undefined) el.setAttribute("aria-label", value);
    });
  }

  // The language menu (header) and switch (footer) keep the choice for the next visit.
  document.querySelectorAll("[data-set-lang]").forEach((link) => {
    const target = link.dataset.setLang;
    link.setAttribute("aria-current", String(target === lang));
    const url = new URL(location.href);
    url.searchParams.set("lang", target);
    link.href = url.pathname + url.search + url.hash;
    link.addEventListener("click", () => {
      try { localStorage.setItem("lang", target); } catch (e) { /* private mode: the URL still carries it */ }
      if (target !== lang) track("language_change", { language: target, origin: originOf(link) });
    });
  });

  // Internal links keep a pinned theme and language, so the design board can walk the pages.
  if (params.has("theme") || params.has("lang")) {
    document.querySelectorAll('a[href^="/"]:not([data-set-lang])').forEach((link) => {
      const url = new URL(link.getAttribute("href"), location.origin);
      if (params.has("theme")) url.searchParams.set("theme", params.get("theme"));
      if (params.has("lang")) url.searchParams.set("lang", params.get("lang"));
      link.href = url.pathname + url.search + url.hash;
    });
  }

  // The theme: Light, Dark or System, from the header's menu or the footer's switch, kept for the next visit.
  // boot.js applied the saved one, and applyTheme resolves System to the system's theme.
  const root = document.documentElement;
  function showTheme(pref) {
    window.applyTheme(pref);
    // The browser's bar follows the page: each theme-color keeps its own scheme's color under System.
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.dataset.own ??= meta.content;
      meta.content = pref === "system" ? meta.dataset.own : pref === "dark" ? "#09090b" : "#fafafa";
    });
    document.querySelectorAll("[data-set-theme]").forEach((el) => {
      el.setAttribute("aria-pressed", String(el.dataset.setTheme === pref));
    });
  }
  showTheme(root.dataset.themePref || "system");
  document.querySelectorAll("[data-set-theme]").forEach((el) => el.addEventListener("click", () => {
    const pref = el.dataset.setTheme;
    if (pref !== root.dataset.themePref) track("theme_change", { theme: pref, origin: originOf(el) });
    try { localStorage.setItem("theme", pref); } catch (e) { /* private mode: this page still switches */ }
    showTheme(pref);
    el.closest("details")?.removeAttribute("open");
  }));

  // The header's menus (language and theme): the language one shows its code, and a click outside or Esc closes them.
  document.querySelectorAll(".lang-code").forEach((el) => { el.textContent = lang.toUpperCase(); });
  const langMenus = [...document.querySelectorAll(".lang-menu, .theme-menu, .get-menu")];
  langMenus.forEach((menu) => menu.addEventListener("toggle", () => {
    if (!menu.open) return;
    const id = menu.classList.contains("lang-menu") ? "language_menu" : menu.classList.contains("theme-menu") ? "theme_menu" : "get_menu";
    track("menu_click", { menu_id: id });
  }));
  document.addEventListener("click", (e) => {
    langMenus.forEach((menu) => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    langMenus.forEach((menu) => {
      if (menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
    });
  });

  // The FAQ: each answer slides open and closed. With reduced motion, <details> just toggles.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll(".faq details").forEach((item) => {
    const summary = item.querySelector("summary");
    const body = item.querySelector(".faq-body");
    let running = null;
    summary.addEventListener("click", (e) => {
      // Opening, or opening again while it slides closed: q1 for the first question's q1q.
      if (!item.open || item.classList.contains("closing")) {
        track("faq_open", { question: summary.querySelector("[data-i18n]")?.dataset.i18n.replace(/q$/, "") });
      }
      if (reduceMotion.matches || !body.animate) return;
      e.preventDefault();
      const from = running ? body.getBoundingClientRect().height : null;
      running?.cancel();
      if (!item.open || item.classList.contains("closing")) {
        item.classList.remove("closing");
        item.open = true;
        const to = body.scrollHeight;
        running = body.animate(
          [{ height: `${from ?? 0}px`, opacity: from ? 1 : 0, transform: "translateY(-4px)" }, { height: `${to}px`, opacity: 1, transform: "none" }],
          { duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
      } else {
        item.classList.add("closing");
        running = body.animate(
          [{ height: `${from ?? body.scrollHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }],
          // Held on its last frame until <details> closes, so the answer never flashes back for a frame.
          { duration: 220, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
        );
        const closing = running;
        closing.onfinish = () => { item.open = false; item.classList.remove("closing"); closing.cancel(); };
      }
      running.addEventListener("finish", () => { running = null; });
    });
  });

  // The landing's sections rise as they scroll into view (site.css), those that come in together one after another in
  // reading order. boot.js sets .motion unless the visitor asked for reduced motion; without it everything just shows.
  if (root.classList.contains("motion")) {
    const reveal = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((entry, i) => {
          entry.target.style.setProperty("--d", `${Math.min(i, 5) * 90}ms`);
          entry.target.classList.add("in");
          reveal.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".section-head, .bento .tile, .steps li, .platform, .privacy-band, .faq details, .cta-final .wrap > *")
      .forEach((el) => reveal.observe(el));
  }

  // On a pointer, the cards' light follows it (site.css).
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".tile, .platform, .steps li").forEach((card) => card.addEventListener("pointermove", (e) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - box.left}px`);
      card.style.setProperty("--my", `${e.clientY - box.top}px`);
    }));
  }

  // The header gets its border once the page scrolls; the legal pages show "back to top" further down.
  const header = document.querySelector(".site-header");
  const toTop = document.querySelector(".to-top");
  function onScroll() {
    header?.classList.toggle("scrolled", window.scrollY > 4);
    toTop?.classList.toggle("show", window.scrollY > 900);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  // Why not right away: reading the scroll position here would lay the page out before the other scripts change it.
  requestAnimationFrame(onScroll);

  // The legal pages' contents: open on a wide screen, the section on screen highlighted.
  const wide = window.matchMedia("(min-width: 1000px)");
  function syncToc() {
    document.querySelectorAll(".toc details").forEach((d) => { d.open = wide.matches; });
  }
  syncToc();
  wide.addEventListener("change", syncToc);
  const tocLinks = [...document.querySelectorAll(`[data-lang="${lang}"] .toc a, .toc[data-lang="${lang}"] a`)];
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(tocLinks.map((a) => [a.hash.slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("active"));
        byId.get(entry.target.id)?.classList.add("active");
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
  }
  // On a phone, picking a section closes the contents.
  document.querySelectorAll(".toc a").forEach((a) => a.addEventListener("click", () => {
    track("navigation_click", { target: a.hash.slice(1), origin: "toc" });
    if (!wide.matches) a.closest("details")?.removeAttribute("open");
  }));

  // The rest of the links: the logo, the landing's sections, "back to top" and the legal pages.
  document.querySelectorAll(".logo").forEach((a) => a.addEventListener("click", () => {
    track("logo_click", { origin: originOf(a) });
  }));
  document.querySelectorAll('.site-header .nav a[href^="#"]').forEach((a) => a.addEventListener("click", () => {
    track("navigation_click", { target: a.hash.slice(1), origin: "header" });
  }));
  toTop?.addEventListener("click", () => track("navigation_click", { target: "top", origin: "to_top" }));
  const LEGAL = { "/privacy": "privacy_policy", "/terms": "terms_of_service" };
  document.querySelectorAll('a[href^="/privacy"], a[href^="/terms"]').forEach((a) => a.addEventListener("click", () => {
    track("select_content", { content_type: "legal", item_id: LEGAL[new URL(a.href).pathname], origin: originOf(a) });
  }));
})();
