# BentaBoost

BentaBoost helps PH online sellers create polished, shareable preview links for Shopee products. A public preview page provides custom Open Graph metadata for social sharing, records real buyer clicks, then sends buyers to the Shopee destination link with a client-side redirect.

Tagline: **Boost your benta. Share to success.**

## Required tools

- Node.js 20+
- npm
- A Supabase project
- A Vercel account for live Facebook preview testing

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Paste and run `supabase/schema.sql`.
4. Confirm the tables exist: `folders`, `posts`, `click_events`, `facebook_connections`, and `facebook_pages`.

## Storage bucket setup

The SQL creates a public Supabase Storage bucket named `post-images` for JPG, PNG, and WEBP uploads. If you create it manually, use the exact bucket name `post-images` and allow those image types.

## Environment setup

Copy `.env.local.example` to `.env.local` and fill in your Supabase values:

```bash
cp .env.local.example .env.local
```

Required for core app features:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional Facebook Auto Relay values:

```bash
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/facebook/callback
FACEBOOK_GRAPH_VERSION=v20.0
TOKEN_ENCRYPTION_SECRET=
```

Keep server secrets out of browser code. Only variables beginning with `NEXT_PUBLIC_` are exposed to the browser.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Creating your first card

1. Go to `/create`.
2. Choose a Product Folder or quick-create a new one.
3. Paste a secure Shopee destination link from `shopee.ph`, `www.shopee.ph`, `s.shopee.ph`, or `ph.shp.ee`.
4. Add the post caption, card headline, optional display label, image, and slug.
5. Click **Create Link**.

## Testing `/p/[slug]`

Open the generated preview URL in your browser. The page returns real HTML with metadata, records non-bot clicks through `/api/clicks`, shows a minimal “Opening...” message, and redirects to Shopee after a short delay.

## Dashboard and folders

- `/dashboard` shows total card and click performance, best cards, best folder, sorting, filtering, share actions, manual relay fields, and card deletion.
- `/folders` lets you create, rename, delete, and review folder performance. Deleting a folder moves cards to Unfoldered.

## Deploying to Vercel

1. Import the `DenzelleXAI/bentaboost` repo into Vercel.
2. Add the same environment variables in Vercel project settings.
3. Deploy.
4. Update `NEXT_PUBLIC_SITE_URL` to your live Vercel URL, for example `https://bentaboost.vercel.app`.
5. Redeploy after changing `NEXT_PUBLIC_SITE_URL`.

## Testing Facebook preview

Facebook cannot scrape localhost. Use the live Vercel URL when testing a BentaBoost preview link with Facebook sharing tools or feed posts.

## Manual relay workflow

1. Copy the BentaBoost preview URL from the dashboard.
2. Post that preview URL manually to Facebook.
3. Paste the resulting Facebook post/share URL into the card’s **Facebook Post URL** field.
4. Save it, then use the copy/open buttons as needed.

## Facebook Auto Relay setup

Auto Relay is optional and the app continues to work when it is not configured.

1. Create a Facebook app and configure OAuth redirect URI.
2. Add the optional env vars listed above.
3. In `/settings`, click **Connect Facebook**.
4. Approve Page permissions.
5. Select a default Page.
6. New cards will attempt to post the preview URL to that Page. If posting fails, the card still saves and manual relay remains available.

Permission names are centralized in `src/lib/config.ts` for easy adjustment.

## Troubleshooting

- **Supabase is not configured:** check `.env.local` and restart `npm run dev`.
- **Image upload fails:** confirm the `post-images` bucket exists and allows JPG, PNG, WEBP.
- **Facebook does not show custom preview:** test with a live URL, not localhost, and verify the `/p/[slug]` page has the expected metadata.
- **Shopee link rejected:** use `https://s.shopee.ph/xxxxx`, `https://ph.shp.ee/...`, or another allowed Shopee domain over HTTPS.
- **Auto Relay not configured message:** add the Facebook env vars and a token encryption secret, then restart the app.
