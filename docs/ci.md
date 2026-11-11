# Checks on pull requests

| Workflow | What it does | Locally |
| --- | --- | --- |
| `claude-review` | Reviews a pull request with Claude when it opens (or a draft is marked ready), pushes the fixes it can make as one commit and leaves the rest as inline comments | |
| `claude-review-on-request` | Reviews it again, comments only, when the `ai-review` label is added | |
| `claude-review-refs` | Fails when the workflows pin different releases of the review | |
| `duplication` | Fails on copied JavaScript or CSS that `.jscpd-baseline.json` doesn't list | `npm run check:duplication` |
| `legal` | Fails when a legal page isn't what its Markdown gives, or the Markdown has something the apps can't draw ([legal.md](legal.md)) | `npm run check:legal` |
| `translations` | Fails when a page or a script misses a string in one of the site's languages | `npm run check:translations` |

Cloudflare's Workers Builds deploys `main` on its own and reports it as a check on the commit
([development.md](development.md)).

## The review

The review is [Quartel-Enterprise/claude-review](https://github.com/Quartel-Enterprise/claude-review), the same one as
`blitz-split-client`'s, without its gate: the checks here take seconds, so they just run again on the review's fix
commit. It needs the Claude GitHub App installed on the repository and the `CLAUDE_CODE_OAUTH_TOKEN` secret (from
`claude setup-token`); when the token expires the review fails on authentication, and a new one goes in the secret. A
pull request that changes `claude-review.yml` itself isn't reviewed. Bump every `Quartel-Enterprise/claude-review/*`
`uses:` together.

## Copied code

[Quartel-Enterprise/copied-code-check](https://github.com/Quartel-Enterprise/copied-code-check) runs jscpd on what
`.jscpd.json` lists: the JavaScript and CSS of `public/` and `src/`. The HTML is left out, since the legal pages
repeat their structure in each language on purpose. `.jscpd-baseline.json` lists the copied lines of each file (none
today) and only shrinks: `./scripts/cpd.sh --update-baseline` after removing copied
code, `--allow-new` only for a copy on purpose, said why in the pull request. `scripts/cpd.sh` never changes; the
release is the one `duplication.yml` pins.

## Translations

`scripts/check-translations.mjs` reads the languages from `SUPPORTED` in `public/boot.js` and checks:

- Every key a page's `data-i18n`, `data-i18n-html` and `data-i18n-label` use has a value in each language of its
  `window.SITE_STRINGS`, and no language keeps a key the page no longer uses. The legal pages (the ones with
  `data-lang` blocks) are checked in their legal languages only, since French, German, Italian and Polish read them
  in English ([design.md](design.md)), and have one block of each legal language for every English one. `name` may
  be left out of a language: the markup's Blitz Split is its name everywhere but in Portuguese.
- Every dictionary of the scripts keyed by language (`TEXT`, `PAPER`…) has each language with English's keys, shapes,
  `{placeholders}` and function arities. `CURRENCY` is a format, so only its languages are checked.
