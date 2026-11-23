# Accessibility

The site at [blitzsplit.com](https://blitzsplit.com) is where many people meet Blitz Split (**Bora Rachar** in
Brazil) for the first time, and where they read its privacy policy and terms, so it aims to work for everyone,
whatever the device, the screen size or the way they use it.

## Supported environments

A current version of Chrome, Edge, Firefox or Safari, on phones, tablets and computers. The pages are plain HTML, so
they work with the browser's own screen reader support (VoiceOver, TalkBack, NVDA, JAWS, Narrator), its zoom and the
keyboard. The apps have their own statement in
[blitz-split-client](https://github.com/Quartel-Enterprise/blitz-split-client/blob/main/ACCESSIBILITY.md).

## What we commit to

- **Contrast.** Every text reads at 4.5:1 or more on what is behind it, and every icon or edge that carries meaning at
  3:1 (WCAG 2.2 AA), in light and dark mode. The theme follows the system's unless one is picked.
- **Text size and zoom.** The pages reflow at 200% zoom and at a phone's width, with no sideways scrolling.
- **Screen readers.** The pages use headings, landmarks and lists; links, buttons and images have labels, and
  decorative images are hidden from screen readers. The landing's working phone is a demonstration with labeled
  controls, and what it shows is told in the page's text too.
- **Keyboard.** A **Skip to content** link comes first; every control, the language picker and the store dialog
  included, is reachable with the keyboard, shows a focus ring and closes with Escape.
- **Motion.** With `prefers-reduced-motion` the landing shows still and complete: nothing slides, counts or loops.
- **Language.** The site is in English, Portuguese (Brazil and Portugal), Spanish, French, German, Italian, Polish,
  Dutch, Turkish, Indonesian, Japanese, Russian, Ukrainian, Korean, Arabic, Hindi, Simplified and Traditional Chinese,
  Hebrew, Thai, Vietnamese, Swedish, Czech, Romanian, Bengali, Malay, Greek, Hungarian, Filipino, Urdu, Croatian, Serbian, Slovak, Norwegian (Bokmål), Persian, Swahili, Tamil, Telugu, Marathi, Bulgarian, Catalan and Danish. It follows the browser's language, sets the page's `lang`, and
  reads right to left in Arabic, Hebrew, Urdu and Persian.

## Known limitations

- The previews of the links the apps share (`/g/*`, `/u/*`, `/c/*`, `/b/*`) are drawn for the apps that show a link's
  card; their image has no text alternative beyond the card's title and description.
- The legal pages are long documents; their headings are the way to move around them.

## Reporting a barrier

If something on the site is hard or impossible to use with your device, setting or assistive technology, please tell
us: open an issue with the **Bug report** template, say which page, browser and device, fill in its assistive
technology field, and what got in the way. Barriers are treated as bugs, and fixed with the same priority.
