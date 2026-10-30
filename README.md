# Blitz Split site

What [blitzsplit.com](https://blitzsplit.com) serves: a Cloudflare Worker with static assets only, no script.

| Path | What it answers |
| --- | --- |
| `/` | A provisional page (Bora Rachar in Portuguese, Blitz Split in any other language) until the new landing exists |
| `/g/<code>` | The same page, plus a note to open the group invite on a phone with the app installed |
| `/.well-known/assetlinks.json` | Android App Links of `com.quare.blitzsplit` |
| `/.well-known/apple-app-site-association` | Apple Universal Links of `TTV2A365LG.com.quare.blitzsplit` |

Any other path answers with the provisional page (`not_found_handling: single-page-application`). `public/_headers`
serves both `.well-known` files as `application/json`, which Android and Apple require, with a 200 and no redirect.

The `.well-known` files are copies of `webApp/public/.well-known` in
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client): change both together.

## Run and deploy

```bash
npm install
npm run dev      # http://localhost:8787
npm run deploy   # production: blitzsplit.com and www.blitzsplit.com
```

`deploy` publishes straight to the production domain, so it needs `npx wrangler login` on an account with the
blitzsplit.com zone. Cloudflare's redirect rules run before the Worker: the zone must have no rule that redirects
blitzsplit.com, or at least none that catches `/.well-known/*` and `/g/*`.
