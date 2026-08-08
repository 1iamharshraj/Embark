# Embark India — Deploy Guide

This guide covers taking the local `web/` Next.js app to production on Vercel with Neon Postgres and Cloudflare R2 for file storage.

## 1. Database (Neon Postgres)

1. Create a project on [Neon](https://neon.tech) and a new database.
2. Copy the connection string (Postgres URL) and set it as `DATABASE_URL` in Vercel.
3. In the `web/` folder locally, run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   The seed creates the initial admin user and sample content. Run it only once.

## 2. File storage (Cloudflare R2)

1. In the Cloudflare dashboard, create an R2 bucket (e.g., `embark-india`).
2. Create an R2 API token with **Object Read & Write** permissions.
3. Set these Vercel environment variables:
   - `R2_ENDPOINT` — e.g. `https://<accountid>.r2.cloudflarestorage.com`
   - `S3_BUCKET_NAME` — your bucket name
   - `AWS_ACCESS_KEY_ID` — the R2 access key ID
   - `AWS_SECRET_ACCESS_KEY` — the R2 secret access key

When these variables are set, the app uploads files to R2 instead of the local disk. In local development, leave them unset to write to `web/uploads/`.

## 3. Deploy on Vercel

1. Push the repository to GitHub (or import the existing repo).
2. In Vercel, create a new project and import the `web/` folder as the root directory.
3. Use the default Next.js 14 build settings.
4. Add the environment variables from this guide and `.env.example`.
5. Deploy. The first build will run `prisma generate` automatically via the `postinstall` script.

## 4. Environment variables on Vercel

Set every variable listed in `web/.env.example`:

- `DATABASE_URL`
- `NEXTAUTH_URL` — production domain, e.g. `https://embarkindia.in`
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — live Razorpay keys
- `R2_ENDPOINT`, `S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `EMAIL_FROM` and `EMAIL_SERVER` — for password-reset emails
- `VERCEL_URL` — optional, used for preview deploys

## 5. DNS (Hostinger → Vercel)

1. In Vercel, add the domain `embarkindia.in` to the project.
2. Vercel will show the DNS records to add:
   - An **A record** pointing `@` to Vercel's IP.
   - A **CNAME record** pointing `www` to `cname.vercel-dns.com`.
3. Open the Hostinger DNS editor and add or replace those records.
4. Wait for DNS to propagate (usually minutes, sometimes up to 24 hours).
5. In Vercel, verify the domain.

## 6. Supabase migration (optional)

If you have existing data in Supabase from the first version of the platform, run the migration script once after the database is live:

```bash
npm run migrate:supabase
```

Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` first, or use `DUMP_PATH` to read a local JSON dump. See `scripts/README.md` for details.

## 7. Post-deploy checks

- Run `npm run build` locally to confirm the app builds without errors.
- Visit the sitemap at `https://embarkindia.in/sitemap.xml`.
- Visit `/manifest.json` and check the icons in the browser DevTools Application tab.
- Upload a test submission to confirm R2 storage is working.

---

For day-to-day changes, push to the main branch and Vercel will auto-deploy. For content-only updates, you can also use the admin dashboard.
