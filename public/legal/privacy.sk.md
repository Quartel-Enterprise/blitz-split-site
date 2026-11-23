---
title: Zásady ochrany osobných údajov
updated: 2026-11-17
---

> **Stručne**
>
> - Aplikáciu používaš bez zakladania účtu. Google a Apple sú voliteľné, ale bez nich sa tvoj účet po 30 dňoch nepoužívania odstráni.
> - Čo pridáš, zostáva najprv v tvojom zariadení a na server ide len kvôli synchronizácii a aby sa to dostalo k tvojej skupine.
> - Ľudia v skupine vidia, čo patrí skupine, a kto má odkaz, ktorý zdieľaš, vidí daný výdavok alebo tvoj profil. Tvoj e-mail nevidí nikto.
> - Metriky používania a hlásenia o pádoch neobsahujú mená ani sumy. Keď máš účet, metriky sú spojené s jeho ID. Nepoužívame reklamné ID a metriky si vypneš v Profile.
> - Údaje nepredávame. Účet a údaje odstrániš priamo v aplikácii.

## Kto sme {#who}

Tieto zásady vysvetľujú, ako **Blitz Split** (v Brazílii Bora Rachar) zaobchádza s osobnými údajmi v aplikáciách pre Android, iPhone, iPad, Mac a prehliadač a na webe blitzsplit.com. Vyvíja ho spoločnosť **PI Software LTDA** (Quartel Enterprise), prevádzkovateľ údajov („my“).

Riadia sa brazílskym všeobecným zákonom o ochrane údajov (zákon č. 13.709/2018, LGPD). Používaním aplikácie súhlasíš s [Podmienkami používania](/terms), ktorých sú tieto zásady súčasťou.

## Údaje, ktoré spracúvame {#data}

### Čo nám poskytneš

- **Profil:** tvoje meno, fotka (voliteľná) a farba tvojho avatara.
- **Skupiny a výdavky:** názov a mena skupiny; pri každom výdavku popis, suma, dátum, kategória, kto platil a ako sa rozdelil; položky, komentáre a priložené fotky.
- **Platby**, ktoré zaznamenáš medzi členmi.
- **Platobné kľúče**, ktoré si uložíš na prijímanie platieb: kľúč Pix a bitcoinová adresa.
- **Spôsoby platby**, ktorými platíš (kreditná alebo debetná karta, Pix, bankový prevod, Bitcoin, hotovosť alebo iný): ich názov, typ a farba, nikdy číslo karty, a ktorým z nich si zaplatil(a) ktorý výdavok.
- **Príjmy**, iba ak delíš „Podľa príjmu“.
- **Ľudia, ktorých pridáš** do skupiny skôr, než majú aplikáciu, pod menom, ktoré im dáš.
- **Komentáre**, ktoré necháš pri výdavku, ktorý s tebou niekto zdieľal odkazom, pod tvojím menom.
- **Správy pre podporu**, ktoré pošleš e-mailom z Profil › „Kontaktovať podporu“. Aplikácia pridá svoju verziu, platformu, svoj jazyk a druh účtu, nikdy ID tvojho účtu.

### Tvoj účet

- **Bez účtu:** anonymné ID, vytvorené pri otvorení aplikácie, a kód na obnovenie, ktorý ti vráti prístup v inom zariadení.
- **Cez Google alebo Apple (voliteľné):** e-mail a ID účtu, ktoré nám poskytovateľ pošle, a ak chceš, aj fotka. Pri Apple môžeš svoj e-mail skryť.

### Čo sa zbiera automaticky

- **Metriky používania** (Google Firebase Analytics): otvorené obrazovky a vykonané akcie, napríklad „vytvoril(a) skupinu“, s údajmi o zariadení (model, systém, jazyk, verzia aplikácie a približná krajina). Nikdy neobsahujú mená, sumy ani ID skupín, výdavkov či ľudí. Nepoužívame reklamné ID a prispôsobovanie reklám je vypnuté. Ak máš účet, anonymný alebo cez Google či Apple, metriky obsahujú jeho ID, náhodný kód, ktorý nie je tvoje meno ani e-mail, takže vidíme, ako sa aplikácia používa naprieč tvojím telefónom, počítačom a prehliadačom. Vypneš ich v každom zariadení v Profil › Súkromie a informácie › „Zdieľať údaje o používaní“.
- **Hlásenia o pádoch** (Firebase Crashlytics v aplikáciách pre Android, iPhone, iPad a Mac a Sentry v prehliadači): druh chyby a miesto v kóde, kde nastala, s verziou aplikácie a údajmi o zariadení alebo prehliadači (model, systém), bez správ, ktoré by mohli obsahovať tvoje údaje.
- **Token pre upozornenia:** adresa, ktorú Google, Apple alebo prehliadač pridelí zariadeniu na prijímanie upozornení.
- **Údaje o pripojení**, napríklad IP adresa, ktoré zaznamenávajú poskytovatelia našej infraštruktúry.

### Na webe

blitzsplit.com používa Google Analytics na počítanie návštev, v projekte oddelenom od projektu aplikácie. Návštevy webu sa nikdy nemiešajú s tým, ako používaš aplikáciu.

## Kde sú tvoje údaje {#where}

Aplikácia funguje **najprv offline**: čo pridáš, uloží sa do databázy priamo v zariadení (v prehliadači v úložisku webu). Keď je pripojenie, údaje idú na náš server, ktorý synchronizuje tvoje zariadenia a každému členovi dá to, čo patrí skupine.

> **Naskenovať účtenku**
>
> Fotka ide na náš server a prečíta ju model umelej inteligencie od spoločnosti Anthropic (Claude), ktorý vráti položky, ceny a celkovú sumu. Fotku si po prečítaní neuchovávame: pri výdavku zostane, len ak ju priložíš. Podľa obchodných podmienok spoločnosti Anthropic sa tento obsah nepoužíva na trénovanie modelov.

> **Pozvať z kontaktov**
>
> V systémoch Android, iPhone, iPad a Mac aplikácia číta kontakty tvojho zariadenia, až keď to povolíš, aby ich zobrazila, keď niekoho pozývaš do skupiny. Zostávajú v zariadení: na náš server nejde žiadne meno ani číslo.

## Na čo ich používame {#use}

| Účel | Údaje | Právny základ (LGPD) |
| --- | --- | --- |
| Ukladať, synchronizovať a zobrazovať skupine | Profil, skupiny, výdavky, platby, platobné kľúče | Plnenie zmluvy (čl. 7 ods. V) |
| Uchovávať tvoje spôsoby platby v tvojich zariadeniach | Spôsoby platby a výdavky zaplatené každým z nich | Plnenie zmluvy |
| Zobraziť, čo zdieľaš odkazom | Zdieľaný výdavok, alebo tvoje meno a fotka | Plnenie zmluvy |
| Prihlásenie a obnovenie prístupu | Anonymné ID, kód na obnovenie, účet Google alebo Apple | Plnenie zmluvy |
| Čítanie účteniek | Fotka účtenky, na tvoju žiadosť | Plnenie zmluvy |
| Posielanie upozornení | Token zariadenia, udalosti skupiny | Plnenie zmluvy; ktoré, si vyberieš v Profil › Upozornenia |
| Zlepšovanie aplikácie | Metriky používania | Oprávnený záujem (čl. 7 ods. IX); namietneš vypnutím „Zdieľať údaje o používaní“ v Profile |
| Opravovanie pádov | Hlásenia o pádoch | Oprávnený záujem (čl. 7 ods. IX); toto nastavenie sa na ne nevzťahuje, namietneš tak, že nám napíšeš |
| Bezpečnosť a predchádzanie zneužitiu | Údaje o pripojení | Oprávnený záujem |
| Odpovede podpory | Tvoja správa a to, čo k nej pridá aplikácia | Plnenie zmluvy |
| Plnenie zákona | Čo daná povinnosť vyžaduje | Zákonná povinnosť (čl. 7 ods. II) |

Osobné údaje nepredávame, nepoužívame ich na reklamu a nevytvárame z nich tvoj profil správania.

## Kto vidí tvoje údaje {#sees}

### Ľudia v tvojej skupine

Každý v skupine vidí meno, fotku a farbu každého člena; výdavky, položky, komentáre, fotky a platby tejto skupiny; a platobné kľúče, ktoré člen zobrazuje, aby mu ostatní mohli zaplatiť. **Nikto v skupine nevidí tvoj e-mail** ani tvoje spôsoby platby: vidíš ich len ty, vo svojich zariadeniach.

### Kto má odkaz, ktorý zdieľaš

- **Zdieľať výdavok** vytvorí odkaz na jeden výdavok. Pri „Iba ľudia vo výdavku“ ho otvoria len ľudia, ktorí sú v ňom. Pri „Každý s odkazom“ vidí výdavok každý, kto má odkaz (jeho popis, sumu, dátum, kategóriu a názov skupiny, kto platil a ako sa rozdelil, podľa mien), s fotkami a komentármi, a ktokoľvek prihlásený v aplikácii ho môže komentovať. Náhľad, ktorý z odkazu vykreslí chatovacia aplikácia, ukazuje popis, sumu, kto platil, medzi koľko ľudí je rozdelený a názov skupiny. „Vypnúť odkaz“ v Zdieľať výdavok odkaz deaktivuje; náhľad, ktorý chatovacia aplikácia už vykreslila, v tom chate zostane a obrázok náhľadu môže zostať vo vyrovnávacej pamäti až jeden deň.
- **Zdieľať profil** vytvorí odkaz na tvoj profil: kto ho má, vidí tvoje meno a fotku, aj v náhľade odkazu.

### Kto pre nás pracuje

Tieto spoločnosti spracúvajú údaje v našom mene, iba na to, čo je tu opísané:

| Spoločnosť | Na čo |
| --- | --- |
| Supabase | Databáza, prihlásenie a úložisko fotiek |
| Google (Firebase) | Metriky používania; hlásenia o pádoch v aplikáciách pre Android, iPhone, iPad a Mac; upozornenia v Androide; Google Analytics webu; prihlásenie cez Google; e-mail podpory (Gmail) |
| Apple | Upozornenia v iPhone, iPade a Macu; prihlásenie cez Apple |
| Anthropic | Čítanie fotiek účteniek |
| Sentry | Hlásenia o pádoch v prehliadači |
| Cloudflare | Hosting webu blitzsplit.com a náhľadov zdieľaných odkazov |
| Google Play a App Store | Distribúcia a aktualizácie aplikácie |

Údaje môžeme poskytnúť aj vtedy, keď to vyžaduje zákon alebo súdny príkaz.

## Prenosy do iných krajín {#abroad}

Niektorí z týchto poskytovateľov uchovávajú alebo spracúvajú údaje mimo Brazílie, väčšinou v Spojených štátoch. Tieto prenosy sa riadia článkom 33 LGPD, so zmluvnými doložkami a zárukami, ktoré ponúka každý poskytovateľ.

## Ako dlho ich uchovávame {#keep}

- Kým tvoj účet existuje, uchovávame to, čo aplikácia potrebuje na fungovanie.
- **Odhlásiť sa** vymaže kópiu v zariadení. Pri Google alebo Apple zostanú tvoje údaje na serveri pre ďalšie prihlásenie.
- **Bez účtu** „Vymazať profil a odhlásiť sa“ vyčistí zariadenie a tvoj kód na obnovenie funguje ďalej, kým sa účet neodstráni pre nepoužívanie (pozri nižšie). Ak chceš hneď vymazať to, čo je na serveri, použi „Odstrániť účet a údaje“.
- **Účet bez Google alebo Apple sa odstráni po 30 dňoch nepoužívania:** keď sa žiadne z jeho zariadení 30 dní nesynchronizuje, server ho odstráni rovnako ako „Odstrániť účet a údaje“ a jeho kód na obnovenie prestane fungovať.
- **„Odstrániť účet a údaje“** v Profile hneď odstráni tvoj profil, fotku, platobné kľúče, spôsoby platby a kód na obnovenie a zruší prístup, ktorý udelil Apple. Výdavky, ktoré si pridal(a) do skupín s inými ľuďmi, tam pre skupinu zostanú pod menom, ktoré si v nej mal(a), už bez prepojenia s akýmkoľvek účtom. Rovnako aj komentáre, ktoré si zanechal(a), aj pri výdavkoch zdieľaných s tebou odkazom.
- E-maily podpory uchovávame, kým ich potrebujeme na odpoveď a na sledovanie toho, čo si nahlásil(a). Požiadaj nás a vymažeme ich.
- Údaje o používaní spojené so zariadením zostávajú v Google Analytics až 14 mesiacov. Potom zostanú len súhrnné čísla, bez ničoho, čo by niekoho identifikovalo. Po odstránení tvojho účtu už ID, ktoré obsahujú, nevedie k tebe.
- Hlásenia o pádoch uchovávame až 90 dní a potom sa vymažú.

## Tvoje práva {#rights}

Podľa LGPD (čl. 18) môžeš:

- získať potvrdenie, či spracúvame tvoje údaje, a prístup k nim;
- opraviť neúplné, nepresné alebo zastarané údaje;
- požiadať o anonymizáciu, blokovanie alebo vymazanie nepotrebných údajov;
- preniesť svoje údaje do inej služby (prenosnosť);
- vedieť, komu tvoje údaje poskytujeme;
- odvolať súhlas a namietať proti spracúvaniu na základe oprávneného záujmu;
- podať sťažnosť brazílskemu Národnému úradu pre ochranu údajov (ANPD).

Veľa z toho urobíš priamo v aplikácii: upravíš profil, odstrániš platobný kľúč, odstrániš účet. Vo zvyšných prípadoch napíš na [appborarachar@gmail.com](mailto:appborarachar@gmail.com). Odpovieme do 15 dní.

## Bezpečnosť {#security}

Údaje sa prenášajú šifrovane (HTTPS). Na serveri pravidlá prístupu zabezpečujú, že každý číta len skupiny, do ktorých patrí, a to, čo otvára odkaz, ktorý dostal. Žiadny systém nie je dokonalý, ale každý incident berieme vážne a upovedomíme teba aj ANPD, keď to zákon vyžaduje.

Tvoj kód na obnovenie, 12 slov, funguje ako heslo: uchovaj si ho na bezpečnom mieste a s nikým ho nezdieľaj. Slová si neuchovávame, iba ich odtlačok, z ktorého sa nedajú spätne získať. V iPhone, iPade a Macu ho aplikácia uloží do aplikácie Heslá.

## Deti {#children}

Blitz Split nie je určený deťom do 13 rokov a vedome nezbiera ich údaje. Ak sa o takom prípade dozvieš, kontaktuj nás a údaje vymažeme.

## Zmeny týchto zásad {#changes}

Keď sa tieto zásady zmenia, aktualizujeme dátum hore. Ak je zmena dôležitá, oznámime ti ju v aplikácii skôr, než nadobudne účinnosť.

## Kontakt {#contact}

Otázky k týmto zásadám alebo žiadosti týkajúce sa tvojich údajov: [appborarachar@gmail.com](mailto:appborarachar@gmail.com). Je to aj kanál našej zodpovednej osoby.

Prevádzkovateľ: PI Software LTDA (Quartel Enterprise).
