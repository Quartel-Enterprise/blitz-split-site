# Pages and design

## Pages, languages and theme

Plain HTML with no build: `public/site.css` holds the design system's tokens (the web's zinc base and the brand's
blue, light and dark) and every component, `public/boot.js` picks the theme and the language before the first paint,
and `public/site.js` translates the page, in English, Portuguese (Brazil), Spanish, French, German, Italian, Polish,
Dutch, Turkish, Indonesian, Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai and Vietnamese. The markup is in English; each page carries its other languages' strings in
`window.SITE_STRINGS`, and the legal pages write each language in full, in blocks marked `data-lang` (every
language above), generated from their Markdown ([legal.md](legal.md)). The language is the first of the browser's languages the site has, English when none,
and the header's translate-icon menu (as Bible Planner's) or the footer's switch picks another, kept for the next visit;
`?lang=en|pt|pt-PT|es|fr|de|it|pl|nl|tr|id|ja|ru|uk|ko|ar|hi|zh|he|th|vi` and `?theme=light|dark` pin one. Portugal's Portuguese (`pt-PT`) is a variant of `pt`, not a twenty-first language: only the exact tag `pt-PT` (a browser's
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
(`RIGHT_TO_LEFT`, kept the same in `boot.js` and `src/index.js`, today `ar` and `he`), `site.css` writes every side
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
own words (群组, 账单, 分摊, 余额, 结清). A Simplified `zh-*` browser language picks it; a Traditional one (`zh-Hant`,
`zh-TW`, `zh-HK`, `zh-MO`) doesn't, as in the apps, and the next browser language does, English for none, until the
site has Traditional Chinese, which will sit beside it as `zh-Hant`, as pt-PT does beside pt.
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

The landing's amounts are in the visitor's own currency, written as their language writes it (`public/money.js`, which
the phone, the split card and the receipt share): dollars in English and Spanish, reais in Brazil's Portuguese, euros
in Portugal's Portuguese, French, German, Italian and Dutch, złoty, lira, rubles, hryvnias, rupees in Hindi, grouped
as India writes them (₹1,20,000), yuan in Simplified Chinese (¥, with its fen, so the demo's numbers stay as they are:
¥48.60, ¥1,200), shekels in Hebrew (₪, with its agorot, the same numbers), baht in Thai (฿, with its satang, the same numbers: ฿48.60, ฿1,200), and the rupiah, the yen, the won and the dong (in Vietnamese, after the number as Vietnamese writes it: 1.200.000 ₫), which have no cents in use. The demo keeps every amount in cents and those four show it scaled to whole
units (a cent is Rp100, ¥1, ₩10 and 10 ₫), so a $48.60 ride reads Rp486.000, ¥4,860, ₩48,600 or 48.600 ₫ and every split still adds
up exactly; an amount typed in the split card rounds to the nearest ₩10, 10 ₫ or Rp100, and a field grows with what it
holds. The page's own amounts in `SITE_STRINGS` and each receipt in `scan.js` are written the same way, by hand, so the
first paint shows them before any script runs.

The theme is Light, Dark or System (the default), from the header's theme menu or the footer, kept for the next visit.
`boot.js` always sets `data-theme` to `light` or `dark`, resolving System to the system's theme and following it when it
changes, so `site.css` writes the dark tokens once, under `[data-theme="dark"]`; without scripts the page is light.
Every script reads the language from the `data-lang` `boot.js` set, so `SUPPORTED` in `boot.js` is the one list the
site picks a language from; each script's strings and formats still carry a key per language.

The fonts, Geist and Geist Mono, are the site's own files (`public/fonts/`, the Latin and Latin Extended subsets Google
Fonts serves, declared at the top of `public/site.css`), so the first paint waits on no other site; each page preloads
`geist-latin.woff2`. Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai and Vietnamese fall back to the system's font, since neither subset has their
scripts (or, for Vietnamese, its Latin Extended Additional letters).

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
