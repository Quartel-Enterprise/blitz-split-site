# Blitz Split: site

The site at blitzsplit.com of Bora Rachar (Blitz Split in English, Spanish, French, German, Italian, Polish, Dutch,
Turkish, Indonesian and Japanese): the landing, the privacy policy and the terms of use, served by a Cloudflare Worker with static assets (`public/`) and one
script (`src/index.js`) for the shared links' previews. Plain HTML, CSS and JavaScript with no build. The apps live in
`blitz-split-client` and the backend in `blitz-split-api`.

## Documentation

- **Routes**: [`docs/routes.md`](docs/routes.md): every path the site answers, redirects and the `.well-known` files.
- **Link previews**: [`docs/invite-previews.md`](docs/invite-previews.md): every link the apps share (`/g/*`, `/c/*`,
  `/u/*`, `/b/*`, the download paths) and `/og/*`, the API's `invite-preview` function and the cache.
- **Pages and design**: [`docs/design.md`](docs/design.md): tokens, languages, theme, motion, the landing's working
  phone, the design board and the legal pages' open points.
- **Legal pages**: [`docs/legal.md`](docs/legal.md): the Markdown the privacy policy and the terms are written in,
  which the pages are generated from and the apps draw natively.
- **Stores and downloads**: [`docs/stores.md`](docs/stores.md): which store each platform sees and `CONFIG` in
  `public/stores.js`.
- **Analytics**: [`docs/analytics.md`](docs/analytics.md): Google Analytics setup and every event.
- **Run and deploy**: [`docs/development.md`](docs/development.md).
- **Checks on pull requests**: [`docs/ci.md`](docs/ci.md): the Claude review, copied code and the translations check.

## Conventions

- Write code, comments, docs, commit messages and pull requests in English. Keep `README.md` about the product and
  the repository's purpose; details go in `docs/`.
- No build and no dependencies in the pages: `public/site.css` holds the design system's tokens (light and dark) and
  every component; use the tokens, never raw colors in components.
- The markup is in English. Every string a page shows has a `data-i18n` key with its Portuguese, Spanish, French, German,
  Italian, Polish, Dutch, Turkish, Indonesian and Japanese in the page's `window.SITE_STRINGS`; the legal pages write
  English, Portuguese, Spanish, Dutch, Turkish, Indonesian and Japanese in full in `data-lang` blocks, generated from `public/legal/*.md`. Add all eleven
  languages in the same change: `npm run check:translations` fails on a missing one, as CI does.
- No new copied JavaScript or CSS: `npm run check:duplication` (jscpd, against `.jscpd-baseline.json`) fails on it,
  as CI does.
- `public/boot.js` runs in `<head>` and decides the theme, the language and `.motion` before the first paint. Every
  animation hangs on `:root.motion`, so with reduced motion (or a pinned `?theme=`) the page shows still and complete.
- Sending a new analytics event means adding its row to [`docs/analytics.md`](docs/analytics.md) in the same change.
  Never send a group code, member, bill or comment id to Analytics.
- Change the `.well-known` files together with `webApp/public/.well-known` in `blitz-split-client`, and `CONFIG` in
  `public/stores.js` together with the client's `stores.properties`.
- Never edit a legal page's text in its HTML: edit `public/legal/<page>.<language>.md`, run `npm run build:legal` and
  commit both (`npm run check:legal` fails otherwise, as CI does). The apps parse the same Markdown, so use only what
  [`docs/legal.md`](docs/legal.md) lists.
- The legal pages' `<mark>` (`<span class="todo">` on the page) marks what is still to fill in; none may be left
  before they go live.
- Check a visual change in `design/board.html` (every size, light and dark) with `npm run dev` running.
- Deploy: every commit on `main` deploys to blitzsplit.com through Workers Builds; other branches don't build.
