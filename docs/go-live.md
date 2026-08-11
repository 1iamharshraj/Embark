# Go Live Guide — Embark India

This guide describes how to take the Embark India project from the verified local Docker setup to a public, production deployment.

---

## 1. What is already working

The project has been converted to Docker and verified locally. The following are running on your machine right now:

| URL | Service | Status |
|-----|---------|--------|
| http://localhost:3000 | Next.js 14 PWA (full stack) | ✅ Live |
| http://localhost:3000/api/health | Health + DB check | ✅ Returns `200` |
| http://localhost:3000/guest-lectures | Guest lectures landing page | ✅ Live |
| http://localhost:8080 | Legacy static HTML site | ✅ Live |
| http://localhost:9001 | MinIO console (local S3) | ✅ Live |

Verified smoke tests:

```bash
# All should return 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/competitions
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/mentorship
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/playbooks
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/playbook/marketing
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/guest-lectures
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
```

The database has been migrated and seeded with demo data (admin, student, mentors, playbooks, competitions).

---

## 2. Local stack architecture

```
┌─────────────────────────────────────────────────────────┐
│  Docker Compose (project root)                          │
│                                                         │
│   ┌────────────┐      ┌────────────┐     ┌─────────┐ │
│   │   web      │      │  postgres  │     │  minio  │ │
│   │  :3000     │      │   :5432    │     │ :9000/1 │ │
│   │  Next.js   │      │  Postgres  │     │  S3 API │ │
│   └────────────┘      └────────────┘     └─────────┘ │
│                                                         │
│   ┌────────────┐                                        │
│   │  static    │                                        │
│   │   :8080    │  nginx serving legacy HTML site         │
│   └────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

Useful commands:

```bash
# Start everything
docker compose up -d

# Run migrations (after schema changes)
docker compose --profile migrate run --rm migrate

# Seed demo data
docker compose --profile seed run --rm seed

# View logs
docker compose logs -f web

# Stop everything
docker compose down

# Stop and delete DB data
docker compose down -v
```

---

## 3. Production deployment options

Choose **one** of the three paths below. The recommended path for a Next.js app is **Option A: Vercel + managed services**.

---

### Option A: Vercel + managed services (recommended)

Best for: reliability, serverless scaling, minimal DevOps.

| Component | Service |
|-----------|---------|
| Next.js app | **Vercel** |
| Database | **Neon Postgres** (or Supabase/Render) |
| File storage | **Cloudflare R2** or AWS S3 |
| Payments | Razorpay live keys |
| Email | Resend / AWS SES / SMTP |

#### Steps

1. Push the repo to GitHub.
2. Create a Neon Postgres project and copy the connection string.
3. Configure Cloudflare R2 (or AWS S3) bucket and credentials.
4. Get live Razorpay keys from the Razorpay dashboard.
5. Sign up for an email provider (e.g., Resend) and get SMTP credentials.
6. In Vercel, import the repo and set **Root Directory** to `web/`.
7. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = `https://embarkindia.in`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `R2_ENDPOINT` (e.g., `https://<account>.r2.cloudflarestorage.com`)
   - `S3_BUCKET_NAME`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` = `auto`
   - `EMAIL_FROM`
   - `EMAIL_SERVER` (SMTP connection string)
8. Deploy.
9. Run migrations from your local machine:
   ```bash
   export DATABASE_URL="<neon-connection-string>"
   cd web
   npx prisma migrate deploy
   ```
10. Add `embarkindia.in` in Vercel project settings.
11. Update Hostinger DNS A record to Vercel's IPs.
12. Enable HTTPS in Vercel and verify.

#### DNS cutover

1. In Hostinger DNS, point `embarkindia.in` A record to Vercel IPs.
2. Add `www` CNAME to `cname.vercel-dns.com` if needed.
3. Wait for propagation.
4. After verified, keep the old static files in `archive/` or remove them.

---

### Option B: Docker on a VPS

Best for: full control, predictable cost, all-in-one server.

1. Provision a VPS (DigitalOcean, Hetzner, AWS EC2, Hostinger VPS) with Ubuntu/Debian.
2. Install Docker and Docker Compose.
3. Clone the repo.
4. Create a production `.env` with real credentials.
5. Point the domain to the server IP.
6. Run:
   ```bash
   docker compose -f docker-compose.yml up -d --build
   docker compose --profile migrate run --rm migrate
   ```
7. Put a reverse proxy in front:
   - **Caddy** (recommended for automatic HTTPS):
     ```
     embarkindia.in {
       reverse_proxy web:3000
     }
     ```
   - Or **nginx** with Let's Encrypt (Certbot).
8. Configure automated Postgres backups.
9. Set up MinIO or switch `R2_ENDPOINT` to Cloudflare R2 for persistent file storage.

> **Note:** The `docker-compose.yml` uses MinIO for local storage. On a VPS, you can keep MinIO or replace it with a managed S3-compatible service. If you keep MinIO, back up the `miniodata` volume.

---

### Option C: Hybrid (safest transition)

Best for: testing the new app without immediately cutting DNS.

1. Keep the legacy static site live on Hostinger at `embarkindia.in`.
2. Deploy the Next.js app to a staging domain on Vercel (e.g., `staging.embarkindia.in`).
3. Use Docker Compose locally for development.
4. Validate all features on staging.
5. When ready, cut DNS to Vercel (Option A).
6. Keep the `static` container as a fallback or archive.

---

## 4. Production pre-launch checklist

- [ ] Razorpay switched from test to live keys
- [ ] Email provider configured (no console-logged reset links)
- [ ] File storage configured (Cloudflare R2 / AWS S3)
- [ ] Production `DATABASE_URL` set
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] `NEXTAUTH_URL` matches the live domain
- [ ] Migrations applied to production DB
- [ ] DNS records updated
- [ ] HTTPS/TLS working
- [ ] Automated database backups configured
- [ ] `.env` is not committed to Git
- [ ] Admin user created with a strong password

---

## 5. Required information to go live

To proceed with a live deployment, provide the following for your chosen path:

| For Vercel (Option A) | For VPS (Option B) |
|-----------------------|--------------------|
| GitHub repo access | VPS IP / SSH access |
| Neon `DATABASE_URL` | Domain name |
| Cloudflare R2 / S3 credentials | SSL preference (Caddy/nginx) |
| Razorpay live key ID & secret | Email SMTP credentials |
| Email SMTP credentials | Razorpay live key ID & secret |
| Domain registrar access (Hostinger) | Backup preference |

---

## 6. Recommended next step

The local Docker stack is production-ready and fully verified. The fastest, lowest-risk path to a public launch is:

1. **Set up Vercel + Neon + Cloudflare R2**.
2. **Deploy to a staging domain first**.
3. **Cut DNS when validated**.

If you want me to do the Vercel deployment, share the credentials above and confirm the domain. If you prefer a VPS, share the server details.
