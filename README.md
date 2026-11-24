# Blitz Split site

The website of **Blitz Split** (called Bora Rachar in Brazil; the site is in English, Portuguese, Spanish, French, German, Italian, Polish, Dutch, Turkish, Indonesian, Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai, Vietnamese, Traditional Chinese, Swedish, Czech, Romanian, Bengali, Malay, Greek, Hungarian, Filipino, Urdu, Croatian, Serbian, Slovak, Norwegian (Bokmål), Persian, Swahili, Tamil, Telugu, Marathi, Bulgarian, Catalan, Danish, Finnish, Latvian, Estonian and Gujarati), at [blitzsplit.com](https://blitzsplit.com).

Blitz Split splits bills with friends, even offline. Make a group, add what each one paid and see who owes whom: no
sign-up required, and everything saves on the device the moment you tap.

- **Offline first.** Bills and payments save on the device at once and sync by themselves when the connection comes
  back.
- **No account required.** A recovery code keeps your access; Google or Apple only to sync across devices.
- **Split it the way it really was.** Equally, by amounts, percentages, shares, income or item by item, with the
  receipt scanned into items.
- **Settle up.** Who owes whom with as few payments as possible, and a Bitcoin address to pay to, and a Pix key in Brazil.
- **Everywhere.** Android, iPhone and iPad, Mac and the web, each with the look of its own system, sharing the same
  groups.

This repository is the site: the landing, the privacy policy, the terms of use, the release notes and the support page, in English, Portuguese, Spanish,
French, German, Italian, Polish, Dutch, Turkish, Indonesian, Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai, Vietnamese, Traditional Chinese, Swedish, Czech, Romanian, Bengali, Malay, Greek, Hungarian, Filipino, Urdu, Croatian, Serbian, Slovak, Norwegian (Bokmål), Persian, Swahili, Tamil, Telugu, Marathi, Bulgarian, Catalan, Danish, Finnish, Latvian, Estonian and Gujarati, plus the link previews of group invites and the app links' files. The apps live in
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
| [Link previews](docs/invite-previews.md) | How each link the apps share gets its title and card |
| [Legal pages](docs/legal.md) | The Markdown the privacy policy and the terms are written in, for the site and the apps |
| [Release notes](docs/release-notes.md) | The JSON each version's notes are written in, for the "What's new" page and the apps |
| [Pages and design](docs/design.md) | Tokens, languages, theme, motion, the landing's phone, the design board |
| [Stores and downloads](docs/stores.md) | Which store each visitor sees and how to turn a store on |
| [Analytics](docs/analytics.md) | Google Analytics setup and every event the site sends |
| [Run and deploy](docs/development.md) | Local development, the invite previews locally, deploys |
| [Checks on pull requests](docs/ci.md) | The Claude review, the checks, and the `merge-when-green` label |

[CLAUDE.md](CLAUDE.md) holds the conventions for changing the site.

## Contributing

Bug reports, translations and ideas are welcome: see [Contributing](CONTRIBUTING.md), the
[code of conduct](CODE_OF_CONDUCT.md), the [security policy](SECURITY.md) and the
[accessibility statement](ACCESSIBILITY.md). The source is public to read and to contribute to, under the
[license](LICENSE), but it is not open source.
