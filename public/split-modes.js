// The landing's "Split it the way it really was" card, working as the app's split editor (blitz-split-client,
// feature/split_bill): each chip, a way to split, opens that way's editor on the same bill, a $132 pizza night that
// Pedro paid, among the phone's four people (preview.js).
//   Equally      a checkbox each, and "Check all"; at least one person must be in.
//   Amounts      a field each; the parts must add up to the total, and whoever is left at 0 is out.
//   Percentages  a whole number each; they must add up to 100.
//   Shares       a stepper each, 0 to 99; 0 is out.
//   By income    each one's income per month turns into whole percentages adding up to 100 (largest remainder, as the
//                app's group "Default split" does it; the app keeps the incomes on the device).
//   Items        three items, each split equally among who had it (tap their faces), and a 10% service split by what
//                each one had.
// Every part is in cents, rounded down, the cents left going to whoever paid when they are in, else one each to the
// first ones in: the app's rule. The status above the people says what the app's says: "$33 each", "$10 left"...
(function () {
  const demo = document.querySelector(".split-demo");
  const panel = demo?.querySelector("[data-split-example]");
  if (!panel) return;
  const root = document.documentElement;
  const lang = ["pt", "es", "fr"].includes(root.dataset.lang) ? root.dataset.lang : "en";
  // analytics.js, in <head>, sends the events; docs/analytics.md lists them.
  const track = (name, params) => window.track?.(name, params);

  const TEXT = {
    en: {
      bill: "Pizza night", paid: "Pedro paid", notIn: "Not in this one",
      each: "{a} each", among: "{a} among {n} people.", amongOne: "{a} for 1 person.", out: "{name} is out.",
      nobody: "Nobody is in yet", nobodyEqual: "Check at least one person to split {a}.",
      checkAll: "Check all", uncheckAll: "Uncheck all",
      left: "{a} left", over: "{a} over", closed: "Adds up: {a}",
      progress: "{a} of {b} so far.", closedMsg: "The parts add up to the total.",
      parts: "{n} shares of {a}", personParts: "{name} has {n} shares.", nobodyShares: "Give at least one person a share to split {a}.",
      ofEach: "{p} of each bill", ofBill: "{p} of the bill", incomeDetail: "Each one's part follows their income.", perMonth: "/mo",
      service: "Service ({p})", serviceSub: "In proportion to what each one had",
      loose: "Mark who had each item", looseDetail: "Tap the faces on each item to mark who had it.",
      itemsClosed: "{a} in items and {b} of service.", nobodyItem: "Nobody checked", eachItem: "{a} each",
      items: { pizza: "Large pizza", beer: "Beer", salad: "Salad" },
      hint: {
        equal: "When it doesn't split evenly, the leftover cents go to whoever paid.",
        amounts: "Whoever is left at {zero} is out of the bill.",
        percent: "Whole numbers only. The leftover cents go to whoever paid.",
        shares: "Use shares when someone has more, like who brought a plus-one.",
        income: "Incomes stay on the device. The group sees only the percentages.",
        items: "Each item is split among who had it, and the service by what each one had.",
      },
      label: {
        amount: "{name}'s amount", percent: "{name}'s percentage", income: "{name}'s income per month",
        less: "One share less for {name}", more: "One more share for {name}", had: "Who had {item}",
      },
    },
    pt: {
      bill: "Noite da pizza", paid: "Pedro pagou", notIn: "Fora desta",
      each: "{a} para cada um", among: "{a} entre {n} pessoas.", amongOne: "{a} para 1 pessoa.", out: "{name} não participa.",
      nobody: "Ninguém participa ainda", nobodyEqual: "Marque pelo menos uma pessoa para dividir {a}.",
      checkAll: "Marcar todos", uncheckAll: "Desmarcar todos",
      left: "Faltam {a}", over: "Passou {a}", closed: "Fechou: {a}",
      progress: "Já foram {a} de {b}.", closedMsg: "A soma das partes é igual ao total.",
      parts: "{n} partes de {a}", personParts: "{name} tem {n} partes.", nobodyShares: "Dê pelo menos uma parte a alguém para dividir {a}.",
      ofEach: "{p} de cada conta", ofBill: "{p} da conta", incomeDetail: "A parte de cada um segue a renda.", perMonth: "/mês",
      service: "Serviço ({p})", serviceSub: "Proporcional ao que cada um consumiu",
      loose: "Marque quem consumiu", looseDetail: "Toque nos rostos de cada item e marque quem consumiu.",
      itemsClosed: "{a} em itens e {b} de serviço.", nobodyItem: "Ninguém marcado", eachItem: "{a} cada",
      items: { pizza: "Pizza grande", beer: "Cerveja", salad: "Salada" },
      hint: {
        equal: "Quando não dá conta exata, os centavos que sobram ficam com quem pagou.",
        amounts: "Quem fica com {zero} sai da conta.",
        percent: "Só números inteiros. Os centavos que sobram ficam com quem pagou.",
        shares: "Use partes quando alguém consome mais, como quem levou acompanhante.",
        income: "As rendas ficam só no aparelho. O grupo vê só as porcentagens.",
        items: "Cada item é dividido entre quem consumiu, e o serviço, pelo que cada um consumiu.",
      },
      label: {
        amount: "Valor de {name}", percent: "Porcentagem de {name}", income: "Renda por mês de {name}",
        less: "Menos uma parte para {name}", more: "Mais uma parte para {name}", had: "Quem consumiu {item}",
      },
    },
    es: {
      bill: "Noche de pizza", paid: "Pagó Pedro", notIn: "No participa",
      each: "{a} cada uno", among: "{a} entre {n} personas.", amongOne: "{a} para 1 persona.", out: "{name} no participa.",
      nobody: "Nadie participa todavía", nobodyEqual: "Marca al menos a una persona para dividir {a}.",
      checkAll: "Marcar todos", uncheckAll: "Desmarcar todos",
      left: "Faltan {a}", over: "Te pasaste por {a}", closed: "Cuadra: {a}",
      progress: "Van {a} de {b}.", closedMsg: "La suma de las partes es igual al total.",
      parts: "{n} partes de {a}", personParts: "{name} tiene {n} partes.", nobodyShares: "Dale al menos una parte a alguien para dividir {a}.",
      ofEach: "{p} de cada cuenta", ofBill: "{p} de la cuenta", incomeDetail: "La parte de cada uno sigue sus ingresos.", perMonth: "/mes",
      service: "Servicio ({p})", serviceSub: "Según lo que consumió cada uno",
      loose: "Marca quién consumió", looseDetail: "Toca las caras de cada ítem y marca quién lo consumió.",
      itemsClosed: "{a} en ítems y {b} de servicio.", nobodyItem: "Nadie marcado", eachItem: "{a} cada uno",
      items: { pizza: "Pizza grande", beer: "Cerveza", salad: "Ensalada" },
      hint: {
        equal: "Cuando no da exacto, los centavos que sobran quedan para quien pagó.",
        amounts: "Quien queda en {zero} sale de la cuenta.",
        percent: "Solo números enteros. Los centavos que sobran quedan para quien pagó.",
        shares: "Usa partes cuando alguien consume más, como quien llevó acompañante.",
        income: "Los ingresos quedan solo en el dispositivo. El grupo ve solo los porcentajes.",
        items: "Cada ítem se divide entre quienes lo consumieron, y el servicio, según lo que consumió cada uno.",
      },
      label: {
        amount: "Monto de {name}", percent: "Porcentaje de {name}", income: "Ingresos por mes de {name}",
        less: "Una parte menos para {name}", more: "Una parte más para {name}", had: "Quién consumió {item}",
      },
    },
    fr: {
      bill: "Soirée pizza", paid: "Pedro a payé", notIn: "Pas dans celle-ci",
      each: "{a} chacun", among: "{a} entre {n} personnes.", amongOne: "{a} pour 1 personne.", out: "{name} ne participe pas.",
      nobody: "Personne ne participe encore", nobodyEqual: "Cochez au moins une personne pour partager {a}.",
      checkAll: "Tout cocher", uncheckAll: "Tout décocher",
      left: "Il manque {a}", over: "{a} de trop", closed: "Le compte est bon : {a}",
      progress: "{a} sur {b} pour l'instant.", closedMsg: "La somme des parts est égale au total.",
      parts: "{n} parts de {a}", personParts: "{name} a {n} parts.", nobodyShares: "Donnez au moins une part à quelqu'un pour partager {a}.",
      ofEach: "{p} de chaque dépense", ofBill: "{p} de la dépense", incomeDetail: "La part de chacun suit ses revenus.", perMonth: "/mois",
      service: "Service ({p})", serviceSub: "Selon ce que chacun a pris",
      loose: "Indiquez qui a pris quoi", looseDetail: "Touchez les visages de chaque article pour indiquer qui l'a pris.",
      itemsClosed: "{a} d'articles et {b} de service.", nobodyItem: "Personne", eachItem: "{a} chacun",
      items: { pizza: "Grande pizza", beer: "Bière", salad: "Salade" },
      hint: {
        equal: "Quand ça ne tombe pas juste, les centimes en trop vont à celui qui a payé.",
        amounts: "Qui reste à {zero} sort de la dépense.",
        percent: "Nombres entiers seulement. Les centimes en trop vont à celui qui a payé.",
        shares: "Utilisez les parts quand quelqu'un consomme plus, comme celui qui vient accompagné.",
        income: "Les revenus restent sur l'appareil. Le groupe ne voit que les pourcentages.",
        items: "Chaque article est partagé entre ceux qui l'ont pris, et le service selon ce que chacun a pris.",
      },
      label: {
        amount: "Montant de {name}", percent: "Pourcentage de {name}", income: "Revenus par mois de {name}",
        less: "Une part de moins pour {name}", more: "Une part de plus pour {name}", had: "Qui a pris {item}",
      },
    },
  }[lang];
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);

  // Amounts as preview.js writes them: the language's separators, no decimals when they are zero.
  const CURRENCY = { pt: ["R$ ", ",", "."], en: ["$", ".", ","], es: ["$", ",", "."], fr: ["", ",", " ", " $"] }[lang];
  function plain(cents) {
    const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY[2]);
    const frac = cents % 100;
    return whole + (frac ? CURRENCY[1] + String(frac).padStart(2, "0") : "");
  }
  const money = (cents) => CURRENCY[0] + plain(cents) + (CURRENCY[3] || "");
  const pct = (n) => (lang === "fr" ? `${n} %` : `${n}%`);
  // What someone types, in cents: the last "," or "." followed by one or two digits is the decimal point, whatever the
  // language, so "33,5", "33.50" and "6.000" all read as meant.
  function parseMoney(text) {
    const t = text.replace(/[^\d.,]/g, "");
    const sep = Math.max(t.lastIndexOf(","), t.lastIndexOf("."));
    if (sep >= 0 && t.length - sep - 1 <= 2) {
      return Number(t.slice(0, sep).replace(/[.,]/g, "") || 0) * 100 + Number(t.slice(sep + 1).padEnd(2, "0"));
    }
    return Number(t.replace(/[.,]/g, "") || 0) * 100;
  }

  const PEOPLE = [
    { name: "Pedro", photo: "me", color: "blue" },
    { name: "Ana", photo: "ana", color: "green" },
    { name: "Bruno", photo: "bruno", color: "peach" },
    { name: "Carla", photo: "carla", color: "lilac" },
  ];
  const PAYER = 0;
  const SERVICE = 10;
  const sum = (list) => list.reduce((a, b) => a + b, 0);

  // A total split by weights: each part rounded down, the cents left to the payer when in, else one each to the first
  // ones in.
  function distribute(total, weights) {
    const all = sum(weights);
    if (!all) return weights.map(() => 0);
    const parts = weights.map((w) => Math.floor((total * w) / all));
    let left = total - sum(parts);
    if (weights[PAYER] > 0) parts[PAYER] += left;
    for (let i = 0; left > 0; i = (i + 1) % parts.length) {
      if (weights[i] > 0) { parts[i] += 1; left -= 1; }
    }
    return parts;
  }
  // Incomes into whole percentages adding up to 100: the largest remainders get the points left, ties to the first.
  function incomePercents(incomes) {
    const all = sum(incomes);
    if (!all) return incomes.map(() => 100 / incomes.length);
    const raw = incomes.map((v) => (v * 100) / all);
    const whole = raw.map(Math.floor);
    const order = raw.map((r, i) => [r - whole[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (let k = 0; k < 100 - sum(whole); k += 1) whole[order[k][1]] += 1;
    return whole;
  }

  // The items: $120, and 10% of service makes the bill's $132.
  const ITEMS = [
    { key: "pizza", qty: 1, each: 6000, who: [true, true, false, false] },
    { key: "beer", qty: 3, each: 1200, who: [true, false, true, true] },
    { key: "salad", qty: 1, each: 2400, who: [false, false, false, true] },
  ];
  const ITEMS_TOTAL = sum(ITEMS.map((it) => it.qty * it.each));
  const SERVICE_TOTAL = Math.round((ITEMS_TOTAL * SERVICE) / 100);
  const TOTAL = ITEMS_TOTAL + SERVICE_TOTAL;

  // Each way keeps what was typed in it while the visitor switches between them.
  const state = {
    equal: [true, true, true, true],
    amounts: distribute(TOTAL, [1, 1, 1, 1]),
    percent: [25, 25, 25, 25],
    shares: [1, 1, 1, 1],
    income: [600000, 400000, 300000, 200000],
  };
  let mode = "equal";
  const edited = new Set();
  function noteEdit() {
    if (edited.has(mode)) return;
    edited.add(mode);
    track("split_mode_edit", { mode });
  }

  // What each one pays, and the status, for the way open now.
  function figure() {
    const outs = (parts) => PEOPLE.filter((_, i) => !parts[i]).map((p) => fill(TEXT.out, { name: p.name }));
    const among = (count) => fill(count === 1 ? TEXT.amongOne : TEXT.among, { a: money(TOTAL), n: count });
    if (mode === "equal") {
      const parts = distribute(TOTAL, state.equal.map(Number));
      const count = state.equal.filter(Boolean).length;
      if (!count) return { parts, tone: "bad", title: TEXT.nobody, detail: fill(TEXT.nobodyEqual, { a: money(TOTAL) }) };
      return { parts, tone: "ok", title: fill(TEXT.each, { a: money(Math.floor(TOTAL / count)) }), detail: [among(count), ...outs(parts)].join(" ") };
    }
    if (mode === "amounts") {
      const parts = state.amounts.slice();
      const got = sum(parts);
      const tone = got === TOTAL ? "ok" : got < TOTAL ? "wait" : "bad";
      const title = got === TOTAL ? fill(TEXT.closed, { a: money(TOTAL) })
        : fill(got < TOTAL ? TEXT.left : TEXT.over, { a: money(Math.abs(TOTAL - got)) });
      const detail = got === TOTAL ? TEXT.closedMsg : fill(TEXT.progress, { a: money(got), b: money(TOTAL) });
      return { parts, tone, title, detail: [detail, ...outs(parts)].join(" ") };
    }
    if (mode === "percent") {
      const got = sum(state.percent);
      const parts = got === 100 ? distribute(TOTAL, state.percent) : state.percent.map((p) => Math.floor((TOTAL * p) / 100));
      const tone = got === 100 ? "ok" : got < 100 ? "wait" : "bad";
      const title = got === 100 ? fill(TEXT.closed, { a: pct(100) })
        : fill(got < 100 ? TEXT.left : TEXT.over, { a: pct(Math.abs(100 - got)) });
      const count = state.percent.filter(Boolean).length;
      return { parts, tone, title, detail: [among(count), ...outs(parts)].join(" ") };
    }
    if (mode === "shares") {
      const all = sum(state.shares);
      const parts = distribute(TOTAL, state.shares);
      if (!all) return { parts, tone: "bad", title: TEXT.nobody, detail: fill(TEXT.nobodyShares, { a: money(TOTAL) }) };
      const detail = [
        ...PEOPLE.map((p, i) => (state.shares[i] > 1 ? fill(TEXT.personParts, { name: p.name, n: state.shares[i] }) : null)).filter(Boolean),
        ...outs(parts),
      ];
      const count = state.shares.filter(Boolean).length;
      return { parts, tone: "ok", title: fill(TEXT.parts, { n: all, a: money(TOTAL) }), detail: detail.join(" ") || among(count) };
    }
    if (mode === "income") {
      const percents = incomePercents(state.income);
      const parts = distribute(TOTAL, percents);
      return { parts, percents, tone: "ok", title: fill(TEXT.closed, { a: pct(100) }), detail: [TEXT.incomeDetail, ...outs(parts)].join(" ") };
    }
    // Items: each one equally among who had it, then the service by what each one had.
    const had = PEOPLE.map(() => 0);
    let assigned = 0;
    const perItem = ITEMS.map((it) => {
      const split = distribute(it.qty * it.each, it.who.map(Number));
      split.forEach((c, i) => { had[i] += c; });
      if (it.who.some(Boolean)) assigned += it.qty * it.each;
      return split;
    });
    const service = Math.round((assigned * SERVICE) / 100);
    const tips = distribute(service, had);
    const parts = had.map((c, i) => c + tips[i]);
    const loose = ITEMS.some((it) => !it.who.some(Boolean));
    if (loose) return { parts, perItem, service, tone: "wait", title: TEXT.loose, detail: TEXT.looseDetail };
    return { parts, perItem, service, tone: "ok", title: fill(TEXT.closed, { a: money(TOTAL) }), detail: fill(TEXT.itemsClosed, { a: money(ITEMS_TOTAL), b: money(service) }) };
  }

  const face = (p) => `<span class="av ${p.color}"><img src="/people/${p.photo}.webp" alt=""></span>`;
  const prefix = CURRENCY[0].trim();
  const suffix = (CURRENCY[3] || "").trim();
  const moneyField = (value, label, extra = "") => `<span class="split-field">${prefix ? `<span>${prefix}</span>` : ""}`
    + `<input type="text" inputmode="decimal" autocomplete="off" value="${plain(value)}" aria-label="${label}">`
    + `${suffix ? `<span>${suffix}</span>` : ""}${extra}</span>`;

  function control(i) {
    const name = PEOPLE[i].name;
    if (mode === "equal") return `<input type="checkbox" class="split-check" ${state.equal[i] ? "checked" : ""}>`;
    if (mode === "amounts") return moneyField(state.amounts[i], fill(TEXT.label.amount, { name }));
    if (mode === "percent") {
      return `<span class="split-field"><input type="text" inputmode="numeric" autocomplete="off" maxlength="3" value="${state.percent[i]}" aria-label="${fill(TEXT.label.percent, { name })}"><span>%</span></span>`;
    }
    if (mode === "shares") {
      return `<span class="split-stepper"><button type="button" data-step="-1" aria-label="${fill(TEXT.label.less, { name })}">−</button>`
        + `<output class="num">${state.shares[i]}</output>`
        + `<button type="button" data-step="1" aria-label="${fill(TEXT.label.more, { name })}">+</button></span>`;
    }
    return moneyField(state.income[i], fill(TEXT.label.income, { name }), `<small>${TEXT.perMonth}</small>`);
  }

  function build() {
    panel.dataset.mode = mode;
    const people = mode === "items" ? "" : `
      ${mode === "equal" ? `<button type="button" class="split-all"></button>` : ""}
      <ul class="split-rows">${PEOPLE.map((p, i) => {
        const tag = mode === "equal" ? "label" : "div";
        return `<li><${tag} class="split-row" style="--n:${i}">${face(p)}<span class="who">${p.name}<small></small></span>${control(i)}</${tag}></li>`;
      }).join("")}</ul>`;
    const items = mode !== "items" ? "" : `
      <ul class="split-items">${ITEMS.map((it, k) => {
        const name = TEXT.items[it.key];
        return `<li class="split-item">
          <span class="split-item-name"><b>${name}</b><small class="num">${it.qty} × ${money(it.each)}</small></span>
          <span class="split-faces" role="group" aria-label="${fill(TEXT.label.had, { item: name })}">${PEOPLE.map((p, i) => `<button type="button" class="split-face" data-item="${k}" data-person="${i}" aria-pressed="${it.who[i]}" aria-label="${p.name}">${face(p)}</button>`).join("")}</span>
          <span class="split-item-price"><b class="num">${money(it.qty * it.each)}</b><small class="split-item-each"></small></span>
        </li>`;
      }).join("")}</ul>
      <div class="split-service"><span>${fill(TEXT.service, { p: pct(SERVICE) })}<small>${TEXT.serviceSub}</small></span><b class="num"></b></div>
      <ul class="split-sums">${PEOPLE.map((p, i) => `<li class="split-row" style="--n:${i}">${face(p)}<span class="who">${p.name}</span><b class="num"></b></li>`).join("")}</ul>`;
    panel.innerHTML = `
      <div class="split-status" aria-live="polite"><strong></strong><span></span></div>
      <div class="split-bill"><span><b>${TEXT.bill}</b><small>${TEXT.paid}</small></span><b class="num">${money(TOTAL)}</b></div>
      ${people}${items}
      <p class="split-hint">${fill(TEXT.hint[mode], { zero: money(0) })}</p>`;
    panel.hidden = false;
    // The rows' light grows from nothing to each one's part: laid out at 0 first, then set.
    panel.querySelectorAll(".split-row").forEach((row) => row.style.setProperty("--w", "0"));
    void panel.offsetWidth;
    update();
  }

  function update() {
    const f = figure();
    const status = panel.querySelector(".split-status");
    status.dataset.tone = f.tone;
    status.querySelector("strong").textContent = f.title;
    status.querySelector("span").textContent = f.detail;
    const rows = [...panel.querySelectorAll(".split-row")];
    rows.forEach((row, i) => {
      row.style.setProperty("--w", String(f.parts[i] / TOTAL));
      row.classList.toggle("is-out", !f.parts[i] && mode !== "items");
      const sub = row.querySelector("small");
      const b = row.querySelector("b");
      if (b) b.textContent = money(f.parts[i]);
      if (!sub) return;
      if (!f.parts[i]) sub.textContent = TEXT.notIn;
      else if (mode === "income") sub.textContent = `${money(f.parts[i])} · ${fill(TEXT.ofEach, { p: pct(f.percents[i]) })}`;
      // Amounts: the field holds the money, so the line says how much of the bill it is.
      else if (mode === "amounts") sub.textContent = fill(TEXT.ofBill, { p: pct(Math.round((f.parts[i] * 100) / TOTAL)) });
      else sub.textContent = money(f.parts[i]);
    });
    if (mode === "equal") {
      const all = state.equal.every(Boolean);
      panel.querySelector(".split-all").textContent = all ? TEXT.uncheckAll : TEXT.checkAll;
    }
    if (mode === "items") {
      panel.querySelectorAll(".split-item").forEach((li, k) => {
        const count = ITEMS[k].who.filter(Boolean).length;
        const each = li.querySelector(".split-item-each");
        each.textContent = count ? fill(TEXT.eachItem, { a: money(Math.floor(ITEMS[k].qty * ITEMS[k].each / count)) }) : TEXT.nobodyItem;
        each.classList.toggle("is-loose", !count);
      });
      panel.querySelector(".split-service b").textContent = money(f.service);
    }
  }

  // Edits: they change the state and the figures, never the field being typed in.
  panel.addEventListener("change", (e) => {
    if (!e.target.matches(".split-check")) return;
    const i = [...panel.querySelectorAll(".split-check")].indexOf(e.target);
    state.equal[i] = e.target.checked;
    noteEdit();
    update();
  });
  panel.addEventListener("input", (e) => {
    const input = e.target;
    if (!input.matches(".split-field input")) return;
    const i = [...panel.querySelectorAll(".split-field input")].indexOf(input);
    if (mode === "percent") {
      input.value = input.value.replace(/\D/g, "");
      state.percent[i] = Math.min(100, Number(input.value || 0));
    } else {
      state[mode][i] = Math.min(mode === "income" ? 99999999 : 999999, parseMoney(input.value));
    }
    noteEdit();
    update();
  });
  // Leaving a field writes what it holds the way the app shows it.
  panel.addEventListener("focusout", (e) => {
    const input = e.target;
    if (!input.matches(".split-field input")) return;
    const i = [...panel.querySelectorAll(".split-field input")].indexOf(input);
    input.value = mode === "percent" ? String(state.percent[i]) : plain(state[mode][i]);
  });
  panel.addEventListener("click", (e) => {
    const all = e.target.closest(".split-all");
    if (all) {
      const on = !state.equal.every(Boolean);
      state.equal = state.equal.map(() => on);
      panel.querySelectorAll(".split-check").forEach((box) => { box.checked = on; });
      noteEdit();
      update();
      return;
    }
    const step = e.target.closest("[data-step]");
    if (step) {
      const i = [...panel.querySelectorAll(".split-stepper")].indexOf(step.parentElement);
      state.shares[i] = Math.max(0, Math.min(99, state.shares[i] + Number(step.dataset.step)));
      step.parentElement.querySelector("output").textContent = state.shares[i];
      noteEdit();
      update();
      return;
    }
    const toggle = e.target.closest(".split-face");
    if (toggle) {
      const it = ITEMS[Number(toggle.dataset.item)];
      const i = Number(toggle.dataset.person);
      it.who[i] = !it.who[i];
      toggle.setAttribute("aria-pressed", String(it.who[i]));
      noteEdit();
      update();
    }
  });

  const chips = [...demo.querySelectorAll(".chip[data-mode]")];
  chips.forEach((chip) => chip.addEventListener("click", () => {
    if (chip.getAttribute("aria-pressed") === "true") return;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    mode = chip.dataset.mode;
    track("split_mode_select", { mode });
    build();
  }));
  build();
})();
