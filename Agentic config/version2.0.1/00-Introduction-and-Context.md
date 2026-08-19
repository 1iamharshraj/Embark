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

