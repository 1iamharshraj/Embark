# 10. Phase 5 --- Calendar, Availability & Meetings

## Objective

Build a reliable scheduling engine.

------------------------------------------------------------------------

# 10.1 Expert Availability

Expert configures:

-   Working days
-   Working hours
-   Timezone
-   Buffer time
-   Blocked dates

Example:

``` text
Monday
10:00–18:00

Tuesday
10:00–18:00

Wednesday
Unavailable
```

------------------------------------------------------------------------

# 10.2 Service-Level Availability

A service can override general availability.

Example:

``` text
Expert:
Mon–Fri

Consulting Session:
Mon/Wed

Resume Review:
Tue/Thu
```

------------------------------------------------------------------------

# 10.3 Calendar Integration

Initial integration:

-   Google Calendar

Read busy events.

Prevent bookings during:

-   Meetings
-   Events
-   Blocked slots

------------------------------------------------------------------------

# 10.4 Booking Slots

Example:

``` text
10:00–10:30
10:45–11:15
11:30–12:00
```

based on:

-   Duration
-   Buffer
-   Availability
-   Existing bookings
-   External calendar events

------------------------------------------------------------------------

# 10.5 Meeting Settings

Support:

-   Google Meet
-   Zoom
-   Custom meeting URL

------------------------------------------------------------------------

# 10.6 Double Booking Prevention

Use:

-   PostgreSQL transactions
-   Row-level locking where appropriate
-   Redis locks where required

Database remains the source of truth.

------------------------------------------------------------------------

# 10.7 Booking Lifecycle

``` text
PENDING_PAYMENT
CONFIRMED
RESCHEDULE_REQUESTED
RESCHEDULED
CANCELLED
NO_SHOW
IN_PROGRESS
COMPLETED
REFUNDED
```

------------------------------------------------------------------------

# 10.8 Cancellation & Rescheduling

Support:

-   Cancellation policy
-   Reschedule
-   Refund rules
-   Partial refund where configured

## Exit Criteria

-   Availability works.
-   Calendar integration works.
-   Slots are correctly generated.
-   Double booking is prevented.
-   Meeting links are associated with bookings.
-   Rescheduling/cancellation works.

------------------------------------------------------------------------

