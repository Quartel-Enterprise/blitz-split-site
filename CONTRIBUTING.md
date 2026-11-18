# Contributing to the Blitz Split site

Thanks for wanting to help with the site of Blitz Split (**Bora Rachar** in Brazil)! Bug reports, ideas,
translations and code are all welcome.

By contributing, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md) and that your contribution is used
under the terms of the [license](LICENSE): the source is public to read and to contribute to, but it is not open
source.

This repository is only the site at [blitzsplit.com](https://blitzsplit.com). Something in the apps goes to
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client).

## Reporting a bug or asking for something

- **A bug**: open an issue with the **Bug report** template. Say which page, which browser and device, which
  language, what you did, what you expected and what happened instead. Screenshots help a lot.
- **A translation that reads wrong**: the **Bug report** template too, with the language, the page and the text you
  would write instead.
- **An idea**: open an issue with the **Feature request** template, starting from the problem it solves.
- **A security problem**: never in a public issue. Follow the [security policy](SECURITY.md).

Search the existing issues first: someone may have reported it already.

## Before writing code

For anything bigger than a small fix, open an issue first and agree on the behavior before writing it. Then read
[CLAUDE.md](CLAUDE.md), which holds the conventions, and the doc of the area you change, listed in the
[README](README.md#docs).

## How the site is made

Plain HTML, CSS and JavaScript with no build: the pages and their files are in `public/`, served by a Cloudflare
Worker, and `src/index.js` answers the invite links' previews. [Run and deploy](docs/development.md) explains how to run
it locally.

- `public/site.css` holds the design system's tokens (light and dark) and every component. Use the tokens, never raw
  colors ([pages and design](docs/design.md)).
- Every string a page shows has a `data-i18n` key, translated into every language of the site in the same change.
- Never edit the privacy policy or the terms in their HTML: edit `public/legal/<page>.<language>.md` and run
  `npm run build:legal` ([legal pages](docs/legal.md)).
- Never edit a version's release notes in their HTML or feed: edit `release-notes/<language>/<version>.json` and run
  `npm run build:release-notes` ([release notes](docs/release-notes.md)).
- Every animation hangs on `:root.motion`, so with reduced motion the page shows still and complete.
- A new analytics event gets its row in [analytics](docs/analytics.md) in the same change.

## Making a change

1. Fork the repository and branch from `main`. Name the branch `<type>/<short-description>`, where the type is one of:

   | Type | For |
   | --- | --- |
   | `fix` | A bug or unintended behavior |
   | `feature` | Something the site couldn't do |
   | `enhancement` | Something it already did, now better (performance, UX, accessibility, another screen size) |
   | `refactor` | Restructuring with no change people notice |
   | `chore` | CI, tooling, docs or release notes only |

2. Write code, comments, docs and commit messages in **English**. Only the text a person sees on the site is
   translated.
3. Check a visual change in `design/board.html`, at every size, in light and dark, with `npm run dev` running.
4. Run the checks:

   ```bash
   npm run check:translations
   npm run check:legal
   npm run check:release-notes
   npm run check:duplication
   ```

## Opening the pull request

- Title it `<type>: <summary>` in the [Conventional Commits](https://www.conventionalcommits.org) form, with the
  branch's type from the table above (`feature`, not the spec's `feat`), in English:
  `fix: keep the language picker open on scroll`.
- Fill in the pull request template: the problem, the expected behavior, and how you checked it.
- Add screenshots for any visual change, in light and dark, on a phone and a wide screen.
- Keep it focused: one change per pull request is far easier to review.

The CI runs the same checks and a Claude review ([checks on pull requests](docs/ci.md)), and a maintainer reviews
every pull request before it merges. Every commit on `main` deploys to blitzsplit.com.
