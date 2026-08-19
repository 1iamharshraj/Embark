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

