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

