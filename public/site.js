// Shared by every page of the site: theme, language and the small behaviors of the header and the legal pages.
// The markup is in English; a page sets window.SITE_STRINGS = { pt: { key: "…" }, "pt-PT": { only the words that differ }, es: { … }, fr: …, de: …, it: …, pl: …, nl: …, tr: …, id: …, ja: …, ru: …, uk: …, ko: …, ar: …, hi: …, zh: …, he: …, th: …, vi: …, "zh-Hant": …, sv: …, cs: …, ro: …, bn: …, ms: …, el: …, hu: …, fil: …, ur: …, hr: …, sr: …, sk: …, nb: …, fa: …, sw: …, ta: …, te: …, mr: …, bg: …, ca: …, da: …, fi: …, lv: …, sl: … }
// before this script, inline or, on the landing and the support page, as one file per language of which boot.js loads
// the one it picked (public/strings/<page>/<language>.js); blocks written per language carry data-lang with the
// language ("en", "pt", "fr"…).
(function () {
  const params = new URLSearchParams(location.search);
  // boot.js, in <head>, already picked the theme and the language.
  const lang = document.documentElement.dataset.lang;
  // analytics.js, which runs before this script, sends the events; docs/analytics.md lists them.
  const track = (name, params) => window.track?.(name, params);
  // Where a link or button sits: the header's menus, the rest of the header or the footer.
  const originOf = (el) => (el.closest("details") && el.closest(".site-header") ? "header_menu"
    : el.closest(".site-header") ? "header" : el.closest(".site-footer") ? "footer" : "content");

  // The language on the page, as the picker names it: the variant (pt-PT) when there is one.
  const picked = document.documentElement.dataset.variant || lang;
  const dict = window.localized(window.SITE_STRINGS || {});
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

  // The footer's copyright year is the current one, so it moves on by itself when the year turns. The year in the
  // markup is what shows without scripts, and the least it ever shows: a device whose clock is behind keeps it.
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = Math.max(Number(el.textContent) || 0, new Date().getFullYear());
  });

  // The language picker, as the apps' Profile › Language: "System", which follows the browser's languages, then every
  // language in its own name, the way its speakers look for it, over the same name in the page's language; a search
  // finds a row by any of its names, its English one or its code. The header's button and the footer's open it, a
  // dialog on a wider window and a screen of its own on a phone (site.css). A language picked is kept for the next
  // visit; "System" forgets it. boot.js says what the visitor chose: data-lang-pref, a language or "system".
  const PICKER_TEXT = {
    en: { search: "Search languages", clear: "Clear search", none: "No language matches “{query}”", system: "System", systemDetail: "Device language", back: "Back", close: "Close" },
    pt: { search: "Buscar idioma", clear: "Limpar busca", none: "Nenhum idioma encontrado para “{query}”", system: "Sistema", systemDetail: "Idioma do aparelho", back: "Voltar", close: "Fechar" },
    "pt-PT": { search: "Pesquisar idioma", clear: "Limpar pesquisa" },
    es: { search: "Buscar idioma", clear: "Borrar búsqueda", none: "Ningún idioma coincide con «{query}»", system: "Sistema", systemDetail: "Idioma del dispositivo", back: "Atrás", close: "Cerrar" },
    fr: { search: "Rechercher une langue", clear: "Effacer la recherche", none: "Aucune langue ne correspond à « {query} »", system: "Système", systemDetail: "Langue de l’appareil", back: "Retour", close: "Fermer" },
    de: { search: "Sprache suchen", clear: "Suche löschen", none: "Keine Sprache passt zu „{query}“", system: "System", systemDetail: "Sprache des Geräts", back: "Zurück", close: "Schließen" },
    it: { search: "Cerca una lingua", clear: "Cancella ricerca", none: "Nessuna lingua corrisponde a “{query}”", system: "Sistema", systemDetail: "Lingua del dispositivo", back: "Indietro", close: "Chiudi" },
    pl: { search: "Szukaj języka", clear: "Wyczyść wyszukiwanie", none: "Brak języków pasujących do „{query}”", system: "System", systemDetail: "Język urządzenia", back: "Wstecz", close: "Zamknij" },
    nl: { search: "Taal zoeken", clear: "Zoekopdracht wissen", none: "Geen taal gevonden voor ‘{query}’", system: "Systeem", systemDetail: "Taal van het apparaat", back: "Terug", close: "Sluiten" },
    tr: { search: "Dil ara", clear: "Aramayı temizle", none: "“{query}” ile eşleşen dil yok", system: "Sistem", systemDetail: "Cihaz dili", back: "Geri", close: "Kapat" },
    id: { search: "Cari bahasa", clear: "Hapus pencarian", none: "Tidak ada bahasa yang cocok dengan “{query}”", system: "Sistem", systemDetail: "Bahasa perangkat", back: "Kembali", close: "Tutup" },
    ja: { search: "言語を検索", clear: "検索をクリア", none: "「{query}」に一致する言語はありません", system: "システム", systemDetail: "デバイスの言語", back: "戻る", close: "閉じる" },
    ru: { search: "Поиск языков", clear: "Очистить поиск", none: "Нет языков по запросу «{query}»", system: "Системный", systemDetail: "Язык устройства", back: "Назад", close: "Закрыть" },
    uk: { search: "Пошук мов", clear: "Очистити пошук", none: "Немає мови, що відповідає «{query}»", system: "Системна", systemDetail: "Мова пристрою", back: "Назад", close: "Закрити" },
    ko: { search: "언어 검색", clear: "검색어 지우기", none: "“{query}” 검색어와 일치하는 언어가 없어요", system: "시스템 설정", systemDetail: "기기 언어", back: "뒤로", close: "닫기" },
    ar: { search: "البحث عن لغة", clear: "مسح البحث", none: "لا توجد لغة تطابق «{query}»", system: "النظام", systemDetail: "لغة الجهاز", back: "رجوع", close: "إغلاق" },
    hi: { search: "भाषा खोजें", clear: "खोज साफ़ करें", none: "“{query}” से मेल खाती कोई भाषा नहीं", system: "सिस्टम", systemDetail: "डिवाइस की भाषा", back: "वापस", close: "बंद करें" },
    zh: { search: "搜索语言", clear: "清除搜索", none: "没有与“{query}”匹配的语言", system: "系统", systemDetail: "设备语言", back: "返回", close: "关闭" },
    he: { search: "חיפוש שפה", clear: "ניקוי החיפוש", none: "אין שפה שמתאימה ל־„{query}”", system: "מערכת", systemDetail: "שפת המכשיר", back: "חזרה", close: "סגירה" },
    th: { search: "ค้นหาภาษา", clear: "ล้างการค้นหา", none: "ไม่พบภาษาที่ตรงกับ “{query}”", system: "ระบบ", systemDetail: "ภาษาของอุปกรณ์", back: "กลับ", close: "ปิด" },
    vi: { search: "Tìm ngôn ngữ", clear: "Xóa tìm kiếm", none: "Không có ngôn ngữ nào khớp với “{query}”", system: "Hệ thống", systemDetail: "Ngôn ngữ của thiết bị", back: "Quay lại", close: "Đóng" },
    "zh-Hant": { search: "搜尋語言", clear: "清除搜尋", none: "沒有符合「{query}」的語言", system: "系統", systemDetail: "裝置語言", back: "返回", close: "關閉" },
    sv: { search: "Sök språk", clear: "Rensa sökningen", none: "Inget språk matchar ”{query}”", system: "System", systemDetail: "Enhetens språk", back: "Tillbaka", close: "Stäng" },
    cs: { search: "Hledat jazyk", clear: "Vymazat hledání", none: "Žádný jazyk neodpovídá „{query}“", system: "Systém", systemDetail: "Jazyk zařízení", back: "Zpět", close: "Zavřít" },
    ro: { search: "Caută o limbă", clear: "Șterge căutarea", none: "Nicio limbă nu corespunde cu „{query}”", system: "Sistem", systemDetail: "Limba dispozitivului", back: "Înapoi", close: "Închide" },
    bn: { search: "ভাষা খুঁজুন", clear: "খোঁজা মুছুন", none: "“{query}” লিখে কোনো ভাষা পাওয়া যায়নি।", system: "সিস্টেম", systemDetail: "ডিভাইসের ভাষা", back: "ফিরে যান", close: "বন্ধ করুন" },
    ms: { search: "Cari bahasa", clear: "Kosongkan carian", none: "Tiada bahasa yang sepadan dengan “{query}”", system: "Sistem", systemDetail: "Bahasa peranti", back: "Kembali", close: "Tutup" },
    el: { search: "Αναζήτηση γλώσσας", clear: "Εκκαθάριση αναζήτησης", none: "Καμία γλώσσα δεν ταιριάζει με «{query}»", system: "Σύστημα", systemDetail: "Γλώσσα συσκευής", back: "Πίσω", close: "Κλείσιμο" },
    hu: { search: "Nyelv keresése", clear: "Keresés törlése", none: "Nincs találat: „{query}”", system: "Rendszer", systemDetail: "Az eszköz nyelve", back: "Vissza", close: "Bezárás" },
    fil: { search: "Maghanap ng wika", clear: "I-clear ang paghahanap", none: "Walang wikang tugma sa “{query}”", system: "System", systemDetail: "Wika ng device", back: "Bumalik", close: "Isara" },
    ur: { search: "زبان تلاش کریں", clear: "تلاش صاف کریں", none: "کوئی زبان نہیں ملی: “{query}”", system: "سسٹم", systemDetail: "ڈیوائس کی زبان", back: "واپس", close: "بند کریں" },
    hr: { search: "Pretraži jezike", clear: "Očisti pretragu", none: "Nijedan jezik ne odgovara upitu „{query}”", system: "Sustav", systemDetail: "Jezik uređaja", back: "Natrag", close: "Zatvori" },
    sr: { search: "Pretraži jezike", clear: "Obriši pretragu", none: "Nijedan jezik ne odgovara upitu „{query}“", system: "Sistem", systemDetail: "Jezik uređaja", back: "Nazad", close: "Zatvori" },
    sk: { search: "Hľadať jazyk", clear: "Vymazať hľadanie", none: "Žiadny jazyk nezodpovedá „{query}“", system: "Systém", systemDetail: "Jazyk zariadenia", back: "Späť", close: "Zavrieť" },
    nb: { search: "Søk etter språk", clear: "Tøm søket", none: "Ingen språk passer til «{query}»", system: "System", systemDetail: "Enhetens språk", back: "Tilbake", close: "Lukk" },
    fa: { search: "جستجوی زبان‌ها", clear: "پاک کردن جستجو", none: "هیچ زبانی با «{query}» مطابقت ندارد", system: "سیستم", systemDetail: "زبان دستگاه", back: "بازگشت", close: "بستن" },
    sw: { search: "Tafuta lugha", clear: "Futa utafutaji", none: "Hakuna lugha inayolingana na “{query}”", system: "Mfumo", systemDetail: "Lugha ya kifaa", back: "Rudi", close: "Funga" },
    ta: { search: "மொழியைத் தேடவும்", clear: "தேடலை அழிக்கவும்", none: "பொருந்தும் மொழி எதுவும் இல்லை: “{query}”", system: "சிஸ்டம்", systemDetail: "சாதனத்தின் மொழி", back: "பின்செல்லவும்", close: "மூடவும்" },
    te: { search: "భాషను వెతకండి", clear: "వెతుకులాటను క్లియర్ చేయండి", none: "సరిపోయే భాష ఏదీ లేదు: “{query}”", system: "సిస్టమ్", systemDetail: "పరికరం భాష", back: "వెనుకకు", close: "మూసివేయండి" },
    mr: { search: "भाषा शोधा", clear: "शोध साफ करा", none: "जुळणारी भाषा नाही: “{query}”", system: "सिस्टम", systemDetail: "डिव्हाइसची भाषा", back: "मागे", close: "बंद करा" },
    bg: { search: "Търси езици", clear: "Изчисти търсенето", none: "Няма език, който да съвпада с „{query}“", system: "Системен", systemDetail: "Езикът на устройството", back: "Назад", close: "Затвори" },
    ca: { search: "Cerca idiomes", clear: "Esborrar la cerca", none: "Cap idioma coincideix amb «{query}»", system: "Sistema", systemDetail: "Idioma del dispositiu", back: "Enrere", close: "Tancar" },
    da: { search: "Søg efter sprog", clear: "Ryd søgningen", none: "Intet sprog passer til »{query}«", system: "System", systemDetail: "Enhedens sprog", back: "Tilbage", close: "Luk" },
    fi: { search: "Hae kieliä", clear: "Tyhjennä haku", none: "Mikään kieli ei vastaa hakua ”{query}”", system: "Järjestelmä", systemDetail: "Laitteen kieli", back: "Takaisin", close: "Sulje" },
    lv: { search: "Meklēt valodas", clear: "Notīrīt meklēšanu", none: "Neviena valoda neatbilst vaicājumam „{query}”", system: "Sistēmas", systemDetail: "Ierīces valoda", back: "Atpakaļ", close: "Aizvērt" },
    sl: { search: "Išči jezike", clear: "Počisti iskanje", none: "Noben jezik se ne ujema z „{query}“", system: "Sistem", systemDetail: "Jezik naprave", back: "Nazaj", close: "Zapri" },
  };
  // Each language's code, as the apps' chips show it: its own, but Portugal's and Brazil's Portuguese by their regions,
  // Ukrainian by Ukraine's UA ("UK" reads as the United Kingdom) and the two Chinese by their scripts, as Chinese
  // pickers mark them. The header's button shows the one on the page.
  // check-translations.mjs knows it holds codes, not words, so it only checks that its keys are languages.
  const LANGUAGE_CHIPS = { pt: "BR", "pt-PT": "PT", uk: "UA", zh: "简", "zh-Hant": "繁" };
  const chipOf = (code) => LANGUAGE_CHIPS[code] || code.toUpperCase();
  document.querySelectorAll(".lang-code").forEach((el) => { el.textContent = chipOf(picked); });

  const picker = document.getElementById("lang-dialog");
  if (picker) {
    const text = window.localized(PICKER_TEXT);
    const pref = document.documentElement.dataset.langPref || picked;
    const pageTag = document.documentElement.lang;
    // A language's name in another, from the browser's own names (CLDR): "Japonês" on a Portuguese page.
    const namer = (tag) => {
      try { return new Intl.DisplayNames([tag], { type: "language", languageDisplay: "standard" }); } catch (e) { return null; }
    };
    const inPage = namer(pageTag);
    const inEnglish = namer("en");
    const nameIn = (names, tag) => {
      let name = "";
      try { name = names?.of(tag) || ""; } catch (e) { /* a browser without this tag: the row shows its own name only */ }
      return name && name !== tag ? name.charAt(0).toLocaleUpperCase(pageTag) + name.slice(1) : "";
    };
    // Folded as the apps' searches: "portugues" finds "Português", "cestina" "Čeština"; other scripts stay as they are.
    const fold = (value) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    const list = picker.querySelector(".lang-list");
    const group = list.querySelector("#lang-rows");
    const empty = picker.querySelector(".lang-empty");
    const search = picker.querySelector(".lang-search input");
    const clear = picker.querySelector(".lang-clear");
    search.placeholder = text.search;
    search.setAttribute("aria-label", text.search);
    clear.setAttribute("aria-label", text.clear);
    picker.querySelector(".lang-back").setAttribute("aria-label", text.back);
    picker.querySelector(".lang-x").setAttribute("aria-label", text.close);

    const rows = [...group.querySelectorAll("[data-set-lang]")].map((link) => {
      const code = link.dataset.setLang;
      const system = code === "system";
      const tag = link.getAttribute("lang");
      const own = system ? text.system : link.textContent.trim();
      const translated = system ? text.systemDetail : nameIn(inPage, tag);
      // The chip, then the language's own name, in its language and direction, over the translated one, unless both
      // read the same ("Italiano" on an Italian page); the radio is site.css's.
      const chip = document.createElement("span");
      chip.className = "lang-chip";
      chip.setAttribute("aria-hidden", "true");
      if (system) chip.innerHTML = '<svg class="icon"><use href="#i-monitor"/></svg>';
      else chip.textContent = chipOf(code);
      const names = document.createElement("span");
      names.className = "lang-names";
      const name = document.createElement("span");
      name.className = "lang-name";
      name.textContent = own;
      if (tag) name.lang = tag;
      if (link.dir) name.dir = link.dir;
      names.append(name);
      if (translated && fold(translated) !== fold(own)) {
        const detail = document.createElement("span");
        detail.className = "lang-detail";
        detail.textContent = translated;
        names.append(detail);
      }
      link.removeAttribute("lang");
      link.removeAttribute("dir");
      link.replaceChildren(chip, names);

      const url = new URL(location.href);
      if (system) url.searchParams.delete("lang");
      else url.searchParams.set("lang", code);
      link.href = url.pathname + url.search + url.hash;
      link.setAttribute("aria-current", String(code === pref));
      link.addEventListener("click", (e) => {
        // Kept even for the choice already made, which may only be ?lang='s (a shared link) and not yet stored.
        try {
          if (system) localStorage.removeItem("lang");
          else localStorage.setItem("lang", code);
        } catch (err) { /* private mode: the URL still carries it */ }
        // The choice already made only closes the picker, as the apps' does.
        if (code === pref) { e.preventDefault(); picker.close(); return; }
        track("language_change", { language: code, origin: picker.dataset.origin });
      });
      const terms = [own, translated, system ? "" : nameIn(inEnglish, tag)].filter(Boolean).map(fold);
      const codes = system ? [] : [code.toLowerCase(), chipOf(code).toLowerCase()];
      return { link, terms, codes };
    });
    const current = rows.find((row) => row.link.dataset.setLang === pref)?.link;
    const shown = () => rows.filter((row) => !row.link.hidden).map((row) => row.link);

    // The footer's button names the language on the page, in its own name.
    const onPage = rows.find((row) => row.link.dataset.setLang === picked)?.link.querySelector(".lang-name");
    const now = document.getElementById("lang-now");
    if (now && onPage) { now.textContent = onPage.textContent; now.lang = onPage.lang; }

    function filter() {
      const query = fold(search.value.trim());
      rows.forEach((row) => {
        row.link.hidden = Boolean(query) && !row.codes.includes(query) && !row.terms.some((term) => term.includes(query));
      });
      const any = shown().length > 0;
      group.hidden = !any;
      clear.hidden = !search.value;
      empty.textContent = any ? "" : text.none.replace("{query}", () => search.value.trim());
    }
    search.addEventListener("input", filter);
    clear.addEventListener("click", () => { search.value = ""; filter(); search.focus(); });

    // Every opening starts from the whole list, the choice made in view and focused.
    document.querySelectorAll("[data-lang-open]").forEach((button) => button.addEventListener("click", () => {
      if (typeof picker.showModal !== "function") return;
      picker.dataset.origin = originOf(button) === "footer" ? "footer" : "header_menu";
      search.value = "";
      filter();
      picker.showModal();
      if (current) {
        list.scrollTop = current.offsetTop - (list.clientHeight - current.offsetHeight) / 2;
        current.focus({ preventScroll: true });
      }
      track("menu_click", { menu_id: "language_menu" });
    }));
    picker.querySelectorAll("[data-lang-close]").forEach((button) => button.addEventListener("click", () => picker.close()));
    // A click on the backdrop, outside the dialog's box, closes it; not a drag that only ends there (selecting the
    // search's text), whose click lands on the dialog too.
    const outside = (e) => {
      const box = picker.getBoundingClientRect();
      return e.target === picker && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom);
    };
    let pressedOutside = false;
    picker.addEventListener("pointerdown", (e) => { pressedOutside = outside(e); });
    picker.addEventListener("click", (e) => {
      if (pressedOutside && outside(e)) picker.close();
      pressedOutside = false;
    });
    // The keyboard: the arrows walk the rows and the search, Enter in the search picks the first row left, and typing
    // on a row goes to the search.
    picker.addEventListener("keydown", (e) => {
      if (e.isComposing) return;
      const links = shown();
      const at = links.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const next = e.key === "ArrowDown" ? links[at + 1] : at > 0 ? links[at - 1] : at === 0 ? search : null;
        if (next) { e.preventDefault(); next.focus(); }
      } else if (e.key === "Enter" && e.target === search && links[0]) {
        e.preventDefault();
        links[0].click();
      } else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey && e.target !== search) {
        search.focus();
      }
    });
  }

  // Internal links keep a pinned theme, language and "Show beta versions", so the design board can walk the pages.
  const pinned = ["theme", "lang", "beta"].filter((name) => params.has(name));
  if (pinned.length) {
    document.querySelectorAll('a[href^="/"]:not([data-set-lang])').forEach((link) => {
      const url = new URL(link.getAttribute("href"), location.origin);
      pinned.forEach((name) => url.searchParams.set(name, params.get(name)));
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

  // The header's menus (theme and "Get the app"): a click outside or Esc closes them.
  const menus = [...document.querySelectorAll(".theme-menu, .get-menu")];
  menus.forEach((menu) => menu.addEventListener("toggle", () => {
    if (menu.open) track("menu_click", { menu_id: menu.classList.contains("theme-menu") ? "theme_menu" : "get_menu" });
  }));
  document.addEventListener("click", (e) => {
    menus.forEach((menu) => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    menus.forEach((menu) => {
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
  const tocLinks = [...document.querySelectorAll(`[data-lang="${picked}"] .toc a, .toc[data-lang="${picked}"] a`)];
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

  // The release notes' "Show beta versions": off at first, kept for the next visit. Every language's block has its own
  // switch, so they move together, and site.css shows the beta versions while one is on. boot.js read the kept choice
  // into data-beta.
  const betaSwitches = [...document.querySelectorAll("[data-show-beta]")];
  function showBeta(on) {
    betaSwitches.forEach((el) => { el.checked = on; });
    root.dataset.beta = on ? "on" : "off";
  }
  if (betaSwitches.length) {
    showBeta(root.dataset.beta === "on");
    betaSwitches.forEach((el) => el.addEventListener("change", () => {
      const state = el.checked ? "on" : "off";
      showBeta(el.checked);
      try { localStorage.setItem("beta", state); } catch (e) { /* private mode: this page still switches */ }
      track("beta_versions_toggle", { state });
    }));
  }

  // The rest of the links: the logo, the landing's sections, "back to top", the legal pages, the release notes and
  // Support.
  document.querySelectorAll(".logo").forEach((a) => a.addEventListener("click", () => {
    track("logo_click", { origin: originOf(a) });
  }));
  document.querySelectorAll('.site-header .nav a[href^="#"]').forEach((a) => a.addEventListener("click", () => {
    track("navigation_click", { target: a.hash.slice(1), origin: "header" });
  }));
  toTop?.addEventListener("click", () => track("navigation_click", { target: "top", origin: "to_top" }));
  const PAGES = {
    "/privacy": { content_type: "legal", item_id: "privacy_policy" },
    "/terms": { content_type: "legal", item_id: "terms_of_service" },
    "/release-notes": { content_type: "release_notes", item_id: "release_notes" },
    "/support": { content_type: "support", item_id: "support" },
  };
  // Not the language picker's rows, which link to the page they are on. The selector takes any address that starts
  // as a page's does (so "/privacy#keep" and "/support?lang=pt" count), and the path, without a trailing slash, says
  // whether it is one: a link to another path that starts the same ("/support-faq") sends nothing.
  const toPages = Object.keys(PAGES).map((path) => `a[href^="${path}"]`).join(", ");
  document.querySelectorAll(`:is(${toPages}):not([data-set-lang])`).forEach((a) => a.addEventListener("click", () => {
    const page = PAGES[new URL(a.href).pathname.replace(/\/$/, "")];
    if (page) track("select_content", { ...page, origin: originOf(a) });
  }));
})();
