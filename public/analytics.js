// Google Analytics of the site's own Firebase project (blitzsplit-site), apart from the app's (blitz-split). Every page
// loads gtag.js and then this script, in <head> and before the others, which send their events with window.track().
// README.md lists every event.
(function () {
  const MEASUREMENT_ID = "G-JD94WD10FJ";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };

  // App links (/g/…, /b/…, /c/…) redirect to the web app before any page loads, so no page view carries their ids.
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  window.track = function track(name, params) {
    window.gtag("event", name, params);
  };

  // The campaign that brought the visitor, once per visit: switching the language reloads the page with the same URL.
  const params = new URL(location.href).searchParams;
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
