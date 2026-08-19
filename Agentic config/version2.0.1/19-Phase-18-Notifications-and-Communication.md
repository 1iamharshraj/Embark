# 23. Phase 18 --- Notifications & Communication

## Objective

Build reliable communication infrastructure.

------------------------------------------------------------------------

# 23.1 Email

Use Resend.

Events:

-   Welcome
-   Verification
-   Password reset
-   Booking confirmation
-   Booking reminder
-   Payment confirmation
-   Priority DM received
-   Priority DM response
-   Package purchase
-   Hackathon registration
-   Submission confirmation
-   Submission deadline
-   Results
-   Certificate issued

------------------------------------------------------------------------

# 23.2 In-App Notifications

Notification center:

-   Title
-   Message
-   Type
-   Read/unread
-   Related entity
-   Timestamp

------------------------------------------------------------------------

# 23.3 WhatsApp

Optional transactional integration:

-   Booking confirmation
-   Booking reminder
-   Hackathon deadline
-   Result announcement

Use Meta WhatsApp Business API or Gupshup.

------------------------------------------------------------------------

# 23.4 Background Jobs

Use:

``` text
Redis + BullMQ
```

Jobs:

-   Email
-   WhatsApp
-   Reminders
-   Certificate generation
-   Payment reconciliation
-   Payout jobs
-   Cleanup

## Exit Criteria

-   Email events work.
-   In-app notifications work.
-   Critical reminders are queued.
-   Failed jobs can be retried.
-   Notification delivery is observable.

------------------------------------------------------------------------

