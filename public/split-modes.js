// The landing's "Split it the way it really was" card, working as the app's split editor (blitz-split-client,
// feature/split_bill): each chip, a way to split, opens that way's editor on the same bill, a $132 pizza night that
// Pedro paid, among the phone's four people (preview.js), or the receipt the card beside reads (scan.js).
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
  const lang = ["pt", "es", "fr", "de", "it", "pl", "nl", "tr", "id", "ja"].includes(root.dataset.lang) ? root.dataset.lang : "en";
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
      items: { pizza: "Large pizza", beer: "Beer", salad: "Salad", draft: "Draft beer", shrimp: "Shrimp platter" },
      receiptBill: "Harbor Bar",
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
      items: { pizza: "Pizza grande", beer: "Cerveja", salad: "Salada", draft: "Chope", shrimp: "Porção de camarão" },
      receiptBill: "Bar do Porto",
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
      items: { pizza: "Pizza grande", beer: "Cerveza", salad: "Ensalada", draft: "Cerveza", shrimp: "Porción de camarones" },
      receiptBill: "Bar del Puerto",
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
      items: { pizza: "Grande pizza", beer: "Bière", salad: "Salade", draft: "Bière pression", shrimp: "Plateau de crevettes" },
      receiptBill: "Bar du Port",
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
    de: {
      bill: "Pizzaabend", paid: "Pedro hat bezahlt", notIn: "Nicht dabei",
      each: "{a} pro Person", among: "{a} auf {n} Personen.", amongOne: "{a} für 1 Person.", out: "{name} ist nicht dabei.",
      nobody: "Noch niemand dabei", nobodyEqual: "Wähl mindestens eine Person aus, um {a} aufzuteilen.",
      checkAll: "Alle auswählen", uncheckAll: "Alle abwählen",
      left: "Es fehlen {a}", over: "{a} zu viel", closed: "Passt: {a}",
      progress: "Bisher {a} von {b}.", closedMsg: "Die Teile ergeben genau den Gesamtbetrag.",
      parts: "{a} in {n} Anteilen", personParts: "{name} hat {n} Anteile.", nobodyShares: "Gib mindestens einer Person einen Anteil, um {a} aufzuteilen.",
      ofEach: "{p} jeder Ausgabe", ofBill: "{p} der Ausgabe", incomeDetail: "Der Anteil jeder Person richtet sich nach ihrem Einkommen.", perMonth: "/Monat",
      service: "Service ({p})", serviceSub: "Nach dem, was jede Person hatte",
      loose: "Markier, wer was hatte", looseDetail: "Tipp bei jeder Position auf die Gesichter, um zu markieren, wer sie hatte.",
      itemsClosed: "{a} für Positionen und {b} Service.", nobodyItem: "Niemand ausgewählt", eachItem: "{a} pro Person",
      items: { pizza: "Große Pizza", beer: "Bier", salad: "Salat", draft: "Bier vom Fass", shrimp: "Garnelenplatte" },
      receiptBill: "Hafenbar",
      hint: {
        equal: "Geht es nicht glatt auf, gehen die übrigen Cent an die Person, die bezahlt hat.",
        amounts: "Wer bei {zero} bleibt, ist bei der Ausgabe nicht dabei.",
        percent: "Nur ganze Zahlen. Die übrigen Cent gehen an die Person, die bezahlt hat.",
        shares: "Nimm Anteile, wenn jemand mehr hatte, etwa wer eine Begleitung mitgebracht hat.",
        income: "Die Einkommen bleiben auf dem Gerät. Die Gruppe sieht nur die Prozente.",
        items: "Jede Position wird unter denen aufgeteilt, die sie hatten, und der Service nach dem, was jede Person hatte.",
      },
      label: {
        amount: "Betrag von {name}", percent: "Prozent von {name}", income: "Monatseinkommen von {name}",
        less: "Ein Anteil weniger für {name}", more: "Ein Anteil mehr für {name}", had: "Wer hatte {item}",
      },
    },
    it: {
      bill: "Serata pizza", paid: "Pedro ha pagato", notIn: "Non partecipa",
      each: "{a} a testa", among: "{a} tra {n} persone.", amongOne: "{a} per 1 persona.", out: "{name} non partecipa.",
      nobody: "Ancora nessuno partecipa", nobodyEqual: "Seleziona almeno una persona per dividere {a}.",
      checkAll: "Seleziona tutti", uncheckAll: "Deseleziona tutti",
      left: "Mancano {a}", over: "{a} in più", closed: "I conti tornano: {a}",
      progress: "Finora {a} su {b}.", closedMsg: "La somma delle parti è uguale al totale.",
      parts: "{a} in {n} quote", personParts: "{name} ha {n} quote.", nobodyShares: "Dai almeno una quota a qualcuno per dividere {a}.",
      ofEach: "{p} di ogni spesa", ofBill: "{p} della spesa", incomeDetail: "La parte di ciascuno segue il suo reddito.", perMonth: "/mese",
      service: "Servizio ({p})", serviceSub: "In proporzione a quanto ha preso ciascuno",
      loose: "Segna chi ha preso cosa", looseDetail: "Tocca i volti su ogni voce per segnare chi l’ha presa.",
      itemsClosed: "{a} di voci e {b} di servizio.", nobodyItem: "Nessuno selezionato", eachItem: "{a} a testa",
      items: { pizza: "Pizza grande", beer: "Birra", salad: "Insalata", draft: "Birra alla spina", shrimp: "Piatto di gamberi" },
      receiptBill: "Bar del Porto",
      hint: {
        equal: "Quando la divisione non è esatta, i centesimi in più vanno a chi ha pagato.",
        amounts: "Chi resta a {zero} è fuori dalla spesa.",
        percent: "Solo numeri interi. I centesimi in più vanno a chi ha pagato.",
        shares: "Usa le quote quando qualcuno prende di più, come chi porta qualcuno con sé.",
        income: "I redditi restano sul dispositivo. Il gruppo vede solo le percentuali.",
        items: "Ogni voce è divisa tra chi l’ha presa, e il servizio in base a quanto ha preso ciascuno.",
      },
      label: {
        amount: "Importo di {name}", percent: "Percentuale di {name}", income: "Reddito mensile di {name}",
        less: "Una quota in meno per {name}", more: "Una quota in più per {name}", had: "Chi ha preso {item}",
      },
    },
    // Polish: a message with "|" holds its forms for {n}, "one|few|many" or "few|many", and fill picks one. A name is
    // never declined, so where Polish would need its case it stands after a colon.
    pl: {
      bill: "Wieczór z pizzą", paid: "Pedro zapłacił(a)", notIn: "Poza podziałem",
      each: "{a} na osobę", among: "{a} na {n} osoby.|{a} na {n} osób.", amongOne: "{a} na 1 osobę.", out: "{name} nie bierze udziału.",
      nobody: "Nikt jeszcze nie bierze udziału", nobodyEqual: "Zaznacz co najmniej jedną osobę, żeby podzielić {a}.",
      checkAll: "Zaznacz wszystkich", uncheckAll: "Odznacz wszystkich",
      left: "Brakuje {a}", over: "{a} za dużo", closed: "Zgadza się: {a}",
      progress: "Na razie {a} z {b}.", closedMsg: "Części sumują się do całości.",
      parts: "{a} na {n} udział|{a} na {n} udziały|{a} na {n} udziałów", personParts: "{name} ma {n} udziały.|{name} ma {n} udziałów.",
      nobodyShares: "Daj komuś co najmniej jeden udział, żeby podzielić {a}.",
      ofEach: "{p} każdego wydatku", ofBill: "{p} wydatku", incomeDetail: "Część każdej osoby zależy od jej dochodu.", perMonth: "/mies.",
      service: "Serwis ({p})", serviceSub: "Proporcjonalnie do tego, co kto zamówił",
      loose: "Zaznacz, kto co zamówił", looseDetail: "Dotknij twarzy przy każdej pozycji, żeby zaznaczyć, kto ją zamówił.",
      itemsClosed: "{a} za pozycje i {b} za serwis.", nobodyItem: "Nikogo nie zaznaczono", eachItem: "{a} na osobę",
      items: { pizza: "Duża pizza", beer: "Piwo", salad: "Sałatka", draft: "Piwo z beczki", shrimp: "Półmisek krewetek" },
      receiptBill: "Bar Portowy",
      hint: {
        equal: "Gdy nie dzieli się równo, pozostałe centy trafiają do osoby, która zapłaciła.",
        amounts: "Kto zostaje przy {zero}, wypada z wydatku.",
        percent: "Tylko liczby całkowite. Pozostałe centy trafiają do osoby, która zapłaciła.",
        shares: "Użyj udziałów, gdy ktoś ma więcej, np. gdy przychodzi z osobą towarzyszącą.",
        income: "Dochody zostają na urządzeniu. Grupa widzi tylko procenty.",
        items: "Każda pozycja dzieli się między osoby, które ją zamówiły, a serwis według tego, co kto zamówił.",
      },
      label: {
        amount: "Kwota: {name}", percent: "Procent: {name}", income: "Dochód miesięczny: {name}",
        less: "Jeden udział mniej: {name}", more: "Jeden udział więcej: {name}", had: "Kto zamówił: {item}",
      },
    },
    nl: {
      bill: "Pizza-avond", paid: "Pedro betaalde", notIn: "Doet niet mee",
      each: "{a} per persoon", among: "{a} over {n} personen.", amongOne: "{a} voor 1 persoon.", out: "{name} doet niet mee.",
      nobody: "Nog niemand doet mee", nobodyEqual: "Vink minstens één persoon aan om {a} te verdelen.",
      checkAll: "Alles aanvinken", uncheckAll: "Alles uitvinken",
      left: "Nog {a}", over: "{a} te veel", closed: "Klopt: {a}",
      progress: "Al {a} van {b}.", closedMsg: "De delen tellen op tot het totaal.",
      parts: "{n} delen van {a}", personParts: "{name} heeft {n} delen.", nobodyShares: "Geef minstens één persoon een deel om {a} te verdelen.",
      ofEach: "{p} van elke uitgave", ofBill: "{p} van de rekening", incomeDetail: "Ieders deel volgt het inkomen.", perMonth: "/mnd",
      service: "Service ({p})", serviceSub: "Naar verhouding van wat ieder had",
      loose: "Geef aan wie wat had", looseDetail: "Tik op de gezichten bij elk item om aan te geven wie het had.",
      itemsClosed: "{a} aan items en {b} service.", nobodyItem: "Niemand aangevinkt", eachItem: "{a} per persoon",
      items: { pizza: "Grote pizza", beer: "Bier", salad: "Salade", draft: "Tapbier", shrimp: "Garnalenschotel" },
      receiptBill: "Havenbar",
      hint: {
        equal: "Gaat het niet precies op, dan gaan de overgebleven centen naar wie betaalde.",
        amounts: "Wie op {zero} blijft staan, doet niet mee aan de rekening.",
        percent: "Alleen hele getallen. De overgebleven centen gaan naar wie betaalde.",
        shares: "Gebruik delen als iemand meer heeft, bijvoorbeeld wie iemand meeneemt.",
        income: "Inkomens blijven op het apparaat. De groep ziet alleen de percentages.",
        items: "Elk item wordt verdeeld over wie het had, en de service naar wat ieder had.",
      },
      label: {
        amount: "Bedrag van {name}", percent: "Percentage van {name}", income: "Maandinkomen van {name}",
        less: "Eén deel minder voor {name}", more: "Eén deel meer voor {name}", had: "Wie had {item}",
      },
    },
    // Turkish: a name takes no case ending, so where Turkish would need one it stands before a colon; the percent sign
    // goes before the number (pct).
    tr: {
      bill: "Pizza gecesi", paid: "Pedro ödedi", notIn: "Bu masrafta yok",
      each: "Kişi başı {a}", among: "{a}, {n} kişiye.", amongOne: "{a}, 1 kişiye.", out: "{name} dahil değil.",
      nobody: "Henüz kimse dahil değil", nobodyEqual: "{a} tutarını bölmek için en az bir kişiyi işaretle.",
      checkAll: "Tümünü işaretle", uncheckAll: "İşaretleri kaldır",
      left: "{a} kaldı", over: "{a} fazla", closed: "Tamam: {a}",
      progress: "Şimdilik {a} / {b}.", closedMsg: "Paylar toplamı tutuyor.",
      parts: "{a}, {n} paya", personParts: "{name}: {n} pay.", nobodyShares: "{a} tutarını bölmek için en az bir kişiye pay ver.",
      ofEach: "her masrafta {p}", ofBill: "toplamda {p}", incomeDetail: "Herkesin payı gelirine göre.", perMonth: "/ay",
      service: "Servis ({p})", serviceSub: "Herkesin aldığı orana göre",
      loose: "Kimin ne aldığını işaretle", looseDetail: "Kimin aldığını işaretlemek için her üründeki yüzlere dokun.",
      itemsClosed: "Ürünlere {a}, servise {b}.", nobodyItem: "Kimse işaretlenmedi", eachItem: "Kişi başı {a}",
      items: { pizza: "Büyük pizza", beer: "Bira", salad: "Salata", draft: "Fıçı bira", shrimp: "Karides tabağı" },
      receiptBill: "Liman Bar",
      hint: {
        equal: "Tam bölünmediğinde artan sentler ödeyen kişiye gider.",
        amounts: "{zero} olarak kalan kişi masrafa dahil olmaz.",
        percent: "Yalnızca tam sayılar. Artan sentler ödeyen kişiye gider.",
        shares: "Biri daha fazla pay alacaksa, örneğin yanında birini getirdiyse, payları kullan.",
        income: "Gelirler cihazda kalır. Grup yalnızca yüzdeleri görür.",
        items: "Her ürün onu alanlar arasında, servis de herkesin aldığına göre bölünür.",
      },
      label: {
        amount: "{name}: tutar", percent: "{name}: yüzde", income: "{name}: aylık gelir",
        less: "{name}: bir pay az", more: "{name}: bir pay fazla", had: "{item}: kim aldı",
      },
    },
    id: {
      bill: "Malam pizza", paid: "Pedro bayar", notIn: "Tidak ikut",
      each: "{a} per orang", among: "{a} dibagi {n} orang.", amongOne: "{a} untuk 1 orang.", out: "{name} tidak ikut.",
      nobody: "Belum ada yang ikut", nobodyEqual: "Centang minimal satu orang untuk membagi {a}.",
      checkAll: "Centang semua", uncheckAll: "Hapus semua centang",
      left: "Kurang {a}", over: "Lebih {a}", closed: "Pas: {a}",
      progress: "Baru {a} dari {b}.", closedMsg: "Jumlah bagiannya sama dengan total.",
      parts: "{n} porsi dari {a}", personParts: "{name} dapat {n} porsi.", nobodyShares: "Beri minimal satu orang porsi untuk membagi {a}.",
      ofEach: "{p} dari tiap tagihan", ofBill: "{p} dari tagihan", incomeDetail: "Bagian tiap orang mengikuti penghasilannya.", perMonth: "/bln",
      service: "Layanan ({p})", serviceSub: "Sesuai pesanan masing-masing",
      loose: "Tandai siapa pesan apa", looseDetail: "Ketuk wajah di tiap item untuk menandai siapa yang memesannya.",
      itemsClosed: "{a} untuk item dan {b} untuk layanan.", nobodyItem: "Belum ada yang dicentang", eachItem: "{a} per orang",
      items: { pizza: "Pizza besar", beer: "Bir", salad: "Salad", draft: "Bir draft", shrimp: "Platter udang" },
      receiptBill: "Bar Pelabuhan",
      hint: {
        equal: "Kalau tidak bisa dibagi rata, sisa sennya masuk ke yang membayar.",
        amounts: "Yang tetap di {zero} tidak ikut tagihan ini.",
        percent: "Hanya bilangan bulat. Sisa sennya masuk ke yang membayar.",
        shares: "Pakai porsi kalau ada yang dapat lebih, misalnya yang membawa teman.",
        income: "Penghasilan tetap di perangkat. Grup hanya melihat persentasenya.",
        items: "Tiap item dibagi di antara yang memesannya, dan biaya layanan sesuai pesanan masing-masing.",
      },
      label: {
        amount: "Nominal {name}", percent: "Persentase {name}", income: "Penghasilan bulanan {name}",
        less: "Kurangi satu porsi {name}", more: "Tambah satu porsi {name}", had: "Siapa yang pesan {item}",
      },
    },
    ja: {
      bill: "ピザナイト", paid: "Pedroが支払い", notIn: "今回は対象外",
      each: "1人{a}", among: "{a}を{n}人で。", amongOne: "{a}を1人で。", out: "{name}は対象外。",
      nobody: "まだ誰も入っていません", nobodyEqual: "{a}を分けるには、少なくとも1人にチェックしてください。",
      checkAll: "すべてチェック", uncheckAll: "すべて外す",
      left: "あと{a}", over: "{a}超過", closed: "ぴったり：{a}",
      progress: "現在{b}のうち{a}。", closedMsg: "各自の分が合計と一致しています。",
      parts: "{a}を{n}口で", personParts: "{name}は{n}口。", nobodyShares: "{a}を分けるには、少なくとも1人に1口割り当ててください。",
      ofEach: "各支出の{p}", ofBill: "支出の{p}", incomeDetail: "各自の分は収入に応じて決まります。", perMonth: "/月",
      service: "サービス料（{p}）", serviceSub: "各自が頼んだ分に応じて",
      loose: "誰が何を頼んだかチェック", looseDetail: "品目ごとに、頼んだ人の顔をタップしてください。",
      itemsClosed: "品目{a}、サービス料{b}。", nobodyItem: "チェックなし", eachItem: "1人{a}",
      items: { pizza: "ピザ（L）", beer: "ビール", salad: "サラダ", draft: "生ビール", shrimp: "エビの盛り合わせ" },
      receiptBill: "ハーバーバー",
      hint: {
        equal: "割り切れないときは、余りのセントは支払った人に回ります。",
        amounts: "{zero}のままの人は、この支出の対象外になります。",
        percent: "整数のみ。余りのセントは支払った人に回ります。",
        shares: "連れを呼んだ人など、多めに負担する人がいるときは口数を使います。",
        income: "収入は端末内に保存されます。グループには割合だけが表示されます。",
        items: "品目は頼んだ人で分け、サービス料は各自が頼んだ分に応じて分けます。",
      },
      label: {
        amount: "{name}の金額", percent: "{name}の割合", income: "{name}の月収",
        less: "{name}を1口減らす", more: "{name}を1口増やす", had: "{item}を頼んだ人",
      },
    },
  }[lang];
  const plural = new Intl.PluralRules(lang);
  function fill(text, values) {
    const forms = text.split("|");
    if (forms.length > 1) {
      const kind = plural.select(values.n);
      text = forms.length === 3 ? forms[{ one: 0, few: 1 }[kind] ?? 2] : forms[kind === "few" ? 0 : 1];
    }
    return text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
  }

  // Amounts as preview.js writes them: the language's separators, no decimals when they are zero.
  const CURRENCY = { pt: ["R$ ", ",", "."], en: ["$", ".", ","], es: ["$", ",", "."], fr: ["", ",", " ", " $"],
    de: ["", ",", ".", "\u00a0$"], it: ["", ",", ".", "\u00a0$"], pl: ["", ",", "\u00a0", "\u00a0$"],
    nl: ["$\u00a0", ",", "."], tr: ["$", ",", "."], id: ["$", ",", "."], ja: ["$", ".", ","] }[lang];
  function plain(cents) {
    const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY[2]);
    const frac = cents % 100;
    return whole + (frac ? CURRENCY[1] + String(frac).padStart(2, "0") : "");
  }
  const money = (cents) => CURRENCY[0] + plain(cents) + (CURRENCY[3] || "");
  // Turkish writes the sign first: %10.
  const pct = (n) => (["fr", "de"].includes(lang) ? `${n} %` : lang === "tr" ? `%${n}` : `${n}%`);
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

  // The bills: the pizza night ($120 of items, and 10% of service makes $132), and the receipt the card beside reads
  // (scan.js), which "Split these items" brings here, the faces it marked included.
  const BILLS = {
    pizza: {
      title: TEXT.bill,
      items: [
        { key: "pizza", qty: 1, each: 6000, who: [true, true, false, false] },
        { key: "beer", qty: 3, each: 1200, who: [true, false, true, true] },
        { key: "salad", qty: 1, each: 2400, who: [false, false, false, true] },
      ],
    },
    receipt: {
      title: TEXT.receiptBill,
      items: [
        { key: "draft", qty: 2, each: 1400, who: [true, false, true, false] },
        { key: "shrimp", qty: 1, each: 9600, who: [false, true, false, true] },
      ],
    },
  };
  let bill, ITEMS, ITEMS_TOTAL, TOTAL, state;
  // A bill starts every way afresh: everyone in, the amounts and percentages even, a share each. Incomes stay.
  function load(name) {
    bill = BILLS[name];
    ITEMS = bill.items.map((it) => ({ ...it, who: it.who.slice() }));
    ITEMS_TOTAL = sum(ITEMS.map((it) => it.qty * it.each));
    TOTAL = ITEMS_TOTAL + Math.round((ITEMS_TOTAL * SERVICE) / 100);
    state = {
      equal: [true, true, true, true],
      amounts: distribute(TOTAL, [1, 1, 1, 1]),
      percent: [25, 25, 25, 25],
      shares: [1, 1, 1, 1],
      income: state?.income ?? [600000, 400000, 300000, 200000],
    };
  }
  load("pizza");
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
      const field = `<input type="text" inputmode="numeric" autocomplete="off" maxlength="3" value="${state.percent[i]}" aria-label="${fill(TEXT.label.percent, { name })}">`;
      return `<span class="split-field">${lang === "tr" ? `<span>%</span>${field}` : `${field}<span>%</span>`}</span>`;
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
      <div class="split-bill"><span><b>${bill.title}</b><small>${TEXT.paid}</small></span><b class="num">${money(TOTAL)}</b></div>
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

  // "Split these items" in the receipt's card: its bill opens here in Items, the card glows once and comes into view.
  document.addEventListener("split:receipt", () => {
    load("receipt");
    mode = "items";
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.mode === mode)));
    build();
    const tile = demo.closest(".tile");
    const still = !root.classList.contains("motion");
    tile.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "nearest" });
    if (still) return;
    panel.classList.remove("arrived");
    void panel.offsetWidth;
    panel.classList.add("arrived");
  });
})();
