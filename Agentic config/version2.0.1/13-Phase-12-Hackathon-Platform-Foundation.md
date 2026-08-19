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

