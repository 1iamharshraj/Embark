# Deployment Guide

This project has two deployment targets:

1. **Legacy static site** — Hostinger shared hosting via Git connector.
2. **New Next.js app** — Vercel (or Render/Railway) from the `web/` directory.

---

## 1. Static site (Hostinger)

The static site files live at the repo root (`.html`, `css/`, `js/`, `assets/`, `supabase/`). They are deployed through Hostinger's Git connector.

### Deploy flow

1. Edit files locally.
2. If `css/gl.css` or any `.js` file changed, **bump the `?v=` query parameter** in every page that links it. Currently `gl.css?v=9`.
3. Commit and push:
   ```bash
   git add .
   git commit -m "describe change"
   git push origin main
   ```
4. Hostinger either auto-deploys on push or requires clicking **Deploy** in hPanel → Git.
5. Hard-refresh live pages (`Ctrl+F5`) to bypass browser cache.

### Cache rules

`.htaccess` sets:

- `Cache-Control: no-cache, must-revalidate` for `*.html`.
- Denies public access to `*.md` files.

### Important rules

- Do **not** move `.html` pages out of the repo root — they are the live URLs.
- Do **not** move the database to Hostinger; keep it on Supabase.
- Always bump `?v=` on CSS/JS changes.
- Do not weaken Supabase RLS policies.

---

## 2. Next.js app (Vercel)

The new app is in the `web/` directory. It is intended to replace the static site after DNS cutover.

### Pre-deployment checklist

Before deploying to production, resolve these blockers:

1. **Razorpay** — switch from test keys to live keys.
2. **Email** — replace console-logged reset links with a real email provider (e.g., Resend, NodeMailer, AWS SES).
3. **File storage** — configure Cloudflare R2 or AWS S3 credentials; do not rely on local fallback.
4. **Database** — create a Neon (or equivalent managed Postgres) project and set `DATABASE_URL`.
5. **Environment secrets** — set `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Razorpay keys, R2/S3 keys, SMTP credentials.
6. **Run security audit** — address or document `npm audit` high-severity issues.

### Vercel setup

1. Import the GitHub repo `NarentherMS/EmbarkIndia`.
2. Set **Root Directory** to `web/`.
3. Vercel auto-detects Next.js.
4. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (e.g., `https://embarkindia.in`)
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `R2_ENDPOINT` (if using Cloudflare R2)
   - `S3_BUCKET_NAME`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `EMAIL_SERVER`
   - `EMAIL_FROM`
5. Deploy.
6. Add the production domain in Vercel project settings.

### Database migration on production

```bash
# From your local machine with production DATABASE_URL set
npx prisma migrate deploy
```

Then seed if needed:

```bash
npx prisma db seed
```

> **Do not seed automatically in production** unless you intentionally want demo data.

### Legacy redirects

`web/next.config.mjs` already handles redirects from old `.html` paths:

```js
{ source: "/index.html", destination: "/", permanent: true }
{ source: "/competitions.html", destination: "/competitions", permanent: true }
{ source: "/competition.html", destination: "/competitions", permanent: true }
{ source: "/playbooks.html", destination: "/playbooks", permanent: true }
{ source: "/mentorship.html", destination: "/mentorship", permanent: true }
{ source: "/account.html", destination: "/account", permanent: true }
{ source: "/become-speaker.html", destination: "/become-a-speaker", permanent: true }
{ source: "/invite-expert.html", destination: "/invite-an-expert", permanent: true }
{ source: "/mentor-profile.html", destination: "/mentorship", permanent: true }
```

### DNS cutover

1. Add `embarkindia.in` to the Vercel project.
2. In Hostinger DNS, update the A record to point to Vercel's IPs.
3. Add the `www` CNAME if needed.
4. Enable HTTPS in Vercel.
5. Wait for DNS propagation and verify `https://embarkindia.in`.
6. Keep old static files in the repo root until the cutover is fully verified, then move them to `archive/`.

### Post-cutover cleanup

- Move old root `.html` files to `archive/`.
- Update root `README.md` to reflect the new architecture.
- Archive or downgrade the old Supabase project.
- Schedule the post-launch dependency upgrade sweep.

---

## 3. Docker deployment

The project now includes a full Docker Compose stack. You can use it for local development or deploy the same stack to a VPS.

### Local Docker

```bash
cd EmbarkIndia

# Create environment
cp .env.example .env

# Build images
docker compose build

# Start services
docker compose up -d

# Run migrations
docker compose --profile migrate run --rm migrate

# Seed data
docker compose --profile seed run --rm seed
```

URLs:

- Next.js app: http://localhost:3000
- Legacy static site: http://localhost:8080
- MinIO console: http://localhost:9001

See [`docker.md`](docker.md) for the complete Docker guide.

### Production Docker on a VPS

1. Provision a server with Docker and Docker Compose installed.
2. Clone the repo and create a production `.env` with real credentials.
3. Run:
   ```bash
   docker compose -f docker-compose.yml up -d --build
   docker compose --profile migrate run --rm migrate
   ```
4. Place a reverse proxy (Caddy, nginx, or Traefik) in front:
   - Route `embarkindia.in` → `web:3000`
   - Terminate TLS with Let's Encrypt.
5. Set up automated database backups.

### Recommended production path

For a Next.js app, managed services usually beat self-hosting:

- **App:** Vercel (connect `web/` directory).
- **Database:** Neon Postgres.
- **Storage:** Cloudflare R2 or AWS S3.
- **Payments:** Razorpay live keys.
- **Email:** Resend / NodeMailer / AWS SES.

Use Docker Compose primarily for **local development and staging**.
