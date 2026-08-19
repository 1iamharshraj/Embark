# 13. Phase 8 --- Payments, Earnings & Payouts

## Objective

Implement the complete financial system.

------------------------------------------------------------------------

# 13.1 Payment Gateway

Use Razorpay.

Support:

-   UPI
-   Cards
-   Net banking
-   Payment verification
-   Refunds
-   Webhooks

------------------------------------------------------------------------

# 13.2 Payment Flow

``` text
Order Created
 ↓
Payment Initiated
 ↓
Payment Authorized
 ↓
Payment Captured
 ↓
Webhook Verification
 ↓
Order Paid
```

Frontend success alone must never mark an order as paid.

------------------------------------------------------------------------

# 13.3 Commission

Commission must be configurable.

Example:

``` text
Customer pays ₹1,000
Platform fee = ₹100
Expert earning = ₹900
```

Admin can configure:

-   Default commission
-   Expert-specific commission
-   Category-specific commission
-   Promotional commission

------------------------------------------------------------------------

# 13.4 Earnings Dashboard

Show:

-   Total earnings
-   Monthly revenue
-   Pending
-   Available balance
-   Withdrawn
-   Refunds
-   Platform fees

------------------------------------------------------------------------

# 13.5 Revenue by Product

``` text
1:1 Sessions     ₹18,000
Priority DM       ₹4,200
Packages          ₹6,200
```

------------------------------------------------------------------------

# 13.6 Payouts

Show:

-   Amount
-   Date
-   Status
-   Reference
-   Destination

Statuses:

``` text
PENDING
PROCESSING
COMPLETED
FAILED
```

## Exit Criteria

-   Razorpay payments work.
-   Webhooks work.
-   Refunds work.
-   Commission calculation works.
-   Expert earnings are correct.
-   Payout lifecycle works.
-   Financial records are auditable.

------------------------------------------------------------------------

