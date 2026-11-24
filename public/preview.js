// The landing's phone, working: its tabs (Expenses, Balances, Statistics) switch, and what they list opens a sheet as
// the app does. "Split a bill" adds a bill, a bill shows how it was split and can be deleted, someone who owes you or a
// payment to settle up records a payment, a person shows their numbers and a category its bills. Every change moves
// the balance card, every tab and the offline card's queue. The amounts are worked out the app's way: in cents, a bill
// split equally among who took part, the cent left over going to the first ones, and the debts settled with as few
// payments as possible. The markup holds the Expenses tab as it starts, for a page without scripts.
(function () {
  const root = document.documentElement;
  const screen = document.querySelector(".showcase .screen");
  if (!screen) return;
  // One of the site's languages: boot.js, in <head>, picked it.
  const lang = root.dataset.lang;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // analytics.js, in <head>, sends the events; docs/analytics.md lists them.
  const track = (name, params) => window.track?.(name, params);

  // Polish, Russian, Ukrainian, Czech, Slovak, Romanian and Lithuanian counts take one form for 1 (and, in Russian, Ukrainian and Lithuanian, 21, 31…),
  // another for a few and a third for the rest, as Intl.PluralRules tells them: the few are 2–4 in Czech and Slovak, 2–9 and 22–29… in Lithuanian, 2–4
  // and 22–24… in the others, and 2–19 in Romanian, whose rest takes "de" (20 de cheltuieli). Latvian has no few: its
  // one is 1, 21, 31… and its zero and other both take the plural, the third form.
  const plural = new Intl.PluralRules(lang);
  const countForm = (n, one, few, many) => ({ one, few }[plural.select(n)] ?? many);
  const TEXT = window.localized({
    en: {
      paid: "{name} paid", notIn: "Not in this one",
      members: (people, bills) => `${people} people · ${bills} ${bills === 1 ? "bill" : "bills"}`,
      toGet: "to get back", youOwe: "you owe", settled: "all settled", owesYou: "Who owes you", youOweTitle: "You owe",
      eachOne: "Each one's balance", getsBack: "gets back", owes: "owes", even: "settled up",
      toSettle: "To settle up", total: "Group total", lodging: "Lodging", food: "Food", transport: "Transport",
      sheetTitle: "Split a bill", description: "Description", amount: "Amount", whoPaid: "Who paid",
      splitAmong: "Split equally among", each: "{value} each", cancel: "Cancel", save: "Save", close: "Close",
      queue: (n) => `${n} changes in the queue`,
      split: "How it was split", yourShare: "Your share", deleteBill: "Delete bill",
      recordPayment: "Record payment", record: "Record", viaMethod: "via transfer", payment: "Payment", deletePayment: "Delete payment",
      payLine: (from, to) => `${name(from)} paid ${name(to)}`,
      paidYou: (who, value) => `${who} paid you ${value}`,
      paidTotal: "Paid in total", shareTotal: "Share of the bills", balance: "Balance",
      bills: (n) => `${n} ${n === 1 ? "bill" : "bills"}`,
      titles: { b1: "Lagoa guesthouse", b2: "Dinner at Ribeirão", b3: "Ride to the beach", p1: "Ice cream on the beach", p2: "Weekly groceries", p3: "Parking" },
    },
    pt: {
      paid: "{name} pagou", notIn: "Fora desta",
      members: (people, bills) => `${people} pessoas · ${bills} ${bills === 1 ? "conta" : "contas"}`,
      toGet: "a receber", youOwe: "você deve", settled: "tudo acertado", owesYou: "Te devem", youOweTitle: "Você deve",
      eachOne: "Saldo de cada um", getsBack: "a receber", owes: "deve", even: "quite",
      toSettle: "Para acertar", total: "Total do grupo", lodging: "Hospedagem", food: "Comida", transport: "Transporte",
      sheetTitle: "Rachar conta", description: "Descrição", amount: "Valor", whoPaid: "Quem pagou",
      splitAmong: "Dividir igual entre", each: "{value} para cada", cancel: "Cancelar", save: "Salvar", close: "Fechar",
      queue: (n) => `${n} alterações na fila`,
      split: "Como foi dividida", yourShare: "Sua parte", deleteBill: "Excluir conta",
      recordPayment: "Registrar pagamento", record: "Registrar", viaMethod: "via Pix", payment: "Pagamento", deletePayment: "Excluir pagamento",
      payLine: (from, to) => `${name(from)} pagou ${name(to)}`,
      paidYou: (who, value) => `${who} te pagou ${value}`,
      paidTotal: "Pagou no total", shareTotal: "Parte nas contas", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "conta" : "contas"}`,
      titles: { b1: "Pousada na Lagoa", b2: "Jantar no Ribeirão", b3: "Uber para a praia", p1: "Sorvete na praia", p2: "Mercado da semana", p3: "Estacionamento" },
    },
    // Portugal's Portuguese: only what Portugal says differently, the rest is pt's.
    "pt-PT": {
      members: (people, bills) => `${people} pessoas · ${bills} ${bills === 1 ? "despesa" : "despesas"}`,
      youOwe: "deves", owesYou: "Devem-te", youOweTitle: "Deves", lodging: "Alojamento",
      sheetTitle: "Dividir despesa", splitAmong: "Dividir por igual entre", save: "Guardar",
      yourShare: "A tua parte", deleteBill: "Eliminar despesa",
      recordPayment: "Registar pagamento", record: "Registar", deletePayment: "Eliminar pagamento",
      paidYou: (who, value) => `${who} pagou-te ${value}`,
      shareTotal: "Parte nas despesas",
      bills: (n) => `${n} ${n === 1 ? "despesa" : "despesas"}`,
      titles: { b1: "Alojamento na Lagoa", p1: "Gelado na praia", p2: "Compras da semana" },
    },
    es: {
      paid: "Pagó {name}", notIn: "No participas",
      members: (people, bills) => `${people} personas · ${bills} ${bills === 1 ? "cuenta" : "cuentas"}`,
      toGet: "por cobrar", youOwe: "debes", settled: "todo saldado", owesYou: "Te deben", youOweTitle: "Debes",
      eachOne: "Saldo de cada uno", getsBack: "por cobrar", owes: "debe", even: "al día",
      toSettle: "Para saldar", total: "Total del grupo", lodging: "Alojamiento", food: "Comida", transport: "Transporte",
      sheetTitle: "Dividir cuenta", description: "Descripción", amount: "Monto", whoPaid: "Quién pagó",
      splitAmong: "Dividir igual entre", each: "{value} para cada uno", cancel: "Cancelar", save: "Guardar", close: "Cerrar",
      queue: (n) => `${n} cambios en la cola`,
      split: "Cómo se dividió", yourShare: "Tu parte", deleteBill: "Eliminar cuenta",
      recordPayment: "Registrar pago", record: "Registrar", viaMethod: "por transferencia", payment: "Pago", deletePayment: "Eliminar pago",
      payLine: (from, to) => `${name(from)} le pagó a ${name(to)}`,
      paidYou: (who, value) => `${who} te pagó ${value}`,
      paidTotal: "Pagó en total", shareTotal: "Su parte en las cuentas", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "cuenta" : "cuentas"}`,
      titles: { b1: "Posada en la Lagoa", b2: "Cena en Ribeirão", b3: "Uber a la playa", p1: "Helado en la playa", p2: "Súper de la semana", p3: "Estacionamiento" },
    },
    fr: {
      paid: "{name} a payé", notIn: "Pas dans celle-ci",
      members: (people, bills) => `${people} personnes · ${bills} ${bills === 1 ? "dépense" : "dépenses"}`,
      toGet: "à récupérer", youOwe: "vous devez", settled: "tout est réglé", owesYou: "Ils vous doivent", youOweTitle: "Vous devez",
      eachOne: "Solde de chacun", getsBack: "à récupérer", owes: "doit", even: "quitte",
      toSettle: "À régler", total: "Total du groupe", lodging: "Hébergement", food: "Repas", transport: "Transport",
      sheetTitle: "Partager une dépense", description: "Description", amount: "Montant", whoPaid: "Qui a payé",
      splitAmong: "Partager à parts égales entre", each: "{value} chacun", cancel: "Annuler", save: "Enregistrer", close: "Fermer",
      queue: (n) => `${n} modifications en attente`,
      split: "Comment elle a été partagée", yourShare: "Votre part", deleteBill: "Supprimer la dépense",
      recordPayment: "Enregistrer un paiement", record: "Enregistrer", viaMethod: "par virement", payment: "Paiement", deletePayment: "Supprimer le paiement",
      payLine: (from, to) => `${name(from)} a payé ${name(to)}`,
      paidYou: (who, value) => `${who} vous a payé ${value}`,
      paidTotal: "Payé au total", shareTotal: "Part dans les dépenses", balance: "Solde",
      bills: (n) => `${n} ${n === 1 ? "dépense" : "dépenses"}`,
      titles: { b1: "Auberge de la Lagoa", b2: "Dîner à Ribeirão", b3: "Trajet jusqu'à la plage", p1: "Glace sur la plage", p2: "Courses de la semaine", p3: "Parking" },
    },
    de: {
      paid: "{name} hat bezahlt", notIn: "Nicht dabei",
      members: (people, bills) => `${people} Personen · ${bills} ${bills === 1 ? "Ausgabe" : "Ausgaben"}`,
      toGet: "zu bekommen", youOwe: "du schuldest", settled: "alles ausgeglichen", owesYou: "Du bekommst", youOweTitle: "Du schuldest",
      eachOne: "Saldo jeder Person", getsBack: "bekommt", owes: "schuldet", even: "ausgeglichen",
      toSettle: "Zu begleichen", total: "Summe der Gruppe", lodging: "Unterkunft", food: "Essen", transport: "Transport",
      sheetTitle: "Ausgabe aufteilen", description: "Beschreibung", amount: "Betrag", whoPaid: "Wer hat bezahlt",
      splitAmong: "Gleichmäßig aufteilen auf", each: "{value} pro Person", cancel: "Abbrechen", save: "Speichern", close: "Schließen",
      queue: (n) => `${n} ${n === 1 ? "Änderung" : "Änderungen"} in der Warteschlange`,
      split: "So wurde aufgeteilt", yourShare: "Dein Anteil", deleteBill: "Ausgabe löschen",
      recordPayment: "Zahlung erfassen", record: "Erfassen", viaMethod: "per Überweisung", payment: "Zahlung", deletePayment: "Zahlung löschen",
      payLine: (from, to) => `${name(from)} hat ${name(to)} bezahlt`,
      paidYou: (who, value) => `${who} hat dir ${value} gezahlt`,
      paidTotal: "Insgesamt bezahlt", shareTotal: "Anteil an den Ausgaben", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "Ausgabe" : "Ausgaben"}`,
      titles: { b1: "Pension in Lagoa", b2: "Abendessen in Ribeirão", b3: "Fahrt zum Strand", p1: "Eis am Strand", p2: "Wocheneinkauf", p3: "Parken" },
    },
    it: {
      paid: "{name} ha pagato", notIn: "Non partecipi",
      members: (people, bills) => `${people} persone · ${bills} ${bills === 1 ? "spesa" : "spese"}`,
      toGet: "da ricevere", youOwe: "devi", settled: "tutto in pari", owesYou: "Ti devono", youOweTitle: "Devi",
      eachOne: "Saldo di ciascuno", getsBack: "da ricevere", owes: "deve", even: "in pari",
      toSettle: "Da saldare", total: "Totale del gruppo", lodging: "Alloggio", food: "Cibo", transport: "Trasporti",
      sheetTitle: "Dividi una spesa", description: "Descrizione", amount: "Importo", whoPaid: "Chi ha pagato",
      splitAmong: "Dividi in parti uguali tra", each: "{value} a testa", cancel: "Annulla", save: "Salva", close: "Chiudi",
      queue: (n) => `${n} ${n === 1 ? "modifica" : "modifiche"} in coda`,
      split: "Come è stata divisa", yourShare: "La tua parte", deleteBill: "Elimina spesa",
      recordPayment: "Registra pagamento", record: "Registra", viaMethod: "con bonifico", payment: "Pagamento", deletePayment: "Elimina pagamento",
      payLine: (from, to) => `${name(from)} ha pagato ${name(to)}`,
      paidYou: (who, value) => `${who} ti ha pagato ${value}`,
      paidTotal: "Pagato in totale", shareTotal: "Quota delle spese", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "spesa" : "spese"}`,
      titles: { b1: "Pensione a Lagoa", b2: "Cena a Ribeirão", b3: "Corsa fino alla spiaggia", p1: "Gelato in spiaggia", p2: "Spesa della settimana", p3: "Parcheggio" },
    },
    pl: {
      paid: "{name} zapłacił(a)", notIn: "Bez ciebie",
      members: (people, bills) => `${people} ${countForm(people, "osoba", "osoby", "osób")} · ${bills} ${countForm(bills, "wydatek", "wydatki", "wydatków")}`,
      toGet: "do odzyskania", youOwe: "do oddania", settled: "wszystko rozliczone", owesYou: "Do odzyskania", youOweTitle: "Do oddania",
      eachOne: "Saldo każdej osoby", getsBack: "do odzyskania", owes: "do oddania", even: "na czysto",
      toSettle: "Do rozliczenia", total: "Suma w grupie", lodging: "Nocleg", food: "Jedzenie", transport: "Transport",
      sheetTitle: "Podziel wydatek", description: "Opis", amount: "Kwota", whoPaid: "Kto zapłacił",
      splitAmong: "Podziel po równo między", each: "{value} na osobę", cancel: "Anuluj", save: "Zapisz", close: "Zamknij",
      queue: (n) => `${n} ${countForm(n, "zmiana", "zmiany", "zmian")} w kolejce`,
      split: "Jak podzielono", yourShare: "Twoja część", deleteBill: "Usuń wydatek",
      recordPayment: "Zapisz płatność", record: "Zapisz", viaMethod: "przelewem", payment: "Płatność", deletePayment: "Usuń płatność",
      // A name is never declined: who paid whom as an arrow, as the Balances tab writes it.
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} zapłacił(a) ci ${value}`,
      paidTotal: "Zapłacono łącznie", shareTotal: "Udział w wydatkach", balance: "Saldo",
      bills: (n) => `${n} ${countForm(n, "wydatek", "wydatki", "wydatków")}`,
      titles: { b1: "Pensjonat w Lagoa", b2: "Kolacja w Ribeirão", b3: "Przejazd na plażę", p1: "Lody na plaży", p2: "Zakupy na tydzień", p3: "Parking" },
    },
    nl: {
      paid: "{name} betaalde", notIn: "Doet niet mee",
      members: (people, bills) => `${people} personen · ${bills} ${bills === 1 ? "uitgave" : "uitgaven"}`,
      toGet: "te ontvangen", youOwe: "te betalen", settled: "alles verrekend", owesYou: "Wie jou iets schuldig is", youOweTitle: "Jij moet betalen",
      eachOne: "Saldo per persoon", getsBack: "krijgt terug", owes: "moet betalen", even: "quitte",
      toSettle: "Te verrekenen", total: "Totaal van de groep", lodging: "Verblijf", food: "Eten", transport: "Vervoer",
      sheetTitle: "Rekening delen", description: "Omschrijving", amount: "Bedrag", whoPaid: "Wie betaalde",
      splitAmong: "Gelijk verdelen over", each: "{value} per persoon", cancel: "Annuleren", save: "Opslaan", close: "Sluiten",
      queue: (n) => `${n} ${n === 1 ? "wijziging" : "wijzigingen"} in de wachtrij`,
      split: "Zo is het verdeeld", yourShare: "Jouw deel", deleteBill: "Uitgave verwijderen",
      recordPayment: "Betaling vastleggen", record: "Vastleggen", viaMethod: "via overboeking", payment: "Betaling", deletePayment: "Betaling verwijderen",
      payLine: (from, to) => `${name(from)} betaalde ${name(to)}`,
      paidYou: (who, value) => `${who} heeft je ${value} betaald`,
      paidTotal: "Totaal betaald", shareTotal: "Aandeel in de uitgaven", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "uitgave" : "uitgaven"}`,
      titles: { b1: "Pension in Lagoa", b2: "Diner in Ribeirão", b3: "Rit naar het strand", p1: "IJsje op het strand", p2: "Boodschappen voor de week", p3: "Parkeren" },
    },
    // Turkish: a noun after a number stays singular, and a name takes no case ending here (who paid whom as an arrow,
    // as the Balances tab writes it), so no name needs its vowel harmony worked out.
    tr: {
      paid: "{name} ödedi", notIn: "Bu masrafta yok",
      members: (people, bills) => `${people} kişi · ${bills} masraf`,
      toGet: "alacak", youOwe: "borç", settled: "hesap kapandı", owesYou: "Sana borçlu olanlar", youOweTitle: "Borçların",
      eachOne: "Herkesin bakiyesi", getsBack: "alacaklı", owes: "borçlu", even: "ödeşti",
      toSettle: "Ödeşmek için", total: "Grup toplamı", lodging: "Konaklama", food: "Yemek", transport: "Ulaşım",
      sheetTitle: "Masraf böl", description: "Açıklama", amount: "Tutar", whoPaid: "Kim ödedi",
      splitAmong: "Eşit bölünecek kişiler", each: "Kişi başı {value}", cancel: "İptal", save: "Kaydet", close: "Kapat",
      queue: (n) => `Kuyrukta ${n} değişiklik`,
      split: "Nasıl bölündü", yourShare: "Senin payın", deleteBill: "Masrafı sil",
      recordPayment: "Ödeme kaydet", record: "Kaydet", viaMethod: "havale ile", payment: "Ödeme", deletePayment: "Ödemeyi sil",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} sana ${value} ödedi`,
      paidTotal: "Toplam ödenen", shareTotal: "Masraflardaki payı", balance: "Bakiye",
      bills: (n) => `${n} masraf`,
      titles: { b1: "Lagoa'daki pansiyon", b2: "Ribeirão'da akşam yemeği", b3: "Plaja ulaşım", p1: "Plajda dondurma", p2: "Haftalık market alışverişi", p3: "Otopark" },
    },
    id: {
      paid: "{name} bayar", notIn: "Tidak ikut",
      members: (people, bills) => `${people} orang · ${bills} tagihan`,
      toGet: "akan diterima", youOwe: "harus dibayar", settled: "semua lunas", owesYou: "Yang berutang padamu", youOweTitle: "Utangmu",
      eachOne: "Saldo tiap orang", getsBack: "akan menerima", owes: "berutang", even: "lunas",
      toSettle: "Untuk pelunasan", total: "Total grup", lodging: "Penginapan", food: "Makanan", transport: "Transportasi",
      sheetTitle: "Bagi tagihan", description: "Deskripsi", amount: "Nominal", whoPaid: "Siapa yang bayar",
      splitAmong: "Bagi rata ke", each: "{value} per orang", cancel: "Batal", save: "Simpan", close: "Tutup",
      queue: (n) => `${n} perubahan dalam antrean`,
      split: "Cara dibaginya", yourShare: "Bagianmu", deleteBill: "Hapus tagihan",
      recordPayment: "Catat pembayaran", record: "Catat", viaMethod: "via transfer", payment: "Pembayaran", deletePayment: "Hapus pembayaran",
      payLine: (from, to) => `${name(from)} bayar ke ${name(to)}`,
      paidYou: (who, value) => `${who} membayarmu ${value}`,
      paidTotal: "Total dibayar", shareTotal: "Bagian dari tagihan", balance: "Saldo",
      bills: (n) => `${n} tagihan`,
      titles: { b1: "Penginapan di Lagoa", b2: "Makan malam di Ribeirão", b3: "Ongkos ke pantai", p1: "Es krim di pantai", p2: "Belanja mingguan", p3: "Parkir" },
    },
    ja: {
      paid: "{name}が支払い", notIn: "今回は対象外",
      members: (people, bills) => `${people}人 · 支出${bills}件`,
      toGet: "受け取り予定", youOwe: "支払い予定", settled: "精算済み", owesYou: "あなたに払う人", youOweTitle: "あなたが払う相手",
      eachOne: "各自の残高", getsBack: "受け取り", owes: "支払い", even: "精算済み",
      toSettle: "精算方法", total: "グループの合計", lodging: "宿泊", food: "食事", transport: "交通",
      sheetTitle: "割り勘する", description: "内容", amount: "金額", whoPaid: "支払った人",
      splitAmong: "均等に分ける人", each: "1人{value}", cancel: "キャンセル", save: "保存", close: "閉じる",
      queue: (n) => `${n}件の変更が送信待ち`,
      split: "分け方", yourShare: "あなたの負担分", deleteBill: "支出を削除",
      recordPayment: "支払いを記録", record: "記録", viaMethod: "振込で", payment: "支払い", deletePayment: "支払いを削除",
      payLine: (from, to) => `${name(from)}が${name(to)}に支払い`,
      paidYou: (who, value) => `${who}が${value}を支払い`,
      paidTotal: "支払い合計", shareTotal: "支出の負担分", balance: "残高",
      bills: (n) => `支出${n}件`,
      titles: { b1: "ラゴアのゲストハウス", b2: "リベイロンでの夕食", b3: "ビーチまでの移動", p1: "ビーチでアイス", p2: "1週間分の食料品", p3: "駐車場" },
    },
    // Russian and Ukrainian: a name is never declined (who paid whom as an arrow, as the Balances tab writes it), and a
    // past tense about anyone writes both endings.
    ru: {
      paid: "{name} оплатил(а)", notIn: "Не участвует",
      members: (people, bills) => `${people} ${countForm(people, "человек", "человека", "человек")} · ${bills} ${countForm(bills, "расход", "расхода", "расходов")}`,
      toGet: "к получению", youOwe: "ты должен(-на)", settled: "всё оплачено", owesYou: "Тебе должны", youOweTitle: "Ты должен(-на)",
      eachOne: "Баланс каждого", getsBack: "получит", owes: "должен(-на)", even: "без долгов",
      toSettle: "Чтобы рассчитаться", total: "Всего в группе", lodging: "Жильё", food: "Еда", transport: "Транспорт",
      sheetTitle: "Разделить счёт", description: "Описание", amount: "Сумма", whoPaid: "Кто платил",
      splitAmong: "Разделить поровну между", each: "{value} с каждого", cancel: "Отмена", save: "Сохранить", close: "Закрыть",
      queue: (n) => `${n} ${countForm(n, "изменение", "изменения", "изменений")} в очереди`,
      split: "Как разделено", yourShare: "Твоя доля", deleteBill: "Удалить расход",
      recordPayment: "Записать платёж", record: "Записать", viaMethod: "переводом", payment: "Платёж", deletePayment: "Удалить платёж",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} заплатил(а) тебе ${value}`,
      paidTotal: "Заплачено всего", shareTotal: "Доля в расходах", balance: "Баланс",
      bills: (n) => `${n} ${countForm(n, "расход", "расхода", "расходов")}`,
      titles: { b1: "Гостевой дом в Лагоа", b2: "Ужин в Рибейране", b3: "Дорога на пляж", p1: "Мороженое на пляже", p2: "Продукты на неделю", p3: "Парковка" },
    },
    uk: {
      paid: "{name} сплатив(-ла)", notIn: "Не бере участі",
      members: (people, bills) => `${people} ${countForm(people, "людина", "людини", "людей")} · ${bills} ${countForm(bills, "витрата", "витрати", "витрат")}`,
      toGet: "до отримання", youOwe: "ти винен(-на)", settled: "усе сплачено", owesYou: "Тобі винні", youOweTitle: "Ти винен(-на)",
      eachOne: "Баланс кожного", getsBack: "отримає", owes: "винен(-на)", even: "без боргів",
      toSettle: "Щоб розрахуватися", total: "Усього в групі", lodging: "Житло", food: "Їжа", transport: "Транспорт",
      sheetTitle: "Розділити рахунок", description: "Опис", amount: "Сума", whoPaid: "Хто платив",
      splitAmong: "Розділити порівну між", each: "{value} з кожного", cancel: "Скасувати", save: "Зберегти", close: "Закрити",
      queue: (n) => `${n} ${countForm(n, "зміна", "зміни", "змін")} у черзі`,
      split: "Як розділено", yourShare: "Твоя частка", deleteBill: "Видалити витрату",
      recordPayment: "Записати платіж", record: "Записати", viaMethod: "переказом", payment: "Платіж", deletePayment: "Видалити платіж",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} заплатив(-ла) тобі ${value}`,
      paidTotal: "Сплачено загалом", shareTotal: "Частка у витратах", balance: "Баланс",
      bills: (n) => `${n} ${countForm(n, "витрата", "витрати", "витрат")}`,
      titles: { b1: "Гостьовий будинок у Лагоа", b2: "Вечеря в Рібейрані", b3: "Дорога на пляж", p1: "Морозиво на пляжі", p2: "Продукти на тиждень", p3: "Паркування" },
    },
    // Korean: a particle follows the sound of the word before it, so it never follows a name or an amount filled in
    // here: a name takes " 님" before one, or stands in a label ("결제: Ana"), as the app writes them.
    ko: {
      paid: "결제: {name}", notIn: "이번엔 제외",
      members: (people, bills) => `${people}명 · 지출 ${bills}건`,
      toGet: "받을 돈", youOwe: "줄 돈", settled: "정산 완료", owesYou: "받을 돈", youOweTitle: "줄 돈",
      eachOne: "각자의 잔액", getsBack: "받을 돈", owes: "줄 돈", even: "정산 완료",
      toSettle: "정산하기", total: "그룹 합계", lodging: "숙소", food: "식비", transport: "교통",
      sheetTitle: "지출 나누기", description: "설명", amount: "금액", whoPaid: "낸 사람",
      splitAmong: "똑같이 나눌 사람", each: "1인당 {value}", cancel: "취소", save: "저장", close: "닫기",
      queue: (n) => `변경 사항 ${n}건 전송 대기`,
      split: "분담", yourShare: "내 몫", deleteBill: "지출 삭제",
      recordPayment: "송금 기록", record: "기록", viaMethod: "계좌 이체", payment: "송금", deletePayment: "송금 삭제",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} 님이 나에게 ${value} 송금했어요`,
      paidTotal: "낸 금액 합계", shareTotal: "지출 중 내 몫", balance: "잔액",
      bills: (n) => `지출 ${n}건`,
      titles: { b1: "라고아 게스트하우스", b2: "히베이랑 저녁 식사", b3: "해변까지 교통비", p1: "해변 아이스크림", p2: "일주일 장보기", p3: "주차" },
    },
    // Arabic: the app never knows anyone's gender, so a count, a payer or a payment is a label ("الدافع: Ana") or a
    // verbal noun, never a conjugated verb, as the app writes them.
    ar: {
      paid: "الدافع: {name}", notIn: "غير مشارك",
      members: (people, bills) => `الأشخاص: ${people} · الفواتير: ${bills}`,
      toGet: "لك", youOwe: "عليك", settled: "تمت التسوية بالكامل", owesYou: "المستحق لك", youOweTitle: "المستحق عليك",
      eachOne: "رصيد كل شخص", getsBack: "دائن", owes: "مدين", even: "تمت التسوية",
      toSettle: "للتسوية", total: "إجمالي المجموعة", lodging: "الإقامة", food: "الطعام", transport: "المواصلات",
      sheetTitle: "تقسيم فاتورة", description: "الوصف", amount: "المبلغ", whoPaid: "الدافع",
      splitAmong: "التقسيم بالتساوي بين", each: "{value} لكل شخص", cancel: "إلغاء", save: "حفظ", close: "إغلاق",
      queue: (n) => `التغييرات في قائمة الانتظار: ${n}`,
      split: "طريقة التقسيم", yourShare: "حصتك", deleteBill: "حذف الفاتورة",
      recordPayment: "تسجيل دفعة", record: "تسجيل", viaMethod: "عبر تحويل", payment: "دفعة", deletePayment: "حذف الدفعة",
      // Why "→": the names are Latin, so the line runs left to right even in a right-to-left page, as the Balances tab's does.
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who}: دفعة ${value} إليك`,
      paidTotal: "إجمالي المدفوع", shareTotal: "الحصة من الفواتير", balance: "الرصيد",
      bills: (n) => `الفواتير: ${n}`,
      titles: { b1: "نُزل لاغوا", b2: "عشاء في ريبيراو", b3: "مشوار إلى الشاطئ", p1: "آيس كريم على الشاطئ", p2: "مشتريات الأسبوع", p3: "موقف السيارات" },
    },
    hi: {
      paid: "{name} ने भुगतान किया", notIn: "इसमें शामिल नहीं",
      members: (people, bills) => `${people} ${people === 1 ? "व्यक्ति" : "लोग"} · ${bills} खर्च`,
      toGet: "वापस मिलने हैं", youOwe: "आपको देने हैं", settled: "हिसाब बराबर", owesYou: "आपको किससे लेने हैं", youOweTitle: "आपको किसे देने हैं",
      eachOne: "हर एक का बैलेंस", getsBack: "वापस मिलेंगे", owes: "देने हैं", even: "हिसाब बराबर",
      toSettle: "हिसाब चुकाने के लिए", total: "ग्रुप का कुल", lodging: "ठहरना", food: "खाना", transport: "परिवहन",
      sheetTitle: "खर्च बांटें", description: "विवरण", amount: "रकम", whoPaid: "किसने भुगतान किया",
      splitAmong: "इनमें बराबर बांटें", each: "हर एक {value}", cancel: "रद्द करें", save: "सहेजें", close: "बंद करें",
      queue: (n) => `कतार में ${n} बदलाव`,
      split: "कैसे बांटा गया", yourShare: "आपका हिस्सा", deleteBill: "खर्च हटाएं",
      recordPayment: "भुगतान दर्ज करें", record: "दर्ज करें", viaMethod: "ट्रांसफ़र से", payment: "भुगतान", deletePayment: "भुगतान हटाएं",
      payLine: (from, to) => `${name(from)} ने ${name(to)} को भुगतान किया`,
      paidYou: (who, value) => `${who} ने आपको ${value} का भुगतान किया`,
      paidTotal: "कुल भुगतान", shareTotal: "खर्चों में हिस्सा", balance: "बैलेंस",
      bills: (n) => `${n} खर्च`,
      titles: { b1: "लागोआ गेस्टहाउस", b2: "रिबेराओ में डिनर", b3: "बीच तक का सफ़र", p1: "बीच पर आइसक्रीम", p2: "हफ़्ते भर का राशन", p3: "पार्किंग" },
    },
    // Simplified Chinese: one form for counts, and no space between Chinese and a name or a number ("Pedro支付", "4人").
    zh: {
      paid: "{name}支付", notIn: "不参与",
      members: (people, bills) => `${people}人 · ${bills}笔账单`,
      toGet: "应收", youOwe: "应付", settled: "已结清", owesYou: "谁欠你", youOweTitle: "你欠谁",
      eachOne: "每人的余额", getsBack: "应收", owes: "应付", even: "已结清",
      toSettle: "如何结清", total: "群组总计", lodging: "住宿", food: "餐饮", transport: "交通",
      sheetTitle: "分摊账单", description: "描述", amount: "金额", whoPaid: "谁付的",
      splitAmong: "平均分摊给", each: "每人{value}", cancel: "取消", save: "保存", close: "关闭",
      queue: (n) => `${n}项更改排队中`,
      split: "怎么分摊的", yourShare: "你的份额", deleteBill: "删除账单",
      recordPayment: "记录付款", record: "记录", viaMethod: "通过转账", payment: "付款", deletePayment: "删除付款",
      payLine: (from, to) => `${name(from)}付给${name(to)}`,
      paidYou: (who, value) => `${who}付给你${value}`,
      paidTotal: "共支付", shareTotal: "账单中的份额", balance: "余额",
      bills: (n) => `${n}笔账单`,
      titles: { b1: "拉戈阿民宿", b2: "里贝朗晚餐", b3: "去海滩的车费", p1: "海滩上的冰淇淋", p2: "一周的采购", p3: "停车费" },
    },
    // Hebrew: the app never knows anyone's gender, so a payer or a payment is a label ("שולם על ידי: Ana") or an action
    // noun, never a conjugated verb; one bill is "חשבון אחד", two or more the plural, as the app counts them.
    he: {
      paid: "שולם על ידי: {name}", notIn: "לא בחשבון הזה",
      members: (people, bills) => `${people} אנשים · ${bills === 1 ? "חשבון אחד" : `${bills} חשבונות`}`,
      toGet: "מגיע לך", youOwe: "חוב שלך", settled: "הכול סגור", owesYou: "ממי מגיע לך", youOweTitle: "למי מגיע ממך",
      eachOne: "היתרה של כל אחד", getsBack: "לקבל", owes: "חוב", even: "החשבון נסגר",
      toSettle: "לסגירת החשבון", total: "סה״כ בקבוצה", lodging: "לינה", food: "אוכל", transport: "תחבורה",
      sheetTitle: "פיצול חשבון", description: "תיאור", amount: "סכום", whoPaid: "שולם על ידי",
      splitAmong: "חלוקה שווה בשווה בין", each: "{value} לכל אחד", cancel: "ביטול", save: "שמירה", close: "סגירה",
      queue: (n) => (n === 1 ? "שינוי אחד בתור" : `${n} שינויים בתור`),
      split: "איך זה חולק", yourShare: "החלק שלך", deleteBill: "מחיקת החשבון",
      recordPayment: "רישום תשלום", record: "רישום", viaMethod: "בהעברה", payment: "תשלום", deletePayment: "מחיקת התשלום",
      // Why "→": the names are Latin, so the line runs left to right even in a right-to-left page, as Arabic's does.
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who}: תשלום של ${value} אליך`,
      paidTotal: "סה״כ ששולם", shareTotal: "החלק בחשבונות", balance: "יתרה",
      bills: (n) => (n === 1 ? "חשבון אחד" : `${n} חשבונות`),
      titles: { b1: "אכסניה בלגואה", b2: "ארוחת ערב בריבייראו", b3: "נסיעה לחוף", p1: "גלידה בחוף", p2: "קניות השבוע", p3: "חניה" },
    },
    // Thai: one form for counts, a space around a name or a number ("Pedro จ่าย", "4 คน"), no full stop.
    th: {
      paid: "{name} จ่าย", notIn: "ไม่ได้อยู่ในบิลนี้",
      members: (people, bills) => `${people} คน · ${bills} บิล`,
      toGet: "ได้คืน", youOwe: "คุณค้าง", settled: "เคลียร์แล้ว", owesYou: "ใครค้างคุณ", youOweTitle: "คุณค้างใคร",
      eachOne: "ยอดคงเหลือของแต่ละคน", getsBack: "ได้คืน", owes: "ค้าง", even: "เคลียร์แล้ว",
      toSettle: "วิธีเคลียร์ยอด", total: "ยอดรวมของกลุ่ม", lodging: "ที่พัก", food: "อาหาร", transport: "การเดินทาง",
      sheetTitle: "หารบิล", description: "คำอธิบาย", amount: "จำนวนเงิน", whoPaid: "ใครจ่าย",
      splitAmong: "หารเท่ากันระหว่าง", each: "คนละ {value}", cancel: "ยกเลิก", save: "บันทึก", close: "ปิด",
      queue: (n) => `${n} การเปลี่ยนแปลงอยู่ในคิว`,
      split: "หารอย่างไร", yourShare: "ส่วนของคุณ", deleteBill: "ลบบิล",
      recordPayment: "บันทึกการจ่ายเงิน", record: "บันทึก", viaMethod: "ผ่านการโอนเงิน", payment: "การจ่ายเงิน", deletePayment: "ลบการจ่ายเงิน",
      payLine: (from, to) => `${name(from)} จ่ายให้ ${name(to)}`,
      paidYou: (who, value) => `${who} จ่ายให้คุณ ${value}`,
      paidTotal: "จ่ายไปทั้งหมด", shareTotal: "ส่วนในบิล", balance: "ยอดคงเหลือ",
      bills: (n) => `${n} บิล`,
      titles: { b1: "เกสต์เฮาส์ที่ลากอา", b2: "มื้อเย็นที่ริเบเรา", b3: "ค่ารถไปชายหาด", p1: "ไอศกรีมที่ชายหาด", p2: "ของใช้ประจำสัปดาห์", p3: "ที่จอดรถ" },
    },
    // Vietnamese: one form for counts, "bạn" for the user, and the app's words (khoản chi, số dư, thanh toán).
    vi: {
      paid: "{name} đã trả", notIn: "Không tham gia khoản này",
      members: (people, bills) => `${people} người · ${bills} khoản chi`,
      toGet: "được nhận lại", youOwe: "bạn nợ", settled: "đã thanh toán xong", owesYou: "Ai nợ bạn", youOweTitle: "Bạn nợ",
      eachOne: "Số dư của mỗi người", getsBack: "được nhận lại", owes: "nợ", even: "đã thanh toán xong",
      toSettle: "Cần thanh toán", total: "Tổng của nhóm", lodging: "Chỗ ở", food: "Ăn uống", transport: "Đi lại",
      sheetTitle: "Chia khoản chi", description: "Mô tả", amount: "Số tiền", whoPaid: "Ai đã trả",
      splitAmong: "Chia đều cho", each: "mỗi người {value}", cancel: "Hủy", save: "Lưu", close: "Đóng",
      queue: (n) => `${n} thay đổi đang chờ`,
      split: "Cách chia", yourShare: "Phần của bạn", deleteBill: "Xóa khoản chi",
      recordPayment: "Ghi nhận thanh toán", record: "Ghi nhận", viaMethod: "qua chuyển khoản", payment: "Khoản thanh toán", deletePayment: "Xóa khoản thanh toán",
      payLine: (from, to) => `${name(from)} đã trả ${name(to)}`,
      paidYou: (who, value) => `${who} đã trả bạn ${value}`,
      paidTotal: "Tổng đã trả", shareTotal: "Phần trong các khoản chi", balance: "Số dư",
      bills: (n) => `${n} khoản chi`,
      titles: { b1: "Nhà nghỉ ở Lagoa", b2: "Bữa tối ở Ribeirão", b3: "Xe ra biển", p1: "Kem trên bãi biển", p2: "Đi chợ trong tuần", p3: "Gửi xe" },
    },
    // Traditional Chinese, Taiwan's: one form for counts, no space between Chinese and a name or a number ("Pedro支付",
    // "4人"), and the app's words (帳單, 餘額, 結清).
    "zh-Hant": {
      paid: "{name}支付", notIn: "不參與這筆",
      members: (people, bills) => `${people}人 · ${bills}筆帳單`,
      toGet: "應收", youOwe: "你欠", settled: "已結清", owesYou: "誰欠你", youOweTitle: "你欠誰",
      eachOne: "每個人的餘額", getsBack: "應收", owes: "應付", even: "已結清",
      toSettle: "如何結清", total: "群組總計", lodging: "住宿", food: "餐飲", transport: "交通",
      sheetTitle: "分攤帳單", description: "描述", amount: "金額", whoPaid: "付款人",
      splitAmong: "平均分攤給", each: "每人{value}", cancel: "取消", save: "儲存", close: "關閉",
      queue: (n) => `${n}項變更排隊中`,
      split: "怎麼分攤的", yourShare: "你的份額", deleteBill: "刪除帳單",
      recordPayment: "記錄付款", record: "記錄", viaMethod: "透過轉帳", payment: "付款", deletePayment: "刪除付款",
      payLine: (from, to) => `${name(from)}付給${name(to)}`,
      paidYou: (who, value) => `${who}付給你${value}`,
      paidTotal: "總共支付", shareTotal: "帳單中的份額", balance: "餘額",
      bills: (n) => `${n}筆帳單`,
      titles: { b1: "拉戈阿民宿", b2: "里貝朗晚餐", b3: "去海灘的車資", p1: "海灘上的冰淇淋", p2: "一週的採買", p3: "停車費" },
    },
    // Swedish: "du" for the user, and the app's words (utgift, saldo, gör upp, registrera betalning).
    sv: {
      paid: "{name} betalade", notIn: "Inte med i den här",
      members: (people, bills) => `${people} personer · ${bills} ${bills === 1 ? "utgift" : "utgifter"}`,
      toGet: "att få tillbaka", youOwe: "du är skyldig", settled: "allt uppgjort", owesYou: "Skyldiga dig", youOweTitle: "Du är skyldig",
      eachOne: "Var och ens saldo", getsBack: "får tillbaka", owes: "är skyldig", even: "uppgjort",
      toSettle: "Att göra upp", total: "Gruppens total", lodging: "Boende", food: "Mat", transport: "Transport",
      sheetTitle: "Dela upp en utgift", description: "Beskrivning", amount: "Belopp", whoPaid: "Vem betalade",
      splitAmong: "Dela lika mellan", each: "{value} var", cancel: "Avbryt", save: "Spara", close: "Stäng",
      queue: (n) => `${n} ${n === 1 ? "ändring" : "ändringar"} i kön`,
      split: "Hur det delades", yourShare: "Din andel", deleteBill: "Radera utgift",
      recordPayment: "Registrera betalning", record: "Registrera", viaMethod: "via överföring", payment: "Betalning", deletePayment: "Radera betalning",
      payLine: (from, to) => `${name(from)} betalade ${name(to)}`,
      paidYou: (who, value) => `${who} betalade dig ${value}`,
      paidTotal: "Betalt totalt", shareTotal: "Andel av utgifterna", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "utgift" : "utgifter"}`,
      titles: { b1: "Pensionat i Lagoa", b2: "Middag i Ribeirão", b3: "Skjuts till stranden", p1: "Glass på stranden", p2: "Veckans matinköp", p3: "Parkering" },
    },
    // Czech: "ty" for the user, counts in one, few and other forms (1 výdaj, 2 výdaje, 5 výdajů), and a name never
    // declined: who paid whom as an arrow, as the Balances tab writes it.
    cs: {
      paid: "{name} zaplatil(a)", notIn: "Není v tomto výdaji",
      members: (people, bills) => `${people} ${countForm(people, "člověk", "lidé", "lidí")} · ${bills} ${countForm(bills, "výdaj", "výdaje", "výdajů")}`,
      toGet: "dostaneš zpět", youOwe: "dlužíš", settled: "vše vyrovnáno", owesYou: "Dluží ti", youOweTitle: "Dlužíš",
      eachOne: "Zůstatek každého", getsBack: "dostane zpět", owes: "dluží", even: "vyrovnáno",
      toSettle: "K vyrovnání", total: "Celkem ve skupině", lodging: "Ubytování", food: "Jídlo", transport: "Doprava",
      sheetTitle: "Rozdělit výdaj", description: "Popis", amount: "Částka", whoPaid: "Kdo platil",
      splitAmong: "Rozdělit rovným dílem mezi", each: "{value} na osobu", cancel: "Zrušit", save: "Uložit", close: "Zavřít",
      queue: (n) => `${n} ${countForm(n, "změna", "změny", "změn")} ve frontě`,
      split: "Jak se dělilo", yourShare: "Tvůj podíl", deleteBill: "Smazat výdaj",
      recordPayment: "Zaznamenat platbu", record: "Zaznamenat", viaMethod: "převodem", payment: "Platba", deletePayment: "Smazat platbu",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} ti zaplatil(a) ${value}`,
      paidTotal: "Zaplaceno celkem", shareTotal: "Podíl na výdajích", balance: "Zůstatek",
      bills: (n) => `${n} ${countForm(n, "výdaj", "výdaje", "výdajů")}`,
      titles: { b1: "Penzion v Lagoa", b2: "Večeře v Ribeirão", b3: "Odvoz na pláž", p1: "Zmrzlina na pláži", p2: "Týdenní nákup", p3: "Parkování" },
    },
    // Romanian: "tu" for the user, counts in one, few and other forms, other with "de" (20 de cheltuieli), and the
    // app's words (cheltuială, sold, achită, înregistrează plata).
    ro: {
      paid: "A plătit {name}", notIn: "Nu participă la aceasta",
      members: (people, bills) => `${people} ${countForm(people, "persoană", "persoane", "de persoane")} · ${bills} ${countForm(bills, "cheltuială", "cheltuieli", "de cheltuieli")}`,
      toGet: "de primit", youOwe: "datorezi", settled: "totul achitat", owesYou: "Îți datorează", youOweTitle: "Datorezi",
      eachOne: "Soldul fiecăruia", getsBack: "primește înapoi", owes: "datorează", even: "achitat",
      toSettle: "De achitat", total: "Totalul grupului", lodging: "Cazare", food: "Mâncare", transport: "Transport",
      sheetTitle: "Împarte o cheltuială", description: "Descriere", amount: "Sumă", whoPaid: "Cine a plătit",
      splitAmong: "Împărțit în mod egal între", each: "câte {value} fiecare", cancel: "Anulează", save: "Salvează", close: "Închide",
      queue: (n) => `${n} ${countForm(n, "modificare", "modificări", "de modificări")} în coadă`,
      split: "Cum s-a împărțit", yourShare: "Partea ta", deleteBill: "Șterge cheltuiala",
      recordPayment: "Înregistrează plata", record: "Înregistrează", viaMethod: "prin transfer", payment: "Plată", deletePayment: "Șterge plata",
      payLine: (from, to) => `${name(from)} i-a plătit lui ${name(to)}`,
      paidYou: (who, value) => `${who} ți-a plătit ${value}`,
      paidTotal: "Plătit în total", shareTotal: "Partea din cheltuieli", balance: "Sold",
      bills: (n) => `${n} ${countForm(n, "cheltuială", "cheltuieli", "de cheltuieli")}`,
      titles: { b1: "Pensiune în Lagoa", b2: "Cină în Ribeirão", b3: "Drum până la plajă", p1: "Înghețată pe plajă", p2: "Cumpărăturile săptămânii", p3: "Parcare" },
    },
    bn: {
      paid: "পরিশোধ করেছেন: {name}", notIn: "এতে নেই",
      members: (people, bills) => `${people} জন · ${bills}টি খরচ`,
      toGet: "ফেরত পাবেন", youOwe: "আপনি দেবেন", settled: "হিসাব মিটে গেছে", owesYou: "কার কাছে পাবেন", youOweTitle: "কাকে দেবেন",
      eachOne: "প্রত্যেকের ব্যালেন্স", getsBack: "ফেরত পাবেন", owes: "দেবেন", even: "হিসাব মিটে গেছে",
      toSettle: "যা মেটাতে হবে", total: "গ্রুপের মোট", lodging: "থাকা", food: "খাবার", transport: "যাতায়াত",
      sheetTitle: "খরচ ভাগ করুন", description: "বিবরণ", amount: "পরিমাণ", whoPaid: "কে পরিশোধ করেছেন",
      splitAmong: "সমানভাবে ভাগ হবে যাঁদের মধ্যে", each: "প্রত্যেকে {value}", cancel: "বাতিল করুন", save: "সেভ করুন", close: "বন্ধ করুন",
      queue: (n) => `${n}টি পরিবর্তন সারিতে আছে`,
      split: "কীভাবে ভাগ হয়েছে", yourShare: "আপনার অংশ", deleteBill: "খরচ মুছুন",
      recordPayment: "পেমেন্ট রেকর্ড করুন", record: "রেকর্ড করুন", viaMethod: "ট্রান্সফারে", payment: "পেমেন্ট", deletePayment: "পেমেন্ট মুছুন",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} আপনাকে ${value} পরিশোধ করেছেন`,
      paidTotal: "মোট পরিশোধ", shareTotal: "খরচে অংশ", balance: "ব্যালেন্স",
      bills: (n) => `${n}টি খরচ`,
      titles: { b1: "লাগোয়া গেস্টহাউস", b2: "রিবেইরাওতে রাতের খাবার", b3: "সৈকতে যাওয়ার ভাড়া", p1: "সৈকতে আইসক্রিম", p2: "সাপ্তাহিক বাজার", p3: "পার্কিং" },
    },
    ms: {
      paid: "Dibayar oleh {name}", notIn: "Tidak terlibat",
      members: (people, bills) => `${people} orang · ${bills} bil`,
      toGet: "akan diterima", youOwe: "anda berhutang", settled: "semua selesai", owesYou: "Siapa berhutang kepada anda", youOweTitle: "Anda berhutang",
      eachOne: "Baki setiap orang", getsBack: "akan menerima", owes: "berhutang", even: "selesai",
      toSettle: "Perlu diselesaikan", total: "Jumlah kumpulan", lodging: "Penginapan", food: "Makanan", transport: "Pengangkutan",
      sheetTitle: "Bahagikan bil", description: "Keterangan", amount: "Jumlah", whoPaid: "Pembayar",
      splitAmong: "Dibahagi sama rata antara", each: "{value} seorang", cancel: "Batal", save: "Simpan", close: "Tutup",
      queue: (n) => `${n} perubahan dalam baris gilir`,
      split: "Cara ia dibahagi", yourShare: "Bahagian anda", deleteBill: "Padam bil",
      recordPayment: "Rekod bayaran", record: "Rekod", viaMethod: "melalui pindahan", payment: "Bayaran", deletePayment: "Padam bayaran",
      payLine: (from, to) => `${name(from)} membayar ${name(to)}`,
      paidYou: (who, value) => `${who} membayar anda ${value}`,
      paidTotal: "Jumlah dibayar", shareTotal: "Bahagian dalam bil", balance: "Baki",
      bills: (n) => `${n} bil`,
      titles: { b1: "Rumah tumpangan Lagoa", b2: "Makan malam di Ribeirão", b3: "Perjalanan ke pantai", p1: "Aiskrim di pantai", p2: "Barang dapur mingguan", p3: "Letak kereta" },
    },
    el: {
      paid: "Πλήρωσε: {name}", notIn: "Δεν συμμετέχει εδώ",
      members: (people, bills) => `${people} ${people === 1 ? "άτομο" : "άτομα"} · ${bills} ${bills === 1 ? "έξοδο" : "έξοδα"}`,
      toGet: "θα πάρεις πίσω", youOwe: "χρωστάς", settled: "όλα εξοφλημένα", owesYou: "Ποιοι σου χρωστούν", youOweTitle: "Χρωστάς",
      eachOne: "Υπόλοιπο ανά άτομο", getsBack: "παίρνει πίσω", owes: "χρωστά", even: "χωρίς εκκρεμότητες",
      toSettle: "Προς εξόφληση", total: "Σύνολο ομάδας", lodging: "Διαμονή", food: "Φαγητό", transport: "Μετακινήσεις",
      sheetTitle: "Μοίρασε ένα έξοδο", description: "Περιγραφή", amount: "Ποσό", whoPaid: "Ποιος πλήρωσε",
      splitAmong: "Ισόποσα μεταξύ", each: "{value} ανά άτομο", cancel: "Άκυρο", save: "Αποθήκευση", close: "Κλείσιμο",
      queue: (n) => `${n} ${n === 1 ? "αλλαγή" : "αλλαγές"} στην ουρά`,
      split: "Πώς μοιράστηκε", yourShare: "Το μερίδιό σου", deleteBill: "Διαγραφή εξόδου",
      recordPayment: "Καταχώριση πληρωμής", record: "Καταχώριση", viaMethod: "μέσω μεταφοράς", payment: "Πληρωμή", deletePayment: "Διαγραφή πληρωμής",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `Σου πλήρωσε: ${who} · ${value}`,
      paidTotal: "Πληρωμές συνολικά", shareTotal: "Μερίδιο στα έξοδα", balance: "Υπόλοιπο",
      bills: (n) => `${n} ${n === 1 ? "έξοδο" : "έξοδα"}`,
      titles: { b1: "Ξενώνας στη Lagoa", b2: "Δείπνο στο Ribeirão", b3: "Διαδρομή ως την παραλία", p1: "Παγωτό στην παραλία", p2: "Ψώνια της εβδομάδας", p3: "Πάρκινγκ" },
    },
    hu: {
      paid: "Fizette: {name}", notIn: "Ebben nem vesz részt",
      members: (people, bills) => `${people} fő · ${bills} kiadás`,
      toGet: "visszajár", youOwe: "tartozol", settled: "minden rendezve", owesYou: "Ki tartozik neked", youOweTitle: "Tartozásaid",
      eachOne: "Mindenki egyenlege", getsBack: "visszakap", owes: "tartozik", even: "rendezve",
      toSettle: "Rendezendő", total: "Csoport összesen", lodging: "Szállás", food: "Étel", transport: "Közlekedés",
      sheetTitle: "Kiadás felosztása", description: "Leírás", amount: "Összeg", whoPaid: "Ki fizetett",
      splitAmong: "Egyenlő felosztás köztük", each: "{value} fejenként", cancel: "Mégse", save: "Mentés", close: "Bezárás",
      queue: (n) => `${n} módosítás a sorban`,
      split: "A felosztás módja", yourShare: "A te részed", deleteBill: "Kiadás törlése",
      recordPayment: "Fizetés rögzítése", record: "Rögzítés", viaMethod: "átutalással", payment: "Fizetés", deletePayment: "Fizetés törlése",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} fizetett neked: ${value}`,
      paidTotal: "Összesen fizetve", shareTotal: "Rész a kiadásokból", balance: "Egyenleg",
      bills: (n) => `${n} kiadás`,
      titles: { b1: "Szállás Lagoában", b2: "Vacsora Ribeirãoban", b3: "Út a strandra", p1: "Fagyi a strandon", p2: "Heti bevásárlás", p3: "Parkolás" },
    },
    fil: {
      paid: "Nagbayad: {name}", notIn: "Hindi kasali dito",
      members: (people, bills) => `${people} tao · ${bills} gastos`,
      toGet: "mababawi", youOwe: "utang mo", settled: "bayad na lahat", owesYou: "May utang sa iyo", youOweTitle: "Utang mo",
      eachOne: "Balanse ng bawat isa", getsBack: "may mababawi", owes: "may utang", even: "bayad na",
      toSettle: "Dapat bayaran", total: "Kabuuan ng grupo", lodging: "Tuluyan", food: "Pagkain", transport: "Transportasyon",
      sheetTitle: "Hatiin ang gastos", description: "Paglalarawan", amount: "Halaga", whoPaid: "Sino ang nagbayad",
      splitAmong: "Hatiin nang pantay sa", each: "{value} bawat isa", cancel: "Kanselahin", save: "I-save", close: "Isara",
      queue: (n) => `${n} pagbabago sa pila`,
      split: "Paano hinati", yourShare: "Bahagi mo", deleteBill: "Burahin ang gastos",
      recordPayment: "Itala ang bayad", record: "Itala", viaMethod: "gamit ang transfer", payment: "Bayad", deletePayment: "Burahin ang bayad",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `Binayaran ka ni ${who} ng ${value}`,
      paidTotal: "Kabuuang binayaran", shareTotal: "Bahagi sa mga gastos", balance: "Balanse",
      bills: (n) => `${n} gastos`,
      titles: { b1: "Guesthouse sa Lagoa", b2: "Hapunan sa Ribeirão", b3: "Biyahe papuntang beach", p1: "Ice cream sa beach", p2: "Lingguhang grocery", p3: "Parking" },
    },
    ur: {
      paid: "ادا کنندہ: {name}", notIn: "اس میں شامل نہیں",
      members: (people, bills) => `${people} افراد · ${bills} بل`,
      toGet: "آپ کو ملنا ہے", youOwe: "آپ کو دینا ہے", settled: "سب حساب برابر", owesYou: "آپ کو کس سے لینا ہے", youOweTitle: "آپ کو دینا ہے",
      eachOne: "ہر ایک کا بیلنس", getsBack: "لینا ہے", owes: "دینا ہے", even: "حساب برابر",
      toSettle: "باقی حساب", total: "گروپ کا کل خرچ", lodging: "رہائش", food: "کھانا", transport: "ٹرانسپورٹ",
      sheetTitle: "بل تقسیم کریں", description: "تفصیل", amount: "رقم", whoPaid: "ادا کنندہ",
      splitAmong: "ان میں برابر تقسیم", each: "{value} فی کس", cancel: "منسوخ کریں", save: "محفوظ کریں", close: "بند کریں",
      queue: (n) => `قطار میں تبدیلیاں: ${n}`,
      split: "تقسیم کا طریقہ", yourShare: "آپ کا حصہ", deleteBill: "بل حذف کریں",
      recordPayment: "ادائیگی درج کریں", record: "درج کریں", viaMethod: "ٹرانسفر کے ذریعے", payment: "ادائیگی", deletePayment: "ادائیگی حذف کریں",
      // Why "→": the names are Latin, so the line runs left to right even in a right-to-left page, as the Balances tab's does.
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who}: آپ کو ${value} کی ادائیگی`,
      paidTotal: "کل ادا شدہ", shareTotal: "بلوں میں حصہ", balance: "بیلنس",
      bills: (n) => `${n} بل`,
      titles: { b1: "Lagoa کا گیسٹ ہاؤس", b2: "Ribeirão میں رات کا کھانا", b3: "ساحل تک سواری", p1: "ساحل پر آئس کریم", p2: "ہفتے کا راشن", p3: "پارکنگ" },
    },
    hr: {
      paid: "Platitelj: {name}", notIn: "Ne sudjeluje u ovome",
      members: (people, bills) => `${people} ${countForm(people, "osoba", "osobe", "osoba")} · ${bills} ${countForm(bills, "trošak", "troška", "troškova")}`,
      toGet: "dobivaš natrag", youOwe: "duguješ", settled: "sve podmireno", owesYou: "Tko ti duguje", youOweTitle: "Duguješ",
      eachOne: "Saldo svake osobe", getsBack: "dobiva natrag", owes: "duguje", even: "podmireno",
      toSettle: "Za podmirenje", total: "Ukupno u grupi", lodging: "Smještaj", food: "Hrana", transport: "Prijevoz",
      sheetTitle: "Podijeli trošak", description: "Opis", amount: "Iznos", whoPaid: "Platitelj",
      splitAmong: "Podijeli jednako među", each: "{value} po osobi", cancel: "Odustani", save: "Spremi", close: "Zatvori",
      queue: (n) => `${n} ${countForm(n, "promjena", "promjene", "promjena")} u redu čekanja`,
      split: "Kako je podijeljeno", yourShare: "Tvoj udio", deleteBill: "Izbriši trošak",
      recordPayment: "Zabilježi uplatu", record: "Zabilježi", viaMethod: "prijenosom", payment: "Uplata", deletePayment: "Izbriši uplatu",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `Primljena uplata: ${who} · ${value}`,
      paidTotal: "Ukupno plaćeno", shareTotal: "Udio u troškovima", balance: "Saldo",
      bills: (n) => `${n} ${countForm(n, "trošak", "troška", "troškova")}`,
      titles: { b1: "Pansion Lagoa", b2: "Večera, Ribeirão", b3: "Prijevoz do plaže", p1: "Sladoled na plaži", p2: "Tjedna kupovina", p3: "Parkiranje" },
    },
    sr: {
      paid: "Platilac: {name}", notIn: "Ne učestvuje",
      members: (people, bills) => `${people} ${countForm(people, "osoba", "osobe", "osoba")} · ${bills} ${countForm(bills, "trošak", "troška", "troškova")}`,
      toGet: "dobijaš nazad", youOwe: "duguješ", settled: "sve izmireno", owesYou: "Duguju ti", youOweTitle: "Duguješ",
      eachOne: "Stanje svake osobe", getsBack: "dobija nazad", owes: "duguje", even: "izmireno",
      toSettle: "Za izmirenje", total: "Ukupno u grupi", lodging: "Smeštaj", food: "Hrana", transport: "Prevoz",
      sheetTitle: "Podeli trošak", description: "Opis", amount: "Iznos", whoPaid: "Ko je platio",
      splitAmong: "Podeli jednako između", each: "{value} po osobi", cancel: "Otkaži", save: "Sačuvaj", close: "Zatvori",
      queue: (n) => `${n} ${countForm(n, "izmena", "izmene", "izmena")} na čekanju`,
      split: "Kako je podeljeno", yourShare: "Tvoj deo", deleteBill: "Izbriši trošak",
      recordPayment: "Zabeleži uplatu", record: "Zabeleži", viaMethod: "putem prenosa", payment: "Uplata", deletePayment: "Izbriši uplatu",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `Primljena uplata: ${value} · ${who}`,
      paidTotal: "Ukupno plaćeno", shareTotal: "Deo troškova", balance: "Stanje",
      bills: (n) => `${n} ${countForm(n, "trošak", "troška", "troškova")}`,
      titles: { b1: "Pansion Lagoa", b2: "Večera: Ribeirão", b3: "Prevoz do plaže", p1: "Sladoled na plaži", p2: "Nedeljna kupovina", p3: "Parking" },
    },
    sk: {
      paid: "{name} zaplatil(a)", notIn: "Nie je v tomto výdavku",
      members: (people, bills) => `${people} ${countForm(people, "človek", "ľudia", "ľudí")} · ${bills} ${countForm(bills, "výdavok", "výdavky", "výdavkov")}`,
      toGet: "dostaneš späť", youOwe: "dlžíš", settled: "všetko vyrovnané", owesYou: "Kto ti dlží", youOweTitle: "Dlžíš",
      eachOne: "Zostatok každého", getsBack: "dostane späť", owes: "dlží", even: "vyrovnané",
      toSettle: "Na vyrovnanie", total: "Spolu v skupine", lodging: "Ubytovanie", food: "Jedlo", transport: "Doprava",
      sheetTitle: "Rozdeliť výdavok", description: "Popis", amount: "Suma", whoPaid: "Kto platil",
      splitAmong: "Rozdeliť rovným dielom medzi", each: "{value} na osobu", cancel: "Zrušiť", save: "Uložiť", close: "Zavrieť",
      queue: (n) => `${n} ${countForm(n, "zmena", "zmeny", "zmien")} vo fronte`,
      split: "Ako sa delilo", yourShare: "Tvoj podiel", deleteBill: "Odstrániť výdavok",
      recordPayment: "Zaznamenať platbu", record: "Zaznamenať", viaMethod: "prevodom", payment: "Platba", deletePayment: "Odstrániť platbu",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} ti zaplatil(a) ${value}`,
      paidTotal: "Zaplatené spolu", shareTotal: "Podiel na výdavkoch", balance: "Zostatok",
      bills: (n) => `${n} ${countForm(n, "výdavok", "výdavky", "výdavkov")}`,
      titles: { b1: "Penzión v Lagoa", b2: "Večera v Ribeirão", b3: "Odvoz na pláž", p1: "Zmrzlina na pláži", p2: "Týždenný nákup", p3: "Parkovanie" },
    },
    // Norwegian (Bokmål): "du" for the user, and the app's words (utgift, saldo, gjør opp, registrer betaling).
    nb: {
      paid: "{name} betalte", notIn: "Ikke med i denne",
      members: (people, bills) => `${people} personer · ${bills} ${bills === 1 ? "utgift" : "utgifter"}`,
      toGet: "å få tilbake", youOwe: "du skylder", settled: "alt er gjort opp", owesYou: "Skylder deg", youOweTitle: "Du skylder",
      eachOne: "Saldoen til hver enkelt", getsBack: "får tilbake", owes: "skylder", even: "gjort opp",
      toSettle: "Å gjøre opp", total: "Gruppens totalsum", lodging: "Overnatting", food: "Mat", transport: "Transport",
      sheetTitle: "Del en utgift", description: "Beskrivelse", amount: "Beløp", whoPaid: "Hvem betalte",
      splitAmong: "Del likt mellom", each: "{value} hver", cancel: "Avbryt", save: "Lagre", close: "Lukk",
      queue: (n) => `${n} ${n === 1 ? "endring" : "endringer"} i køen`,
      split: "Hvordan den ble delt", yourShare: "Din andel", deleteBill: "Slett utgiften",
      recordPayment: "Registrer betaling", record: "Registrer", viaMethod: "via overføring", payment: "Betaling", deletePayment: "Slett betalingen",
      payLine: (from, to) => `${name(from)} betalte ${name(to)}`,
      paidYou: (who, value) => `${who} betalte deg ${value}`,
      paidTotal: "Betalt totalt", shareTotal: "Andel av utgiftene", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "utgift" : "utgifter"}`,
      titles: { b1: "Gjestehus i Lagoa", b2: "Middag i Ribeirão", b3: "Skyss til stranden", p1: "Is på stranden", p2: "Ukens matinnkjøp", p3: "Parkering" },
    },
    fa: {
      paid: "{name} پرداخت کرد", notIn: "در این هزینه نیست",
      members: (people, bills) => `${people} نفر · ${bills} هزینه`,
      toGet: "طلب شما", youOwe: "بدهی شما", settled: "همه تسویه شد", owesYou: "چه کسی به شما بدهکار است", youOweTitle: "بدهی شما",
      eachOne: "تراز هر نفر", getsBack: "طلبکار", owes: "بدهکار", even: "تسویه شد",
      toSettle: "برای تسویه", total: "جمع کل گروه", lodging: "اقامت", food: "غذا", transport: "حمل‌ونقل",
      sheetTitle: "تقسیم هزینه", description: "توضیحات", amount: "مبلغ", whoPaid: "چه کسی پرداخت کرد",
      splitAmong: "تقسیم مساوی بین", each: "هر نفر {value}", cancel: "لغو", save: "ذخیره", close: "بستن",
      queue: (n) => `${n} تغییر در صف`,
      split: "نحوه تقسیم", yourShare: "سهم شما", deleteBill: "حذف هزینه",
      recordPayment: "ثبت پرداخت", record: "ثبت", viaMethod: "با انتقال وجه", payment: "پرداخت", deletePayment: "حذف پرداخت",
      // Why "→": the names are Latin, so the line runs left to right even in a right-to-left page, as the Balances tab's does.
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} به شما ${value} پرداخت کرد`,
      paidTotal: "جمع پرداختی", shareTotal: "سهم از هزینه‌ها", balance: "تراز",
      bills: (n) => `${n} هزینه`,
      titles: { b1: "مهمان‌خانه Lagoa", b2: "شام در Ribeirão", b3: "سفر تا ساحل", p1: "بستنی در ساحل", p2: "خرید هفتگی", p3: "پارکینگ" },
    },
    sw: {
      paid: "Imelipwa na: {name}", notIn: "Hayumo kwenye hii",
      members: (people, bills) => `${people === 1 ? "mtu" : "watu"} ${people} · gharama ${bills}`,
      toGet: "unadai", youOwe: "unadaiwa", settled: "hakuna deni", owesYou: "Wanaodaiwa na wewe", youOweTitle: "Unadaiwa",
      eachOne: "Salio la kila mtu", getsBack: "anadai", owes: "anadaiwa", even: "hana deni",
      toSettle: "Madeni ya kulipa", total: "Jumla ya kikundi", lodging: "Malazi", food: "Chakula", transport: "Usafiri",
      sheetTitle: "Gawanya gharama", description: "Maelezo", amount: "Kiasi", whoPaid: "Aliyelipa",
      splitAmong: "Gawanya sawa kati ya", each: "{value} kila mmoja", cancel: "Ghairi", save: "Hifadhi", close: "Funga",
      queue: (n) => (n === 1 ? `Badiliko ${n} linasubiri` : `Mabadiliko ${n} yanasubiri`),
      split: "Jinsi ilivyogawanywa", yourShare: "Sehemu yako", deleteBill: "Futa gharama",
      recordPayment: "Rekodi malipo", record: "Rekodi", viaMethod: "kwa uhamisho", payment: "Malipo", deletePayment: "Futa malipo",
      payLine: (from, to) => `${name(from)} amemlipa ${name(to)}`,
      paidYou: (who, value) => `${who} amekulipa ${value}`,
      paidTotal: "Jumla aliyolipa", shareTotal: "Sehemu ya gharama", balance: "Salio",
      bills: (n) => `gharama ${n}`,
      titles: { b1: "Nyumba ya wageni Lagoa", b2: "Chakula cha jioni: Ribeirão", b3: "Usafiri hadi ufukweni", p1: "Aiskrimu ufukweni", p2: "Manunuzi ya wiki", p3: "Maegesho" },
    },
    // Tamil: a name or an amount never takes a case ending, so it stands as the subject, after a colon or an arrow.
    ta: {
      paid: "{name} செலுத்தினார்", notIn: "இதில் இல்லை",
      members: (people, bills) => `${people} ${people === 1 ? "நபர்" : "நபர்கள்"} · ${bills} ${bills === 1 ? "செலவு" : "செலவுகள்"}`,
      toGet: "உங்களுக்கு வர வேண்டும்", youOwe: "நீங்கள் தர வேண்டும்", settled: "கணக்கு தீர்ந்தது", owesYou: "யார் உங்களுக்குத் தர வேண்டும்", youOweTitle: "நீங்கள் தர வேண்டியது",
      eachOne: "ஒவ்வொருவரின் பேலன்ஸ்", getsBack: "பெற வேண்டும்", owes: "தர வேண்டும்", even: "கணக்கு தீர்ந்தது",
      toSettle: "தீர்க்க வேண்டியவை", total: "குழுவின் மொத்தம்", lodging: "தங்குமிடம்", food: "உணவு", transport: "போக்குவரத்து",
      sheetTitle: "செலவைப் பிரிக்கவும்", description: "விளக்கம்", amount: "தொகை", whoPaid: "யார் செலுத்தினார்",
      splitAmong: "இவர்களிடையே சமமாகப் பிரிக்கவும்", each: "ஒவ்வொருவருக்கும் {value}", cancel: "ரத்துசெய்யவும்", save: "சேமிக்கவும்", close: "மூடவும்",
      queue: (n) => `${n} ${n === 1 ? "மாற்றம்" : "மாற்றங்கள்"} வரிசையில்`,
      split: "எப்படிப் பிரிக்கப்பட்டது", yourShare: "உங்கள் பங்கு", deleteBill: "செலவை நீக்கவும்",
      recordPayment: "பேமெண்ட்டைப் பதிவு செய்யவும்", record: "பதிவு செய்யவும்", viaMethod: "டிரான்ஸ்ஃபர் மூலம்", payment: "பேமெண்ட்", deletePayment: "பேமெண்ட்டை நீக்கவும்",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} உங்களுக்குச் செலுத்தினார்: ${value}`,
      paidTotal: "மொத்தம் செலுத்தியது", shareTotal: "செலவுகளில் பங்கு", balance: "பேலன்ஸ்",
      bills: (n) => `${n} ${n === 1 ? "செலவு" : "செலவுகள்"}`,
      titles: { b1: "லகோவா விருந்தினர் இல்லம்", b2: "ரிபெய்ராவில் இரவு உணவு", b3: "கடற்கரைக்குப் பயணம்", p1: "கடற்கரையில் ஐஸ்கிரீம்", p2: "வார மளிகைப் பொருட்கள்", p3: "பார்க்கிங்" },
    },
    // Telugu: a name or an amount never takes a case ending, so it stands as the subject, after a colon or an arrow.
    te: {
      paid: "{name} చెల్లించారు", notIn: "ఇందులో లేరు",
      members: (people, bills) => `${people} ${people === 1 ? "వ్యక్తి" : "వ్యక్తులు"} · ${bills} ${bills === 1 ? "ఖర్చు" : "ఖర్చులు"}`,
      toGet: "మీకు రావాలి", youOwe: "మీరు ఇవ్వాలి", settled: "లెక్క సెటిల్ అయింది", owesYou: "మీకు ఎవరు ఇవ్వాలి", youOweTitle: "మీరు ఇవ్వాల్సింది",
      eachOne: "ఒక్కొక్కరి బ్యాలెన్స్", getsBack: "రావాలి", owes: "ఇవ్వాలి", even: "లెక్క సెటిల్ అయింది",
      toSettle: "సెటిల్ చేయాల్సినవి", total: "గ్రూప్ మొత్తం", lodging: "వసతి", food: "ఆహారం", transport: "రవాణా",
      sheetTitle: "ఖర్చును పంచండి", description: "వివరణ", amount: "మొత్తం", whoPaid: "ఎవరు చెల్లించారు",
      splitAmong: "వీరి మధ్య సమానంగా పంచండి", each: "ఒక్కొక్కరికి {value}", cancel: "రద్దు చేయండి", save: "సేవ్ చేయండి", close: "మూసివేయండి",
      queue: (n) => `${n} ${n === 1 ? "మార్పు" : "మార్పులు"} క్యూలో`,
      split: "ఎలా పంచారు", yourShare: "మీ వాటా", deleteBill: "ఖర్చును తొలగించండి",
      recordPayment: "చెల్లింపును నమోదు చేయండి", record: "నమోదు చేయండి", viaMethod: "ట్రాన్స్‌ఫర్ ద్వారా", payment: "చెల్లింపు", deletePayment: "చెల్లింపును తొలగించండి",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} మీకు చెల్లించారు: ${value}`,
      paidTotal: "మొత్తం చెల్లించినది", shareTotal: "ఖర్చులలో వాటా", balance: "బ్యాలెన్స్",
      bills: (n) => `${n} ${n === 1 ? "ఖర్చు" : "ఖర్చులు"}`,
      titles: { b1: "లగోవా గెస్ట్‌హౌస్", b2: "రిబెయిరావ్‌లో డిన్నర్", b3: "బీచ్‌కు ప్రయాణం", p1: "బీచ్‌లో ఐస్‌క్రీమ్", p2: "వారపు కిరాణా", p3: "పార్కింగ్" },
    },
    // Marathi: a name takes the respectful यांनी written apart, and an amount stands after a colon, never with an ending.
    mr: {
      paid: "{name} यांनी पैसे दिले", notIn: "यात सहभागी नाहीत",
      members: (people, bills) => `${people} ${people === 1 ? "व्यक्ती" : "लोक"} · ${bills} खर्च`,
      toGet: "तुम्हाला येणे आहे", youOwe: "तुम्हाला द्यायचे आहेत", settled: "हिशोब पूर्ण झाला", owesYou: "तुम्हाला कोणाकडून येणे आहे", youOweTitle: "तुम्हाला कोणाला द्यायचे आहेत",
      eachOne: "प्रत्येकाचा बॅलन्स", getsBack: "येणे आहे", owes: "देणे आहे", even: "हिशोब पूर्ण झाला",
      toSettle: "हिशोब पूर्ण करण्यासाठी", total: "ग्रुपचा एकूण खर्च", lodging: "राहण्याची सोय", food: "जेवण", transport: "प्रवास",
      sheetTitle: "खर्च वाटा", description: "वर्णन", amount: "रक्कम", whoPaid: "कोणी पैसे दिले",
      splitAmong: "यांच्यात समान वाटा", each: "प्रत्येकी {value}", cancel: "रद्द करा", save: "सेव्ह करा", close: "बंद करा",
      queue: (n) => `रांगेत ${n} बदल`,
      split: "कसे वाटले", yourShare: "तुमचा वाटा", deleteBill: "खर्च हटवा",
      recordPayment: "पेमेंट नोंदवा", record: "नोंदवा", viaMethod: "ट्रान्सफरद्वारे", payment: "पेमेंट", deletePayment: "पेमेंट हटवा",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} यांनी तुम्हाला पैसे दिले: ${value}`,
      paidTotal: "एकूण दिलेले पैसे", shareTotal: "खर्चांमधील वाटा", balance: "बॅलन्स",
      bills: (n) => `${n} खर्च`,
      titles: { b1: "लागोआ गेस्टहाउस", b2: "रिबेराओमध्ये डिनर", b3: "बीचपर्यंतचा प्रवास", p1: "बीचवर आइसक्रीम", p2: "आठवड्याचा किराणा", p3: "पार्किंग" },
    },
    bg: {
      paid: "{name} плати", notIn: "Не участва в този разход",
      members: (people, bills) => `${people} ${people === 1 ? "човек" : "души"} · ${bills} ${bills === 1 ? "разход" : "разхода"}`,
      toGet: "да получиш", youOwe: "дължиш", settled: "всичко е уредено", owesYou: "Кой ти дължи", youOweTitle: "Дължиш",
      eachOne: "Балансът на всеки", getsBack: "получава", owes: "дължи", even: "уредено",
      toSettle: "За уреждане", total: "Общо за групата", lodging: "Настаняване", food: "Храна", transport: "Транспорт",
      sheetTitle: "Раздели разход", description: "Описание", amount: "Сума", whoPaid: "Кой плати",
      splitAmong: "Раздели поравно между", each: "{value} на човек", cancel: "Отказ", save: "Запази", close: "Затвори",
      queue: (n) => `${n} ${n === 1 ? "промяна" : "промени"} на опашката`,
      split: "Как е разделен", yourShare: "Твоят дял", deleteBill: "Изтрий разхода",
      recordPayment: "Запиши плащане", record: "Запиши", viaMethod: "с превод", payment: "Плащане", deletePayment: "Изтрий плащането",
      payLine: (from, to) => `${name(from)} плати на ${name(to)}`,
      paidYou: (who, value) => `${who} ти плати ${value}`,
      paidTotal: "Платено общо", shareTotal: "Дял от разходите", balance: "Баланс",
      bills: (n) => `${n} ${n === 1 ? "разход" : "разхода"}`,
      titles: { b1: "Къща за гости в Лагоа", b2: "Вечеря в Рибейрао", b3: "Превоз до плажа", p1: "Сладолед на плажа", p2: "Седмично пазаруване", p3: "Паркинг" },
    },
    ca: {
      paid: "{name} ha pagat", notIn: "No hi participes",
      members: (people, bills) => `${people} ${people === 1 ? "persona" : "persones"} · ${bills} ${bills === 1 ? "despesa" : "despeses"}`,
      toGet: "per cobrar", youOwe: "deus", settled: "tot liquidat", owesYou: "Et deuen", youOweTitle: "Deus",
      eachOne: "Saldo de cadascú", getsBack: "cobra", owes: "deu", even: "comptes liquidats",
      toSettle: "Per liquidar", total: "Total del grup", lodging: "Allotjament", food: "Menjar", transport: "Transport",
      sheetTitle: "Dividir una despesa", description: "Descripció", amount: "Import", whoPaid: "Qui ha pagat",
      splitAmong: "Dividir a parts iguals entre", each: "{value} cadascú", cancel: "Cancel·lar", save: "Desar", close: "Tancar",
      queue: (n) => `${n} ${n === 1 ? "canvi" : "canvis"} a la cua`,
      split: "Com s’ha dividit", yourShare: "La teva part", deleteBill: "Suprimir la despesa",
      recordPayment: "Registrar un pagament", record: "Registrar", viaMethod: "per transferència", payment: "Pagament", deletePayment: "Suprimir el pagament",
      payLine: (from, to) => `${name(from)} ha pagat a ${name(to)}`,
      paidYou: (who, value) => `${who} t’ha pagat ${value}`,
      paidTotal: "Pagat en total", shareTotal: "Part de les despeses", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "despesa" : "despeses"}`,
      titles: { b1: "Pensió a Lagoa", b2: "Sopar a Ribeirão", b3: "Trajecte a la platja", p1: "Gelat a la platja", p2: "Compra de la setmana", p3: "Aparcament" },
    },
    // Danish: "du" for the user, and the app's words (udgift, saldo, gøre op, registrér betaling).
    da: {
      paid: "{name} betalte", notIn: "Ikke med i denne",
      members: (people, bills) => `${people} personer · ${bills} ${bills === 1 ? "udgift" : "udgifter"}`,
      toGet: "til gode", youOwe: "du skylder", settled: "alt er gjort op", owesYou: "Skylder dig", youOweTitle: "Du skylder",
      eachOne: "Hver persons saldo", getsBack: "har til gode", owes: "skylder", even: "gjort op",
      toSettle: "At gøre op", total: "Gruppens total", lodging: "Overnatning", food: "Mad", transport: "Transport",
      sheetTitle: "Del en udgift", description: "Beskrivelse", amount: "Beløb", whoPaid: "Hvem betalte",
      splitAmong: "Del ligeligt mellem", each: "{value} hver", cancel: "Annuller", save: "Gem", close: "Luk",
      queue: (n) => `${n} ${n === 1 ? "ændring" : "ændringer"} i køen`,
      split: "Sådan blev den delt", yourShare: "Din andel", deleteBill: "Slet udgift",
      recordPayment: "Registrér betaling", record: "Registrér", viaMethod: "via overførsel", payment: "Betaling", deletePayment: "Slet betaling",
      payLine: (from, to) => `${name(from)} betalte ${name(to)}`,
      paidYou: (who, value) => `${who} betalte dig ${value}`,
      paidTotal: "Betalt i alt", shareTotal: "Andel af udgifterne", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "udgift" : "udgifter"}`,
      titles: { b1: "Gæstehus i Lagoa", b2: "Middag i Ribeirão", b3: "Kørsel til stranden", p1: "Is på stranden", p2: "Ugens indkøb", p3: "Parkering" },
    },
    // Finnish: "sinä" for the user, and the app's words (kulu, saldo, tasata, kirjaa maksu). A name or an amount is
    // the subject or stands after a noun that carries the case ("henkilölle {name}"), never with an ending of its own.
    fi: {
      paid: "{name} maksoi", notIn: "Ei mukana tässä",
      members: (people, bills) => `${people} henkilöä · ${bills} ${bills === 1 ? "kulu" : "kulua"}`,
      toGet: "saatavana", youOwe: "olet velkaa", settled: "kaikki tasattu", owesYou: "Velkaa sinulle", youOweTitle: "Olet velkaa",
      eachOne: "Kunkin saldo", getsBack: "saa takaisin", owes: "on velkaa", even: "tasoissa",
      toSettle: "Tasattavaa", total: "Ryhmän kulut yhteensä", lodging: "Majoitus", food: "Ruoka", transport: "Liikenne",
      sheetTitle: "Jaa kulu", description: "Kuvaus", amount: "Summa", whoPaid: "Kuka maksoi",
      splitAmong: "Jaetaan tasan", each: "{value} kukin", cancel: "Peruuta", save: "Tallenna", close: "Sulje",
      queue: (n) => `${n} ${n === 1 ? "muutos" : "muutosta"} jonossa`,
      split: "Miten se jaettiin", yourShare: "Osuutesi", deleteBill: "Poista kulu",
      recordPayment: "Kirjaa maksu", record: "Kirjaa", viaMethod: "tilisiirrolla", payment: "Maksu", deletePayment: "Poista maksu",
      payLine: (from, to) => `${name(from)} maksoi henkilölle ${name(to)}`,
      paidYou: (who, value) => `${who} maksoi sinulle ${value}`,
      paidTotal: "Maksanut yhteensä", shareTotal: "Osuus kuluista", balance: "Saldo",
      bills: (n) => `${n} ${n === 1 ? "kulu" : "kulua"}`,
      titles: { b1: "Majatalo Lagoassa", b2: "Illallinen Ribeirãossa", b3: "Kyyti rannalle", p1: "Jäätelöt rannalla", p2: "Viikon ruokaostokset", p3: "Pysäköinti" },
    },
    // Latvian: "tu" for the user, and the app's words (rēķins, bilance, norēķināties, reģistrēt maksājumu). A name is
    // the subject or stands after a noun that carries the case ("personai {name}"), never declined itself; a count
    // takes the singular after 1, 21, 31… (countForm, as Intl.PluralRules tells it), the plural after the rest.
    lv: {
      paid: "{name} samaksāja", notIn: "Šoreiz nepiedalās",
      members: (people, bills) => `${people} ${countForm(people, "cilvēks", undefined, "cilvēki")} · ${bills} ${countForm(bills, "rēķins", undefined, "rēķini")}`,
      toGet: "jāsaņem", youOwe: "tu esi parādā", settled: "viss nokārtots", owesYou: "Tev ir parādā", youOweTitle: "Tu esi parādā",
      eachOne: "Katra bilance", getsBack: "saņems atpakaļ", owes: "ir parādā", even: "norēķins pabeigts",
      toSettle: "Jānorēķinās", total: "Grupas kopsumma", lodging: "Naktsmītne", food: "Ēdiens", transport: "Transports",
      sheetTitle: "Sadalīt rēķinu", description: "Apraksts", amount: "Summa", whoPaid: "Kas maksāja",
      splitAmong: "Sadalīt vienādi starp", each: "{value} katram", cancel: "Atcelt", save: "Saglabāt", close: "Aizvērt",
      queue: (n) => `${n} ${countForm(n, "izmaiņa", undefined, "izmaiņas")} rindā`,
      split: "Kā tas tika sadalīts", yourShare: "Tava daļa", deleteBill: "Dzēst rēķinu",
      recordPayment: "Reģistrēt maksājumu", record: "Reģistrēt", viaMethod: "ar pārskaitījumu", payment: "Maksājums", deletePayment: "Dzēst maksājumu",
      payLine: (from, to) => `${name(from)} samaksāja personai ${name(to)}`,
      paidYou: (who, value) => `${who} tev samaksāja ${value}`,
      paidTotal: "Samaksāts kopā", shareTotal: "Daļa no rēķiniem", balance: "Bilance",
      bills: (n) => `${n} ${countForm(n, "rēķins", undefined, "rēķini")}`,
      titles: { b1: "Lagoas viesu māja", b2: "Vakariņas Ribeirão", b3: "Brauciens uz pludmali", p1: "Saldējums pludmalē", p2: "Nedēļas iepirkumi", p3: "Stāvvieta" },
    },
    // Estonian: "sina" for the user, and the app's words (kulu, saldo, arvelda, registreeri makse). A name or an amount
    // is the subject or stands after a noun that carries the case ("isikule {name}"), never with an ending of its own.
    et: {
      paid: "{name} maksis", notIn: "Pole osaline",
      members: (people, bills) => `${people} inimest · ${bills} kulu`,
      toGet: "tagasi saada", youOwe: "sa võlgned", settled: "kõik on arveldatud", owesYou: "Kes sulle võlgneb", youOweTitle: "Sa võlgned",
      eachOne: "Igaühe saldo", getsBack: "saab tagasi", owes: "võlgneb", even: "tasa",
      toSettle: "Arveldada", total: "Grupi kulud kokku", lodging: "Majutus", food: "Toit", transport: "Transport",
      sheetTitle: "Jaga kulu", description: "Kirjeldus", amount: "Summa", whoPaid: "Kes maksis",
      splitAmong: "Jaga võrdselt", each: "{value} igaühele", cancel: "Tühista", save: "Salvesta", close: "Sulge",
      queue: (n) => `${n} ${n === 1 ? "muudatus" : "muudatust"} järjekorras`,
      split: "Kuidas jagati", yourShare: "Sinu osa", deleteBill: "Kustuta kulu",
      recordPayment: "Registreeri makse", record: "Registreeri", viaMethod: "ülekandega", payment: "Makse", deletePayment: "Kustuta makse",
      payLine: (from, to) => `${name(from)} maksis isikule ${name(to)}`,
      paidYou: (who, value) => `${who} maksis sulle ${value}`,
      paidTotal: "Kokku makstud", shareTotal: "Osa kuludest", balance: "Saldo",
      bills: (n) => `${n} kulu`,
      titles: { b1: "Lagoa külalistemaja", b2: "Õhtusöök Ribeirãos", b3: "Sõit randa", p1: "Jäätis rannas", p2: "Nädala toidukaubad", p3: "Parkimine" },
    },
    // Lithuanian: "tu" for the user, and the app's words (išlaida, balansas, atsiskaityti, užregistruoti mokėjimą).
    // Counts take one, few and other forms (countForm). A name is never declined: who paid whom as an arrow, as the
    // Balances tab writes it, and a name or an amount is the subject.
    lt: {
      paid: "{name} sumokėjo", notIn: "Nedalyvauja",
      members: (people, bills) => `${people} ${countForm(people, "žmogus", "žmonės", "žmonių")} · ${bills} ${countForm(bills, "išlaida", "išlaidos", "išlaidų")}`,
      toGet: "atgausi", youOwe: "turi grąžinti", settled: "viskas atsiskaityta", owesYou: "Kas tau turi grąžinti", youOweTitle: "Turi grąžinti",
      eachOne: "Kiekvieno balansas", getsBack: "atgaus", owes: "turi grąžinti", even: "atsiskaityta",
      toSettle: "Reikia atsiskaityti", total: "Grupės išlaidos iš viso", lodging: "Apgyvendinimas", food: "Maistas", transport: "Transportas",
      sheetTitle: "Padalyti išlaidą", description: "Aprašymas", amount: "Suma", whoPaid: "Kas mokėjo",
      splitAmong: "Po lygiai tarp", each: "po {value}", cancel: "Atšaukti", save: "Išsaugoti", close: "Uždaryti",
      queue: (n) => `${n} ${countForm(n, "pakeitimas", "pakeitimai", "pakeitimų")} eilėje`,
      split: "Kaip padalyta", yourShare: "Tavo dalis", deleteBill: "Ištrinti išlaidą",
      recordPayment: "Užregistruoti mokėjimą", record: "Užregistruoti", viaMethod: "pavedimu", payment: "Mokėjimas", deletePayment: "Ištrinti mokėjimą",
      payLine: (from, to) => `${name(from)} → ${name(to)}`,
      paidYou: (who, value) => `${who} tau sumokėjo ${value}`,
      paidTotal: "Iš viso sumokėta", shareTotal: "Dalis išlaidose", balance: "Balansas",
      bills: (n) => `${n} ${countForm(n, "išlaida", "išlaidos", "išlaidų")}`,
      titles: { b1: "Svečių namai Lagoa", b2: "Vakarienė Ribeirão", b3: "Kelionė į paplūdimį", p1: "Ledai paplūdimyje", p2: "Savaitės pirkiniai", p3: "Automobilio stovėjimas" },
    },
  });
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);

  // A percentage as the language writes it (%10, 10 %), as the split card does (money.js).
  const pct = window.money.percent;
  // Amounts in the visitor's currency, as the app shows them (money.js).
  const money = window.money.format;
  // The demo's amounts below are in the dollar's cents; this gives them in the currency's own (money.js).
  const cents = window.money.cents;

  const PEOPLE = [
    { id: "me", name: "Pedro", initial: "P", color: "blue" },
    { id: "ana", name: "Ana", initial: "A", color: "green" },
    { id: "bruno", name: "Bruno", initial: "B", color: "peach" },
    { id: "carla", name: "Carla", initial: "C", color: "lilac" },
  ];
  const everyone = PEOPLE.map((p) => p.id);
  function name(id) { return PEOPLE.find((p) => p.id === id).name; }
  const CATEGORY = { lodging: "i-bed", food: "i-food", transport: "i-car" };

  // What the group has, newest first, as Expenses lists it: bills and recorded payments.
  let entries = [
    { kind: "bill", title: "b1", icon: "i-bed", category: "lodging", amount: cents(120000), payer: "me", among: everyone },
    { kind: "bill", title: "b2", icon: "i-food", category: "food", amount: cents(31200), payer: "ana", among: everyone },
    { kind: "bill", title: "b3", icon: "i-car", category: "transport", amount: cents(4860), payer: "bruno", among: everyone },
  ];
  const bills = () => entries.filter((e) => e.kind === "bill");
  const PRESETS = [
    { title: "p1", icon: "i-icecream", category: "food", amount: cents(4800) },
    { title: "p2", icon: "i-cart", category: "food", amount: cents(18640) },
    { title: "p3", icon: "i-car", category: "transport", amount: cents(2500) },
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
    entries.forEach((e) => {
      if (e.kind === "payment") { net[e.from] += e.amount; net[e.to] -= e.amount; return; }
      net[e.payer] += e.amount;
      Object.entries(shares(e)).forEach(([id, share]) => { net[id] -= share; });
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
  // Each one's photo (people who don't exist, made by an AI), on their color while it loads.
  const avatar = (id) => {
    const p = PEOPLE.find((x) => x.id === id);
    return `<span class="av ${p.color}"><img src="/people/${p.id}.webp" alt=""></span>`;
  };
  const tone = (cents) => (cents > 0 ? "pos" : cents < 0 ? "neg" : "zero");
  const chevron = `<svg class="icon chev" aria-hidden="true"><use href="#i-left"/></svg>`;
  // A settle-up payment is addressed by who pays whom; data-move carries it.
  const moveAttr = (m) => `data-move="${m.from}:${m.to}:${m.amount}"`;

  function renderBills(net) {
    const rows = entries.map((e, i) => {
      if (e.kind === "payment") {
        return `<li${e === fresh ? ' class="fresh"' : ""}><button type="button" class="row" data-entry="${i}">
          <span class="cat pay">${icon("i-check")}</span>
          <span class="t"><b>${TEXT.payment}</b><small>${esc(TEXT.payLine(e.from, e.to))}</small></span>
          <span class="v num"><span>${money(e.amount)}</span><small class="zero">${TEXT.viaMethod}</small></span>
        </button></li>`;
      }
      const share = shares(e);
      const mine = (e.payer === "me" ? e.amount : 0) - (share.me || 0);
      const who = fill(TEXT.paid, { name: name(e.payer) });
      const part = e.payer !== "me" && !share.me
        ? `<small class="zero">${TEXT.notIn}</small>`
        : `<small class="${tone(mine)}">${money(mine, true)}</small>`;
      return `<li${e === fresh ? ' class="fresh"' : ""}><button type="button" class="row" data-entry="${i}">
        <span class="cat">${icon(e.icon)}</span>
        <span class="t"><b>${esc(TEXT.titles[e.title])}</b><small>${esc(who)}</small></span>
        <span class="v num"><span>${money(e.amount)}</span>${part}</span>
      </button></li>`;
    }).join("");
    const moves = settlements(net);
    const toMe = moves.filter((m) => m.to === "me");
    const fromMe = moves.filter((m) => m.from === "me");
    const list = (title, items, other, cls) => `<div class="owes num"><small>${title}</small>${items.map((m) =>
      `<button type="button" class="owe-row" ${moveAttr(m)}>${avatar(m[other])}${esc(name(m[other]))}<b class="${cls}">${money(m.amount)}</b>${chevron}</button>`).join("")}</div>`;
    const owes = toMe.length ? list(TEXT.owesYou, toMe, "from", "pos") : fromMe.length ? list(TEXT.youOweTitle, fromMe, "to", "neg") : "";
    return `<ul class="list">${rows}</ul>${owes}`;
  }

  function renderBalances(net) {
    const order = ["me", ...everyone.filter((id) => id !== "me").sort((a, b) => net[b] - net[a])];
    const rows = order.map((id) => {
      const label = net[id] > 0 ? TEXT.getsBack : net[id] < 0 ? TEXT.owes : TEXT.even;
      return `<li><button type="button" class="row" data-person="${id}"><span class="who">${avatar(id)}<b>${esc(name(id))}</b></span><span class="v num"><span class="${tone(net[id])}">${money(net[id], true)}</span><small>${label}</small></span></button></li>`;
    }).join("");
    const moves = settlements(net).map((m) => `<li><button type="button" class="move" ${moveAttr(m)}>${avatar(m.from)}<span class="arrow">${esc(name(m.from))} → ${esc(name(m.to))}</span><b class="num">${money(m.amount)}</b>${chevron}</button></li>`).join("");
    return `<p class="pv-label">${TEXT.eachOne}</p><ul class="list people">${rows}</ul>`
      + (moves ? `<p class="pv-label">${TEXT.toSettle}</p><ul class="moves">${moves}</ul>` : "");
  }

  function categoryTotals() {
    return Object.keys(CATEGORY).map((key) => [key, bills().filter((b) => b.category === key).reduce((s, b) => s + b.amount, 0)])
      .filter(([, cents]) => cents > 0).sort((a, b) => b[1] - a[1]);
  }
  function renderStats() {
    const total = bills().reduce((sum, b) => sum + b.amount, 0);
    const byCategory = categoryTotals();
    if (!byCategory.length) return `<div class="pv-total"><small>${TEXT.total}</small><strong class="num">${money(0)}</strong></div>`;
    const max = byCategory[0][1];
    const rows = byCategory.map(([key, cents], i) => `<li><button type="button" class="row" data-category="${key}">
        <span class="cat">${icon(CATEGORY[key])}</span>
        <span class="bar-t"><span class="bar-row"><b>${TEXT[key]}</b><span class="num">${money(cents)} · ${pct(Math.round((cents / total) * 100))}</span></span>
        <span class="bar"><i class="o${Math.min(i, 2)}" style="width:${Math.max(3, (cents / max) * 100)}%"></i></span></span>
      </button></li>`).join("");
    return `<div class="pv-total"><small>${TEXT.total}</small><strong class="num">${money(total)}</strong></div><ul class="list stats">${rows}</ul>`;
  }

  const panel = screen.querySelector('[data-pv="panel"]');
  // The balance rolls from the amount it showed to the new one, in whole cents, and its card glows once.
  const balanceEl = screen.querySelector('[data-pv="balance"]');
  let shownBalance = null;
  let rolling = 0;
  function showBalance(cents, animate) {
    const from = shownBalance;
    shownBalance = cents;
    cancelAnimationFrame(rolling);
    if (!animate || from === null || from === cents || reduceMotion.matches) {
      balanceEl.textContent = money(cents, true);
      return;
    }
    const card = balanceEl.closest(".balance");
    card.classList.remove("changed");
    void card.offsetWidth;
    card.classList.add("changed");
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - t, 3);
      balanceEl.textContent = money(Math.round(from + (cents - from) * eased), true);
      if (t < 1) rolling = requestAnimationFrame(step);
    };
    rolling = requestAnimationFrame(step);
  }
  function render(animate) {
    const net = balances();
    screen.querySelector('[data-pv="members"]').textContent = TEXT.members(PEOPLE.length, bills().length);
    showBalance(net.me, animate);
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
    button.addEventListener("click", () => choose(button.dataset.tab));
    button.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const i = tabs.indexOf(button) + (e.key === "ArrowRight" ? 1 : -1);
      const next = tabs[(i + tabs.length) % tabs.length];
      next.focus();
      choose(next.dataset.tab);
    });
  });
  // A tab the visitor picks.
  function choose(nameOfTab) {
    if (nameOfTab !== tab) track("preview_tab_select", { tab: nameOfTab });
    select(nameOfTab, true);
  }
  function select(nameOfTab, animate) {
    tab = nameOfTab;
    tabs.forEach((b) => {
      const on = b.dataset.tab === nameOfTab;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `pv-tab-${nameOfTab}`);
    // Not on the first draw (animate is false only then): the panel is already at its top, and setting it lays the page out.
    if (animate) panel.scrollTop = 0;
    render(animate);
  }

  // What the tabs list opens a sheet.
  panel.addEventListener("click", (e) => {
    const row = e.target.closest("button");
    if (!row) return;
    if (row.dataset.entry) {
      const entry = entries[Number(row.dataset.entry)];
      openSheet(entry.kind === "bill" ? billSheet(entry) : paymentSheet(entry), row);
    } else if (row.dataset.move) openSheet(recordSheet(row.dataset.move), row);
    else if (row.dataset.person) openSheet(personSheet(row.dataset.person), row);
    else if (row.dataset.category) openSheet(categorySheet(row.dataset.category), row);
  });

  // The sheet: one at a time, over the screen. Each kind returns its markup and what its buttons do.
  const splitButton = screen.querySelector('[data-pv="split"]');
  const scrim = document.createElement("div");
  scrim.className = "pv-scrim";
  const sheet = document.createElement("div");
  sheet.className = "pv-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  scrim.hidden = sheet.hidden = true;
  screen.append(scrim, sheet);
  let current = null;
  let opener = null;

  const head = (title, iconId) => `<span class="grabber" aria-hidden="true"></span>
    <div class="sheet-head">${iconId ? `<span class="cat">${icon(iconId)}</span>` : ""}<h4>${esc(title)}</h4><button type="button" class="sheet-x" data-act="close" aria-label="${TEXT.close}">${icon("i-x")}</button></div>`;
  const actions = (...buttons) => `<div class="sheet-actions">${buttons.join("")}</div>`;
  const button = (act, label, cls, iconId) => `<button type="button" class="${cls}" data-act="${act}">${iconId ? icon(iconId) : ""}${esc(label)}</button>`;

  function splitSheet() {
    const preset = PRESETS[nextPreset % PRESETS.length];
    const draft = { kind: "bill", ...preset, payer: "me", among: [...everyone] };
    return {
      sheet: "split",
      title: TEXT.sheetTitle,
      html() {
        const each = Math.min(...Object.values(shares(draft)));
        return head(TEXT.sheetTitle)
          + `<div class="field"><small>${TEXT.description}</small><span class="desc"><span class="cat">${icon(draft.icon)}</span>${esc(TEXT.titles[draft.title])}</span></div>
          <div class="field"><small>${TEXT.amount}</small><strong class="num amount">${money(draft.amount)}</strong></div>
          <div class="field"><small>${TEXT.whoPaid}</small><div class="picks">${everyone.map((id) => `<button type="button" class="pick" data-payer="${id}" aria-pressed="${draft.payer === id}">${avatar(id)}${esc(name(id))}</button>`).join("")}</div></div>
          <div class="field"><small>${TEXT.splitAmong}</small><div class="picks">${everyone.map((id) => `<button type="button" class="pick" data-among="${id}" aria-pressed="${draft.among.includes(id)}">${avatar(id)}${esc(name(id))}</button>`).join("")}</div>
            <span class="each num">${fill(TEXT.each, { value: money(each) })}</span></div>`
          + actions(button("close", TEXT.cancel, "ghost"), button("save", TEXT.save, "save", "i-check"));
      },
      onClick(b) {
        if (b.dataset.payer) draft.payer = b.dataset.payer;
        else if (b.dataset.among) {
          const id = b.dataset.among;
          const kept = draft.among.includes(id) ? draft.among.filter((x) => x !== id) : everyone.filter((x) => x === id || draft.among.includes(x));
          if (kept.length) draft.among = kept;
        } else if (b.dataset.act === "save") {
          nextPreset += 1;
          return change("add_bill", () => { entries.unshift(draft); fresh = draft; });
        } else return;
        return "rerender";
      },
      focus: '[data-act="save"]',
    };
  }

  function billSheet(bill) {
    const share = shares(bill);
    const who = fill(TEXT.paid, { name: name(bill.payer) });
    const mine = (bill.payer === "me" ? bill.amount : 0) - (share.me || 0);
    return {
      sheet: "bill",
      title: TEXT.titles[bill.title],
      html: () => head(TEXT.titles[bill.title], bill.icon)
        + `<div class="field"><strong class="num amount">${money(bill.amount)}</strong><span class="each">${avatar(bill.payer)} ${esc(who)}</span></div>
        <div class="field"><small>${TEXT.split}</small><ul class="shares">${bill.among.map((id) =>
          `<li${id === "me" ? ' class="me"' : ""}>${avatar(id)}<span>${esc(name(id))}</span><b class="num">${money(share[id])}</b></li>`).join("")}</ul></div>
        ${share.me || bill.payer === "me" ? `<div class="field mine"><small>${TEXT.yourShare}</small><b class="num ${tone(mine)}">${money(mine, true)}</b></div>` : ""}`
        + actions(button("delete", TEXT.deleteBill, "danger", "i-x"), button("close", TEXT.close, "save")),
      onClick(b) { if (b.dataset.act === "delete") return change("delete_bill", () => { entries = entries.filter((e) => e !== bill); }); },
      focus: '[data-act="close"].save',
    };
  }

  function paymentSheet(payment) {
    return {
      sheet: "payment",
      title: TEXT.payment,
      html: () => head(TEXT.payment)
        + `<div class="field payflow">${avatar(payment.from)}<span class="arrow-line" aria-hidden="true"></span>${avatar(payment.to)}</div>
        <div class="field center"><strong class="num amount">${money(payment.amount)}</strong><span class="each">${esc(TEXT.payLine(payment.from, payment.to))} · ${TEXT.viaMethod}</span></div>`
        + actions(button("delete", TEXT.deletePayment, "danger", "i-x"), button("close", TEXT.close, "save")),
      onClick(b) { if (b.dataset.act === "delete") return change("delete_payment", () => { entries = entries.filter((e) => e !== payment); }); },
      focus: '[data-act="close"].save',
    };
  }

  function recordSheet(move) {
    const [from, to, amount] = move.split(":");
    const cents = Number(amount);
    return {
      sheet: "record",
      title: TEXT.recordPayment,
      html: () => head(TEXT.recordPayment)
        + `<div class="field payflow">${avatar(from)}<span class="arrow-line" aria-hidden="true"></span>${avatar(to)}</div>
        <div class="field center"><strong class="num amount">${money(cents)}</strong><span class="each">${esc(TEXT.payLine(from, to))} · ${TEXT.viaMethod}</span></div>`
        + actions(button("close", TEXT.cancel, "ghost"), button("record", TEXT.record, "save", "i-check")),
      onClick(b) {
        if (b.dataset.act !== "record") return;
        const payment = { kind: "payment", from, to, amount: cents };
        return change("record_payment", () => { entries.unshift(payment); fresh = payment; }, to === "me" ? TEXT.paidYou(name(from), money(cents)) : null);
      },
      focus: '[data-act="record"]',
    };
  }

  function personSheet(id) {
    const net = balances();
    const paid = bills().filter((b) => b.payer === id).reduce((s, b) => s + b.amount, 0);
    const owed = bills().reduce((s, b) => s + (shares(b)[id] || 0), 0);
    const moves = settlements(net).filter((m) => m.from === id || m.to === id);
    return {
      sheet: "person",
      title: name(id),
      html: () => `<span class="grabber" aria-hidden="true"></span>
        <div class="sheet-head">${avatar(id)}<h4>${esc(name(id))}</h4><button type="button" class="sheet-x" data-act="close" aria-label="${TEXT.close}">${icon("i-x")}</button></div>
        <div class="field"><small>${TEXT.balance}</small><strong class="num amount ${tone(net[id])}">${money(net[id], true)}</strong></div>
        <ul class="shares"><li><span>${TEXT.paidTotal}</span><b class="num">${money(paid)}</b></li><li><span>${TEXT.shareTotal}</span><b class="num">${money(owed)}</b></li></ul>
        ${moves.length ? `<div class="field"><small>${TEXT.toSettle}</small><ul class="moves">${moves.map((m) => `<li><button type="button" class="move" ${moveAttr(m)}>${avatar(m.from)}<span class="arrow">${esc(name(m.from))} → ${esc(name(m.to))}</span><b class="num">${money(m.amount)}</b>${chevron}</button></li>`).join("")}</ul></div>` : ""}`
        + actions(button("close", TEXT.close, "save")),
      onClick(b) { if (b.dataset.move) return { next: recordSheet(b.dataset.move) }; },
      focus: '[data-act="close"].save',
    };
  }

  function categorySheet(key) {
    const list = bills().filter((b) => b.category === key);
    const total = list.reduce((s, b) => s + b.amount, 0);
    return {
      sheet: "category",
      title: TEXT[key],
      html: () => head(TEXT[key], CATEGORY[key])
        + `<div class="field"><strong class="num amount">${money(total)}</strong><span class="each">${TEXT.bills(list.length)}</span></div>
        <ul class="list sheet-list">${list.map((b) => `<li><button type="button" class="row" data-bill="${entries.indexOf(b)}"><span class="cat">${icon(b.icon)}</span><span class="t"><b>${esc(TEXT.titles[b.title])}</b><small>${esc(fill(TEXT.paid, { name: name(b.payer) }))}</small></span><span class="v num"><span>${money(b.amount)}</span></span></button></li>`).join("")}</ul>`
        + actions(button("close", TEXT.close, "save")),
      onClick(b) { if (b.dataset.bill) return { next: billSheet(entries[Number(b.dataset.bill)]) }; },
      focus: '[data-act="close"].save',
    };
  }

  function paintSheet() {
    sheet.setAttribute("aria-label", current.title);
    sheet.innerHTML = current.html();
  }
  sheet.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !current) return;
    if (b.dataset.act === "close") return closeSheet();
    const result = current.onClick(b);
    if (result === "rerender") {
      const key = b.dataset.payer ? `[data-payer="${b.dataset.payer}"]` : `[data-among="${b.dataset.among}"]`;
      paintSheet();
      sheet.querySelector(key)?.focus();
    } else if (result && result.next) {
      current = result.next;
      track("preview_sheet_open", { sheet: current.sheet });
      paintSheet();
      sheet.scrollTop = 0;
      sheet.querySelector(current.focus)?.focus({ preventScroll: true });
    }
  });
  sheet.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.stopPropagation(); closeSheet(); }
    if (e.key !== "Tab") return;
    const items = [...sheet.querySelectorAll("button")];
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
  });
  scrim.addEventListener("click", () => closeSheet());

  function openSheet(kind, from) {
    track("preview_sheet_open", { sheet: kind.sheet });
    current = kind;
    opener = from || splitButton;
    paintSheet();
    scrim.hidden = sheet.hidden = false;
    sheet.scrollTop = 0;
    screen.classList.add("sheet-open");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scrim.classList.add("show");
      sheet.classList.add("show");
    }));
    sheet.querySelector(current.focus)?.focus({ preventScroll: true });
  }
  function closeSheet(after) {
    scrim.classList.remove("show");
    sheet.classList.remove("show");
    screen.classList.remove("sheet-open");
    const back = opener;
    current = null;
    const done = () => {
      scrim.hidden = sheet.hidden = true;
      if (after) after();
      // The row that opened the sheet may be gone after a change: then the tab keeps the focus.
      (back && back.isConnected ? back : tabs.find((t) => t.getAttribute("aria-selected") === "true"))?.focus({ preventScroll: true });
    };
    if (reduceMotion.matches) done(); else setTimeout(done, 240);
  }

  // A change saves on the device and joins the offline queue, as in the app.
  function change(action, apply, paidYou) {
    track("preview_change", { action });
    closeSheet(() => {
      apply();
      queued += 1;
      const keep = tab;
      select(fresh ? "bills" : keep, true);
      fresh = null;
      bump('[data-pv="queue"]', TEXT.queue(queued));
      if (paidYou) bump(".float-pay b", paidYou);
    });
  }
  function bump(selector, text) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = text;
    const card = el.closest(".float");
    card.classList.remove("bump");
    void card.offsetWidth;
    card.classList.add("bump");
  }

  // The status bar's clock: the device's time, as an iPhone's status bar writes it (no AM or PM), every minute.
  const clock = screen.querySelector('[data-pv="clock"]');
  if (clock) {
    // Why: only the languages whose clock differs from the page's own tag (Latin digits, Taiwan's Traditional Chinese,
    // the US's English); any other uses the page's tag, which boot.js sets for every language.
    const format = new Intl.DateTimeFormat(window.localized({ ar: "ar-u-nu-latn", "zh-Hant": "zh-Hant-TW", bn: "bn-u-nu-latn", ur: "ur-u-nu-latn", fa: "fa-u-nu-latn-ca-gregory", mr: "mr-u-nu-latn", en: "en-US" }) || document.documentElement.lang, { hour: "numeric", minute: "2-digit" });
    const tick = () => {
      clock.textContent = format.formatToParts(new Date())
        .filter((part) => ["hour", "minute", "literal"].includes(part.type)).map((part) => part.value).join("").trim();
      setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    tick();
  }

  splitButton.addEventListener("click", () => openSheet(splitSheet(), splitButton));

  // The balance card's faces: each one opens that person, as Balances does.
  const faces = screen.querySelector(".balance .faces");
  if (faces) {
    faces.removeAttribute("aria-hidden");
    faces.setAttribute("role", "group");
    faces.innerHTML = everyone.map((id) => `<button type="button" class="face" data-person="${id}" aria-label="${esc(name(id))}">${avatar(id)}</button>`).join("");
    faces.addEventListener("click", (e) => {
      const face = e.target.closest(".face");
      if (face) openSheet(personSheet(face.dataset.person), face);
    });
  }
  select("bills", false);
})();
