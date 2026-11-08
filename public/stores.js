// Where to get the app, as Bible Planner's landing does it: the visitor's platform picks which store comes first and
// stands out, the header's download button goes straight to it, a store of the other platform asks first, and
// /download (/download/android, /download/ios) redirects to the right store. Loaded in <head>, so a redirect happens
// before anything is drawn; the page's buttons are set once the DOM is ready.
//
// Turn a store on here once its listing is public, in step with blitz-split-client's stores.properties, and the web app
// once it is open to the public.
(function () {
  const CONFIG = {
    // Google Play: the listing exists but the app can't be downloaded from it yet.
    googlePlayLive: false,
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.quare.blitzsplit",
    // App Store: the numeric Apple ID of the listing (apps.apple.com/app/id<id>), empty until there is one. The iPhone,
    // iPad and Mac apps are one listing.
    appStoreId: "",
    // The web app: its address is decided, but it isn't open to the public yet.
    webAppLive: false,
    webAppUrl: "https://app.blitzsplit.com",
  };

  const root = document.documentElement;
  const lang = ["pt", "es", "fr", "de", "it", "pl"].includes(root.dataset.lang) ? root.dataset.lang : "en";

  // The platform. iPadOS reports a Mac, which only a touch screen tells apart. ?platform=android|ios|mac|desktop pins
  // one, to check each case (the design board uses it).
  const agent = navigator.userAgent;
  const pinned = new URLSearchParams(location.search).get("platform");
  const isAndroid = pinned ? pinned === "android" : /android/i.test(agent);
  const isIos = pinned ? pinned === "ios" : /iphone|ipad|ipod/i.test(agent) || (/macintosh/i.test(agent) && navigator.maxTouchPoints > 1);
  const isMac = pinned ? pinned === "mac" : /macintosh|mac os x/i.test(agent) && !isIos;
  const isApple = isIos || isMac;
  const platform = isAndroid ? "android" : isApple ? "apple" : "desktop";
  root.dataset.platform = isAndroid ? "android" : isIos ? "ios" : isMac ? "mac" : "desktop";

  // Each store's link in the visitor's language, or none while the store doesn't offer the app.
  const playUrl = CONFIG.googlePlayLive
    ? `${CONFIG.googlePlayUrl}&hl=${{ pt: "pt-BR", es: "es", fr: "fr", de: "de", it: "it", pl: "pl", en: "en" }[lang]}`
    : "";
  const appStoreUrl = CONFIG.appStoreId
    ? `https://apps.apple.com/${{ pt: "br", es: "es", fr: "fr", de: "de", it: "it", pl: "pl", en: "us" }[lang]}/app/id${CONFIG.appStoreId}`
    : "";
  const STORES = {
    play: { url: playUrl, platform: "android", name: "Google Play" },
    appstore: { url: appStoreUrl, platform: "apple", name: "App Store" },
    web: { url: CONFIG.webAppLive ? CONFIG.webAppUrl : "", platform: null, name: null },
  };
  const ownStore = platform === "android" ? "play" : platform === "apple" ? "appstore" : null;
  // What stands out: the visitor's own store once it offers the app, else the web app, which works anywhere, once it
  // is open; nothing while none of them is.
  const primary = ownStore && STORES[ownStore].url ? ownStore : STORES.web.url ? "web" : null;
  // The order: what stands out, then the visitor's own store, then the rest (Google Play, App Store, web).
  const order = [...new Set([primary, ownStore, "play", "appstore", "web"].filter(Boolean))];

  // /download, /download/android and /download/ios, plus /app-download (the apps' "Get the app"): straight to the
  // store, or to the landing's buttons while that store doesn't offer the app.
  const path = location.pathname.replace(/\/+$/, "");
  const wanted = { "/download/android": "play", "/download/ios": "appstore" }[path]
    || (["/download", "/app-download"].includes(path) ? (ownStore || "web") : null);
  if (wanted) {
    const target = STORES[wanted].url;
    if (target) { location.replace(target); return; }
    history.replaceState(null, "", "/" + location.search + "#get");
  }

  const TEXT = {
    en: {
      play: ["Get it on", "Coming soon to"], appstore: ["Download on the", "Coming soon to the"], web: ["Open in your", "Coming soon to your"], browser: "Browser",
      getApp: "Get the app", openWeb: "Open web app", soon: "Coming soon",
      playLive: "Available on Google Play", appStoreLive: "Available on the App Store", webLive: "Open the web app",
      mismatchTitle: "Choose your store",
      mismatchBody: "You're on {platform}. For the best experience, get the app {in}.",
      mismatchGo: "Go {to}", mismatchStay: "Continue {to}", close: "Close",
      in: { play: "from Google Play", appstore: "from the App Store" }, to: { play: "to Google Play", appstore: "to the App Store" },
    },
    pt: {
      play: ["Disponível no", "Em breve no"], appstore: ["Baixar na", "Em breve na"], web: ["Abrir no", "Em breve no"], browser: "Navegador",
      getApp: "Baixar o app", openWeb: "Abrir app web", soon: "Em breve",
      playLive: "Disponível no Google Play", appStoreLive: "Disponível na App Store", webLive: "Abrir o app web",
      mismatchTitle: "Escolha sua loja",
      mismatchBody: "Você está num {platform}. Para a melhor experiência, baixe o app {in}.",
      mismatchGo: "Ir {to}", mismatchStay: "Continuar {to}", close: "Fechar",
      in: { play: "no Google Play", appstore: "na App Store" }, to: { play: "para o Google Play", appstore: "para a App Store" },
    },
    es: {
      play: ["Disponible en", "Próximamente en"], appstore: ["Descárgalo en la", "Próximamente en la"], web: ["Abrir en el", "Próximamente en el"], browser: "Navegador",
      getApp: "Descargar la app", openWeb: "Abrir app web", soon: "Próximamente",
      playLive: "Disponible en Google Play", appStoreLive: "Disponible en la App Store", webLive: "Abrir la app web",
      mismatchTitle: "Elige tu tienda",
      mismatchBody: "Estás en un {platform}. Para la mejor experiencia, descarga la app {in}.",
      mismatchGo: "Ir {to}", mismatchStay: "Continuar {to}", close: "Cerrar",
      in: { play: "en Google Play", appstore: "en la App Store" }, to: { play: "a Google Play", appstore: "a la App Store" },
    },
    fr: {
      play: ["Disponible sur", "Bientôt sur"], appstore: ["Télécharger dans l'", "Bientôt dans l'"], web: ["Ouvrir dans votre", "Bientôt dans votre"], browser: "Navigateur",
      getApp: "Télécharger l'application", openWeb: "Ouvrir l'application web", soon: "Bientôt",
      playLive: "Disponible sur Google Play", appStoreLive: "Disponible sur l'App Store", webLive: "Ouvrir l'application web",
      mismatchTitle: "Choisissez votre store",
      mismatchBody: "Vous êtes sur {platform}. Pour la meilleure expérience, téléchargez l'application {in}.",
      mismatchGo: "Aller {to}", mismatchStay: "Continuer {to}", close: "Fermer",
      in: { play: "sur Google Play", appstore: "sur l'App Store" }, to: { play: "vers Google Play", appstore: "vers l'App Store" },
    },
    de: {
      play: ["Jetzt bei", "Bald bei"], appstore: ["Laden im", "Bald im"], web: ["Öffnen im", "Bald im"], browser: "Browser",
      getApp: "App holen", openWeb: "Web-App öffnen", soon: "Bald verfügbar",
      playLive: "Bei Google Play erhältlich", appStoreLive: "Im App Store erhältlich", webLive: "Web-App öffnen",
      mismatchTitle: "Wähl deinen Store",
      mismatchBody: "Du nutzt {platform}. Am besten holst du dir die App {in}.",
      mismatchGo: "Lieber {to}", mismatchStay: "Trotzdem {to}", close: "Schließen",
      in: { play: "bei Google Play", appstore: "im App Store" }, to: { play: "zu Google Play", appstore: "zum App Store" },
    },
    it: {
      play: ["Disponibile su", "Presto su"], appstore: ["Scarica su", "Presto su"], web: ["Apri nel", "Presto nel"], browser: "Browser",
      getApp: "Scarica l’app", openWeb: "Apri la web app", soon: "Presto disponibile",
      playLive: "Disponibile su Google Play", appStoreLive: "Disponibile su App Store", webLive: "Apri la web app",
      mismatchTitle: "Scegli il tuo store",
      mismatchBody: "Sei su {platform}. Per un’esperienza migliore, scarica l’app {in}.",
      mismatchGo: "Vai {to}", mismatchStay: "Continua {to}", close: "Chiudi",
      in: { play: "da Google Play", appstore: "dall’App Store" }, to: { play: "su Google Play", appstore: "sull’App Store" },
    },
    pl: {
      play: ["Pobierz z", "Wkrótce w"], appstore: ["Pobierz z", "Wkrótce w"], web: ["Otwórz w", "Wkrótce w"], browser: "przeglądarce",
      getApp: "Pobierz aplikację", openWeb: "Otwórz aplikację webową", soon: "Wkrótce",
      playLive: "Dostępna w Google Play", appStoreLive: "Dostępna w App Store", webLive: "Otwórz aplikację webową",
      mismatchTitle: "Wybierz sklep",
      mismatchBody: "Twoje urządzenie to {platform}. Najlepiej pobierz aplikację {in}.",
      mismatchGo: "Przejdź {to}", mismatchStay: "Mimo to przejdź {to}", close: "Zamknij",
      in: { play: "z Google Play", appstore: "z App Store" }, to: { play: "do Google Play", appstore: "do App Store" },
    },
  }[lang];
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
  const platformName = { android: "Android", ios: isIos && /ipad/i.test(agent) ? "iPad" : "iPhone", mac: "Mac" };

  // analytics.js, loaded before this script, sends the events.
  const track = (name, params) => window.track?.(name, params);

  function setUp() {
    // The badges: each store linked, standing out or not, or shown as "Coming soon" with no link.
    document.querySelectorAll("[data-stores]").forEach((group) => {
      const origin = group.dataset.stores;
      order.forEach((key) => {
        const badge = group.querySelector(`[data-store="${key}"]`);
        if (!badge) return;
        const store = STORES[key];
        const small = badge.querySelector("small");
        badge.classList.toggle("is-primary", key === primary);
        badge.classList.toggle("store-soon", !store.url);
        if (store.url) {
          badge.setAttribute("href", store.url);
          badge.removeAttribute("aria-disabled");
          small.textContent = TEXT[key][0];
          badge.addEventListener("click", (e) => onStoreClick(e, key, origin));
        } else {
          badge.removeAttribute("href");
          badge.setAttribute("aria-disabled", "true");
          small.textContent = TEXT[key][1];
        }
        if (key === "web") badge.querySelector("strong").textContent = TEXT.browser;
        group.append(badge);
      });
    });

    // The Platforms section and the footer: a store's status, its link only while it offers the app.
    document.querySelectorAll("[data-store-status]").forEach((el) => {
      const key = el.dataset.storeStatus;
      const live = Boolean(STORES[key].url);
      el.classList.toggle("live", live);
      el.classList.toggle("soon", !live);
      el.textContent = live ? TEXT[{ play: "playLive", appstore: "appStoreLive", web: "webLive" }[key]] : TEXT.soon;
      if (live) el.setAttribute("href", STORES[key].url); else el.removeAttribute("href");
    });
    document.querySelectorAll("[data-store-link]").forEach((el) => {
      const url = STORES[el.dataset.storeLink].url;
      el.hidden = !url;
      if (url) el.setAttribute("href", url);
    });

    setUpHeader();
  }

  // The header's main button: on a phone, straight to its store; on a computer, a menu of the stores that offer the
  // app; with no store for the visitor, the web app; with nothing open yet, no button.
  function setUpHeader() {
    document.querySelectorAll("[data-header-get]").forEach((slot) => {
      const live = ["play", "appstore"].filter((key) => STORES[key].url);
      const web = slot.querySelector("[data-header-web]");
      const button = slot.querySelector("[data-header-store]");
      const menu = slot.querySelector("[data-header-menu]");
      const direct = ownStore && STORES[ownStore].url ? ownStore : null;
      web.textContent = TEXT.openWeb;
      const webUrl = STORES.web.url;
      if (webUrl) web.href = webUrl;
      if (direct || (platform === "desktop" && live.length === 1)) {
        const key = direct || live[0];
        button.href = STORES[key].url;
        button.textContent = TEXT.getApp;
        button.hidden = false;
        button.addEventListener("click", (e) => onStoreClick(e, key, "header"));
        menu.hidden = true;
        web.hidden = !webUrl;
      } else if (platform === "desktop" && live.length > 1) {
        menu.hidden = false;
        menu.querySelector("summary").textContent = TEXT.getApp;
        const pop = menu.querySelector(".lang-pop");
        live.forEach((key) => {
          const item = document.createElement("a");
          item.href = STORES[key].url;
          item.textContent = STORES[key].name;
          item.addEventListener("click", () => track("store_click", { store: key, origin: "header_menu" }));
          pop.append(item);
        });
        button.hidden = true;
        web.hidden = !webUrl;
      } else if (webUrl) {
        // No store offers the app on this platform yet: the web app is the main button.
        button.hidden = false;
        button.href = webUrl;
        button.textContent = TEXT.openWeb;
        button.addEventListener("click", () => track("store_click", { store: "web", origin: "header" }));
        menu.hidden = true;
        web.hidden = true;
      } else {
        // Nothing to get or open yet: the header keeps its menus only.
        button.hidden = true;
        menu.hidden = true;
        web.hidden = true;
      }
    });
  }

  // A store of the other platform asks first (an iPhone on Google Play, an Android on the App Store), when the
  // visitor's own store offers the app.
  function onStoreClick(event, key, origin) {
    track("store_click", { store: key, origin, platform: root.dataset.platform });
    const store = STORES[key];
    if (!store.platform || !ownStore || key === ownStore || !STORES[ownStore].url) return;
    event.preventDefault();
    const dialog = document.getElementById("store-mismatch");
    if (!dialog || typeof dialog.showModal !== "function") { location.href = store.url; return; }
    const recommended = STORES[ownStore];
    dialog.querySelector("h2").textContent = TEXT.mismatchTitle;
    dialog.querySelector("p").textContent = fill(TEXT.mismatchBody, { platform: platformName[root.dataset.platform], in: TEXT.in[ownStore] });
    const go = dialog.querySelector("[data-go]");
    const stay = dialog.querySelector("[data-stay]");
    go.textContent = fill(TEXT.mismatchGo, { to: TEXT.to[ownStore] });
    go.href = recommended.url;
    stay.textContent = fill(TEXT.mismatchStay, { to: TEXT.to[key] });
    stay.href = store.url;
    go.onclick = () => track("store_mismatch_go", { store: ownStore });
    stay.onclick = () => track("store_mismatch_stay", { store: key });
    const close = dialog.querySelector("[data-close]");
    close.setAttribute("aria-label", TEXT.close);
    close.onclick = () => track("store_mismatch_dismiss", { method: "close_button" });
    dialog.oncancel = () => track("store_mismatch_dismiss", { method: "escape" });
    track("store_mismatch_view", { clicked: key, recommended: ownStore });
    dialog.showModal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setUp);
  else setUp();
})();
