# Blitz Split site

What [blitzsplit.com](https://blitzsplit.com) serves: a Cloudflare Worker with static assets only, no script.

| Path | What it answers |
| --- | --- |
| `/` | A provisional page (Bora Rachar in Portuguese, Blitz Split in any other language) until the new landing exists |
| `/g/<code>`, `/g/<code>/<member>` | The same page, plus a note to open the group invite (or a member's personal invite) on a phone with the app installed |
| `/.well-known/assetlinks.json` | Android App Links of `com.quare.blitzsplit` |
| `/.well-known/apple-app-site-association` | Apple Universal Links and shared web credentials (the recovery code in the Passwords app) of `TTV2A365LG.com.quare.blitzsplit` |

Any other path answers with the provisional page (`not_found_handling: single-page-application`). `public/_headers`
serves both `.well-known` files as `application/json`, which Android and Apple require, with a 200 and no redirect.

The `.well-known` files are copies of `webApp/public/.well-known` in
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client): change both together.

## Run and deploy

```bash
npm install
npm run dev      # http://localhost:8787
```

Every commit on `main` deploys to blitzsplit.com and www.blitzsplit.com through
[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/): Cloudflare runs `npx wrangler deploy`
and reports the result as a check on the commit. Other branches don't build.

`npm run deploy` publishes from your machine straight to the production domain, so it needs `npx wrangler login`
on the account with the blitzsplit.com zone. Cloudflare's redirect rules run before the Worker: the zone must have
no rule that redirects blitzsplit.com, or at least none that catches `/.well-known/*` and `/g/*`.
