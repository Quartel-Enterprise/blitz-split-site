// The landing's amounts in the visitor's own currency, written the way their language writes it: the working phone
// (preview.js) and the split card (split-modes.js) read window.money, and the receipt (scan.js) is printed the same
// way by hand. The demo keeps every
// amount in cents; a currency with no cents in use (the won, the yen, the rupiah, the dong, the New Taiwan dollar, the
// taka, the forint, the Pakistani rupee, the Serbian dinar, the Iranian rial) shows
// it scaled to whole units, so a $48.60 ride reads ₩48,600, ¥4,860, Rp486.000, 48.600 ₫, NT$4,860 or ریال 4,860,000 (a
// thousand rials to the cent: at a plausible million rials to the dollar, Persian's trip costs a tenth of the others', so
// its amounts still fit a 320px phone) and every split
// still adds up exactly. A currency worth much less than the dollar but still written with its cents (the krona, the
// koruna, the leu, the ringgit, the Philippine peso, the Norwegian and the Danish krone, the Kenyan shilling) has the demo's own amounts multiplied by a whole number before any split (window.money.cents, which
// preview.js and split-modes.js call on every amount they start from), so a $48.60 ride is 486 kr, 1 117,80 Kč, 243 lei,
// RM194.40, ₱2,430 or Ksh 6,318 (and 486 kr in Norwegian too, the krone being worth about the krona, and 340,20 kr. in Danish)
// and everything after works in that currency's own cents: every split adds up exactly and a typed amount reads as typed.
(function () {
  // [before the number, decimal separator, thousands separator, after the number, units per cent when there are no cents,
  //  digits in each group above the first three: 2 in India, so ₹1,20,000, the currency's cents per cent of the demo's amounts]
  const CURRENCY = window.localized({
    en: ["$", ".", ","], pt: ["R$ ", ",", "."], "pt-PT": ["", ",", "\u00a0", "\u00a0€"], es: ["$", ",", "."],
    fr: ["", ",", "\u202f", "\u00a0€"], de: ["", ",", ".", "\u00a0€"], it: ["", ",", ".", "\u00a0€"],
    pl: ["", ",", "\u00a0", "\u00a0zł"], nl: ["€\u00a0", ",", "."], tr: ["₺", ",", "."], id: ["Rp\u00a0", ",", ".", "", 100],
    ja: ["¥", ".", ",", "", 1], ru: ["", ",", "\u00a0", "\u00a0₽"], uk: ["", ",", "\u00a0", "\u00a0₴"], ko: ["₩", ".", ",", "", 10],
    ar: ["$", ".", ","],
    hi: ["₹", ".", ",", "", 0, 2],
    zh: ["¥", ".", ","],
    he: ["₪", ".", ","],
    th: ["฿", ".", ","],
    vi: ["", ",", ".", "\u00a0₫", 10],
    "zh-Hant": ["NT$", ".", ",", "", 1],
    sv: ["", ",", "\u00a0", "\u00a0kr", 0, 3, 10],
    cs: ["", ",", "\u00a0", "\u00a0Kč", 0, 3, 23],
    ro: ["", ",", ".", "\u00a0lei", 0, 3, 5],
    bn: ["৳", ".", ",", "", 1, 2],
    ms: ["RM", ".", ",", "", 0, 3, 4],
    el: ["", ",", ".", "\u00a0€"],
    hu: ["", ",", "\u00a0", "\u00a0Ft", 1],
    fil: ["₱", ".", ",", "", 0, 3, 50],
    ur: ["Rs\u00a0", ".", ",", "", 1, 2],
    hr: ["", ",", ".", "\u00a0€"],
    sr: ["", ",", ".", "\u00a0RSD", 1],
    sk: ["", ",", "\u00a0", "\u00a0€"],
    nb: ["", ",", "\u00a0", "\u00a0kr", 0, 3, 10],
    fa: ["ریال\u00a0", ".", ",", "", 1000],
    sw: ["Ksh\u00a0", ".", ",", "", 0, 3, 130],
    ta: ["₹", ".", ",", "", 0, 2],
    te: ["₹", ".", ",", "", 0, 2],
    mr: ["₹", ".", ",", "", 0, 2],
    bg: ["", ",", "\u00a0", "\u00a0€"],
    ca: ["", ",", ".", "\u00a0€"],
    da: ["", ",", ".", "\u00a0kr.", 0, 3, 7],
    fi: ["", ",", "\u00a0", "\u00a0€"],
    lv: ["", ",", "\u00a0", "\u00a0€"],
    et: ["", ",", "\u00a0", "\u00a0€"],
    lt: ["", ",", "\u00a0", "\u00a0€"],
    sl: ["", ",", ".", "\u00a0€"],
  });
  const [before, decimal, thousands, after = "", scale = 0, upper = 3, factor = 1] = CURRENCY;
  const upperGroups = new RegExp(`\\B(?=(\\d{${upper}})+$)`, "g");
  function group(n) {
    const digits = String(n);
    const head = digits.slice(0, -3);
    return head ? head.replace(upperGroups, thousands) + thousands + digits.slice(-3) : digits;
  }

  // The number alone, as a field holds it: no decimals when they are zero.
  function plain(cents) {
    const abs = Math.abs(cents);
    if (scale) return group(abs * scale);
    const frac = abs % 100;
    return group(Math.floor(abs / 100)) + (frac ? decimal + String(frac).padStart(2, "0") : "");
  }
  // Why: in a right-to-left page a sign and a symbol around Latin digits would come apart ("$12.15−"), so the amount
  // reads as one left-to-right isolate there, as the app writes it.
  const isolate = document.documentElement.dir === "rtl" ? (text) => `\u2066${text}\u2069` : (text) => text;
  // With its symbol, and "+" or "−" when signed.
  function format(cents, signed) {
    const text = before + plain(cents) + after;
    if (!signed || cents === 0) return isolate(text);
    return isolate((cents > 0 ? "+" : "−") + text);
  }
  // Why: a Persian, Arabic or Urdu keyboard types its own digits (۴۸, ٤٨) and separators (٫ ٬), and a Marathi or Hindi
  // one may type Devanagari's (४८), which \d doesn't match, so they are read as the Latin ones before anything else.
  const latinDigits = (text) => text
    .replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf))
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x966))
    .replace(/٫/g, ".").replace(/٬/g, ",");
  // What someone types, in cents. The last "," or "." followed by one or two digits is the decimal point, whatever the
  // language, so "33,5", "33.50" and "6.000" all read as meant; a currency with no cents in use drops those decimals
  // ("Rp50.000,00" is Rp50.000) and reads the rest in whole units.
  function parse(text) {
    const t = latinDigits(text).replace(/[^\d.,]/g, "");
    const sep = Math.max(t.lastIndexOf(","), t.lastIndexOf("."));
    const decimals = sep >= 0 && t.length - sep - 1 <= 2;
    const whole = Number((decimals ? t.slice(0, sep) : t).replace(/[.,]/g, "") || 0);
    const frac = decimals ? Number(t.slice(sep + 1).padEnd(2, "0")) : 0;
    return scale ? Math.round((whole + frac / 100) / scale) : whole * 100 + frac;
  }

  // A demo amount, written in the dollar's cents, in this currency's own cents: the same but where the currency is worth
  // much less and keeps its cents. Why not in format: the splits then work in the currency's own cents, so a typed
  // amount is never rounded to a multiple of the factor.
  const cents = (amount) => amount * factor;

  // A percentage, as the language writes it: Turkish puts the sign first (%10); French, German, Russian, Swedish, Czech,
  // Croatian, Serbian, Slovak, Norwegian, Catalan, Danish, Finnish, Lithuanian and Slovenian put a space before it (10 %). The phone (preview.js) and the split card (split-modes.js) share it.
  const lang = document.documentElement.dataset.lang;
  const percent = (n) => (["fr", "de", "ru", "sv", "cs", "hr", "sr", "sk", "nb", "ca", "da", "fi", "lt", "sl"].includes(lang) ? `${n} %` : lang === "tr" ? `%${n}` : `${n}%`);

  window.money = { format, plain, parse, latinDigits, cents, percent, symbolBefore: before.trim(), symbolAfter: after.trim(), wholeUnits: Boolean(scale) };
})();
