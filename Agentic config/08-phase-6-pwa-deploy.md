# Phase 6 — PWA + deploy

> Finalize the installable app experience, set up production infrastructure, and migrate existing data.

## Goal

The app is a real PWA, hosted on production infrastructure, with the old Supabase data migrated and old URLs redirected.

## Output

- PWA installable on Android/iOS/desktop.
- Production database on Neon, file storage on S3/R2, app deployed on Vercel.
- Old static URLs redirect to new routes.
- Existing Supabase users and competition data are preserved.

## Steps

1. **PWA polish**
   - Create all required icon sizes (192x192, 512x512, maskable).
   - Add `public/manifest.json` with proper `theme_color`, `background_color`, `start_url`, `display: standalone`.
   - Configure `next-pwa` or `@serwist/next` to generate a service worker.
   - Add an offline fallback page at `/offline`.
   - Cache static assets and public pages.
   - Add a custom install prompt component for browsers that support it.

2. **Push notifications (optional MVP)**
   - Add `web-push` support for competition reminders.
   - Ask user permission after sign-in.
   - Store push subscriptions in the `User` table or a new `PushSubscription` table.
   - Send a test notification when a competition round opens.
   - This can be deferred if it adds too much complexity.

3. **Production database**
   - Create a Neon project.
   - Run `npx prisma migrate deploy` against the Neon connection string.
   - Run the seed script in production only if you want demo data; otherwise skip seed and rely on migrated data.
   - Set `DATABASE_URL` in Vercel environment variables.

4. **Production file storage**
   - Create a Cloudflare R2 / AWS S3 / Backblaze B2 bucket.
   - Configure bucket policy for public reads of logos/banners; private reads for submissions.
   - Add S3 credentials to Vercel env.
   - Update file upload/download helpers to use S3 in production while keeping local filesystem for dev.

5. **Production deployment**
   - Connect the `web/` directory to Vercel (or deploy the whole repo if the Next.js app is at root).
   - Set all environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, S3 credentials, email API key.
   - Verify the production build passes (`npm run build` locally first).
   - Enable Vercel analytics if desired.

6. **Migrate old Supabase data**
   - Export users, competitions, registrations, submissions, advancements, winners from Supabase.
   - Map Supabase `auth.users` to the new `User` table; generate new passwords or force password reset.
   - Import competitions and related rows, preserving IDs where possible.
   - Copy submission files from Supabase Storage to S3/R2 and update `filePath` values.
   - Write a migration script and run it against production before DNS switch.

7. **Redirects and SEO**
   - Add redirects in `next.config.js`:
     - `index.html` → `/`
     - `competitions.html` → `/competitions`
     - `competition.html?c=:id` → `/competition/:id`
     - `playbooks.html` → `/playbooks`
     - `playbook.html?s=:slug` → `/playbook/:slug`
     - `mentorship.html` → `/mentorship`
     - `guest-lectures.html` → `/guest-lectures`
     - `account.html` → `/account`
   - Add `robots.txt` and sitemap generation.
   - Keep page titles and meta descriptions from the old pages.

8. **Domain switch**
   - Update `NEXTAUTH_URL` and any absolute URLs to the production domain.
   - Point `embarkindia.in` DNS to Vercel.
   - Verify SSL and redirects.

9. **Verification checklist**
   - [ ] Lighthouse PWA audit passes (manifest, service worker, icons, offline fallback).
   - [ ] The app installs on a mobile phone and opens in standalone mode.
   - [ ] Neon database is connected and queries return data.
   - [ ] File uploads go to S3 and are retrievable.
   - [ ] Razorpay test transactions work in production-like mode.
   - [ ] Old `.html` URLs redirect correctly to the new routes.
   - [ ] All old Supabase users can log in (or reset password if passwords were regenerated).
   - [ ] The site is live at `embarkindia.in`.

## Risks / notes

- Vercel has a request body size limit (default 4.5 MB). For larger file uploads, use direct S3 pre-signed uploads from the browser instead of sending files through Next.js API routes.
- If Hostinger is currently handling the domain, coordinate the DNS cutover carefully to avoid downtime.
- Back up the Supabase database and files before migrating.
- Keep the old static site deployed on a temporary subdomain until you confirm the new app works in production.
