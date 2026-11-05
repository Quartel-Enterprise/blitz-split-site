// The landing's phone, working: its tabs (Expenses, Balances, Statistics) switch, and "Split a bill" opens a sheet that
// adds a bill, which every tab and the balance card follow. The amounts are worked out the app's way: in cents, a
// bill split equally among who took part, the cent left over going to the first ones, and the debts settled with as
// few payments as possible. The markup holds the Expenses tab as it starts, for a page without scripts.
(function () {
  const root = document.documentElement;
  const screen = document.querySelector(".showcase .screen");
  if (!screen) return;
  const lang = ["pt", "es"].includes(root.dataset.lang) ? root.dataset.lang : "en";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const TEXT = {
    en: {
      you: "You", youPaid: "You paid", paid: "{name} paid", notIn: "Not in this one",
      members: (people, bills) => `${people} people · ${bills} ${bills === 1 ? "bill" : "bills"}`,
      toGet: "to get back", youOwe: "you owe", settled: "all settled", owesYou: "Who owes you", youOweTitle: "You owe",
      eachOne: "Each one's balance", getsBack: "gets back", owes: "owes", even: "settled up",
      toSettle: "To settle up", total: "Group total", lodging: "Lodging", food: "Food", transport: "Transport",
      sheetTitle: "Split a bill", description: "Description", amount: "Amount", whoPaid: "Who paid",
      splitAmong: "Split equally among", each: "{value} each", cancel: "Cancel", save: "Save",
      queue: (n) => `${n} changes in the queue`, close: "Close",
      bills: { b1: "Lagoa guesthouse", b2: "Dinner at Ribeirão", b3: "Ride to the beach", p1: "Ice cream on the beach", p2: "Weekly groceries", p3: "Parking" },
    },
    pt: {
      you: "Você", youPaid: "Você pagou", paid: "{name} pagou", notIn: "Fora desta",
      members: (people, bills) => `${people} pessoas · ${bills} ${bills === 1 ? "conta" : "contas"}`,
      toGet: "a receber", youOwe: "você deve", settled: "tudo acertado", owesYou: "Te devem", youOweTitle: "Você deve",
      eachOne: "Saldo de cada um", getsBack: "a receber", owes: "deve", even: "quite",
      toSettle: "Para acertar", total: "Total do grupo", lodging: "Hospedagem", food: "Comida", transport: "Transporte",
      sheetTitle: "Rachar conta", description: "Descrição", amount: "Valor", whoPaid: "Quem pagou",
      splitAmong: "Dividir igual entre", each: "{value} para cada", cancel: "Cancelar", save: "Salvar",
      queue: (n) => `${n} alterações na fila`, close: "Fechar",
      bills: { b1: "Pousada na Lagoa", b2: "Jantar no Ribeirão", b3: "Uber para a praia", p1: "Sorvete na praia", p2: "Mercado da semana", p3: "Estacionamento" },
    },
    es: {
      you: "Tú", youPaid: "Pagaste tú", paid: "Pagó {name}", notIn: "No participas",
      members: (people, bills) => `${people} personas · ${bills} ${bills === 1 ? "cuenta" : "cuentas"}`,
      toGet: "por cobrar", youOwe: "debes", settled: "todo saldado", owesYou: "Te deben", youOweTitle: "Debes",
      eachOne: "Saldo de cada uno", getsBack: "por cobrar", owes: "debe", even: "al día",
      toSettle: "Para saldar", total: "Total del grupo", lodging: "Alojamiento", food: "Comida", transport: "Transporte",
      sheetTitle: "Dividir cuenta", description: "Descripción", amount: "Monto", whoPaid: "Quién pagó",
      splitAmong: "Dividir igual entre", each: "{value} para cada uno", cancel: "Cancelar", save: "Guardar",
      queue: (n) => `${n} cambios en la cola`, close: "Cerrar",
      bills: { b1: "Posada en la Lagoa", b2: "Cena en Ribeirão", b3: "Uber a la playa", p1: "Helado en la playa", p2: "Súper de la semana", p3: "Estacionamiento" },
    },
  }[lang];
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);

  // Amounts as the app shows them: the language's separators, and no decimals when they are all zero.
  const CURRENCY = { pt: ["R$ ", ",", "."], en: ["$", ".", ","], es: ["$", ",", "."] }[lang];
  function money(cents, signed) {
    const abs = Math.abs(cents);
    const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY[2]);
    const frac = abs % 100;
    const text = CURRENCY[0] + whole + (frac ? CURRENCY[1] + String(frac).padStart(2, "0") : "");
    if (!signed || cents === 0) return text;
    return (cents > 0 ? "+" : "−") + text;
  }

  const PEOPLE = [
    { id: "me", name: null, initial: "P", color: "blue" },
    { id: "ana", name: "Ana", initial: "A", color: "green" },
    { id: "bruno", name: "Bruno", initial: "B", color: "peach" },
    { id: "carla", name: "Carla", initial: "C", color: "lilac" },
  ];
  const everyone = PEOPLE.map((p) => p.id);
  const nameOf = (id) => (id === "me" ? TEXT.you : PEOPLE.find((p) => p.id === id).name);
  const CATEGORY = { lodging: "i-bed", food: "i-food", transport: "i-car" };

  // Newest first, as Expenses lists them.
  const bills = [
    { title: "b1", icon: "i-bed", category: "lodging", amount: 120000, payer: "me", among: everyone },
    { title: "b2", icon: "i-food", category: "food", amount: 31200, payer: "ana", among: everyone },
    { title: "b3", icon: "i-car", category: "transport", amount: 4860, payer: "bruno", among: everyone },
  ];
  const PRESETS = [
    { title: "p1", icon: "i-icecream", category: "food", amount: 4800 },
    { title: "p2", icon: "i-cart", category: "food", amount: 18640 },
    { title: "p3", icon: "i-car", category: "transport", amount: 2500 },
  ];
  let nextPreset = 0;
  let queued = 2;
  let tab = "bills";
  let fresh = null;

  // Each one's share of a bill, in cents: equal, the leftover cents going to the first ones.
  function shares(bill) {
    const n = bill.among.length;
    const base = Math.floor(bill.amount / n);
    const left = bill.amount - base * n;
    return Object.fromEntries(bill.among.map((id, i) => [id, base + (i < left ? 1 : 0)]));
  }
  function balances() {
    const net = Object.fromEntries(everyone.map((id) => [id, 0]));
    bills.forEach((bill) => {
      net[bill.payer] += bill.amount;
      Object.entries(shares(bill)).forEach(([id, share]) => { net[id] -= share; });
    });
    return net;
  }
  // The fewest payments that settle everyone: the biggest debt pays the biggest credit, until nothing is left.
  function settlements(net) {
    const credit = everyone.filter((id) => net[id] > 0).map((id) => [id, net[id]]).sort((a, b) => b[1] - a[1]);
    const debt = everyone.filter((id) => net[id] < 0).map((id) => [id, -net[id]]).sort((a, b) => b[1] - a[1]);
    const moves = [];
    while (credit.length && debt.length) {
      const amount = Math.min(credit[0][1], debt[0][1]);
      moves.push({ from: debt[0][0], to: credit[0][0], amount });
      credit[0][1] -= amount;
      debt[0][1] -= amount;
      if (!credit[0][1]) credit.shift();
      if (!debt[0][1]) debt.shift();
    }
    return moves;
  }

  const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const icon = (id) => `<svg class="icon"><use href="#${id}"/></svg>`;
  const avatar = (id) => {
    const p = PEOPLE.find((x) => x.id === id);
    return `<span class="av ${p.color}">${p.initial}</span>`;
  };
  const tone = (cents) => (cents > 0 ? "pos" : cents < 0 ? "neg" : "zero");

  function renderBills(net) {
    const rows = bills.map((bill) => {
      const share = shares(bill);
      const mine = (bill.payer === "me" ? bill.amount : 0) - (share.me || 0);
      const who = bill.payer === "me" ? TEXT.youPaid : fill(TEXT.paid, { name: nameOf(bill.payer) });
      const part = bill.payer !== "me" && !share.me
        ? `<small class="zero">${TEXT.notIn}</small>`
        : `<small class="${tone(mine)}">${money(mine, true)}</small>`;
      return `<li${bill === fresh ? ' class="fresh"' : ""}>
        <span class="cat">${icon(bill.icon)}</span>
        <span class="t"><b>${esc(TEXT.bills[bill.title])}</b><small>${esc(who)}</small></span>
        <span class="v num"><span>${money(bill.amount)}</span>${part}</span>
      </li>`;
    }).join("");
    const moves = settlements(net);
    const toMe = moves.filter((m) => m.to === "me");
    const fromMe = moves.filter((m) => m.from === "me");
    const owes = toMe.length
      ? `<div class="owes num"><small>${TEXT.owesYou}</small>${toMe.map((m) => `<span>${avatar(m.from)}${esc(nameOf(m.from))}<b class="pos">${money(m.amount)}</b></span>`).join("")}</div>`
      : fromMe.length
        ? `<div class="owes num"><small>${TEXT.youOweTitle}</small>${fromMe.map((m) => `<span>${avatar(m.to)}${esc(nameOf(m.to))}<b class="neg">${money(m.amount)}</b></span>`).join("")}</div>`
        : "";
    return `<ul class="list">${rows}</ul>${owes}`;
  }

  function renderBalances(net) {
    const order = ["me", ...everyone.filter((id) => id !== "me").sort((a, b) => net[b] - net[a])];
    const rows = order.map((id) => {
      const label = net[id] > 0 ? TEXT.getsBack : net[id] < 0 ? TEXT.owes : TEXT.even;
      return `<li><span class="who">${avatar(id)}<b>${esc(nameOf(id))}</b></span><span class="v num"><span class="${tone(net[id])}">${money(net[id], true)}</span><small>${label}</small></span></li>`;
    }).join("");
    const moves = settlements(net).map((m) => `<li class="move">${avatar(m.from)}<span class="arrow">${esc(nameOf(m.from))} → ${esc(nameOf(m.to))}</span><b class="num">${money(m.amount)}</b></li>`).join("");
    return `<p class="pv-label">${TEXT.eachOne}</p><ul class="list people">${rows}</ul>`
      + (moves ? `<p class="pv-label">${TEXT.toSettle}</p><ul class="moves">${moves}</ul>` : "");
  }

  function renderStats() {
    const total = bills.reduce((sum, b) => sum + b.amount, 0);
    const byCategory = Object.keys(CATEGORY).map((key) => [key, bills.filter((b) => b.category === key).reduce((s, b) => s + b.amount, 0)])
      .filter(([, cents]) => cents > 0).sort((a, b) => b[1] - a[1]);
    const max = byCategory[0][1];
    const rows = byCategory.map(([key, cents], i) => `<li>
        <span class="cat">${icon(CATEGORY[key])}</span>
        <span class="bar-t"><span class="bar-row"><b>${TEXT[key]}</b><span class="num">${money(cents)} · ${Math.round((cents / total) * 100)}%</span></span>
        <span class="bar"><i class="o${i}" style="width:${Math.max(3, (cents / max) * 100)}%"></i></span></span>
      </li>`).join("");
    return `<div class="pv-total"><small>${TEXT.total}</small><strong class="num">${money(total)}</strong></div><ul class="list stats">${rows}</ul>`;
  }

  const panel = screen.querySelector('[data-pv="panel"]');
  function render(animate) {
    const net = balances();
    screen.querySelector('[data-pv="members"]').textContent = TEXT.members(PEOPLE.length, bills.length);
    screen.querySelector('[data-pv="balance"]').textContent = money(net.me, true);
    screen.querySelector('[data-pv="balance-label"]').textContent = net.me > 0 ? TEXT.toGet : net.me < 0 ? TEXT.youOwe : TEXT.settled;
    panel.innerHTML = tab === "bills" ? renderBills(net) : tab === "balances" ? renderBalances(net) : renderStats();
    if (animate && !reduceMotion.matches) {
      panel.classList.remove("swap");
      void panel.offsetWidth;
      panel.classList.add("swap");
    }
  }

  // The tabs.
  const tabs = [...screen.querySelectorAll('[role="tab"]')];
  tabs.forEach((button) => {
    button.id = `pv-tab-${button.dataset.tab}`;
    button.addEventListener("click", () => select(button.dataset.tab, true));
    button.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const i = tabs.indexOf(button) + (e.key === "ArrowRight" ? 1 : -1);
      const next = tabs[(i + tabs.length) % tabs.length];
      next.focus();
      select(next.dataset.tab, true);
    });
  });
  function select(name, animate) {
    tab = name;
    tabs.forEach((b) => {
      const on = b.dataset.tab === name;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `pv-tab-${name}`);
    panel.scrollTop = 0;
    render(animate);
  }

  // "Split a bill": a sheet over the screen with the next example bill; who paid and who took part are picked here.
  const splitButton = screen.querySelector('[data-pv="split"]');
  const scrim = document.createElement("div");
  scrim.className = "pv-scrim";
  const sheet = document.createElement("div");
  sheet.className = "pv-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", TEXT.sheetTitle);
  scrim.hidden = sheet.hidden = true;
  screen.append(scrim, sheet);
  let draft = null;

  function renderSheet() {
    const share = shares({ amount: draft.amount, among: draft.among });
    const each = Math.min(...Object.values(share));
    sheet.innerHTML = `
      <span class="grabber" aria-hidden="true"></span>
      <div class="sheet-head"><h4>${TEXT.sheetTitle}</h4><button type="button" class="sheet-x" data-act="cancel" aria-label="${TEXT.close}">${icon("i-x")}</button></div>
      <div class="field"><small>${TEXT.description}</small><span class="desc"><span class="cat">${icon(draft.icon)}</span>${esc(TEXT.bills[draft.title])}</span></div>
      <div class="field"><small>${TEXT.amount}</small><strong class="num amount">${money(draft.amount)}</strong></div>
      <div class="field"><small>${TEXT.whoPaid}</small><div class="picks">${everyone.map((id) => `<button type="button" class="pick" data-payer="${id}" aria-pressed="${draft.payer === id}">${avatar(id)}${esc(nameOf(id))}</button>`).join("")}</div></div>
      <div class="field"><small>${TEXT.splitAmong}</small><div class="picks">${everyone.map((id) => `<button type="button" class="pick" data-among="${id}" aria-pressed="${draft.among.includes(id)}">${avatar(id)}${esc(nameOf(id))}</button>`).join("")}</div>
        <span class="each num">${fill(TEXT.each, { value: money(each) })}</span></div>
      <div class="sheet-actions"><button type="button" class="ghost" data-act="cancel">${TEXT.cancel}</button><button type="button" class="save" data-act="save">${icon("i-check")}${TEXT.save}</button></div>`;
  }
  sheet.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    if (button.dataset.payer) draft.payer = button.dataset.payer;
    else if (button.dataset.among) {
      const id = button.dataset.among;
      const kept = draft.among.includes(id) ? draft.among.filter((x) => x !== id) : everyone.filter((x) => x === id || draft.among.includes(x));
      if (kept.length) draft.among = kept;
    } else if (button.dataset.act === "cancel") return closeSheet();
    else if (button.dataset.act === "save") return save();
    const focused = button.dataset.payer ? `[data-payer="${button.dataset.payer}"]` : `[data-among="${button.dataset.among}"]`;
    renderSheet();
    sheet.querySelector(focused)?.focus();
  });
  sheet.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.stopPropagation(); closeSheet(); }
    if (e.key !== "Tab") return;
    const items = [...sheet.querySelectorAll("button")];
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
  });
  scrim.addEventListener("click", () => closeSheet());

  function openSheet() {
    const preset = PRESETS[nextPreset % PRESETS.length];
    draft = { ...preset, payer: "me", among: [...everyone] };
    renderSheet();
    scrim.hidden = sheet.hidden = false;
    screen.classList.add("sheet-open");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scrim.classList.add("show");
      sheet.classList.add("show");
    }));
    sheet.querySelector('[data-act="save"]').focus({ preventScroll: true });
  }
  function closeSheet(after) {
    scrim.classList.remove("show");
    sheet.classList.remove("show");
    screen.classList.remove("sheet-open");
    const done = () => {
      scrim.hidden = sheet.hidden = true;
      if (after) after();
      splitButton.focus({ preventScroll: true });
    };
    if (reduceMotion.matches) done(); else setTimeout(done, 240);
  }
  function save() {
    fresh = { ...draft, among: [...draft.among] };
    bills.unshift(fresh);
    nextPreset += 1;
    queued += 1;
    closeSheet(() => {
      select("bills", true);
      fresh = null;
      const queue = document.querySelector('[data-pv="queue"]');
      if (queue) {
        queue.textContent = TEXT.queue(queued);
        const card = queue.closest(".float");
        card.classList.remove("bump");
        void card.offsetWidth;
        card.classList.add("bump");
      }
    });
  }
  splitButton.addEventListener("click", openSheet);

  select("bills", false);
})();
