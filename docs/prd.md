# EMBARK

## Product Requirements Document — PRD

**Product:** Embark
**Product Type:** Career Development + Expert Marketplace + Hackathon Platform
**Primary Market:** Tier-2 Business Schools / MBA Ecosystem
**Document Type:** Product Requirements Document
**Version:** 1.0

---

# 1. Executive Summary

Embark is a career-development platform designed initially for **Tier-2 business-school / MBA students** and the broader ecosystem around them.

The platform connects students with:

* B-school seniors
* Alumni
* Industry professionals
* Career mentors
* Coaches
* Consultants
* Entrepreneurs
* Domain experts

Students can access experts through:

1. **1:1 Sessions**
2. **Priority DMs**
3. **Packages**

Embark manages the complete transaction lifecycle, including:

* Expert discovery
* Profiles
* Service creation
* Availability
* Booking
* Payments
* Notifications
* Reviews
* Earnings

Alongside the expert marketplace, Embark provides a **Hackathon Platform** where the client can:

* Create hackathons
* Publish problem statements
* Open registrations
* Manage participants and teams
* Collect submissions
* Manually evaluate submissions
* Calculate scores
* Publish results
* Generate certificates
* Provide certificate verification

The long-term product vision is to create a career ecosystem where students can:

> **Discover → Learn → Practice → Prove → Connect → Advance**

The platform also allows experienced users to eventually become mentors, judges, and contributors to the ecosystem.

---

# 2. Product Vision

## Vision

To become the trusted career ecosystem for students from emerging business schools by connecting them with people who have already achieved the outcomes they are trying to achieve.

## Core proposition for students

> **Learn from people who've already been where you're going.**

## Core proposition for experts

> **Turn your experience and expertise into impact and income.**

## Core proposition for hackathons

> **Practice real-world problem solving, demonstrate your skills, and build verified achievements.**

---

# 3. Problem Statement

Students at Tier-2 business schools often face fragmented access to:

* Alumni
* Seniors
* Industry professionals
* Career advice
* Interview preparation
* Placement guidance
* Industry-specific knowledge
* Practical business challenges
* Verified achievements

The information may exist, but it is distributed across:

* LinkedIn
* WhatsApp
* Telegram
* College groups
* Personal networks
* Informal mentorship
* Social media
* Random online communities

There is no single structured platform where students can:

> Find the right person → verify their credibility → pay for access → receive guidance → participate in practical challenges → earn verified achievements.

Embark aims to solve this fragmentation.

---

# 4. Product Principles

## 4.1 Trust First

Students must understand why an expert is credible.

## 4.2 Outcome Over Time

Experts should sell outcomes rather than simply selling minutes.

Example:

Bad:

> 30-minute call — ₹999

Better:

> Consulting Placement Strategy — 30 minutes — ₹999

## 4.3 Verticalized Experience

Embark should be designed specifically around:

* MBA
* B-school
* Placements
* Internships
* Careers
* Business functions
* Industry transitions
* Competitions

It should not feel like a generic marketplace.

## 4.4 Simple Transactions

A student should be able to discover and purchase an expert service with minimal friction.

## 4.5 Verified Achievements

Hackathon results and certificates should be verifiable.

## 4.6 Manual Control Where Quality Matters

Hackathon evaluation will initially remain manual.

Automation should manage administrative work, not replace human judgment.

---

# 5. Target Users

## 5.1 Student

Primary consumer of Embark.

Examples:

* MBA first-year student
* MBA second-year student
* Placement candidate
* Internship seeker
* Career switcher
* MBA aspirant
* Student preparing for interviews
* Student participating in hackathons

---

## 5.2 Expert / Mentor

A person offering paid expertise.

Examples:

* B-school alumni
* Current MBA seniors
* Industry professionals
* Consultants
* Product managers
* Finance professionals
* Marketing professionals
* HR professionals
* Operations professionals
* Founders
* Career coaches
* Interview coaches

---

## 5.3 Hackathon Participant

A user participating in an Embark hackathon.

A participant can be:

* Individual
* Team member
* Team leader

---

## 5.4 Judge / Evaluator

A person authorized to evaluate hackathon submissions.

Judges may be:

* Industry professionals
* Faculty
* Alumni
* Domain experts
* Internal evaluators

---

## 5.5 Admin

Internal Embark/client staff managing the platform.

Admins manage:

* Users
* Roles
* Permissions
* Experts
* Payments
* Hackathons
* Evaluators
* Submissions
* Results
* Certificates
* Platform configuration

---

# 6. Product Modules

Embark consists of the following major modules:

```text
EMBARK
│
├── Authentication & User Management
│
├── RBAC
│
├── Student Experience
│
├── Expert Marketplace
│   ├── Expert Profiles
│   ├── 1:1 Sessions
│   ├── Priority DM
│   └── Packages
│
├── Payments & Earnings
│
├── Reviews & Ratings
│
├── Hackathons
│   ├── Creation
│   ├── Registration
│   ├── Teams
│   ├── Submissions
│   ├── Evaluation
│   ├── Results
│   └── Certificates
│
├── Notifications
│
├── Admin Dashboard
│
└── Reporting & Analytics
```

---

# 7. Authentication & Account Management

## 7.1 Registration

Users can register using:

* Email
* Password
* Google OAuth

Phone-based authentication may be added if required.

---

## 7.2 Login

Users can log in using:

* Email/password
* Google

Authentication should support:

* Access token
* Refresh token
* Session management
* Logout
* Logout from all devices

---

## 7.3 Email Verification

New users should verify their email.

Account state:

```text
REGISTERED
↓
EMAIL_VERIFICATION_PENDING
↓
EMAIL_VERIFIED
↓
ACTIVE
```

---

## 7.4 Password Management

Users can:

* Forgot password
* Reset password
* Change password

Passwords must never be stored in plaintext.

Use:

**Argon2id** or **bcrypt**.

Recommended:

**Argon2id**

---

# 8. User Profile

Every user has a base profile.

Fields:

* Name
* Profile photo
* Email
* Phone
* Location
* Bio
* LinkedIn URL
* Website
* Education
* College
* Course
* Graduation year
* Skills
* Interests

Additional fields depend on user type.

---

# 9. Student Profile

Student-specific information:

* College
* Degree
* MBA year
* Specialization
* Graduation year
* Current semester/year
* Target industry
* Target roles
* Skills
* Resume
* LinkedIn
* Portfolio

Student profile can also show:

### Achievements

* Hackathons participated
* Finalist positions
* Winners
* Certificates
* Projects

### Mentorship activity

* Sessions completed
* Packages purchased
* Experts interacted with

Privacy controls should allow the student to choose what is publicly visible.

---

# 10. Expert Profile

An expert profile contains:

## Personal

* Name
* Photo
* Headline
* Bio
* Location

## Education

* B-school
* Degree
* Specialization
* Graduation year

## Professional

* Current company
* Current role
* Previous companies
* Years of experience
* Industry
* Function

## Expertise

Examples:

* Consulting
* Finance
* Marketing
* Product
* Strategy
* Operations
* HR
* Entrepreneurship

## Credibility

* Verification status
* Sessions completed
* Students helped
* Rating
* Reviews

## Services

* 1:1 sessions
* Priority DM
* Packages

---

# 11. Expert Verification

Expert verification is critical to the marketplace.

The system should support:

```text
UNVERIFIED
PENDING_VERIFICATION
VERIFIED
REJECTED
SUSPENDED
```

Admin can review:

* Education
* Employment
* LinkedIn
* Resume
* Supporting documents

Once approved:

> Embark Verified

badge appears on the profile.

---

# 12. Expert Marketplace

Students can browse experts.

## Search

Search by:

* Name
* Company
* College
* Role
* Industry
* Expertise

## Filters

* B-school
* Graduation year
* Company
* Industry
* Function
* Price
* Rating
* Availability
* Verified status

---

# 13. Expert Discovery

The platform should prioritize relevance.

Example:

Student:

> MBA student interested in consulting.

Recommended experts:

* Consulting professionals
* Alumni from the student's B-school
* Recent graduates in consulting
* Professionals with similar educational backgrounds

Future recommendation logic can use:

```text
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

---

# 14. Product — 1:1 Sessions

Experts can create paid sessions.

## Service fields

* Service name
* Description
* Category
* Duration
* Price
* Currency
* Availability
* Buffer time
* Cancellation policy
* Intake questions
* Meeting method

Example:

> Consulting Placement Strategy
> 30 minutes
> ₹999

---

# 15. Session Booking Flow

```text
Student discovers expert
        ↓
Opens expert profile
        ↓
Selects 1:1 service
        ↓
Chooses available slot
        ↓
Answers intake questions
        ↓
Payment
        ↓
Booking confirmed
        ↓
Meeting link generated/shared
        ↓
Reminder
        ↓
Session
        ↓
Session completed
        ↓
Review
```

---

# 16. Scheduling

Expert can define:

* Working days
* Working hours
* Time zone
* Session duration
* Buffer
* Blackout dates

Calendar integration can be implemented with:

* Google Calendar

The platform should prevent double booking.

---

# 17. Session Status

Possible states:

```text
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

---

# 18. Product — Priority DM

Priority DM allows students to pay an expert for an asynchronous response.

Example:

> Resume Review
> ₹399
> Response within 48 hours

Student submits:

* Question
* Context
* Attachments

Supported attachment types should be configurable.

Potential formats:

* PDF
* DOC/DOCX
* Images

---

# 19. Priority DM Lifecycle

```text
Student creates request
        ↓
Payment
        ↓
Request submitted
        ↓
Expert notified
        ↓
Expert accepts
        ↓
Expert responds
        ↓
Student receives response
        ↓
Request completed
        ↓
Review
```

Statuses:

```text
PENDING_PAYMENT
PAID
ASSIGNED
IN_PROGRESS
RESPONDED
COMPLETED
CANCELLED
REFUNDED
EXPIRED
```

---

# 20. Product — Packages

Packages combine multiple services.

Example:

## Consulting Placement Package

₹4,999

Includes:

* Resume review
* Career strategy session
* Two mock interviews
* Priority DM for 14 days

---

## Package Configuration

Expert can define:

* Package name
* Description
* Price
* Validity
* Included sessions
* Included Priority DMs
* Session duration
* Number of sessions
* Usage rules

---

# 21. Package Lifecycle

```text
Purchased
↓
Active
↓
Partially Used
↓
Completed
```

Package expiry should be supported.

Example:

> Valid for 30 days from purchase.

---

# 22. Payments

Payment is a core platform component.

Recommended payment provider:

### Razorpay

Primary reason:

* Indian market
* UPI
* Cards
* Net banking
* Wallets
* Payment links
* Refund APIs
* Payout capabilities

The architecture should keep payment-provider integration abstract enough to support another provider later.

---

# 23. Payment Lifecycle

```text
ORDER_CREATED
↓
PAYMENT_INITIATED
↓
PAYMENT_AUTHORIZED
↓
PAYMENT_CAPTURED
↓
SERVICE_DELIVERED
↓
SETTLEMENT
```

Failure states:

* Payment failed
* Payment cancelled
* Payment expired
* Refund requested
* Refunded

---

# 24. Platform Commission

Embark earns a commission from transactions.

For example:

```text
Customer pays ₹1,000

Platform commission = ₹100
Expert earnings = ₹900
```

The actual commission percentage must be configurable by Admin.

Do not hard-code commission rates.

Admin should be able to configure:

* Default commission
* Expert-specific commission
* Promotional commission
* Category-specific commission

---

# 25. Expert Wallet / Earnings

Experts should have an earnings dashboard.

Show:

* Total sales
* Gross revenue
* Platform fees
* Refunds
* Net earnings
* Pending earnings
* Available balance
* Withdrawn amount

Example:

```text
Gross Sales       ₹50,000
Platform Fees     ₹5,000
Refunds           ₹2,000
Available         ₹43,000
```

---

# 26. Payouts

Expert payout information:

* Bank account
* Account holder name
* IFSC
* UPI, if supported
* PAN/GST information where required

Sensitive financial information should be securely stored or preferably tokenized through the payment provider.

---

# 27. Reviews & Ratings

After successful service completion, students can rate experts.

Rating:

**1–5 stars**

Optional:

* Written review
* Service-specific feedback

Review states:

* Pending
* Published
* Hidden
* Removed

Admin can moderate reviews.

---

# 28. Hackathon Module

Hackathons are a first-class Embark product.

The hackathon lifecycle:

```text
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

---

# 29. Hackathon Creation

Admin creates a hackathon.

## Basic Information

* Name
* Slug
* Banner
* Short description
* Detailed description
* Organizer
* Category
* Tags

## Timeline

* Registration start
* Registration deadline
* Hackathon start
* Hackathon end
* Submission deadline
* Evaluation start
* Evaluation deadline
* Results publication
* Certificate issuance

---

# 30. Hackathon Eligibility

Admin configures:

* Eligible user types
* Eligible colleges
* Course
* Year
* Geography
* Team/individual participation
* Minimum team size
* Maximum team size

---

# 31. Hackathon Problem Statement

Each hackathon contains:

* Background
* Business problem
* Challenge statement
* Objectives
* Expected output
* Constraints
* Resources
* FAQs

Admin should be able to publish supporting documents.

---

# 32. Hackathon Rules

Rules can include:

* Eligibility
* Registration rules
* Team rules
* Submission rules
* Plagiarism policy
* Use of AI policy
* Evaluation criteria
* Disqualification conditions
* Intellectual property rules
* Result policy

Admin should be able to publish and update rules before registration/submission deadlines.

---

# 33. Hackathon Discovery

Students have a dedicated Hackathons section.

Statuses:

### Upcoming

Registration not yet open.

### Registration Open

Users can register.

### Ongoing

Hackathon is active.

### Submission Open

Participants can submit.

### Evaluation

Submissions are being evaluated.

### Completed

Results are published.

---

# 34. Hackathon Registration

Registration form may include:

* Name
* Email
* Phone
* College
* Course
* Year
* Specialization
* Resume
* LinkedIn
* Other custom fields

Admin should be able to configure custom registration questions.

---

# 35. Individual vs Team Hackathons

Hackathon configuration:

```text
PARTICIPATION_MODE

INDIVIDUAL
TEAM
```

For team hackathons:

* Team creation
* Team name
* Team leader
* Member invitation
* Member acceptance
* Team size validation

---

# 36. Team Management

Team leader can:

* Create team
* Add members
* Invite members
* Remove members
* Submit final solution

Team member can:

* Accept invitation
* View team
* View submission
* Leave team before submission

After submission deadline:

> Team becomes locked.

---

# 37. Hackathon Submission

Submission fields are configurable.

Possible fields:

* Solution title
* Problem understanding
* Proposed solution
* Business impact
* Presentation
* PDF
* PPT
* GitHub link
* Demo URL
* Video
* Supporting documents

The admin defines required fields per hackathon.

---

# 38. Submission Versioning

Before the deadline, participants may be allowed to update their submission.

The system should record:

* Version
* Timestamp
* User
* Files
* Links

Example:

```text
Version 1 — 10:15 AM
Version 2 — 2:30 PM
Version 3 — 5:45 PM
```

After the deadline:

> Submission locked.

---

# 39. Submission Status

```text
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

---

# 40. Manual Evaluation

Evaluation is performed manually by judges/admins.

Admin creates evaluation criteria.

Example:

| Criterion             | Weight |
| --------------------- | -----: |
| Problem Understanding |    20% |
| Innovation            |    20% |
| Feasibility           |    20% |
| Business Impact       |    20% |
| Presentation          |    20% |

---

# 41. Evaluation Form

Judge sees:

* Team information
* Submission
* Files
* Links
* Problem statement
* Evaluation criteria

For each criterion:

* Score
* Optional comment

Example:

```text
Problem Understanding
Score: 16/20
Comment: Strong understanding of the problem.

Innovation
Score: 18/20

Feasibility
Score: 15/20
```

The platform calculates the weighted score automatically.

---

# 42. Judge Management

Admin can:

* Create judge
* Assign judge
* Assign submissions
* Reassign submissions
* View evaluation progress
* Lock evaluation

Judge access must be restricted through RBAC.

A judge should only see submissions they are authorized to evaluate.

---

# 43. Evaluation Integrity

The system should maintain an audit trail.

Record:

* Judge
* Submission
* Score
* Timestamp
* Changes
* Comments

After evaluation is finalized, scores should become immutable unless an authorized admin reopens them.

---

# 44. Result Calculation

System calculates:

* Total score
* Rank
* Winner
* Runner-up
* Finalists
* Special awards

Example:

```text
Rank 1 → Team Alpha → 91.5
Rank 2 → Team Beta  → 89.0
Rank 3 → Team Gamma → 86.5
```

Admin has final authority to approve and publish results.

---

# 45. Result Publication

Public results page contains:

* Hackathon name
* Winner
* Runner-up
* Finalists
* Special awards
* Team members
* College
* Winning project

The client can decide whether scores are publicly displayed.

---

# 46. Certificates

Certificate types:

* Participation
* Finalist
* Winner
* Runner-up
* Special Recognition

Certificate contains:

* Participant name
* Hackathon name
* Achievement
* Date
* Organizer
* Certificate ID
* QR code
* Verification URL

---

# 47. Certificate Verification

Each certificate gets a unique identifier.

Example:

```text
EMB-HACK-2026-000184
```

Public verification URL:

```text
embark.com/certificate/EMB-HACK-2026-000184
```

Verification page displays:

* Name
* Hackathon
* Achievement
* Issue date
* Certificate ID
* Status

Possible statuses:

```text
VALID
REVOKED
EXPIRED
```

Certificates should ideally use a generated PDF stored in object storage.

---

# 48. Student Achievement Profile

Student profiles should accumulate verified achievements.

Example:

## Rahul Sharma

MBA — ABC Business School

### Embark Achievements

* 3 Hackathons
* 1 Winner
* 1 Finalist
* 4 Certificates
* 5 Expert Sessions

This gives the student a persistent professional identity within Embark.

---

# 49. Notifications

Notifications are required across the platform.

## Email

Use:

**Resend** or **Amazon SES**

Recommended for developer experience:

**Resend**

Email events:

* Welcome
* Email verification
* Password reset
* Booking confirmation
* Booking reminder
* Payment confirmation
* Priority DM received
* Priority DM response
* Package purchase
* Hackathon registration
* Submission confirmation
* Submission deadline reminder
* Result publication
* Certificate issued

---

# 50. In-App Notifications

Users should have a notification center.

Example:

> Your session with Rahul is tomorrow at 6:00 PM.

> Hackathon submission deadline is tomorrow.

> Your Priority DM has been answered.

Notification fields:

* Type
* Title
* Message
* Read/unread
* Entity reference
* Created timestamp

---

# 51. WhatsApp Notifications

WhatsApp can be considered for high-value transactional notifications.

Potential notifications:

* Booking confirmation
* Session reminder
* Hackathon deadline reminder
* Result announcement

Implementation can use:

**Meta WhatsApp Business API**

or a provider such as:

**Twilio / Gupshup**

This should remain optional depending on the client's operational requirements and cost.

---

# 52. RBAC — Role Based Access Control

RBAC is a **core requirement**.

The system must not hard-code authorization based only on user types.

The platform must support:

> Users → Roles → Permissions

A user can have one or more roles.

A role can have many permissions.

A permission can belong to many roles.

---

# 53. RBAC Architecture

```text
USER
 │
 ├── USER_ROLE
 │       │
 │       ▼
 │      ROLE
 │       │
 │       ▼
 │   ROLE_PERMISSION
 │       │
 │       ▼
 │   PERMISSION
```

Example:

```text
Rahul
 ↓
Hackathon Judge
 ↓
hackathon.submission.view
hackathon.evaluation.create
hackathon.evaluation.update
```

---

# 54. Roles

Initial system roles:

### Super Admin

Full platform access.

### Admin

General platform management.

### Operations Admin

User, mentor, booking and transaction operations.

### Hackathon Admin

Hackathon management.

### Evaluator / Judge

Hackathon evaluation only.

### Expert / Mentor

Expert marketplace access.

### Student

Student functionality.

### Support Agent

Customer support functionality.

These roles should be configurable.

Admin must be able to create additional roles.

---

# 55. Permissions

Permissions should follow:

```text
resource.action
```

Examples:

### Users

```text
user.view
user.create
user.update
user.delete
```

### Roles

```text
role.view
role.create
role.update
role.delete
```

### Permissions

```text
permission.view
permission.assign
```

### Experts

```text
expert.view
expert.create
expert.update
expert.verify
expert.suspend
```

### Services

```text
service.view
service.create
service.update
service.delete
```

### Bookings

```text
booking.view
booking.create
booking.update
booking.cancel
```

### Payments

```text
payment.view
payment.refund
payment.reconcile
```

### Hackathons

```text
hackathon.view
hackathon.create
hackathon.update
hackathon.publish
hackathon.delete
```

### Registrations

```text
hackathon.registration.view
hackathon.registration.update
```

### Submissions

```text
hackathon.submission.view
hackathon.submission.manage
hackathon.submission.lock
```

### Evaluation

```text
hackathon.evaluation.view
hackathon.evaluation.create
hackathon.evaluation.update
hackathon.evaluation.finalize
```

### Results

```text
hackathon.result.view
hackathon.result.publish
hackathon.result.update
```

### Certificates

```text
certificate.create
certificate.issue
certificate.revoke
certificate.view
```

---

# 56. Dynamic RBAC Admin UI

Admin should be able to:

## Create Role

Example:

> "Hackathon Manager"

Then select permissions:

* Create hackathon
* Edit hackathon
* Publish hackathon
* View submissions
* Manage judges
* Publish results

Then assign role to users.

---

# 57. Permission Enforcement

Authorization must happen at the backend.

Frontend hiding a button is **not sufficient security**.

Every protected backend endpoint must validate:

```text
Authenticated user
+
Role
+
Permission
+
Resource ownership where applicable
```

Example:

```text
POST /admin/hackathons

Requires:
hackathon.create
```

---

# 58. Resource-Level Authorization

Some permissions need more than role-level access.

Example:

A judge may have:

```text
hackathon.evaluation.create
```

but should only evaluate assigned submissions.

Therefore authorization should check:

```text
User has permission
AND
Submission is assigned to user
```

This should be implemented as policy/guard logic.

---

# 59. Audit Logs

All sensitive administrative actions must be logged.

Audit events:

* User created
* User deleted
* Role created
* Permission assigned
* Expert verified
* Payment refunded
* Hackathon published
* Submission locked
* Score changed
* Result published
* Certificate issued
* Certificate revoked

Audit record:

```text
Actor
Action
Resource
Resource ID
Old value
New value
IP
Timestamp
```

---

# 60. Admin Dashboard

Admin dashboard should provide:

## Overview

* Total users
* Students
* Experts
* Verified experts
* Active hackathons
* Total registrations
* Total submissions
* Total transactions
* Gross revenue
* Platform revenue

---

# 61. User Management

Admin can:

* Search users
* Filter users
* Create users
* Edit users
* Suspend users
* Activate users
* Assign roles
* Remove roles
* Reset account access

---

# 62. Expert Management

Admin can:

* View experts
* Review verification
* Approve
* Reject
* Suspend
* View services
* View bookings
* View revenue
* View reviews

---

# 63. Transaction Management

Admin can view:

* Order ID
* Customer
* Expert
* Product
* Amount
* Commission
* Payment status
* Refund status
* Date

Admin actions:

* View
* Refund
* Reconcile
* Export

---

# 64. Hackathon Admin

Admin can:

* Create
* Edit
* Publish
* Unpublish
* Archive
* Manage registration
* Manage teams
* Manage submissions
* Manage judges
* Manage evaluation
* Finalize results
* Publish results
* Generate certificates

---

# 65. Search

The platform should provide global search where appropriate.

Search entities:

* Experts
* Hackathons
* Users
* Companies
* Colleges

Use PostgreSQL full-text search initially.

Do not introduce Elasticsearch/OpenSearch unless scale actually requires it.

---

# 66. Recommended Technology Stack

## Frontend — Web

### Next.js

Recommended:

**Next.js 15+**

Use:

* App Router
* TypeScript
* Server Components where appropriate
* Client Components where interaction is required

Why:

* Excellent React ecosystem
* SEO support
* Good performance
* Server-side rendering
* Strong routing
* Easy deployment

---

# 67. Frontend UI

### React

Primary frontend framework through Next.js.

### Tailwind CSS

For styling.

### shadcn/ui

For reusable UI components.

### React Hook Form

For forms.

### Zod

For frontend/backend-compatible schema validation.

### TanStack Query

For client-side server state where needed.

---

# 68. Backend

Recommended:

## NestJS + TypeScript

NestJS provides:

* Modular architecture
* Dependency injection
* Guards
* Interceptors
* Middleware
* Validation
* Authentication
* Authorization
* Good enterprise structure

This is particularly useful because Embark has:

* RBAC
* Payments
* Hackathons
* Evaluation
* Notifications
* Multiple user roles

Recommended architecture:

```text
Next.js
    ↓
API
    ↓
NestJS
    ↓
PostgreSQL
    ↓
Redis
```

---

# 69. API Architecture

Use REST APIs initially.

Example:

```text
/api/v1/auth
/api/v1/users
/api/v1/experts
/api/v1/services
/api/v1/bookings
/api/v1/priority-dms
/api/v1/packages
/api/v1/payments
/api/v1/hackathons
/api/v1/registrations
/api/v1/teams
/api/v1/submissions
/api/v1/evaluations
/api/v1/results
/api/v1/certificates
/api/v1/notifications
/api/v1/admin
```

GraphQL is not necessary for the initial version.

---

# 70. Database

## PostgreSQL

Primary database:

**PostgreSQL 16+**

PostgreSQL is recommended because Embark has highly relational data:

* Users
* Roles
* Permissions
* Experts
* Services
* Bookings
* Payments
* Hackathons
* Teams
* Submissions
* Evaluations
* Certificates

---

# 71. ORM

Recommended:

## Prisma

Benefits:

* Type-safe queries
* TypeScript integration
* Migrations
* Developer productivity
* Strong schema management

Alternative:

TypeORM.

Recommended choice:

**Prisma + PostgreSQL**

---

# 72. Redis

Use:

## Redis

Primary use cases:

### Caching

Examples:

* Expert profiles
* Hackathon listing
* Frequently accessed configuration

### Rate limiting

Examples:

* Login attempts
* OTP attempts
* API requests
* DM creation

### Sessions

If required.

### Distributed locks

Useful for:

* Booking slot protection
* Payment processing
* Preventing duplicate operations

### Queues

Use Redis with:

**BullMQ**

---

# 73. Background Jobs

Use:

## BullMQ + Redis

Background jobs:

* Email
* Notifications
* WhatsApp messages
* Booking reminders
* Hackathon reminders
* Certificate generation
* Payment reconciliation
* Payout processing
* Cleanup jobs

Example:

```text
Booking created
      ↓
Queue job
      ↓
Email confirmation
      ↓
Reminder job scheduled
      ↓
Reminder sent
```

---

# 74. Object Storage

Files should not be stored directly inside PostgreSQL.

Use:

## Amazon S3

Store:

* Resumes
* Profile images
* Hackathon submissions
* PDFs
* PPTs
* Certificates
* Supporting documents

Alternative:

Cloudflare R2.

Recommended:

**Amazon S3**

---

# 75. CDN

Use:

## CloudFront

for:

* Images
* Public files
* Certificate PDFs
* Static assets where required

---

# 76. Payment Gateway

Recommended:

## Razorpay

Use for:

* Payment orders
* UPI
* Cards
* Net banking
* Refunds
* Payment verification
* Payouts where supported

Payment webhooks must be implemented.

Never rely solely on frontend payment success.

Backend must verify payment through:

1. Signature validation
2. Payment provider API
3. Webhook events

---

# 77. Authentication

Recommended:

### Custom Auth using NestJS

with:

* JWT access token
* Refresh token
* Argon2id password hashing
* Google OAuth

Access tokens should be short-lived.

Refresh tokens should be securely managed.

For web applications, prefer secure:

```text
HttpOnly
Secure
SameSite
```

cookies for refresh/session credentials.

---

# 78. Email

Recommended:

## Resend

Use for:

* Verification
* Password reset
* Booking confirmation
* Notifications
* Hackathon updates
* Certificate notifications

---

# 79. Monitoring

Recommended:

### Sentry

For:

* Frontend errors
* Backend errors
* API exceptions
* Performance monitoring

---

# 80. Application Monitoring

Use:

### OpenTelemetry

for structured observability where appropriate.

Track:

* API latency
* Database latency
* Queue failures
* Payment failures
* Background job failures

---

# 81. Logging

Backend logging should use structured JSON logs.

Recommended:

**Pino**

Every request should include:

* Request ID
* User ID if authenticated
* Endpoint
* Method
* Status
* Response time

---

# 82. Analytics

Product analytics:

### PostHog

Track:

* User registration
* Profile completion
* Expert discovery
* Service views
* Booking initiation
* Payment success
* Priority DM
* Package purchase
* Hackathon registration
* Submission
* Certificate download

This will help understand the funnel.

---

# 83. Infrastructure

Recommended initial infrastructure:

### Frontend

**Vercel**

for Next.js.

### Backend

Either:

**AWS ECS/Fargate**

or

**AWS App Runner**

For a growing production system, ECS/Fargate is preferable.

### Database

**Amazon RDS PostgreSQL**

### Redis

**Amazon ElastiCache Redis**

### Storage

**Amazon S3**

### CDN

**CloudFront**

### DNS

**Route 53**

---

# 84. Deployment Architecture

```text
                    INTERNET
                       │
                       ▼
                  CloudFront
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
           Next.js           API Gateway/
            Vercel           Load Balancer
                                │
                                ▼
                             NestJS
                                │
             ┌──────────────────┼─────────────────┐
             │                  │                 │
             ▼                  ▼                 ▼
        PostgreSQL            Redis              S3
          RDS              ElastiCache          Storage
             │                  │
             │                  ▼
             │               BullMQ
             │                  │
             │         ┌────────┼────────┐
             │         ▼        ▼        ▼
             │       Email   WhatsApp  Jobs
             │
             ▼
        Application Data
```

---

# 85. Database — Core Entities

Recommended core entities:

```text
User
Role
Permission
UserRole
RolePermission
AuditLog

StudentProfile
ExpertProfile
ExpertVerification

Service
ServiceAvailability
Booking
BookingParticipant

PriorityDM
PriorityDMMessage

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

Hackathon
HackathonRule
HackathonTimeline
HackathonRegistration
HackathonTeam
HackathonTeamMember
HackathonSubmission
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
```

---

# 86. Core Relationship Model

```text
User
 │
 ├── StudentProfile
 │
 ├── ExpertProfile
 │
 └── UserRole
        │
        ▼
       Role
        │
        ▼
    Permission


ExpertProfile
      │
      ├── Services
      │      ├── 1:1
      │      ├── Priority DM
      │      └── Packages
      │
      └── Reviews


Student
   │
   ├── Bookings
   ├── Priority DMs
   ├── Package Purchases
   ├── Hackathon Registrations
   └── Certificates


Hackathon
   │
   ├── Registrations
   ├── Teams
   ├── Submissions
   ├── Judges
   ├── Evaluations
   ├── Results
   └── Certificates
```

---

# 87. Important Database Design Principles

Use:

* UUID primary keys
* Created timestamps
* Updated timestamps
* Soft deletion where appropriate
* Foreign key constraints
* Database transactions for financial operations

Financial records should generally never be physically deleted.

---

# 88. API Security

Backend must implement:

* JWT authentication
* RBAC
* Resource authorization
* Rate limiting
* Input validation
* File validation
* Malware scanning where required
* SQL injection protection through ORM
* CSRF protection where applicable
* Secure HTTP headers
* CORS configuration

---

# 89. File Upload Security

User uploads must be validated.

Check:

* MIME type
* Extension
* File size
* File signature

Do not trust filename extensions.

Uploads should use:

### Presigned S3 URLs

Flow:

```text
Client
 ↓
Request upload URL
 ↓
Backend validates permission
 ↓
S3 presigned URL
 ↓
Client uploads directly to S3
 ↓
Backend stores metadata
```

This prevents large files from unnecessarily passing through the application server.

---

# 90. Hackathon File Restrictions

Admin should configure:

* Maximum file size
* Allowed extensions
* Number of files
* Required files

Example:

```text
PDF ≤ 20MB
PPTX ≤ 50MB
ZIP ≤ 100MB
```

Exact values should be configurable.

---

# 91. Booking Concurrency

Booking systems must prevent double booking.

Example:

Two students attempt to book:

> 6:00 PM

simultaneously.

Only one should succeed.

Use:

* PostgreSQL transaction
* Row-level locking where appropriate
* Redis distributed lock if required

The database must remain the final source of truth.

---

# 92. Payment Security

Payment states must be server-controlled.

Never mark:

```text
order = PAID
```

based only on frontend response.

Use:

```text
Frontend payment
       ↓
Payment provider
       ↓
Webhook
       ↓
Backend verification
       ↓
Order marked PAID
```

---

# 93. Hackathon Deadline Enforcement

The backend must enforce deadlines.

Example:

If:

```text
submission_deadline = 11:59 PM
```

then after the deadline:

```text
POST /submissions
```

must fail even if the frontend still displays a submission button.

All dates should be stored in UTC.

Display them according to the user's timezone.

---

# 94. Certificate Generation Architecture

Certificate creation should happen asynchronously.

```text
Result finalized
      ↓
Queue job
      ↓
Generate certificate
      ↓
Upload PDF to S3
      ↓
Create certificate record
      ↓
Generate verification ID
      ↓
Notify participant
```

---

# 95. Certificate Security

Each certificate should contain:

* Unique ID
* QR code
* Verification URL

QR code should point to the official Embark domain.

Certificate verification must not expose unnecessary personal information.

---

# 96. Admin Controls

The client should have configuration controls for:

* Platform commission
* Service categories
* Expert verification rules
* Hackathon categories
* Certificate templates
* Email templates
* Notification templates
* Supported file types
* Maximum file sizes
* Cancellation policy
* Refund policy
* User roles
* Permissions

---

# 97. Admin Role Management UI

Admin navigation:

```text
Administration
│
├── Users
├── Roles
├── Permissions
└── Audit Logs
```

Role creation:

```text
Create Role

Name:
Description:

Permissions:

☑ user.view
☑ user.update

☑ expert.view
☑ expert.verify

☑ hackathon.view
☑ hackathon.create
☑ hackathon.update
☑ hackathon.publish

☑ submission.view
☑ evaluation.create
☑ evaluation.update

[Create Role]
```

---

# 98. Student Navigation

Recommended:

```text
Home
Explore Experts
Hackathons
My Bookings
My DMs
My Packages
My Certificates
My Profile
Notifications
```

---

# 99. Expert Navigation

```text
Dashboard
My Profile
My Services
Bookings
Priority DMs
Packages
Customers
Reviews
Earnings
Payouts
Notifications
Settings
```

---

# 100. Admin Navigation

```text
Dashboard

Users
Experts
Students

Marketplace
 ├── Services
 ├── Bookings
 ├── Priority DMs
 ├── Packages
 └── Reviews

Payments
 ├── Transactions
 ├── Refunds
 ├── Commissions
 └── Payouts

Hackathons
 ├── All Hackathons
 ├── Registrations
 ├── Teams
 ├── Submissions
 ├── Judges
 ├── Evaluations
 ├── Results
 └── Certificates

Administration
 ├── Users
 ├── Roles
 ├── Permissions
 ├── Settings
 └── Audit Logs
```

---

# 101. Key User Journey — Student

```text
Register
 ↓
Complete profile
 ↓
Select career goals
 ↓
Explore experts
 ↓
View expert profile
 ↓
Choose:
   1:1
   Priority DM
   Package
 ↓
Payment
 ↓
Service delivery
 ↓
Review
```

Parallel journey:

```text
Explore Hackathons
 ↓
Open Hackathon
 ↓
Read problem
 ↓
Register
 ↓
Create/join team
 ↓
Work on challenge
 ↓
Submit
 ↓
Evaluation
 ↓
Results
 ↓
Certificate
 ↓
Profile updated
```

---

# 102. Key User Journey — Expert

```text
Register
 ↓
Complete expert profile
 ↓
Submit verification
 ↓
Admin verifies
 ↓
Create service
 ↓
Set price
 ↓
Set availability
 ↓
Publish
 ↓
Receive booking/DM/package
 ↓
Deliver service
 ↓
Receive earnings
 ↓
Get review
```

---

# 103. Key User Journey — Hackathon Admin

```text
Create Hackathon
 ↓
Configure timeline
 ↓
Configure eligibility
 ↓
Add problem statement
 ↓
Add rules
 ↓
Publish
 ↓
Registrations
 ↓
Hackathon starts
 ↓
Submissions
 ↓
Lock submissions
 ↓
Assign judges
 ↓
Manual evaluation
 ↓
Finalize scores
 ↓
Publish results
 ↓
Generate certificates
```

---

# 104. Non-Functional Requirements

## Performance

Target:

* Page load: < 2.5 seconds under normal conditions
* API p95: < 500ms for normal CRUD operations
* Search p95: < 500ms initially

Heavy operations should be asynchronous.

---

# 105. Availability

Target initial availability:

**99.5%+**

Production infrastructure should support:

* Health checks
* Automated deployment
* Database backups
* Monitoring
* Error tracking

---

# 106. Scalability

Architecture should support scaling:

```text
1,000 users
→ 10,000 users
→ 100,000 users
```

Application servers should be horizontally scalable.

PostgreSQL should be optimized before introducing additional databases.

---

# 107. Database Backup

RDS PostgreSQL:

* Automated daily backups
* Point-in-time recovery
* Backup retention

Critical data should not depend on application servers.

---

# 108. Disaster Recovery

At minimum:

* Database backups
* S3 versioning where appropriate
* Infrastructure as code
* Environment configuration backups
* Recovery documentation

---

# 109. Environments

Maintain:

```text
Development
Staging
Production
```

No developer should directly test against production.

---

# 110. CI/CD

Recommended:

### GitHub Actions

Pipeline:

```text
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
Deploy production
```

---

# 111. Testing

## Unit Tests

Backend:

* Services
* Authorization
* Payment logic
* Evaluation calculations
* Certificate logic

## Integration Tests

* Database
* Payment
* Booking
* Hackathon registration
* Submission

## E2E Tests

Critical flows:

### Student

Register → book → pay

### Expert

Create service → receive booking

### Hackathon

Register → submit → evaluate → result → certificate

---

# 112. Critical Business Rules

## Booking

A slot cannot be booked by two users.

## Payment

Service cannot be marked paid without backend verification.

## Priority DM

Expert must respond within configured response window.

## Package

A package cannot be used beyond its allowed quantity.

## Hackathon

Registration closes according to configured deadline.

## Submission

Submission cannot be modified after deadline.

## Evaluation

Only assigned judges can evaluate their assigned submissions.

## Results

Results cannot be publicly published until authorized admin approval.

## Certificates

Certificate is issued only after result/participation status is finalized.

---

# 113. Initial Analytics / KPIs

## Marketplace

### Supply

* Total experts
* Verified experts
* Active experts
* Services per expert

### Demand

* Students
* Active students
* Expert profile views
* Service views

### Conversion

* Profile → service view
* Service view → booking
* Booking → payment
* Payment → completed session

### Revenue

* GMV
* Platform revenue
* Average transaction value
* Revenue per expert

---

# 114. Hackathon KPIs

Track:

* Hackathons created
* Registrations
* Unique participants
* Teams
* Submission rate
* Submission completion rate
* Evaluation completion rate
* Certificates issued
* Certificate downloads
* Repeat participation

---

# 115. Product Funnel

The overall funnel should be measurable:

```text
Visitor
 ↓
Registration
 ↓
Profile completion
 ↓
Expert discovery / Hackathon discovery
 ↓
Service purchase / Hackathon registration
 ↓
Successful participation
 ↓
Outcome
 ↓
Repeat engagement
```

---

# 116. Core Product Flywheel

The intended ecosystem is:

```text
                    STUDENTS
                       │
                       ▼
                  HACKATHONS
                       │
                       ▼
                 SKILL BUILDING
                       │
                       ▼
                  ACHIEVEMENTS
                       │
                       ▼
                EMBARK PROFILE
                       │
                       ▼
               NEED EXPERT HELP
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
            1:1       DM      PACKAGE
             │         │         │
             └─────────┼─────────┘
                       ▼
                   MENTORSHIP
                       │
                       ▼
                    OUTCOME
                       │
                       ▼
                 MORE TRUST
                       │
                       ▼
                 MORE STUDENTS
```

Experts also create a second loop:

```text
Expert
 ↓
Mentor
 ↓
Earn
 ↓
Build reputation
 ↓
Judge Hackathons
 ↓
Become community contributor
 ↓
Attract more students
```

---

# 117. Product Differentiation

Embark should not position itself as a generic Topmate clone.

### Topmate

> Expertise monetization platform.

### Embark

> Career ecosystem for business-school students.

Topmate primarily asks:

> "Who can you learn from?"

Embark should ask:

> "What are you trying to achieve, and who can help you achieve it?"

The hackathon layer creates an additional differentiator:

> **Learn → Practice → Prove**

---

# 118. Embark's Core Product Loop

The complete vision can be summarized as:

```text
DISCOVER
   ↓
CONNECT
   ↓
LEARN
   ↓
PRACTICE
   ↓
COMPETE
   ↓
PROVE
   ↓
BUILD CREDIBILITY
   ↓
CONNECT AGAIN
```

Mentorship enables:

> **Learn**

Hackathons enable:

> **Practice + Prove**

Certificates enable:

> **Credibility**

Marketplace enables:

> **Connection + Monetization**

---

# 119. Recommended Final Technology Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Web               | Next.js + TypeScript                |
| UI                | Tailwind CSS + shadcn/ui            |
| Forms             | React Hook Form + Zod               |
| Client State      | TanStack Query                      |
| Backend           | NestJS + TypeScript                 |
| API               | REST                                |
| ORM               | Prisma                              |
| Database          | PostgreSQL                          |
| Cache             | Redis                               |
| Queue             | BullMQ                              |
| Object Storage    | Amazon S3                           |
| CDN               | CloudFront                          |
| Payments          | Razorpay                            |
| Email             | Resend                              |
| Auth              | JWT + Refresh Tokens + Google OAuth |
| Password Hashing  | Argon2id                            |
| Monitoring        | Sentry                              |
| Product Analytics | PostHog                             |
| Logging           | Pino                                |
| CI/CD             | GitHub Actions                      |
| Frontend Hosting  | Vercel                              |
| Backend Hosting   | AWS ECS/Fargate                     |
| Database Hosting  | AWS RDS PostgreSQL                  |
| Redis Hosting     | AWS ElastiCache                     |
| DNS               | Route 53                            |
| Messaging         | Meta WhatsApp API / Gupshup         |
| Testing           | Jest + Playwright                   |
| API Documentation | Swagger / OpenAPI                   |

---

# 120. Recommended Architecture

The recommended architecture is a **modular monolith**, not microservices.

```text
                    Next.js
                       │
                       ▼
                NestJS Application
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 PostgreSQL          Redis            S3
       │               │
       │             BullMQ
       │               │
       │       ┌───────┼────────┐
       │       ▼       ▼        ▼
       │     Email  WhatsApp  Jobs
       │
       ▼
   Core Domain
```

NestJS modules:

```text
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

This keeps the initial system maintainable while allowing individual modules to be extracted into services later if the scale genuinely requires it.

---

# 121. MVP Definition

The first production version should contain:

## Student

* Registration/login
* Profile
* Expert discovery
* Expert profile
* 1:1 booking
* Priority DM
* Packages
* Payment
* Reviews
* Hackathon discovery
* Hackathon registration
* Team management
* Submission
* Results
* Certificates

## Expert

* Registration
* Profile
* Verification
* Services
* Availability
* 1:1
* Priority DM
* Packages
* Bookings
* Earnings
* Reviews

## Hackathon

* Create
* Publish
* Registration
* Teams
* Submission
* Manual evaluation
* Judge assignment
* Results
* Certificates
* Certificate verification

## Admin

* Dashboard
* Users
* Experts
* Roles
* Permissions
* Services
* Bookings
* Payments
* Refunds
* Hackathons
* Registrations
* Teams
* Submissions
* Judges
* Evaluations
* Results
* Certificates
* Audit logs
* Platform settings

---

# 122. Explicitly Out of Scope for Initial Product

To keep the first build focused, the following are not required:

* AI-based mentor matching
* AI-based hackathon evaluation
* Full LMS/course platform
* Instagram Auto-DM
* Social feed
* Community forum
* Advanced corporate recruitment marketplace
* Complex gamification
* Subscription memberships
* Automated expert-content generation
* Full CRM
* Advanced recommendation engine
* Microservices architecture

The core product should first prove:

> **Students will pay experts for access AND students will participate in Embark hackathons.**

---

# 123. Final Product Definition

Embark should be understood as:

> **A specialized career-development and expert marketplace platform for Tier-2 business-school students.**

It combines:

### Expert Marketplace

* 1:1 Sessions
* Priority DMs
* Packages
* Payments
* Reviews
* Expert verification

### Career Development

* Hackathons
* Registrations
* Teams
* Submissions
* Manual evaluation
* Results
* Certificates
* Certificate verification

### Career Identity

* Student profile
* Verified achievements
* Hackathon history
* Certificates
* Mentorship history

### Platform Infrastructure

* Authentication
* RBAC
* Payments
* Notifications
* File storage
* Audit logs
* Analytics
* Admin management

The central product loop is:

> **Learn → Practice → Prove → Build credibility → Connect → Advance.**

And the central business loop is:

> **Hackathons acquire students → mentorship monetizes student intent → achievements build retention and trust → successful students and professionals strengthen the network.**
