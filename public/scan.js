// The landing's "Scan the receipt" card: a receipt's photo being read. A line sweeps down the paper; as it passes each
// printed line, that line lights up and its item comes into the list below, then the faces of who had it, then
// "Split these items", which takes the receipt to the "Split it the way it really was" card (split-modes.js listens
// for split:receipt). It plays once the card is in view, and again on "Scan again"; with reduced motion (no .motion
// on <html>) everything just shows. The bar on the paper is made up.
(function () {
  const demo = document.querySelector("[data-scan]");
  if (!demo) return;
  const root = document.documentElement;
  // One of the site's languages: boot.js, in <head>, picked it.
  const lang = root.dataset.lang;
  // analytics.js, in <head>, sends the events; docs/analytics.md lists them.
  const track = (name, params) => window.track?.(name, params);

  // The printed receipt, as a bar of each language's country would print it.
  const PAPER = window.localized({
    en: {
      store: "HARBOR BAR", address: "120 Gull Street", date: "11/08/2026  9:47 PM",
      lines: [["2 DRAFT BEER", "28.00", 1], ["1 SHRIMP PLATTER", "96.00", 2]],
      subtotal: ["SUBTOTAL", "124.00"], service: ["SERVICE 10%", "12.40", 3], total: ["TOTAL", "136.40"],
    },
    pt: {
      store: "BAR DO PORTO", address: "Rua das Gaivotas, 120", date: "08/11/2026  21:47",
      lines: [["2 CHOPE 500ML", "28,00", 1], ["1 PORÇÃO CAMARÃO", "96,00", 2]],
      subtotal: ["SUBTOTAL", "124,00"], service: ["SERVIÇO 10%", "12,40", 3], total: ["TOTAL", "136,40"],
    },
    // Portugal's Portuguese: only what Portugal says differently, the rest is pt's.
    "pt-PT": {
      lines: [["2 IMPERIAL", "28,00", 1], ["1 PETISCO CAMARÃO", "96,00", 2]],
    },
    es: {
      store: "BAR DEL PUERTO", address: "Calle Gaviotas 120", date: "08/11/2026  21:47",
      lines: [["2 CERVEZA", "28,00", 1], ["1 PORC. CAMARONES", "96,00", 2]],
      subtotal: ["SUBTOTAL", "124,00"], service: ["SERVICIO 10%", "12,40", 3], total: ["TOTAL", "136,40"],
    },
    fr: {
      store: "BAR DU PORT", address: "120 rue des Mouettes", date: "08/11/2026  21:47",
      lines: [["2 BIÈRE PRESSION", "28,00", 1], ["1 PLAT. CREVETTES", "96,00", 2]],
      subtotal: ["SOUS-TOTAL", "124,00"], service: ["SERVICE 10 %", "12,40", 3], total: ["TOTAL", "136,40"],
    },
    de: {
      store: "HAFENBAR", address: "Möwenstraße 120", date: "08.11.2026  21:47",
      lines: [["2 BIER VOM FASS", "28,00", 1], ["1 GARNELENPLATTE", "96,00", 2]],
      subtotal: ["ZWISCHENSUMME", "124,00"], service: ["SERVICE 10 %", "12,40", 3], total: ["SUMME", "136,40"],
    },
    it: {
      store: "BAR DEL PORTO", address: "Via dei Gabbiani 120", date: "08/11/2026  21:47",
      lines: [["2 BIRRA SPINA", "28,00", 1], ["1 PIATTO GAMBERI", "96,00", 2]],
      subtotal: ["SUBTOTALE", "124,00"], service: ["SERVIZIO 10%", "12,40", 3], total: ["TOTALE", "136,40"],
    },
    pl: {
      store: "BAR PORTOWY", address: "ul. Mewia 120", date: "08.11.2026  21:47",
      lines: [["2 PIWO Z BECZKI", "28,00", 1], ["1 PÓŁM. KREWETEK", "96,00", 2]],
      subtotal: ["SUMA CZĘŚCIOWA", "124,00"], service: ["SERWIS 10%", "12,40", 3], total: ["SUMA", "136,40"],
    },
    nl: {
      store: "HAVENBAR", address: "Meeuwenstraat 120", date: "08-11-2026  21:47",
      lines: [["2 TAPBIER", "28,00", 1], ["1 GARNALENSCHOTEL", "96,00", 2]],
      subtotal: ["SUBTOTAAL", "124,00"], service: ["SERVICE 10%", "12,40", 3], total: ["TOTAAL", "136,40"],
    },
    tr: {
      store: "LİMAN BAR", address: "Martı Sokak No: 120", date: "08.11.2026  21:47",
      lines: [["2 FIÇI BİRA", "28,00", 1], ["1 KARİDES TABAĞI", "96,00", 2]],
      subtotal: ["ARA TOPLAM", "124,00"], service: ["SERVİS %10", "12,40", 3], total: ["TOPLAM", "136,40"],
    },
    id: {
      store: "BAR PELABUHAN", address: "Jl. Camar No. 120", date: "08/11/2026  21:47",
      lines: [["2 BIR DRAFT", "280.000", 1], ["1 PLATTER UDANG", "960.000", 2]],
      subtotal: ["SUBTOTAL", "1.240.000"], service: ["LAYANAN 10%", "124.000", 3], total: ["TOTAL", "1.364.000"],
    },
    ja: {
      store: "ハーバーバー", address: "かもめ通り120", date: "2026/11/08  21:47",
      lines: [["2 生ビール", "2,800", 1], ["1 エビ盛り合わせ", "9,600", 2]],
      subtotal: ["小計", "12,400"], service: ["サービス料 10%", "1,240", 3], total: ["合計", "13,640"],
    },
    ru: {
      store: "ПОРТОВЫЙ БАР", address: "ул. Чаечная, 120", date: "08.11.2026  21:47",
      lines: [["2 ПИВО РАЗЛИВНОЕ", "28,00", 1], ["1 ТАРЕЛКА КРЕВЕТОК", "96,00", 2]],
      subtotal: ["ПОДЫТОГ", "124,00"], service: ["ОБСЛУЖИВАНИЕ 10%", "12,40", 3], total: ["ИТОГО", "136,40"],
    },
    uk: {
      store: "ПОРТОВИЙ БАР", address: "вул. Чайкова, 120", date: "08.11.2026  21:47",
      lines: [["2 ПИВО РОЗЛИВНЕ", "28,00", 1], ["1 ТАРІЛКА КРЕВЕТОК", "96,00", 2]],
      subtotal: ["ПРОМІЖНИЙ ПІДСУМОК", "124,00"], service: ["ОБСЛУГОВУВАННЯ 10%", "12,40", 3], total: ["РАЗОМ", "136,40"],
    },
    ko: {
      store: "항구 바", address: "갈매기로 120", date: "2026.11.08  21:47",
      lines: [["2 생맥주", "28,000", 1], ["1 새우 플래터", "96,000", 2]],
      subtotal: ["소계", "124,000"], service: ["봉사료 10%", "12,400", 3], total: ["합계", "136,400"],
    },
    // Arabic: a café's receipt, in dollars as money.js counts Arabic, with fresh juice for the draft beer.
    ar: {
      store: "مقهى الميناء", address: "120 شارع النوارس", date: "08/11/2026  21:47",
      lines: [["2 عصير طازج", "28.00", 1], ["1 طبق روبيان", "96.00", 2]],
      subtotal: ["المجموع الفرعي", "124.00"], service: ["خدمة 10%", "12.40", 3], total: ["الإجمالي", "136.40"],
    },
    hi: {
      store: "हार्बर बार", address: "120, गल स्ट्रीट", date: "08/11/2026  9:47 PM",
      lines: [["2 ड्राफ़्ट बियर", "28.00", 1], ["1 झींगा प्लैटर", "96.00", 2]],
      subtotal: ["सबटोटल", "124.00"], service: ["सर्विस 10%", "12.40", 3], total: ["कुल", "136.40"],
    },
    zh: {
      store: "港湾酒吧", address: "海鸥路120号", date: "2026-11-08  21:47",
      lines: [["2 扎啤", "28.00", 1], ["1 大虾拼盘", "96.00", 2]],
      subtotal: ["小计", "124.00"], service: ["服务费10%", "12.40", 3], total: ["合计", "136.40"],
    },
    // Hebrew: an Israeli bar's receipt, in shekels as money.js counts Hebrew.
    he: {
      store: "בר הנמל", address: "רחוב השחפים 120", date: "08/11/2026  21:47",
      lines: [["2 בירה מהחבית", "28.00", 1], ["1 מגש שרימפס", "96.00", 2]],
      subtotal: ["סכום ביניים", "124.00"], service: ["שירות 10%", "12.40", 3], total: ["סה״כ", "136.40"],
    },
    // Thai: a harbor bar's receipt, in baht as money.js counts Thai, dated in the Buddhist era (2569) as docs/design.md says.
    th: {
      store: "บาร์ริมท่า", address: "120 ถนนนกนางนวล", date: "08/11/2569  21:47",
      lines: [["2 เบียร์สด", "28.00", 1], ["1 ชุดกุ้งรวม", "96.00", 2]],
      subtotal: ["ยอดรวมย่อย", "124.00"], service: ["ค่าบริการ 10%", "12.40", 3], total: ["ยอดรวม", "136.40"],
    },
    // Vietnamese: a harbor bar's receipt, in dong as money.js counts Vietnamese (no cents in use, so the amounts scaled).
    vi: {
      store: "QUÁN BAR BẾN CẢNG", address: "120 Đường Hải Âu", date: "08/11/2026  21:47",
      lines: [["2 BIA TƯƠI", "28.000", 1], ["1 ĐĨA TÔM", "96.000", 2]],
      subtotal: ["TẠM TÍNH", "124.000"], service: ["PHÍ DỊCH VỤ 10%", "12.400", 3], total: ["TỔNG CỘNG", "136.400"],
    },
    // Traditional Chinese: a harbor bar's receipt, in New Taiwan dollars as money.js counts Traditional Chinese (no cents
    // in use, so the amounts scaled), dated as Taiwan writes it.
    "zh-Hant": {
      store: "港灣酒吧", address: "海鷗路120號", date: "2026/11/08  21:47",
      lines: [["2 生啤酒", "2,800", 1], ["1 大蝦拼盤", "9,600", 2]],
      subtotal: ["小計", "12,400"], service: ["服務費10%", "1,240", 3], total: ["合計", "13,640"],
    },
    // Swedish: a harbor bar's receipt, in kronor as money.js counts Swedish (ten to the dollar).
    sv: {
      store: "HAMNBAREN", address: "Måsgatan 120", date: "2026-11-08  21:47",
      lines: [["2 FATÖL", "280,00", 1], ["1 RÄKFAT", "960,00", 2]],
      subtotal: ["DELSUMMA", "1 240,00"], service: ["SERVICE 10 %", "124,00", 3], total: ["TOTALT", "1 364,00"],
    },
    // Czech: a harbor bar's receipt, in koruny as money.js counts Czech (23 to the dollar).
    cs: {
      store: "PŘÍSTAVNÍ BAR", address: "Racková 120", date: "08.11.2026  21:47",
      lines: [["2 TOČENÉ PIVO", "644,00", 1], ["1 TALÍŘ KREVET", "2 208,00", 2]],
      subtotal: ["MEZISOUČET", "2 852,00"], service: ["OBSLUHA 10 %", "285,20", 3], total: ["CELKEM", "3 137,20"],
    },
    // Romanian: a harbor bar's receipt, in lei as money.js counts Romanian (five to the dollar).
    ro: {
      store: "BARUL DIN PORT", address: "Str. Pescărușilor 120", date: "08.11.2026  21:47",
      lines: [["2 BERE LA HALBĂ", "140,00", 1], ["1 PLATOU CREVEȚI", "480,00", 2]],
      subtotal: ["SUBTOTAL", "620,00"], service: ["SERVICIU 10%", "62,00", 3], total: ["TOTAL", "682,00"],
    },
    bn: {
      store: "বন্দর ক্যাফে", address: "120, গাংচিল সড়ক", date: "08/11/2026  রাত 9:47",
      lines: [["2 তাজা জুস", "2,800", 1], ["1 চিংড়ি প্ল্যাটার", "9,600", 2]],
      subtotal: ["সাবটোটাল", "12,400"], service: ["সার্ভিস চার্জ 10%", "1,240", 3], total: ["মোট", "13,640"],
    },
    ms: {
      store: "KAFE PELABUHAN", address: "120, Jalan Camar", date: "08/11/2026  21:47",
      lines: [["2 JUS SEGAR", "112.00", 1], ["1 PLATTER UDANG", "384.00", 2]],
      subtotal: ["SUBJUMLAH", "496.00"], service: ["CAJ SERVIS 10%", "49.60", 3], total: ["JUMLAH", "545.60"],
    },
    el: {
      store: "ΜΠΑΡ ΤΟΥ ΛΙΜΑΝΙΟΥ", address: "Οδός Γλάρων 120", date: "08/11/2026  21:47",
      lines: [["2 ΜΠΙΡΕΣ ΒΑΡΕΛΙ", "28,00", 1], ["1 ΠΙΑΤΕΛΑ ΓΑΡΙΔΕΣ", "96,00", 2]],
      subtotal: ["ΜΕΡΙΚΟ ΣΥΝΟΛΟ", "124,00"], service: ["ΣΕΡΒΙΣ 10%", "12,40", 3], total: ["ΣΥΝΟΛΟ", "136,40"],
    },
    hu: {
      store: "KIKÖTŐ BÁR", address: "Sirály u. 120.", date: "2026.11.08.  21:47",
      lines: [["2 CSAPOLT SÖR", "2\u00a0800", 1], ["1 GARNÉLATÁL", "9\u00a0600", 2]],
      subtotal: ["RÉSZÖSSZEG", "12\u00a0400"], service: ["SZERVIZDÍJ 10%", "1\u00a0240", 3], total: ["ÖSSZESEN", "13\u00a0640"],
    },
    fil: {
      store: "BAR SA DAUNGAN", address: "120 Daungan St., Batangas City", date: "11/08/2026  9:47 PM",
      lines: [["2 DRAFT BEER", "1,400.00", 1], ["1 PLATTER NG HIPON", "4,800.00", 2]],
      subtotal: ["SUBTOTAL", "6,200.00"], service: ["SERVICE CHARGE 10%", "620.00", 3], total: ["KABUUAN", "6,820.00"],
    },
    ur: {
      store: "بندرگاہ کیفے", address: "120 بوٹ بیسن، کراچی", date: "08/11/2026  21:47",
      lines: [["2 تازہ جوس", "2,800", 1], ["1 جھینگوں کی پلیٹ", "9,600", 2]],
      subtotal: ["ذیلی میزان", "12,400"], service: ["سروس چارج 10%", "1,240", 3], total: ["کل", "13,640"],
    },
    hr: {
      store: "LUČKI BAR", address: "Galebova 120", date: "08.11.2026.  21:47",
      lines: [["2 TOČENO PIVO", "28,00", 1], ["1 PLATA ŠKAMPA", "96,00", 2]],
      subtotal: ["MEĐUZBROJ", "124,00"], service: ["USLUGA 10\u00a0%", "12,40", 3], total: ["UKUPNO", "136,40"],
    },
    sr: {
      store: "BAR LUKA", address: "Galebova 120", date: "08.11.2026.  21:47",
      lines: [["2 TOČENO PIVO", "2.800", 1], ["1 PLATA ŠKAMPA", "9.600", 2]],
      subtotal: ["MEĐUZBIR", "12.400"], service: ["USLUGA 10 %", "1.240", 3], total: ["UKUPNO", "13.640"],
    },
    sk: {
      store: "PRÍSTAVNÝ BAR", address: "Čajková 120", date: "08.11.2026  21:47",
      lines: [["2 ČAPOVANÉ PIVO", "28,00", 1], ["1 TANIER KREVIET", "96,00", 2]],
      subtotal: ["MEDZISÚČET", "124,00"], service: ["OBSLUHA 10 %", "12,40", 3], total: ["SPOLU", "136,40"],
    },
    // Norwegian (Bokmål): a harbor bar's receipt, in kroner as money.js counts Norwegian (ten to the dollar, as Swedish).
    nb: {
      store: "HAVNEBAREN", address: "Måkeveien 120", date: "08.11.2026  21:47",
      lines: [["2 FATØL", "280,00", 1], ["1 REKEFAT", "960,00", 2]],
      subtotal: ["SUBTOTAL", "1 240,00"], service: ["SERVICE 10 %", "124,00", 3], total: ["TOTALT", "1 364,00"],
    },
    // Persian: a café's receipt in Bandar Abbas, in rials as money.js counts Persian (no cents in use, a
    // thousand to the cent), dated in the Gregorian calendar as Iran writes a date, year first, with fresh juice for the draft beer.
    fa: {
      store: "کافه بندر", address: "بندرعباس، خیابان ساحلی، پلاک 120", date: "2026/11/08  21:47",
      lines: [["2 آب‌میوه تازه", "2,800,000", 1], ["1 دیس میگو", "9,600,000", 2]],
      subtotal: ["جمع جزء", "12,400,000"], service: ["سرویس 10%", "1,240,000", 3], total: ["جمع کل", "13,640,000"],
    },
    sw: {
      store: "MGAHAWA WA BANDARINI", address: "Barabara ya Shakwe 120", date: "08/11/2026  21:47",
      lines: [["2 JUISI YA MATUNDA", "3,640.00", 1], ["1 SAHANI YA KAMBA", "12,480.00", 2]],
      subtotal: ["JUMLA NDOGO", "16,120.00"], service: ["HUDUMA 10%", "1,612.00", 3], total: ["JUMLA", "17,732.00"],
    },
    ta: {
      store: "ஹார்பர் பார்", address: "120, கடற்கரைச் சாலை", date: "08/11/2026  9:47 PM",
      lines: [["2 டிராஃப்ட் பீர்", "28.00", 1], ["1 இறால் தட்டு", "96.00", 2]],
      subtotal: ["துணைத் தொகை", "124.00"], service: ["சேவைக் கட்டணம் 10%", "12.40", 3], total: ["மொத்தம்", "136.40"],
    },
    te: {
      store: "హార్బర్ బార్", address: "120, బీచ్ రోడ్", date: "08/11/2026  9:47 PM",
      lines: [["2 డ్రాఫ్ట్ బీర్", "28.00", 1], ["1 రొయ్యల ప్లేటర్", "96.00", 2]],
      subtotal: ["సబ్‌టోటల్", "124.00"], service: ["సర్వీస్ ఛార్జ్ 10%", "12.40", 3], total: ["మొత్తం", "136.40"],
    },
    mr: {
      store: "हार्बर बार", address: "120, बीच रोड", date: "08/11/2026  9:47 PM",
      lines: [["2 ड्राफ्ट बिअर", "28.00", 1], ["1 कोळंबी प्लॅटर", "96.00", 2]],
      subtotal: ["सबटोटल", "124.00"], service: ["सर्व्हिस चार्ज 10%", "12.40", 3], total: ["एकूण", "136.40"],
    },
    bg: {
      store: "ПРИСТАНИЩЕН БАР", address: "ул. „Чайка“ 120", date: "08.11.2026  21:47",
      lines: [["2 НАЛИВНА БИРА", "28,00", 1], ["1 ПЛАТО СКАРИДИ", "96,00", 2]],
      subtotal: ["МЕЖДИННА СУМА", "124,00"], service: ["ОБСЛУЖВАНЕ 10%", "12,40", 3], total: ["ОБЩО", "136,40"],
    },
    ca: {
      store: "BAR DEL PORT", address: "C. de les Gavines, 120", date: "08/11/2026  21:47",
      lines: [["2 CANYA", "28,00", 1], ["1 RACIÓ GAMBES", "96,00", 2]],
      subtotal: ["SUBTOTAL", "124,00"], service: ["SERVEI 10 %", "12,40", 3], total: ["TOTAL", "136,40"],
    },
    // Danish: a harbor bar's receipt, in kroner as money.js counts Danish (seven to the dollar).
    da: {
      store: "HAVNEBAREN", address: "Mågevej 120", date: "08.11.2026  21:47",
      lines: [["2 FADØL", "196,00", 1], ["1 REJEPLATTE", "672,00", 2]],
      subtotal: ["SUBTOTAL", "868,00"], service: ["SERVICE 10 %", "86,80", 3], total: ["I ALT", "954,80"],
    },
    // Finnish: a harbor bar's receipt, in euros, with Finland's dotted time.
    fi: {
      store: "SATAMABAARI", address: "Lokkikatu 120", date: "8.11.2026  21.47",
      lines: [["2 HANAOLUT", "28,00", 1], ["1 KATKARAPUVATI", "96,00", 2]],
      subtotal: ["VÄLISUMMA", "124,00"], service: ["PALVELU 10\u00a0%", "12,40", 3], total: ["YHTEENSÄ", "136,40"],
    },
    // Latvian: a harbor bar's receipt, in euros, with Latvia's dotted date.
    lv: {
      store: "OSTAS BĀRS", address: "Kaiju iela 120", date: "08.11.2026  21:47",
      lines: [["2 LĒJAMAIS ALUS", "28,00", 1], ["1 GARNEĻU PLATE", "96,00", 2]],
      subtotal: ["STARPSUMMA", "124,00"], service: ["APKALPOŠANA 10%", "12,40", 3], total: ["KOPĀ", "136,40"],
    },
    // Estonian: a harbor bar's receipt, in euros, with Estonia's dotted date.
    et: {
      store: "SADAMABAAR", address: "Kajaka 120", date: "8.11.2026  21:47",
      lines: [["2 VAADIÕLU", "28,00", 1], ["1 KREVETIVAAGEN", "96,00", 2]],
      subtotal: ["VAHESUMMA", "124,00"], service: ["TEENUSTASU 10%", "12,40", 3], total: ["KOKKU", "136,40"],
    },
    // Lithuanian: a harbor bar's receipt, in euros, with Lithuania's ISO date.
    lt: {
      store: "UOSTO BARAS", address: "Žuvėdrų g. 120", date: "2026-11-08  21:47",
      lines: [["2 PILSTOMAS ALUS", "28,00", 1], ["1 KREVEČIŲ LĖKŠTĖ", "96,00", 2]],
      subtotal: ["TARPINĖ SUMA", "124,00"], service: ["APTARNAVIMAS 10\u00a0%", "12,40", 3], total: ["IŠ VISO", "136,40"],
    },
    // Slovenian: a harbor bar's receipt, in euros, with Slovenia's dotted date.
    sl: {
      store: "PRISTANIŠKI BAR", address: "Galebova ulica 120", date: "8. 11. 2026  21:47",
      lines: [["2 TOČENO PIVO", "28,00", 1], ["1 KROŽNIK KOZIC", "96,00", 2]],
      subtotal: ["VMESNI SEŠTEVEK", "124,00"], service: ["POSTREŽBA 10\u00a0%", "12,40", 3], total: ["SKUPAJ", "136,40"],
    },
    // Gujarati: a harbor bar's receipt, in rupees, as India prints it.
    gu: {
      store: "હાર્બર બાર", address: "120, બીચ રોડ", date: "08/11/2026  9:47 PM",
      lines: [["2 ડ્રાફ્ટ બિયર", "28.00", 1], ["1 ઝીંગા પ્લેટર", "96.00", 2]],
      subtotal: ["સબટોટલ", "124.00"], service: ["સર્વિસ ચાર્જ 10%", "12.40", 3], total: ["કુલ", "136.40"],
    },
    // Malayalam: a harbor bar's receipt, in rupees, as India prints it.
    ml: {
      store: "ഹാർബർ ബാർ", address: "120, ബീച്ച് റോഡ്", date: "08/11/2026  9:47 PM",
      lines: [["2 ഡ്രാഫ്റ്റ് ബിയർ", "28.00", 1], ["1 ചെമ്മീൻ പ്ലാറ്റർ", "96.00", 2]],
      subtotal: ["സബ്ടോട്ടൽ", "124.00"], service: ["സർവീസ് ചാർജ് 10%", "12.40", 3], total: ["ആകെ", "136.40"],
    },
    // Punjabi: a harbor bar's receipt, in rupees, as India prints it.
    pa: {
      store: "ਹਾਰਬਰ ਬਾਰ", address: "120, ਬੀਚ ਰੋਡ", date: "08/11/2026  9:47 PM",
      lines: [["2 ਡ੍ਰਾਫ਼ਟ ਬੀਅਰ", "28.00", 1], ["1 ਝੀਂਗਾ ਪਲੇਟਰ", "96.00", 2]],
      subtotal: ["ਸਬਟੋਟਲ", "124.00"], service: ["ਸਰਵਿਸ ਚਾਰਜ 10%", "12.40", 3], total: ["ਕੁੱਲ", "136.40"],
    },
    // Kannada: a harbor bar's receipt, in rupees, as India prints it.
    kn: {
      store: "ಹಾರ್ಬರ್ ಬಾರ್", address: "120, ಬೀಚ್ ರೋಡ್", date: "08/11/2026  9:47 PM",
      lines: [["2 ಡ್ರಾಫ್ಟ್ ಬಿಯರ್", "28.00", 1], ["1 ಸೀಗಡಿ ಪ್ಲ್ಯಾಟರ್", "96.00", 2]],
      subtotal: ["ಉಪಮೊತ್ತ", "124.00"], service: ["ಸೇವಾ ಶುಲ್ಕ 10%", "12.40", 3], total: ["ಒಟ್ಟು", "136.40"],
    },
    // Burmese: a harbor bar's receipt, in kyat as money.js counts Burmese (no decimals in use, so the amounts scaled).
    my: {
      store: "ဆိပ်ကမ်းဘား", address: "အမှတ် 120၊ ဇင်ယော်လမ်း", date: "08/11/2026  21:47",
      lines: [["2 စည်ဘီယာ", "58,800", 1], ["1 ပုစွန်ပွဲ", "201,600", 2]],
      subtotal: ["ကြားစုစုပေါင်း", "260,400"], service: ["ဝန်ဆောင်ခ 10%", "26,040", 3], total: ["စုစုပေါင်း", "286,440"],
    },
    // Khmer: a harbor bar's receipt, in riel as money.js counts Khmer (no decimals in use, so the amounts scaled).
    km: {
      store: "បារកំពង់ផែ", address: "ផ្លូវក្អែកសមុទ្រ លេខ 120", date: "08/11/2026  21:47",
      lines: [["2 ស្រាបៀរស្រស់", "112,000", 1], ["1 ចានបង្គា", "384,000", 2]],
      subtotal: ["សរុបរង", "496,000"], service: ["សេវា 10%", "49,600", 3], total: ["សរុប", "545,600"],
    },
  });
  const line = ([label, value, row], extra = "") => `<div class="paper-line${extra}"${row ? ` data-scan-line="${row}"` : ""}><span>${label}</span><span>${value}</span></div>`;

  const stage = demo.querySelector("[data-scan-stage]");
  stage.innerHTML = `
    <div class="scan-frame" aria-hidden="true">
      <div class="paper-wrap">
        <div class="paper">
          <b class="paper-store">${PAPER.store}</b>
          <span class="paper-center">${PAPER.address}</span>
          <hr>
          ${PAPER.lines.map((l) => line(l)).join("")}
          <hr>
          ${line(PAPER.subtotal)}
          ${line(PAPER.service)}
          ${line(PAPER.total, " paper-total")}
          <hr>
          <span class="paper-center">${PAPER.date}</span>
        </div>
        <i class="scan-line"></i>
      </div>
    </div>`;
  stage.hidden = false;
  demo.querySelector("[data-scan-actions]").hidden = false;

  // Each line is read when the sweep reaches it; its item comes in a moment after, and the rest once the sweep is done.
  const START = 300;
  const SWEEP = 2200;
  function time() {
    const paper = stage.querySelector(".paper");
    const height = paper.offsetHeight || 1;
    paper.querySelectorAll("[data-scan-line]").forEach((printed) => {
      const at = START + (SWEEP * (printed.offsetTop + printed.offsetHeight / 2)) / height;
      printed.style.setProperty("--at", `${Math.round(at)}ms`);
      demo.querySelector(`[data-scan-row="${printed.dataset.scanLine}"]`)?.style.setProperty("--at", `${Math.round(at + 150)}ms`);
    });
    demo.style.setProperty("--sweep", `${SWEEP}ms`);
    demo.style.setProperty("--done", `${START + SWEEP + 150}ms`);
  }
  function run() {
    time();
    demo.classList.remove("run");
    void demo.offsetWidth;
    demo.classList.add("run");
  }
  if (root.classList.contains("motion")) {
    const watch = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      watch.disconnect();
      run();
    }, { threshold: 0.45 });
    watch.observe(demo);
  }
  demo.querySelector("[data-scan-again]").addEventListener("click", run);
  demo.querySelector("[data-scan-split]").addEventListener("click", () => {
    track("receipt_split");
    document.dispatchEvent(new CustomEvent("split:receipt"));
  });
})();
