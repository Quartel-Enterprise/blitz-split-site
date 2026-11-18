---
title: Zásady ochrany osobních údajů
updated: 2026-11-17
---

> **Ve zkratce**
>
> - Aplikaci používáš bez zakládání účtu. Google a Apple jsou volitelné, ale bez nich se tvoje data po 30 dnech nepoužívání smažou.
> - Co přidáš, zůstává nejdřív ve tvém zařízení a na server jde jen kvůli synchronizaci a aby se to dostalo k tvé skupině.
> - Lidé ve skupině vidí, co patří skupině, a kdo má odkaz, který sdílíš, vidí daný výdaj nebo tvůj profil. Tvůj e-mail nevidí nikdo.
> - Metriky používání a hlášení o pádech neobsahují jména ani částky. Když máš účet, metriky jsou spojené s jeho ID. Nepoužíváme reklamní ID a metriky si vypneš v Profilu.
> - Data neprodáváme. Účet a data smažeš přímo v aplikaci.

## Kdo jsme {#who}

Tyto zásady vysvětlují, jak aplikace **Blitz Split** (v Brazílii Bora Rachar) zachází s osobními údaji v aplikacích pro Android, iPhone, iPad, Mac a prohlížeč a na webu blitzsplit.com. Vyvíjí ji společnost **PI Software LTDA** (Quartel Enterprise), správce osobních údajů („my“).

Řídí se brazilským obecným zákonem o ochraně osobních údajů (zákon č. 13.709/2018, LGPD). Používáním aplikace souhlasíš s [Podmínkami služby](/terms), jejichž součástí jsou tyto zásady.

## Údaje, které zpracováváme {#data}

### Co nám dáš

- **Profil:** tvoje jméno, fotka (volitelně) a barva avataru.
- **Skupiny a výdaje:** název a měna skupiny; u každého výdaje popis, částka, datum, kategorie, kdo platil a jak se rozdělil; položky, komentáře a přiložené fotky.
- **Platby**, které zaznamenáš mezi členy.
- **Platební klíče**, které uložíš pro přijímání plateb: klíč Pix a adresu pro Bitcoin.
- **Způsoby platby**, kterými platíš (kreditní nebo debetní karta, Pix, bankovní převod, Bitcoin, hotovost nebo jiný): jejich název, typ a barvu, nikdy číslo karty, a kterým z nich byl zaplacen každý výdaj.
- **Příjmy**, jen pokud rozděluješ „Podle příjmu“.
- **Lidé, které přidáš** do skupiny dřív, než mají aplikaci, pod jménem, které jim dáš.
- **Komentáře**, které pod svým jménem zanecháš u výdaje, který s tebou někdo sdílel odkazem.
- **Zprávy podpoře**, které posíláš e-mailem z Profil › „Kontaktovat podporu“. Aplikace k nim přidá svou verzi, platformu, svůj jazyk a typ účtu, nikdy ID tvého účtu.

### Tvůj účet

- **Bez účtu:** anonymní ID, vytvořené při prvním otevření aplikace, a obnovovací kód, který ti vrátí přístup na jiném zařízení.
- **S účtem Google nebo Apple (volitelně):** e-mail a ID účtu, které nám poskytovatel pošle, a pokud chceš, i fotka. U účtu Apple můžeš svůj e-mail skrýt.

### Co se sbírá automaticky

- **Metriky používání** (Google Firebase Analytics): otevřené obrazovky a provedené akce, například „vytvořil(a) skupinu“, s údaji o zařízení (model, systém, jazyk, verze aplikace a přibližná země). Nikdy neobsahují jména, částky ani ID skupin, výdajů nebo lidí. Nepoužíváme reklamní ID a personalizace reklam je vypnutá. Pokud máš účet, anonymní nebo s účtem Google či Apple, metriky nesou jeho ID, náhodný kód, který není tvým jménem ani e-mailem, takže vidíme, jak se aplikace používá napříč tvým telefonem, počítačem a prohlížečem. Vypneš je na každém zařízení v Profil › Soukromí a o aplikaci › „Sdílet údaje o používání“.
- **Hlášení o pádech** (Firebase Crashlytics v aplikacích pro Android, iPhone, iPad a Mac a Sentry v prohlížeči): druh chyby a místo v kódu, kde nastala, s verzí aplikace a údaji o zařízení nebo prohlížeči (model, systém), bez zpráv, které by mohly obsahovat tvoje data.
- **Token pro oznámení:** adresa, kterou zařízení přidělí Google, Apple nebo prohlížeč, aby mohlo dostávat upozornění.
- **Údaje o připojení**, například IP adresa, zaznamenávané našimi poskytovateli infrastruktury.

### Na webu

blitzsplit.com používá Google Analytics k počítání návštěv, v projektu odděleném od projektu aplikace. Návštěvy webu se nikdy nemíchají s tím, jak používáš aplikaci.

## Kde jsou tvoje data {#where}

Aplikace funguje **nejdřív offline**: co přidáš, uloží se do databáze přímo v zařízení (v prohlížeči do úložiště webu). Když je připojení, data jdou na náš server, který synchronizuje tvoje zařízení a každému členovi předá, co patří skupině.

> **Naskenovat účtenku**
>
> Fotka jde na náš server a přečte ji model umělé inteligence od společnosti Anthropic (Claude), který vrátí položky, ceny a celkovou částku. Fotku po přečtení neuchováváme: u výdaje zůstane, jen pokud ji přiložíš. Podle obchodních podmínek společnosti Anthropic se tento obsah nepoužívá k trénování modelů.

> **Pozvat z kontaktů**
>
> Na Androidu, iPhonu, iPadu a Macu aplikace čte kontakty z tvého telefonu, jen když to povolíš, aby je zobrazila, když někoho zveš do skupiny. Zůstávají v zařízení: žádné jméno ani číslo se nedostane na náš server.

## K čemu je používáme {#use}

| Účel | Údaje | Právní základ (LGPD) |
| --- | --- | --- |
| Ukládání, synchronizace a zobrazení skupině | Profil, skupiny, výdaje, platby, platební klíče | Plnění smlouvy (čl. 7, V) |
| Uchování tvých způsobů platby na tvých zařízeních | Způsoby platby a výdaje zaplacené každým z nich | Plnění smlouvy |
| Zobrazení toho, co sdílíš odkazem | Sdílený výdaj, nebo tvoje jméno a fotka | Plnění smlouvy |
| Přihlášení a obnovení přístupu | Anonymní ID, obnovovací kód, účet Google nebo Apple | Plnění smlouvy |
| Čtení účtenek | Fotka účtenky, na tvou žádost | Plnění smlouvy |
| Posílání oznámení | Token zařízení, události ve skupině | Plnění smlouvy; která chceš, vybereš v Profil › Oznámení |
| Zlepšování aplikace | Metriky používání | Oprávněný zájem (čl. 7, IX); námitku vzneseš vypnutím „Sdílet údaje o používání“ v Profilu |
| Opravy pádů | Hlášení o pádech | Oprávněný zájem (čl. 7, IX); tímto nastavením se neřídí a námitku vzneseš tak, že nám napíšeš |
| Bezpečnost a prevence zneužití | Údaje o připojení | Oprávněný zájem |
| Odpovídání na zprávy podpoře | Tvoje zpráva a to, co k ní přidá aplikace | Plnění smlouvy |
| Plnění zákonných povinností | Co daná povinnost vyžaduje | Právní povinnost (čl. 7, II) |

Osobní údaje neprodáváme, nepoužíváme je k reklamě a nevytváříme o tobě profily chování.

## Kdo vidí tvoje data {#sees}

### Lidé v tvé skupině

Kdokoli ve skupině vidí jméno, fotku a barvu každého člena; výdaje, položky, komentáře, fotky a platby dané skupiny; a platební klíče, které člen ukazuje, aby dostal zaplaceno. **Tvůj e-mail nikdo ze skupiny nevidí**, stejně jako tvoje způsoby platby: vidíš je jen ty, na svých zařízeních.

### Kdo má odkaz, který sdílíš

- **Sdílet výdaj** vytvoří odkaz na jeden výdaj. S volbou „Jen lidé ve výdaji“ ho otevřou jen lidé, kteří v něm jsou. S volbou „Kdokoli s odkazem“ vidí výdaj každý, kdo má odkaz (jeho popis, částku, datum, kategorii a název skupiny, kdo platil a jak se rozdělil, se jmény), včetně fotek a komentářů, a kdokoli přihlášený v aplikaci ho může komentovat. Náhled, který z odkazu vytvoří chatovací aplikace, ukazuje popis, částku a kdo platil. „Vypnout odkaz“ ve Sdílet výdaj způsobí, že odkaz přestane fungovat.
- **Sdílet profil** vytvoří odkaz na tvůj profil: kdo ho má, vidí tvoje jméno a fotku, i v náhledu odkazu.

### Kdo pro nás pracuje

Tyto společnosti zpracovávají údaje naším jménem, a to jen pro účely, které jsou tu popsány:

| Společnost | K čemu |
| --- | --- |
| Supabase | Databáze, přihlášení a ukládání fotek |
| Google (Firebase) | Metriky používání; hlášení o pádech v aplikacích pro Android, iPhone, iPad a Mac; oznámení v systému Android; Google Analytics webu; přihlášení přes Google |
| Apple | Oznámení na zařízeních iPhone, iPad a Mac; přihlášení přes Apple |
| Anthropic | Čtení fotek účtenek |
| Sentry | Hlášení o pádech v prohlížeči |
| Cloudflare | Hosting webu blitzsplit.com |
| Google Play a App Store | Distribuce a aktualizace aplikace |

Údaje můžeme sdílet také tehdy, když to vyžaduje zákon nebo soudní příkaz.

## Předávání do jiných zemí {#abroad}

Někteří z těchto poskytovatelů ukládají nebo zpracovávají údaje mimo Brazílii, většinou ve Spojených státech. Tato předávání se řídí článkem 33 LGPD, se smluvními doložkami a zárukami, které jednotliví poskytovatelé nabízejí.

## Jak dlouho je uchováváme {#keep}

- Dokud tvůj účet existuje, uchováváme, co aplikace potřebuje ke svému fungování.
- **Odhlásit se** vymaže kopii v zařízení. S účtem Google nebo Apple zůstanou tvoje data na serveru pro chvíli, kdy se znovu přihlásíš.
- **Bez účtu** „Vymazat profil a odhlásit se“ vyčistí zařízení a tvůj obnovovací kód funguje ještě 30 dní. Pokud chceš hned vymazat i to, co je na serveru, použij „Smazat účet a data“.
- **Účet bez Google nebo Apple se smaže po 30 dnech nepoužívání:** když se žádné z jeho zařízení 30 dní nesynchronizuje, server ho smaže stejně jako „Smazat účet a data“ a jeho obnovovací kód přestane fungovat.
- **„Smazat účet a data“** v Profilu najednou smaže tvůj profil, fotku, platební klíče, způsoby platby a obnovovací kód a zruší přístup, který udělil Apple. Výdaje, které jsi přidal(a) do skupin s dalšími lidmi, tam pro skupinu zůstanou, bez tvého jména, jako „Bývalý člen“.
- Údaje o používání spojené se zařízením zůstávají v Google Analytics až 14 měsíců. Potom zůstanou jen souhrnná čísla, bez čehokoli, co by někoho identifikovalo. Jakmile je tvůj účet smazán, ID, které nesou, už k tobě nevede.
- Hlášení o pádech uchováváme až 90 dní a pak je mažeme.

## Tvoje práva {#rights}

Podle LGPD (čl. 18) můžeš:

- ověřit, zda tvoje údaje zpracováváme, a získat k nim přístup;
- opravit neúplné, nepřesné nebo zastaralé údaje;
- požádat o anonymizaci, blokování nebo výmaz nepotřebných údajů;
- přenést svoje údaje do jiné služby (přenositelnost);
- zjistit, s kým tvoje údaje sdílíme;
- odvolat souhlas a vznést námitku proti zpracování založenému na oprávněném zájmu;
- podat stížnost u brazilského Národního úřadu pro ochranu osobních údajů (ANPD).

Velkou část z toho uděláš přímo v aplikaci: upravíš profil, smažeš platební klíč, smažeš účet. Se vším ostatním napiš na [quare.software@gmail.com](mailto:quare.software@gmail.com). Odpovíme do 15 dnů.

## Zabezpečení {#security}

Data se přenášejí šifrovaně (HTTPS). Na serveru pravidla přístupu zajišťují, že každý čte jen skupiny, do kterých patří. Žádný systém není bezchybný, ale každý incident bereme vážně a oznámíme ho tobě i ANPD, když to zákon vyžaduje.

Tvůj obnovovací kód, 12 slov, funguje jako heslo: ulož si ho na bezpečné místo a s nikým ho nesdílej. Slova neuchováváme, jen jejich otisk, ze kterého je nelze zpětně získat. Na zařízeních iPhone, iPad a Mac ho aplikace uloží do aplikace Hesla.

## Děti {#children}

Aplikace Blitz Split není určená dětem mladším 13 let a vědomě neshromažďuje jejich údaje. Pokud se o takovém případu dozvíš, kontaktuj nás a údaje smažeme.

## Změny těchto zásad {#changes}

Když se tyto zásady změní, aktualizujeme datum nahoře. Pokud je změna podstatná, dáme ti vědět v aplikaci dřív, než začne platit.

## Kontakt {#contact}

Dotazy k těmto zásadám nebo žádosti týkající se tvých údajů: [quare.software@gmail.com](mailto:quare.software@gmail.com). Je to také kontakt na našeho pověřence pro ochranu osobních údajů.

Správce: PI Software LTDA (Quartel Enterprise).
