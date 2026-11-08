// The landing's "Split it the way it really was" card: each chip, a way to split, shows the same bill split that way
// among the phone's four people (preview.js): what the way means, each one's basis (a quarter, an amount typed, a
// percentage, shares, income, the items they had) and what each one pays. Every way adds up to the bill's total.
(function () {
  const demo = document.querySelector(".split-demo");
  const panel = demo?.querySelector("[data-split-example]");
  if (!panel) return;
  const root = document.documentElement;
  const lang = ["pt", "es", "fr"].includes(root.dataset.lang) ? root.dataset.lang : "en";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // analytics.js, in <head>, sends the events; docs/analytics.md lists them.
  const track = (name, params) => window.track?.(name, params);

  const TEXT = {
    en: {
      bill: "Pizza night",
      note: {
        equal: "Everyone pays the same.",
        amounts: "Type what each one spent.",
        percent: "Each one takes a percentage of the total.",
        shares: "Had twice as much? Two shares.",
        income: "Each one pays in proportion to what they earn.",
        items: "Each one pays for what they had; a shared item, among who shared it.",
      },
      typed: "typed in",
      shares: (n) => `${n} ${n === 1 ? "share" : "shares"}`,
      earns: (k) => `earns $${k}k`,
      items: { pizza: "Pizza", beer: "Beer", salad: "Salad" },
    },
    pt: {
      bill: "Noite da pizza",
      note: {
        equal: "Todo mundo paga o mesmo.",
        amounts: "Digite quanto cada um gastou.",
        percent: "Cada um fica com uma porcentagem do total.",
        shares: "Comeu o dobro? Duas partes.",
        income: "Cada um paga na proporção do que ganha.",
        items: "Cada um paga o que consumiu; o que foi dividido, entre quem dividiu.",
      },
      typed: "digitado",
      shares: (n) => `${n} ${n === 1 ? "parte" : "partes"}`,
      earns: (k) => `ganha R$ ${k} mil`,
      items: { pizza: "Pizza", beer: "Cerveja", salad: "Salada" },
    },
    es: {
      bill: "Noche de pizza",
      note: {
        equal: "Todos pagan lo mismo.",
        amounts: "Escribe cuánto gastó cada uno.",
        percent: "Cada uno se queda con un porcentaje del total.",
        shares: "¿Comió el doble? Dos partes.",
        income: "Cada uno paga en proporción a lo que gana.",
        items: "Cada uno paga lo que consumió; lo compartido, entre quienes lo compartieron.",
      },
      typed: "escrito",
      shares: (n) => `${n} ${n === 1 ? "parte" : "partes"}`,
      earns: (k) => `gana $${k} mil`,
      items: { pizza: "Pizza", beer: "Cerveza", salad: "Ensalada" },
    },
    fr: {
      bill: "Soirée pizza",
      note: {
        equal: "Tout le monde paie pareil.",
        amounts: "Saisissez ce que chacun a dépensé.",
        percent: "Chacun prend un pourcentage du total.",
        shares: "Il en a pris le double ? Deux parts.",
        income: "Chacun paie selon ce qu'il gagne.",
        items: "Chacun paie ce qu'il a pris ; ce qui est partagé, entre ceux qui l'ont partagé.",
      },
      typed: "saisi",
      shares: (n) => `${n} ${n === 1 ? "part" : "parts"}`,
      earns: (k) => `gagne ${k} k$`,
      items: { pizza: "Pizza", beer: "Bière", salad: "Salade" },
    },
  }[lang];

  // Amounts as preview.js writes them: the language's separators, no decimals when they are zero.
  const CURRENCY = { pt: ["R$ ", ",", "."], en: ["$", ".", ","], es: ["$", ",", "."], fr: ["", ",", " ", " $"] }[lang];
  function money(cents) {
    const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY[2]);
    const frac = cents % 100;
    return CURRENCY[0] + whole + (frac ? CURRENCY[1] + String(frac).padStart(2, "0") : "") + (CURRENCY[3] || "");
  }

  // The bill: $120 among the phone's four people. Each way gives each one's basis and part, in cents.
  const TOTAL = 12000;
  const PEOPLE = [
    { name: "Pedro", photo: "me", color: "blue" },
    { name: "Ana", photo: "ana", color: "green" },
    { name: "Bruno", photo: "bruno", color: "peach" },
    { name: "Carla", photo: "carla", color: "lilac" },
  ];
  const list = (...keys) => keys.map((k) => TEXT.items[k]).join(", ");
  const MODES = {
    equal: [["1/4", 3000], ["1/4", 3000], ["1/4", 3000], ["1/4", 3000]],
    amounts: [[TEXT.typed, 4500], [TEXT.typed, 3000], [TEXT.typed, 2500], [TEXT.typed, 2000]],
    percent: [["40%", 4800], ["25%", 3000], ["20%", 2400], ["15%", 1800]],
    shares: [[TEXT.shares(2), 4000], [TEXT.shares(1), 2000], [TEXT.shares(1), 2000], [TEXT.shares(2), 4000]],
    income: [[TEXT.earns(6), 4800], [TEXT.earns(4), 3200], [TEXT.earns(3), 2400], [TEXT.earns(2), 1600]],
    // Pizza $60 between Pedro and Ana, beer $36 among Pedro, Bruno and Carla, Carla's salad $24.
    items: [[list("pizza", "beer"), 4200], [list("pizza"), 3000], [list("beer"), 1200], [list("salad", "beer"), 3600]],
  };
  // One scale for every way: the largest part fills the bar.
  const LARGEST = Math.max(...Object.values(MODES).flat().map(([, cents]) => cents));

  panel.innerHTML = `
    <p class="split-note" aria-live="polite"></p>
    <div class="split-bill"><span>${TEXT.bill}</span><span class="num">${money(TOTAL)}</span></div>
    <ul class="split-rows">${PEOPLE.map((p, i) => `
      <li style="--n:${i}">
        <span class="av ${p.color}"><img src="/people/${p.photo}.webp" alt=""></span>
        <span class="who">${p.name}<small></small></span>
        <span class="split-bar" aria-hidden="true"><i></i></span>
        <b class="num"></b>
      </li>`).join("")}
    </ul>`;
  panel.hidden = false;
  const note = panel.querySelector(".split-note");
  const rows = [...panel.querySelectorAll(".split-rows li")];
  const shown = rows.map(() => null);
  let rolling = 0;

  function swap(el, text, animate) {
    if (el.textContent === text) return;
    el.textContent = text;
    if (!animate || reduceMotion.matches) return;
    el.classList.remove("split-swap");
    void el.offsetWidth;
    el.classList.add("split-swap");
  }

  function show(mode, animate) {
    swap(note, TEXT.note[mode], animate);
    const parts = MODES[mode];
    rows.forEach((row, i) => {
      swap(row.querySelector("small"), parts[i][0], animate);
      row.querySelector(".split-bar i").style.setProperty("--w", String(parts[i][1] / LARGEST));
    });
    // The amounts roll from what they showed to the new parts.
    const from = shown.slice();
    parts.forEach(([, cents], i) => { shown[i] = cents; });
    cancelAnimationFrame(rolling);
    const amounts = rows.map((row) => row.querySelector("b"));
    if (!animate || reduceMotion.matches || from.includes(null)) {
      amounts.forEach((b, i) => { b.textContent = money(shown[i]); });
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 450);
      const eased = 1 - Math.pow(1 - t, 3);
      amounts.forEach((b, i) => { b.textContent = money(Math.round((from[i] + (shown[i] - from[i]) * eased) / 100) * 100); });
      if (t < 1) rolling = requestAnimationFrame(step);
    };
    rolling = requestAnimationFrame(step);
  }

  const chips = [...demo.querySelectorAll(".chip[data-mode]")];
  chips.forEach((chip) => chip.addEventListener("click", () => {
    if (chip.getAttribute("aria-pressed") === "true") return;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    track("split_mode_select", { mode: chip.dataset.mode });
    show(chip.dataset.mode, true);
  }));
  show("equal", false);
})();
