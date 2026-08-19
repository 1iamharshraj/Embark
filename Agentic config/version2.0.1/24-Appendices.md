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
