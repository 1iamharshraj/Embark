# Phase 4 — Payments, Commissions & Wallet

> Wire Razorpay into the marketplace, add commission config, expert wallet, and payout requests. Payments are verified server-side and financial records are immutable.

## Goal

Every paid booking, DM, and package purchase goes through Razorpay. The platform calculates commission, credits the expert wallet, and supports refund and payout flows. Existing playbook purchase flow is migrated to the new generic `Order` system.

## Output

- Generic `Order` model supports bookings, DMs, packages, hackathon fees, and playbooks.
- Razorpay order creation, checkout, signature verification, and webhook handling.
- Commission configuration: default, expert-specific, category-specific, promotional.
- Expert wallet with transaction history.
- Payout request flow (expert requests, admin approves).
- Admin payment views: `/admin/payments/transactions`, `/admin/payments/refunds`, `/admin/payments/payouts`, `/admin/payments/commissions`.
- APIs: `/api/v1/orders`, `/api/v1/payments`, `/api/v1/payments/webhook`, `/api/v1/refunds`, `/api/v1/wallet`, `/api/v1/payouts`.

## Steps

1. **Generic order model**
   - Extend `Order` from existing `playbook` orders to support `type`: `BOOKING`, `PRIORITY_DM`, `PACKAGE`, `HACKATHON_FEE`, `PLAYBOOK`.
   - Add `relatedId` field pointing to the relevant record.
   - Migrate existing playbook orders to new `Order` records.

2. **Razorpay order creation**
   - `POST /api/v1/orders` — validates user is logged in, creates `Order` (pending), creates Razorpay order, returns `order_id`, `key_id`, and DB order ID.
   - Use amount in paise and currency `INR`.

3. **Checkout and verification**
   - Reuse existing Razorpay checkout button component.
   - After payment, call `POST /api/v1/payments/verify`.
   - Verify `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` using HMAC.
   - Mark `Order` as `PAID`, create `Payment` record, and trigger service unlock.

4. **Webhook handler**
   - `POST /api/v1/payments/webhook` — verify Razorpay webhook signature.
   - Handle `payment.captured`, `payment.failed`, `refund.processed` events.
   - Update order/payment records idempotently.

5. **Commission engine**
   - `PlatformConfig` table stores default commission rate.
   - Support overrides: expert-specific, category-specific, promotional.
   - On payment captured, create `Commission` record splitting order amount into platform fee and expert earnings.
   - Credit expert wallet via `WalletTransaction` (type `CREDIT`).

6. **Service unlock after payment**
   - Booking: status `PENDING_PAYMENT` → `CONFIRMED`.
   - Priority DM: status `PENDING_PAYMENT` → `PAID` → `ASSIGNED`.
   - Package purchase: create `PackagePurchase` with `ACTIVE`.
   - Playbook: unlock access (existing behavior, now via generic order).

7. **Expert wallet**
   - `/expert/wallet` — dashboard showing available balance, pending, withdrawn, gross.
   - `GET /api/v1/wallet` — transaction history.
   - Wallet balance computed from `WalletTransaction` sum for the user.

8. **Refund flow**
   - Admin can initiate refund from `/admin/payments/transactions/[id]/refund`.
   - Create `Refund` record (pending), call Razorpay refund API, update on webhook.
   - Debit expert wallet if already credited (type `DEBIT`).

9. **Payout flow**
   - Expert requests payout from `/expert/wallet/payout`.
   - Captures bank/UPI details.
   - Admin reviews in `/admin/payments/payouts` and marks approved/rejected.
   - On approval, create `Payout` record and debit wallet.
   - Manual bank/UPI transfer outside system initially; automate via RazorpayX later.

10. **Admin payment views**
    - `/admin/payments/transactions` — all orders/payments.
    - `/admin/payments/refunds` — refund management.
    - `/admin/payments/payouts` — payout requests.
    - `/admin/payments/commissions` — commission rules config.

11. **Verification checklist**
    - [ ] A student can pay for a booking with Razorpay test card.
    - [ ] After payment, booking status becomes `CONFIRMED`.
    - [ ] Order, Payment, and Commission records are created.
    - [ ] Expert wallet is credited with earnings minus platform fee.
    - [ ] A student can pay for a priority DM; status becomes `PAID`.
    - [ ] A student can pay for a package; `PackagePurchase` becomes `ACTIVE`.
    - [ ] Webhook updates order status correctly.
    - [ ] Failed payment does not unlock service.
    - [ ] Admin can configure commission rate.
    - [ ] Admin can initiate a refund; wallet is debited.
    - [ ] Expert can request a payout; admin can approve it.
    - [ ] Existing playbook purchases still work via generic order flow.

## Risks / notes

- Financial records must be append-only. Never delete or update `Order`, `Payment`, `Commission`, `WalletTransaction` rows; create corrective records.
- Use database transactions to ensure order status, payment, commission, and wallet updates are atomic.
- Commission rates must be configurable; do not hard-code.
- Razorpay live keys require KYC; keep test keys until launch.
- Payout automation may require RazorpayX or manual bank transfer for MVP.
