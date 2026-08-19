# 8. Phase 3 --- Expert Hub / Expert Business OS

## Objective

Build the expert dashboard where an expert manages their entire Embark
business.

The Expert Hub should not be a simple booking dashboard.

It should function as:

> **Expert Business OS**

Navigation:

``` text
MANAGE
  Overview
  Bookings
  Priority DMs
  Services
  Packages
  Students

YOUR PAGE
  Public Profile
  Appearance
  Testimonials
  FAQs
  Preview

BUSINESS
  Calendar
  Earnings
  Payouts
  Analytics

ACCOUNT
  Settings
  Notifications
  Security
```

------------------------------------------------------------------------

# 8.1 Expert Overview

Dashboard KPIs:

-   Sessions
-   Students helped
-   Revenue
-   Rating
-   Active services

Profile completion:

``` text
80% complete
```

Checklist:

-   Profile
-   Verification
-   Services
-   Availability
-   Calendar
-   Payouts
-   Testimonials

------------------------------------------------------------------------

# 8.2 Today's Activity

Show:

-   Today's bookings
-   Upcoming meetings
-   Pending Priority DMs
-   Package activity

Actions:

-   Join meeting
-   View booking
-   Respond to DM

------------------------------------------------------------------------

# 8.3 Expert Onboarding

Guided wizard:

``` text
Account
 ↓
Professional Profile
 ↓
Verification
 ↓
First Service
 ↓
Availability
 ↓
Calendar
 ↓
Payouts
 ↓
Publish Page
```

Expert is considered activated only when:

-   Profile complete
-   At least one service
-   Availability configured
-   Calendar connected
-   Payouts configured
-   Public page published

------------------------------------------------------------------------

# 8.4 Expert Status

``` text
DRAFT
PENDING_VERIFICATION
VERIFIED
ACTIVE
PAUSED
SUSPENDED
REJECTED
```

Expert can pause new bookings.

Existing bookings remain available.

## Exit Criteria

-   Expert Hub is functional.
-   Onboarding wizard works.
-   Profile completion works.
-   Dashboard displays live business data.
-   Expert can pause/resume services.
-   Navigation and permissions are implemented.

------------------------------------------------------------------------

