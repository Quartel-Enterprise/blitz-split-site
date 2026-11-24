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
  // One of the site's languages: boot.js, in <head>, picked it.
  const lang = root.dataset.lang;
  // analytics.js, in <head>, sends the events; docs/analytics.md lists them.
  const track = (name, params) => window.track?.(name, params);

  const TEXT = window.localized({
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
    // Portugal's Portuguese: only what Portugal says differently, the rest is pt's.
    "pt-PT": {
      nobodyEqual: "Marca pelo menos uma pessoa para dividir {a}.",
      nobodyShares: "Dá pelo menos uma parte a alguém para dividir {a}.",
      ofEach: "{p} de cada despesa", ofBill: "{p} da despesa", incomeDetail: "A parte de cada um segue o rendimento.",
      loose: "Marca quem consumiu", looseDetail: "Toca nas caras de cada item e marca quem consumiu.",
      items: { draft: "Imperial", shrimp: "Petisco de camarão" },
      hint: {
        equal: "Quando não dá conta certa, os cêntimos que sobram ficam com quem pagou.",
        percent: "Só números inteiros. Os cêntimos que sobram ficam com quem pagou.",
        shares: "Usa partes quando alguém consome mais, como quem levou acompanhante.",
        income: "Os rendimentos ficam só no aparelho. O grupo vê só as percentagens.",
        items: "Cada item é dividido por quem consumiu, e o serviço, pelo que cada um consumiu.",
      },
      label: { percent: "Percentagem de {name}", income: "Rendimento mensal de {name}" },
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
        equal: "Gdy nie dzieli się równo, pozostałe grosze trafiają do osoby, która zapłaciła.",
        amounts: "Kto zostaje przy {zero}, wypada z wydatku.",
        percent: "Tylko liczby całkowite. Pozostałe grosze trafiają do osoby, która zapłaciła.",
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
        equal: "Tam bölünmediğinde artan kuruşlar ödeyen kişiye gider.",
        amounts: "{zero} olarak kalan kişi masrafa dahil olmaz.",
        percent: "Yalnızca tam sayılar. Artan kuruşlar ödeyen kişiye gider.",
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
        equal: "Kalau tidak bisa dibagi rata, sisanya masuk ke yang membayar.",
        amounts: "Yang tetap di {zero} tidak ikut tagihan ini.",
        percent: "Hanya bilangan bulat. Sisanya masuk ke yang membayar.",
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
        equal: "割り切れないときは、端数は支払った人に回ります。",
        amounts: "{zero}のままの人は、この支出の対象外になります。",
        percent: "整数のみ。端数は支払った人に回ります。",
        shares: "連れを呼んだ人など、多めに負担する人がいるときは口数を使います。",
        income: "収入は端末内に保存されます。グループには割合だけが表示されます。",
        items: "品目は頼んだ人で分け、サービス料は各自が頼んだ分に応じて分けます。",
      },
      label: {
        amount: "{name}の金額", percent: "{name}の割合", income: "{name}の月収",
        less: "{name}を1口減らす", more: "{name}を1口増やす", had: "{item}を頼んだ人",
      },
    },
    // Russian and Ukrainian: a message with "|" always holds three forms, "one|few|many", since 21, 31… take the one
    // form. A name is never declined, so where the sentence would need its case it stands before a colon.
    ru: {
      bill: "Вечер пиццы", paid: "Pedro оплатил(а)", notIn: "Не участвует",
      each: "{a} с каждого", among: "{a} на {n} человека.|{a} на {n} человека.|{a} на {n} человек.", amongOne: "{a} на 1 человека.", out: "{name} не участвует.",
      nobody: "Пока никто не участвует", nobodyEqual: "Отметь хотя бы одного человека, чтобы разделить {a}.",
      checkAll: "Отметить всех", uncheckAll: "Снять отметки",
      left: "Осталось {a}", over: "Больше на {a}", closed: "Сходится: {a}",
      progress: "Пока {a} из {b}.", closedMsg: "Сумма частей равна итогу.",
      parts: "{a} на {n} долю|{a} на {n} доли|{a} на {n} долей", personParts: "{name}: {n} доля.|{name}: {n} доли.|{name}: {n} долей.",
      nobodyShares: "Дай хотя бы одному человеку долю, чтобы разделить {a}.",
      ofEach: "{p} каждого расхода", ofBill: "{p} расхода", incomeDetail: "Доля каждого зависит от его дохода.", perMonth: "/мес.",
      service: "Обслуживание ({p})", serviceSub: "Пропорционально тому, что каждый заказал",
      loose: "Отметь, кто что заказывал", looseDetail: "Нажимай на лица у каждой позиции, чтобы отметить, кто её заказывал.",
      itemsClosed: "{a} за позиции и {b} за обслуживание.", nobodyItem: "Никто не отмечен", eachItem: "{a} с каждого",
      items: { pizza: "Большая пицца", beer: "Пиво", salad: "Салат", draft: "Разливное пиво", shrimp: "Тарелка креветок" },
      receiptBill: "Портовый бар",
      hint: {
        equal: "Если не делится поровну, оставшиеся копейки получает тот, кто платил.",
        amounts: "Кто остаётся на {zero}, не участвует в расходе.",
        percent: "Только целые числа. Оставшиеся копейки получает тот, кто платил.",
        shares: "Используй доли, когда на кого-то приходится больше, например, если кто-то привёл гостя.",
        income: "Доходы остаются на устройстве. Группа видит только проценты.",
        items: "Каждая позиция делится между теми, кто её заказывал, а обслуживание — по тому, что каждый заказал.",
      },
      label: {
        amount: "Сумма: {name}", percent: "Процент: {name}", income: "Доход в месяц: {name}",
        less: "На одну долю меньше: {name}", more: "На одну долю больше: {name}", had: "Кто заказывал: {item}",
      },
    },
    uk: {
      bill: "Вечір піци", paid: "Pedro сплатив(-ла)", notIn: "Не бере участі",
      each: "{a} з кожного", among: "{a} на {n} людину.|{a} на {n} людини.|{a} на {n} людей.", amongOne: "{a} на 1 людину.", out: "{name} не бере участі.",
      nobody: "Поки ніхто не бере участі", nobodyEqual: "Познач хоча б одну людину, щоб розділити {a}.",
      checkAll: "Позначити всіх", uncheckAll: "Зняти позначки",
      left: "Залишилося {a}", over: "Більше на {a}", closed: "Сходиться: {a}",
      progress: "Поки {a} з {b}.", closedMsg: "Сума частин дорівнює підсумку.",
      parts: "{a} на {n} частку|{a} на {n} частки|{a} на {n} часток", personParts: "{name}: {n} частка.|{name}: {n} частки.|{name}: {n} часток.",
      nobodyShares: "Дай хоча б одній людині частку, щоб розділити {a}.",
      ofEach: "{p} кожної витрати", ofBill: "{p} витрати", incomeDetail: "Частка кожного залежить від його доходу.", perMonth: "/міс.",
      service: "Обслуговування ({p})", serviceSub: "Пропорційно до того, що кожен замовив",
      loose: "Познач, хто що замовляв", looseDetail: "Торкайся облич біля кожної позиції, щоб позначити, хто її замовляв.",
      itemsClosed: "{a} за позиції та {b} за обслуговування.", nobodyItem: "Нікого не позначено", eachItem: "{a} з кожного",
      items: { pizza: "Велика піца", beer: "Пиво", salad: "Салат", draft: "Розливне пиво", shrimp: "Тарілка креветок" },
      receiptBill: "Портовий бар",
      hint: {
        equal: "Якщо не ділиться порівну, залишок копійок отримує той, хто платив.",
        amounts: "Хто залишається на {zero}, не бере участі у витраті.",
        percent: "Лише цілі числа. Залишок копійок отримує той, хто платив.",
        shares: "Використовуй частки, коли на когось припадає більше, наприклад, якщо хтось привів гостя.",
        income: "Доходи залишаються на пристрої. Група бачить лише відсотки.",
        items: "Кожна позиція ділиться між тими, хто її замовляв, а обслуговування — відповідно до того, що кожен замовив.",
      },
      label: {
        amount: "Сума: {name}", percent: "Відсоток: {name}", income: "Дохід на місяць: {name}",
        less: "На одну частку менше: {name}", more: "На одну частку більше: {name}", had: "Хто замовляв: {item}",
      },
    },
    // Korean: one form, so no message holds a "|", and no particle follows a name or an amount: the sentence names
    // them in a label ("제외: Ana") or before a noun ("Ana 님: 2몫"), as the app writes them.
    ko: {
      bill: "피자 파티", paid: "결제: Pedro", notIn: "이번엔 제외",
      each: "1인당 {a}", among: "합계 {a}, {n}명이 나눠요.", amongOne: "합계 {a}, 1명이 부담해요.", out: "제외: {name}.",
      nobody: "아직 아무도 포함되지 않았어요", nobodyEqual: "합계 {a} 나누려면 한 명 이상 선택하세요.",
      checkAll: "모두 선택", uncheckAll: "모두 선택 해제",
      left: "{a} 남음", over: "{a} 초과", closed: "합계가 맞아요: {a}",
      progress: "{b} 중 {a} 배분됨.", closedMsg: "나눈 금액의 합이 합계와 같아요.",
      parts: "합계 {a}, {n}몫", personParts: "{name} 님: {n}몫.", nobodyShares: "합계 {a} 나누려면 한 명 이상에게 몫을 주세요.",
      ofEach: "각 지출의 {p}", ofBill: "지출의 {p}", incomeDetail: "각자의 몫은 소득에 따라 정해져요.", perMonth: "/월",
      service: "봉사료 ({p})", serviceSub: "각자 주문한 만큼 비례해서",
      loose: "항목마다 먹은 사람을 표시하세요", looseDetail: "각 항목의 얼굴을 눌러 먹은 사람을 표시하세요.",
      itemsClosed: "항목 {a}, 봉사료 {b}.", nobodyItem: "선택된 사람 없음", eachItem: "1인당 {a}",
      items: { pizza: "라지 피자", beer: "맥주", salad: "샐러드", draft: "생맥주", shrimp: "새우 플래터" },
      receiptBill: "항구 바",
      hint: {
        equal: "똑같이 나누어떨어지지 않으면 남은 금액은 낸 사람에게 돌아가요.",
        amounts: "금액이 {zero} 그대로인 사람은 이 지출에서 제외돼요.",
        percent: "정수만 입력할 수 있어요. 남은 금액은 낸 사람에게 돌아가요.",
        shares: "누군가 더 많이 부담할 때 비율을 사용하세요. 예를 들어 동행을 데려온 사람처럼요.",
        income: "소득은 기기에만 저장돼요. 그룹에는 퍼센트만 보여요.",
        items: "각 항목은 먹은 사람끼리 나누고, 봉사료는 각자 주문한 만큼 나눠요.",
      },
      label: {
        amount: "{name} 몫", percent: "{name} 퍼센트", income: "{name} 월 소득",
        less: "{name} 몫 하나 줄이기", more: "{name} 몫 하나 늘리기", had: "먹은 사람: {item}",
      },
    },
    // Arabic: a message with "|" holds its six forms for {n}, "zero|one|two|few|many|other", and no verb says anyone's
    // gender: a name stands in a label ("غير مشارك: Ana"), as the app writes them.
    ar: {
      bill: "سهرة البيتزا", paid: "الدافع: Pedro", notIn: "غير مشارك",
      each: "{a} لكل شخص",
      among: "{a} بين {n} شخص.|{a} لشخص واحد.|{a} بين شخصين.|{a} بين {n} أشخاص.|{a} بين {n} شخصًا.|{a} بين {n} شخص.",
      amongOne: "{a} لشخص واحد.", out: "غير مشارك: {name}.",
      nobody: "لا أحد مشارك بعد", nobodyEqual: "يلزم تحديد شخص واحد على الأقل لتقسيم {a}.",
      checkAll: "تحديد الكل", uncheckAll: "إلغاء تحديد الكل",
      left: "المتبقي: {a}", over: "الزيادة: {a}", closed: "المجموع مطابق: {a}",
      progress: "تم توزيع {a} من {b} حتى الآن.", closedMsg: "مجموع الأجزاء يساوي الإجمالي.",
      parts: "{n} حصة من {a}|حصة واحدة من {a}|حصتان من {a}|{n} حصص من {a}|{n} حصة من {a}|{n} حصة من {a}",
      personParts: "{name}: {n} حصة.|{name}: حصة واحدة.|{name}: حصتان.|{name}: {n} حصص.|{name}: {n} حصة.|{name}: {n} حصة.",
      nobodyShares: "يلزم إعطاء حصة لشخص واحد على الأقل لتقسيم {a}.",
      ofEach: "{p} من كل فاتورة", ofBill: "{p} من الفاتورة", incomeDetail: "حصة كل شخص تتبع الدخل.", perMonth: "/شهر",
      service: "رسوم الخدمة ({p})", serviceSub: "بنسبة ما طلبه كل شخص",
      loose: "تحديد من طلب كل عنصر", looseDetail: "يتم التحديد بلمس الوجوه في كل عنصر.",
      itemsClosed: "{a} للعناصر و{b} لرسوم الخدمة.", nobodyItem: "لم يُحدَّد أحد", eachItem: "{a} لكل شخص",
      items: { pizza: "بيتزا كبيرة", beer: "مشروب غازي", salad: "سلطة", draft: "عصير طازج", shrimp: "طبق روبيان" },
      receiptBill: "مقهى الميناء",
      hint: {
        equal: "عندما لا يكون التقسيم متساويًا تمامًا، تذهب السنتات المتبقية إلى الدافع.",
        amounts: "من يبقى مبلغه {zero} يُستبعد من الفاتورة.",
        percent: "أعداد صحيحة فقط. تذهب السنتات المتبقية إلى الدافع.",
        shares: "الحصص مفيدة عندما يكون نصيب أحدهم أكبر، كمن أحضر مرافقًا.",
        income: "تبقى المداخيل على الجهاز. لا ترى المجموعة إلا النسب المئوية.",
        items: "يُقسَّم كل عنصر بين من طلبه، ورسوم الخدمة حسب ما طلبه كل شخص.",
      },
      label: {
        amount: "المبلغ: {name}", percent: "النسبة المئوية: {name}", income: "الدخل الشهري: {name}",
        less: "حصة أقل: {name}", more: "حصة إضافية: {name}", had: "من طلب: {item}",
      },
    },
    // Hindi: one share is हिस्सा and more हिस्से, so the total's shares write one|few|many (Hindi has no few); the rest
    // need no "|" (one person has its own message, and a person's shares show only above one).
    hi: {
      bill: "पिज़्ज़ा नाइट", paid: "Pedro ने भुगतान किया", notIn: "इसमें शामिल नहीं",
      each: "हर एक {a}", among: "{a}, {n} लोगों में बंटा।", amongOne: "{a}, सिर्फ़ 1 व्यक्ति पर।", out: "{name} शामिल नहीं है।",
      nobody: "अभी कोई शामिल नहीं", nobodyEqual: "{a} बांटने के लिए कम से कम एक व्यक्ति चुनें।",
      checkAll: "सभी चुनें", uncheckAll: "सभी हटाएं",
      left: "{a} बाकी", over: "{a} ज़्यादा", closed: "हिसाब मिल गया: {a}",
      progress: "अब तक {b} में से {a}।", closedMsg: "सभी हिस्से मिलकर कुल के बराबर हैं।",
      parts: "{a} का {n} हिस्सा|{a} के {n} हिस्से|{a} के {n} हिस्से", personParts: "{name} के {n} हिस्से हैं।", nobodyShares: "{a} बांटने के लिए कम से कम एक व्यक्ति को हिस्सा दें।",
      ofEach: "हर खर्च का {p}", ofBill: "खर्च का {p}", incomeDetail: "हर एक का हिस्सा उसकी आय के अनुसार होता है।", perMonth: "/महीना",
      service: "सर्विस ({p})", serviceSub: "हर किसी ने जो लिया, उसके अनुपात में",
      loose: "हर आइटम पर मार्क करें कि किसने लिया", looseDetail: "किसने लिया, यह मार्क करने के लिए हर आइटम पर चेहरों को टैप करें।",
      itemsClosed: "आइटम में {a} और सर्विस के {b}।", nobodyItem: "कोई नहीं चुना", eachItem: "हर एक {a}",
      items: { pizza: "लार्ज पिज़्ज़ा", beer: "बियर", salad: "सलाद", draft: "ड्राफ़्ट बियर", shrimp: "झींगा प्लैटर" },
      receiptBill: "हार्बर बार",
      hint: {
        equal: "जब बराबर न बंटे, तो बचे हुए पैसे भुगतान करने वाले को जाते हैं।",
        amounts: "जिसकी रकम {zero} रहती है, वह इस खर्च में शामिल नहीं होता।",
        percent: "सिर्फ़ पूर्ण संख्याएं। बचे हुए पैसे भुगतान करने वाले को जाते हैं।",
        shares: "हिस्से तब इस्तेमाल करें जब किसी का ज़्यादा हो, जैसे जो किसी मेहमान को साथ लाया हो।",
        income: "आय डिवाइस पर ही रहती है। ग्रुप को सिर्फ़ प्रतिशत दिखते हैं।",
        items: "हर आइटम उन लोगों में बंटता है जिन्होंने उसे लिया, और सर्विस इस हिसाब से कि किसने क्या लिया।",
      },
      label: {
        amount: "{name} की रकम", percent: "{name} का प्रतिशत", income: "{name} की मासिक आय",
        less: "{name} का एक हिस्सा कम करें", more: "{name} का एक हिस्सा बढ़ाएं", had: "{item} किसने लिया",
      },
    },
    // Simplified Chinese: one form, so no message holds a "|", and no space between Chinese and a name or an amount.
    zh: {
      bill: "披萨之夜", paid: "Pedro支付", notIn: "不参与",
      each: "每人{a}", among: "{a}由{n}人分摊。", amongOne: "{a}由1人承担。", out: "{name}不参与。",
      nobody: "还没有人参与", nobodyEqual: "至少勾选一人来分摊{a}。",
      checkAll: "全选", uncheckAll: "全部取消",
      left: "还差{a}", over: "超出{a}", closed: "合计正好：{a}",
      progress: "目前已分配{a}，共{b}。", closedMsg: "各部分加起来等于总计。",
      parts: "{a}分成{n}份", personParts: "{name}有{n}份。", nobodyShares: "至少给一人分配份数来分摊{a}。",
      ofEach: "每笔账单的{p}", ofBill: "账单的{p}", incomeDetail: "每人的部分按其收入计算。", perMonth: "/月",
      service: "服务费（{p}）", serviceSub: "按每人的消费比例",
      loose: "标记每个项目是谁点的", looseDetail: "点按每个项目上的头像，标记是谁点的。",
      itemsClosed: "项目{a}，服务费{b}。", nobodyItem: "没有勾选任何人", eachItem: "每人{a}",
      items: { pizza: "大份披萨", beer: "啤酒", salad: "沙拉", draft: "扎啤", shrimp: "大虾拼盘" },
      receiptBill: "港湾酒吧",
      hint: {
        equal: "无法平均分摊时，剩下的零头归付款人。",
        amounts: "金额保持为{zero}的人不参与这笔账单。",
        percent: "只能填整数。剩下的零头归付款人。",
        shares: "有人分摊得更多时用份数，比如带了朋友来的人。",
        income: "收入只保存在设备上。群组只能看到百分比。",
        items: "每个项目由点了它的人分摊，服务费按每人点了什么来分摊。",
      },
      label: {
        amount: "{name}的金额", percent: "{name}的百分比", income: "{name}的月收入",
        less: "{name}减少一份", more: "{name}增加一份", had: "谁点了{item}",
      },
    },
    // Hebrew: a message with "|" holds three forms for {n}, "one|two|other", as the app writes them (fill picks the
    // second for Hebrew's two); no verb says anyone's gender: a name stands in a label ("מחוץ לחשבון: Ana").
    he: {
      bill: "ערב פיצה", paid: "שולם על ידי: Pedro", notIn: "לא בחשבון הזה",
      each: "{a} לכל אחד", among: "{a} בין {n} אנשים.", amongOne: "{a} לאדם אחד.", out: "מחוץ לחשבון: {name}.",
      nobody: "עדיין אין משתתפים", nobodyEqual: "יש לסמן לפחות אדם אחד כדי לפצל {a}.",
      checkAll: "סימון של כולם", uncheckAll: "ביטול הסימון של כולם",
      left: "נותר: {a}", over: "חריגה: {a}", closed: "הסכום מתאים: {a}",
      progress: "חולקו עד עכשיו {a} מתוך {b}.", closedMsg: "סכום החלקים שווה לסה״כ.",
      parts: "חלק אחד של {a}|{n} חלקים של {a}|{n} חלקים של {a}",
      personParts: "{name}: חלק אחד.|{name}: {n} חלקים.|{name}: {n} חלקים.",
      nobodyShares: "יש לתת חלק לאדם אחד לפחות כדי לפצל {a}.",
      ofEach: "{p} מכל חשבון", ofBill: "{p} מהחשבון", incomeDetail: "החלק של כל אחד נקבע לפי ההכנסה.", perMonth: "/חודש",
      service: "שירות ({p})", serviceSub: "באופן יחסי למה שכל אחד הזמין",
      loose: "סימון מי הזמין כל פריט", looseDetail: "נגיעה בפרצופים שעל כל פריט מסמנת מי הזמין אותו.",
      itemsClosed: "{a} בפריטים ו-{b} שירות.", nobodyItem: "אין סימון", eachItem: "{a} לכל אחד",
      items: { pizza: "פיצה גדולה", beer: "בירה", salad: "סלט", draft: "בירה מהחבית", shrimp: "מגש שרימפס" },
      receiptBill: "בר הנמל",
      hint: {
        equal: "כשהחלוקה לא יוצאת שווה, האגורות שנשארות הולכות למי ששילם.",
        amounts: "מי שנשאר עם {zero} לא נכלל בחשבון.",
        percent: "מספרים שלמים בלבד. האגורות שנשארות הולכות למי ששילם.",
        shares: "כדאי להשתמש בחלקים כשלמישהו יש יותר, למשל כשמגיעים עם פלוס אחד.",
        income: "ההכנסות נשארות במכשיר. הקבוצה רואה רק את האחוזים.",
        items: "כל פריט מתחלק בין מי שהזמין אותו, והשירות לפי מה שכל אחד הזמין.",
      },
      label: {
        amount: "הסכום של {name}", percent: "האחוז של {name}", income: "ההכנסה החודשית של {name}",
        less: "חלק אחד פחות ל-{name}", more: "חלק אחד יותר ל-{name}", had: "מי הזמין: {item}",
      },
    },
    // Thai: one form, so no message holds a "|"; a space around a name or an amount, and no full stop.
    th: {
      bill: "คืนพิซซ่า", paid: "Pedro จ่าย", notIn: "ไม่ได้อยู่ในบิลนี้",
      each: "คนละ {a}", among: "{a} หาร {n} คน", amongOne: "{a} สำหรับ 1 คน", out: "{name} ไม่ร่วมหาร",
      nobody: "ยังไม่มีใครร่วมหาร", nobodyEqual: "เลือกอย่างน้อย 1 คนเพื่อหาร {a}",
      checkAll: "เลือกทั้งหมด", uncheckAll: "ไม่เลือกทั้งหมด",
      left: "เหลือ {a}", over: "เกิน {a}", closed: "ครบยอดพอดี: {a}",
      progress: "{a} จาก {b} แล้ว", closedMsg: "ส่วนต่างๆ รวมกันได้เท่ายอดรวม",
      parts: "{n} ส่วน ส่วนละ {a}", personParts: "{name} มี {n} ส่วน", nobodyShares: "ให้ส่วนกับอย่างน้อย 1 คนเพื่อหาร {a}",
      ofEach: "{p} ของแต่ละบิล", ofBill: "{p} ของบิล", incomeDetail: "ส่วนของแต่ละคนเป็นไปตามรายได้", perMonth: "/เดือน",
      service: "ค่าบริการ ({p})", serviceSub: "ตามสัดส่วนที่แต่ละคนสั่ง",
      loose: "ระบุว่าใครสั่งแต่ละรายการ", looseDetail: "แตะใบหน้าบนแต่ละรายการเพื่อระบุว่าใครสั่ง",
      itemsClosed: "รายการ {a} และค่าบริการ {b}", nobodyItem: "ไม่ได้เลือกใคร", eachItem: "คนละ {a}",
      items: { pizza: "พิซซ่าถาดใหญ่", beer: "เบียร์", salad: "สลัด", draft: "เบียร์สด", shrimp: "ชุดกุ้งรวม" },
      receiptBill: "บาร์ริมท่า",
      hint: {
        equal: "หากหารไม่ลงตัว เศษสตางค์ที่เหลือจะเป็นของคนจ่าย",
        amounts: "คนที่ยังเป็น {zero} จะไม่ร่วมหารบิลนี้",
        percent: "ใช้จำนวนเต็มเท่านั้น เศษสตางค์ที่เหลือจะเป็นของคนจ่าย",
        shares: "ใช้ส่วนเมื่อบางคนมีมากกว่า เช่น คนที่พาเพื่อนมาด้วย",
        income: "รายได้จะอยู่ในอุปกรณ์เท่านั้น กลุ่มเห็นแค่เปอร์เซ็นต์",
        items: "แต่ละรายการหารกันระหว่างคนที่สั่ง และค่าบริการหารตามที่แต่ละคนสั่ง",
      },
      label: {
        amount: "ส่วนของ {name}", percent: "เปอร์เซ็นต์ของ {name}", income: "รายได้ต่อเดือนของ {name}",
        less: "ลดส่วนของ {name} 1 ส่วน", more: "เพิ่มส่วนของ {name} 1 ส่วน", had: "ใครสั่ง {item}",
      },
    },
    // Vietnamese: one form, so no message holds a "|"; "bạn" for the user and the app's words (chia đều, theo phần, theo món).
    vi: {
      bill: "Tối pizza", paid: "Pedro đã trả", notIn: "Không tham gia khoản này",
      each: "mỗi người {a}", among: "{a} chia cho {n} người.", amongOne: "{a} cho 1 người.", out: "{name} không tham gia.",
      nobody: "Chưa có ai tham gia", nobodyEqual: "Hãy chọn ít nhất một người để chia {a}.",
      checkAll: "Chọn tất cả", uncheckAll: "Bỏ chọn tất cả",
      left: "còn thiếu {a}", over: "dư {a}", closed: "Đã khớp: {a}",
      progress: "Đến giờ là {a} trên {b}.", closedMsg: "Các phần cộng lại bằng tổng số tiền.",
      parts: "{n} phần, mỗi phần {a}", personParts: "{name} có {n} phần.", nobodyShares: "Hãy cho ít nhất một người một phần để chia {a}.",
      ofEach: "{p} mỗi khoản chi", ofBill: "{p} của khoản chi", incomeDetail: "Phần của mỗi người theo thu nhập của họ.", perMonth: "/tháng",
      service: "Phí dịch vụ ({p})", serviceSub: "Theo tỷ lệ những gì mỗi người đã gọi",
      loose: "Đánh dấu ai đã gọi từng món", looseDetail: "Chạm vào các khuôn mặt trên mỗi món để đánh dấu ai đã gọi.",
      itemsClosed: "{a} tiền món và {b} phí dịch vụ.", nobodyItem: "Chưa chọn ai", eachItem: "mỗi người {a}",
      items: { pizza: "Pizza cỡ lớn", beer: "Bia", salad: "Salad", draft: "Bia tươi", shrimp: "Đĩa tôm" },
      receiptBill: "Quán bar bến cảng",
      hint: {
        equal: "Khi không chia đều được, phần lẻ còn lại thuộc về người đã trả.",
        amounts: "Ai còn ở mức {zero} sẽ không tham gia khoản chi.",
        percent: "Chỉ dùng số nguyên. Phần lẻ còn lại thuộc về người đã trả.",
        shares: "Dùng phần khi có người dùng nhiều hơn, như người dẫn thêm bạn đi cùng.",
        income: "Thu nhập chỉ nằm trên thiết bị. Nhóm chỉ thấy phần trăm.",
        items: "Mỗi món được chia cho những người đã gọi, và phí dịch vụ theo những gì mỗi người đã gọi.",
      },
      label: {
        amount: "Số tiền của {name}", percent: "Phần trăm của {name}", income: "Thu nhập mỗi tháng của {name}",
        less: "Bớt một phần cho {name}", more: "Thêm một phần cho {name}", had: "Ai đã gọi {item}",
      },
    },
    // Traditional Chinese, Taiwan's: one form, so no message holds a "|", no space between Chinese and a name or an
    // amount, and the app's words (平均, 份數, 項目, 服務費).
    "zh-Hant": {
      bill: "披薩之夜", paid: "Pedro支付", notIn: "不參與這筆",
      each: "每人{a}", among: "{a}由{n}人分攤。", amongOne: "{a}由1人負擔。", out: "{name}不參與。",
      nobody: "還沒有人參與", nobodyEqual: "至少勾選一個人來分攤{a}。",
      checkAll: "全選", uncheckAll: "全部取消",
      left: "還差{a}", over: "超出{a}", closed: "剛好相符：{a}",
      progress: "目前已分配{a}，共{b}。", closedMsg: "各部分加起來等於總額。",
      parts: "{a}分成{n}份", personParts: "{name}有{n}份。", nobodyShares: "至少給一個人分配份數來分攤{a}。",
      ofEach: "每筆帳單的{p}", ofBill: "帳單的{p}", incomeDetail: "每個人的部分依其收入計算。", perMonth: "/月",
      service: "服務費（{p}）", serviceSub: "按每個人點的比例",
      loose: "標記每個項目是誰點的", looseDetail: "輕點每個項目上的大頭貼，標記是誰點的。",
      itemsClosed: "項目{a}，服務費{b}。", nobodyItem: "沒有勾選任何人", eachItem: "每人{a}",
      items: { pizza: "大披薩", beer: "啤酒", salad: "沙拉", draft: "生啤酒", shrimp: "大蝦拼盤" },
      receiptBill: "港灣酒吧",
      hint: {
        equal: "無法平均分攤時，剩下的零頭歸付款人。",
        amounts: "金額維持在{zero}的人不參與這筆帳單。",
        percent: "只能填整數。剩下的零頭歸付款人。",
        shares: "有人分得比較多時就用份數，例如多帶一個朋友來的人。",
        income: "收入只存在裝置上。群組只看得到百分比。",
        items: "每個項目由點了它的人分攤，服務費則按每個人點了什麼來分攤。",
      },
      label: {
        amount: "{name}的金額", percent: "{name}的百分比", income: "{name}的每月收入",
        less: "{name}減少一份", more: "{name}增加一份", had: "誰點了{item}",
      },
    },
    // Swedish: like English, no message holds a "|" (one person has its own message, and a person's shares show only
    // above one); "du" for the user and the app's words (lika, andelar, efter inkomst, artiklar).
    sv: {
      bill: "Pizzakväll", paid: "Pedro betalade", notIn: "Inte med i den här",
      each: "{a} var", among: "{a} delat på {n} personer.", amongOne: "{a} för 1 person.", out: "{name} är inte med.",
      nobody: "Ingen är med än", nobodyEqual: "Markera minst en person för att dela {a}.",
      checkAll: "Markera alla", uncheckAll: "Avmarkera alla",
      left: "{a} kvar", over: "{a} för mycket", closed: "Det går ihop: {a}",
      progress: "{a} av {b} hittills.", closedMsg: "Delarna blir tillsammans totalen.",
      parts: "{a} på {n} andelar", personParts: "{name} har {n} andelar.", nobodyShares: "Ge minst en person en andel för att dela {a}.",
      ofEach: "{p} av varje utgift", ofBill: "{p} av utgiften", incomeDetail: "Var och ens del följer deras inkomst.", perMonth: "/mån",
      service: "Service ({p})", serviceSub: "I proportion till vad var och en tog",
      loose: "Markera vem som tog vad", looseDetail: "Tryck på ansiktena vid varje artikel för att markera vem som tog den.",
      itemsClosed: "{a} i artiklar och {b} i service.", nobodyItem: "Ingen markerad", eachItem: "{a} var",
      items: { pizza: "Stor pizza", beer: "Öl", salad: "Sallad", draft: "Fatöl", shrimp: "Räkfat" },
      receiptBill: "Hamnbaren",
      hint: {
        equal: "När det inte går jämnt ut går överblivna ören till den som betalade.",
        amounts: "Den som står kvar på {zero} är inte med i utgiften.",
        percent: "Bara heltal. Överblivna ören går till den som betalade.",
        shares: "Använd andelar när någon har mer, som den som tog med sig en gäst.",
        income: "Inkomsterna stannar på enheten. Gruppen ser bara procenten.",
        items: "Varje artikel delas mellan dem som tog den, och servicen efter vad var och en tog.",
      },
      label: {
        amount: "Belopp för {name}", percent: "Procent för {name}", income: "Månadsinkomst för {name}",
        less: "En andel mindre för {name}", more: "En andel till för {name}", had: "Vem tog {item}",
      },
    },
    // Czech: a message with "|" holds its forms for {n}, "one|few|other" or "few|other" (2 lidé, 5 lidí), and fill picks
    // one. A name is never declined, so where Czech would need its case it stands after a colon.
    cs: {
      bill: "Večer s pizzou", paid: "Pedro zaplatil(a)", notIn: "Není v tomto výdaji",
      each: "{a} na osobu", among: "{a} na {n} lidi.|{a} na {n} lidí.", amongOne: "{a} pro 1 osobu.", out: "{name} není ve výdaji.",
      nobody: "Zatím nikdo není ve výdaji", nobodyEqual: "Zaškrtni aspoň jednoho člověka, abys rozdělil(a) {a}.",
      checkAll: "Zaškrtnout vše", uncheckAll: "Odškrtnout vše",
      left: "Zbývá {a}", over: "{a} navíc", closed: "Sedí to: {a}",
      progress: "Zatím {a} z {b}.", closedMsg: "Části dávají dohromady celek.",
      parts: "{a} na {n} podíl|{a} na {n} podíly|{a} na {n} podílů", personParts: "{name} má {n} podíly.|{name} má {n} podílů.",
      nobodyShares: "Dej aspoň jednomu člověku podíl, abys rozdělil(a) {a}.",
      ofEach: "{p} každého výdaje", ofBill: "{p} výdaje", incomeDetail: "Část každého odpovídá jeho příjmu.", perMonth: "/měs.",
      service: "Obsluha ({p})", serviceSub: "Podle toho, co kdo měl",
      loose: "Označ, kdo co měl", looseDetail: "Klepni na obličeje u každé položky a označ, kdo ji měl.",
      itemsClosed: "{a} za položky a {b} za obsluhu.", nobodyItem: "Nikdo nezaškrtnut", eachItem: "{a} na osobu",
      items: { pizza: "Velká pizza", beer: "Pivo", salad: "Salát", draft: "Točené pivo", shrimp: "Talíř krevet" },
      receiptBill: "Přístavní bar",
      hint: {
        equal: "Když to nejde rozdělit přesně, zbylé haléře dostane ten, kdo platil.",
        amounts: "Kdo zůstane na {zero}, není ve výdaji.",
        percent: "Jen celá čísla. Zbylé haléře dostane ten, kdo platil.",
        shares: "Podíly použij, když má někdo víc, třeba kdo přivedl doprovod.",
        income: "Příjmy zůstávají v zařízení. Skupina vidí jen procenta.",
        items: "Každá položka se dělí mezi ty, kdo ji měli, a obsluha podle toho, co kdo měl.",
      },
      label: {
        amount: "Částka: {name}", percent: "Procento: {name}", income: "Měsíční příjem: {name}",
        less: "O podíl méně: {name}", more: "O podíl víc: {name}", had: "Kdo měl: {item}",
      },
    },
    // Romanian: a message with "|" holds its forms for {n}, "one|few|other" or "few|other", the other with "de"
    // (20 de persoane), and fill picks one; "tu" for the user and the app's words (egal, părți, după venit, produse).
    ro: {
      bill: "Seară cu pizza", paid: "A plătit Pedro", notIn: "Nu participă la aceasta",
      each: "câte {a} fiecare", among: "{a} împărțit la {n} persoane.|{a} împărțit la {n} de persoane.", amongOne: "{a} pentru 1 persoană.", out: "{name} nu participă.",
      nobody: "Încă nu participă nimeni", nobodyEqual: "Bifează cel puțin o persoană ca să împarți {a}.",
      checkAll: "Bifează tot", uncheckAll: "Debifează tot",
      left: "Mai rămân {a}", over: "{a} în plus", closed: "Se potrivește: {a}",
      progress: "{a} din {b} până acum.", closedMsg: "Părțile dau totalul.",
      parts: "{a} în {n} parte|{a} în {n} părți|{a} în {n} de părți", personParts: "{name} are {n} părți.|{name} are {n} de părți.",
      nobodyShares: "Dă cel puțin unei persoane o parte ca să împarți {a}.",
      ofEach: "{p} din fiecare cheltuială", ofBill: "{p} din cheltuială", incomeDetail: "Partea fiecăruia urmează venitul său.", perMonth: "/lună",
      service: "Serviciu ({p})", serviceSub: "Proporțional cu ce a luat fiecare",
      loose: "Bifează cine ce a luat", looseDetail: "Atinge fețele de la fiecare produs ca să bifezi cine l-a luat.",
      itemsClosed: "{a} pe produse și {b} serviciu.", nobodyItem: "Nimeni bifat", eachItem: "câte {a} fiecare",
      items: { pizza: "Pizza mare", beer: "Bere", salad: "Salată", draft: "Bere la halbă", shrimp: "Platou de creveți" },
      receiptBill: "Barul din port",
      hint: {
        equal: "Când nu se împarte exact, banii rămași îi primește cine a plătit.",
        amounts: "Cine rămâne la {zero} nu participă la cheltuială.",
        percent: "Doar numere întregi. Banii rămași îi primește cine a plătit.",
        shares: "Folosește părți când cineva are mai mult, de pildă cine a venit cu un însoțitor.",
        income: "Veniturile rămân pe dispozitiv. Grupul vede doar procentele.",
        items: "Fiecare produs se împarte între cei care l-au luat, iar serviciul după ce a luat fiecare.",
      },
      label: {
        amount: "Suma lui {name}", percent: "Procentul lui {name}", income: "Venitul lunar al lui {name}",
        less: "O parte în minus pentru {name}", more: "O parte în plus pentru {name}", had: "Cine a luat {item}",
      },
    },
    bn: {
      bill: "পিৎজার রাত", paid: "পরিশোধ করেছেন: Pedro", notIn: "এতে নেই",
      each: "প্রত্যেকে {a}", among: "{a}, {n} জনের মধ্যে ভাগ।", amongOne: "{a}, 1 জনের জন্য।", out: "{name} এতে নেই।",
      nobody: "এখনও কেউ যুক্ত নেই", nobodyEqual: "{a} ভাগ করতে অন্তত একজনকে চিহ্নিত করুন।",
      checkAll: "সবাইকে চিহ্নিত করুন", uncheckAll: "সব চিহ্ন তুলে দিন",
      left: "{a} বাকি", over: "{a} বেশি", closed: "মিলেছে: {a}",
      progress: "এখন পর্যন্ত {a} / {b}।", closedMsg: "সব অংশ মিলে মোটের সমান হয়েছে।",
      parts: "{a}: {n} ভাগ", personParts: "{name}: {n} ভাগ।",
      nobodyShares: "{a} ভাগ করতে অন্তত একজনকে একটি ভাগ দিন।",
      ofEach: "প্রতিটি খরচের {p}", ofBill: "খরচের {p}", incomeDetail: "প্রত্যেকের অংশ তাঁর আয় অনুযায়ী হয়।", perMonth: "/মাস",
      service: "সার্ভিস চার্জ ({p})", serviceSub: "কে কতটা নিয়েছেন সেই অনুপাতে",
      loose: "কোন আইটেম কে নিয়েছেন চিহ্নিত করুন", looseDetail: "কে নিয়েছেন তা চিহ্নিত করতে প্রতিটি আইটেমের মুখগুলোতে ট্যাপ করুন।",
      itemsClosed: "আইটেম {a}, সার্ভিস চার্জ {b}।", nobodyItem: "কেউ চিহ্নিত নেই", eachItem: "প্রত্যেকে {a}",
      items: { pizza: "বড় পিৎজা", beer: "সফট ড্রিংক", salad: "সালাদ", draft: "তাজা জুস", shrimp: "চিংড়ি প্ল্যাটার" },
      receiptBill: "বন্দর ক্যাফে",
      hint: {
        equal: "সমানভাবে ভাগ না হলে বাড়তি পয়সা পান যিনি পরিশোধ করেছেন।",
        amounts: "যাঁর পরিমাণ {zero} থাকে, তিনি এই খরচে নেই।",
        percent: "শুধু পূর্ণ সংখ্যা। বাড়তি পয়সা পান যিনি পরিশোধ করেছেন।",
        shares: "কারও অংশ বেশি হলে ভাগ ব্যবহার করুন, যেমন কেউ সাথে একজন অতিথি আনলে।",
        income: "আয়ের তথ্য ডিভাইসেই থাকে। গ্রুপ শুধু শতাংশ দেখতে পায়।",
        items: "প্রতিটি আইটেম ভাগ হয় যাঁরা নিয়েছেন তাঁদের মধ্যে, আর সার্ভিস চার্জ কে কতটা নিয়েছেন সেই অনুযায়ী।",
      },
      label: {
        amount: "পরিমাণ: {name}", percent: "শতাংশ: {name}", income: "মাসিক আয়: {name}",
        less: "এক ভাগ কমান: {name}", more: "এক ভাগ বাড়ান: {name}", had: "কে নিয়েছেন: {item}",
      },
    },
    ms: {
      bill: "Malam piza", paid: "Dibayar oleh Pedro", notIn: "Tidak terlibat",
      each: "{a} seorang", among: "{a} dibahagi antara {n} orang.", amongOne: "{a} untuk 1 orang.", out: "{name} tidak terlibat.",
      nobody: "Belum ada sesiapa terlibat", nobodyEqual: "Tandakan sekurang-kurangnya seorang untuk membahagi {a}.",
      checkAll: "Tanda semua", uncheckAll: "Nyahtanda semua",
      left: "Tinggal {a}", over: "Lebih {a}", closed: "Sepadan: {a}",
      progress: "{a} daripada {b} setakat ini.", closedMsg: "Semua bahagian sepadan dengan jumlah.",
      parts: "{n} bahagian daripada {a}", personParts: "{name}: {n} bahagian.",
      nobodyShares: "Beri sekurang-kurangnya seorang satu bahagian untuk membahagi {a}.",
      ofEach: "{p} daripada setiap bil", ofBill: "{p} daripada bil", incomeDetail: "Bahagian setiap orang mengikut pendapatan.", perMonth: "/bulan",
      service: "Caj servis ({p})", serviceSub: "Mengikut apa yang diambil oleh setiap orang",
      loose: "Tandakan siapa mengambil setiap item", looseDetail: "Ketik wajah pada setiap item untuk menandakan siapa yang mengambilnya.",
      itemsClosed: "{a} untuk item dan {b} untuk caj servis.", nobodyItem: "Tiada yang ditanda", eachItem: "{a} seorang",
      items: { pizza: "Piza besar", beer: "Minuman ringan", salad: "Salad", draft: "Jus segar", shrimp: "Platter udang" },
      receiptBill: "Kafe Pelabuhan",
      hint: {
        equal: "Jika tidak dapat dibahagi sama rata, sen yang berlebihan diberikan kepada orang yang membayar.",
        amounts: "Sesiapa yang kekal pada {zero} tidak terlibat dalam bil.",
        percent: "Nombor bulat sahaja. Sen yang berlebihan diberikan kepada orang yang membayar.",
        shares: "Gunakan bahagian apabila seseorang mengambil lebih, contohnya orang yang membawa teman.",
        income: "Pendapatan kekal pada peranti. Kumpulan hanya melihat peratusan.",
        items: "Setiap item dibahagi antara mereka yang mengambilnya, dan caj servis mengikut apa yang diambil oleh setiap orang.",
      },
      label: {
        amount: "Amaun: {name}", percent: "Peratusan: {name}", income: "Pendapatan bulanan: {name}",
        less: "Kurangkan satu bahagian: {name}", more: "Tambah satu bahagian: {name}", had: "Siapa mengambil: {item}",
      },
    },
    el: {
      bill: "Βραδιά πίτσας", paid: "Πλήρωσε: Pedro", notIn: "Δεν συμμετέχει εδώ",
      each: "{a} ανά άτομο", among: "{a} μεταξύ {n} ατόμων.", amongOne: "{a} για 1 άτομο.", out: "Εκτός: {name}.",
      nobody: "Δεν συμμετέχει κανείς ακόμα", nobodyEqual: "Επίλεξε τουλάχιστον ένα άτομο για να μοιράσεις {a}.",
      checkAll: "Επιλογή όλων", uncheckAll: "Αποεπιλογή όλων",
      left: "Απομένουν {a}", over: "{a} παραπάνω", closed: "Βγαίνει σωστά: {a}",
      progress: "{a} από {b} μέχρι στιγμής.", closedMsg: "Τα μέρη βγάζουν το σύνολο.",
      parts: "{a} σε {n} μερίδια", personParts: "{name}: {n} μερίδια.",
      nobodyShares: "Δώσε μερίδιο σε τουλάχιστον ένα άτομο για να μοιράσεις {a}.",
      ofEach: "{p} από κάθε έξοδο", ofBill: "{p} του εξόδου", incomeDetail: "Κάθε μερίδιο ακολουθεί το αντίστοιχο εισόδημα.", perMonth: "/μήνα",
      service: "Σέρβις ({p})", serviceSub: "Ανάλογα με όσα πήρε ο καθένας",
      loose: "Σημείωσε ποιος πήρε τι", looseDetail: "Πάτα τα πρόσωπα σε κάθε είδος για να σημειώσεις ποιος το πήρε.",
      itemsClosed: "{a} σε είδη και {b} σέρβις.", nobodyItem: "Καμία επιλογή", eachItem: "{a} ανά άτομο",
      items: { pizza: "Μεγάλη πίτσα", beer: "Μπίρα", salad: "Σαλάτα", draft: "Βαρελίσια μπίρα", shrimp: "Πιατέλα γαρίδες" },
      receiptBill: "Μπαρ του Λιμανιού",
      hint: {
        equal: "Όταν δεν μοιράζεται ακριβώς, τα λεπτά που περισσεύουν πάνε σε όποιον πλήρωσε.",
        amounts: "Όποιος μένει με {zero} δεν συμμετέχει στο έξοδο.",
        percent: "Μόνο ακέραιοι αριθμοί. Τα λεπτά που περισσεύουν πάνε σε όποιον πλήρωσε.",
        shares: "Χρησιμοποίησε μερίδια όταν κάποιο άτομο έχει περισσότερα, π.χ. αν έφερε συνοδό.",
        income: "Τα εισοδήματα μένουν στη συσκευή. Η ομάδα βλέπει μόνο τα ποσοστά.",
        items: "Κάθε είδος μοιράζεται σε όσους το πήραν και το σέρβις ανάλογα με όσα πήρε ο καθένας.",
      },
      label: {
        amount: "Ποσό: {name}", percent: "Ποσοστό: {name}", income: "Μηνιαίο εισόδημα: {name}",
        less: "Ένα μερίδιο λιγότερο: {name}", more: "Ένα μερίδιο παραπάνω: {name}", had: "Ποιος πήρε: {item}",
      },
    },
    hu: {
      bill: "Pizzaest", paid: "Fizette: Pedro", notIn: "Ebben nem vesz részt",
      each: "{a} fejenként", among: "{a}, {n} fő között.", amongOne: "{a} 1 főre.", out: "{name} nem vesz részt.",
      nobody: "Még senki sem vesz részt", nobodyEqual: "Jelölj be legalább egy személyt. Felosztandó: {a}.",
      checkAll: "Összes kijelölése", uncheckAll: "Kijelölés törlése",
      left: "Hátravan: {a}", over: "Túllépés: {a}", closed: "Stimmel: {a}",
      progress: "Eddig: {a} / {b}.", closedMsg: "A részek kiadják a teljes összeget.",
      parts: "{a}, {n} részre osztva", personParts: "{name}: {n} rész.",
      nobodyShares: "Adj legalább egy személynek részt. Felosztandó: {a}.",
      ofEach: "{p} minden kiadásból", ofBill: "{p} a kiadásból", incomeDetail: "Mindenki része a jövedelméhez igazodik.", perMonth: "/hó",
      service: "Szervizdíj ({p})", serviceSub: "Aszerint, ki mit fogyasztott",
      loose: "Jelöld be, ki mit fogyasztott", looseDetail: "Koppints az arcokra az egyes tételeknél, hogy jelöld, ki fogyasztotta.",
      itemsClosed: "Tételek: {a}, szervizdíj: {b}.", nobodyItem: "Nincs kijelölve senki", eachItem: "{a} fejenként",
      items: { pizza: "Nagy pizza", beer: "Sör", salad: "Saláta", draft: "Csapolt sör", shrimp: "Garnélatál" },
      receiptBill: "Kikötő Bár",
      hint: {
        equal: "Ha nem osztható el pontosan, a maradékot az kapja, aki fizetett.",
        amounts: "Akinél {zero} marad, nem vesz részt a kiadásban.",
        percent: "Csak egész számok. A maradékot az kapja, aki fizetett.",
        shares: "Használj részeket, ha valakire több jut, például ha hozott magával valakit.",
        income: "A jövedelmek az eszközön maradnak. A csoport csak a százalékokat látja.",
        items: "Minden tétel azok között oszlik fel, akik fogyasztották, a szervizdíj pedig aszerint, ki mit fogyasztott.",
      },
      label: {
        amount: "Összeg: {name}", percent: "Százalék: {name}", income: "Havi jövedelem: {name}",
        less: "Eggyel kevesebb rész: {name}", more: "Eggyel több rész: {name}", had: "Ki fogyasztotta: {item}",
      },
    },
    fil: {
      bill: "Gabi ng pizza", paid: "Nagbayad: Pedro", notIn: "Hindi kasali dito",
      each: "{a} bawat isa", among: "{a} para sa {n} tao.", amongOne: "{a} para sa 1 tao.", out: "Hindi kasali: {name}.",
      nobody: "Wala pang kasali", nobodyEqual: "Pumili ng kahit 1 tao para hatiin ang {a}.",
      checkAll: "Piliin lahat", uncheckAll: "Alisin lahat",
      left: "Kulang pa: {a}", over: "Sobra: {a}", closed: "Tugma: {a}",
      progress: "{a} sa {b} sa ngayon.", closedMsg: "Tugma ang mga bahagi sa kabuuan.",
      parts: "{n} bahagi ng {a}", personParts: "{name}: {n} bahagi.",
      nobodyShares: "Bigyan ng bahagi ang kahit 1 tao para hatiin ang {a}.",
      ofEach: "{p} ng bawat gastos", ofBill: "{p} ng gastos", incomeDetail: "Nakabatay sa kita ang bahagi ng bawat isa.", perMonth: "/buwan",
      service: "Service charge ({p})", serviceSub: "Ayon sa kinuha ng bawat isa",
      loose: "Markahan kung sino ang kumuha ng bawat item", looseDetail: "I-tap ang mga mukha sa bawat item para markahan kung sino ang kumuha nito.",
      itemsClosed: "{a} sa mga item at {b} sa service charge.", nobodyItem: "Walang napili", eachItem: "{a} bawat isa",
      items: { pizza: "Malaking pizza", beer: "Beer", salad: "Salad", draft: "Draft beer", shrimp: "Platter ng hipon" },
      receiptBill: "Bar sa Daungan",
      hint: {
        equal: "Kapag hindi eksakto ang hatian, mapupunta sa nagbayad ang sobrang sentimo.",
        amounts: "Hindi kasali sa gastos ang sinumang nasa {zero}.",
        percent: "Buong numero lang. Mapupunta sa nagbayad ang sobrang sentimo.",
        shares: "Gumamit ng bahagi kapag mas marami ang sa isang tao, gaya ng may dalang kasama.",
        income: "Nananatili sa device ang mga kita. Mga porsiyento lang ang nakikita ng grupo.",
        items: "Hinahati ang bawat item sa mga kumuha nito, at ang service charge ayon sa kinuha ng bawat isa.",
      },
      label: {
        amount: "Halaga para kay {name}", percent: "Porsiyento para kay {name}", income: "Buwanang kita ni {name}",
        less: "Bawasan ng 1 bahagi si {name}", more: "Dagdagan ng 1 bahagi si {name}", had: "Sino ang kumuha ng {item}",
      },
    },
    // Urdu: the polite "aap" for the user; nouns keep one form after a number, and labels avoid verbs that mark gender.
    ur: {
      bill: "پیزا نائٹ", paid: "ادا کنندہ: Pedro", notIn: "اس میں شامل نہیں",
      each: "{a} فی کس", among: "{a}، {n} افراد میں تقسیم۔", amongOne: "{a}، 1 شخص کے لیے۔", out: "شامل نہیں: {name}۔",
      nobody: "ابھی کوئی شامل نہیں", nobodyEqual: "{a} تقسیم کرنے کے لیے کم از کم ایک شخص کو منتخب کریں۔",
      checkAll: "سب منتخب کریں", uncheckAll: "سب غیر منتخب کریں",
      left: "باقی: {a}", over: "زائد: {a}", closed: "میزان درست: {a}",
      progress: "اب تک {b} میں سے {a}۔", closedMsg: "حصوں کا مجموعہ کل رقم کے برابر ہے۔",
      parts: "{a} · حصے: {n}", personParts: "{name}: {n} حصے۔", nobodyShares: "{a} تقسیم کرنے کے لیے کم از کم ایک شخص کو حصہ دیں۔",
      ofEach: "ہر بل کا {p}", ofBill: "بل کا {p}", incomeDetail: "ہر ایک کا حصہ آمدنی کے مطابق ہے۔", perMonth: "/ماہ",
      service: "سروس چارج ({p})", serviceSub: "ہر ایک کے آرڈر کے تناسب سے",
      loose: "نشان لگائیں کہ کس نے کیا لیا", looseDetail: "ہر آئٹم پر چہروں کو چھو کر بتائیں کہ وہ کس نے لیا۔",
      itemsClosed: "آئٹمز میں {a} اور سروس چارج میں {b}۔", nobodyItem: "کوئی منتخب نہیں", eachItem: "{a} فی کس",
      items: { pizza: "بڑا پیزا", beer: "سافٹ ڈرنک", salad: "سلاد", draft: "تازہ جوس", shrimp: "جھینگوں کی پلیٹ" },
      receiptBill: "بندرگاہ کیفے",
      hint: {
        equal: "جب رقم برابر تقسیم نہ ہو تو بچے ہوئے پیسے ادا کنندہ کو ملتے ہیں۔",
        amounts: "جس کی رقم {zero} رہے، وہ اس بل میں شامل نہیں۔",
        percent: "صرف پورے اعداد۔ بچے ہوئے پیسے ادا کنندہ کو ملتے ہیں۔",
        shares: "حصے تب استعمال کریں جب کسی کا حصہ زیادہ ہو، جیسے کوئی مہمان ساتھ لائے۔",
        income: "آمدنی ڈیوائس پر ہی رہتی ہے۔ گروپ کو صرف فیصد نظر آتے ہیں۔",
        items: "ہر آئٹم ان میں تقسیم ہوتا ہے جنہوں نے اسے لیا، اور سروس چارج ہر ایک کے آرڈر کے حساب سے۔",
      },
      label: {
        amount: "رقم: {name}", percent: "فیصد: {name}", income: "ماہانہ آمدنی: {name}",
        less: "ایک حصہ کم: {name}", more: "ایک حصہ زیادہ: {name}", had: "کس نے لیا: {item}",
      },
    },
    hr: {
      bill: "Večer uz pizzu", paid: "Platitelj: Pedro", notIn: "Ne sudjeluje u ovome",
      each: "{a} po osobi", among: "{a} na {n} osobu.|{a} na {n} osobe.|{a} na {n} osoba.", amongOne: "{a} za 1 osobu.", out: "Ne sudjeluje: {name}.",
      nobody: "Još nitko ne sudjeluje", nobodyEqual: "Označi barem jednu osobu da podijeliš {a}.",
      checkAll: "Označi sve", uncheckAll: "Poništi sve",
      left: "Preostalo: {a}", over: "Višak: {a}", closed: "Slaže se: {a}",
      progress: "Zasad {a} od {b}.", closedMsg: "Dijelovi se zbrajaju u ukupan iznos.",
      parts: "{a} na {n} udio|{a} na {n} udjela|{a} na {n} udjela", personParts: "{name}: {n} udio.|{name}: {n} udjela.|{name}: {n} udjela.",
      nobodyShares: "Daj barem jednoj osobi udio da podijeliš {a}.",
      ofEach: "{p} svakog troška", ofBill: "{p} troška", incomeDetail: "Udio svake osobe ovisi o njezinu prihodu.", perMonth: "/mj.",
      service: "Usluga ({p})", serviceSub: "Razmjerno onome što je tko uzeo",
      loose: "Označi tko je što uzeo", looseDetail: "Dodirni lica kod svake stavke i označi tko ju je uzeo.",
      itemsClosed: "{a} za stavke i {b} za uslugu.", nobodyItem: "Nitko nije označen", eachItem: "{a} po osobi",
      items: { pizza: "Velika pizza", beer: "Pivo", salad: "Salata", draft: "Točeno pivo", shrimp: "Plata škampa" },
      receiptBill: "Lučki bar",
      hint: {
        equal: "Kad se iznos ne može točno podijeliti, preostali centi idu platitelju.",
        amounts: "Tko ostane na {zero}, ne sudjeluje u trošku.",
        percent: "Samo cijeli brojevi. Preostali centi idu platitelju.",
        shares: "Udjele koristi kad netko ima više, npr. ako je netko doveo pratnju.",
        income: "Prihodi ostaju na uređaju. Grupa vidi samo postotke.",
        items: "Svaka se stavka dijeli među onima koji su je uzeli, a usluga prema onome što je tko uzeo.",
      },
      label: {
        amount: "Iznos: {name}", percent: "Postotak: {name}", income: "Mjesečni prihod: {name}",
        less: "Udio manje: {name}", more: "Udio više: {name}", had: "Tko je uzeo: {item}",
      },
    },
    sr: {
      bill: "Veče uz picu", paid: "Platilac: Pedro", notIn: "Ne učestvuje",
      each: "{a} po osobi", among: "{a} na {n} osobu.|{a} na {n} osobe.|{a} na {n} osoba.", amongOne: "{a} za 1 osobu.", out: "{name} ne učestvuje.",
      nobody: "Još niko ne učestvuje", nobodyEqual: "Označi bar jednu osobu da podeliš {a}.",
      checkAll: "Označi sve", uncheckAll: "Poništi sve",
      left: "Preostalo: {a}", over: "Višak: {a}", closed: "Slaže se: {a}",
      progress: "Zasad {a} od {b}.", closedMsg: "Delovi se slažu sa ukupnim iznosom.",
      parts: "{a} na {n} udeo|{a} na {n} udela|{a} na {n} udela", personParts: "{name} ima {n} udeo.|{name} ima {n} udela.|{name} ima {n} udela.",
      nobodyShares: "Daj bar jednoj osobi udeo da podeliš {a}.",
      ofEach: "{p} svakog troška", ofBill: "{p} troška", incomeDetail: "Deo svake osobe prati njen prihod.", perMonth: "/mes.",
      service: "Usluga ({p})", serviceSub: "Srazmerno onome što je ko uzeo",
      loose: "Označi ko je šta uzeo", looseDetail: "Dodirni lica na svakoj stavci da označiš ko ju je uzeo.",
      itemsClosed: "{a} za stavke i {b} za uslugu.", nobodyItem: "Niko nije označen", eachItem: "{a} po osobi",
      items: { pizza: "Velika pica", beer: "Pivo", salad: "Salata", draft: "Točeno pivo", shrimp: "Plata škampa" },
      receiptBill: "Bar Luka",
      hint: {
        equal: "Kad iznos ne može da se podeli tačno, preostale pare idu onome ko je platio.",
        amounts: "Ko ostane na {zero} ne učestvuje u trošku.",
        percent: "Samo celi brojevi. Preostale pare idu onome ko je platio.",
        shares: "Koristi udele kad neko ima više, na primer kad neko dovede pratnju.",
        income: "Prihodi ostaju na uređaju. Grupa vidi samo procente.",
        items: "Svaka stavka se deli među onima koji su je uzeli, a usluga prema tome ko je šta uzeo.",
      },
      label: {
        amount: "Iznos: {name}", percent: "Procenat: {name}", income: "Mesečni prihod: {name}",
        less: "Udeo manje: {name}", more: "Udeo više: {name}", had: "Ko je uzeo: {item}",
      },
    },
    // Slovak: a message with "|" holds its forms for {n}, "one|few|other" or "few|other" (2 osoby, 5 osôb), and fill picks
    // one. A name is never declined, so where Slovak would need its case it stands after a colon; "ty" for the user.
    sk: {
      bill: "Večer s pizzou", paid: "Pedro zaplatil(a)", notIn: "Nie je v tomto výdavku",
      each: "{a} na osobu", among: "{a} na {n} osoby.|{a} na {n} osôb.", amongOne: "{a} pre 1 osobu.", out: "{name} nie je vo výdavku.",
      nobody: "Zatiaľ nikto nie je vo výdavku", nobodyEqual: "Označ aspoň jednu osobu, aby sa dalo rozdeliť {a}.",
      checkAll: "Označiť všetkých", uncheckAll: "Zrušiť označenie",
      left: "Zostáva {a}", over: "{a} navyše", closed: "Sedí to: {a}",
      progress: "Zatiaľ {a} z {b}.", closedMsg: "Časti dávajú dokopy celú sumu.",
      parts: "{a} na {n} podiel|{a} na {n} podiely|{a} na {n} podielov", personParts: "{name} má {n} podiely.|{name} má {n} podielov.",
      nobodyShares: "Daj aspoň jednej osobe podiel, aby sa dalo rozdeliť {a}.",
      ofEach: "{p} z každého výdavku", ofBill: "{p} z výdavku", incomeDetail: "Časť každého zodpovedá jeho príjmu.", perMonth: "/mes.",
      service: "Obsluha ({p})", serviceSub: "Podľa toho, kto čo mal",
      loose: "Označ, kto čo mal", looseDetail: "Ťukni na tváre pri každej položke a označ, kto ju mal.",
      itemsClosed: "{a} za položky a {b} za obsluhu.", nobodyItem: "Nikto nie je označený", eachItem: "{a} na osobu",
      items: { pizza: "Veľká pizza", beer: "Pivo", salad: "Šalát", draft: "Čapované pivo", shrimp: "Tanier kreviet" },
      receiptBill: "Prístavný bar",
      hint: {
        equal: "Keď sa to nedá rozdeliť presne, zvyšné centy dostane ten, kto platil.",
        amounts: "Kto zostane na {zero}, nie je vo výdavku.",
        percent: "Iba celé čísla. Zvyšné centy dostane ten, kto platil.",
        shares: "Podiely použi, keď má niekto viac, napríklad ak niekto priviedol doprovod.",
        income: "Príjmy zostávajú v zariadení. Skupina vidí iba percentá.",
        items: "Každá položka sa delí medzi tých, ktorí ju mali, a obsluha podľa toho, kto čo mal.",
      },
      label: {
        amount: "Suma: {name}", percent: "Percento: {name}", income: "Mesačný príjem: {name}",
        less: "O podiel menej: {name}", more: "O podiel viac: {name}", had: "Kto mal: {item}",
      },
    },
    // Norwegian (Bokmål): like English and Swedish, no message holds a "|" (one person has its own message, and a
    // person's shares show only above one); "du" for the user and the app's words (likt, andeler, etter inntekt, poster).
    nb: {
      bill: "Pizzakveld", paid: "Pedro betalte", notIn: "Ikke med i denne",
      each: "{a} hver", among: "{a} delt på {n} personer.", amongOne: "{a} på 1 person.", out: "{name} er ikke med.",
      nobody: "Ingen er med ennå", nobodyEqual: "Velg minst én person for å dele {a}.",
      checkAll: "Velg alle", uncheckAll: "Fjern alle",
      left: "{a} igjen", over: "{a} for mye", closed: "Det går opp: {a}",
      progress: "{a} av {b} så langt.", closedMsg: "Delene blir til sammen totalsummen.",
      parts: "{n} andeler på {a}", personParts: "{name} har {n} andeler.", nobodyShares: "Gi minst én person en andel for å dele {a}.",
      ofEach: "{p} av hver utgift", ofBill: "{p} av utgiften", incomeDetail: "Hver enkelts del følger inntekten deres.", perMonth: "/mnd.",
      service: "Service ({p})", serviceSub: "I forhold til hva hver enkelt hadde",
      loose: "Marker hvem som hadde hver post", looseDetail: "Trykk på ansiktene ved hver post for å markere hvem som hadde den.",
      itemsClosed: "{a} i poster og {b} i service.", nobodyItem: "Ingen valgt", eachItem: "{a} hver",
      items: { pizza: "Stor pizza", beer: "Øl", salad: "Salat", draft: "Fatøl", shrimp: "Rekefat" },
      receiptBill: "Havnebaren",
      hint: {
        equal: "Når det ikke går opp, går de resterende øre til den som betalte.",
        amounts: "Den som står på {zero}, er ikke med i utgiften.",
        percent: "Bare hele tall. De resterende øre går til den som betalte.",
        shares: "Bruk andeler når noen har mer, for eksempel den som tok med seg en følgesvenn.",
        income: "Inntektene blir på enheten. Gruppen ser bare prosentene.",
        items: "Hver post deles mellom dem som hadde den, og servicen etter hva hver enkelt hadde.",
      },
      label: {
        amount: "Beløp for {name}", percent: "Prosent for {name}", income: "Månedsinntekt for {name}",
        less: "Én andel mindre for {name}", more: "Én andel til for {name}", had: "Hvem hadde {item}",
      },
    },
    fa: {
      bill: "شب پیتزا", paid: "Pedro پرداخت کرد", notIn: "در این هزینه نیست",
      each: "هر نفر {a}", among: "{a} بین {n} نفر.", amongOne: "{a} برای 1 نفر.", out: "{name} در این هزینه نیست.",
      nobody: "هنوز کسی انتخاب نشده", nobodyEqual: "برای تقسیم {a} دست‌کم یک نفر را انتخاب کنید.",
      checkAll: "انتخاب همه", uncheckAll: "لغو انتخاب همه",
      left: "باقی‌مانده: {a}", over: "اضافه: {a}", closed: "جمع درست است: {a}",
      progress: "تا اینجا {a} از {b}.", closedMsg: "جمع سهم‌ها با مبلغ کل برابر است.",
      parts: "{n} سهم از {a}", personParts: "{name}: {n} سهم.", nobodyShares: "برای تقسیم {a} دست‌کم به یک نفر سهم بدهید.",
      ofEach: "{p} از هر هزینه", ofBill: "{p} از هزینه", incomeDetail: "سهم هر نفر به نسبت درآمد اوست.", perMonth: "/ماه",
      service: "سرویس ({p})", serviceSub: "به نسبت سفارش هر نفر",
      loose: "مشخص کنید هر قلم را چه کسی گرفت", looseDetail: "روی چهره‌های هر قلم بزنید تا مشخص شود چه کسی آن را گرفت.",
      itemsClosed: "{a} برای اقلام و {b} برای سرویس.", nobodyItem: "کسی انتخاب نشده", eachItem: "هر نفر {a}",
      items: { pizza: "پیتزای بزرگ", beer: "نوشابه", salad: "سالاد", draft: "آب‌میوه تازه", shrimp: "دیس میگو" },
      receiptBill: "کافه بندر",
      hint: {
        equal: "وقتی مبلغ مساوی تقسیم نشود، باقی‌مانده به کسی می‌رسد که پرداخت کرده است.",
        amounts: "هر کس مبلغش {zero} بماند، در این هزینه نیست.",
        percent: "فقط اعداد صحیح. باقی‌مانده به کسی می‌رسد که پرداخت کرده است.",
        shares: "وقتی سهم کسی بیشتر است، مثلاً کسی که مهمان آورده، از سهم استفاده کنید.",
        income: "درآمدها روی دستگاه می‌مانند. گروه فقط درصدها را می‌بیند.",
        items: "هر قلم بین کسانی که آن را گرفته‌اند تقسیم می‌شود و سرویس به نسبت سفارش هر نفر.",
      },
      label: {
        amount: "مبلغ: {name}", percent: "درصد: {name}", income: "درآمد ماهانه: {name}",
        less: "یک سهم کمتر: {name}", more: "یک سهم بیشتر: {name}", had: "چه کسی گرفت: {item}",
      },
    },
    sw: {
      bill: "Usiku wa pizza", paid: "Imelipwa na: Pedro", notIn: "Hayumo kwenye hii",
      each: "{a} kila mmoja", among: "{a} kwa watu {n}.", amongOne: "{a} kwa mtu 1.", out: "{name} hayumo.",
      nobody: "Bado hakuna aliyemo", nobodyEqual: "Chagua angalau mtu mmoja ili kugawanya {a}.",
      checkAll: "Chagua wote", uncheckAll: "Ondoa wote",
      left: "Imebaki {a}", over: "Imezidi {a}", closed: "Imetimia: {a}",
      progress: "{a} kati ya {b} hadi sasa.", closedMsg: "Sehemu zinalingana na jumla.",
      parts: "Sehemu {n} za {a}", personParts: "{name} ana sehemu {n}.",
      nobodyShares: "Mpe angalau mtu mmoja sehemu ili kugawanya {a}.",
      ofEach: "{p} ya kila gharama", ofBill: "{p} ya gharama", incomeDetail: "Sehemu ya kila mtu inafuata kipato chake.", perMonth: "/mwezi",
      service: "Huduma ({p})", serviceSub: "Kulingana na alichotumia kila mtu",
      loose: "Weka alama kwa aliyetumia kila bidhaa", looseDetail: "Gusa nyuso kwenye kila bidhaa ili kuweka alama kwa aliyeitumia.",
      itemsClosed: "{a} kwa bidhaa na {b} kwa huduma.", nobodyItem: "Hakuna aliyechaguliwa", eachItem: "{a} kila mmoja",
      items: { pizza: "Pizza kubwa", beer: "Soda", salad: "Saladi", draft: "Juisi ya matunda", shrimp: "Sahani ya kamba" },
      receiptBill: "Mgahawa wa Bandarini",
      hint: {
        equal: "Isipogawanyika sawa, senti zinazobaki zinaenda kwa aliyelipa.",
        amounts: "Aliyebaki na {zero} hayumo kwenye gharama.",
        percent: "Namba kamili tu. Senti zinazobaki zinaenda kwa aliyelipa.",
        shares: "Tumia sehemu mtu anapotumia zaidi, kama aliyekuja na mgeni.",
        income: "Vipato vinabaki kwenye kifaa. Kikundi kinaona asilimia tu.",
        items: "Kila bidhaa inagawanywa kati ya walioitumia, na huduma kulingana na alichotumia kila mtu.",
      },
      label: {
        amount: "Kiasi cha {name}", percent: "Asilimia ya {name}", income: "Kipato cha mwezi cha {name}",
        less: "Punguza sehemu moja ya {name}", more: "Ongeza sehemu moja kwa {name}", had: "Waliotumia: {item}",
      },
    },
    // Tamil: a message with "|" holds its forms for {n}, "one|few|other", of which Tamil uses one and other. A name or an
    // amount never takes a case ending, so it stands after a colon or before a noun that carries it (தொகை); நீங்கள் for the user.
    ta: {
      bill: "பீட்சா இரவு", paid: "Pedro செலுத்தினார்", notIn: "இதில் இல்லை",
      each: "ஒவ்வொருவருக்கும் {a}", among: "{n} நபர்களிடையே {a}.", amongOne: "1 நபருக்கு {a}.", out: "இதில் இல்லை: {name}.",
      nobody: "இன்னும் யாரும் இல்லை", nobodyEqual: "{a} தொகையைப் பிரிக்க, குறைந்தது ஒருவரையாவது குறியுங்கள்.",
      checkAll: "அனைத்தையும் குறிக்கவும்", uncheckAll: "அனைத்துக் குறிகளையும் நீக்கவும்",
      left: "மீதம்: {a}", over: "அதிகம்: {a}", closed: "சரியாக உள்ளது: {a}",
      progress: "இதுவரை: {a} / {b}.", closedMsg: "பகுதிகள் மொத்தத்துடன் சரியாகப் பொருந்துகின்றன.",
      parts: "{a}: {n} பங்கு|{a}: {n} பங்குகள்|{a}: {n} பங்குகள்", personParts: "{name}: {n} பங்கு.|{name}: {n} பங்குகள்.|{name}: {n} பங்குகள்.",
      nobodyShares: "{a} தொகையைப் பிரிக்க, குறைந்தது ஒருவருக்காவது ஒரு பங்கு கொடுங்கள்.",
      ofEach: "ஒவ்வொரு செலவிலும் {p}", ofBill: "செலவில் {p}", incomeDetail: "ஒவ்வொருவரின் பங்கும் அவரவர் வருமானத்தைப் பின்பற்றும்.", perMonth: "/மாதம்",
      service: "சேவைக் கட்டணம் ({p})", serviceSub: "ஒவ்வொருவரும் எடுத்ததன் விகிதத்தில்",
      loose: "ஒவ்வொரு பொருளையும் யார் எடுத்தார்கள் என்று குறியுங்கள்", looseDetail: "யார் எடுத்தார்கள் என்று குறிக்க, ஒவ்வொரு பொருளிலும் முகங்களைத் தட்டுங்கள்.",
      itemsClosed: "பொருட்கள்: {a}, சேவைக் கட்டணம்: {b}.", nobodyItem: "யாரும் குறிக்கப்படவில்லை", eachItem: "ஒவ்வொருவருக்கும் {a}",
      items: { pizza: "பெரிய பீட்சா", beer: "பீர்", salad: "சாலட்", draft: "டிராஃப்ட் பீர்", shrimp: "இறால் தட்டு" },
      receiptBill: "ஹார்பர் பார்",
      hint: {
        equal: "சமமாகப் பிரிக்க முடியாதபோது, மீதமுள்ள பைசா செலுத்தியவருக்குச் செல்லும்.",
        amounts: "தொகை {zero} என்று உள்ளவர் இந்தச் செலவில் இல்லை.",
        percent: "முழு எண்கள் மட்டும். மீதமுள்ள பைசா செலுத்தியவருக்குச் செல்லும்.",
        shares: "ஒருவருக்கு அதிகம் இருக்கும்போது பங்குகளைப் பயன்படுத்துங்கள், உதாரணமாகக் கூட ஒருவரை அழைத்து வந்தவருக்கு.",
        income: "வருமானங்கள் சாதனத்திலேயே இருக்கும். குழு சதவீதங்களை மட்டுமே பார்க்கும்.",
        items: "ஒவ்வொரு பொருளும் அதை எடுத்தவர்களிடையே பிரிக்கப்படும், சேவைக் கட்டணம் ஒவ்வொருவரும் எடுத்ததன்படி.",
      },
      label: {
        amount: "தொகை: {name}", percent: "சதவீதம்: {name}", income: "மாத வருமானம்: {name}",
        less: "ஒரு பங்கு குறைக்கவும்: {name}", more: "ஒரு பங்கு கூட்டவும்: {name}", had: "யார் எடுத்தார்கள்: {item}",
      },
    },
    // Telugu: a message with "|" holds its forms for {n}, "one|few|other", of which Telugu uses one and other. A name or an
    // amount never takes a case ending, so it stands after a colon or before a noun that carries it (మొత్తం); మీరు for the user.
    te: {
      bill: "పిజ్జా నైట్", paid: "Pedro చెల్లించారు", notIn: "ఇందులో లేరు",
      each: "ఒక్కొక్కరికి {a}", among: "{n} మంది మధ్య {a}.", amongOne: "1 వ్యక్తికి {a}.", out: "ఇందులో లేరు: {name}.",
      nobody: "ఇంకా ఎవరూ లేరు", nobodyEqual: "{a} మొత్తాన్ని పంచడానికి, కనీసం ఒక్కరినైనా ఎంచుకోండి.",
      checkAll: "అందరినీ ఎంచుకోండి", uncheckAll: "అందరి ఎంపికను తీసివేయండి",
      left: "మిగిలింది: {a}", over: "ఎక్కువైంది: {a}", closed: "సరిపోయింది: {a}",
      progress: "ఇప్పటివరకు: {a} / {b}.", closedMsg: "భాగాలు మొత్తానికి సరిగ్గా సరిపోతున్నాయి.",
      parts: "{a}: {n} వాటా|{a}: {n} వాటాలు|{a}: {n} వాటాలు", personParts: "{name}: {n} వాటా.|{name}: {n} వాటాలు.|{name}: {n} వాటాలు.",
      nobodyShares: "{a} మొత్తాన్ని పంచడానికి, కనీసం ఒక్కరికైనా ఒక వాటా ఇవ్వండి.",
      ofEach: "ప్రతి ఖర్చులో {p}", ofBill: "ఖర్చులో {p}", incomeDetail: "ఒక్కొక్కరి భాగం వారి ఆదాయాన్ని బట్టి ఉంటుంది.", perMonth: "/నెల",
      service: "సర్వీస్ ఛార్జ్ ({p})", serviceSub: "ఒక్కొక్కరు తీసుకున్నదాని నిష్పత్తిలో",
      loose: "ప్రతి ఐటెమ్‌ను ఎవరు తీసుకున్నారో గుర్తించండి", looseDetail: "ఎవరు తీసుకున్నారో గుర్తించడానికి, ప్రతి ఐటెమ్‌పై ముఖాలను నొక్కండి.",
      itemsClosed: "ఐటెమ్‌లు: {a}, సర్వీస్ ఛార్జ్: {b}.", nobodyItem: "ఎవరినీ ఎంచుకోలేదు", eachItem: "ఒక్కొక్కరికి {a}",
      items: { pizza: "పెద్ద పిజ్జా", beer: "బీర్", salad: "సలాడ్", draft: "డ్రాఫ్ట్ బీర్", shrimp: "రొయ్యల ప్లేటర్" },
      receiptBill: "హార్బర్ బార్",
      hint: {
        equal: "సమానంగా పంచలేనప్పుడు, మిగిలిన పైసలు చెల్లించినవారికి వెళ్తాయి.",
        amounts: "మొత్తం {zero} ఉన్నవారు ఈ ఖర్చులో లేరు.",
        percent: "పూర్ణ సంఖ్యలు మాత్రమే. మిగిలిన పైసలు చెల్లించినవారికి వెళ్తాయి.",
        shares: "ఎవరికైనా ఎక్కువ ఉన్నప్పుడు వాటాలు వాడండి, ఉదాహరణకు తమతో మరొకరిని తీసుకువచ్చినవారికి.",
        income: "ఆదాయాలు పరికరంలోనే ఉంటాయి. గ్రూప్‌కు శాతాలు మాత్రమే కనిపిస్తాయి.",
        items: "ప్రతి ఐటెమ్‌ను తీసుకున్నవారి మధ్య పంచుతారు, సర్వీస్ ఛార్జ్‌ను ఒక్కొక్కరు తీసుకున్నదాని ప్రకారం.",
      },
      label: {
        amount: "మొత్తం: {name}", percent: "శాతం: {name}", income: "నెల ఆదాయం: {name}",
        less: "ఒక వాటా తగ్గించండి: {name}", more: "ఒక వాటా పెంచండి: {name}", had: "ఎవరు తీసుకున్నారు: {item}",
      },
    },
    // Marathi: a message with "|" holds its forms for {n}, "one|few|other", of which Marathi uses one and other (1 वाटा,
    // 2 वाटे). A name or an amount never takes a case ending, so it stands after a colon; तुम्ही for the user.
    mr: {
      bill: "पिझ्झा नाइट", paid: "Pedro यांनी पैसे दिले", notIn: "यात सहभागी नाहीत",
      each: "प्रत्येकी {a}", among: "{n} जणांमध्ये वाटले: {a}.", amongOne: "फक्त 1 व्यक्तीवर: {a}.", out: "सहभागी नाहीत: {name}.",
      nobody: "अजून कोणीही नाही", nobodyEqual: "ही रक्कम वाटण्यासाठी किमान एक व्यक्ती निवडा: {a}.",
      checkAll: "सर्वांना निवडा", uncheckAll: "सर्वांची निवड काढा",
      left: "बाकी: {a}", over: "जास्त: {a}", closed: "जुळले: {a}",
      progress: "आतापर्यंत: {a} / {b}.", closedMsg: "सर्व भाग मिळून एकूण रकमेइतके आहेत.",
      parts: "{a}: {n} वाटा|{a}: {n} वाटे|{a}: {n} वाटे", personParts: "{name}: {n} वाटा.|{name}: {n} वाटे.|{name}: {n} वाटे.",
      nobodyShares: "ही रक्कम वाटण्यासाठी किमान एका व्यक्तीला वाटा द्या: {a}.",
      ofEach: "प्रत्येक खर्चाचे {p}", ofBill: "खर्चाचे {p}", incomeDetail: "प्रत्येकाचा भाग त्यांच्या उत्पन्नानुसार ठरतो.", perMonth: "/महिना",
      service: "सर्व्हिस चार्ज ({p})", serviceSub: "प्रत्येकाने जे घेतले त्या प्रमाणात",
      loose: "प्रत्येक आयटम कोणी घेतला ते मार्क करा", looseDetail: "कोणी घेतला ते मार्क करण्यासाठी, प्रत्येक आयटमवरील चेहऱ्यांवर टॅप करा.",
      itemsClosed: "आयटम: {a}, सर्व्हिस चार्ज: {b}.", nobodyItem: "कोणालाही निवडले नाही", eachItem: "प्रत्येकी {a}",
      items: { pizza: "लार्ज पिझ्झा", beer: "बिअर", salad: "सॅलड", draft: "ड्राफ्ट बिअर", shrimp: "कोळंबी प्लॅटर" },
      receiptBill: "हार्बर बार",
      hint: {
        equal: "रक्कम अचूक वाटता येत नसेल, तर उरलेले पैसे, पैसे देणाऱ्यांना मिळतात.",
        amounts: "ज्यांची रक्कम {zero} राहते, ते या खर्चात सहभागी नाहीत.",
        percent: "फक्त पूर्ण संख्या. उरलेले पैसे, पैसे देणाऱ्यांना मिळतात.",
        shares: "एखाद्याचा भाग जास्त असेल तेव्हा वाटे वापरा, उदाहरणार्थ जे सोबत पाहुणे आणतात त्यांच्यासाठी.",
        income: "उत्पन्न डिव्हाइसवरच राहते. ग्रुपला फक्त टक्केवारी दिसते.",
        items: "प्रत्येक आयटम तो घेणाऱ्यांमध्ये वाटला जातो, आणि सर्व्हिस चार्ज प्रत्येकाने जे घेतले त्यानुसार.",
      },
      label: {
        amount: "रक्कम: {name}", percent: "टक्केवारी: {name}", income: "मासिक उत्पन्न: {name}",
        less: "एक वाटा कमी करा: {name}", more: "एक वाटा वाढवा: {name}", had: "कोणी घेतले: {item}",
      },
    },
    // Bulgarian: a message with "|" holds its forms for {n}, "one|other|other" (1 дял, 2 дяла), and fill picks one. The
    // aorist (плати, взе) has no gender, so the past never guesses one; a name never takes an article; "ти" for the user.
    bg: {
      bill: "Вечер с пица", paid: "Pedro плати", notIn: "Не участва в този разход",
      each: "{a} на човек", among: "{a} между {n} души.", amongOne: "{a} за 1 човек.", out: "{name} е извън разхода.",
      nobody: "Още няма никого в разхода", nobodyEqual: "Отметни поне един човек, за да разделиш {a}.",
      checkAll: "Отметни всички", uncheckAll: "Махни отметките",
      left: "Остават {a}", over: "{a} в повече", closed: "Сборът е точен: {a}",
      progress: "Засега {a} от {b}.", closedMsg: "Частите правят общата сума.",
      parts: "{a} на {n} дял|{a} на {n} дяла|{a} на {n} дяла", personParts: "{name} има {n} дяла.",
      nobodyShares: "Дай дял поне на един човек, за да разделиш {a}.",
      ofEach: "{p} от всеки разход", ofBill: "{p} от разхода", incomeDetail: "Частта на всеки следва дохода му.", perMonth: "/мес.",
      service: "Обслужване ({p})", serviceSub: "Според това кой какво взе",
      loose: "Отбележи кой какво взе", looseDetail: "Докосни лицата при всеки артикул, за да отбележиш кой го взе.",
      itemsClosed: "{a} за артикули и {b} за обслужване.", nobodyItem: "Никой не е отметнат", eachItem: "{a} на човек",
      items: { pizza: "Голяма пица", beer: "Бира", salad: "Салата", draft: "Наливна бира", shrimp: "Плато със скариди" },
      receiptBill: "Пристанищен бар",
      hint: {
        equal: "Когато не се дели точно, остатъчните стотинки отиват при този, който плати.",
        amounts: "Който остане на {zero}, е извън разхода.",
        percent: "Само цели числа. Остатъчните стотинки отиват при този, който плати.",
        shares: "Използвай дялове, когато някой има повече, например ако води придружител.",
        income: "Доходите остават на устройството. Групата вижда само процентите.",
        items: "Всеки артикул се дели между тези, които са го взели, а обслужването – според това кой какво взе.",
      },
      label: {
        amount: "Сума: {name}", percent: "Процент: {name}", income: "Месечен доход: {name}",
        less: "Един дял по-малко: {name}", more: "Един дял повече: {name}", had: "Кой взе: {item}",
      },
    },
    // Catalan: a message with "|" holds its forms for {n}, "one|other|other" (1 part, 2 parts), and fill picks one. A
    // filled-in name never takes a contracted article (l’, d’): it stands as the subject or after a colon; "tu" for the user.
    ca: {
      bill: "Nit de pizza", paid: "Pedro ha pagat", notIn: "No hi participa",
      each: "{a} cadascú", among: "{a} entre {n} persones.", amongOne: "{a} per a 1 persona.", out: "{name} no hi participa.",
      nobody: "Encara no hi ha ningú", nobodyEqual: "Marca almenys una persona per dividir {a}.",
      checkAll: "Marcar tots", uncheckAll: "Desmarcar tots",
      left: "Falten {a}", over: "Sobren {a}", closed: "Quadra: {a}",
      progress: "{a} de {b} de moment.", closedMsg: "Les parts sumen el total.",
      parts: "{n} part de {a}|{n} parts de {a}|{n} parts de {a}", personParts: "{name} té {n} parts.",
      nobodyShares: "Dona almenys una part a una persona per dividir {a}.",
      ofEach: "{p} de cada despesa", ofBill: "{p} de la despesa", incomeDetail: "La part de cadascú segueix els seus ingressos.", perMonth: "/mes",
      service: "Servei ({p})", serviceSub: "Segons el que ha pres cadascú",
      loose: "Marca qui ha pres cada article", looseDetail: "Toca les cares de cada article per marcar qui l’ha pres.",
      itemsClosed: "{a} en articles i {b} de servei.", nobodyItem: "No hi ha ningú marcat", eachItem: "{a} cadascú",
      items: { pizza: "Pizza gran", beer: "Cervesa", salad: "Amanida", draft: "Canya", shrimp: "Ració de gambes" },
      receiptBill: "Bar del Port",
      hint: {
        equal: "Quan no es pot dividir exactament, els cèntims que sobren són per a qui ha pagat.",
        amounts: "Qui es quedi a {zero} queda fora de la despesa.",
        percent: "Només nombres enters. Els cèntims que sobren són per a qui ha pagat.",
        shares: "Fes servir parts quan algú té més, com qui ha portat un acompanyant.",
        income: "Els ingressos es queden al dispositiu. El grup només veu els percentatges.",
        items: "Cada article es divideix entre qui l’ha pres, i el servei, segons el que ha pres cadascú.",
      },
      label: {
        amount: "Import: {name}", percent: "Percentatge: {name}", income: "Ingressos mensuals: {name}",
        less: "Una part menys: {name}", more: "Una part més: {name}", had: "Qui ha pres: {item}",
      },
    },
    // Danish: like English and Norwegian, no message holds a "|" (one person has its own message, and a person's
    // shares show only above one); "du" for the user and the app's words (ligeligt, andele, efter indkomst, poster).
    da: {
      bill: "Pizzaaften", paid: "Pedro betalte", notIn: "Ikke med i denne",
      each: "{a} hver", among: "{a} mellem {n} personer.", amongOne: "{a} til 1 person.", out: "{name} er ikke med.",
      nobody: "Ingen er med endnu", nobodyEqual: "Markér mindst én person for at dele {a}.",
      checkAll: "Markér alle", uncheckAll: "Fjern alle markeringer",
      left: "{a} mangler", over: "{a} for meget", closed: "Det passer: {a}",
      progress: "{a} af {b} indtil nu.", closedMsg: "Delene giver tilsammen totalen.",
      parts: "{a} fordelt på {n} andele", personParts: "{name} har {n} andele.", nobodyShares: "Giv mindst én person en andel for at dele {a}.",
      ofEach: "{p} af hver udgift", ofBill: "{p} af udgiften", incomeDetail: "Hver persons del følger vedkommendes indkomst.", perMonth: "/md.",
      service: "Service ({p})", serviceSub: "I forhold til, hvad hver person havde",
      loose: "Markér, hvem der havde hver post", looseDetail: "Tryk på ansigterne ved hver post for at markere, hvem der havde den.",
      itemsClosed: "{a} i poster og {b} i service.", nobodyItem: "Ingen markeret", eachItem: "{a} hver",
      items: { pizza: "Stor pizza", beer: "Øl", salad: "Salat", draft: "Fadøl", shrimp: "Rejeplatte" },
      receiptBill: "Havnebaren",
      hint: {
        equal: "Når det ikke går op, går de overskydende øre til den, der betalte.",
        amounts: "Den, der står på {zero}, er ikke med i udgiften.",
        percent: "Kun hele tal. De overskydende øre går til den, der betalte.",
        shares: "Brug andele, når nogen har mere, f.eks. hvis nogen tog en gæst med.",
        income: "Indkomsterne bliver på enheden. Gruppen ser kun procenterne.",
        items: "Hver post deles mellem dem, der havde den, og servicen efter, hvad hver person havde.",
      },
      label: {
        amount: "Beløb for {name}", percent: "Procentdel for {name}", income: "Månedlig indkomst for {name}",
        less: "Én andel mindre til {name}", more: "Én andel mere til {name}", had: "Hvem havde {item}",
      },
    },
    // Finnish: like Danish, no message holds a "|" (one person has its own message, and a person's shares show only
    // above one); "sinä" for the user and the app's words (tasan, osuudet, tulojen mukaan, tuotteet). A name, an item
    // or an amount stands after a colon or as the subject, never with a case ending.
    fi: {
      bill: "Pizzailta", paid: "Pedro maksoi", notIn: "Ei mukana tässä",
      each: "{a} kukin", among: "{a} jaettuna {n} henkilön kesken.", amongOne: "{a} yhdelle henkilölle.", out: "{name} ei ole mukana.",
      nobody: "Kukaan ei ole vielä mukana", nobodyEqual: "Valitse vähintään yksi henkilö, niin voit jakaa summan {a}.",
      checkAll: "Valitse kaikki", uncheckAll: "Poista kaikki valinnat",
      left: "{a} jäljellä", over: "{a} liikaa", closed: "Täsmää: {a}",
      progress: "{a}/{b} tähän mennessä.", closedMsg: "Osuudet täsmäävät kokonaissummaan.",
      parts: "{a} jaettuna {n} osuuteen", personParts: "{name}: {n} osuutta.", nobodyShares: "Anna vähintään yhdelle henkilölle osuus, niin voit jakaa summan {a}.",
      ofEach: "{p} jokaisesta kulusta", ofBill: "{p} kulusta", incomeDetail: "Kunkin osuus määräytyy tulojen mukaan.", perMonth: "/kk",
      service: "Palvelumaksu ({p})", serviceSub: "Suhteessa siihen, mitä kukin otti",
      loose: "Merkitse, kuka otti minkäkin", looseDetail: "Napauta kunkin tuotteen kohdalla kasvoja ja merkitse, kuka sen otti.",
      itemsClosed: "Tuotteet {a} ja palvelumaksu {b}.", nobodyItem: "Ei ketään valittuna", eachItem: "{a} kukin",
      items: { pizza: "Iso pizza", beer: "Olut", salad: "Salaatti", draft: "Hanaolut", shrimp: "Katkarapuvati" },
      receiptBill: "Satamabaari",
      hint: {
        equal: "Kun summa ei jakaudu tasan, ylijäävät sentit menevät maksajalle.",
        amounts: "Jos jonkun summaksi jää {zero}, hän ei ole mukana kulussa.",
        percent: "Vain kokonaislukuja. Ylijäävät sentit menevät maksajalle.",
        shares: "Käytä osuuksia, kun jollakulla on enemmän, esimerkiksi seuralainen mukana.",
        income: "Tulot pysyvät laitteella. Ryhmä näkee vain prosentit.",
        items: "Kukin tuote jaetaan sen ottajien kesken ja palvelumaksu sen mukaan, mitä kukin otti.",
      },
      label: {
        amount: "Summa: {name}", percent: "Prosenttiosuus: {name}", income: "Kuukausitulot: {name}",
        less: "Yksi osuus vähemmän: {name}", more: "Yksi osuus lisää: {name}", had: "Kuka otti: {item}",
      },
    },
    // Malayalam: a message with "|" holds its forms for {n}, "one|few|other", of which Malayalam uses one and other (1 ഓഹരി,
    // 2 ഓഹരികൾ). A name, an item or an amount never takes a case ending, so it stands after a colon; നിങ്ങൾ for the user.
    ml: {
      bill: "പിസ്സ നൈറ്റ്", paid: "Pedro പണം നൽകി", notIn: "ഇതിൽ ഉൾപ്പെടുന്നില്ല",
      each: "ഓരോരുത്തർക്കും {a}", among: "{n} പേർക്കിടയിൽ വിഭജിച്ചു: {a}.", amongOne: "1 ആൾക്ക് മാത്രം: {a}.", out: "ഉൾപ്പെടുന്നില്ല: {name}.",
      nobody: "ഇതുവരെ ആരുമില്ല", nobodyEqual: "ഈ തുക വിഭജിക്കാൻ കുറഞ്ഞത് ഒരാളെയെങ്കിലും തിരഞ്ഞെടുക്കുക: {a}.",
      checkAll: "എല്ലാവരെയും തിരഞ്ഞെടുക്കുക", uncheckAll: "എല്ലാ തിരഞ്ഞെടുപ്പും മാറ്റുക",
      left: "ബാക്കി: {a}", over: "അധികം: {a}", closed: "ശരിയായി: {a}",
      progress: "ഇതുവരെ: {a} / {b}.", closedMsg: "ഭാഗങ്ങൾ എല്ലാം ചേർന്നാൽ ആകെ തുകയാകും.",
      parts: "{a}: {n} ഓഹരി|{a}: {n} ഓഹരികൾ|{a}: {n} ഓഹരികൾ", personParts: "{name}: {n} ഓഹരി.|{name}: {n} ഓഹരികൾ.|{name}: {n} ഓഹരികൾ.",
      nobodyShares: "ഈ തുക വിഭജിക്കാൻ കുറഞ്ഞത് ഒരാൾക്കെങ്കിലും ഒരു ഓഹരി നൽകുക: {a}.",
      ofEach: "ഓരോ ചെലവിന്റെയും {p}", ofBill: "ചെലവിന്റെ {p}", incomeDetail: "ഓരോരുത്തരുടെയും ഭാഗം അവരുടെ വരുമാനം അനുസരിച്ചാണ്.", perMonth: "/മാസം",
      service: "സർവീസ് ചാർജ് ({p})", serviceSub: "ഓരോരുത്തരും എടുത്തതിന് ആനുപാതികമായി",
      loose: "ഓരോ ഇനവും ആരൊക്കെ എടുത്തെന്ന് അടയാളപ്പെടുത്തുക", looseDetail: "ആരാണ് എടുത്തതെന്ന് അടയാളപ്പെടുത്താൻ, ഓരോ ഇനത്തിലെയും മുഖങ്ങളിൽ ടാപ്പ് ചെയ്യുക.",
      itemsClosed: "ഇനങ്ങൾ: {a}, സർവീസ് ചാർജ്: {b}.", nobodyItem: "ആരെയും തിരഞ്ഞെടുത്തിട്ടില്ല", eachItem: "ഓരോരുത്തർക്കും {a}",
      items: { pizza: "വലിയ പിസ്സ", beer: "ബിയർ", salad: "സാലഡ്", draft: "ഡ്രാഫ്റ്റ് ബിയർ", shrimp: "ചെമ്മീൻ പ്ലാറ്റർ" },
      receiptBill: "ഹാർബർ ബാർ",
      hint: {
        equal: "തുല്യമായി വിഭജിക്കാൻ കഴിയാത്തപ്പോൾ, ബാക്കി വരുന്ന പൈസ പണം നൽകിയ ആൾക്ക് ലഭിക്കും.",
        amounts: "തുക {zero} ആയി തുടരുന്നവർ ഈ ചെലവിൽ ഉൾപ്പെടുന്നില്ല.",
        percent: "പൂർണ്ണ സംഖ്യകൾ മാത്രം. ബാക്കി വരുന്ന പൈസ പണം നൽകിയ ആൾക്ക് ലഭിക്കും.",
        shares: "ആർക്കെങ്കിലും കൂടുതൽ ഉള്ളപ്പോൾ ഓഹരികൾ ഉപയോഗിക്കുക, ഉദാഹരണത്തിന് ഒപ്പം ഒരാളെ കൂട്ടിക്കൊണ്ടുവന്നവർക്ക്.",
        income: "വരുമാനം ഉപകരണത്തിൽ മാത്രം നിലനിൽക്കും. ഗ്രൂപ്പ് ശതമാനങ്ങൾ മാത്രമേ കാണൂ.",
        items: "ഓരോ ഇനവും അത് എടുത്തവർക്കിടയിൽ വിഭജിക്കും, സർവീസ് ചാർജ് ഓരോരുത്തരും എടുത്തതനുസരിച്ചും.",
      },
      label: {
        amount: "തുക: {name}", percent: "ശതമാനം: {name}", income: "പ്രതിമാസ വരുമാനം: {name}",
        less: "ഒരു ഓഹരി കുറയ്ക്കുക: {name}", more: "ഒരു ഓഹരി കൂട്ടുക: {name}", had: "ആരൊക്കെ എടുത്തു: {item}",
      },
    },
  });
  const plural = new Intl.PluralRules(lang);
  function fill(text, values) {
    const forms = text.split("|");
    if (forms.length > 1) {
      const kind = plural.select(values.n);
      text = forms.length === 6 ? forms[["zero", "one", "two", "few", "many", "other"].indexOf(kind)]
        : forms.length === 3 ? forms[{ one: 0, few: 1, two: 1 }[kind] ?? 2] : forms[kind === "few" ? 0 : 1];
    }
    return text.replace(/\{(\w+)\}/g, (_, key) => values[key]);
  }

  // Amounts in the visitor's currency, as preview.js writes them (money.js).
  // The bills' amounts below are in the dollar's cents; cents gives them in the currency's own, so the splits and what
  // is typed work in those (money.js).
  // A percentage as the language writes it (money.js): 10 % in French, %10 in Turkish.
  const { plain, format: money, parse: parseMoney, latinDigits, cents, percent: pct } = window.money;

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
        { key: "pizza", qty: 1, each: cents(6000), who: [true, true, false, false] },
        { key: "beer", qty: 3, each: cents(1200), who: [true, false, true, true] },
        { key: "salad", qty: 1, each: cents(2400), who: [false, false, false, true] },
      ],
    },
    receipt: {
      title: TEXT.receiptBill,
      items: [
        { key: "draft", qty: 2, each: cents(1400), who: [true, false, true, false] },
        { key: "shrimp", qty: 1, each: cents(9600), who: [false, true, false, true] },
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
      income: state?.income ?? [600000, 400000, 300000, 200000].map(cents),
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
  const prefix = window.money.symbolBefore;
  const suffix = window.money.symbolAfter;
  // A money field grows with what it holds: ₩6,000,000 or Rp60.000.000 is longer than $6,000.
  const fit = (input) => input.style.setProperty("--chars", String(input.value.length));
  const moneyField = (value, label, extra = "") => `<span class="split-field">${prefix ? `<span>${prefix}</span>` : ""}`
    + `<input type="text" inputmode="${window.money.wholeUnits ? "numeric" : "decimal"}" autocomplete="off" value="${plain(value)}" style="--chars: ${plain(value).length}" aria-label="${label}">`
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
    // The rows' light grows from nothing to each one's part: laid out at 0 first, then set. Not on the first build
    // (the panel still hidden) of a card that isn't in view yet, as the page loads: site.css holds its rows at nothing
    // until it is, and laying the whole page out here, before its first paint, would hold that paint back.
    const grow = !panel.hidden || demo.closest(".tile.in");
    panel.hidden = false;
    if (grow) {
      panel.querySelectorAll(".split-row").forEach((row) => row.style.setProperty("--w", "0"));
      void panel.offsetWidth;
    }
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
      input.value = latinDigits(input.value).replace(/\D/g, "");
      state.percent[i] = Math.min(100, Number(input.value || 0));
    } else {
      state[mode][i] = Math.min(mode === "income" ? 99999999 : 999999, parseMoney(input.value));
      fit(input);
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
    fit(input);
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
