# Security policy

The site at [blitzsplit.com](https://blitzsplit.com) shows a preview of every group invite link the apps share, so we
take reports of security problems seriously.

## Supported versions

Only what is live at blitzsplit.com gets security fixes. Every commit on `main` deploys there, so `main` is always the
supported version.

## Reporting a vulnerability

**Please don't open a public issue for a security problem.** Report it privately instead:

1. Open the repository's **Security** tab and click **Report a vulnerability**.
2. Describe the problem, the page or path (or the commit), how to reproduce it, and what an attacker could do with it.

Only the maintainers see the report. We aim to answer within 7 days, keep you posted while we fix it, and credit you
in the advisory once the fix is out, unless you'd rather stay anonymous.

## What is in scope

- The pages of blitzsplit.com: the landing, the privacy policy, the terms of use, the release notes and the support
  page.
- The Cloudflare Worker in `src/index.js`: the previews of every link the apps share (group invites under `/g/*`,
  profiles under `/u/*`, bills under `/c/*` and comments under `/b/*`) and their images under `/og/*`, the download
  paths, what they read from the backend and what they cache ([routes](docs/routes.md),
  [link previews](docs/invite-previews.md)).
- The app links' files under `/.well-known/`, the redirects and the response headers in `public/_headers`.
- The scripts the pages load, and the data they send to Google Analytics ([analytics](docs/analytics.md)).

The apps and the backend live in [blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client) and
[blitz-split-api](https://github.com/Quartel-Enterprise/blitz-split-api); report problems with them from
[blitz-split-client's Security tab](https://github.com/Quartel-Enterprise/blitz-split-client/security/advisories/new).

## Out of scope

- Reports from automated scanners with no proof that the problem can be exploited.
- Denial of service, spam, and social engineering of the maintainers or of people using the app.
- Missing best practices with no real impact (for example, a header that changes nothing for a static page).
- Problems in Cloudflare, GitHub or Google Analytics themselves; report those to them.

Please don't access, change or delete data that isn't yours while you investigate, and give us a reasonable time to
fix the problem before you disclose it.
