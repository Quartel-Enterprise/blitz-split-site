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
  const { plain, format: money, parse: parseMoney } = window.money;
  // Turkish writes the sign first: %10. French, German and Russian put a space before it.
  const pct = (n) => (["fr", "de", "ru"].includes(lang) ? `${n} %` : lang === "tr" ? `%${n}` : `${n}%`);

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
