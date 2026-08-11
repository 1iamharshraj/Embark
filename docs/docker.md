# Docker Guide

Embark India can now be run entirely with Docker. This guide covers local development, production build, and deployment.

## What is containerised

| Service | Image | Purpose |
|---------|-------|---------|
| `web` | Next.js 14 standalone | The new full-stack PWA |
| `static` | nginx:alpine | Legacy static HTML site |
| `postgres` | postgres:15 | PostgreSQL database |
| `minio` | minio/minio | S3-compatible object storage (local) |

## Quick start (local)

From the project root:

```bash
# 1. Create environment file
cp .env.example .env

# 2. (Optional) generate a secure NEXTAUTH_SECRET
openssl rand -base64 32
# then paste it into .env

# 3. Build images
docker compose build

# 4. Start infrastructure + Next.js app
docker compose up -d

# 5. Run migrations
docker compose --profile migrate run --rm migrate

# 6. Seed demo data
docker compose --profile seed run --rm seed
```

After startup:

- Next.js app: http://localhost:3000
- Legacy static site: http://localhost:8080
- MinIO console: http://localhost:9001 (login: `embark` / `embark12345`)

## Local development (live reload)

To run the Next.js app in development mode with live reload:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

This mounts the `web/` source code into the container and runs `npm run dev`.

## Useful commands

```bash
# View logs
docker compose logs -f web

# Stop everything
docker compose down

# Stop and remove volumes (deletes DB data!)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Run Prisma Studio
docker compose exec web npx prisma studio

# Run verification scripts
docker compose exec web npm run verify:all

# Run in development mode
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Configuration

Settings are loaded from `.env` at the project root. Key variables:

| Variable | Local default | Production |
|----------|---------------|------------|
| `DATABASE_URL` | `postgresql://embark:embark@postgres:5432/embark?schema=public` | Neon Postgres |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://embarkindia.in` |
| `NEXTAUTH_SECRET` | generated | strong random secret |
| `R2_ENDPOINT` | `http://minio:9000` | Cloudflare R2 or AWS S3 |
| `S3_BUCKET_NAME` | `embark-india` | your bucket |
| `AWS_ACCESS_KEY_ID` | `embark` | service account key |
| `AWS_SECRET_ACCESS_KEY` | `embark12345` | service account secret |
| `RAZORPAY_KEY_ID` | empty | live/test Razorpay key |
| `EMAIL_SERVER` | empty | SMTP server |

## MinIO local storage

MinIO runs on port `9000` (API) and `9001` (console). The default credentials are:

- Access key: `embark`
- Secret key: `embark12345`

The app expects a bucket named `embark-india`. MinIO will create it on first use if configured.

## Production deployment with Docker

You have two main options:

### Option A: Docker on a VPS (single host)

1. Provision a server (e.g., DigitalOcean, Hetzner, AWS EC2, Hostinger VPS).
2. Install Docker and Docker Compose.
3. Clone the repo.
4. Create a production `.env` with real credentials.
5. Run `docker compose -f docker-compose.yml up -d --build`.
6. Place a reverse proxy (nginx/Caddy/Traefik) in front for HTTPS:
   - Route `embarkindia.in` → `web:3000`
   - Route `static.embarkindia.in` or `embarkindia.in/archive` → `static:80`
7. Use Let's Encrypt for TLS.

### Option B: Vercel + managed services (recommended for Next.js)

1. Keep the Next.js app on Vercel (connect `web/` directory).
2. Use Neon for Postgres.
3. Use Cloudflare R2 or AWS S3 for storage.
4. Use Resend/NodeMailer for email.
5. Use Razorpay live keys.
6. The root `docker-compose.yml` then becomes your local dev environment only.

### Option C: Hybrid (current safest path)

1. Use Docker Compose for **local development and staging**.
2. Deploy the production Next.js app to **Vercel**.
3. Keep the legacy static site on **Hostinger** until DNS cutover.
4. After DNS cutover, serve the static archive from `static` container or S3.

## Files added for Docker

| File | Purpose |
|------|---------|
| `web/Dockerfile` | Multi-stage production build for Next.js |
| `web/.dockerignore` | Reduces build context |
| `web/docker-compose.yml` | Standalone web stack |
| `Dockerfile.static` | nginx container for legacy site |
| `nginx-static.conf` | nginx config for static site |
| `docker-compose.yml` | Full orchestration (root) |
| `.env.example` | Template for root `.env` |
| `.dockerignore` | Root context exclusions |
| `web/app/api/health/route.ts` | Health check endpoint used by Docker |

## Troubleshooting

### Build fails on `npm ci`

Make sure you are building from a clean context. If `node_modules` is huge, `.dockerignore` should exclude it. Run `docker compose build --no-cache` if a dependency changed.

### "Cannot find module @prisma/client"

Run `docker compose exec web npx prisma generate`.

### Database connection errors

Ensure the `DATABASE_URL` uses `postgres` as the hostname when running inside Docker Compose. The default `.env` already does this.

### MinIO bucket does not exist

Create the bucket manually in the MinIO console or configure the app to auto-create it.

### "libcairo.so.2: No such file or directory" during build

The `canvas` package is a native Node module. The Dockerfile installs the required runtime libraries (`libcairo2`, `libpango`, etc.) in both the **builder** and **runner** stages so the module can compile and load.

### Prisma engine errors (libssl / "engines do not seem to be compatible")

The web Dockerfile uses `node:22-bookworm-slim` (Debian) because Prisma's query engine needs a glibc-based environment. Both the **builder** and **runner** stages install `openssl` and `ca-certificates`, so Prisma detects the OpenSSL 3.x binary target at generate time and the correct `libssl3` libraries are available at runtime. If you see `libssl.so.1.1: cannot open shared object file`, the builder stage is missing `openssl`; make sure the Dockerfile installs it before `npx prisma generate`.

### Static generation tries to query the database and fails

Pages that read from Prisma during render (home, competitions, mentorship, playbooks, and `/api/competitions`) are marked with `export const dynamic = "force-dynamic"` so they are rendered on request instead of at build time. This lets the Docker image build without a live database.

### Health check fails

The web container waits for Postgres and MinIO to be healthy before starting. Check logs with `docker compose logs web`.

## Security notes

- Change `NEXTAUTH_SECRET`, MinIO credentials, and AWS credentials in production.
- Do not commit `.env` to Git.
- Keep `web/.env.example` and `.env.example` updated when adding new variables.
- In production, put the `web` container behind a reverse proxy that terminates TLS.
