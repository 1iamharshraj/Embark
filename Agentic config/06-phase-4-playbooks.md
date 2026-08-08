# Phase 4 — Playbooks backend

> Move the playbooks from hardcoded JS files into the database, add real progress tracking, and replace the demo checkout with Razorpay.

## Goal

Playbooks are served from the database, users can track their skill progress, and they can buy playbooks with real payments.

## Output

- `/playbooks` uses the `Playbook` table.
- `/playbook/[slug]` renders from DB and saves checklist progress per user.
- `/playbooks` shop has a real Razorpay checkout and order records.
- Admin page to view orders.

## Steps

1. **Playbook data migration**
   - Ensure all 6 stream playbooks and 15 shop playbooks are in the `Playbook` table.
   - Store the full content JSON in the `content` field so the detail page can render it without a rigid schema.
   - Add a `category` field: `interview` or `case`.
   - Add `price`, `rating`, `meta`, `tagline`, `cover` fields.

2. **Playbooks landing page**
   - Route: `/playbooks`.
   - Pull the 6 featured stream playbooks from the DB and render the shelf.
   - Pull the 15 shop playbooks from the DB and render the filterable grid.
   - Categories tabs: All, Interview, Case.
   - Sort: popular, price low/high, rating.

3. **Single playbook page**
   - Route: `/playbook/[slug]`.
   - Fetch the playbook from DB; 404 if not found.
   - Render all sections from the JSON content.
   - **Skill checklist:** load the user’s `PlaybookProgress` record, render checkboxes, save changes on toggle.
   - If the user has not purchased the playbook, show a “Buy for ₹X” CTA.
   - If the playbook is free, it is unlocked for everyone.

4. **Razorpay checkout**
   - Install `razorpay` Node SDK.
   - Create an API route: `POST /api/orders/create`.
     - Validate the user is logged in.
     - Create an `Order` record with status `pending`.
     - Create a Razorpay order with the amount (INR paise).
     - Return the Razorpay order_id + key_id + order DB id.
   - On the client, open Razorpay checkout with the order details.
   - After payment, call `POST /api/orders/verify`.
     - Validate `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` using Razorpay’s HMAC.
     - Mark the `Order` as `paid`.
     - Unlock the playbook for the user.
   - If payment fails, mark the order as `failed` and allow retry.

5. **Order management**
   - Add an `Order` page in `/account/orders` so users can see their purchases.
   - Add an admin page `/admin/orders` to list all orders and statuses.

6. **Access control**
   - Middleware or API check: when fetching a paid playbook, verify the user has a paid order for it (or is an admin).
   - For the marketing landing page, show prices and previews freely; only the full detail/checklist is gated.

7. **Verification checklist**
   - [ ] The `/playbooks` grid shows all 15 playbooks from the DB.
   - [ ] Filtering and sorting work without page reload.
   - [ ] A user can buy a playbook with a Razorpay test card.
   - [ ] After successful payment, the user can access the full playbook detail and checklist.
   - [ ] A failed payment does not unlock the playbook.
   - [ ] The skill checklist persists across page reloads and devices.
   - [ ] The admin can see the list of orders.
   - [ ] Old URLs like `/playbook.html?s=...` redirect to `/playbook/[slug]`.

## Risks / notes

- Use Razorpay test keys until the entire flow is verified; switch to live keys only after launch.
- Webhook verification is optional for MVP; polling the `/api/orders/verify` route is enough for now.
- The `Playbook.content` JSON can be large; use Prisma’s `Json` field and avoid fetching it in list views.
- If a user buys a playbook but the webhook/signature verification fails, give them a clear “payment failed, retry” path instead of leaving the order in limbo.
