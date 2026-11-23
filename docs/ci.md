# Checks on pull requests

| Workflow | What it does | Locally |
| --- | --- | --- |
| `claude-review` | Reviews a pull request with Claude when it opens (or a draft is marked ready), pushes the fixes it can make as one commit and leaves the rest as inline comments. It runs on every push too, and reviews only the one that solves a conflict the pull request opened with | |
| `claude-review-on-request` | Reviews it again, comments only, when the `ai-review` label is added | |
| `claude-review-refs` | Fails when the workflows pin different releases of the review | |
| `duplication` | Fails on copied JavaScript or CSS that `.jscpd-baseline.json` doesn't list | `npm run check:duplication` |
| `legal` | Fails when a legal page isn't what its Markdown gives, or the Markdown has something the apps can't draw ([legal.md](legal.md)) | `npm run check:legal` |
| `release-notes` | Fails when a version's notes have something the apps can't read, or a language's notes aren't English's ([release-notes.md](release-notes.md)) | `npm run check:release-notes` |
| `translations` | Fails when a page or a script misses a string in one of the site's languages, or a page writes to another contact address than the legal Markdown's | `npm run check:translations` |
| `merge-when-green` | Squash merges a pull request with the `merge-when-green` label once every check passed and every review conversation is resolved ([below](#merge-when-green)) | |

Cloudflare's Workers Builds deploys `main` on its own and reports it as a check on the commit
([development.md](development.md)).

## The review

The review is [Quartel-Enterprise/claude-review](https://github.com/Quartel-Enterprise/claude-review), the same one as
`blitz-split-client`'s, without its gate: the checks here take seconds, so they just run again on the review's fix
commit. It needs the Claude GitHub App installed on the repository and the `CLAUDE_CODE_OAUTH_TOKEN` secret (from
`claude setup-token`); when the token expires the review fails on authentication, and a new one goes in the secret. A
pull request that changes `claude-review.yml` itself isn't reviewed, and neither is one from a `release-notes/<version>`
branch, which a release of blitz-split-client writes and merges at once ([release-notes.md](release-notes.md#adding-a-version)). Bump every `Quartel-Enterprise/claude-review/*`
`uses:` together.

GitHub starts no `pull_request` workflow while a pull request conflicts with its base, so one opened (or marked ready)
with a conflict gets no review then. That is why `claude-review` runs on every push too: the action reviews the push
that solves the conflict, when the workflow has no run since the pull request opened (or a draft was last marked
ready), and every other push, the review's own fix commit included, ends in seconds without reviewing. Each push runs
in a concurrency group of its own, so it never cancels the opening review. `claude-review-on-request` waits up to two
minutes for an unfinished `claude-review` run before dropping its label, so a label added right after a push isn't
dropped for that push's short run. See "Pull requests opened with a conflict" in the action's README.

## Merge when green

Adding the `merge-when-green` label to a pull request makes the `merge-when-green` workflow squash merge it once
every check on its head commit has passed and every review conversation is resolved, then remove the label. GitHub's
own auto-merge can't do this: `main` requires no check (every check workflow here is path filtered), so it would merge
right away.

The workflow runs when the label is added and each time a pull request workflow completes, so the last check to
finish is the one that triggers the merge. GitHub loses some of those events (a run that fails to start, a
`workflow_run` never sent), so a sweep also checks every open labeled pull request on each push to `main`, on a
schedule GitHub fires only now and then, and by hand: **Actions**, `merge-when-green`, **Run workflow**, with a pull
request number to check only that one. The pull request's current head is the one judged, so a docs-only pull request
merges once the review ends, even after the review pushed its fix commit. A push moves the head and its checks have to
pass again. A failed check leaves the pull request open with the label on; re-running it green merges it. Drafts wait
until they are marked ready, and pull requests from forks are never merged.

`main`'s ruleset ("Protect main") only blocks deleting the branch and force pushing to it; it requires no check, no
review and no resolved conversation, so the workflow itself holds the merge for review conversations: when everything is green and a
conversation is still open, it removes the label and comments on the pull request. Fix each finding, or reply with why
the code stays as it is, resolve the conversation, then add the label again (resolving one starts no workflow). A
merge GitHub refuses with everything green (a conflict with `main`) also removes the label, with a comment.

The merge uses the `MERGE_WHEN_GREEN_TOKEN` secret, not `GITHUB_TOKEN`: a merge made with `GITHUB_TOKEN` triggers no
other workflow, so the push to `main` would run none of its checks. The merge shows up as made by the token's owner.
Before the secret is set, or once the token expires, the workflow fails with an error that names the secret.

**Manual setup** (Pierre): create a fine-grained personal access token restricted to this repository, with Contents and
Pull requests set to Read and write, and save it as the `MERGE_WHEN_GREEN_TOKEN` repository secret. Until then, the
label does nothing but fail the workflow.

When a workflow that runs on pull requests is added or renamed, update the `workflow_run` list in
`merge-when-green.yml` too: a workflow missing from it still holds the merge while it runs, but its completion doesn't
start one.

## Copied code

[Quartel-Enterprise/copied-code-check](https://github.com/Quartel-Enterprise/copied-code-check) runs jscpd on what
`.jscpd.json` lists: the JavaScript and CSS of `public/` and `src/`. The HTML is left out, since the legal pages
repeat their structure in each language on purpose. `.jscpd-baseline.json` lists the copied lines of each file (none
today) and only shrinks: `./scripts/cpd.sh --update-baseline` after removing copied
code, `--allow-new` only for a copy on purpose, said why in the pull request. `scripts/cpd.sh` never changes; the
release is the one `duplication.yml` pins.

## Translations

`scripts/check-translations.mjs` reads the languages from `SUPPORTED` in `public/boot.js` and checks:

- Every key a page's `data-i18n`, `data-i18n-html` and `data-i18n-label` use (the pages of `public/` and the shells of
  `pages/`, whose text the deploy writes; the check writes the release notes' page first, so its blocks are counted too) has a value in each language of its
  `window.SITE_STRINGS`, and no language keeps a key the page no longer uses. A page whose `boot.js` names its strings
  (`data-strings`, the landing and the support page) has them read from `public/strings/<name>/<language>.js`: every
  language and variant must have its file there, each setting only its own language, and no folder may be left that
  no page asks for ([design.md](design.md#a-pages-strings)). The legal pages (the ones with
  `data-lang` blocks) have one block of each language for every English one. `name` may
  be left out of a language: the markup's Blitz Split is its name everywhere but in Portuguese.
- Every dictionary of the scripts keyed by language (`TEXT`, `PAPER`…) has each language with English's keys, shapes,
  `{placeholders}` and function arities. `CURRENCY` is a format, so only its languages are checked.

It also checks the contact address, since it already reads every page: the legal Markdown (`public/legal/*.md`)
publishes one address, and every `mailto:` link of a page (the five footers, the Support page's button, the legal
pages' own), the address such a link shows and the address `public/llms.txt` names must be that one. The site has no
build, so the address is typed by hand in each of those places
([design.md](design.md#support-and-the-footers-contact)); a change of address that misses one fails here.
