# Blitz Split: site

The site at blitzsplit.com of Bora Rachar (Blitz Split in English, Spanish, French, German, Italian and Polish): the
landing, the privacy policy and the terms of use, served by a Cloudflare Worker with static assets (`public/`) and one
script (`src/index.js`) for the invite links' previews. Plain HTML, CSS and JavaScript with no build. The apps live in
`blitz-split-client` and the backend in `blitz-split-api`.

## Documentation

- **Routes**: [`docs/routes.md`](docs/routes.md): every path the site answers, redirects and the `.well-known` files.
- **Invite link previews**: [`docs/invite-previews.md`](docs/invite-previews.md): `/g/*` and `/og/*`, the API's
  `invite-preview` function and the cache.
- **Pages and design**: [`docs/design.md`](docs/design.md): tokens, languages, theme, motion, the landing's working
  phone, the design board and the legal pages' open points.
- **Stores and downloads**: [`docs/stores.md`](docs/stores.md): which store each platform sees and `CONFIG` in
  `public/stores.js`.
- **Analytics**: [`docs/analytics.md`](docs/analytics.md): Google Analytics setup and every event.
- **Run and deploy**: [`docs/development.md`](docs/development.md).

## Conventions

- Write code, comments, docs, commit messages and pull requests in English. Keep `README.md` about the product and
  the repository's purpose; details go in `docs/`.
- No build and no dependencies in the pages: `public/site.css` holds the design system's tokens (light and dark) and
  every component; use the tokens, never raw colors in components.
- The markup is in English. Every string a page shows has a `data-i18n` key with its Portuguese, Spanish, French, German,
  Italian and Polish in the page's `window.SITE_STRINGS`; the legal pages write each language in full in `data-lang`
  blocks. Add all seven languages in the same change.
- `public/boot.js` runs in `<head>` and decides the theme, the language and `.motion` before the first paint. Every
  animation hangs on `:root.motion`, so with reduced motion (or a pinned `?theme=`) the page shows still and complete.
- Sending a new analytics event means adding its row to [`docs/analytics.md`](docs/analytics.md) in the same change.
  Never send a group code, member, bill or comment id to Analytics.
- Change the `.well-known` files together with `webApp/public/.well-known` in `blitz-split-client`, and `CONFIG` in
  `public/stores.js` together with the client's `stores.properties`.
- The legal pages' `<span class="todo">` marks what is still to fill in; none may be left before they go live.
- Check a visual change in `design/board.html` (every size, light and dark) with `npm run dev` running.
- Deploy: every commit on `main` deploys to blitzsplit.com through Workers Builds; other branches don't build.
