// The app links a browser opens when no installed app caught them first: a group's invite, /g/<code> or
// /g/<code>/<member>, a comment's, /b/<bill>?comentario=<id>, and a bill's, /c/<code>. Each goes to the same path of
// the web app, which opens it there (the web app reads these paths on any host). wrangler.jsonc sends only these
// paths here (run_worker_first) and names the web app (WEB_APP_URL); every other path, /.well-known/* among them, is a
// static asset served without running this script.
const APP_LINK = /^\/[gbc]\/./;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!APP_LINK.test(url.pathname)) return env.ASSETS.fetch(request);
    // A 302, not a 301: browsers keep a 301, and the web app moves to app.blitzsplit.com later.
    return Response.redirect(new URL(url.pathname + url.search, env.WEB_APP_URL).href, 302);
  },
};
