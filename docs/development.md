# Run and deploy

```bash
npm install
npm run dev      # http://localhost:8787
```

`npm run dev` asks the hosted `invite-preview` function, so a real invite code shows its preview at
http://localhost:8787/g/<code> (a bill's link at `/c/<code>`, a profile's at `/u/<code>`), and its image at the `og:image` address the page names (`blitzsplit.com` in the
address stands for `localhost:8787`). `npx wrangler dev --var INVITE_PREVIEW_URL:http://localhost:54321/functions/v1/invite-preview` asks a local
one instead (`supabase functions serve`).

Every commit on `main` deploys to blitzsplit.com and www.blitzsplit.com through
[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/): Cloudflare runs `npx wrangler deploy`
and reports the result as a check on the commit. Other branches don't build.

`npm run deploy` publishes from your machine straight to the production domain, so it needs `npx wrangler login`
on the account with the blitzsplit.com zone. Cloudflare's redirect rules run before the Worker: the zone must have
no rule that redirects blitzsplit.com, or at least none that catches `/.well-known/*` and `/g/*`.
