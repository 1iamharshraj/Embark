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

