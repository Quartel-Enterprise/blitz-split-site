// The Worker runs only for /g/*, /u/*, /og/*, /.well-known/* and /legal/* (run_worker_first); every other path is a
// static file.
//
// /g/<code>, /g/<code>/<member>: the landing, as before, with the invite's meta tags, which WhatsApp, iMessage,
// Telegram and the rest read to draw the link's preview.
// /og/g/<code>.png, /og/g/<code>/<member>.png?from=: that preview's image.
// /u/<code>: the landing with a profile link's meta tags, the person's name and photo.
//
// What a preview shows, its words and its card, comes from the API's invite-preview edge function
// (blitz-split-api), which draws the card there: drawing takes more CPU than a Worker on the Free plan may use. This
// Worker only asks it and keeps each answer in Cloudflare's cache. /og/blitzsplit.png, the brand's card (the
// landing's and a dead invite's), is a static file the function's brand_card.ts draws.

const INVITE_PATH = /^\/g\/([A-Za-z0-9]{8})(?:\/([A-Za-z0-9]{6}))?\/?$/;
const IMAGE_PATH = /^\/og\/g\/([A-Za-z0-9]{8})(?:\/([A-Za-z0-9]{6}))?\.png$/;
const MEMBER_CODE = /^[A-Za-z0-9]{6}$/;
const PROFILE_PATH = /^\/u\/([A-Za-z0-9]{10})\/?$/;
const BRAND_IMAGE = "/og/blitzsplit.png";
const WIDTH = 1200;
const HEIGHT = 630;
// Why: a renamed group or a new member shows a few minutes later; an image's address changes with what it shows,
// so it may stay a day.
const WORDS_TTL = 300;
const IMAGE_TTL = 86400;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const page = INVITE_PATH.exec(url.pathname);
    if (page) return invitePage(request, url, env, ctx, targetOf(page, url));
    const image = IMAGE_PATH.exec(url.pathname);
    if (image) return inviteImage(request, url, env, ctx, targetOf(image, url));
    const profile = PROFILE_PATH.exec(url.pathname);
    if (profile) return profilePage(request, url, env, ctx, profile[1]);
    if (url.pathname.startsWith("/.well-known/") || url.pathname.startsWith("/legal/")) return fileOrNotFound(request, env);
    return env.ASSETS.fetch(request);
  },
};

// Why: an unknown path answers with the landing, and whoever asks for a /.well-known file the site doesn't have
// (a crawler's ard.json, security.txt) must hear that it doesn't exist, not get a page it then fails to parse. The
// same goes for /legal/<page>.<language>.md: the apps ask for their own language and read English on a 404.
async function fileOrNotFound(request, env) {
  const response = await env.ASSETS.fetch(request);
  const isLanding = (response.headers.get("Content-Type") || "").startsWith("text/html");
  return isLanding ? new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }) : response;
}

function targetOf(match, url) {
  const [, code, memberCode] = match;
  const from = url.searchParams.get("from");
  return {
    code,
    memberCode: memberCode ?? null,
    // Why: only a personal link says who shared it, as the apps read it.
    inviterCode: memberCode && from && MEMBER_CODE.test(from) ? from : null,
  };
}

async function invitePage(request, url, env, ctx, target) {
  const [landing, words] = await Promise.all([
    landingOf(request, url, env),
    orNull(previewWords(url, env, ctx, target)),
  ]);
  // Why: the landing with its own meta tags, the brand's, rather than no page.
  if (!words) return landing;
  const tags = {
    "og:title": words.title,
    "og:description": words.description,
    "og:url": url.href,
    "og:type": "website",
    "og:site_name": words.siteName,
    "og:locale": words.locale,
    "og:image": imageUrlOf(url, target, words),
    "og:image:type": "image/png",
    "og:image:width": String(WIDTH),
    "og:image:height": String(HEIGHT),
    "og:image:alt": words.imageAlt,
    "twitter:card": "summary_large_image",
  };
  return withTags(landing, words.title, words.description, tags);
}

// Why: the landing's own og tags give way to the link's, written once at the end of the head, and kept as briefly as
// the words they come from.
function withTags(landing, title, description, tags) {
  const rewritten = new HTMLRewriter()
    .on("title", { element: (el) => el.setInnerContent(title) })
    .on('meta[name="description"]', { element: (el) => el.setAttribute("content", description) })
    .on('meta[property^="og:"], meta[name^="twitter:"]', { element: (el) => el.remove() })
    .on("head", {
      element: (el) => {
        const html = Object.entries(tags)
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
  if (words.kind === "invalid" || !words.imageVersion) return new URL(BRAND_IMAGE, url).href;
  const path = target.memberCode ? `g/${target.code}/${target.memberCode}` : `g/${target.code}`;
  const image = new URL(`/og/${path}.png`, url);
  if (target.inviterCode) image.searchParams.set("from", target.inviterCode);
  // Why: WhatsApp keeps an image by its address; the version changes with whatever the card shows.
  image.searchParams.set("v", words.imageVersion);
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
async function cachedJson(url, ctx, path, load) {
  const key = new Request(new URL(path, url));
  const cached = await caches.default.match(key);
  if (cached) return cached.json();
  const value = await load();
  const kept = new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${WORDS_TTL}` },
  });
  ctx.waitUntil(caches.default.put(key, kept));
  return value;
}

function previewWords(url, env, ctx, target) {
  const path = `/__invite-preview/${target.code}/${target.memberCode ?? ""}?from=${target.inviterCode ?? ""}`;
  return cachedJson(url, ctx, path, async () => {
    const response = await askPreview(env, target, false);
    if (!response.ok) throw new Error(`invite-preview answered ${response.status}`);
    return response.json();
  });
}

async function inviteImage(request, url, env, ctx, target) {
  const cached = await caches.default.match(request);
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
    headers: { "Content-Type": "image/png", "Cache-Control": `public, max-age=${IMAGE_TTL}` },
  });
  ctx.waitUntil(caches.default.put(request, image.clone()));
  return image;
}

function askPreview(env, target, image) {
  return fetch(env.INVITE_PREVIEW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...target, image }),
  });
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// A profile link's preview: the person's name, and their photo when they have one, over the landing. The words stay
// the brand's in every language, since a crawler says nothing of who reads it. An unknown code, or the API failing,
// leaves the landing's own tags.
async function profilePage(request, url, env, ctx, code) {
  const [landing, profile] = await Promise.all([
    landingOf(request, url, env),
    orNull(sharedProfile(url, env, ctx, code)),
  ]);
  // Why: a profile without a name has nothing to title the preview with.
  if (!profile?.display_name) return landing;
  // Why: a crawler only fetches an absolute address.
  const photo = /^https?:\/\//.test(profile.avatar_url ?? "") ? profile.avatar_url : null;
  const tags = {
    "og:title": profile.display_name,
    "og:description": "Blitz Split · Bora Rachar",
    "og:url": url.href,
    "og:type": "profile",
    "og:site_name": "Blitz Split",
    "og:image": photo || new URL(BRAND_IMAGE, url).href,
    ...(photo
      ? {}
      : { "og:image:type": "image/png", "og:image:width": String(WIDTH), "og:image:height": String(HEIGHT) }),
    "twitter:card": photo ? "summary" : "summary_large_image",
  };
  return withTags(landing, profile.display_name, tags["og:description"], tags);
}

// Null for a code no profile has.
function sharedProfile(url, env, ctx, code) {
  return cachedJson(url, ctx, `/__profile-link/${code}`, async () => {
    const response = await fetch(env.PROFILE_LINK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ p_code: code }),
    });
    if (!response.ok) throw new Error(`get_profile_by_share_code answered ${response.status}`);
    // Why: PostgREST answers a set-returning function with an array, a one-row one with an object or null.
    const answer = await response.json();
    const row = Array.isArray(answer) ? answer[0] : answer;
    return row ? { display_name: row.display_name, avatar_url: row.avatar_url } : null;
  });
}
