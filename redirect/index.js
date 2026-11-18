// Every address of vamosrachar.com and vamorachar.com (and their www) answers with a permanent redirect to the same
// path and query on blitzsplit.com, so an invite link, a bill's link or a profile's keeps working on either domain.
export default {
  fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(`https://blitzsplit.com${url.pathname}${url.search}`, 301);
  },
};
