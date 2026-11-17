---
title: Integritetspolicy
updated: 2026-11-15
---

> **Kort sagt**
>
> - Du använder appen utan att skapa ett konto. Google och Apple är valfria.
> - Det du lägger till sparas först på din enhet och skickas bara till servern för att synkroniseras och nå din grupp.
> - De som är med i en grupp ser det som hör till gruppen. Ingen ser din e-postadress.
> - Användningsstatistik och kraschrapporter innehåller inga namn eller belopp. Med ett konto kopplas statistiken till kontots id. Vi använder inget reklam-id, och du stänger av statistiken i Profil.
> - Vi säljer inte data. Du raderar ditt konto och dina data direkt i appen.

## Vilka vi är {#who}

Den här policyn förklarar hur **Blitz Split** (Bora Rachar i Brasilien) hanterar personuppgifter i apparna för Android, iPhone, iPad, Mac och webbläsaren, och på webbplatsen blitzsplit.com. Appen utvecklas av **PI Software LTDA** (Quartel Enterprise), som är personuppgiftsansvarig (”vi”).

Den följer Brasiliens allmänna dataskyddslag (lag 13.709/2018, LGPD). Genom att använda appen godkänner du våra [Användarvillkor](/terms), som den här policyn är en del av.

## Uppgifterna vi hanterar {#data}

### Det du ger oss

- **Profil:** ditt namn, ett foto (valfritt) och din avatarfärg.
- **Grupper och utgifter:** gruppens namn och valuta; varje utgifts beskrivning, belopp, datum, kategori, vem som betalade och hur den delades upp; artiklar, kommentarer och bifogade foton.
- **Betalningar** som du registrerar mellan medlemmar.
- **Betalningsnycklar** som du sparar: en Pix-nyckel och en Bitcoin-adress.
- **Inkomster**, bara om du delar upp ”Efter inkomst”.
- **Personer du lägger till** i en grupp innan de har appen, under det namn du ger dem.

### Ditt konto

- **Utan konto:** ett anonymt id, som skapas när du öppnar appen, och en återställningskod som återställer din åtkomst på en annan enhet.
- **Med Google eller Apple (valfritt):** e-postadressen och konto-id:t som leverantören skickar till oss och, om du vill, fotot. Med Apple kan du dölja din e-postadress.

### Det som samlas in automatiskt

- **Användningsstatistik** (Google Firebase Analytics): vilka skärmar som öppnas och vilka åtgärder som görs, till exempel ”skapade en grupp”, med uppgifter om enheten (modell, system, språk, appversion och ungefärligt land). Den innehåller aldrig namn, belopp eller id:n för grupper, utgifter eller personer. Vi använder inte reklam-id:t, och anpassning av annonser är avstängd. Om du har ett konto, anonymt eller med Google eller Apple, bär statistiken dess id, en slumpmässig kod som inte är ditt namn eller din e-postadress, så att vi ser hur appen används på din telefon, dator och webbläsare. Du stänger av den på varje enhet i Profil › Integritet och om › ”Dela användningsdata”.
- **Kraschrapporter** (Firebase Crashlytics i apparna för Android, iPhone, iPad och Mac, och Sentry i webbläsaren): typen av fel och var i koden det inträffade, med appens version och enhetens eller webbläsarens uppgifter (modell, system), utan meddelandena, som kan innehålla dina data.
- **Aviseringstoken:** adressen som Google, Apple eller webbläsaren ger enheten för att ta emot aviseringar.
- **Anslutningsuppgifter**, till exempel IP-adressen, som loggas av våra infrastrukturleverantörer.

### På webbplatsen

blitzsplit.com använder Google Analytics för att räkna besök, i ett projekt skilt från appens. Besök på webbplatsen blandas aldrig ihop med hur du använder appen.

## Var dina data finns {#where}

Appen är **offline först**: det du lägger till sparas i en databas på själva enheten (i webbläsaren, i webbplatsens lagring). När det finns en anslutning skickas data till vår server, som synkroniserar dina enheter och ger varje medlem det som hör till gruppen.

> **Skanna kvitto**
>
> Fotot skickas till vår server och läses av en AI-modell från Anthropic (Claude), som returnerar artiklarna, priserna och totalsumman. Vi behåller inte fotot efter att det har lästs: det finns bara kvar på utgiften om du bifogar det. Enligt Anthropics kommersiella villkor används detta innehåll inte för att träna modeller.

## Vad vi använder dem till {#use}

| Ändamål | Uppgifter | Rättslig grund (LGPD) |
| --- | --- | --- |
| Lagra, synkronisera och visa för gruppen | Profil, grupper, utgifter, betalningar, betalningsnycklar | Fullgörande av avtal (art. 7, V) |
| Logga in och återställa åtkomst | Anonymt id, återställningskod, Google- eller Apple-konto | Fullgörande av avtal |
| Läsa kvitton | Kvittots foto, på din begäran | Fullgörande av avtal |
| Skicka aviseringar | Enhetens token, händelser i grupper | Fullgörande av avtal; du väljer vilka i Profil › Aviseringar |
| Förbättra appen | Användningsstatistik | Berättigat intresse (art. 7, IX); du invänder genom att stänga av ”Dela användningsdata” i Profil |
| Åtgärda krascher | Kraschrapporter | Berättigat intresse (art. 7, IX); de följer inte den inställningen, och du invänder genom att skriva till oss |
| Säkerhet och förebyggande av missbruk | Anslutningsuppgifter | Berättigat intresse |
| Följa lagen | Det som skyldigheten kräver | Rättslig förpliktelse (art. 7, II) |

Vi säljer inte personuppgifter, använder dem inte för reklam och bygger inga beteendeprofiler av dig.

## Vem som ser dina data {#sees}

### De som är med i din grupp

Alla i en grupp ser varje medlems namn, foto och färg; gruppens utgifter, artiklar, kommentarer, foton och betalningar; och de betalningsnycklar en medlem visar för att få betalt. **Ingen i gruppen ser din e-postadress.**

### De som arbetar för oss

Dessa företag hanterar uppgifter för vår räkning, bara för det som beskrivs här:

| Företag | Till vad |
| --- | --- |
| Supabase | Databas, inloggning och lagring av foton |
| Google (Firebase) | Användningsstatistik; kraschrapporter i apparna för Android, iPhone, iPad och Mac; aviseringar på Android; webbplatsens Google Analytics; inloggning med Google |
| Apple | Aviseringar på iPhone, iPad och Mac; inloggning med Apple |
| Anthropic | Läsning av kvittofoton |
| Sentry | Kraschrapporter i webbläsaren |
| Cloudflare | Drift av webbplatsen blitzsplit.com |
| Google Play och App Store | Distribution och uppdatering av appen |

Vi kan också lämna ut uppgifter när lagen eller ett domstolsbeslut kräver det.

## Överföringar till andra länder {#abroad}

Några av dessa leverantörer lagrar eller behandlar uppgifter utanför Brasilien, främst i USA. Dessa överföringar följer artikel 33 i LGPD, med de avtalsklausuler och skyddsåtgärder som varje leverantör erbjuder.

## Hur länge vi sparar dem {#keep}

- Så länge ditt konto finns sparar vi det som appen behöver för att fungera.
- **Logga ut** raderar enhetens kopia. Med Google eller Apple finns dina data kvar på servern till nästa gång du loggar in.
- **Utan konto** rensar ”Radera profilen och logga ut” enheten, och din återställningskod fortsätter att fungera. För att även radera det som finns på servern kontaktar du oss (avsnitt 12).
- **”Radera konto och data”**, i Profil, raderar på en gång din profil, ditt foto, dina betalningsnycklar och din återställningskod, och återkallar den åtkomst som Apple har gett. Utgifter som du har lagt till i grupper med andra personer finns kvar där för gruppen, utan ditt namn, som ”Tidigare medlem”.
- Användningsdata som är kopplade till en enhet finns kvar i Google Analytics i upp till 14 månader. Därefter återstår bara sammanställda siffror, utan något som identifierar någon. När ditt konto har raderats leder id:t de bär inte längre till dig.
- Kraschrapporter sparas i upp till 90 dagar och raderas sedan.

## Dina rättigheter {#rights}

Enligt LGPD (art. 18) kan du:

- få bekräftat om vi hanterar dina uppgifter och få tillgång till dem;
- rätta ofullständiga, felaktiga eller inaktuella uppgifter;
- begära att onödiga uppgifter anonymiseras, blockeras eller raderas;
- ta med dina uppgifter till en annan tjänst (dataportabilitet);
- få veta vilka vi delar dina uppgifter med;
- återkalla samtycke och invända mot behandling som grundar sig på berättigat intresse;
- klaga till Brasiliens nationella dataskyddsmyndighet (ANPD).

Mycket av detta gör du i själva appen: redigerar din profil, raderar en betalningsnyckel, raderar ditt konto. För resten skriver du till [quare.software@gmail.com](mailto:quare.software@gmail.com). Vi svarar inom 15 dagar.

## Säkerhet {#security}

Uppgifterna överförs krypterade (HTTPS). På servern ser åtkomstregler till att varje person bara kan läsa de grupper hen är med i. Inget system är felfritt, men vi tar varje incident på allvar och meddelar dig och ANPD när lagen kräver det.

Din återställningskod fungerar som ett lösenord: förvara den på ett säkert ställe och dela den inte. På iPhone, iPad och Mac sparar appen den i appen Lösenord.

## Barn {#children}

Blitz Split är inte gjord för barn under 13 år och samlar inte medvetet in deras uppgifter. Om du får kännedom om ett sådant fall, kontakta oss så raderar vi uppgifterna.

## Ändringar av den här policyn {#changes}

När den här policyn ändras uppdaterar vi datumet högst upp. Om ändringen är viktig berättar vi det i appen innan den träder i kraft.

## Kontakt {#contact}

Frågor om den här policyn eller begäranden om dina uppgifter: [quare.software@gmail.com](mailto:quare.software@gmail.com). Det är också kanalen till vårt dataskyddsombud.

Personuppgiftsansvarig: PI Software LTDA (Quartel Enterprise).
