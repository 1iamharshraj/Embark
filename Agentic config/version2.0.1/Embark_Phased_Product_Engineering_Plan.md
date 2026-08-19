# EMBARK --- Phased Product & Engineering Implementation Plan

**Product:** Embark\
**Focus:** Tier-2 Business School / MBA ecosystem\
**Document:** Phased implementation plan\
**Version:** 1.0

------------------------------------------------------------------------

## 1. Product Overview

Embark is a career-development and expert marketplace platform focused
initially on Tier-2 business-school / MBA students and the ecosystem
around them.

The platform has two primary product pillars:

### A. Expert Marketplace

Students can discover and pay verified experts for:

-   1:1 sessions
-   Priority DMs
-   Packages

Experts receive an **Expert Hub** where they can operate their
professional profile and manage their services, calendar, meetings,
students, reviews, earnings and analytics.

### B. Hackathon Platform

Embark's client can host structured hackathons where participants can:

-   Discover hackathons
-   Register
-   Create or join teams
-   Work on challenges
-   Submit solutions
-   Track submission status
-   Receive manual evaluation
-   View results
-   Receive certificates
-   Verify certificates publicly

The two pillars should reinforce each other:

> **Hackathons acquire students → mentorship monetizes student intent →
> achievements build trust and retention.**

------------------------------------------------------------------------

# 2. Product Vision

Embark should enable students to:

> **Discover → Learn → Practice → Prove → Connect → Advance**

Mentorship provides:

-   Learn
-   Connect

Hackathons provide:

-   Practice
-   Prove

Certificates and the student profile provide:

-   Credibility

The expert marketplace provides:

-   Monetization for people with relevant experience

------------------------------------------------------------------------

# 3. Recommended Technology Stack

## Frontend

-   Next.js 15+
-   TypeScript
-   App Router
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   Zod
-   TanStack Query

## Backend

-   NestJS
-   TypeScript
-   REST API
-   Swagger / OpenAPI

## Database

-   PostgreSQL 16+
-   Prisma ORM

## Caching / Queues

-   Redis
-   BullMQ

## Storage

-   Amazon S3
-   CloudFront CDN

## Payments

-   Razorpay

## Authentication

-   JWT access tokens
-   Secure refresh-token cookies
-   Google OAuth
-   Argon2id password hashing

## Notifications

-   Resend for email
-   Meta WhatsApp Business API / Gupshup where required

## Monitoring

-   Sentry
-   Pino structured logging
-   OpenTelemetry where appropriate

## Analytics

-   PostHog

## Infrastructure

-   Vercel for Next.js
-   AWS ECS/Fargate for NestJS
-   AWS RDS PostgreSQL
-   AWS ElastiCache Redis
-   AWS S3
-   CloudFront
-   Route 53

## CI/CD

-   GitHub Actions

## Testing

-   Jest
-   Playwright

------------------------------------------------------------------------

# 4. Architecture Strategy

Embark should initially be built as a **modular monolith**.

Do not begin with microservices.

Recommended structure:

``` text
Next.js
   |
   v
NestJS API
   |
   +--------------------+
   |                    |
PostgreSQL             Redis
   |                    |
   |                  BullMQ
   |                    |
   |             Background Jobs
   |
   +--------------------+
   |
   S3
```

NestJS modules:

``` text
AuthModule
UserModule
RBACModule
StudentModule
ExpertModule
ServiceModule
BookingModule
PriorityDMModule
PackageModule
PaymentModule
ReviewModule
HackathonModule
RegistrationModule
TeamModule
SubmissionModule
EvaluationModule
ResultModule
CertificateModule
NotificationModule
FileModule
AuditModule
AdminModule
AnalyticsModule
```

------------------------------------------------------------------------

# 5. Phase 0 --- Product Foundation, Architecture & Project Setup

## Objective

Establish the engineering foundation before implementing business
functionality.

## Deliverables

### Repository

-   Monorepo or clearly separated frontend/backend repositories
-   Branching strategy
-   Development conventions
-   Environment management

Recommended monorepo:

``` text
apps/
  web/
  api/

packages/
  ui/
  types/
  config/
  validation/
```

### Environments

-   Development
-   Staging
-   Production

### CI/CD

GitHub Actions pipeline:

``` text
Push
 ↓
Lint
 ↓
Type check
 ↓
Unit tests
 ↓
Build
 ↓
Security checks
 ↓
Deploy staging
 ↓
Approval
 ↓
Production
```

### Infrastructure

Set up:

-   PostgreSQL
-   Redis
-   S3
-   CloudFront
-   Vercel
-   ECS/Fargate
-   RDS
-   ElastiCache

### API

Set up:

-   REST API
-   `/api/v1`
-   Swagger/OpenAPI
-   Global error handling
-   Request IDs
-   Validation
-   Logging

### Engineering standards

-   TypeScript strict mode
-   ESLint
-   Prettier
-   Conventional commits where appropriate
-   Database migrations
-   Pull-request reviews

## Exit Criteria

-   Developer can run frontend and backend locally.
-   Staging environment is available.
-   CI/CD successfully deploys.
-   Database migrations work.
-   Redis connection works.
-   S3 upload flow is configured.
-   API documentation is available.

------------------------------------------------------------------------

# 6. Phase 1 --- Authentication, Users & RBAC

## Objective

Build the identity, account and authorization foundation.

------------------------------------------------------------------------

## 6.1 Authentication

Implement:

-   Registration
-   Login
-   Logout
-   Email verification
-   Forgot password
-   Reset password
-   Change password
-   Google OAuth
-   Refresh sessions
-   Logout from all devices

### Security

Use:

-   Argon2id
-   Secure cookies
-   Short-lived access tokens
-   Refresh token rotation
-   Rate limiting

------------------------------------------------------------------------

# 6.2 User Model

Base user fields:

-   ID
-   Name
-   Email
-   Phone
-   Profile image
-   Status
-   Created date
-   Updated date

Account statuses:

``` text
ACTIVE
INACTIVE
SUSPENDED
DELETED
```

------------------------------------------------------------------------

# 6.3 RBAC

RBAC is a first-class requirement.

Architecture:

``` text
User
 |
 +-- UserRole
       |
       +-- Role
             |
             +-- RolePermission
                    |
                    +-- Permission
```

## Initial Roles

-   Super Admin
-   Admin
-   Operations Admin
-   Hackathon Admin
-   Evaluator / Judge
-   Expert / Mentor
-   Student
-   Support Agent

Roles must be dynamically creatable.

------------------------------------------------------------------------

## Permissions

Permission naming:

``` text
resource.action
```

Examples:

``` text
user.view
user.create
user.update
user.delete

role.view
role.create
role.update
role.delete

permission.view
permission.assign

expert.view
expert.create
expert.update
expert.verify
expert.suspend

service.view
service.create
service.update
service.delete

booking.view
booking.create
booking.update
booking.cancel

payment.view
payment.refund
payment.reconcile

hackathon.view
hackathon.create
hackathon.update
hackathon.publish
hackathon.delete

hackathon.registration.view
hackathon.registration.manage

hackathon.submission.view
hackathon.submission.manage
hackathon.submission.lock

hackathon.evaluation.view
hackathon.evaluation.create
hackathon.evaluation.update
hackathon.evaluation.finalize

hackathon.result.view
hackathon.result.publish

certificate.view
certificate.issue
certificate.revoke
```

------------------------------------------------------------------------

## 6.4 Dynamic Role Management

Admin can:

1.  Create role
2.  Add description
3.  Select permissions
4.  Assign role to users
5.  Remove role
6.  Edit role

Backend must enforce permissions.

Frontend-only permission hiding is not sufficient.

------------------------------------------------------------------------

## 6.5 Resource-Level Authorization

Example:

A judge may have:

``` text
hackathon.evaluation.create
```

but can only evaluate submissions assigned to them.

Authorization must therefore check:

``` text
User has permission
AND
User is assigned to the resource
```

------------------------------------------------------------------------

## 6.6 Audit Logs

Track:

-   User creation
-   Role creation
-   Permission assignment
-   Expert verification
-   Payment refunds
-   Hackathon publication
-   Submission locking
-   Evaluation changes
-   Result publication
-   Certificate issuance/revocation

Audit record:

``` text
actor
action
resource
resourceId
oldValue
newValue
ip
timestamp
```

## Exit Criteria

-   Authentication works end-to-end.
-   User roles work.
-   Admin can create roles.
-   Admin can create/assign permissions.
-   Protected endpoints enforce permissions.
-   Resource-level authorization works.
-   Audit logs capture sensitive actions.

------------------------------------------------------------------------

# 7. Phase 2 --- Student & Expert Profiles

## Objective

Build the identity layer and profile foundation for the marketplace.

------------------------------------------------------------------------

# 7.1 Student Profile

Fields:

-   Name
-   Photo
-   College
-   Course
-   MBA year
-   Specialization
-   Graduation year
-   Target industry
-   Target role
-   Skills
-   Resume
-   LinkedIn
-   Portfolio

Achievements:

-   Hackathons
-   Finalists
-   Winners
-   Certificates
-   Projects

------------------------------------------------------------------------

# 7.2 Expert Profile

Fields:

### Personal

-   Name
-   Profile photo
-   Headline
-   Bio
-   Location

### Education

-   B-school
-   Degree
-   Specialization
-   Graduation year

### Professional

-   Current company
-   Current role
-   Previous companies
-   Years of experience
-   Industry
-   Function

### Expertise

-   Consulting
-   Finance
-   Product
-   Marketing
-   Strategy
-   Operations
-   HR
-   Entrepreneurship
-   Custom expertise

### Social

-   LinkedIn
-   X
-   Instagram
-   Website

------------------------------------------------------------------------

# 7.3 Expert Verification

Statuses:

``` text
UNVERIFIED
PENDING_VERIFICATION
VERIFIED
REJECTED
SUSPENDED
```

Admin can review:

-   LinkedIn
-   Employment
-   Education
-   Resume
-   Supporting documents

Verified experts receive:

> Embark Verified

------------------------------------------------------------------------

# 7.4 Public Expert Page

Every expert receives a public URL:

``` text
embark.com/expert/{slug}
```

Public page sections:

-   Cover
-   Profile
-   Headline
-   About
-   Experience
-   Education
-   Expertise
-   Services
-   Packages
-   Testimonials
-   Achievements
-   FAQs
-   Availability

Primary CTAs:

-   Book a Session
-   Priority DM
-   View Packages

------------------------------------------------------------------------

# 7.5 Page Customization

Expert can:

-   Upload profile photo
-   Upload cover
-   Edit bio
-   Edit headline
-   Enable/disable sections
-   Reorder sections
-   Add FAQs
-   Add social links
-   Select controlled theme/accent
-   Preview desktop/mobile
-   Copy/share public link

Do not allow arbitrary HTML/CSS initially.

## Exit Criteria

-   Student and expert profiles are complete.
-   Expert verification works.
-   Public expert page renders dynamically.
-   Experts can customize page sections.
-   Public page has mobile/desktop preview.
-   Verification badge works.

------------------------------------------------------------------------

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

# 9. Phase 4 --- Services: 1:1 Sessions

## Objective

Enable experts to create and sell outcome-oriented 1:1 sessions.

------------------------------------------------------------------------

# 9.1 Service Creation

Fields:

-   Name
-   Description
-   Category
-   Duration
-   Price
-   Currency
-   Availability
-   Buffer
-   Cancellation policy
-   Intake questions
-   Meeting type

Example:

> Consulting Placement Strategy\
> 30 minutes --- ₹999

------------------------------------------------------------------------

# 9.2 Outcome Definition

Expert defines:

> What you'll get

Examples:

-   Resume review
-   Career roadmap
-   Interview preparation
-   Industry guidance
-   Placement strategy

This should be visible on the public page.

------------------------------------------------------------------------

# 9.3 Intake Questions

Question types:

-   Short text
-   Long text
-   Dropdown
-   Multiple choice
-   File upload
-   URL

Example:

-   What role are you targeting?
-   Which companies are you targeting?
-   Upload resume.
-   What do you want to achieve?

------------------------------------------------------------------------

# 9.4 Service Management

Expert can:

-   Create
-   Edit
-   Duplicate
-   Publish
-   Unpublish
-   Archive

Service statuses:

``` text
DRAFT
PUBLISHED
PAUSED
ARCHIVED
```

------------------------------------------------------------------------

# 9.5 Service Analytics

Track:

-   Views
-   Booking attempts
-   Payments
-   Conversion
-   Revenue
-   Rating

## Exit Criteria

-   Expert can create services.
-   Students can view services.
-   Services can be published/unpublished.
-   Intake questions work.
-   Service-level analytics are tracked.

------------------------------------------------------------------------

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

# 11. Phase 6 --- Priority DM

## Objective

Enable asynchronous paid expert access.

------------------------------------------------------------------------

# 11.1 Priority DM Service

Expert defines:

-   Price
-   Response SLA
-   Description
-   Categories
-   Attachment rules

SLA options:

-   12 hours
-   24 hours
-   48 hours
-   72 hours

------------------------------------------------------------------------

# 11.2 Student Flow

``` text
View Expert
 ↓
Select Priority DM
 ↓
Question
 ↓
Attachments
 ↓
Payment
 ↓
Expert notified
 ↓
Expert responds
 ↓
Student receives response
 ↓
Completed
 ↓
Review
```

------------------------------------------------------------------------

# 11.3 Expert DM Dashboard

Tabs:

-   Pending
-   In Progress
-   Completed
-   Expired

Display:

-   Student
-   Request
-   Price
-   Created time
-   Response deadline
-   Status

------------------------------------------------------------------------

# 11.4 SLA Tracking

Display:

> Response due in 4h 23m

Queue reminders for experts approaching SLA.

## Exit Criteria

-   Paid DM requests work.
-   Attachments work.
-   SLA tracking works.
-   Expert responses work.
-   Students receive responses.
-   Reviews work.

------------------------------------------------------------------------

# 12. Phase 7 --- Packages

## Objective

Allow experts to sell bundled outcome-oriented offerings.

------------------------------------------------------------------------

# 12.1 Package Configuration

Fields:

-   Name
-   Description
-   Price
-   Validity
-   Included sessions
-   Session durations
-   Priority DMs
-   Usage limits
-   Expiry

------------------------------------------------------------------------

# 12.2 Example

### Consulting Placement Package

₹4,999

Includes:

-   Resume review
-   1 career strategy session
-   2 mock interviews
-   Priority DM for 14 days

------------------------------------------------------------------------

# 12.3 Package Purchase

After purchase:

``` text
Purchased
 ↓
Active
 ↓
Partially Used
 ↓
Completed
```

Track usage.

Example:

``` text
Sessions: 2 / 4
DM access: Active
Expires: 24 Aug
```

## Exit Criteria

-   Experts can create packages.
-   Students can purchase packages.
-   Usage tracking works.
-   Expiry works.
-   Included services can be consumed correctly.

------------------------------------------------------------------------

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

# 14. Phase 9 --- Students / Lightweight Expert CRM

## Objective

Give experts a view of the people they have helped.

------------------------------------------------------------------------

# 14.1 Student List

Show:

-   Name
-   College
-   Sessions
-   Total spent
-   Last interaction
-   Current package

------------------------------------------------------------------------

# 14.2 Student Detail

Show:

-   Student profile
-   Sessions
-   Priority DMs
-   Packages
-   Payment history
-   Reviews
-   Private notes

------------------------------------------------------------------------

# 14.3 Private Notes

Experts can record internal notes:

> Interested in consulting. Needs case preparation.

Notes must never be visible to the student.

## Exit Criteria

-   Experts can view customers.
-   Customer history is aggregated.
-   Private notes are supported.
-   Access is limited to authorized expert/admin users.

------------------------------------------------------------------------

# 15. Phase 10 --- Reviews, Testimonials & Reputation

## Objective

Build trust and conversion.

------------------------------------------------------------------------

# 15.1 Reviews

After completed services:

-   1--5 star rating
-   Written feedback

Review statuses:

``` text
PENDING
PUBLISHED
HIDDEN
REMOVED
```

------------------------------------------------------------------------

# 15.2 Testimonials

Expert can select reviews to feature.

Public profile can display:

> Featured Testimonials

------------------------------------------------------------------------

# 15.3 Trust Signals

Public profile should show:

-   Embark Verified
-   Sessions completed
-   Students helped
-   Rating
-   Reviews
-   Response time
-   Response rate
-   B-school
-   Current company
-   Years of experience

Do not initially use a mysterious opaque "expert score."

## Exit Criteria

-   Reviews are captured.
-   Reviews can be moderated.
-   Experts can feature testimonials.
-   Public trust signals render correctly.

------------------------------------------------------------------------

# 16. Phase 11 --- Expert Analytics

## Objective

Allow experts to understand their page, service and revenue performance.

------------------------------------------------------------------------

# 16.1 Profile Analytics

Track:

-   Profile views
-   Service views
-   Booking starts
-   Successful bookings
-   Revenue
-   Conversion

Example:

``` text
Profile Views       1,284
Service Views         462
Checkout Starts        92
Payments               38
Conversion             8.2%
```

------------------------------------------------------------------------

# 16.2 Service Analytics

Per service:

``` text
Views
Bookings
Conversion
Revenue
Rating
```

------------------------------------------------------------------------

# 16.3 Revenue Analytics

Break down:

-   Daily
-   Weekly
-   Monthly
-   Product type
-   Service

Use PostHog for product behavior analytics and application data for
authoritative financial reporting.

## Exit Criteria

-   Core funnel events are tracked.
-   Expert analytics dashboard works.
-   Service-level analytics work.
-   Revenue reporting matches financial records.

------------------------------------------------------------------------

# 17. Phase 12 --- Hackathon Platform Foundation

## Objective

Build the core hackathon management system.

Hackathon lifecycle:

``` text
DRAFT
 ↓
PUBLISHED
 ↓
REGISTRATION_OPEN
 ↓
REGISTRATION_CLOSED
 ↓
HACKATHON_ACTIVE
 ↓
SUBMISSION_OPEN
 ↓
SUBMISSION_CLOSED
 ↓
EVALUATION
 ↓
RESULTS_FINALIZED
 ↓
RESULTS_PUBLISHED
 ↓
CERTIFICATES_ISSUED
```

------------------------------------------------------------------------

# 17.1 Hackathon Creation

Admin fields:

### Basic

-   Name
-   Slug
-   Banner
-   Short description
-   Full description
-   Organizer
-   Category
-   Tags

### Timeline

-   Registration start
-   Registration deadline
-   Hackathon start
-   Hackathon end
-   Submission deadline
-   Evaluation start
-   Evaluation deadline
-   Results date
-   Certificate date

------------------------------------------------------------------------

# 17.2 Eligibility

Configure:

-   Eligible user types
-   Colleges
-   Courses
-   Years
-   Geography
-   Individual/team
-   Minimum team size
-   Maximum team size

------------------------------------------------------------------------

# 17.3 Problem Statement

Include:

-   Background
-   Business problem
-   Challenge
-   Objective
-   Expected output
-   Constraints
-   Resources
-   FAQs

------------------------------------------------------------------------

# 17.4 Rules

Support:

-   Eligibility
-   Registration
-   Team rules
-   Submission rules
-   Plagiarism
-   AI usage policy
-   Evaluation criteria
-   Disqualification
-   IP rules

## Exit Criteria

-   Admin can create hackathons.
-   Timeline is configurable.
-   Eligibility is configurable.
-   Problem statements and rules can be published.
-   Hackathon lifecycle is enforced server-side.

------------------------------------------------------------------------

# 18. Phase 13 --- Hackathon Discovery & Registration

## Objective

Enable students to discover and register for hackathons.

------------------------------------------------------------------------

# 18.1 Discovery

Sections:

-   Upcoming
-   Registration Open
-   Ongoing
-   Submission Open
-   Evaluation
-   Completed

Hackathon cards:

-   Name
-   Organizer
-   Category
-   Registration deadline
-   Submission deadline
-   Participants
-   Prize
-   Eligibility
-   Status

------------------------------------------------------------------------

# 18.2 Registration

Collect:

-   Name
-   Email
-   Phone
-   College
-   Course
-   Year
-   Specialization
-   Resume
-   LinkedIn
-   Custom questions

Admin can create custom registration fields.

------------------------------------------------------------------------

# 18.3 Individual / Team Mode

``` text
INDIVIDUAL
TEAM
```

For teams:

-   Create team
-   Team name
-   Team leader
-   Invite members
-   Accept invitation
-   Validate team size

## Exit Criteria

-   Students can discover hackathons.
-   Registration works.
-   Eligibility is enforced.
-   Team formation works.
-   Registration records are auditable.

------------------------------------------------------------------------

# 19. Phase 14 --- Hackathon Teams & Submission

## Objective

Implement the complete participant workflow.

------------------------------------------------------------------------

# 19.1 Team Management

Team leader:

-   Create team
-   Invite members
-   Remove members
-   Submit

Member:

-   Accept invitation
-   View team
-   Leave team before submission

After submission/deadline:

> Team is locked.

------------------------------------------------------------------------

# 19.2 Submission

Configurable fields:

-   Solution title
-   Problem understanding
-   Solution
-   Business impact
-   Presentation
-   PDF
-   PPTX
-   GitHub
-   Demo URL
-   Video
-   Supporting documents

------------------------------------------------------------------------

# 19.3 Submission File Storage

Use S3.

Do not store files directly in PostgreSQL.

Use:

``` text
Client
 ↓
Request presigned URL
 ↓
Backend validates
 ↓
S3
 ↓
Metadata stored in PostgreSQL
```

------------------------------------------------------------------------

# 19.4 File Restrictions

Admin controls:

-   File types
-   Maximum file size
-   Number of files
-   Required files

Example:

``` text
PDF ≤ 20MB
PPTX ≤ 50MB
ZIP ≤ 100MB
```

Values remain configurable.

------------------------------------------------------------------------

# 19.5 Submission Versioning

Before deadline:

``` text
Version 1
Version 2
Version 3
```

Record:

-   Timestamp
-   User
-   Files
-   Links

After deadline:

> Submission locked.

------------------------------------------------------------------------

# 19.6 Submission Status

``` text
NOT_STARTED
DRAFT
SUBMITTED
UPDATED
LOCKED
UNDER_EVALUATION
EVALUATED
SHORTLISTED
WINNER
REJECTED
```

## Exit Criteria

-   Team workflow works.
-   Submission form works.
-   File uploads work.
-   Versioning works.
-   Deadlines are enforced server-side.
-   Locked submissions cannot be changed.

------------------------------------------------------------------------

# 20. Phase 15 --- Manual Evaluation & Judge Management

## Objective

Enable the client's team/judges to manually evaluate submissions.

------------------------------------------------------------------------

# 20.1 Judge Management

Admin can:

-   Create judge
-   Assign judge
-   Assign submissions
-   Reassign
-   Monitor progress
-   Lock evaluation

------------------------------------------------------------------------

# 20.2 Evaluation Criteria

Example:

  Criterion                 Weight
  ----------------------- --------
  Problem Understanding        20%
  Innovation                   20%
  Feasibility                  20%
  Business Impact              20%
  Presentation                 20%

Admin can configure criteria and weights.

------------------------------------------------------------------------

# 20.3 Evaluation Form

Judge sees:

-   Team
-   Submission
-   Files
-   Links
-   Problem
-   Criteria

For each:

-   Score
-   Comment

The system calculates weighted total.

------------------------------------------------------------------------

# 20.4 Evaluation Integrity

Track:

-   Judge
-   Submission
-   Score
-   Timestamp
-   Changes
-   Comments

Once finalized, scores become immutable unless an authorized admin
reopens them.

------------------------------------------------------------------------

# 20.5 Judge Authorization

A judge can only access submissions assigned to them unless they have an
elevated permission.

## Exit Criteria

-   Judges can be assigned.
-   Judges see only authorized submissions.
-   Manual scoring works.
-   Weighted scores calculate correctly.
-   Audit history works.
-   Evaluations can be finalized/locked.

------------------------------------------------------------------------

# 21. Phase 16 --- Results & Certificate System

## Objective

Complete the hackathon lifecycle.

------------------------------------------------------------------------

# 21.1 Result Calculation

System calculates:

-   Total score
-   Rank
-   Winner
-   Runner-up
-   Finalists
-   Special awards

Admin has final approval.

------------------------------------------------------------------------

# 21.2 Result Publication

Public page:

``` text
Hackathon Name

Winner
Team Alpha
College XYZ

Runner-up
Team Beta
College ABC

Finalists
...
```

Scores can be shown or hidden based on admin configuration.

------------------------------------------------------------------------

# 21.3 Certificate Types

-   Participation
-   Finalist
-   Winner
-   Runner-up
-   Special Recognition

------------------------------------------------------------------------

# 21.4 Certificate Data

Certificate contains:

-   Participant name
-   Hackathon
-   Achievement
-   Date
-   Organizer
-   Certificate ID
-   QR code
-   Verification URL

------------------------------------------------------------------------

# 21.5 Certificate Generation

Use BullMQ:

``` text
Results Finalized
 ↓
Queue Job
 ↓
Generate PDF
 ↓
Upload S3
 ↓
Create Certificate Record
 ↓
Generate Verification ID
 ↓
Notify Participant
```

------------------------------------------------------------------------

# 21.6 Certificate Verification

Example:

``` text
EMB-HACK-2026-000184
```

Public page:

``` text
embark.com/certificate/EMB-HACK-2026-000184
```

Show:

-   Name
-   Hackathon
-   Achievement
-   Issue date
-   Certificate ID
-   Status

Statuses:

``` text
VALID
REVOKED
```

## Exit Criteria

-   Results can be finalized.
-   Results can be published.
-   Certificates are generated.
-   Certificates are stored securely.
-   QR verification works.
-   Certificates appear in student profiles.

------------------------------------------------------------------------

# 22. Phase 17 --- Student Achievement Profile

## Objective

Connect hackathon outcomes and mentorship activity into a persistent
student identity.

Public/private profile configuration should be supported.

------------------------------------------------------------------------

# 22.1 Profile Sections

### Education

-   College
-   Course
-   Year
-   Specialization

### Career

-   Target roles
-   Target industries
-   Skills

### Mentorship

-   Sessions completed
-   Experts interacted with

### Hackathons

-   Participated
-   Finalist
-   Winner

### Certificates

-   All Embark certificates

### Projects

-   Hackathon projects
-   Portfolio links

------------------------------------------------------------------------

# 22.2 Achievement Example

``` text
Rahul Sharma
MBA — ABC Business School

Embark Achievements

3 Hackathons
1 Winner
1 Finalist
4 Certificates
5 Expert Sessions
```

## Exit Criteria

-   Achievements are automatically linked.
-   Certificates appear automatically.
-   Students can control profile visibility.
-   Verified achievements cannot be falsely edited by users.

------------------------------------------------------------------------

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

# 24. Phase 19 --- Admin Control Center

## Objective

Give the client complete control over the platform.

------------------------------------------------------------------------

# 24.1 Admin Dashboard

Show:

-   Total users
-   Students
-   Experts
-   Verified experts
-   Active hackathons
-   Registrations
-   Submissions
-   Transactions
-   GMV
-   Platform revenue
-   Certificates issued

------------------------------------------------------------------------

# 24.2 User Management

Admin can:

-   Search
-   Filter
-   Create
-   Edit
-   Suspend
-   Activate
-   Assign roles
-   Remove roles

------------------------------------------------------------------------

# 24.3 Expert Management

Admin can:

-   Review
-   Verify
-   Reject
-   Suspend
-   View services
-   View bookings
-   View earnings
-   View reviews

------------------------------------------------------------------------

# 24.4 Transaction Management

Show:

-   Order ID
-   Customer
-   Expert
-   Product
-   Amount
-   Commission
-   Payment status
-   Refund status
-   Date

Actions:

-   View
-   Refund
-   Reconcile
-   Export

------------------------------------------------------------------------

# 24.5 Hackathon Management

Admin can:

-   Create
-   Edit
-   Publish
-   Unpublish
-   Archive
-   Manage registrations
-   Manage teams
-   Manage submissions
-   Manage judges
-   Manage evaluations
-   Finalize results
-   Publish results
-   Issue certificates

------------------------------------------------------------------------

# 24.6 Platform Settings

Configurable:

-   Commission
-   Categories
-   Verification rules
-   Certificate templates
-   Email templates
-   Notification templates
-   File limits
-   Cancellation rules
-   Refund rules
-   Roles
-   Permissions

## Exit Criteria

-   Admin can manage every required business operation.
-   RBAC limits admin access correctly.
-   Sensitive actions are audited.
-   Platform settings are configurable.

------------------------------------------------------------------------

# 25. Phase 20 --- Search, Discovery & Marketplace Experience

## Objective

Make it easy for students to find the right expert and hackathon.

------------------------------------------------------------------------

# 25.1 Expert Search

Search:

-   Name
-   Company
-   College
-   Role
-   Industry
-   Expertise

Filters:

-   B-school
-   Graduation year
-   Company
-   Industry
-   Function
-   Price
-   Rating
-   Availability
-   Verified

Use PostgreSQL full-text search initially.

Do not introduce Elasticsearch/OpenSearch until actual scale requires
it.

------------------------------------------------------------------------

# 25.2 Contextual Discovery

Student context should influence recommendations.

Example:

``` text
College similarity
+
Role relevance
+
Industry relevance
+
Expertise
+
Student goal
+
Availability
+
Rating
```

The initial implementation can use deterministic filters/ranking rather
than AI.

------------------------------------------------------------------------

# 25.3 Hackathon Discovery

Filters:

-   Category
-   Eligibility
-   Registration status
-   Deadline
-   College
-   Individual/team
-   Prize

## Exit Criteria

-   Expert search works.
-   Filters work.
-   Hackathon search works.
-   Discovery pages are SEO-friendly where appropriate.

------------------------------------------------------------------------

# 26. Phase 21 --- Security, Performance & Reliability Hardening

## Objective

Prepare the product for production usage.

------------------------------------------------------------------------

# 26.1 API Security

Implement:

-   Authentication
-   RBAC
-   Resource authorization
-   Rate limiting
-   Validation
-   Secure headers
-   CORS
-   SQL injection protection
-   CSRF protection where applicable

------------------------------------------------------------------------

# 26.2 File Security

Validate:

-   MIME type
-   Extension
-   File signature
-   Size

Use presigned S3 URLs.

Consider malware scanning for uploaded files.

------------------------------------------------------------------------

# 26.3 Payment Security

Use:

-   Signature verification
-   Webhooks
-   Provider API verification
-   Idempotency
-   Transaction records

------------------------------------------------------------------------

# 26.4 Deadline Security

Backend must enforce:

-   Registration deadline
-   Submission deadline
-   Package expiry
-   Booking timing
-   DM SLA

Frontend restrictions alone are insufficient.

------------------------------------------------------------------------

# 26.5 Performance Targets

Initial targets:

-   Normal API p95 \< 500ms
-   Page load \< 2.5s under normal conditions
-   Search p95 \< 500ms
-   Heavy jobs asynchronous

------------------------------------------------------------------------

# 26.6 Availability

Initial target:

> 99.5%+

Use:

-   Health checks
-   Monitoring
-   Backups
-   Automated deployment
-   Error tracking

------------------------------------------------------------------------

# 26.7 Database

RDS PostgreSQL:

-   Automated backups
-   Point-in-time recovery
-   Backup retention

Financial records should never be physically deleted.

## Exit Criteria

-   Security review complete.
-   Performance targets measured.
-   Backup/restore tested.
-   Monitoring alerts configured.
-   Critical failure scenarios tested.

------------------------------------------------------------------------

# 27. Phase 22 --- Testing & Production Readiness

## Objective

Validate all critical business flows before launch.

------------------------------------------------------------------------

# 27.1 Unit Testing

Test:

-   Authentication
-   RBAC
-   Commission calculations
-   Booking logic
-   Availability
-   Package usage
-   Evaluation calculations
-   Certificate logic
-   Refunds

------------------------------------------------------------------------

# 27.2 Integration Testing

Test:

-   PostgreSQL
-   Redis
-   S3
-   Razorpay
-   Email
-   Calendar
-   Background jobs

------------------------------------------------------------------------

# 27.3 E2E Testing

### Student

``` text
Register
 ↓
Complete profile
 ↓
Find expert
 ↓
Book service
 ↓
Pay
 ↓
Attend
 ↓
Review
```

### Expert

``` text
Register
 ↓
Verify
 ↓
Create service
 ↓
Set availability
 ↓
Connect calendar
 ↓
Receive booking
 ↓
Complete session
 ↓
View earnings
```

### Hackathon

``` text
Create
 ↓
Register
 ↓
Create team
 ↓
Submit
 ↓
Judge evaluates
 ↓
Admin finalizes
 ↓
Results published
 ↓
Certificate issued
 ↓
Certificate verified
```

------------------------------------------------------------------------

# 27.4 Production Checklist

Before launch:

-   [ ] Production domain
-   [ ] SSL
-   [ ] Database backups
-   [ ] Redis
-   [ ] S3
-   [ ] Payment webhooks
-   [ ] Email domain
-   [ ] OAuth credentials
-   [ ] Calendar credentials
-   [ ] Error monitoring
-   [ ] Analytics
-   [ ] Logging
-   [ ] Rate limiting
-   [ ] RBAC
-   [ ] Audit logs
-   [ ] Privacy policy
-   [ ] Terms
-   [ ] Refund policy
-   [ ] Cancellation policy
-   [ ] Security review
-   [ ] Load testing
-   [ ] E2E testing

------------------------------------------------------------------------

# 28. Final Navigation

## Student

``` text
Home
Explore Experts
Hackathons
My Bookings
My Priority DMs
My Packages
My Certificates
My Profile
Notifications
Settings
```

## Expert

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

## Admin

``` text
Dashboard

Users
Experts
Students

Marketplace
  Services
  Bookings
  Priority DMs
  Packages
  Reviews

Payments
  Transactions
  Refunds
  Commissions
  Payouts

Hackathons
  Hackathons
  Registrations
  Teams
  Submissions
  Judges
  Evaluations
  Results
  Certificates

Administration
  Users
  Roles
  Permissions
  Settings
  Audit Logs
```

------------------------------------------------------------------------

# 29. Final Database Entity Set

Core entities:

``` text
User
Role
Permission
UserRole
RolePermission
AuditLog

StudentProfile
ExpertProfile
ExpertVerification
Education
Experience
Expertise
SocialLink
PageSetting
FAQ

Service
ServiceAvailability
IntakeQuestion

Booking
BookingParticipant

PriorityDM
PriorityDMMessage
PriorityDMAttachment

Package
PackageItem
PackagePurchase
PackageUsage

Order
Payment
Refund
Commission
Payout

Review
Testimonial

CalendarConnection
AvailabilityRule
BlockedSlot
Meeting

Hackathon
HackathonRule
HackathonTimeline
HackathonRegistration

HackathonTeam
HackathonTeamMember

HackathonSubmission
SubmissionVersion
SubmissionFile

Judge
JudgeAssignment
EvaluationCriteria
Evaluation
EvaluationScore

HackathonResult
Certificate
CertificateVerification

Notification
NotificationTemplate

AnalyticsEvent
```

------------------------------------------------------------------------

# 30. Final Business Model

Embark's initial monetization comes from expert transactions.

## Revenue Sources

### 1. 1:1 Sessions

Commission per transaction.

### 2. Priority DMs

Commission per transaction.

### 3. Packages

Commission per transaction.

### 4. Future hackathon monetization opportunities

The architecture should be ready for:

-   Sponsored hackathons
-   Corporate challenges
-   Paid competitions
-   Employer partnerships

But the initial hackathon strategy can remain free-to-participate to
maximize student acquisition.

------------------------------------------------------------------------

# 31. Core Product Flywheel

``` text
                STUDENTS
                   |
                   v
              HACKATHONS
                   |
                   v
             SKILL BUILDING
                   |
                   v
              ACHIEVEMENTS
                   |
                   v
             EMBARK PROFILE
                   |
                   v
             NEED GUIDANCE
                   |
        +----------+----------+
        |          |          |
        v          v          v
       1:1        DM       PACKAGE
        |          |          |
        +----------+----------+
                   |
                   v
               MENTORSHIP
                   |
                   v
                OUTCOME
                   |
                   v
                 TRUST
                   |
                   v
            MORE PARTICIPATION
```

Expert flywheel:

``` text
Expert
  |
  v
Verified Profile
  |
  v
Services
  |
  v
Students
  |
  v
Revenue
  |
  v
Reviews
  |
  v
Reputation
  |
  v
Judge / Mentor / Community Contributor
```

------------------------------------------------------------------------

# 32. Final Product Positioning

Embark should not be positioned internally or externally as simply:

> "Topmate for Tier-2 B-school students."

That describes only the marketplace portion.

The stronger positioning is:

> **Embark is a career-development ecosystem for business-school
> students, combining trusted expert access with real-world competitions
> and verified achievements.**

The product loop is:

> **Learn → Practice → Prove → Build Credibility → Connect → Advance**

The business loop is:

> **Hackathons acquire students → Expert services monetize intent →
> Reviews and achievements build trust → The network becomes stronger.**

------------------------------------------------------------------------

# 33. Recommended Implementation Order

The full build should follow this dependency order:

``` text
PHASE 0
Foundation
   |
   v
PHASE 1
Auth + Users + RBAC
   |
   v
PHASE 2
Profiles + Public Expert Pages
   |
   v
PHASE 3
Expert Hub
   |
   +----------------------+
   |                      |
   v                      v
PHASE 4                 PHASE 5
Services                Calendar
   |                      |
   +----------+-----------+
              |
              v
          PHASE 6
        Priority DM
              |
              v
          PHASE 7
          Packages
              |
              v
          PHASE 8
     Payments + Payouts
              |
              v
          PHASE 9
       Expert CRM
              |
              v
         PHASE 10
      Reviews/Reputation
              |
              v
         PHASE 11
          Analytics
              |
              v
         PHASE 12
     Hackathon Foundation
              |
              v
         PHASE 13
       Registration
              |
              v
         PHASE 14
    Teams + Submissions
              |
              v
         PHASE 15
       Evaluation
              |
              v
         PHASE 16
   Results + Certificates
              |
              v
         PHASE 17
   Student Achievements
              |
              v
         PHASE 18
       Notifications
              |
              v
         PHASE 19
       Admin Center
              |
              v
         PHASE 20
      Search/Discovery
              |
              v
         PHASE 21
   Security/Performance
              |
              v
         PHASE 22
 Testing + Production Launch
```

------------------------------------------------------------------------

# 34. Definition of Done for Embark v1

Embark v1 is considered production-ready when:

### Student

-   Can register/login
-   Can create profile
-   Can discover experts
-   Can book 1:1 sessions
-   Can purchase Priority DMs
-   Can purchase packages
-   Can make payments
-   Can participate in hackathons
-   Can form teams
-   Can submit solutions
-   Can view results
-   Can access certificates
-   Can verify certificates

### Expert

-   Can register
-   Can submit verification
-   Can create public profile
-   Can customize page
-   Can create services
-   Can create Priority DM offerings
-   Can create packages
-   Can configure availability
-   Can connect calendar
-   Can manage meetings
-   Can manage students
-   Can respond to DMs
-   Can view reviews
-   Can view earnings
-   Can manage payouts
-   Can view analytics
-   Can pause/resume services

### Hackathon Admin

-   Can create hackathons
-   Can configure timelines
-   Can configure eligibility
-   Can publish rules/problem statements
-   Can manage registrations
-   Can manage teams
-   Can manage submissions
-   Can assign judges
-   Can manually evaluate
-   Can finalize scores
-   Can publish results
-   Can issue certificates
-   Can revoke certificates

### Platform Admin

-   Can manage users
-   Can create roles
-   Can create permissions
-   Can assign permissions to roles
-   Can assign roles to users
-   Can manage experts
-   Can manage payments
-   Can manage refunds
-   Can manage hackathons
-   Can manage certificates
-   Can view audit logs
-   Can configure platform settings

### Engineering

-   RBAC enforced server-side
-   Resource authorization implemented
-   Payment webhooks verified
-   Booking concurrency protected
-   Hackathon deadlines enforced server-side
-   Files stored securely
-   Database backed up
-   Critical jobs queued
-   Monitoring active
-   Error tracking active
-   CI/CD active
-   Automated tests cover critical flows
-   Production deployment documented

------------------------------------------------------------------------

# 35. Final Technical Stack Summary

  Layer              Technology
  ------------------ ------------------------
  Web                Next.js + TypeScript
  UI                 Tailwind + shadcn/ui
  Forms              React Hook Form + Zod
  Server State       TanStack Query
  Backend            NestJS + TypeScript
  API                REST + Swagger/OpenAPI
  ORM                Prisma
  Database           PostgreSQL
  Cache              Redis
  Queue              BullMQ
  Storage            Amazon S3
  CDN                CloudFront
  Payments           Razorpay
  Auth               JWT + Google OAuth
  Password Hashing   Argon2id
  Email              Resend
  WhatsApp           Meta API / Gupshup
  Monitoring         Sentry
  Analytics          PostHog
  Logging            Pino
  Hosting --- Web    Vercel
  Hosting --- API    AWS ECS/Fargate
  DB                 AWS RDS PostgreSQL
  Redis              AWS ElastiCache
  DNS                Route 53
  CI/CD              GitHub Actions
  Testing            Jest + Playwright

------------------------------------------------------------------------

# 36. Final Architecture Principle

The product should be built as an integrated system rather than a
collection of disconnected features.

The most important relationships are:

``` text
Student
   |
   +--> Expert
   |      |
   |      +--> Service
   |      +--> Calendar
   |      +--> Booking
   |      +--> DM
   |      +--> Package
   |      +--> Earnings
   |
   +--> Hackathon
          |
          +--> Registration
          +--> Team
          +--> Submission
          +--> Evaluation
          +--> Result
          +--> Certificate
```

And everything ultimately contributes to:

> **A trusted, measurable career identity for the student and a
> monetizable professional presence for the expert.**
