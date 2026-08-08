This is a [Next.js](https://nextjs.org) 14 project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Run locally

Prerequisites: Node.js 20+, Docker with Docker Compose, and a local PostgreSQL instance.

```bash
# 1. Start the database
docker compose up -d

# 2. Apply Prisma migrations and generate the client
npx prisma migrate dev

# 3. Seed the database with sample users, competitions, playbooks, mentors, etc.
npx prisma db seed

# 4. Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Default logins

| Role | Email | Password |
|------|-------|----------|
| Admin | `ajay.san36@gmail.com` | `admin123` |
| Student | `student@embark.local` | `student123` |

### Verification scripts

```bash
npm run verify          # Phase 0: DB sanity
npm run verify:phase1   # Phase 1: routes and PWA files
npm run verify:phase2   # Phase 2: auth, profile, password reset
npm run verify:phase3   # Phase 3: competitions
npm run verify:phase4   # Phase 4: playbooks and orders
npm run verify:phase5   # Phase 5: mentorship and guest lectures
npm run verify:phase6   # Phase 6: PWA assets and production build
npm run verify:all      # Phase 7: full end-to-end QA
npm run verify:security # Phase 7: admin/security checks
```

## Build for production

```bash
npx tsc --noEmit
npm run build
```

See [`QA-NOTES.md`](./QA-NOTES.md) for the latest audit results, known limitations, and launch backlog.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app).

Check out [the Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
