// Where to get the app, as Bible Planner's landing does it: the visitor's platform picks which store comes first and
// stands out, the header's download button goes straight to it, a store of the other platform asks first, and
// /download (/download/android, /download/ios) redirects to the right store. Loaded with defer, so it never holds up
// the first paint (a /download path's redirect waits for the page to be parsed, then up to REDIRECT_WAIT_MS for
// Analytics to send store_redirect); the buttons are set right then.
//
// Turn a store on here once its listing is public, in step with blitz-split-client's stores.properties, and the web app
// once it is open to the public.
(function () {
  const CONFIG = {
    // Google Play: the app is public there.
    googlePlayLive: true,
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.quare.blitzsplit",
    // App Store: the numeric Apple ID of the listing (apps.apple.com/app/id<id>), empty until there is one. The iPhone,
    // iPad and Mac apps are one listing.
    appStoreId: "",
    // The web app: open to the public. Its address is also written in the three fallback hrefs of public/index.html
    // (used without JavaScript) and in redirect/index.js: change them together.
    webAppLive: true,
    webAppUrl: "https://web.blitzsplit.com",
  };

  const root = document.documentElement;

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

  // The campaign that brought the visitor, for Google Play's install referrer: Google Play hands it to the app on its
  // first launch, so an install can be traced to the campaign. Only the utm_* values go, from the address or, after
  // moving between the site's pages, from what analytics.js kept for this visit. Why it reads them itself: ad blockers
  // often block analytics.js, and the install should still carry its campaign.
  function campaignReferrer() {
    const address = new URLSearchParams(location.search);
    let kept = {};
    try { kept = JSON.parse(sessionStorage.getItem("utm")) || {}; } catch (e) { /* storage blocked: only the address counts */ }
    const referrer = new URLSearchParams();
    ["source", "medium", "campaign", "term", "content"].forEach((key) => {
      const value = address.get("utm_source") ? address.get(`utm_${key}`)?.slice(0, 100) : kept[key];
      if (value) referrer.set(`utm_${key}`, value);
    });
    // Why %20: URLSearchParams writes a space as "+", which Google Play's referrer would hand to the app as a literal +.
    return referrer.toString().replace(/\+/g, "%20");
  }
  const referrer = campaignReferrer();

  // Each store's link in the visitor's language, or none while the store doesn't offer the app. Chinese names no App
  // Store storefront: China's lists only apps with an ICP filing, so Apple takes the visitor's own. Neither does Persian:
  // the App Store has no storefront in Iran. Nor does Catalan, which has no country of its own (Spain, Andorra, France, Italy).
  // Why iw: Google Play documents Hebrew by its legacy code, the one it has always honoured.
  const playUrl = CONFIG.googlePlayLive
    ? `${CONFIG.googlePlayUrl}&hl=${{ zh: "zh-CN", "zh-Hant": "zh-TW", he: "iw", sr: "sr", nb: "no" }[root.dataset.lang] || root.lang}${referrer ? `&referrer=${encodeURIComponent(referrer)}` : ""}` // the page's tag, as boot.js set it (pt-BR, pt-PT, en, hi…), but Chinese's (Simplified and Traditional), Hebrew's, Serbian's and Norwegian's as Google Play writes them (Play has one Serbian, sr, and no code for the Latin script the site writes, and names Norwegian no, as its no-NO listing)
    : "";
  const appStoreUrl = CONFIG.appStoreId
    ? `https://apps.apple.com/${window.localized({ "pt-PT": "pt/", pt: "br/", es: "es/", fr: "fr/", de: "de/", it: "it/", pl: "pl/", nl: "nl/", tr: "tr/", id: "id/", ja: "jp/", ru: "ru/", uk: "ua/", ko: "kr/", ar: "sa/", hi: "in/", zh: "", he: "il/", th: "th/", vi: "vn/", "zh-Hant": "tw/", sv: "se/", cs: "cz/", ro: "ro/", bn: "bd/", ms: "my/", el: "gr/", hu: "hu/", fil: "ph/", ur: "pk/", hr: "hr/", sr: "rs/", sk: "sk/", nb: "no/", fa: "", sw: "ke/", ta: "in/", te: "in/", mr: "in/", bg: "bg/", ca: "", da: "dk/", fi: "fi/", gu: "in/", en: "us/" })}app/id${CONFIG.appStoreId}`
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
  // A phone or a Mac sees the other platform's store only when "Choose your store" can stand in front of it: that store
  // offers the app and so does the visitor's own.
  const isOffered = (key) => !ownStore || key === ownStore || key === "web" || Boolean(STORES[key].url && STORES[ownStore].url);

  // /download, /download/android and /download/ios, plus /app-download (the apps' "Get the app"): straight to the
  // store, or to the landing's buttons while that store doesn't offer the app. /download on a computer opens the web app;
  // /app-download doesn't, as the web app's own "Get the app" links there and would only come back to it.
  const path = location.pathname.replace(/\/+$/, "");
  const wanted = { "/download/android": "play", "/download/ios": "appstore" }[path]
    || (["/download", "/app-download"].includes(path) ? (ownStore || "web") : null);
  const redirect = wanted && !(wanted === "web" && path === "/app-download") ? STORES[wanted].url : "";
  if (wanted && !redirect) history.replaceState(null, "", "/" + location.search + "#get");

  const TEXT = window.localized({
    en: {
      play: ["Get it on", "Coming soon to"], appstore: ["Download on the", "Coming soon to the"], web: ["Open in your", "Coming soon to your"], browser: "Browser",
      getApp: "Get the app", openWeb: "Open web app", soon: "Coming soon",
      noteStore: "Get the app {in}.", noteApple: "On {platform}? Use it in your browser until the app reaches the App Store.", noteWeb: "Open it in your browser, nothing to install.",
      playLive: "Available on Google Play", appStoreLive: "Available on the App Store", webLive: "Open the web app",
      mismatchTitle: "Choose your store",
      mismatchBody: "You're on {platform}. For the best experience, get the app {in}.",
      mismatchGo: "Go {to}", mismatchStay: "Continue {to}", close: "Close",
      in: { play: "from Google Play", appstore: "from the App Store" }, to: { play: "to Google Play", appstore: "to the App Store" },
    },
    pt: {
      play: ["Disponível no", "Em breve no"], appstore: ["Baixar na", "Em breve na"], web: ["Abrir no", "Em breve no"], browser: "Navegador",
      getApp: "Baixar o app", openWeb: "Abrir app web", soon: "Em breve",
      noteStore: "Baixe o app {in}.", noteApple: "No {platform}? Use pelo navegador enquanto o app não chega à App Store.", noteWeb: "Abra no navegador, sem instalar nada.",
      playLive: "Disponível no Google Play", appStoreLive: "Disponível na App Store", webLive: "Abrir o app web",
      mismatchTitle: "Escolha sua loja",
      mismatchBody: "Você está num {platform}. Para a melhor experiência, baixe o app {in}.",
      mismatchGo: "Ir {to}", mismatchStay: "Continuar {to}", close: "Fechar",
      in: { play: "no Google Play", appstore: "na App Store" }, to: { play: "para o Google Play", appstore: "para a App Store" },
    },
    // Portugal's Portuguese: only what Portugal says differently, the rest is pt's.
    "pt-PT": {
      play: ["Disponível no", "Brevemente no"], appstore: ["Descarregar na", "Brevemente na"], web: ["Abrir no", "Brevemente no"],
      getApp: "Descarregar a app", soon: "Brevemente", webLive: "Abrir a app web",
      noteStore: "Descarrega a app {in}.", noteApple: "No {platform}? Usa no navegador até a app chegar à App Store.", noteWeb: "Abre no navegador, sem instalar nada.",
      mismatchTitle: "Escolhe a tua loja",
      mismatchBody: "Estás num {platform}. Para a melhor experiência, descarrega a app {in}.",
    },
    es: {
      play: ["Disponible en", "Próximamente en"], appstore: ["Descárgalo en la", "Próximamente en la"], web: ["Abrir en el", "Próximamente en el"], browser: "Navegador",
      getApp: "Descargar la app", openWeb: "Abrir app web", soon: "Próximamente",
      noteStore: "Descarga la app {in}.", noteApple: "¿En tu {platform}? Úsala en el navegador hasta que la app llegue a la App Store.", noteWeb: "Ábrela en el navegador, sin instalar nada.",
      playLive: "Disponible en Google Play", appStoreLive: "Disponible en la App Store", webLive: "Abrir la app web",
      mismatchTitle: "Elige tu tienda",
      mismatchBody: "Estás en un {platform}. Para la mejor experiencia, descarga la app {in}.",
      mismatchGo: "Ir {to}", mismatchStay: "Continuar {to}", close: "Cerrar",
      in: { play: "en Google Play", appstore: "en la App Store" }, to: { play: "a Google Play", appstore: "a la App Store" },
    },
    fr: {
      play: ["Disponible sur", "Bientôt sur"], appstore: ["Télécharger dans l'", "Bientôt dans l'"], web: ["Ouvrir dans votre", "Bientôt dans votre"], browser: "Navigateur",
      getApp: "Télécharger l'application", openWeb: "Ouvrir l'application web", soon: "Bientôt",
      noteStore: "Téléchargez l'application {in}.", noteApple: "Sur {platform} ? Utilisez-la dans votre navigateur en attendant son arrivée sur l'App Store.", noteWeb: "Ouvrez-la dans votre navigateur, rien à installer.",
      playLive: "Disponible sur Google Play", appStoreLive: "Disponible sur l'App Store", webLive: "Ouvrir l'application web",
      mismatchTitle: "Choisissez votre store",
      mismatchBody: "Vous êtes sur {platform}. Pour la meilleure expérience, téléchargez l'application {in}.",
      mismatchGo: "Aller {to}", mismatchStay: "Continuer {to}", close: "Fermer",
      in: { play: "sur Google Play", appstore: "sur l'App Store" }, to: { play: "vers Google Play", appstore: "vers l'App Store" },
    },
    de: {
      play: ["Jetzt bei", "Bald bei"], appstore: ["Laden im", "Bald im"], web: ["Öffnen im", "Bald im"], browser: "Browser",
      getApp: "App holen", openWeb: "Web-App öffnen", soon: "Bald verfügbar",
      noteStore: "Hol dir die App {in}.", noteApple: "Auf dem {platform}? Nutz sie im Browser, bis die App im App Store ist.", noteWeb: "Öffne sie im Browser, ohne etwas zu installieren.",
      playLive: "Bei Google Play erhältlich", appStoreLive: "Im App Store erhältlich", webLive: "Web-App öffnen",
      mismatchTitle: "Wähl deinen Store",
      mismatchBody: "Du nutzt {platform}. Am besten holst du dir die App {in}.",
      mismatchGo: "Lieber {to}", mismatchStay: "Trotzdem {to}", close: "Schließen",
      in: { play: "bei Google Play", appstore: "im App Store" }, to: { play: "zu Google Play", appstore: "zum App Store" },
    },
    it: {
      play: ["Disponibile su", "Presto su"], appstore: ["Scarica su", "Presto su"], web: ["Apri nel", "Presto nel"], browser: "Browser",
      getApp: "Scarica l’app", openWeb: "Apri la web app", soon: "Presto disponibile",
      noteStore: "Scarica l’app {in}.", noteApple: "Su {platform}? Usala nel browser finché l’app non arriva su App Store.", noteWeb: "Aprila nel browser, senza installare nulla.",
      playLive: "Disponibile su Google Play", appStoreLive: "Disponibile su App Store", webLive: "Apri la web app",
      mismatchTitle: "Scegli il tuo store",
      mismatchBody: "Sei su {platform}. Per un’esperienza migliore, scarica l’app {in}.",
      mismatchGo: "Vai {to}", mismatchStay: "Continua {to}", close: "Chiudi",
      in: { play: "da Google Play", appstore: "dall’App Store" }, to: { play: "su Google Play", appstore: "sull’App Store" },
    },
    pl: {
      play: ["Pobierz z", "Wkrótce w"], appstore: ["Pobierz z", "Wkrótce w"], web: ["Otwórz w", "Wkrótce w"], browser: "przeglądarce",
      getApp: "Pobierz aplikację", openWeb: "Otwórz aplikację webową", soon: "Wkrótce",
      noteStore: "Pobierz aplikację {in}.", noteApple: "Używasz urządzenia {platform}? Korzystaj w przeglądarce, dopóki aplikacja nie trafi do App Store.", noteWeb: "Otwórz ją w przeglądarce, bez instalowania.",
      playLive: "Dostępna w Google Play", appStoreLive: "Dostępna w App Store", webLive: "Otwórz aplikację webową",
      mismatchTitle: "Wybierz sklep",
      mismatchBody: "Twoje urządzenie to {platform}. Najlepiej pobierz aplikację {in}.",
      mismatchGo: "Przejdź {to}", mismatchStay: "Mimo to przejdź {to}", close: "Zamknij",
      in: { play: "z Google Play", appstore: "z App Store" }, to: { play: "do Google Play", appstore: "do App Store" },
    },
    nl: {
      play: ["Ontdek het op", "Binnenkort op"], appstore: ["Download in de", "Binnenkort in de"], web: ["Open in je", "Binnenkort in je"], browser: "Browser",
      getApp: "Download de app", openWeb: "Web-app openen", soon: "Binnenkort",
      noteStore: "Download de app {in}.", noteApple: "Op je {platform}? Gebruik hem in je browser tot de app in de App Store staat.", noteWeb: "Open hem in je browser, zonder iets te installeren.",
      playLive: "Beschikbaar op Google Play", appStoreLive: "Beschikbaar in de App Store", webLive: "Open de web-app",
      mismatchTitle: "Kies je store",
      mismatchBody: "Je gebruikt een {platform}. Download de app voor de beste ervaring {in}.",
      mismatchGo: "Ga {to}", mismatchStay: "Toch {to}", close: "Sluiten",
      in: { play: "via Google Play", appstore: "via de App Store" }, to: { play: "naar Google Play", appstore: "naar de App Store" },
    },
    tr: {
      play: ["Şuradan indir", "Yakında"], appstore: ["Şuradan indir", "Yakında"], web: ["Şurada aç", "Yakında"], browser: "Tarayıcında",
      getApp: "Uygulamayı indir", openWeb: "Web uygulamasını aç", soon: "Yakında",
      noteStore: "Uygulamayı {in} indir.", noteApple: "{platform} kullanıcısı mısın? Uygulama App Store'a gelene kadar tarayıcında kullan.", noteWeb: "Hiçbir şey yüklemeden tarayıcında aç.",
      playLive: "Google Play'de mevcut", appStoreLive: "App Store'da mevcut", webLive: "Web uygulamasını aç",
      mismatchTitle: "Mağazanı seç",
      mismatchBody: "{platform} kullanıyorsun. En iyi deneyim için uygulamayı {in} indir.",
      mismatchGo: "{to} git", mismatchStay: "Yine de {to} git", close: "Kapat",
      in: { play: "Google Play'den", appstore: "App Store'dan" }, to: { play: "Google Play'e", appstore: "App Store'a" },
    },
    id: {
      play: ["Temukan di", "Segera di"], appstore: ["Unduh di", "Segera di"], web: ["Buka di", "Segera di"], browser: "Browser",
      getApp: "Unduh aplikasinya", openWeb: "Buka aplikasi web", soon: "Segera hadir",
      noteStore: "Unduh aplikasinya {in}.", noteApple: "Pakai {platform}? Gunakan di browser sampai aplikasinya hadir di App Store.", noteWeb: "Buka di browser, tanpa perlu memasang apa pun.",
      playLive: "Tersedia di Google Play", appStoreLive: "Tersedia di App Store", webLive: "Buka aplikasi web",
      mismatchTitle: "Pilih toko aplikasimu",
      mismatchBody: "Kamu memakai {platform}. Untuk pengalaman terbaik, unduh aplikasinya {in}.",
      mismatchGo: "Ke {to}", mismatchStay: "Tetap ke {to}", close: "Tutup",
      in: { play: "dari Google Play", appstore: "dari App Store" }, to: { play: "Google Play", appstore: "App Store" },
    },
    ja: {
      play: ["ダウンロード", "近日公開"], appstore: ["ダウンロード", "近日公開"], web: ["今すぐ開く", "近日公開"], browser: "ブラウザ",
      getApp: "アプリを入手", openWeb: "Webアプリを開く", soon: "近日公開",
      noteStore: "{in}アプリを入手できます。", noteApple: "{platform}をお使いですか？App Storeで公開されるまでは、ブラウザでご利用ください。", noteWeb: "インストール不要で、ブラウザですぐに開けます。",
      playLive: "Google Playで配信中", appStoreLive: "App Storeで配信中", webLive: "Webアプリを開く",
      mismatchTitle: "ストアを選択",
      mismatchBody: "お使いの端末は{platform}です。快適に使うには、{in}アプリを入手してください。",
      mismatchGo: "{to}へ", mismatchStay: "このまま{to}へ", close: "閉じる",
      in: { play: "Google Playから", appstore: "App Storeから" }, to: { play: "Google Play", appstore: "App Store" },
    },
    ru: {
      play: ["Доступно в", "Скоро в"], appstore: ["Загрузи в", "Скоро в"], web: ["Открой в", "Скоро в"], browser: "браузере",
      getApp: "Скачать приложение", openWeb: "Открыть веб-приложение", soon: "Скоро",
      noteStore: "Скачай приложение {in}.", noteApple: "У тебя {platform}? Пользуйся в браузере, пока приложение не появится в App Store.", noteWeb: "Открой в браузере, ничего не устанавливая.",
      playLive: "Доступно в Google Play", appStoreLive: "Доступно в App Store", webLive: "Открыть веб-приложение",
      mismatchTitle: "Выбери магазин",
      mismatchBody: "У тебя {platform}. Чтобы всё работало лучше всего, скачай приложение {in}.",
      mismatchGo: "Перейти {to}", mismatchStay: "Всё равно перейти {to}", close: "Закрыть",
      in: { play: "из Google Play", appstore: "из App Store" }, to: { play: "в Google Play", appstore: "в App Store" },
    },
    uk: {
      play: ["Доступно в", "Незабаром у"], appstore: ["Завантаж з", "Незабаром в"], web: ["Відкрий у", "Незабаром у"], browser: "браузері",
      getApp: "Завантажити застосунок", openWeb: "Відкрити вебзастосунок", soon: "Незабаром",
      noteStore: "Завантаж застосунок {in}.", noteApple: "У тебе {platform}? Користуйся в браузері, доки застосунок не з’явиться в App Store.", noteWeb: "Відкрий у браузері, нічого не встановлюючи.",
      playLive: "Доступно в Google Play", appStoreLive: "Доступно в App Store", webLive: "Відкрити вебзастосунок",
      mismatchTitle: "Обери магазин",
      mismatchBody: "У тебе {platform}. Щоб усе працювало найкраще, завантаж застосунок {in}.",
      mismatchGo: "Перейти {to}", mismatchStay: "Усе одно перейти {to}", close: "Закрити",
      in: { play: "з Google Play", appstore: "з App Store" }, to: { play: "до Google Play", appstore: "до App Store" },
    },
    ko: {
      play: ["다운로드하기", "출시 예정"], appstore: ["다운로드하기", "출시 예정"], web: ["지금 열기", "출시 예정"], browser: "브라우저",
      getApp: "앱 받기", openWeb: "웹 앱 열기", soon: "출시 예정",
      noteStore: "{in} 앱을 받으세요.", noteApple: "{platform} 사용자라면 App Store에 출시될 때까지 브라우저에서 사용하세요.", noteWeb: "설치 없이 브라우저에서 바로 열어 보세요.",
      playLive: "Google Play에서 받기", appStoreLive: "App Store에서 받기", webLive: "웹 앱 열기",
      mismatchTitle: "스토어 선택",
      mismatchBody: "지금 {platform} 기기를 쓰고 있어요. 가장 잘 쓰려면 {in} 앱을 받으세요.",
      mismatchGo: "{to} 이동", mismatchStay: "그대로 {to} 이동", close: "닫기",
      in: { play: "Google Play에서", appstore: "App Store에서" }, to: { play: "Google Play로", appstore: "App Store로" },
    },
    ar: {
      play: ["متوفر على", "قريبًا على"], appstore: ["تنزيل من", "قريبًا على"], web: ["فتح في", "قريبًا في"], browser: "المتصفح",
      getApp: "تنزيل التطبيق", openWeb: "فتح تطبيق الويب", soon: "قريبًا",
      noteStore: "تنزيل التطبيق {in}.", noteApple: "تستخدم {platform}؟ يمكن استخدامه في المتصفح إلى أن يصل التطبيق إلى App Store.", noteWeb: "فتحه في المتصفح دون تثبيت أي شيء.",
      playLive: "متوفر على Google Play", appStoreLive: "متوفر على App Store", webLive: "فتح تطبيق الويب",
      mismatchTitle: "اختيار المتجر",
      mismatchBody: "جهازك يعمل بنظام {platform}. للحصول على أفضل تجربة، يُنصح بتنزيل التطبيق {in}.",
      mismatchGo: "الانتقال {to}", mismatchStay: "المتابعة {to}", close: "إغلاق",
      in: { play: "من Google Play", appstore: "من App Store" }, to: { play: "إلى Google Play", appstore: "إلى App Store" },
    },
    hi: {
      play: ["इसे पाएं", "जल्द आ रहा है"], appstore: ["डाउनलोड करें", "जल्द आ रहा है"], web: ["अभी खोलें", "जल्द आ रहा है"], browser: "ब्राउज़र",
      getApp: "ऐप पाएं", openWeb: "वेब ऐप खोलें", soon: "जल्द आ रहा है",
      noteStore: "ऐप {in} पाएं।", noteApple: "{platform} पर हैं? App Store पर ऐप आने तक इसे ब्राउज़र में इस्तेमाल करें।", noteWeb: "बिना कुछ इंस्टॉल किए ब्राउज़र में खोलें।",
      playLive: "Google Play पर उपलब्ध", appStoreLive: "App Store पर उपलब्ध", webLive: "वेब ऐप खोलें",
      mismatchTitle: "अपना स्टोर चुनें",
      mismatchBody: "आप {platform} पर हैं। सबसे अच्छे अनुभव के लिए ऐप {in} पाएं।",
      mismatchGo: "{to} जाएं", mismatchStay: "फिर भी {to} जाएं", close: "बंद करें",
      in: { play: "Google Play से", appstore: "App Store से" }, to: { play: "Google Play पर", appstore: "App Store पर" },
    },
    zh: {
      play: ["立即下载", "即将登陆"], appstore: ["立即下载", "即将登陆"], web: ["立即打开", "即将登陆"], browser: "浏览器",
      getApp: "下载应用", openWeb: "打开网页版", soon: "即将上线",
      noteStore: "请{in}下载应用。", noteApple: "正在使用{platform}？在应用登陆App Store之前，请先在浏览器中使用。", noteWeb: "在浏览器中打开，无需安装。",
      playLive: "在Google Play下载", appStoreLive: "在App Store下载", webLive: "打开网页版",
      mismatchTitle: "选择你的应用商店",
      mismatchBody: "你正在使用{platform}。为获得最佳体验，请{in}下载应用。",
      mismatchGo: "{to}", mismatchStay: "仍然{to}", close: "关闭",
      in: { play: "从Google Play", appstore: "从App Store" }, to: { play: "前往Google Play", appstore: "前往App Store" },
    },
    he: {
      play: ["זמין ב-", "בקרוב ב-"], appstore: ["להורדה מ-", "בקרוב ב-"], web: ["לפתיחה", "בקרוב"], browser: "בדפדפן",
      getApp: "הורדת האפליקציה", openWeb: "פתיחת אפליקציית הווב", soon: "בקרוב",
      noteStore: "כדאי להוריד את האפליקציה {in}.", noteApple: "משתמשים ב-{platform}? אפשר להשתמש בדפדפן עד שהאפליקציה תגיע ל-App Store.", noteWeb: "פתיחה בדפדפן, בלי להתקין כלום.",
      playLive: "זמין ב-Google Play", appStoreLive: "זמין ב-App Store", webLive: "פתיחת אפליקציית הווב",
      mismatchTitle: "בחירת חנות",
      mismatchBody: "המכשיר הזה הוא {platform}. לחוויה הטובה ביותר, כדאי להוריד את האפליקציה {in}.",
      mismatchGo: "מעבר {to}", mismatchStay: "המשך {to}", close: "סגירה",
      in: { play: "מ-Google Play", appstore: "מ-App Store" }, to: { play: "ל-Google Play", appstore: "ל-App Store" },
    },
    th: {
      play: ["ดาวน์โหลดได้ที่", "เร็วๆ นี้ที่"], appstore: ["ดาวน์โหลดได้ที่", "เร็วๆ นี้ที่"], web: ["เปิดใน", "เร็วๆ นี้ใน"], browser: "เบราว์เซอร์",
      getApp: "ดาวน์โหลดแอป", openWeb: "เปิดเว็บแอป", soon: "เร็วๆ นี้",
      noteStore: "ดาวน์โหลดแอป{in}", noteApple: "ใช้ {platform} อยู่ใช่ไหม ใช้งานผ่านเบราว์เซอร์ได้จนกว่าแอปจะมาถึง App Store", noteWeb: "เปิดในเบราว์เซอร์ได้เลย ไม่ต้องติดตั้ง",
      playLive: "ดาวน์โหลดได้ที่ Google Play", appStoreLive: "ดาวน์โหลดได้ที่ App Store", webLive: "เปิดเว็บแอป",
      mismatchTitle: "เลือกสโตร์ของคุณ",
      mismatchBody: "คุณกำลังใช้ {platform} เพื่อประสบการณ์ที่ดีที่สุด ดาวน์โหลดแอป{in}",
      mismatchGo: "ไป{to}", mismatchStay: "ไปต่อ{to}", close: "ปิด",
      in: { play: "จาก Google Play", appstore: "จาก App Store" }, to: { play: "ที่ Google Play", appstore: "ที่ App Store" },
    },
    vi: {
      play: ["Tải về trên", "Sắp có trên"], appstore: ["Tải về trên", "Sắp có trên"], web: ["Mở trong", "Sắp có trong"], browser: "Trình duyệt",
      getApp: "Tải ứng dụng", openWeb: "Mở ứng dụng web", soon: "Sắp có",
      noteStore: "Tải ứng dụng {in}.", noteApple: "Bạn dùng {platform}? Hãy dùng trên trình duyệt cho đến khi ứng dụng có mặt trên App Store.", noteWeb: "Mở trên trình duyệt, không cần cài đặt.",
      playLive: "Có trên Google Play", appStoreLive: "Có trên App Store", webLive: "Mở ứng dụng web",
      mismatchTitle: "Chọn cửa hàng của bạn",
      mismatchBody: "Bạn đang dùng {platform}. Để có trải nghiệm tốt nhất, hãy tải ứng dụng {in}.",
      mismatchGo: "Chuyển đến {to}", mismatchStay: "Tiếp tục đến {to}", close: "Đóng",
      in: { play: "từ Google Play", appstore: "từ App Store" }, to: { play: "Google Play", appstore: "App Store" },
    },
    "zh-Hant": {
      play: ["立即下載", "即將登陸"], appstore: ["立即下載", "即將登陸"], web: ["立即開啟", "即將登陸"], browser: "瀏覽器",
      getApp: "下載App", openWeb: "開啟網頁版", soon: "即將推出",
      noteStore: "請{in}下載App。", noteApple: "正在使用{platform}？在App於App Store上架前，請先在瀏覽器中使用。", noteWeb: "在瀏覽器中開啟，無須安裝。",
      playLive: "在Google Play下載", appStoreLive: "在App Store下載", webLive: "開啟網頁版",
      mismatchTitle: "選擇你的應用程式商店",
      mismatchBody: "你正在使用{platform}。為了獲得最佳體驗，請{in}下載App。",
      mismatchGo: "{to}", mismatchStay: "仍然{to}", close: "關閉",
      in: { play: "從Google Play", appstore: "從App Store" }, to: { play: "前往Google Play", appstore: "前往App Store" },
    },
    sv: {
      play: ["Ladda ned på", "Kommer snart till"], appstore: ["Ladda ned från", "Kommer snart till"], web: ["Öppna i din", "Kommer snart till din"], browser: "webbläsare",
      getApp: "Hämta appen", openWeb: "Öppna webbappen", soon: "Kommer snart",
      noteStore: "Hämta appen {in}.", noteApple: "Använder du {platform}? Använd den i webbläsaren tills appen finns på App Store.", noteWeb: "Öppna den i webbläsaren, inget att installera.",
      playLive: "Finns på Google Play", appStoreLive: "Finns på App Store", webLive: "Öppna webbappen",
      mismatchTitle: "Välj din butik",
      mismatchBody: "Du använder {platform}. För bästa upplevelse, hämta appen {in}.",
      mismatchGo: "Gå {to}", mismatchStay: "Fortsätt {to}", close: "Stäng",
      in: { play: "från Google Play", appstore: "från App Store" }, to: { play: "till Google Play", appstore: "till App Store" },
    },
    cs: {
      play: ["Stáhnout na", "Brzy na"], appstore: ["Stáhnout v", "Brzy v"], web: ["Otevřít v", "Brzy v"], browser: "prohlížeči",
      getApp: "Stáhnout aplikaci", openWeb: "Otevřít webovou aplikaci", soon: "Brzy",
      noteStore: "Stáhni si aplikaci {in}.", noteApple: "Používáš {platform}? Používej ji v prohlížeči, dokud aplikace nebude v App Store.", noteWeb: "Otevři ji v prohlížeči bez instalace.",
      playLive: "K dispozici na Google Play", appStoreLive: "K dispozici v App Store", webLive: "Otevřít webovou aplikaci",
      mismatchTitle: "Vyber si obchod",
      mismatchBody: "Používáš {platform}. Nejlépe si aplikaci stáhni {in}.",
      mismatchGo: "Přejít {to}", mismatchStay: "Přesto pokračovat {to}", close: "Zavřít",
      in: { play: "z Google Play", appstore: "z App Store" }, to: { play: "na Google Play", appstore: "do App Store" },
    },
    ro: {
      play: ["Descarcă din", "În curând pe"], appstore: ["Descarcă din", "În curând în"], web: ["Deschide în", "În curând în"], browser: "browser",
      getApp: "Descarcă aplicația", openWeb: "Deschide aplicația web", soon: "În curând",
      noteStore: "Descarcă aplicația {in}.", noteApple: "Folosești {platform}? Folosește-o în browser până când aplicația ajunge în App Store.", noteWeb: "Deschide-o în browser, fără să instalezi nimic.",
      playLive: "Disponibilă pe Google Play", appStoreLive: "Disponibilă în App Store", webLive: "Deschide aplicația web",
      mismatchTitle: "Alege-ți magazinul",
      mismatchBody: "Folosești {platform}. Pentru cea mai bună experiență, descarcă aplicația {in}.",
      mismatchGo: "Mergi {to}", mismatchStay: "Continuă {to}", close: "Închide",
      in: { play: "din Google Play", appstore: "din App Store" }, to: { play: "la Google Play", appstore: "la App Store" },
    },
    bn: {
      play: ["ডাউনলোড করুন", "শিগগিরই আসছে"], appstore: ["ডাউনলোড করুন", "শিগগিরই আসছে"], web: ["খুলুন", "শিগগিরই আসছে"], browser: "ব্রাউজার",
      getApp: "অ্যাপটি নিন", openWeb: "ওয়েব অ্যাপ খুলুন", soon: "শিগগিরই আসছে",
      noteStore: "{in} অ্যাপটি নিন।", noteApple: "{platform} ব্যবহার করছেন? অ্যাপটি App Store-এ না আসা পর্যন্ত ব্রাউজারে ব্যবহার করুন।", noteWeb: "ব্রাউজারে খুলুন, কিছু ইনস্টল করতে হবে না।",
      playLive: "Google Play-তে পাওয়া যাচ্ছে", appStoreLive: "App Store-এ পাওয়া যাচ্ছে", webLive: "ওয়েব অ্যাপ খুলুন",
      mismatchTitle: "আপনার স্টোর বেছে নিন",
      mismatchBody: "আপনি {platform} ব্যবহার করছেন। সেরা অভিজ্ঞতার জন্য {in} অ্যাপটি নিন।",
      mismatchGo: "{to} যান", mismatchStay: "{to} চালিয়ে যান", close: "বন্ধ করুন",
      in: { play: "Google Play থেকে", appstore: "App Store থেকে" }, to: { play: "Google Play-তে", appstore: "App Store-এ" },
    },
    ms: {
      play: ["Dapatkan di", "Akan datang ke"], appstore: ["Muat turun di", "Akan datang ke"], web: ["Buka dalam", "Akan datang ke"], browser: "Pelayar",
      getApp: "Dapatkan aplikasi", openWeb: "Buka aplikasi web", soon: "Akan datang",
      noteStore: "Dapatkan aplikasi {in}.", noteApple: "Menggunakan {platform}? Gunakannya dalam pelayar anda sehingga aplikasi tiba di App Store.", noteWeb: "Bukanya dalam pelayar anda, tiada apa-apa untuk dipasang.",
      playLive: "Tersedia di Google Play", appStoreLive: "Tersedia di App Store", webLive: "Buka aplikasi web",
      mismatchTitle: "Pilih gedung anda",
      mismatchBody: "Anda menggunakan {platform}. Untuk pengalaman terbaik, dapatkan aplikasi {in}.",
      mismatchGo: "Pergi {to}", mismatchStay: "Teruskan {to}", close: "Tutup",
      in: { play: "daripada Google Play", appstore: "daripada App Store" }, to: { play: "ke Google Play", appstore: "ke App Store" },
    },
    el: {
      play: ["Λήψη από το", "Σύντομα στο"], appstore: ["Λήψη από το", "Σύντομα στο"], web: ["Άνοιγμα στο", "Σύντομα στο"], browser: "Browser",
      getApp: "Λήψη εφαρμογής", openWeb: "Άνοιγμα εφαρμογής web", soon: "Σύντομα",
      noteStore: "Κατέβασε την εφαρμογή {in}.", noteApple: "Έχεις {platform}; Χρησιμοποίησέ την στο πρόγραμμα περιήγησης μέχρι να φτάσει η εφαρμογή στο App Store.", noteWeb: "Άνοιξέ την στο πρόγραμμα περιήγησης, χωρίς εγκατάσταση.",
      playLive: "Διαθέσιμη στο Google Play", appStoreLive: "Διαθέσιμη στο App Store", webLive: "Άνοιγμα εφαρμογής web",
      mismatchTitle: "Διάλεξε το κατάστημά σου",
      mismatchBody: "Χρησιμοποιείς {platform}. Για την καλύτερη εμπειρία, κατέβασε την εφαρμογή {in}.",
      mismatchGo: "Μετάβαση {to}", mismatchStay: "Συνέχεια {to}", close: "Κλείσιμο",
      in: { play: "από το Google Play", appstore: "από το App Store" }, to: { play: "στο Google Play", appstore: "στο App Store" },
    },
    hu: {
      play: ["Töltsd le innen:", "Hamarosan itt:"], appstore: ["Töltsd le innen:", "Hamarosan itt:"], web: ["Nyisd meg itt:", "Hamarosan itt:"], browser: "Böngésző",
      getApp: "Alkalmazás letöltése", openWeb: "Webalkalmazás megnyitása", soon: "Hamarosan",
      noteStore: "Töltsd le az alkalmazást {in}.", noteApple: "Eszközöd: {platform}. Használd a böngészőben, amíg az alkalmazás meg nem érkezik az App Store-ba.", noteWeb: "Nyisd meg a böngésződben, nem kell semmit telepíteni.",
      playLive: "Elérhető a Google Playen", appStoreLive: "Elérhető az App Store-ban", webLive: "Webalkalmazás megnyitása",
      mismatchTitle: "Válassz áruházat",
      mismatchBody: "Eszközöd: {platform}. A legjobb élményért töltsd le az alkalmazást {in}.",
      mismatchGo: "Tovább {to}", mismatchStay: "Mégis {to}", close: "Bezárás",
      in: { play: "a Google Playről", appstore: "az App Store-ból" }, to: { play: "a Google Playre", appstore: "az App Store-ba" },
    },
    fil: {
      play: ["Kunin sa", "Malapit na sa"], appstore: ["I-download sa", "Malapit na sa"], web: ["Buksan sa", "Malapit na sa"], browser: "Browser",
      getApp: "Kunin ang app", openWeb: "Buksan ang web app", soon: "Malapit na",
      noteStore: "Kunin ang app {in}.", noteApple: "Gumagamit ng {platform}? Gamitin muna ito sa browser hanggang dumating ang app sa App Store.", noteWeb: "Buksan ito sa browser, walang kailangang i-install.",
      playLive: "Available sa Google Play", appStoreLive: "Available sa App Store", webLive: "Buksan ang web app",
      mismatchTitle: "Piliin ang store mo",
      mismatchBody: "Gumagamit ka ng {platform}. Para sa pinakamagandang karanasan, kunin ang app {in}.",
      mismatchGo: "Pumunta {to}", mismatchStay: "Magpatuloy {to}", close: "Isara",
      in: { play: "sa Google Play", appstore: "sa App Store" }, to: { play: "sa Google Play", appstore: "sa App Store" },
    },
    ur: {
      play: ["ڈاؤن لوڈ کریں", "جلد دستیاب"], appstore: ["ڈاؤن لوڈ کریں", "جلد دستیاب"], web: ["کھولیں بذریعہ", "جلد دستیاب"], browser: "براؤزر",
      getApp: "ایپ حاصل کریں", openWeb: "ویب ایپ کھولیں", soon: "جلد دستیاب",
      noteStore: "ایپ {in} حاصل کریں۔", noteApple: "{platform} پر ہیں؟ جب تک ایپ App Store پر نہیں آتی، اسے اپنے براؤزر میں استعمال کریں۔", noteWeb: "اسے اپنے براؤزر میں کھولیں، کچھ انسٹال کرنے کی ضرورت نہیں۔",
      playLive: "Google Play پر دستیاب", appStoreLive: "App Store پر دستیاب", webLive: "ویب ایپ کھولیں",
      mismatchTitle: "اپنا اسٹور منتخب کریں",
      mismatchBody: "آپ {platform} پر ہیں۔ بہترین تجربے کے لیے ایپ {in} حاصل کریں۔",
      mismatchGo: "{to} جائیں", mismatchStay: "{to} جاری رکھیں", close: "بند کریں",
      in: { play: "Google Play سے", appstore: "App Store سے" }, to: { play: "Google Play پر", appstore: "App Store پر" },
    },
    hr: {
      play: ["Preuzmi na", "Uskoro na"], appstore: ["Preuzmi na", "Uskoro na"], web: ["Otvori u", "Uskoro u"], browser: "pregledniku",
      getApp: "Preuzmi aplikaciju", openWeb: "Otvori web-aplikaciju", soon: "Uskoro",
      noteStore: "Preuzmi aplikaciju {in}.", noteApple: "Koristiš {platform}? Koristi aplikaciju u pregledniku dok ne stigne u App Store.", noteWeb: "Otvori je u pregledniku, bez instalacije.",
      playLive: "Dostupno u trgovini Google Play", appStoreLive: "Dostupno u trgovini App Store", webLive: "Otvori web-aplikaciju",
      mismatchTitle: "Odaberi trgovinu",
      mismatchBody: "Koristiš {platform}. Za najbolje iskustvo preuzmi aplikaciju {in}.",
      mismatchGo: "Idi {to}", mismatchStay: "Ipak idi {to}", close: "Zatvori",
      in: { play: "iz trgovine Google Play", appstore: "iz trgovine App Store" }, to: { play: "na Google Play", appstore: "u App Store" },
    },
    sr: {
      play: ["Preuzmi na", "Uskoro na"], appstore: ["Preuzmi na", "Uskoro na"], web: ["Otvori u", "Uskoro u"], browser: "pregledaču",
      getApp: "Preuzmi aplikaciju", openWeb: "Otvori veb-aplikaciju", soon: "Uskoro",
      noteStore: "Preuzmi aplikaciju {in}.", noteApple: "Koristiš {platform}? Koristi je u pregledaču dok aplikacija ne stigne u App Store.", noteWeb: "Otvori je u pregledaču, ništa ne moraš da instaliraš.",
      playLive: "Dostupna na Google Play", appStoreLive: "Dostupna na App Store", webLive: "Otvori veb-aplikaciju",
      mismatchTitle: "Izaberi prodavnicu",
      mismatchBody: "Koristiš {platform}. Za najbolje iskustvo preuzmi aplikaciju {in}.",
      mismatchGo: "Idi {to}", mismatchStay: "Ipak idi {to}", close: "Zatvori",
      in: { play: "iz prodavnice Google Play", appstore: "iz prodavnice App Store" }, to: { play: "u prodavnicu Google Play", appstore: "u prodavnicu App Store" },
    },
    sk: {
      play: ["Stiahnuť na", "Čoskoro na"], appstore: ["Stiahnuť v", "Čoskoro v"], web: ["Otvoriť v", "Čoskoro v"], browser: "prehliadači",
      getApp: "Stiahnuť aplikáciu", openWeb: "Otvoriť webovú aplikáciu", soon: "Čoskoro",
      noteStore: "Stiahni si aplikáciu {in}.", noteApple: "Používaš {platform}? Používaj ju v prehliadači, kým aplikácia nebude v App Store.", noteWeb: "Otvor ju v prehliadači, nič nemusíš inštalovať.",
      playLive: "K dispozícii na Google Play", appStoreLive: "K dispozícii v App Store", webLive: "Otvoriť webovú aplikáciu",
      mismatchTitle: "Vyber si obchod",
      mismatchBody: "Používaš {platform}. Najlepšie si aplikáciu stiahni {in}.",
      mismatchGo: "Prejsť {to}", mismatchStay: "Aj tak pokračovať {to}", close: "Zavrieť",
      in: { play: "z Google Play", appstore: "z App Store" }, to: { play: "na Google Play", appstore: "do App Store" },
    },
    nb: {
      play: ["Tilgjengelig på", "Kommer snart på"], appstore: ["Last ned fra", "Kommer snart på"], web: ["Åpne i", "Kommer snart i"], browser: "nettleseren",
      getApp: "Last ned appen", openWeb: "Åpne nettappen", soon: "Kommer snart",
      noteStore: "Last ned appen {in}.", noteApple: "Bruker du {platform}? Bruk den i nettleseren til appen er på App Store.", noteWeb: "Åpne den i nettleseren, ingenting å installere.",
      playLive: "Tilgjengelig på Google Play", appStoreLive: "Tilgjengelig på App Store", webLive: "Åpne nettappen",
      mismatchTitle: "Velg butikk",
      mismatchBody: "Du bruker {platform}. Last ned appen {in} for den beste opplevelsen.",
      mismatchGo: "Gå {to}", mismatchStay: "Fortsett {to}", close: "Lukk",
      in: { play: "fra Google Play", appstore: "fra App Store" }, to: { play: "til Google Play", appstore: "til App Store" },
    },
    fa: {
      play: ["دریافت از", "به‌زودی در"], appstore: ["دانلود از", "به‌زودی در"], web: ["باز کردن در", "به‌زودی در"], browser: "مرورگر",
      getApp: "دریافت برنامه", openWeb: "باز کردن نسخه وب", soon: "به‌زودی",
      noteStore: "برنامه را {in} دریافت کنید.", noteApple: "از {platform} استفاده می‌کنید؟ تا وقتی برنامه به App Store برسد، از آن در مرورگر خود استفاده کنید.", noteWeb: "آن را در مرورگر خود باز کنید، بدون نیاز به نصب.",
      playLive: "در Google Play موجود است", appStoreLive: "در App Store موجود است", webLive: "باز کردن نسخه وب",
      mismatchTitle: "فروشگاه خود را انتخاب کنید",
      mismatchBody: "شما از {platform} استفاده می‌کنید. برای بهترین تجربه، برنامه را {in} دریافت کنید.",
      mismatchGo: "رفتن {to}", mismatchStay: "ادامه و رفتن {to}", close: "بستن",
      in: { play: "از Google Play", appstore: "از App Store" }, to: { play: "به Google Play", appstore: "به App Store" },
    },
    sw: {
      play: ["Ipate kwenye", "Inakuja hivi karibuni kwenye"], appstore: ["Pakua kwenye", "Inakuja hivi karibuni kwenye"], web: ["Fungua kwenye", "Inakuja hivi karibuni kwenye"], browser: "kivinjari chako",
      getApp: "Pata programu", openWeb: "Fungua programu ya wavuti", soon: "Inakuja hivi karibuni",
      noteStore: "Pata programu {in}.", noteApple: "Unatumia {platform}? Itumie kwenye kivinjari chako hadi programu ifike kwenye App Store.", noteWeb: "Ifungue kwenye kivinjari chako, hakuna cha kusakinisha.",
      playLive: "Inapatikana kwenye Google Play", appStoreLive: "Inapatikana kwenye App Store", webLive: "Fungua programu ya wavuti",
      mismatchTitle: "Chagua duka lako",
      mismatchBody: "Unatumia {platform}. Kwa matumizi bora, pata programu {in}.",
      mismatchGo: "Nenda {to}", mismatchStay: "Endelea {to}", close: "Funga",
      in: { play: "kutoka Google Play", appstore: "kutoka App Store" }, to: { play: "kwenye Google Play", appstore: "kwenye App Store" },
    },
    ta: {
      play: ["இப்போதே பெறுங்கள்", "விரைவில் வருகிறது"], appstore: ["பதிவிறக்குங்கள்", "விரைவில் வருகிறது"], web: ["இப்போதே திறங்கள்", "விரைவில் வருகிறது"], browser: "பிரவுசர்",
      getApp: "ஆப்பைப் பெறவும்", openWeb: "வெப் ஆப்பைத் திறக்கவும்", soon: "விரைவில் வருகிறது",
      noteStore: "ஆப்பை {in} பெறுங்கள்.", noteApple: "{platform} பயன்படுத்துகிறீர்களா? App Store-இல் ஆப் வரும் வரை பிரவுசரில் பயன்படுத்துங்கள்.", noteWeb: "எதையும் நிறுவாமல் பிரவுசரில் திறங்கள்.",
      playLive: "Google Play-இல் கிடைக்கிறது", appStoreLive: "App Store-இல் கிடைக்கிறது", webLive: "வெப் ஆப்பைத் திறக்கவும்",
      mismatchTitle: "உங்கள் ஸ்டோரைத் தேர்ந்தெடுங்கள்",
      mismatchBody: "நீங்கள் {platform} பயன்படுத்துகிறீர்கள். சிறந்த அனுபவத்துக்கு, ஆப்பை {in} பெறுங்கள்.",
      mismatchGo: "{to} செல்லவும்", mismatchStay: "இருந்தாலும் {to} செல்லவும்", close: "மூடவும்",
      in: { play: "Google Play-இலிருந்து", appstore: "App Store-இலிருந்து" }, to: { play: "Google Play-க்கு", appstore: "App Store-க்கு" },
    },
    te: {
      play: ["ఇప్పుడే పొందండి", "త్వరలో వస్తోంది"], appstore: ["డౌన్‌లోడ్ చేయండి", "త్వరలో వస్తోంది"], web: ["ఇప్పుడే తెరవండి", "త్వరలో వస్తోంది"], browser: "బ్రౌజర్",
      getApp: "యాప్‌ను పొందండి", openWeb: "వెబ్ యాప్‌ను తెరవండి", soon: "త్వరలో వస్తోంది",
      noteStore: "యాప్‌ను {in} పొందండి.", noteApple: "{platform} వాడుతున్నారా? App Storeలో యాప్ వచ్చే వరకు బ్రౌజర్‌లో వాడండి.", noteWeb: "ఏమీ ఇన్‌స్టాల్ చేయకుండా బ్రౌజర్‌లో తెరవండి.",
      playLive: "Google Playలో అందుబాటులో ఉంది", appStoreLive: "App Storeలో అందుబాటులో ఉంది", webLive: "వెబ్ యాప్‌ను తెరవండి",
      mismatchTitle: "మీ స్టోర్‌ను ఎంచుకోండి",
      mismatchBody: "మీరు {platform} వాడుతున్నారు. ఉత్తమ అనుభవం కోసం, యాప్‌ను {in} పొందండి.",
      mismatchGo: "{to} వెళ్ళండి", mismatchStay: "అయినా {to} వెళ్ళండి", close: "మూసివేయండి",
      in: { play: "Google Play నుండి", appstore: "App Store నుండి" }, to: { play: "Google Playకి", appstore: "App Storeకి" },
    },
    mr: {
      play: ["आत्ताच मिळवा", "लवकरच येत आहे"], appstore: ["डाउनलोड करा", "लवकरच येत आहे"], web: ["आत्ताच उघडा", "लवकरच येत आहे"], browser: "ब्राउझर",
      getApp: "ॲप मिळवा", openWeb: "वेब ॲप उघडा", soon: "लवकरच येत आहे",
      noteStore: "ॲप {in} मिळवा.", noteApple: "तुम्ही {platform} वापरता का? App Store वर ॲप येईपर्यंत ते ब्राउझरमध्ये वापरा.", noteWeb: "काहीही इंस्टॉल न करता ब्राउझरमध्ये उघडा.",
      playLive: "Google Play वर उपलब्ध", appStoreLive: "App Store वर उपलब्ध", webLive: "वेब ॲप उघडा",
      mismatchTitle: "तुमचे स्टोअर निवडा",
      mismatchBody: "तुम्ही {platform} वापरत आहात. सर्वोत्तम अनुभवासाठी, ॲप {in} मिळवा.",
      mismatchGo: "{to} जा", mismatchStay: "तरीही {to} जा", close: "बंद करा",
      in: { play: "Google Play वरून", appstore: "App Store वरून" }, to: { play: "Google Play वर", appstore: "App Store वर" },
    },
    bg: {
      play: ["Изтегли от", "Скоро в"], appstore: ["Изтегли от", "Скоро в"], web: ["Отвори в", "Скоро в"], browser: "браузъра",
      getApp: "Изтегли приложението", openWeb: "Отвори уеб приложението", soon: "Скоро",
      noteStore: "Изтегли приложението {in}.", noteApple: "С {platform} ли си? Ползвай го в браузъра, докато приложението стигне до App Store.", noteWeb: "Отвори го в браузъра, без да инсталираш нищо.",
      playLive: "Налично в Google Play", appStoreLive: "Налично в App Store", webLive: "Отвори уеб приложението",
      mismatchTitle: "Избери своя магазин",
      mismatchBody: "Използваш {platform}. За най-добро изживяване изтегли приложението {in}.",
      mismatchGo: "Отиди {to}", mismatchStay: "Все пак отиди {to}", close: "Затвори",
      in: { play: "от Google Play", appstore: "от App Store" }, to: { play: "в Google Play", appstore: "в App Store" },
    },
    ca: {
      play: ["Disponible a", "Aviat a"], appstore: ["Descarrega-la a l’", "Aviat a l’"], web: ["Obre-la al", "Aviat al"], browser: "navegador",
      getApp: "Descarregar l’app", openWeb: "Obrir l’app web", soon: "Aviat",
      noteStore: "Descarrega l’app {in}.", noteApple: "Tens un {platform}? Fes-la servir al navegador fins que l’app arribi a l’App Store.", noteWeb: "Obre-la al navegador, sense instal·lar res.",
      playLive: "Disponible a Google Play", appStoreLive: "Disponible a l’App Store", webLive: "Obrir l’app web",
      mismatchTitle: "Tria la teva botiga",
      mismatchBody: "Fas servir un {platform}. Per a la millor experiència, descarrega l’app {in}.",
      mismatchGo: "Anar {to}", mismatchStay: "Continuar {to}", close: "Tancar",
      in: { play: "de Google Play", appstore: "de l’App Store" }, to: { play: "a Google Play", appstore: "a l’App Store" },
    },
    da: {
      play: ["Nu på", "Kommer snart på"], appstore: ["Hent i", "Kommer snart i"], web: ["Åbn i", "Kommer snart i"], browser: "browseren",
      getApp: "Hent appen", openWeb: "Åbn webappen", soon: "Kommer snart",
      noteStore: "Hent appen {in}.", noteApple: "Bruger du {platform}? Brug den i browseren, indtil appen kommer i App Store.", noteWeb: "Åbn den i browseren, intet at installere.",
      playLive: "Tilgængelig på Google Play", appStoreLive: "Tilgængelig i App Store", webLive: "Åbn webappen",
      mismatchTitle: "Vælg din butik",
      mismatchBody: "Du bruger {platform}. Hent appen {in} for at få den bedste oplevelse.",
      mismatchGo: "Gå {to}", mismatchStay: "Fortsæt {to}", close: "Luk",
      in: { play: "fra Google Play", appstore: "fra App Store" }, to: { play: "til Google Play", appstore: "til App Store" },
    },
    // Finnish: "Google Play" and "App Store" take no ending; "-kauppa" after them carries the case.
    fi: {
      play: ["Lataa kaupasta", "Tulossa pian kauppaan"], appstore: ["Lataa kaupasta", "Tulossa pian kauppaan"], web: ["Avaa", "Tulossa pian"], browser: "selaimessa",
      getApp: "Hanki sovellus", openWeb: "Avaa verkkosovellus", soon: "Tulossa pian",
      noteStore: "Hanki sovellus {in}.", noteApple: "Käytätkö laitetta {platform}? Käytä sovellusta selaimessa, kunnes se tulee App Store -kauppaan.", noteWeb: "Avaa se selaimessa, mitään ei tarvitse asentaa.",
      playLive: "Saatavilla Google Play -kaupassa", appStoreLive: "Saatavilla App Store -kaupassa", webLive: "Avaa verkkosovellus",
      mismatchTitle: "Valitse kauppasi",
      mismatchBody: "Käytät laitetta {platform}. Saat parhaan kokemuksen, kun hankit sovelluksen {in}.",
      mismatchGo: "Siirry {to}", mismatchStay: "Jatka silti {to}", close: "Sulje",
      in: { play: "Google Play -kaupasta", appstore: "App Store -kaupasta" }, to: { play: "Google Play -kauppaan", appstore: "App Store -kauppaan" },
    },
    // Gujarati: "Google Play" and "App Store" take their postposition written apart (પર, પરથી).
    gu: {
      play: ["હમણાં મેળવો", "જલ્દી આવી રહી છે"], appstore: ["ડાઉનલોડ કરો", "જલ્દી આવી રહી છે"], web: ["હમણાં ખોલો", "જલ્દી આવી રહી છે"], browser: "બ્રાઉઝર",
      getApp: "ઍપ મેળવો", openWeb: "વેબ ઍપ ખોલો", soon: "જલ્દી આવી રહી છે",
      noteStore: "ઍપ {in} મેળવો.", noteApple: "તમે {platform} વાપરો છો? App Store પર ઍપ આવે ત્યાં સુધી તેને બ્રાઉઝરમાં વાપરો.", noteWeb: "કંઈ ઇન્સ્ટૉલ કર્યા વગર બ્રાઉઝરમાં ખોલો.",
      playLive: "Google Play પર ઉપલબ્ધ", appStoreLive: "App Store પર ઉપલબ્ધ", webLive: "વેબ ઍપ ખોલો",
      mismatchTitle: "તમારો સ્ટોર પસંદ કરો",
      mismatchBody: "તમે {platform} વાપરો છો. શ્રેષ્ઠ અનુભવ માટે, ઍપ {in} મેળવો.",
      mismatchGo: "{to} જાઓ", mismatchStay: "તો પણ {to} જાઓ", close: "બંધ કરો",
      in: { play: "Google Play પરથી", appstore: "App Store પરથી" }, to: { play: "Google Play પર", appstore: "App Store પર" },
    },
  });
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
  const platformName = { android: "Android", ios: isIos && (/ipad/i.test(agent) || (!pinned && /macintosh/i.test(agent))) ? "iPad" : "iPhone", mac: "Mac" };

  const REDIRECT_WAIT_MS = 1000;

  // analytics.js, loaded before this script, sends the events.
  const track = (name, params) => window.track?.(name, params);

  function setUp() {
    // The badges: each store linked, standing out or not, or shown as "Coming soon" with no link.
    document.querySelectorAll("[data-stores]").forEach((group) => {
      const origin = group.dataset.stores;
      order.forEach((key) => {
        const badge = group.querySelector(`[data-store="${key}"]`);
        if (!badge) return;
        badge.hidden = !isOffered(key);
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
      group.classList.toggle("is-pair", order.filter(isOffered).length === 2);
    });

    // The line over the hero's badges: what this visitor can do right now.
    document.querySelectorAll("[data-store-note]").forEach((note) => {
      if (!primary) { note.hidden = true; return; }
      const link = note.querySelector("a");
      link.textContent = primary !== "web" ? fill(TEXT.noteStore, { in: TEXT.in[primary] })
        : ownStore === "appstore" ? fill(TEXT.noteApple, { platform: platformName[root.dataset.platform] })
        : TEXT.noteWeb;
      link.href = STORES[primary].url;
      link.addEventListener("click", (e) => onStoreClick(e, primary, "hero_note"));
    });

    // The Platforms section's cards: a store's status, its link only while it offers the app.
    document.querySelectorAll("[data-store-status]").forEach((el) => {
      const key = el.dataset.storeStatus;
      const live = Boolean(STORES[key].url);
      el.classList.toggle("live", live);
      el.classList.toggle("soon", !live);
      (el.querySelector(".status-label") || el).textContent = live ? TEXT[{ play: "playLive", appstore: "appStoreLive", web: "webLive" }[key]] : TEXT.soon;
      if (live) {
        el.setAttribute("href", STORES[key].url);
        el.addEventListener("click", (e) => onStoreClick(e, key, "platforms"));
      } else el.removeAttribute("href");
    });
    document.querySelectorAll("[data-store-link]").forEach((el) => {
      const url = STORES[el.dataset.storeLink].url;
      el.hidden = !url;
      if (url) el.setAttribute("href", url);
    });

    setUpHeader();
  }

  // The header's main button: on a phone, straight to its store; on a computer, the web app, which it can use right
  // there, or a menu when both stores offer the app; with no store for the visitor, the web app; with nothing open yet,
  // no button.
  function setUpHeader() {
    document.querySelectorAll("[data-header-get]").forEach((slot) => {
      const live = ["play", "appstore"].filter((key) => STORES[key].url);
      const web = slot.querySelector("[data-header-web]");
      const button = slot.querySelector("[data-header-store]");
      const menu = slot.querySelector("[data-header-menu]");
      const direct = ownStore && STORES[ownStore].url ? ownStore : null;
      web.textContent = TEXT.openWeb;
      const webUrl = STORES.web.url;
      const trackWeb = () => track("store_click", { store: "web", origin: "header", platform: root.dataset.platform });
      if (webUrl) {
        web.href = webUrl;
        web.addEventListener("click", trackWeb);
      }
      if (direct || (platform === "desktop" && live.length === 1 && !webUrl)) {
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
        button.addEventListener("click", trackWeb);
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

  // Leaves for the store once Analytics has the visit, or after a moment without it (gtag.js may be blocked).
  function leaveFor(url, store) {
    let left = false;
    const leave = () => {
      if (left) return;
      left = true;
      location.replace(url);
    };
    track("store_redirect", { store, path, platform: root.dataset.platform, event_callback: leave, event_timeout: REDIRECT_WAIT_MS });
    // gtag.js otherwise waits for the page to settle (analytics.js), which would come after the redirect.
    window.loadAnalytics?.();
    setTimeout(leave, REDIRECT_WAIT_MS);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setUp);
  else setUp();
  if (redirect) leaveFor(redirect, wanted);
})();
