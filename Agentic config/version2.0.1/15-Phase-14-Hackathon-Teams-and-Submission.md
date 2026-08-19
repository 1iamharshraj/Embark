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

