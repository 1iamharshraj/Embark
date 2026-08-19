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

