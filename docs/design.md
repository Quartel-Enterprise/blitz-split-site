# Pages and design

## Pages, languages and theme

Plain HTML with no build: `public/site.css` holds the design system's tokens (the web's zinc base and the brand's
blue, light and dark) and every component, `public/boot.js` picks the theme and the language before the first paint,
and `public/site.js` translates the page, in English, Portuguese (Brazil), Spanish, French, German, Italian, Polish,
Dutch, Turkish, Indonesian, Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai, Vietnamese, Traditional Chinese, Swedish, Czech, Romanian, Bengali, Malay, Greek, Hungarian, Filipino, Urdu, Croatian, Serbian, Slovak, Norwegian (Bokmål), Persian, Swahili, Tamil, Telugu, Marathi, Bulgarian, Catalan, Danish, Finnish and Gujarati. The markup is in English; each page carries its other languages' strings in
`window.SITE_STRINGS` ([where they are written](#a-pages-strings)), and the legal pages write each language in full, in blocks marked `data-lang` (every
language above), generated from their Markdown ([legal.md](legal.md)). The language is the first of the browser's languages the site has, English when none,
and the language picker picks another, kept for the next visit, or "System" again, which forgets it and follows the
browser (`boot.js` sets `data-lang-pref` to the language chosen or `system`);
`?lang=en|pt|pt-PT|es|fr|de|it|pl|nl|tr|id|ja|ru|uk|ko|ar|hi|zh|he|th|vi|zh-Hant|sv|cs|ro|bn|ms|el|hu|fil|ur|hr|sr|sk|nb|fa|sw|ta|te|mr|bg|ca|da|fi|gu` and `?theme=light|dark` pin one. Portugal's Portuguese (`pt-PT`) is a variant of `pt`, not a forty-fifth language: only the exact tag `pt-PT` (a browser's
or `?lang=`) picks it, every other `pt-*` stays `pt`. `boot.js` sets `data-lang="pt"` (so the legal pages' blocks, the
CSS and every `pt` word apply) and `data-variant="pt-PT"`, and `window.localized(table)` merges a `"pt-PT"` entry over
`pt` key by key, so each page's `SITE_STRINGS` and each script's dictionary (`TEXT`, `PAPER`, `CURRENCY`) holds only
the words Portugal says differently ("tu", ecrã/telemóvel/partilhar, "estar a", euro amounts; the app is **Blitz Split**).
`npm run check:translations` checks those entries' shape and placeholders but doesn't require them complete. The legal
pages and the release notes are the exception: pt-PT has its own, written in full (`data-lang="pt-PT"` blocks, shown by
`data-variant` in `site.css`, `privacy.pt-PT.md`, `release-notes/pt-PT/` and `/legal/<page>.pt-PT.md`,
`/release-notes/pt-PT.json` for the apps), the legal ones still on Brazil's law as every language's are. Each legal page names the apps' buttons as the app shows them
in its language. Japanese keeps
`line-break: strict`, breaks headings between phrases (`word-break: auto-phrase`) and drops the Latin headings' tight
tracking; Turkish writes the percent sign first (%10). Russian and Ukrainian count in three forms, as Polish does, `one|few|many` in a message with
`|` (21, 31… take `one`, so they always write all three). Korean breaks lines
only between words (`word-break: keep-all`), drops the Latin headings' tracking, counts in one form (no `|`), and never
glues a particle to a name or an amount filled in at run time ("결제: Ana", "Ana 님이"), as the app writes them.
Arabic is Modern Standard Arabic for every `ar` tag and reads right to left: `boot.js` sets `dir="rtl"` on `<html>`
(`RIGHT_TO_LEFT`, kept the same in `boot.js` and `src/index.js`, today `ar`, `he`, `ur` and `fa`), `site.css` writes every side
as start and end (`margin-inline-start`, `inset-inline-end`, `text-align: end`…) so the page mirrors by itself, and
turns what points one way under `:root[dir="rtl"]` (the arrows and the back chevron, the bars that grow, the switch's
knob, the header's scroll line). Like the app, it never says anyone's gender: a label ("الدافع: Ana"), a verbal noun
("تسجيل دفعة") or the passive, the masculine as the generic only where nothing else reads naturally; it writes Latin
digits, «» around names of things, and counts in six forms, `zero|one|two|few|many|other` in a message with `|`.
Its amounts are dollars, as Spanish's, each one a left-to-right isolate (`money.js`, and `\u2066…\u2069` in the
page's own) so a sign and a symbol stay with their number. Its receipt and split card have fresh juice and a soft
drink where the others have beer.
Hindi talks to the visitor as आप, ends sentences with the danda (।), counts in one form except where a noun has a singular
(1 हिस्सा, 2 हिस्से: `one|few|many`, Hindi having no `few`; one person has its own message) and names the app's screens with the app's own words.
Simplified Chinese (`zh`, the page's tag `zh-Hans`) is mainland China's: it talks to the visitor as 你 (never 您), puts
no space between Chinese and a name, a number or a Latin word ("Pedro支付", "4人"), writes full-width punctuation and
“” quotes, counts in one form (no `|`), keeps Japanese's strict line breaking and names the app's screens with the app's
own words (群组, 账单, 分摊, 余额, 结清). A Simplified `zh-*` browser language picks it; a Traditional one picks
Traditional Chinese, below.
Hebrew (`he`) is modern Israeli Hebrew, one variant, and reads right to left as Arabic does (`RIGHT_TO_LEFT`). Like the
app, it never says anyone's gender: buttons and titles are action nouns ("שמירה", "פיצול חשבון"), instructions the
infinitive ("יש לפתוח"), a payer a label ("שולם על ידי: Ana"), the masculine as the generic only where nothing else
reads naturally, and never a slash form. It writes no niqqud, Latin digits and "…" quotes, hyphenates a prefix letter
before a Latin word ("ב-Google"), keeps "›" in menu paths, and counts in three forms, `one|two|other` in a message
with `|`. Its amounts are shekels (₪48.60), each one a left-to-right isolate, as Arabic's.
Thai (`th`) is one variant for every `th` browser language, as Thai apps write it: neutral, with none of the gendered
particles (ครับ, ค่ะ), คุณ only where a sentence needs a "you", no space between words but one between phrases and
around a name, a number or a Latin word ("Pedro จ่าย", "4 คน"), no full stop, “” quotes, one form for counts (no `|`)
and the app's own words (กลุ่ม, บิล, หารบิล, ยอดคงเหลือ, เคลียร์ยอด). The browser breaks its lines between words by its
own dictionary, as Thai has no spaces to break at, and its headings get more room between lines (`site.css`) for the
vowels and tone marks it stacks above and below its letters. Its dates are the platform's Thai format, the Buddhist
era's year included (2569), as the apps write them.
Vietnamese (`vi`) is one variant for every `vi` browser language, as the app writes it: "bạn" for the reader, the
modern tone-mark placement ("hóa", "tùy", not "hoá"), “” quotes, one form for counts (no `|`) and the app's own words
(nhóm, khoản chi, chia khoản chi, số dư, thanh toán, mã khôi phục, and hóa đơn for a receipt). The bundled Geist
subsets leave out the Latin Extended Additional letters Vietnamese writes with (U+1EA0–1EF9: ạ, ả, ụ as much as the
stacked ể, ở, ặ), so it draws in the system font rather than mix two fonts in ordinary words ("mục", "hóa đơn"), and
its headings get a little more room between lines for its stacked marks and dots below (`site.css`).
Traditional Chinese (`zh-Hant`, also the page's tag) is Taiwan's, and a language of its own rather than a variant of
`zh`: hardly a word is written alike, so it has every string, its own legal pages and release notes, and its whole tag
is its code, as the apps ask for its legal pages and notes (`/legal/privacy.zh-Hant.md`, `release-notes/zh-Hant.json`).
A Traditional browser language picks it, as in the apps: by its script when the tag has one (`zh-Hant-CN` is
Traditional, `zh-Hans-TW` Simplified), else by a region that writes it (`zh-TW`, `zh-HK`, `zh-MO`); every other `zh-*`
stays `zh`, and `?lang=` reads the same tags. It is written for Taiwan, not converted from Simplified: 你 for the
reader, Taiwan's words (預設, 帳號, 訊息, 網路, 連結, 檔案, and the app's 群組, 帳單, 分攤, 餘額, 結清, 復原碼, 收據),
「」 quotes, no space between Chinese and a name, a number or a Latin word ("Pedro支付", "4人", "App"), one form for
counts and Simplified's strict line breaking and headings kept whole. Its Han draws in the system font, which the
`zh-Hant` tag points at Taiwan's glyphs, and its quotes' and dots' punctuation font is Taiwan's (`site.css`). The
language picker names the two "中文（简体）" and "中文（繁體）", each in its own script, and marks them 简 and 繁.
Swedish (`sv`, Sweden's), Czech (`cs`) and Romanian (`ro`) are one variant each for every browser language of theirs,
as the apps write them: "du", "ty" and "tu" for the reader, and each one's quotes (”…”, „…“, „…”). Czech counts in
one, few and other forms (1 výdaj, 2 výdaje, 5 výdajů) and never declines a filled-in name, which stands after a colon
or an arrow where Czech would need its case; Romanian counts in one, few and other forms, the other with "de"
(20 de cheltuieli), and writes ș and ț with the comma below, never the cedilla. Each uses the app's own words (grupp,
utgift, saldo; skupina, výdaj, zůstatek; grup, cheltuială, sold). Geist's Latin Extended subset has their letters
(č, ř, ů, ă, ș, ț), so they draw in Geist as Polish does.
Bengali (`bn`), Malay (`ms`), Greek (`el`), Hungarian (`hu`), Filipino (`fil`), Urdu (`ur`), Croatian (`hr`) and Serbian
(`sr`) are one variant each for every browser language of theirs. Bengali, Malay and Urdu talk to the reader
respectfully (আপনি, anda, آپ), the others informally (εσύ, te, ikaw, ti). Every one writes the digits 0-9, so Bengali's and
Urdu's dates are formatted with `-u-nu-latn`. Serbian is written in the Latin script: its code is `sr`, as the apps ask for its
legal pages and notes, and the page's tag `sr-Latn`, so the browser and `Intl` never pick Cyrillic. Filipino's legacy code,
`tl`, picks `fil` (`LEGACY`, kept the same in `boot.js` and `src/index.js`). Urdu reads right to left as Arabic does
(`RIGHT_TO_LEFT`), with each amount a left-to-right isolate. Croatian and Serbian count in one, few and other forms and,
as Czech, never decline a filled-in name; Hungarian never glues a suffix to one, as Turkish and Korean. Bengali, Malay and
Urdu have fresh juice and a soft drink on the receipt and in the split card, where the others have beer, as Arabic does.
Slovak (`sk`) is one variant for every browser language of its own, as the apps write it: "ty" for the reader, „…“
quotes, a past whose gender the app doesn't know written "-l(a)" (Pedro zaplatil(a)), and the app's words (skupina,
výdavok, zostatok, vyrovnať sa, kód na obnovenie). It counts in one, few and other forms (1 výdavok, 2 výdavky, 5
výdavkov), never declines a filled-in name nor glues a suffix to one, and puts a space before the percent sign, as Czech
does. Geist's Latin Extended subset has its letters (ľ, ĺ, ŕ, ô, ä), so it draws in Geist.
Norwegian is Bokmål (`nb`), the code the apps ask for its legal pages and notes: every Norwegian browser language picks
it, Bokmål's own `nb` as much as the macrolanguage's `no` and Nynorsk's `nn` (`LEGACY`, kept the same in `boot.js` and
`src/index.js`, so `?lang=no`, `/legal/<page>.no.md` and `/release-notes/nn.json` answer in Bokmål too), as the apps
pick it. It talks to the reader as "du", quotes with «…», counts in one and other forms as English does, and uses the
app's own words (gruppe, utgift, del en utgift, saldo, gjør opp, gjenopprettingskode, kvittering, poster). Geist's Latin
subsets have its letters (æ, ø, å), so it draws in Geist as Swedish does.
Swahili (`sw`, labelled Kiswahili) is standard Swahili (Kiswahili sanifu), one variant for Kenya and Tanzania alike and
for every `sw` browser language. It talks to the reader informally (wewe), reads left to right and draws in Geist, whose
Latin subset has every letter it writes. As the app, it never glues a prefix or a suffix to a name or an amount filled
in at run time ("Imelipwa na: Pedro", "Kiasi cha {name}"), counts in one and other forms, the noun changing class in
the plural (mtu 1, watu 4), and builds who owes whom on kudaiwa ("unadaiwa", "Wanaodaiwa na wewe"). It has fresh juice
and a soft drink on the receipt and in the split card, as Malay does.

Tamil (`ta`) is one variant for every browser language of its own (India's, Sri Lanka's, Singapore's), in the Tamil
script, as the apps write it: "நீங்கள்" and its respectful forms for the reader, plain everyday Tamil with the English
loanwords Indian apps use (பேலன்ஸ், அக்கவுண்ட், லிங்க்), and the app's words (குழு, செலவு, கணக்கைத் தீர், மீட்புக்
குறியீடு, ரசீது). It writes the digits 0-9, which `Intl`'s `ta` already uses, never Tamil digits. A case ending changes
with the sound of the word it follows, so none is ever glued to a filled-in name or amount: the value stands as the
subject, after a colon or an arrow, or before a noun that carries the ending ("{a} தொகையைப் பிரிக்க"). It counts in one
and other forms, has rupees grouped as India writes them, as Hindi does, and draws in the system's font, its titles
with the room between their lines that Hindi's and Bengali's get.

Telugu (`te`) is one variant for every `te` tag, in the Telugu script, as the apps write it: "మీరు" and its respectful
forms for the reader, the respectful "-ండి" on every button and instruction, plain everyday Telugu with the English
loanwords Indian apps use (బ్యాలెన్స్, అకౌంట్, లింక్), and the app's words (గ్రూప్, ఖర్చు, లెక్క సెటిల్ చేయండి, రికవరీ
కోడ్, రసీదు). It writes the digits 0-9, which `Intl`'s `te` already uses, never Telugu digits. As in Tamil, no case
ending is ever glued to a filled-in name or amount: the value stands as the subject, after a colon or an arrow, or
before a noun that carries the ending ("{a} మొత్తాన్ని పంచడానికి"). It counts in one and other forms, has rupees grouped
as India writes them, as Hindi and Tamil do, and draws in the system's font, its titles with the room between their
lines that Hindi's, Bengali's and Tamil's get.

Marathi (`mr`) is one variant for every `mr` tag, in Devanagari, as the apps write it: "तुम्ही" and its plural verb
forms for the reader, the respectful "-आ" imperative on every button and instruction ("सेव्ह करा", "निवडा"), plain
everyday Marathi with the English loanwords Indian apps use (बॅलन्स, अकाउंट, लिंक), the app's words (ग्रुप, खर्च, हिशोब
पूर्ण करा, रिकव्हरी कोड, पावती), and sentences that end in ".", never Hindi's danda. It writes the digits 0-9, never
Devanagari digits, which `Intl`'s `mr` would pick: its dates and the phone's clock are formatted with `mr-u-nu-latn`, as
Bengali's are with `bn-u-nu-latn`, and the split card reads Devanagari digits typed on a Marathi keyboard as the Latin
ones (`latinDigits` in `money.js`). No case ending is ever glued to a filled-in value, not even written apart: a name
takes the respectful pronoun written apart ("{name} यांनी पैसे दिले"), and any other value stands after a colon or before
a noun that carries the ending ("{n} जणांमध्ये वाटले: {a}."). It counts in one and other forms, has rupees grouped as
India writes them, as Hindi does, and draws in the system's font, with Hindi's Devanagari rules: no Geist tracking, and
the room between its titles' lines that Hindi's gets.

Persian (`fa`) is Iran's, one variant for every `fa` tag, as the apps write it: the respectful «شما», Persian's own ی
and ک (never the Arabic letters), the zero-width non-joiner where Persian joins a prefix or a suffix (می‌, ‌ها), «»
quotes, and no suffix glued to a filled-in name, which stands as the subject or after a colon ("Pedro پرداخت کرد",
"مبلغ: Ana"). It reads right to left as Arabic and Urdu do (`RIGHT_TO_LEFT`), in the system font, and writes the digits
0-9 and Gregorian dates, never its own digits nor the Solar Hijri calendar, which `Intl` would pick for `fa`: its dates are
formatted with `fa-u-nu-latn-ca-gregory`, and the receipt is dated year first, as Iran writes a date. It has fresh juice
and a soft drink where the others have beer, as Arabic does.

Bulgarian (`bg`) is written in Cyrillic, as the apps write it: "ти" for the reader, „…“ quotes, a past in the aorist,
which has no gender (Pedro плати), so the site never guesses the gender of someone it doesn't know, and the app's words
(група, разход, баланс, уреди сметките, код за възстановяване). It counts in one and other forms, with the count form
of a masculine noun after a number (1 разход, 2 разхода), never glues the definite article or any other suffix to a
filled-in name, and writes the percent sign right after the number (10%), as `Intl` does. Bulgaria has used the euro
since 1 January 2026, so its demo is in euros (1 200 €). Geist has no Cyrillic, so it draws in the system's font.
Catalan (`ca`) is central standard Catalan, one variant for every `ca` tag (Valencian's `ca-ES-valencia` too), as the
apps write it: "tu" for the reader, «…» quotes, the typographic apostrophe (l’app, d’una) and the punt volat of l·l, and
the app's words (grup, despesa, saldo, liquidar comptes, codi de recuperació, tiquet). It never contracts "l’" or "d’"
before a filled-in name, which stands after a noun or as the subject ("Pedro ha pagat", "Import: {name}"), avoids a
gendered word for someone it doesn't know, counts in one and other forms as English does, and puts a space before the
percent sign (10 %), as `Intl` does. Its demo is in euros, written 1.200 €, and the App Store link lets Apple open the
visitor's own storefront, Catalan having no country of its own there. Geist's Latin subset has its letters (à, ç, ï, ·), so it draws in
Geist.
Danish (`da`) has one variant for every `da` tag, so it needs no `LEGACY` entry. It talks to the reader as "du", quotes
with »…«, counts in one and other forms, and uses the app's own words (gruppe, udgift, del en udgift, saldo, gøre op,
gendannelseskode, kvittering, poster); it draws in Geist too.
Finnish (`fi`) has one variant for every `fi` tag, so it needs no `LEGACY` entry either. It talks to the reader as "sinä",
quotes with ”…”, counts in one and other forms, and uses the app's own words (ryhmä, kulu, jaa kulu, saldo, tasata,
palautuskoodi, kuitti, tuotteet). Finnish inflects nouns, so "Blitz Split" and every value a script fills in (a name,
an amount, an item) never take a case ending: they stand as the subject, after a colon ("Summa: {name}"), or after a
noun that carries the case ("henkilölle {name}", "App Store -kaupasta"). Its demo is in euros, written 1 200 € with
non-breaking spaces, and the percent sign follows a space (10 %), as `Intl` does; it draws in Geist too.
Gujarati (`gu`) is one variant for every `gu` tag, in the Gujarati script, as the apps write it: "તમે" and its plural
verb forms for the reader, plain everyday Gujarati with the English loanwords Indian apps use (ગ્રુપ, બેલેન્સ, એકાઉન્ટ,
લિંક, ઍપ), the app's words (ખર્ચ, ખર્ચ વહેંચો, હિસાબ પતાવો, રિકવરી કોડ, રસીદ, આઇટમ્સ), and sentences that end in ".",
never Hindi's danda. It writes the digits 0-9, never Gujarati digits: its dates and the phone's clock are formatted with
`gu-u-nu-latn`, as Marathi's are, and the split card reads Gujarati digits typed on a Gujarati keyboard as the Latin ones
(`latinDigits` in `money.js`). No case ending is ever glued to a filled-in value: a name takes its postposition written
apart ("{who} એ તમને ચૂકવ્યા") or stands after a colon, as the app's "ચૂકવનાર: {name}", and any other value stands after
a colon ("{n} લોકોમાં વહેંચાયા: {a}."). A noun after a number stays singular, so it counts in one and other forms
without a "|"; it has rupees grouped as India writes them, as Hindi does, and draws in the system's font, with
Devanagari's rules: no Geist tracking, and the room between its titles' lines that Hindi's gets.

The landing's amounts are in the visitor's own currency, written as their language writes it (`public/money.js`, which
the phone, the split card and the receipt share): dollars in English and Spanish, reais in Brazil's Portuguese, euros
in Portugal's Portuguese, French, German, Italian and Dutch, złoty, lira, rubles, hryvnias, rupees in Hindi, Tamil, Telugu, Marathi and Gujarati, grouped
as India writes them (₹1,20,000), yuan in Simplified Chinese (¥, with its fen, so the demo's numbers stay as they are:
¥48.60, ¥1,200), shekels in Hebrew (₪, with its agorot, the same numbers), baht in Thai (฿, with its satang, the same numbers: ฿48.60, ฿1,200), and the rupiah, the yen, the won, the dong (in Vietnamese, after the number as Vietnamese writes it: 1.200.000 ₫) and the New Taiwan dollar in Traditional Chinese (NT$), which have no cents in use. The krona in Swedish, the krone in Norwegian and in Danish, the koruna in Czech, the leu in Romanian, the ringgit in Malay and the Philippine peso in Filipino keep their cents but are
worth much less than the dollar, so the demo's own amounts are multiplied by a whole number before anything is split
(`money.cents`: ten for the Swedish krona and the Norwegian krone, the krone being worth about the krona, seven for the Danish krone, worth about two thirds of them, then 23, five, four, 50 and 130, so 486 kr, 340,20 kr., 1 117,80 Kč, 243 lei, RM194.40, ₱2,430 and Ksh 6,318 for the ride), and from there everything works in
that currency's own cents: every split adds up exactly and an amount typed in the split card stays as typed. Greek, Croatian, Slovak, Bulgarian, Catalan and Finnish are in euros. Swahili is in Kenyan shillings for every `sw` visitor, Tanzania's too (the apps also have the Tanzanian shilling, which has no cents in use). The demo keeps every amount in cents and the ten with no cents in use (the five below, and the taka in Bengali and the Pakistani rupee in Urdu, grouped as India's, the forint in Hungarian and the dinar in Serbian, a cent being one of each, and the Iranian rial in Persian, a cent being a thousand rials, so Persian's trip costs a tenth of the others' at a plausible million rials to the dollar and its amounts still fit a 320px phone, written ریال 4,860,000 for the ride (the phone's balance also shrinks with a narrow screen, `site.css`), the symbol first as `Intl` writes it, which reads after the number in the right-to-left line) show it scaled to whole
units (a cent is Rp100, ¥1, ₩10, 10 ₫ and NT$1, the smallest whole scale, which keeps every split exact), so a $48.60 ride reads Rp486.000, ¥4,860, ₩48,600, 48.600 ₫ or NT$4,860 and every split still adds
up exactly; an amount typed in the split card rounds to the nearest ₩10, 10 ₫, Rp100 or a thousand rials, and a field grows with what it
holds. The page's own amounts in `SITE_STRINGS` (`public/strings/index/`) and each receipt in `scan.js` are written the same way, by hand, so the
first paint shows them before any script runs.

The language picker is the apps' Profile › Language: the header's translate button (with the code of the language
shown: `EN`, `BR` and `PT` for the two Portuguese, `UA` for Ukrainian, `简` and `繁` for the two Chinese) and the
footer's button (the language's own name) open it. A wider window shows it as a dialog of a fixed height; a phone,
upright or lying down (narrower than 600px or lower than 500px), as a screen of its own with a back arrow. It lists
"System" first, the default, then every language in its own name, over the same name in the page's language (the
browser's `Intl.DisplayNames`, hidden when both read the same), with its code in a chip and a radio. The search
finds a row by any of those names, its English one or its code, folding accents ("cestina" finds "Čeština"). Its
rows are plain links in each page's markup (`?lang=…`, "System" without it), so crawlers find every language's page;
`site.js` adds the chips and the translated names. Picking one needs scripts, as showing a language does: `boot.js`
picks it and `site.js` translates the page, so without them every page is in English and there is nothing to switch.
Its words (the search, "System", Back, Close…) are `PICKER_TEXT` in `site.js`, not a `data-i18n` key in each page's
`SITE_STRINGS`: the picker is on every page, so one dictionary keeps them, which `check:translations` checks as it
checks `stores.js`'s.

The theme is Light, Dark or System (the default), from the header's theme menu or the footer, kept for the next visit.
`boot.js` always sets `data-theme` to `light` or `dark`, resolving System to the system's theme and following it when it
changes, so `site.css` writes the dark tokens once, under `[data-theme="dark"]`; without scripts the page is light.
Every script reads the language from the `data-lang` `boot.js` set, so `SUPPORTED` in `boot.js` is the one list the
site picks a language from; each script's strings and formats still carry a key per language.

The fonts, Geist and Geist Mono, are the site's own files (`public/fonts/`, the Latin and Latin Extended subsets Google
Fonts serves, declared at the top of `public/site.css`), so the first paint waits on no other site; each page preloads
`geist-latin.woff2`. Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai, Vietnamese, Traditional Chinese, Bengali, Greek, Urdu, Persian, Tamil, Telugu, Marathi, Gujarati and Bulgarian fall back to the system's font, since neither subset has their
scripts (or, for Vietnamese, its Latin Extended Additional letters).

### A page's strings

`site.js` reads a page's words in the language `boot.js` picked from `window.SITE_STRINGS`, keyed by language, each
language keyed by the page's `data-i18n` keys. A page sets it one of two ways:

- **One file per language**, on the landing and the support page, whose words would otherwise be nine tenths of the
  HTML every visitor downloads (43 languages of the landing were 418 KB of its 459 KB): `public/strings/index/<language>.js`
  and `public/strings/support/<language>.js`, written by hand, each adding its own language
  (`(window.SITE_STRINGS = window.SITE_STRINGS || {})["pt"] = { … }`). The page's `boot.js` names the folder,
  `<script src="/boot.js" data-strings="index">`, and `boot.js` writes the picked language's `<script>` into `<head>`
  with `document.write`, then the variant's (`pt-PT.js`, only the words it says differently) when it picked one. The
  parser waits for a script written that way, so the words are there before the page is drawn and nobody sees it in
  English first; an English visitor fetches none. Every language of `SUPPORTED` but English and every variant of
  `VARIANTS` needs its file in each folder, even with no word of its own: the site answers a file that isn't there
  with the landing's HTML (`not_found_handling` in `wrangler.jsonc`), which `npm run check:translations` keeps from
  happening.
- **Inline**, in a `<script>` before `site.js`, on the legal pages and the release notes, where the strings are only
  the header's and the footer's, small beside the text those pages write in every language.

## Motion

The landing moves (`public/site.css`, "Motion"): the hero comes in on load, word block by word block, then the phone
and its two cards; the words and the phone only move into place, never fade in (the first screen is there from the
first paint, which Largest Contentful Paint and Speed Index time), and only the two small cards pop in; the sections rise as they scroll into
view, those that come in together one after another (`public/site.js`), and each card's picture plays once it is in (the bars fill, the chips and rows come one by one);
the cards lift on hover with a light that follows the pointer, and the header's line fills as the page scrolls. It all
hangs on `.motion`, which `public/boot.js` puts on `<html>` before the first paint unless the visitor asked for reduced
motion (then everything just shows, still) or a theme is pinned with `?theme=`, so the design board's captures show
every section.

## The landing's phone

The landing's phone is a working preview (`public/preview.js`): its tabs switch, "Split a bill" adds a bill, and a
bill, a payment, a person or a category opens its sheet, every change moving the balances and the offline queue. Its
people's photos in `public/people/` are faces of people who don't exist, generated by a StyleGAN model
(thispersondoesnotexist.com), cropped to 96 px WebP (the largest one drawn is 40 px).

The "Split it the way it really was" card works as the app's split editor (`public/split-modes.js`, after
`feature/split_bill` in blitz-split-client): each chip opens that way's editor on the same bill, a $132 pizza night
Pedro paid, among the phone's four people. Equally has a box each and "Check all"; Amounts a field each, adding up to the
total; Percentages a whole number each, adding up to 100; Shares a stepper each; By income each one's income per month,
turned into whole percentages as the app's group "Default split" does it (the app has no bill in this way: a bill in a
group split by income opens in percentages); Items three items, each split among who had it (tap the faces), plus 10% of
service by what each one had. Above the people, the status the app shows ("$33 each", "$10 left", "Adds up", "Nobody is
in yet") in its tone, and behind each one a light as wide as their part. The cents work as the app's: each part rounded
down, the cents left to whoever paid. What is typed in a way stays while switching.

The "Scan the receipt" card shows a receipt being read (`public/scan.js`): a photo of a made-up bar's receipt in a
camera's corners, a line sweeping down it, each printed line lighting up as it passes and its item coming into the list
below, then the faces of who had it. It plays once the card is in view and again on "Scan again". "Split these items"
opens that receipt in the split card, in Items, with the faces it marked. The paper fills the height the split card
gives the row, whatever way is open there.

## Design board

`design/board.html` (not deployed) shows each page at the phone, tablet, laptop and desktop sizes it must hold, light
and dark side by side: run `npm run dev` and open the file in a browser. `design/<page>-sizes.png` show each page's
first screen at every size, light over dark; the full captures, in each language, go to `design/screenshots/`, which
git ignores.

## Legal pages

The legal pages' text is written in Markdown, `public/legal/<page>.<language>.md`, which `npm run build:legal` writes
into the pages and the apps draw natively: [legal.md](legal.md). What is still to fill in (the company, its CNPJ, the
contact emails, retention periods) is marked `<mark>` there, `<span class="todo">` on the page, which shows in amber:
none may be left before they go live.

## Release notes

"What's new" (`/release-notes`) keeps the legal pages' header and hero, with "Show beta versions" under its title, and
lists each version as a card: [release-notes.md](release-notes.md). The design board opens it with `?beta=on`, so the
cards show while every version is still a beta.

## Support and the footer's contact

Support (`/support`, `public/support.html`, written by hand as the landing is) is the page the stores' Support URL
points at, which must show a way to reach the developer: the legal pages' header and hero (with `.hero-lead` and
`.page-body`, which it shares with the release notes), then the address to write to as a `mailto:` button, a line
asking for the device and the app's version, and links to "What's new", the privacy policy and the terms. It promises
nothing the rest of the site doesn't: no response time, no phone.

The address is appborarachar@gmail.com, the one the privacy policy and the terms publish (`public/legal/*.md`):
change it there, on Support, in the footers and in `public/llms.txt` together. `npm run check:translations` fails, as
CI does, when one of them has another address ([ci.md](ci.md#translations)).

Every page's footer links Support among its links and shows the address under the tagline, as a `mailto:` link. The
footer is written in each page, since the site has no build: `public/index.html`, `public/privacy.html`,
`public/terms.html`, `public/support.html` and the release notes' shell, `pages/release-notes.html`. Change all five
the same way, each with its own `SITE_STRINGS` (the landing's and the support page's in `public/strings/`, the
others' inline: [a page's strings](#a-pages-strings)).

The copyright line's year is the current one: each footer marks it (`<span data-year>2026</span>`) and `site.js`
fills it when the page loads, so it moves on by itself when the year turns. The year in the markup is what shows
without scripts and the least it ever shows, so a device whose clock is behind never reads an earlier one.
