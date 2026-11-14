# Release notes

What each version of the app changed is written once, in JSON, one file per language and version:
`release-notes/<language>/<version>.json` (English, Portuguese, Spanish, French, German, Italian, Polish, Dutch,
Turkish, Indonesian and Japanese). The folder is outside `public/`, so nobody reads those files as they are:
`npm run build:release-notes` (`scripts/build-release-notes.mjs`) writes from them the two things that are read.

- **The apps' feed.** `public/release-notes/<language>.json`, at
  `https://blitzsplit.com/release-notes/<language>.json`: every version of that language, newest first. A language
  the site doesn't have answers 404 (`src/index.js`), and the app reads English. `public/_headers` lets any origin
  read it, since the web app (`app.blitzsplit.com`) asks from another one.
- **The page.** [`/release-notes`](https://blitzsplit.com/release-notes), "What's new", which the footer of every
  page links: `public/release-notes.html`, the versions between `<main>` and `</main>`, a block per language as the
  legal pages. The rest of the page (the header, the footer, `window.SITE_STRINGS`) is written by hand.

Both stay in git, so the deploy still builds nothing.

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

1. Write `release-notes/<language>/<version>.json` in every language.
2. Run `npm run build:release-notes` and commit the feeds and the page with the notes.

`npm run check:release-notes` fails, as CI does (`release-notes.yml`), when a feed or the page isn't what the notes
give, when a language misses a version or has one English doesn't, when a version's date, number of notes or a note's
platforms aren't English's, or when a file has anything this page doesn't list.

## The page

The versions come newest first, each a card with its number, its date and its notes; a note that isn't for every
platform names its platforms. "Show beta versions", a switch under the page's title, is off at first: the page shows
only the stable versions, and the beta ones with it on. The choice is kept for the next visit (`localStorage`'s `beta`),
as the theme and the language are. While no stable version exists, the page says so and points at the switch.
