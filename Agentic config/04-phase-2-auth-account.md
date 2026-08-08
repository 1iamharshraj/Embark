# Phase 2 — Auth + account

> Make the auth system real and build the student account dashboard.

## Goal

Users can create accounts, sign in, reset their password, update their profile, and see their competitions on a dedicated account page.

## Output

- `/login`, `/register`, `/reset-password`, `/set-password` routes.
- `/account` dashboard with profile form, password form, and “My competitions”.
- Admin-only access protected for all `/admin/*` routes.

## Steps

1. **Register page**
   - Route: `/register`.
   - Fields: name, email, college, password, confirm password.
   - Validate with Zod.
   - On submit, hash the password with `bcrypt.hash`, create the user in Prisma.
   - If the email matches the founder/admin list, set `isAdmin = true`.
   - Auto-sign in after registration (or redirect to login with a success message).

2. **Login page**
   - Route: `/login`.
   - Fields: email, password.
   - Use NextAuth Credentials provider.
   - Show clear error messages for wrong password / unregistered email.

3. **Password reset flow**
   - Route: `/reset-password` — accepts email, generates a short-lived token.
   - Store token in a new `PasswordResetToken` table (or add `resetToken`/`resetExpires` to `User`).
   - In local dev, print the reset link to the console or use a simple dev route.
   - In production, send email via Resend / Nodemailer.
   - Route: `/set-password?token=...` — validates token, allows setting a new password.

4. **Account page**
   - Route: `/account` (protected).
   - **Profile card:** name, email, college. Save updates with `update` Prisma call.
   - **Password card:** change password (current password + new password).
   - **My competitions:** query `Registration` for the logged-in user, join `Competition`, show status (Live / Upcoming / Closed), link to competition detail.
   - If the user is an admin, show an “Admin console” button.

5. **Middleware and route guards**
   - `middleware.ts`:
     - Redirect unauthenticated users from `/account` and `/admin` to `/login`.
     - Redirect non-admin users from `/admin` to `/account`.
   - Use `getServerSession` (or Auth.js `auth()` helper) in server components and API routes.

6. **Nav state**
   - Update `Nav.tsx` to show “My account” / “Sign out” when logged in, or “Sign in” when not.
   - Fetch the session in the layout or nav via a server component.

7. **Verification checklist**
   - [ ] A new user can register with email/password.
   - [ ] The new user can log in.
   - [ ] The new user can update their name and college.
   - [ ] The new user can change their password and log in again with the new password.
   - [ ] The admin user sees an admin link; the student user does not.
   - [ ] A non-logged-in user hitting `/account` is redirected to `/login`.
   - [ ] A student hitting `/admin` is redirected to `/account`.
   - [ ] “My competitions” shows seeded competitions after a test registration is created manually.

## Risks / notes

- Email sending is not needed for local dev. Keep the reset flow simple: a dev-only route that lists tokens.
- In production, verify the email domain is configured for SPF/DKIM before sending reset emails.
- Consider adding an “email already registered” check with a friendly message instead of a generic error.
