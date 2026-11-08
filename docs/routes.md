# Routes

What [blitzsplit.com](https://blitzsplit.com) answers. The site is a Cloudflare Worker with static assets (`public/`)
and one script, `src/index.js`, which serves the [invite links' previews](invite-previews.md).

| Path | What it answers |
| --- | --- |
| `/` | The landing (Bora Rachar in Portuguese, Blitz Split in English, Spanish, French, German, Italian and Polish) |
| `/privacy` | The privacy policy, the address the apps' Profile › "Privacy policy" opens (`/privacidade`, which older app versions open, redirects to it) |
| `/terms` | The terms of use, the address the apps' Profile › "Terms of use" opens (`/termos`, which older app versions open, redirects to it) |
| `/g/<code>`, `/g/<code>/<member>` | The landing, plus a note to open the group invite (or a member's personal invite) on a phone with the app installed, with the invite's meta tags for its link preview |
| `/og/g/<code>.png`, `/og/g/<code>/<member>.png` | The image of that link preview; `/og/blitzsplit.png` is the brand's, the landing's and a dead invite's |
| `/b/<bill>?comentario=<comment>` | The same page; on a phone or a Mac with the app installed, the app opens the comment instead |
| `/download`, `/app-download` | The store of the visitor's platform, or the landing's buttons while that store doesn't offer the app. `/app-download` is the link of "Get the app" in the web and the Mac app; which stores list the app is `CONFIG` in `stores.js`, in step with the client's `stores.properties` |
| `/download/android`, `/download/ios` | That store, whatever the platform, or the landing's buttons while it doesn't offer the app |
| `/.well-known/assetlinks.json` | Android App Links of `com.quare.blitzsplit` |
| `/.well-known/apple-app-site-association` | Apple Universal Links and shared web credentials (the recovery code in the Passwords app) of `TTV2A365LG.com.quare.blitzsplit` |

Every path is in English, whatever the page's language. Any other path answers with the landing (`not_found_handling: single-page-application`). `public/_headers`
serves both `.well-known` files as `application/json`, which Android and Apple require, with a 200 and no redirect.

The `.well-known` files are copies of `webApp/public/.well-known` in
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client): change both together.
