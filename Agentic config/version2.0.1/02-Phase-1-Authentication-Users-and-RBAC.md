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

