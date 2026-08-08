# Migration Scripts

This folder contains verification and migration scripts for the Embark India Next.js app.

## `migrate-supabase.ts`

One-way, idempotent migration from the legacy Supabase backend to the new Neon/Prisma backend.

### What it migrates

- **Users** — creates new Prisma users with a random hashed password. Migrated users must reset their password before logging in.
- **Competitions** — uses the old Supabase `id` as the new stable `id` in the Prisma schema.
- **Registrations** — maps old registration ids to new CUIDs.
- **Submissions** — recreates submissions and copies any attached files from Supabase Storage to the configured storage backend (R2 in production, local disk in dev).
- **Advancements** and **Winners** — recreated with new CUIDs.

### How to run

Option 1 — live Supabase connection:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
npm run migrate:supabase
```

Option 2 — local JSON dump:

```bash
export DUMP_PATH="/path/to/supabase-dump.json"
npm run migrate:supabase
```

The dump JSON should contain keys for: `users`, `profiles`, `competitions`, `registrations`, `submissions`, `advancements`, `winners`.

### Notes

- The script is **non-destructive**. It skips rows that already exist or would conflict.
- Migrated users get a random password. Tell them to use the password-reset flow.
- Run this only after deploying the new app and running `npx prisma migrate deploy`.
