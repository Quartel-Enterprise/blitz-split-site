# Blitz Split site

What [blitzsplit.com](https://blitzsplit.com) serves: a Cloudflare Worker with static assets only, no bundle. The page loads Google Analytics' `gtag.js`, which reports to the
Firebase project `blitzsplit-site` (measurement id `G-JD94WD10FJ`): a project of its own, so the site's visits don't mix
with the app's numbers (the app's project is `blitz-split`).

| Path | What it answers |
| --- | --- |
| `/` | The landing (Bora Rachar in Portuguese, Blitz Split in English and Spanish) |
| `/privacidade` | The privacy policy, the address the apps' Profile › "Privacy policy" opens (`/privacy` redirects to it) |
| `/termos` | The terms of use, the address the apps' Profile › "Terms of use" opens (`/terms` redirects to it) |
| `/g/<code>`, `/g/<code>/<member>` | The landing, plus a note to open the group invite (or a member's personal invite) on a phone with the app installed |
| `/b/<bill>?comentario=<comment>` | The same page; on a phone or a Mac with the app installed, the app opens the comment instead |
| `/download`, `/app-download` | The store of the visitor's platform (the apps' "Get the app" opens `/app-download`), or the landing's buttons while that store doesn't offer the app |
| `/download/android`, `/download/ios` | That store, whatever the platform, or the landing's buttons while it doesn't offer the app |
| `/.well-known/assetlinks.json` | Android App Links of `com.quare.blitzsplit` |
| `/.well-known/apple-app-site-association` | Apple Universal Links and shared web credentials (the recovery code in the Passwords app) of `TTV2A365LG.com.quare.blitzsplit` |

Any other path answers with the landing (`not_found_handling: single-page-application`). `public/_headers`
serves both `.well-known` files as `application/json`, which Android and Apple require, with a 200 and no redirect.

The `.well-known` files are copies of `webApp/public/.well-known` in
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client): change both together.

## Pages and design

Plain HTML with no build: `public/site.css` holds the design system's tokens (the web's zinc base and the brand's
blue, light and dark) and every component, `public/boot.js` picks the theme and the language before the first paint,
and `public/site.js` translates the page, in English, Portuguese (Brazil) and Spanish. The markup is in English; each page
carries its Portuguese and Spanish strings in `window.SITE_STRINGS`, and the legal pages write each language in full,
in blocks marked `data-lang`. The language is the first of the browser's languages the site has, English when none,
and the header's globe menu (as Bible Planner's) or the footer's switch picks another, kept for the next visit;
`?lang=en|pt|es` and `?theme=light|dark` pin one. The apps only speak English and Portuguese, so the Spanish legal
pages name the apps' buttons in English, as a Spanish speaker sees them.

`design/board.html` (not deployed) shows each page at the phone, tablet, laptop and desktop sizes it must hold, light
and dark side by side: run `npm run dev` and open the file in a browser. `design/<page>-sizes.png` show each page's
first screen at every size, light over dark; the full captures, in each language, go to `design/screenshots/`, which
git ignores.

The theme is Light, Dark or System (the default), from the header's theme menu or the footer, kept for the next visit.
Where to get the app is `public/stores.js`, as Bible Planner's landing does it: the visitor's platform (Android, an
iPhone or iPad, a Mac, any other computer) puts its own store first and makes it stand out, the header's button goes
straight to it, and a store of the other platform asks first ("Choose your store"). A store that doesn't offer the app
yet shows as "Coming soon" with no link, and the web app stands out instead; turn each store on in `CONFIG` once its
listing is public (Google Play's `googlePlayLive` is off: the app can't be downloaded from it yet; the App Store's
`appStoreId` is empty), in step with the client's `stores.properties`, and the web app with `webAppLive` once it is
open to the public. While nothing is on, every button reads "Coming soon" and the header shows no download button. `?platform=android|ios|mac|desktop` pins one. The web app lives at
[app.blitzsplit.com](https://app.blitzsplit.com), which serves `webApp/dist` of the client once it is deployed there.

The legal pages mark what is still to fill in (the company, its CNPJ, the contact emails, retention periods) with
`<span class="todo">`, which shows in amber: none may be left before they go live.

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
