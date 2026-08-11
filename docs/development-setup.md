# Development Setup

This guide covers running the Next.js app locally. The static site has no build step — just open the `.html` files in a browser or serve with any static server.

## Prerequisites

- Node.js 18+
- npm
- Docker (for local Postgres)
- Git

## 1. Clone and enter the project

```bash
git clone https://github.com/NarentherMS/EmbarkIndia.git
cd EmbarkIndia/web
```

## 2. Install dependencies

```bash
npm install
```

This runs `prisma generate` automatically via the `postinstall` script.

## 3. Start local Postgres

```bash
docker-compose up -d
```

This starts PostgreSQL 15 on port `5432` with:
- user: `embark`
- password: `embark`
- database: `embark`

## 4. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://embark:embark@localhost:5432/embark?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-secret-change-in-production"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

For local development you do not need R2/S3 credentials; the app falls back to local file storage.

Generate a secure secret:

```bash
openssl rand -base64 32
```

## 5. Run migrations

```bash
npx prisma migrate dev
```

This applies all migrations and creates the database if it does not exist.

## 6. Seed the database

```bash
npm run db:seed
```

This creates admin, test users, competitions, playbooks, mentors, sample requests, and orders.

## 7. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## 8. Run verification scripts

```bash
# Type check
npx tsc --noEmit

# Build check
npm run build

# Phase checks
npm run verify
npm run verify:phase1
npm run verify:phase2
npm run verify:phase3
npm run verify:phase4
npm run verify:phase5
npm run verify:phase6

# Full integration test
npm run verify:all

# Security checks
npm run verify:security
```

## Static site local preview

Since the static site has no build step, you can preview it with any static server:

```bash
cd EmbarkIndia
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

> **Important:** Supabase calls require the public anon key in `js/db.js`, so the competitions/account pages will work as long as you have internet access.

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database |
| `npm run verify:all` | Full verification suite |
| `npx prisma studio` | Open Prisma Studio |
| `npx prisma migrate dev` | Run migrations in dev |
| `npx prisma migrate deploy` | Run migrations in production |

## Common issues

### `prisma: command not found`

Re-run `npm install` or use `npx prisma`.

### Port 5432 already in use

Stop the existing Postgres container or change the port mapping in `docker-compose.yml`.

### Images not loading in local storage mode

Make sure the app is served through the Next.js dev server; local uploads are served via `/api/uploads/[...path]`.

### Razorpay "test mode" issues

Use Razorpay test keys. For local verification scripts, the app may bypass signature validation in test mode.
