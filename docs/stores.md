# Stores and downloads

Where to get the app is `public/stores.js`, as Bible Planner's landing does it: the visitor's platform (Android, an
iPhone or iPad, a Mac, any other computer) puts its own store first and makes it stand out, the header's button goes
straight to it, and a store of the other platform asks first ("Choose your store"). A store that doesn't offer the app
yet shows as "Coming soon" with no link, and the web app stands out instead; turn each store on in `CONFIG` once its
listing is public (Google Play's `googlePlayLive` and the web app's `webAppLive` are on; the App Store's `appStoreId` is
empty), in step with the client's `stores.properties`. While nothing is on, every button reads "Coming soon" and the
header shows no download button. `?platform=android|ios|mac|desktop` pins one. The web app lives at
[app.blitzsplit.com](https://app.blitzsplit.com), which serves `webApp/dist` of the client once it is deployed there.

A phone or a Mac sees the other platform's store only once both stores offer the app, when "Choose your store" can
stand in front of it. On a computer the header's main button is the web app. A line over the hero's badges says what
this visitor can do right now (`noteStore`, `noteApple`, `noteWeb` in `stores.js`). When the App Store goes live, also
rewrite the FAQ's `q5a` in `public/index.html` and the first paragraph of `public/llms.txt`, which say iPhone, iPad and
Mac use the browser for now.

The Google Play links carry the visit's `utm_*` values in `referrer`, so an install can be traced to its campaign.

The `/download`, `/download/android`, `/download/ios` and `/app-download` routes follow the same `CONFIG`: see
[routes](routes.md).
