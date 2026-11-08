# Blitz Split site

The website of **Bora Rachar** (Blitz Split in English, Spanish and French), at [blitzsplit.com](https://blitzsplit.com).

Bora Rachar splits bills with friends, even offline. Make a group, add what each one paid and see who owes whom: no
sign-up required, and everything saves on the device the moment you tap.

- **Offline first.** Bills and payments save on the device at once and sync by themselves when the connection comes
  back.
- **No account required.** A recovery code keeps your access; Google or Apple only to sync across devices.
- **Split it the way it really was.** Equally, by amounts, percentages, shares, income or item by item, with the
  receipt scanned into items.
- **Settle up.** Who owes whom with as few payments as possible, and a Pix key or Bitcoin address to pay to.
- **Everywhere.** Android, iPhone and iPad, Mac and the web, each with the look of its own system, sharing the same
  groups.

This repository is the site: the landing, the privacy policy and the terms of use, in English, Portuguese, Spanish and
French, plus the link previews of group invites and the app links' files. The apps live in
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client) and the backend in
[blitz-split-api](https://github.com/Quartel-Enterprise/blitz-split-api).

## Run

```bash
npm install
npm run dev      # http://localhost:8787
```

Every commit on `main` deploys to blitzsplit.com.

## Docs

| Doc | What it covers |
| --- | --- |
| [Routes](docs/routes.md) | Every path the site answers, the app links' `.well-known` files |
| [Invite link previews](docs/invite-previews.md) | How `/g/<code>` gets the invite's title and card |
| [Pages and design](docs/design.md) | Tokens, languages, theme, motion, the landing's phone, the design board |
| [Stores and downloads](docs/stores.md) | Which store each visitor sees and how to turn a store on |
| [Analytics](docs/analytics.md) | Google Analytics setup and every event the site sends |
| [Run and deploy](docs/development.md) | Local development, the invite previews locally, deploys |

[CLAUDE.md](CLAUDE.md) holds the conventions for changing the site.
