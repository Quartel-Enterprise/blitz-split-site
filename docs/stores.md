# Stores and downloads

Where to get the app is `public/stores.js`, as Bible Planner's landing does it: the visitor's platform (Android, an
iPhone or iPad, a Mac, any other computer) puts its own store first and makes it stand out, the header's button goes
straight to it, and a store of the other platform asks first ("Choose your store"). A store that doesn't offer the app
yet shows as "Coming soon" with no link, and the web app stands out instead; turn each store on in `CONFIG` once its
listing is public (Google Play's `googlePlayLive` is off: the app can't be downloaded from it yet; the App Store's
`appStoreId` is empty), in step with the client's `stores.properties`, and the web app with `webAppLive` once it is
open to the public. While nothing is on, every button reads "Coming soon" and the header shows no download button. `?platform=android|ios|mac|desktop` pins one. The web app lives at
[app.blitzsplit.com](https://app.blitzsplit.com), which serves `webApp/dist` of the client once it is deployed there.

The `/download`, `/download/android`, `/download/ios` and `/app-download` routes follow the same `CONFIG`: see
[routes](routes.md).
