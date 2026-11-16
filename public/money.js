// The landing's amounts in the visitor's own currency, written the way their language writes it: the working phone
// (preview.js), the split card (split-modes.js) and the receipt (scan.js) read window.money. The demo keeps every
// amount in cents; a currency with no cents in use (the won, the yen, the rupiah) shows it scaled to whole units, so
// a $48.60 ride reads ₩48,600, ¥4,860 or Rp486.000 and every split still adds up exactly.
(function () {
  // [before the number, decimal separator, thousands separator, after the number, units per cent when there are no cents]
  const CURRENCY = window.localized({
    en: ["$", ".", ","], pt: ["R$ ", ",", "."], "pt-PT": ["", ",", "\u00a0", "\u00a0€"], es: ["$", ",", "."],
    fr: ["", ",", "\u202f", "\u00a0€"], de: ["", ",", ".", "\u00a0€"], it: ["", ",", ".", "\u00a0€"],
    pl: ["", ",", "\u00a0", "\u00a0zł"], nl: ["€\u00a0", ",", "."], tr: ["₺", ",", "."], id: ["Rp\u00a0", ",", ".", "", 100],
    ja: ["¥", ".", ",", "", 1], ru: ["", ",", "\u00a0", "\u00a0₽"], uk: ["", ",", "\u00a0", "\u00a0₴"], ko: ["₩", ".", ",", "", 10],
  });
  const [before, decimal, thousands, after = "", scale = 0] = CURRENCY;
  const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, thousands);

  // The number alone, as a field holds it: no decimals when they are zero.
  function plain(cents) {
    const abs = Math.abs(cents);
    if (scale) return group(abs * scale);
    const frac = abs % 100;
    return group(Math.floor(abs / 100)) + (frac ? decimal + String(frac).padStart(2, "0") : "");
  }
  // With its symbol, and "+" or "−" when signed.
  function format(cents, signed) {
    const text = before + plain(cents) + after;
    if (!signed || cents === 0) return text;
    return (cents > 0 ? "+" : "−") + text;
  }
  // What someone types, in cents. With cents, the last "," or "." followed by one or two digits is the decimal point,
  // whatever the language, so "33,5", "33.50" and "6.000" all read as meant; without, every digit is a whole unit.
  function parse(text) {
    const t = text.replace(/[^\d.,]/g, "");
    if (scale) return Math.round(Number(t.replace(/[.,]/g, "") || 0) / scale);
    const sep = Math.max(t.lastIndexOf(","), t.lastIndexOf("."));
    if (sep >= 0 && t.length - sep - 1 <= 2) {
      return Number(t.slice(0, sep).replace(/[.,]/g, "") || 0) * 100 + Number(t.slice(sep + 1).padEnd(2, "0"));
    }
    return Number(t.replace(/[.,]/g, "") || 0) * 100;
  }

  window.money = { format, plain, parse, symbolBefore: before.trim(), symbolAfter: after.trim(), wholeUnits: Boolean(scale) };
})();
