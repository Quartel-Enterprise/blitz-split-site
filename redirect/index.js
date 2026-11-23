// Every address of vamosrachar.com, vamorachar.com and borarachar.com (and their www) answers with a permanent redirect to the same
// path and query on blitzsplit.com, so an invite link, a bill's link or a profile's keeps working on either domain.
// The old web app address, app.<domain>, goes to web.blitzsplit.com the same way.
export default {
  fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.startsWith("app.") ? "web.blitzsplit.com" : "blitzsplit.com";
    return Response.redirect(`https://${host}${url.pathname}${url.search}`, 301);
  },
};
