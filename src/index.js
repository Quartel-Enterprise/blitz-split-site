// The Worker runs only for /g/*, /c/*, /u/*, /b/*, /download, /app-download, /og/*, /.well-known/*, /legal/* and
// /release-notes/* (run_worker_first); every other path is a static file.
//
// /g/<code>, /g/<code>/<member> (an invite), /c/<code> (a bill's link) and /u/<code> (a profile's): the landing, as
// before, with that link's meta tags, which WhatsApp, iMessage, Telegram and the rest read to draw its preview.
// /og/g/<code>.png, /og/g/<code>/<member>.png?from=, /og/c/<code>.png, /og/u/<code>.png: that preview's image.
// /b/<bill> (a comment's link) and the download paths: the landing with the tags of a card that is the same for every
// address, in the language the link asks for (?lang=). /og/comment.png, /og/download.png, /og/privacy.png and
// /og/terms.png: those cards and the legal pages'.
//
// What a preview shows, its words and its card, comes from the API's invite-preview edge function
// (blitz-split-api), which draws the card there: drawing takes more CPU than a Worker on the Free plan may use. This
// Worker only asks it and keeps each answer in Cloudflare's cache. /og/blitzsplit.png, the brand's card (the
// landing's and a dead link's, and any card's when the function fails), is the one file, which the function's
// brand_card.ts draws.

const PAGE_PATHS = {
  invite: /^\/g\/([A-Za-z0-9]{8})(?:\/([A-Za-z0-9]{6}))?\/?$/,
  bill: /^\/c\/([A-Za-z0-9]{8})\/?$/,
  profile: /^\/u\/([A-Za-z0-9]{10})\/?$/,
};
const IMAGE_PATHS = {
  invite: /^\/og\/g\/([A-Za-z0-9]{8})(?:\/([A-Za-z0-9]{6}))?\.png$/,
  bill: /^\/og\/c\/([A-Za-z0-9]{8})\.png$/,
  profile: /^\/og\/u\/([A-Za-z0-9]{10})\.png$/,
};
// Why: the letter each link's path and its image's start with.
const PATH_LETTERS = { invite: "g", bill: "c", profile: "u" };
// Why: the kinds the function answers for each link.
const WORD_KINDS = {
  invite: ["group", "personal", "invalid"],
  bill: ["bill", "bill_members", "invalid"],
  profile: ["profile", "invalid"],
  static: ["static"],
};
const MEMBER_CODE = /^[A-Za-z0-9]{6}$/;
const BRAND_IMAGE = "/og/blitzsplit.png";
const WIDTH = 1200;
const HEIGHT = 630;
// Why: every card, drawn or static, is a 1200 × 630 PNG shown large.
const CARD_TAGS = {
  "og:image:type": "image/png",
  "og:image:width": String(WIDTH),
  "og:image:height": String(HEIGHT),
  "twitter:card": "summary_large_image",
};
// Why: a renamed group or a new member shows a few minutes later; an image's address changes with what it shows,
// so it may stay a day.
const WORDS_TTL = 300;
// Why: a link-preview crawler reads the page once and keeps what it got (WhatsApp, by the link's address), so it waits
// for the words: up to 5 s, past the function's first answer after a quiet while (a cold start took 3.2 s), and short
// of the few seconds a preview fetcher gives a page before it shows none. A person sees the landing whatever its tags
// say, so a browser never waits: it gets the words already kept, or the landing's own.
const CRAWLER_WAIT_MS = 5000;
// Why: the words are asked to the end in the background even after the page answered, so a slow cold start still
// fills the cache for the next fetch of the link rather than being thrown away; a hung function is cut here.
const WORDS_TIMEOUT_MS = 20000;
// Why: a browser says Mozilla and none of these; anything else (a preview fetcher, a bot, no User-Agent at all) is
// treated as a crawler, so a fetcher nobody listed still gets the link's tags.
const BROWSER = /Mozilla\//;
const NOT_A_PERSON = /bot|crawl|spider|preview|facebookexternalhit|facebot|whatsapp|telegram|slack|discord|skype|embed|fetch|vkshare|pinterest/i;
const isCrawler = (request) => {
  const agent = request.headers.get("User-Agent") || "";
  return !BROWSER.test(agent) || NOT_A_PERSON.test(agent);
};
// Why: what a card's image depends on: who shared a personal link, the language asked and the card's version.
const IMAGE_PARAMETERS = ["from", "lang", "v"];
const IMAGE_TTL = 86400;

// The pages whose preview is the same for every address, but for its language: a comment's link opens only for the
// people of its group, so its preview shows nothing of the bill, and the download paths lead to a store. The function
// writes their words and draws their cards, as it does the legal pages' cards (/og/privacy.png, /og/terms.png).
const STATIC_PAGES = {
  comment: /^\/b\/[0-9A-Fa-f-]{36}\/?$/,
  download: /^\/(?:app-download|download(?:\/(?:android|ios))?)\/?$/,
};
const STATIC_IMAGE = /^\/og\/(comment|download|privacy|terms)\.png$/;
// Why: the language a link asks its preview in, the app's own when it shared the link; the pages read the same
// parameter (boot.js), so the page that opens speaks it too. Lowercase only, as boot.js matches it: a "PT" would
// otherwise preview in Portuguese and open a page that doesn't. The one exception is Portugal's Portuguese, pt-PT, the
// exact tag the apps share and the page picks.
const LANGUAGE = /^(?:[a-z]{2,3}|pt-PT)$/;
// Legacy language codes and the site's own: Hebrew's iw (Android's) is he, so ?lang=iw, /legal/<page>.iw.md and
// /release-notes/iw.json answer in Hebrew rather than with English or a 404, Tagalog's tl in Filipino, and Norwegian's
// no and Nynorsk's nn in Bokmål, nb. Why: the same as LEGACY in public/boot.js.
const LEGACY = { iw: "he", tl: "fil", no: "nb", nn: "nb" };
const canonicalLanguage = (language) => LEGACY[language] || language;
const LEGACY_FILE = new RegExp(`^(/legal/[a-z]+\\.|/release-notes/)(${Object.keys(LEGACY).join("|")})(\\.md|\\.json)$`);

// The folders whose files something other than a browser asks for by name: see fileOrNotFound.
const FILE_OR_NOT_FOUND = ["/.well-known/", "/legal/", "/release-notes/"];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const page = linkTargetOf(PAGE_PATHS, url)
      ?? staticTargetOf(Object.keys(STATIC_PAGES).find((name) => STATIC_PAGES[name].test(url.pathname)), url);
    if (page) return previewPage(request, url, env, ctx, page);
    const image = linkTargetOf(IMAGE_PATHS, url) ?? staticTargetOf(STATIC_IMAGE.exec(url.pathname)?.[1], url);
    if (image) return previewImage(request, url, env, ctx, image);
    if (FILE_OR_NOT_FOUND.some((prefix) => url.pathname.startsWith(prefix))) return fileOrNotFound(request, env);
    return env.ASSETS.fetch(request);
  },
};

// Why: an unknown path answers with the landing, and whoever asks for a /.well-known file the site doesn't have
// (a crawler's ard.json, security.txt) must hear that it doesn't exist, not get a page it then fails to parse. The
// same goes for /legal/<page>.<language>.md and /release-notes/<language>.json: the apps ask for their own language
// and read English on a 404. Why any origin may read the 404: the web app (app.blitzsplit.com) asks from another one,
// and a browser hides a response without Access-Control-Allow-Origin, so it would see a network error, not the 404.
async function fileOrNotFound(request, env) {
  const url = new URL(request.url);
  const legacy = LEGACY_FILE.exec(url.pathname);
  if (legacy) {
    url.pathname = legacy[1] + canonicalLanguage(legacy[2]) + legacy[3];
    request = new Request(url, request);
  }
  const response = await env.ASSETS.fetch(request);
  const isLanding = (response.headers.get("Content-Type") || "").startsWith("text/html");
  return isLanding
    ? new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" } })
    : response;
}

// Which link a path is, by the first of the paths it matches (PAGE_PATHS or IMAGE_PATHS); null for any other path.
function linkTargetOf(paths, url) {
  for (const [link, path] of Object.entries(paths)) {
    const match = path.exec(url.pathname);
    if (match) return targetOf(link, match, url);
  }
  return null;
}

// A static page's target, or its card's image's: no code, only which card and in which language; null for no card.
function staticTargetOf(card, url) {
  if (!card) return null;
  return { link: "static", card, code: null, memberCode: null, inviterCode: null, language: languageOf(url) };
}

function languageOf(url) {
  const language = url.searchParams.get("lang");
  return language && LANGUAGE.test(language) ? canonicalLanguage(language) : null;
}

function targetOf(link, match, url) {
  const [, code, memberCode] = match;
  const from = url.searchParams.get("from");
  return {
    link,
    card: null,
    code,
    // Why: an invite and a bill speak their currency's language, so only a profile reads ?lang=; for the others it
    // would only split their cached words and give their card a new address.
    language: link === "profile" ? languageOf(url) : null,
    memberCode: memberCode ?? null,
    // Why: only a personal link says who shared it, as the apps read it.
    inviterCode: memberCode && from && MEMBER_CODE.test(from) ? from : null,
  };
}

async function previewPage(request, url, env, ctx, target) {
  const [landing, words] = await Promise.all([
    landingOf(request, url, env),
    orNull(previewWords(url, env, ctx, target, isCrawler(request) ? CRAWLER_WAIT_MS : 0)),
  ]);
  // Why: the landing with its own meta tags, the brand's, rather than no page.
  if (!words) return landing;
  const tags = {
    "og:title": words.title,
    "og:description": words.description,
    // Why: a static page is one page whatever its query says (a comment's id, tracking), so only its path.
    "og:url": target.card ? new URL(url.pathname, url).href : url.href,
    "og:type": words.kind === "profile" ? "profile" : "website",
    "og:site_name": words.siteName,
    "og:locale": words.locale,
    "og:image": imageUrlOf(url, target, words),
    "og:image:alt": words.imageAlt,
    ...CARD_TAGS,
  };
  return withTags(landing, words.title, words.description, tags, words.language);
}

// The languages the site speaks written right to left: a page in one of them says dir="rtl" on <html>. Why: the same
// list as RIGHT_TO_LEFT in public/boot.js, which runs alone in <head> and can't import it; change both together.
const RIGHT_TO_LEFT = ["ar", "he", "ur", "fa"];
const directionOf = (language) => (RIGHT_TO_LEFT.includes(canonicalLanguage(String(language).split("-")[0])) ? "rtl" : "ltr");

// Why: the landing's own og tags give way to the link's, written once at the end of the head, and kept as briefly as
// the words they come from.
function withTags(landing, title, description, tags, language) {
  const rewritten = new HTMLRewriter()
    // Why: the words are in the link's language ("ar" for a group in riyals), so a crawler reads the page as written in
    // it, right to left where it is; a function that sends no language leaves the landing's own.
    .on("html", {
      element: (el) => {
        if (typeof language !== "string" || !LANGUAGE.test(language)) return;
        el.setAttribute("lang", language);
        el.setAttribute("dir", directionOf(language));
      },
    })
    .on("title", { element: (el) => el.setInnerContent(title) })
    .on('meta[name="description"]', { element: (el) => el.setAttribute("content", description) })
    .on('meta[property^="og:"], meta[name^="twitter:"]', { element: (el) => el.remove() })
    .on("head", {
      element: (el) => {
        // Why: a field the function leaves out (a profile has no currency to give a locale) is no tag, rather than
        // escapeAttribute throwing inside the rewriter and cutting the page short.
        const html = Object.entries(tags)
          .filter(([, value]) => value != null)
          .map(([key, value]) => {
            const attribute = key.startsWith("twitter:") ? "name" : "property";
            return `<meta ${attribute}="${key}" content="${escapeAttribute(value)}">`;
          })
          .join("\n  ");
        el.append(`\n  ${html}\n`, { html: true });
      },
    })
    .transform(landing);
  const response = new Response(rewritten.body, rewritten);
  response.headers.set("Cache-Control", `public, max-age=${WORDS_TTL}`);
  return response;
}

function imageUrlOf(url, target, words) {
  // Why: a static card has an address of its own even should the function send no version.
  if (words.kind === "invalid" || (!words.imageVersion && !target.card)) return new URL(BRAND_IMAGE, url).href;
  const path = target.card ?? `${PATH_LETTERS[target.link]}/${target.code}${target.memberCode ? `/${target.memberCode}` : ""}`;
  const image = new URL(`/og/${path}.png`, url);
  if (target.inviterCode) image.searchParams.set("from", target.inviterCode);
  if (target.language) image.searchParams.set("lang", target.language);
  // Why: WhatsApp keeps an image by its address; the version changes with whatever the card shows.
  if (words.imageVersion) image.searchParams.set("v", words.imageVersion);
  return image.href;
}

function landingOf(request, url, env) {
  return env.ASSETS.fetch(new Request(new URL("/", url), request));
}

// Why: an API failing leaves the landing's own tags, so its error is only logged.
function orNull(promise) {
  return promise.catch((error) => {
    console.error(error);
    return null;
  });
}

// The API answers a POST, which Cloudflare's cache doesn't keep, so its answers are kept under a GET of their own.
// The words already kept answer at once; otherwise the function is asked, in the background to the end (see
// WORDS_TIMEOUT_MS), and the page waits for it up to `wait` ms: null past that, and the landing keeps its own tags.
async function previewWords(url, env, ctx, target, wait) {
  const subject = target.card ?? `${target.code}/${target.memberCode ?? ""}`;
  const key = new Request(new URL(`/__preview/${target.link}/${subject}?from=${target.inviterCode ?? ""}&lang=${target.language ?? ""}`, url));
  const cached = await caches.default.match(key);
  if (cached) return cached.json();
  const loading = loadWords(env, target).then(async (words) => {
    const kept = new Response(JSON.stringify(words), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${WORDS_TTL}` },
    });
    await caches.default.put(key, kept);
    return words;
  });
  ctx.waitUntil(loading.catch((error) => console.error(error)));
  if (wait <= 0) return null;
  let timer;
  const late = new Promise((resolve) => { timer = setTimeout(() => resolve(null), wait); });
  return Promise.race([loading, late]).finally(() => clearTimeout(timer));
}

async function loadWords(env, target) {
  const response = await askPreview(env, target, false);
  if (!response.ok) throw new Error(`invite-preview answered ${response.status}`);
  const words = await response.json();
  // Why: a function deployed before it knew `link` reads a bill's code as an invite's, and would put a group's
  // invite on a bill's link. Such an answer isn't kept, and the page keeps the landing's own tags.
  if (!WORD_KINDS[target.link].includes(words.kind)) throw new Error(`invite-preview answered ${words.kind}`);
  return words;
}

async function previewImage(request, url, env, ctx, target) {
  // Why: kept under what the card depends on alone, so any other parameter never draws it again.
  const key = imageKeyOf(url);
  const cached = await caches.default.match(key);
  if (cached) return cached;
  let response = null;
  try {
    response = await askPreview(env, target, true);
  } catch (error) {
    console.error(error);
  }
  if (!response?.ok) {
    // Why: a code nobody has any longer, or the function failing: the brand's card, kept only briefly.
    const brand = await env.ASSETS.fetch(new Request(new URL(BRAND_IMAGE, url), request));
    const fallback = new Response(brand.body, brand);
    fallback.headers.set("Cache-Control", "public, max-age=60");
    return fallback;
  }
  const image = new Response(response.body, {
    headers: { "Content-Type": "image/png", "Cache-Control": `public, max-age=${imageTtlOf(response)}` },
  });
  ctx.waitUntil(caches.default.put(key, image.clone()));
  return image;
}

function imageKeyOf(url) {
  const key = new URL(url.pathname, url);
  for (const name of IMAGE_PARAMETERS) {
    const value = url.searchParams.get(name);
    // Why canonical: ?lang=no and ?lang=nb draw the same card, so they share one cached copy.
    if (value !== null) key.searchParams.set(name, name === "lang" ? canonicalLanguage(value) : value);
  }
  return new Request(key);
}

// Why: the function answers a minute for a card drawn with initials because a photo didn't load, which keeps the
// address of a good card; a day otherwise.
function imageTtlOf(response) {
  const maxAge = /max-age=(\d+)/.exec(response.headers.get("Cache-Control") || "");
  return maxAge ? Math.min(Number(maxAge[1]), IMAGE_TTL) : IMAGE_TTL;
}

function askPreview(env, target, image) {
  return fetch(env.INVITE_PREVIEW_URL, {
    method: "POST",
    // Why: only a hung function is cut (see WORDS_TIMEOUT_MS); a page stops waiting sooner on its own. A card may take
    // its time.
    signal: image ? undefined : AbortSignal.timeout(WORDS_TIMEOUT_MS),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...target, image }),
  });
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
