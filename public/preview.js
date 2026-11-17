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

  // Polish, Russian and Ukrainian counts take one form for 1 (and, in Russian and Ukrainian, 21, 31…), another for
  // 2–4 (22–24…) and a third for the rest.
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
      payLine: (from, to) => `${name(from)} ← ${name(to)}`,
      paidYou: (who, value) => `${who}: دفعة ${value} إليك`,
      paidTotal: "إجمالي المدفوع", shareTotal: "الحصة من الفواتير", balance: "الرصيد",
      bills: (n) => `الفواتير: ${n}`,
      titles: { b1: "نُزل لاغوا", b2: "عشاء في ريبيراو", b3: "مشوار إلى الشاطئ", p1: "آيس كريم على الشاطئ", p2: "مشتريات الأسبوع", p3: "موقف السيارات" },
    },
  });
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key]);

  // Turkish writes the percent sign first: %10.
  const pct = (n) => (lang === "tr" ? `%${n}` : `${n}%`);
  // Amounts in the visitor's currency, as the app shows them (money.js).
  const money = window.money.format;

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
    { kind: "bill", title: "b1", icon: "i-bed", category: "lodging", amount: 120000, payer: "me", among: everyone },
    { kind: "bill", title: "b2", icon: "i-food", category: "food", amount: 31200, payer: "ana", among: everyone },
    { kind: "bill", title: "b3", icon: "i-car", category: "transport", amount: 4860, payer: "bruno", among: everyone },
  ];
  const bills = () => entries.filter((e) => e.kind === "bill");
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
    const format = new Intl.DateTimeFormat(window.localized({ "pt-PT": "pt-PT", pt: "pt-BR", es: "es", fr: "fr", de: "de", it: "it", pl: "pl", nl: "nl", tr: "tr", id: "id", ja: "ja", ru: "ru", uk: "uk", ko: "ko", ar: "ar-u-nu-latn", en: "en-US" }), { hour: "numeric", minute: "2-digit" });
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
