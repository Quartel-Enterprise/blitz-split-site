# Release notes

What each version of the app changed is written once, in JSON, one file per language and version:
`release-notes/<language>/<version>.json` (English, Portuguese (Brazil), Portuguese (Portugal, `pt-PT`), Spanish, French, German, Italian, Polish, Dutch,
Turkish, Indonesian, Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified Chinese, Hebrew, Thai, Vietnamese, Traditional Chinese, Swedish, Czech, Romanian, Bengali, Malay, Greek, Hungarian, Filipino, Urdu, Croatian, Serbian, Slovak and Tamil). The folder is outside `public/`, so nobody reads those files as they are:
`scripts/build-release-notes.mjs` writes from them the two things that are read.

- **The apps' feed.** `public/release-notes/<language>.json`, at
  `https://blitzsplit.com/release-notes/<language>.json`: every version of that language, newest first. A language
  the site doesn't have answers 404 (`src/index.js`), and the app reads English. `public/_headers` lets any origin
  read it, since the web app (`app.blitzsplit.com`) asks from another one.
- **The page.** [`/release-notes`](https://blitzsplit.com/release-notes), "What's new", which the footer of every
  page links: `public/release-notes.html`, a block per language as the legal pages, written into the page's shell,
  `pages/release-notes.html` (the header, the footer and `window.SITE_STRINGS`, written by hand).

Neither is in git (`.gitignore`): a pull request shows only the notes it adds. They are written when the site is
deployed and when `npm run dev` starts, and again while it runs whenever a note, the shell or the script changes
([development.md](development.md#what-the-deploy-builds)).

## A version's file

`release-notes/en/3.1.0-beta_2.json`:

```json
{
  "date": "2026-11-20",
  "notes": [
    { "text": "You can now export a group's data from its menu.", "platforms": ["all"] },
    { "text": "The sidebar now remembers its width.", "platforms": ["mac", "web"] }
  ]
}
```

- **The file's name** is the version's, as the app's `version.properties` and its beta tags write it: `3.1.0.json`,
  `3.1.0-beta_2.json`. A name with `-beta_N` is a beta version. The versions are ordered by their names, a version's
  betas before it, so nothing else says the order.
- **`date`**: the day the version came out, `YYYY-MM-DD`, the same in every language.
- **`notes`**: at least one, in the order they show. A note's **`text`** is one plain line, with no Markdown and no
  HTML: the apps and the page draw it as it is. Its **`platforms`** is `["all"]`, or some of `android`, `ios` (iPhone
  and iPad), `mac` and `web`, in that order; never all four, which is `["all"]`.

Every language names the apps' buttons and screens as the app shows them in that language (Profile › Privacy and
about is Perfil › Privacidade e sobre in Portuguese), as the legal pages do.

## The feed

```json
{
  "releases": [
    {
      "version": "3.1.0-beta_2",
      "beta": true,
      "date": "2026-11-20",
      "notes": [
        { "text": "You can now export a group's data from its menu.", "platforms": ["all"] }
      ]
    }
  ]
}
```

`version` is the file's name and `beta` what that name says. The apps in people's hands read this file, so a new
key must be one an older app can ignore, and a new platform's name one it can skip: never change what a key holds.

## Adding a version

The releases of blitz-split-client add them. Each pull request there leaves its notes, in every language, in a
fragment, and a release writes the version's files here from the fragments it tells, runs `npm run
check:release-notes`'s check, and opens and merges a pull request from a `release-notes/<version>` branch, which
deploys the site (that repository's `docs/release-notes.md` and `scripts/release/send-release-notes-to-site.sh`). The
review skips those pull requests ([ci.md](ci.md#the-review)).

A release leaves a version this repository already has as it is. So a version whose notes are better written by
hand (3.0.0, the first one after the legacy app) is added here before it is released, and the release then tells
these notes everywhere else, the stores included:

1. Write `release-notes/<language>/<version>.json` in every language.
2. Commit them: the deploy writes the feeds and the page. `npm run dev` shows the page as it will be.

`npm run check:release-notes` fails, as CI does (`release-notes.yml`), when a language misses a version or has one
English doesn't, when a version's date, number of notes or a note's platforms aren't English's, or when a file has
anything this page doesn't list.

## The page

The versions come newest first, each a card with its number, its date and its notes; a note that isn't for every
platform names its platforms. "Show beta versions", a switch under the page's title, is off at first: the page shows
only the stable versions, and the beta ones with it on. The choice is kept for the next visit (`localStorage`'s `beta`),
as the theme and the language are. `?beta=on|off` pins it without keeping it, as `?theme=` does (the design board
opens the page with it on, so its cards show), and a link to a beta version's card (`/release-notes#en-3.1.0-beta_2`)
shows that card whatever was kept. While no stable version exists, the page says so and points at the switch.
