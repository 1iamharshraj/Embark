# API Reference

This document covers the API routes in the Next.js app (`web/app/api/`). The legacy static site talks directly to Supabase from the browser, so it does not have separate API routes.

## Auth

### `POST /api/auth/[...nextauth]`

NextAuth.js catch-all route. Supports credentials sign-in/sign-out and session management.

### `POST /api/auth/register`

Create a new account.

**Body:**
```json
{
  "name": "Ajay",
  "email": "ajay@example.com",
  "password": "securepass",
  "college": "FMS Delhi"
}
```

**Behavior:**
- Hashes password with bcrypt.
- Sets `isAdmin: true` for `ajay.san36@gmail.com` or `admin@embark.local`.
- Returns the created user or an error message.

### `POST /api/auth/reset-password`

Request a password reset.

**Body:**
```json
{ "email": "ajay@example.com" }
```

**Behavior:**
- Creates a single-use token in `PasswordResetToken` valid for 1 hour.
- Logs the reset link to console in development.
- In production should send email via SMTP.

### `POST /api/auth/set-password`

Set a new password using a reset token.

**Body:**
```json
{
  "token": "...",
  "password": "newpass"
}
```

### `POST /api/auth/verify-reset-token`

Validate a reset token.

**Body:**
```json
{ "token": "..." }
```

## Account

### `PATCH /api/account/profile`

Update name and college.

**Body:**
```json
{
  "name": "Ajay S",
  "college": "IIM Calcutta"
}
```

### `POST /api/account/change-password`

Change current password.

**Body:**
```json
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

## Competitions (public)

### `GET /api/competitions`

Returns list of non-draft competitions.

### `GET /api/competitions/[id]`

Returns a single competition by ID.

### `POST /api/competitions/[id]/register`

Register the current user for a competition.

**Body:**
```json
{
  "teamName": "Team Alpha",
  "members": [
    { "name": "Ajay", "email": "ajay@example.com", "college": "FMS Delhi" }
  ]
}
```

**Rules enforced:**
- User must be authenticated.
- Competition must be free (`fee === 0`).
- Registration must be within `regOpen` and `regClose`.
- Team size must be between `teamMin` and `teamMax`.
- User's college must be in `institutes` if `institutes` is non-empty.

### `POST /api/competitions/[id]/submit`

Submit for a round.

**Body:** multipart/form-data
- `roundIdx` (number)
- `link` (optional string)
- `note` (optional string)
- `file` (optional file)

**Rules:**
- Must be registered.
- Round window must be open.
- Must have advanced from the previous round (unless round 0).

### `GET /api/submissions/[id]/download`

Returns a signed redirect URL to download a submission file.

### `POST /api/competitions/[id]/certificate`

Generates a participation or winner certificate PNG.

**Body:**
```json
{ "type": "participation" | "winner", "rank": 1 }
```

## Playbooks

### `GET /api/playbooks/access`

Returns map of playbook slugs the current user has access to.

### `GET /api/playbooks/[slug]/access`

Returns whether the current user can access this playbook.

### `GET /api/playbooks/[slug]/progress`

Returns the user's saved checklist progress.

### `POST /api/playbooks/[slug]/progress`

Save checklist progress.

**Body:**
```json
{ "checked": [0, 3, 5] }
```

## Orders & Payments

### `POST /api/orders/create`

Creates a Razorpay order.

**Body:**
```json
{
  "type": "playbook" | "mentorship",
  "playbookId": "...",
  "bookingRequestId": "..."
}
```

**Response:**
```json
{
  "orderId": "razorpay_order_id",
  "amount": 49900,
  "currency": "INR",
  "keyId": "rzp_test_..."
}
```

### `POST /api/orders/verify`

Verifies Razorpay payment signature and marks order as paid.

**Body:**
```json
{
  "orderId": "...",
  "paymentId": "...",
  "signature": "..."
}
```

## Mentorship

### `POST /api/mentorship/book`

Create a mentorship booking request.

**Body:**
```json
{
  "mentorId": "...",
  "topic": "FMCG summer prep"
}
```

## Guest lectures

### `POST /api/speaker-applications`

Apply to become a speaker.

**Body:**
```json
{
  "name": "...",
  "email": "...",
  "role": "...",
  "company": "...",
  "linkedIn": "...",
  "experience": "...",
  "vertical": "...",
  "format": "...",
  "topics": "..."
}
```

### `POST /api/lecture-requests`

Request a guest lecture.

**Body:**
```json
{
  "institute": "...",
  "name": "...",
  "email": "...",
  "phone": "...",
  "vertical": "...",
  "engagement": "...",
  "format": "...",
  "dates": "...",
  "audienceSize": "...",
  "budget": "...",
  "message": "..."
}
```

## Admin

All `/api/admin/*` routes require an authenticated admin session.

### Competitions

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/competitions` | GET | List all competitions including drafts |
| `/api/admin/competitions` | POST | Create competition |
| `/api/admin/competitions/[id]` | GET | Get full competition |
| `/api/admin/competitions/[id]` | PATCH | Update competition |
| `/api/admin/competitions/[id]` | DELETE | Delete competition |
| `/api/admin/competitions/[id]/unpublish` | POST | Toggle draft status |
| `/api/admin/competitions/[id]/winners` | POST | Save winners |

Advancements are managed via `/api/admin/competitions/[id]` PATCH or a dedicated advancement endpoint (implementation detail in `ProgressPageClient`).

### Mentorship

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/mentorship` | GET | List booking requests |
| `/api/admin/mentorship/[id]` | PATCH | Update status |
| `/api/admin/mentorship/[id]` | POST | Add admin note or confirm |

### Speaker applications

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/speaker-applications` | GET | List applications |
| `/api/admin/speaker-applications/[id]` | PATCH | Update status |
| `/api/admin/speaker-applications/[id]` | POST | Add note |

### Lecture requests

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/lecture-requests` | GET | List requests |
| `/api/admin/lecture-requests/[id]` | PATCH | Update status |
| `/api/admin/lecture-requests/[id]` | POST | Add note |

### Orders

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/orders` | GET | List all orders |
| `/api/admin/orders/[id]` | PATCH | Update order status |

## Uploads

### `GET /api/uploads/[...path]`

Serves a locally stored file (development fallback). In production, files are served directly from R2/S3 signed URLs.

## Development helpers

### `GET /api/dev/reset-tokens`

Returns reset tokens. **Only available in `development`**. Returns 404 in production.
