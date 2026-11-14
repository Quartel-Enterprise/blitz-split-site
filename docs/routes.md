# Routes

What [blitzsplit.com](https://blitzsplit.com) answers. The site is a Cloudflare Worker with static assets (`public/`)
and one script, `src/index.js`, which serves the [links' previews](invite-previews.md).

| Path | What it answers |
| --- | --- |
| `/` | The landing (Bora Rachar in Portuguese, Blitz Split in English, Spanish, French, German, Italian, Polish, Dutch, Turkish, Indonesian and Japanese) |
| `/privacy` | The privacy policy, the address the apps' Profile › "Privacy policy" opens (`/privacidade`, which older app versions open, redirects to it) |
| `/terms` | The terms of use, the address the apps' Profile › "Terms of use" opens (`/termos`, which older app versions open, redirects to it) |
| `/legal/<page>.<language>.md` | The Markdown of a legal page (`privacy`, `terms`) in one language, which the apps draw natively and the pages above are generated from ([legal.md](legal.md)); a 404 for a language the legal pages don't have, and the app reads English |
| `/g/<code>`, `/g/<code>/<member>` | The landing, plus a note to open the group invite (or a member's personal invite) on a phone with the app installed, with the invite's meta tags for its link preview |
| `/og/g/<code>.png`, `/og/g/<code>/<member>.png`, `/og/c/<code>.png`, `/og/u/<code>.png` | The image of that link's preview; `/og/blitzsplit.png` is the brand's, the landing's and a dead link's, and `/og/comment.png`, `/og/download.png`, `/og/privacy.png` and `/og/terms.png` the cards of a comment's link, the download paths and the legal pages, which the function draws too, in the language of `?lang=` |
| `/u/<code>` | A profile's link (the apps' Profile › "Share profile"): the landing with the person's name as its title and a card of their photo and name for its link preview; an unknown code, or the API failing, keeps the brand's. On a phone or a Mac with the app installed, the app opens the profile instead |
| `/c/<code>` | A bill's link (the apps' "Share bill"): the landing with the bill's meta tags for its link preview, or a locked card's for a link only the people in the bill open. On a phone or a Mac with the app installed, the app opens the bill's page instead |
| `/b/<bill>?comentario=<comment>` | The same page, with a preview that is the same for every bill ("Comment on a bill"), in the language of `?lang=`; on a phone or a Mac with the app installed, the app opens the comment instead |
| `/download`, `/app-download` | The store of the visitor's platform, or the landing's buttons while that store doesn't offer the app. `/app-download` is the link of "Get the app" in the web and the Mac app; which stores list the app is `CONFIG` in `stores.js`, in step with the client's `stores.properties`. Their link preview is the same for every address, "Get Blitz Split", in the language of `?lang=` |
| `/download/android`, `/download/ios` | That store, whatever the platform, or the landing's buttons while it doesn't offer the app |
| `/robots.txt` | Every crawler may read every page |
| `/llms.txt` | What the site is and its pages, in Markdown, for language models ([llmstxt.org](https://llmstxt.org)) |
| `/.well-known/assetlinks.json` | Android App Links of `com.quare.blitzsplit` |
| `/.well-known/apple-app-site-association` | Apple Universal Links and shared web credentials (the recovery code in the Passwords app) of `TTV2A365LG.com.quare.blitzsplit` |

Every path is in English, whatever the page's language. Any other path answers with the landing (`not_found_handling: single-page-application`), except under `/.well-known/` and `/legal/`, where `src/index.js` answers
a file the site doesn't have with a 404, so a crawler or an app that looks for one doesn't get the landing's HTML. `public/_headers`
serves both `.well-known` files as `application/json`, which Android and Apple require, with a 200 and no redirect.

The `.well-known` files are copies of `webApp/public/.well-known` in
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client): change both together.
