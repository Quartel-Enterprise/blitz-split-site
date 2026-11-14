// Google Analytics of the site's own Firebase project (blitzsplit-site), apart from the app's (blitz-split). Every page
// loads this script with defer, so it runs once the page is parsed, before the page's other deferred scripts and
// DOMContentLoaded; the others send their events with window.track(). docs/analytics.md lists every event.
// gtag.js itself, the heaviest script of the page, comes only once the page has loaded: what was queued meanwhile
// (the page view, the events) is sent when it arrives.
(function () {
  const MEASUREMENT_ID = "G-JD94WD10FJ";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };

  // An app link carries a group's code, a member's, a bill's id or its link's code, a comment's or a profile's code:
  // none of them reaches Analytics, as the privacy policy promises. Its page view keeps only the kind of link.
  function appLink(url) {
    if (/^\/g\/[^/]+\/[^/]+\/?$/.test(url.pathname)) return "member_invite";
    if (/^\/g\/[^/]+\/?$/.test(url.pathname)) return "group_invite";
    if (/^\/b\/[^/]+\/?$/.test(url.pathname)) return "bill_comment";
    if (/^\/u\/[^/]+\/?$/.test(url.pathname)) return "profile_link";
    if (/^\/c\/[^/]+\/?$/.test(url.pathname)) return "bill_link";
    return null;
  }
  function withoutIds(href) {
    const url = new URL(href);
    const kind = appLink(url);
    if (!kind) return href;
    // Why: every app link's path starts with its kind's prefix, /g/, /b/, /u/ or /c/.
    url.pathname = url.pathname.slice(0, 3);
    url.searchParams.delete("comentario");
    url.hash = "";
    return url.href;
  }

  const here = new URL(location.href);
  const config = { page_location: withoutIds(here.href) };
  if (document.referrer.startsWith(location.origin + "/")) config.page_referrer = withoutIds(document.referrer);
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, config);

  window.track = function track(name, params) {
    window.gtag("event", name, params);
  };

  function loadTag() {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.append(script);
  }
  if (document.readyState === "complete") loadTag();
  else window.addEventListener("load", loadTag, { once: true });

  const kind = appLink(here);
  if (kind) window.track("app_link_view", { kind });

  // The campaign that brought the visitor, once per visit: switching the language reloads the page with the same URL.
  const params = here.searchParams;
  if (params.get("utm_source")) {
    const utm = {};
    ["source", "medium", "campaign", "term", "content"].forEach((key) => {
      const value = params.get(`utm_${key}`);
      if (value) utm[key] = value.slice(0, 100);
    });
    const seen = JSON.stringify(utm);
    let repeated = false;
    try {
      repeated = sessionStorage.getItem("utm") === seen;
      sessionStorage.setItem("utm", seen);
    } catch (e) { /* storage blocked: the event may repeat on a reload */ }
    if (!repeated) window.track("traffic_source", utm);
  }
})();
