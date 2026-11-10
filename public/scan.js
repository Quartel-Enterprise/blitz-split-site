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
  const PAPER = {
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
      lines: [["2 BIR DRAFT", "28,00", 1], ["1 PLATTER UDANG", "96,00", 2]],
      subtotal: ["SUBTOTAL", "124,00"], service: ["LAYANAN 10%", "12,40", 3], total: ["TOTAL", "136,40"],
    },
    ja: {
      store: "ハーバーバー", address: "かもめ通り120", date: "2026/11/08  21:47",
      lines: [["2 生ビール", "28.00", 1], ["1 エビ盛り合わせ", "96.00", 2]],
      subtotal: ["小計", "124.00"], service: ["サービス料 10%", "12.40", 3], total: ["合計", "136.40"],
    },
  }[lang];
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
