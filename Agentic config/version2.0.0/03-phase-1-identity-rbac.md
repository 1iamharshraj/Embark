# Phase 1 — Identity & RBAC

> Replace the single `isAdmin` boolean with a full role and permission system, add Google OAuth, refresh tokens, and route guards without changing existing UI.

## Goal

Users have roles and permissions. The session carries enough data for middleware and API guards. Admin routes and all new domain routes are protected by permission checks. Existing pages keep working exactly as before.

## Output

- `User`, `Role`, `Permission`, `UserRole`, `RolePermission` tables populated (`web/prisma/schema.prisma`).
- NextAuth session extended with `roles` and `permissions` arrays (`web/types/next-auth.d.ts`).
- Google OAuth provider added (credentials still work) (`web/lib/authOptions.ts`).
- Refresh token rotation implemented (`web/lib/authOptions.ts`, `web/app/api/v1/auth/refresh/route.ts`).
- Middleware protecting `/(student)`, `/(expert)`, `/(admin)` route groups (`web/middleware.ts`).
- API helpers: `requireAuth`, `hasPermission`, `requireRole`, `requirePermission`, `requireResourceOwner`, `refreshUserPermissions`, `checkPagePermission` (`web/lib/rbac.ts`).
- Admin role management UI at `/admin/roles`, `/admin/roles/new`, `/admin/roles/[id]/edit`, `/admin/permissions` and `/admin/users`.
- Existing admin routes migrated from `isAdmin` checks to `requirePermission` checks.
- Legacy admin permissions (`competition.*`, `order.*`, `mentorship.*`, `lecture.*`, `speaker.*`, `dashboard.*`) added to the seed catalogue (`web/prisma/seed.ts`).

## Steps

1. **Extend NextAuth config**
   - Add Google provider in `web/app/api/auth/[...nextauth]/route.ts`.
   - Add `Account`, `Session`, `VerificationToken` Prisma models for OAuth.
   - Update JWT and session callbacks to fetch roles/permissions from the DB.

2. **Refresh token strategy**
   - Add `RefreshToken` model with `token`, `userId`, `expiresAt`, `revokedAt`.
   - Issue refresh token as `httpOnly` secure cookie on login.
   - Create `/api/v1/auth/refresh` to rotate access tokens.
   - Revoke all user refresh tokens on "logout from all devices".

3. **Role/permission seeding**
   - Seed all system roles and permissions listed in `14-data-model.md`.
   - Assign existing admin users to `Super Admin`.
   - Assign all non-admin users to `Student`.
   - Create a migration script to backfill `UserRole` rows from current `User.isAdmin`.

4. **Route protection middleware**
   - Create/update `web/middleware.ts`.
   - Protect route groups:
     - `/student/*` → requires `student` role or relevant permission.
     - `/expert/*` → requires `expert` role or relevant permission.
     - `/admin/*` → requires admin role with matching permission.
   - Redirect unauthenticated users to `/login`.
   - Redirect unauthorized users to `/account`.

5. **API authorization helpers**
   - `requireAuth(req)` → returns authenticated user with roles/permissions.
   - `requireRole(user, 'Admin')` → throws 403 if missing.
   - `requirePermission(user, 'expert.verify')` → throws 403 if missing.
   - `requireResourceOwner(user, resourceUserId)` → throws 403 if not owner/admin.

6. **Role and permission admin UI**
   - `/admin/roles` — list, create, edit, delete custom roles.
   - `/admin/roles/new` and `/admin/roles/[id]/edit` — role form with permission checkboxes.
   - `/admin/permissions` — read-only list of all permissions.
   - `/admin/users/[id]/roles` — assign/remove roles from a user.
   - Use existing admin layout; add a Roles link in admin nav.

7. **Update existing admin routes**
   - Replace `isAdmin` checks with `requirePermission` calls.
   - Keep existing admin UI unchanged.

8. **Verification checklist**
   - [x] `npm run build` passes with all admin, RBAC and refresh-token code compiled.
   - [x] Existing users can still log in with email/password (credentials provider unchanged).
   - [ ] A user can log in with Google OAuth (requires `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`).
   - [x] Session contains `roles` and `permissions`.
   - [x] A non-admin hitting `/admin/*` is redirected to `/account` (middleware + page guards).
   - [x] A student can access `/student/*` but not `/expert/*` or `/admin/*` (middleware).
   - [x] Admin can create a custom role, assign permissions, and assign it to a user (`/admin/roles`, `/admin/users`).
   - [x] API routes reject requests without required permissions (`requireAuth` + `requirePermission`).
   - [x] Refresh token rotation works; endpoint at `/api/v1/auth/refresh` validates and issues access tokens.
   - [x] Sign-out revokes refresh tokens via the NextAuth `signOut` event.
   - [x] Migration backfills roles for existing users without data loss (`User.isAdmin` still grants full access via `hasPermission`).

## Risks / notes

- NextAuth.js v4 has limited native refresh token support. Document the custom cookie/session strategy clearly.
- Google OAuth requires verified domain and privacy policy before production.
- Keep the existing `User.isAdmin` boolean until all admin routes are migrated, then deprecate it.
- Do not hard-code role checks in UI; always derive from session permissions.
