# Link previews

WhatsApp, iMessage, Telegram and the rest draw a link's preview from the page's meta tags. `src/index.js` runs only for
`/g/*`, `/c/*`, `/u/*`, `/b/*`, `/download`, `/download/*`, `/app-download`, `/og/*`, `/.well-known/*` and `/legal/*` (`run_worker_first` in
`wrangler.jsonc`, the last two only to answer a file the site doesn't have with a 404, see [routes](routes.md)); every
other path is a static file. Every link the apps share has a preview of its own: the Worker serves the landing with
that link's title, description and image.

| Link | Title | Image |
| --- | --- | --- |
| The group's, `/g/<code>` | "Join <group>" and how many people split there | The group's photo, or its initials on its color, its name, type, people and up to five of their faces: each person's photo, or their initials on their color |
| A member's personal one, `/g/<code>/<member>?from=<inviter>` | "Join <group> as <member>" and who saved them the spot | The member's initial, the group's name and "You join as <member>", on the member's color |
| A bill's, `/c/<code>` (also with `?comentario=`), which "Anyone with the link" opens | "<bill> · <amount>", who paid, among how many it is split and the group | The category's icon, the bill's name, its amount and "<payer> paid · split among <n>", on the group's color |
| A bill's which "Only people in the bill" open | "A bill on Blitz Split" | A lock and "Only people in the bill can open it": nothing of the bill, as its page shows nothing to whoever isn't signed in |
| A profile's, `/u/<code>` | The person's name | Their photo, or their initials on their color, their name and "Split bills with <name>" |
| A comment's, `/b/<bill>?comentario=<comment>` | "Comment on a bill · Blitz Split" | `/og/comment.png`, a card that is the same for every bill: the link opens only for the people of its group, so the preview shows nothing of the bill |
| `/download`, `/download/android`, `/download/ios`, `/app-download` | "Get Blitz Split" | `/og/download.png`, the same card for every address |
| `/privacy`, `/terms` | The page's own title | `/og/privacy.png`, `/og/terms.png`, named in the page's own tags, in English |
| A code nobody has (a changed link, a used personal link, a bill's link turned off, a typo) | "Invite to a group on Blitz Split" for an invite, the brand's name otherwise | `/og/blitzsplit.png`, the brand's card, as the landing's |

An invite and a bill speak the language of their currency. A profile, which has none, a comment's link and the
download paths speak the language their link asks for, `?lang=`: the apps add their own language to those links when
they share them, and the pages read the same parameter (`boot.js`), so the page that opens speaks it too. Twelve of
the apps' thirty-five languages are written (English, Portuguese, Spanish, French, German, Italian, Polish, Dutch,
Turkish, Indonesian and Japanese); Russian, Ukrainian, Korean, Hindi, Simplified Chinese, Hebrew, Thai, Vietnamese, Traditional Chinese, Swedish, Czech, Romanian, Bengali, Malay, Greek, Hungarian, Filipino, Urdu, Croatian, Serbian, Slovak, Norwegian (Bokmål) and Tamil, which the site speaks, read English here until the API's
function has their words, as does any other language, or none. The twelfth, Arabic, came with blitz-split-api#83 (a group in
riyals, dirhams or Egyptian pounds), and the Worker sets the preview page's `<html>` to the words' `language`, with
`dir="rtl"` for a right-to-left one (`directionOf` in `src/index.js`, which already counts Hebrew, `he`, and Urdu, `ur`,
for when the API has their words), so a crawler reads it as written.
`pt-PT` (Portugal's Portuguese, a variant of `pt`: [design.md](design.md)) is the one tag with a region the Worker passes on, as the
apps and the page write it; the API reads any other `pt-*` as Portuguese, and, until it has Portugal's wording, pt-PT too.

What a preview says and its card come from the API's
[`invite-preview`](https://github.com/Quartel-Enterprise/blitz-split-api/tree/main/supabase/functions/invite-preview)
edge function, `INVITE_PREVIEW_URL` in `wrangler.jsonc`, asked with `link` (`invite`, `bill` or `profile`) and the
link's code: it reads `get_invite`, `get_shared_bill` or `get_profile_by_share_code`, picks the language by the group's or the bill's
currency (BRL Portuguese, the Spanish speaking countries' Spanish, PLN Polish, TRY Turkish, IDR Indonesian, JPY
Japanese, any other English) and draws the 1200 × 630 card with satori. Drawing takes 40 to 75 ms of CPU, past the
10 ms the Workers Free plan allows a request, so the function draws and this Worker only asks it and keeps each
answer in Cloudflare's cache: the words for five minutes, an image for a day. A link-preview crawler waits up to 5 s for the page's
words (`CRAWLER_WAIT_MS`): the function's first answer after a quiet while, a cold start, took 3.2 s, and WhatsApp keeps
whatever preview it got first for a link's address, so giving up early leaves the brand's preview on that link. A
browser never waits: it gets the words already kept, or the landing's own tags, since a person sees the landing
whatever they say (`isCrawler` tells them apart by the User-Agent; anything that isn't plainly a browser counts as a
crawler). Either way the function is asked to the end in the background, cut only at 20 s, and its answer kept, so a
slower cold start still serves the link's next fetch. The image's address carries the
function's `imageVersion` (`?v=`), which changes with whatever the card shows, since WhatsApp keeps an image by its address. Should the function fail, or answer a kind the link can't have (one
deployed before it knew `link` reads a bill's code as an invite's), the page keeps the landing's
own meta tags and an image answers the brand's card. The function loads the group's and the people's photos itself
before drawing (Storage, or a Google account's picture), and a photo that doesn't load shows the initials; the
Worker never fetches a photo. Such a card keeps the address a good one would have, so the function answers it with
`max-age=60` and the Worker keeps an image only as long as the function's `Cache-Control` says, up to a day: the
next ask a minute later tries the photo again. A new photo changes `?v=` by itself, since the apps store each one
with `?v=<updated_at>` in its URL and a Google picture's URL changes with it.

`public/og/blitzsplit.png`, the brand's card, is the one image the site keeps as a file, since it is what a preview
shows when the function fails: the function's `brand_card.ts` draws it with the same layout, so run it there after
changing the layout or the brand, and copy the file here. Every other card, the ones that are the same for every
address too (`/og/comment.png`, `/og/download.png`, `/og/privacy.png`, `/og/terms.png`), is drawn by the function on
demand, in the language asked, as are their words: the Worker holds none.

When the 302 of the app links to the web app comes back ([blitz-split-site#12](https://github.com/Quartel-Enterprise/blitz-split-site/pull/12), paused by
[blitz-split-site#13](https://github.com/Quartel-Enterprise/blitz-split-site/pull/13)), `/g/*`, `/c/*`, `/u/*` and `/b/*` must still answer crawlers with
this page, or the previews go back to the landing's.
