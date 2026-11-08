// Google Analytics of the site's own Firebase project (blitzsplit-site), apart from the app's (blitz-split). Every page
// loads gtag.js and then this script, in <head> and before the others, which send their events with window.track().
// docs/analytics.md lists every event.
(function () {
  const MEASUREMENT_ID = "G-JD94WD10FJ";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };

  // An app link carries a group's code, a member's or a bill's id and a comment's: none of them reaches Analytics, as
  // the privacy policy promises. Its page view keeps only the kind of link.
  function appLink(url) {
    if (/^\/g\/[^/]+\/[^/]+\/?$/.test(url.pathname)) return "member_invite";
    if (/^\/g\/[^/]+\/?$/.test(url.pathname)) return "group_invite";
    if (/^\/b\/[^/]+\/?$/.test(url.pathname)) return "bill_comment";
    return null;
  }
  function withoutIds(href) {
    const url = new URL(href);
    const kind = appLink(url);
    if (!kind) return href;
    url.pathname = kind === "bill_comment" ? "/b/" : "/g/";
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
