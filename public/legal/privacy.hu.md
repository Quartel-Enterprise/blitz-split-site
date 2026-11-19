---
title: Adatvédelmi szabályzat
updated: 2026-11-17
---

> **Röviden**
>
> - Az alkalmazást fiók létrehozása nélkül is használhatod. A Google és az Apple nem kötelező, de nélkülük a fiókod 30 nap használat nélkül törlődik.
> - Amit hozzáadsz, először az eszközödön marad, és csak a szinkronizáláshoz, illetve azért kerül a szerverre, hogy eljusson a csoportodhoz.
> - A csoport tagjai látják azt, ami a csoporthoz tartozik, és akinek megvan egy általad megosztott link, látja az adott kiadást vagy a profilodat. Az e-mail-címedet senki sem látja.
> - A használati mérőszámok és az összeomlási jelentések nem tartalmaznak neveket vagy összegeket. Ha van fiókod, a mérőszámok a fiók azonosítójához kapcsolódnak. Nem használunk hirdetési azonosítót, és a mérőszámokat a Profilban kikapcsolhatod.
> - Nem adunk el adatokat. A fiókodat és az adataidat magából az alkalmazásból törölheted.

## Kik vagyunk {#who}

Ez a szabályzat azt ismerteti, hogyan kezeli a **Blitz Split** (Brazíliában Bora Rachar) a személyes adatokat az Androidra, iPhone-ra, iPadre, Macre és böngészőre készült alkalmazásokban, valamint a blitzsplit.com webhelyen. Fejlesztője a **PI Software LTDA** (Quartel Enterprise), az adatkezelő („mi”).

A szabályzat Brazília általános adatvédelmi törvényét (13.709/2018. sz. törvény, LGPD) követi. Az alkalmazás használatával elfogadod a [Felhasználási feltételeket](/terms), amelyeknek ez a szabályzat a részét képezi.

## Az általunk kezelt adatok {#data}

### Amit te adsz meg

- **Profil:** a neved, egy fotó (nem kötelező) és az avatarod színe.
- **Csoportok és kiadások:** a csoport neve és pénzneme; az egyes kiadások leírása, összege, dátuma, kategóriája, valamint hogy ki fizetett és hogyan lett felosztva; a tételek, a hozzászólások és a csatolt fotók.
- **Fizetések**, amelyeket a tagok között rögzítesz.
- **Fizetési kulcsok**, amelyeket a pénz fogadásához mentesz el: Pix-kulcs és Bitcoin-cím.
- **Fizetési módok**, amelyekkel fizetsz (hitel- vagy betéti kártya, Pix, banki átutalás, Bitcoin, készpénz vagy más): a nevük, típusuk és színük, kártyaszám soha, valamint az, hogy melyik kiadást melyikkel fizetted.
- **Jövedelmek**, kizárólag akkor, ha „Jövedelem szerint” osztasz fel.
- **Általad hozzáadott személyek**, akiket azelőtt veszel fel egy csoportba, hogy meglenne nekik az alkalmazás, az általad megadott néven.
- **Hozzászólások**, amelyeket a veled linken megosztott kiadásokhoz írsz, a neveddel.
- **Üzenetek a támogatásnak**, amelyeket a Profil › „Kapcsolatfelvétel a támogatással” menüpontból küldesz e-mailben. Az alkalmazás hozzáadja a verzióját, a platformot, a nyelvét és a fiók típusát, a fiókod azonosítóját soha.

### A fiókod

- **Fiók nélkül:** egy névtelen azonosító, amely az alkalmazás megnyitásakor jön létre, és egy helyreállítási kód, amely másik eszközön visszaállítja a hozzáférésedet.
- **Google-lel vagy Apple-lel (nem kötelező):** a szolgáltató által küldött e-mail-cím és fiókazonosító, valamint ha úgy döntesz, a fotó. Az Apple használatakor elrejtheted az e-mail-címedet.

### Amit automatikusan gyűjtünk

- **Használati mérőszámok** (Google Firebase Analytics): a megnyitott képernyők és a végrehajtott műveletek, például „csoportot hozott létre”, eszközadatokkal (modell, rendszer, nyelv, alkalmazásverzió és hozzávetőleges ország). Soha nem tartalmaznak neveket, összegeket, illetve csoportok, kiadások vagy személyek azonosítóit. Nem használjuk a hirdetési azonosítót, és a személyre szabott hirdetések ki vannak kapcsolva. Ha van fiókod, akár névtelen, akár Google- vagy Apple-fiók, a mérőszámok tartalmazzák az azonosítóját, egy véletlenszerű kódot, amely nem a neved és nem az e-mail-címed, így látjuk, hogyan használják az alkalmazást a telefonodon, a számítógépeden és a böngésződben. Eszközönként kikapcsolhatod őket a Profil › Adatvédelem és névjegy › „Használati adatok megosztása” menüpontban.
- **Összeomlási jelentések** (Firebase Crashlytics az Android-, iPhone-, iPad- és Mac-alkalmazásokban, Sentry a böngészőben): a hiba típusa és az, hogy a kódban hol történt, az alkalmazás verziójával és az eszköz vagy a böngésző adataival (modell, rendszer), az üzenetek nélkül, mivel azok tartalmazhatják az adataidat.
- **Értesítési token:** az a cím, amelyet a Google, az Apple vagy a böngésző ad az eszköznek az értesítések fogadásához.
- **Kapcsolati adatok**, például az IP-cím, amelyet az infrastruktúra-szolgáltatóink naplóznak.

### A webhelyen

A blitzsplit.com a Google Analytics szolgáltatással méri a látogatásokat, az alkalmazásétól külön projektben. A webhely látogatásai soha nem keverednek azzal, ahogyan az alkalmazást használod.

## Hol vannak az adataid {#where}

Az alkalmazás **elsősorban offline** működik: amit hozzáadsz, az magán az eszközön, egy adatbázisban mentődik (a böngészőben a webhely tárhelyén belül). Internetkapcsolat esetén az adatok a szerverünkre kerülnek, amely szinkronizálja az eszközeidet, és minden tagnak megadja azt, ami a csoporthoz tartozik.

> **Nyugta beolvasása**
>
> A fotó a szerverünkre kerül, és az Anthropic egyik MI-modellje (Claude) olvassa be, amely visszaadja a tételeket, az árakat és a végösszeget. A fotót a beolvasás után nem őrizzük meg: csak akkor marad a kiadáson, ha csatolod. Az Anthropic kereskedelmi feltételei szerint ezt a tartalmat nem használják modellek tanítására.

> **Meghívás a névjegyekből**
>
> Androidon, iPhone-on, iPaden és Macen az alkalmazás kizárólag az engedélyed után olvassa be az eszközöd névjegyeit, hogy felsorolja őket, amikor valakit meghívsz egy csoportba. A névjegyek az eszközön maradnak: sem név, sem telefonszám nem kerül a szerverünkre.

## Mire használjuk {#use}

| Cél | Adatok | Jogalap (LGPD) |
| --- | --- | --- |
| Tárolás, szinkronizálás és megjelenítés a csoportnak | Profil, csoportok, kiadások, fizetések, fizetési kulcsok | Szerződés teljesítése (7. cikk V. pont) |
| A fizetési módjaid megőrzése az eszközeiden | A fizetési módok és az egyes módokkal fizetett kiadások | Szerződés teljesítése |
| Az általad linken megosztott tartalom megjelenítése | A megosztott kiadás, vagy a neved és a fotód | Szerződés teljesítése |
| Bejelentkezés és a hozzáférés helyreállítása | Névtelen azonosító, helyreállítási kód, Google- vagy Apple-fiók | Szerződés teljesítése |
| Nyugták beolvasása | A nyugta fotója, a kérésedre | Szerződés teljesítése |
| Értesítések küldése | Eszköztoken, csoportesemények | Szerződés teljesítése; a Profil › Értesítések menüpontban választod ki, melyeket kapod |
| Az alkalmazás fejlesztése | Használati mérőszámok | Jogos érdek (7. cikk IX. pont); tiltakozhatsz ellene, ha a Profilban kikapcsolod a „Használati adatok megosztása” beállítást |
| Összeomlások javítása | Összeomlási jelentések | Jogos érdek (7. cikk IX. pont); nem követik ezt a beállítást, és nekünk írva tiltakozhatsz ellene |
| Biztonság és a visszaélések megelőzése | Kapcsolati adatok | Jogos érdek |
| Válasz a támogatási megkeresésekre | Az üzeneted és az, amit az alkalmazás hozzáad | Szerződés teljesítése |
| A jogszabályok betartása | Amit a kötelezettség megkövetel | Jogi kötelezettség (7. cikk II. pont) |

Nem adunk el személyes adatokat, nem használjuk fel őket hirdetésekhez, és nem készítünk rólad viselkedési profilt.

## Ki látja az adataidat {#sees}

### A csoportod tagjai

A csoportban mindenki látja az egyes tagok nevét, fotóját és színét; a csoport kiadásait, tételeit, hozzászólásait, fotóit és fizetéseit; valamint azokat a fizetési kulcsokat, amelyeket egy tag a pénz fogadásához megjelenít. **A csoportban senki sem látja az e-mail-címedet**, sem a fizetési módjaidat: ezeket csak te látod, a saját eszközeiden.

### Akinek megvan az általad megosztott link

- A **Kiadás megosztása** linket készít egy kiadáshoz. A „Csak a kiadás résztvevői” beállításnál csak a résztvevők nyithatják meg. A „Bárki, akinek megvan a link” beállításnál bárki, akinek megvan a link, látja a kiadást (a leírását, az összegét, a dátumát, a kategóriáját és a csoport nevét, valamint név szerint azt, hogy ki fizetett és hogyan lett felosztva) a fotóival és a hozzászólásaival együtt, és az alkalmazásba bejelentkezett bárki hozzászólhat. Az előnézet, amelyet egy csevegőalkalmazás a linkből készít, megjeleníti a leírást, az összeget, azt, hogy ki fizetett, hány személy között oszlik meg, és a csoport nevét. A „Link kikapcsolása” a Kiadás megosztása menüben leállítja a link működését; a csevegőalkalmazás által már elkészített előnézet abban a csevegésben marad, és az előnézet képe legfeljebb egy napig a gyorsítótárban maradhat.
- A **Profil megosztása** linket készít a profilodhoz: akinek megvan, látja a nevedet és a fotódat, a link előnézetében is.

### Akik nekünk dolgoznak

Ezek a vállalatok a nevünkben kezelnek adatokat, kizárólag az itt leírt célokra:

| Vállalat | Mire |
| --- | --- |
| Supabase | Adatbázis, bejelentkezés és fotótárolás |
| Google (Firebase) | Használati mérőszámok; összeomlási jelentések az Android-, iPhone-, iPad- és Mac-alkalmazásokban; értesítések Androidon; a webhely Google Analytics szolgáltatása; bejelentkezés Google-lel; a támogatási e-mail (Gmail) |
| Apple | Értesítések iPhone-on, iPaden és Macen; bejelentkezés Apple-lel |
| Anthropic | Nyugtafotók beolvasása |
| Sentry | Összeomlási jelentések a böngészőben |
| Cloudflare | A blitzsplit.com webhely és a megosztott linkek előnézeteinek tárhelye |
| Google Play és App Store | Az alkalmazás terjesztése és frissítése |

Adatokat akkor is megoszthatunk, ha azt jogszabály vagy bírósági végzés előírja.

## Adattovábbítás más országokba {#abroad}

Egyes szolgáltatók Brazílián kívül, főként az Egyesült Államokban tárolnak vagy dolgoznak fel adatokat. Ezek az adattovábbítások az LGPD 33. cikkét követik, az egyes szolgáltatók által kínált szerződéses kikötésekkel és garanciákkal.

## Meddig őrizzük meg {#keep}

- Amíg a fiókod létezik, megőrizzük azt, ami az alkalmazás működéséhez szükséges.
- A **kijelentkezés** törli az eszközön lévő másolatot. Google vagy Apple használata esetén az adataid a szerveren maradnak arra az esetre, ha újra bejelentkezel.
- **Fiók nélkül** a „Profil törlése és kijelentkezés” kiüríti az eszközt, a helyreállítási kódod pedig addig működik, amíg a fiók használat hiányában nem törlődik (lásd lent). A szerveren lévő adatok azonnali törléséhez használd a „Fiók és adatok törlése” lehetőséget.
- **A Google vagy Apple nélküli fiók 30 nap használat nélkül törlődik:** ha 30 napig egyik eszköze sem szinkronizál, a szerver ugyanúgy törli, mint a „Fiók és adatok törlése”, és a helyreállítási kódja többé nem működik.
- A Profilban található **„Fiók és adatok törlése”** azonnal törli a profilodat, a fotódat, a fizetési kulcsaidat, a fizetési módjaidat és a helyreállítási kódodat, és visszavonja az Apple által adott hozzáférést. A más személyekkel közös csoportokhoz hozzáadott kiadásaid ott maradnak a csoport számára, azon a néven, amelyet ott használtál, már egyetlen fiókhoz sem kapcsolódva. Ugyanez vonatkozik a hozzászólásaidra is, a veled linken megosztott kiadásokhoz írtakra is.
- A támogatási e-maileket addig őrizzük meg, amíg szükségünk van rájuk a válaszadáshoz és a bejelentett ügy nyomon követéséhez. Ha kéred, töröljük őket.
- Az eszközhöz kötött használati adatok legfeljebb 14 hónapig maradnak a Google Analyticsben. Ezután csak összesített számok maradnak, amelyek senkit sem azonosítanak. A fiókod törlése után az általuk hordozott azonosító már nem vezet el hozzád.
- Az összeomlási jelentéseket legfeljebb 90 napig őrizzük meg, majd töröljük.

## Jogaid {#rights}

Az LGPD (18. cikk) alapján jogod van:

- megerősítést kérni arról, hogy kezeljük-e az adataidat, és hozzáférni azokhoz;
- helyesbíteni a hiányos, pontatlan vagy elavult adatokat;
- kérni a szükségtelen adatok anonimizálását, zárolását vagy törlését;
- másik szolgáltatáshoz vinni az adataidat (hordozhatóság);
- megtudni, kivel osztjuk meg az adataidat;
- visszavonni a hozzájárulásodat, és tiltakozni a jogos érdeken alapuló adatkezelés ellen;
- panaszt tenni Brazília Nemzeti Adatvédelmi Hatóságánál (ANPD).

Ennek nagy részét magában az alkalmazásban megteheted: szerkesztheted a profilodat, törölhetsz egy fizetési kulcsot, törölheted a fiókodat. A többi esetben írj az [appborarachar@gmail.com](mailto:appborarachar@gmail.com) címre. 15 napon belül válaszolunk.

## Biztonság {#security}

Az adatok titkosítva utaznak (HTTPS). A szerveren hozzáférési szabályok biztosítják, hogy mindenki csak azokat a csoportokat olvashassa, amelyeknek tagja, és azt, amit a kapott link megnyit. Egyetlen rendszer sem hibátlan, de minden incidenst komolyan veszünk, és értesítünk téged és az ANPD-t, ha a jogszabály előírja.

A 12 szóból álló helyreállítási kódod jelszóként működik: tartsd biztonságos helyen, és ne oszd meg senkivel. A szavakat nem tároljuk, csak egy ujjlenyomatukat, amelyből nem állíthatók vissza. iPhone-on, iPaden és Macen az alkalmazás a Jelszavak appba menti.

## Gyermekek {#children}

A Blitz Split nem 13 év alatti gyermekeknek készült, és tudatosan nem gyűjti az adataikat. Ha ilyen esetről szerzel tudomást, lépj kapcsolatba velünk, és töröljük az adatokat.

## A szabályzat módosítása {#changes}

Ha ez a szabályzat változik, frissítjük a tetején lévő dátumot. Ha a változás jelentős, még a hatálybalépése előtt tájékoztatunk az alkalmazásban.

## Kapcsolat {#contact}

A szabályzattal kapcsolatos kérdések vagy az adataiddal kapcsolatos kérések: [appborarachar@gmail.com](mailto:appborarachar@gmail.com). Ez egyben az adatvédelmi tisztviselőnk elérhetősége is.

Adatkezelő: PI Software LTDA (Quartel Enterprise).
