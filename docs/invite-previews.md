# Invite link previews

WhatsApp, iMessage, Telegram and the rest draw a link's preview from the page's meta tags. `src/index.js` runs only for
`/g/*`, `/og/*` and `/.well-known/*` (`run_worker_first` in `wrangler.jsonc`, the last only to answer a file the site
doesn't have with a 404, see [routes](routes.md)); every other path is a static file. For `/g/<code>` it serves the
landing with that invite's title, description and image:

| Link | Title | Image |
| --- | --- | --- |
| The group's, `/g/<code>` | "Join <group>" and how many people split there | The group's photo, or its initials on its color, its name, type, people and up to five of their faces: each person's photo, or their initials on their color |
| A member's personal one, `/g/<code>/<member>?from=<inviter>` | "Join <group> as <member>" and who saved them the spot | The member's initial, the group's name and "You join as <member>", on the member's color |
| A code nobody has (a changed link, a used personal link, a typo) | "Invite to a group on Blitz Split" | `/og/blitzsplit.png`, the brand's card, as the landing's |

What a preview says and its card come from the API's
[`invite-preview`](https://github.com/Quartel-Enterprise/blitz-split-api/tree/main/supabase/functions/invite-preview)
edge function, `INVITE_PREVIEW_URL` in `wrangler.jsonc`: it reads `get_invite`, picks the language by the group's
currency (BRL Portuguese, the Spanish speaking countries' Spanish, any other English) and draws the 1200 × 630 card
with satori. Drawing takes 40 to 75 ms of CPU, past the 10 ms the Workers Free plan allows a request, so the
function draws and this Worker only asks it and keeps each answer in Cloudflare's cache: the words for five minutes,
an image for a day. The image's address carries the function's `imageVersion` (`?v=`), which changes with whatever
the card shows, since WhatsApp keeps an image by its address. Should the function fail, the page keeps the landing's
own meta tags and an image answers the brand's card. The function loads the group's and the people's photos itself
before drawing (Storage, or a Google account's picture), and a photo that doesn't load shows the initials; the
Worker never fetches a photo.

`public/og/blitzsplit.png`, the brand's card, is a static file the function's `brand_card.ts` draws with the same
layout: run it there after changing the layout or the brand, and copy the file here.

When the 302 of the app links to the web app comes back ([blitz-split-site#12](https://github.com/Quartel-Enterprise/blitz-split-site/pull/12), paused by
[blitz-split-site#13](https://github.com/Quartel-Enterprise/blitz-split-site/pull/13)), `/g/*` must still answer crawlers with
this page, or the previews go back to the landing's.
