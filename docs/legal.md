# Legal pages

The privacy policy and the terms of use are written once, in Markdown, one file per page and language:
`public/legal/<page>.<language>.md` (`privacy` and `terms`; English, Portuguese, Spanish, Dutch, Turkish, Indonesian
and Japanese). Two readers take those files:

- **The site.** `npm run build:legal` (`scripts/build-legal.mjs`) writes each language's block, between `<main>` and
  `</main>` of `public/privacy.html` and `public/terms.html`, from them. The pages stay plain HTML in git, so the
  deploy still builds nothing; the rest of each page (the header, the footer, `window.SITE_STRINGS`) is written by
  hand, as on the landing.
- **The apps.** Android, iPhone, iPad and Mac download `https://blitzsplit.com/legal/<page>.<language>.md` and draw
  it with their own components (`blitz-split-client`, `LegalDocumentParser`). A language the site doesn't have answers
  404 (`src/index.js`), and the app reads English.

## Changing the text

1. Edit the Markdown of every language, and set `updated` in each one's front matter when the change matters to
   who reads it.
2. Run `npm run build:legal` and commit the pages with the Markdown.

`npm run check:legal` fails, as CI does (`legal.yml`), when a page isn't what its Markdown gives, when a language or a
page is missing, when a language's sections or tables aren't English's, or when the Markdown has anything this page
doesn't list. The apps in people's hands parse the same files, so a new construct needs an app release first: never
add one here alone.

## What the Markdown takes

```markdown
---
title: Privacy policy
updated: 2026-11-05
---

> **In short**
>
> - The summary: a callout holding a list, before the first section.

## A section {#anchor}

A paragraph, on one line, with **bold**, a [link](/terms#anchor) and <mark>what is still to decide</mark>.

### A heading inside the section

- A list item, on one line.

> **A callout's title**
>
> Its one paragraph.

| Purpose | Data |
| --- | --- |
| A row | Its cells, with the same inline text as a paragraph |
```

- **Front matter**: `title` (the page's heading) and `updated` (`YYYY-MM-DD`, the same in every language). The page
  writes the date in the language's own format; the reading time is the English text's.
- **Blocks**, one blank line between two: a section (`##`, numbered in order on the page), a heading (`###`), a
  paragraph, a list (`- `, one level), a callout (`>`: a `**Title**` line, a `>` line, then one paragraph, or one
  list for the summary) and a table (a header row, `| --- |`, rows; on a phone each row becomes a card, its first
  cell the title and the others under their column's name). Every block's text is on one line.
- **A section's anchor** (`{#anchor}`) is its id on the page after the language (`#en-keep`, `#pt-tempo`), and what
  the apps scroll to. Each language keeps its own; never rename one, since links to it exist.
- **Inline**: `**bold**`, `[text](address)` and `<mark>…</mark>`. An address is `/privacy` or `/terms`, with a
  section's anchor as the Markdown names it (`/privacy#keep`; the page adds the language), `https://…` or
  `mailto:…`. Nothing else: no italics, code, images, numbered or nested lists, line breaks or other HTML.
- **`<mark>`** is what is still to fill in or decide (the company's data, a retention period). The page shows it in
  amber (`.todo`), the apps as plain text: none may be left before a text goes live.

French, German, Italian and Polish read the English text, on the site and in the apps. Spanish, Dutch, Turkish,
Indonesian and Japanese name the apps' buttons in English, as the texts were written before the apps spoke them.
