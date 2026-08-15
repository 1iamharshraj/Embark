-- Permissions used by the new Institution and Recruiter roles.
INSERT INTO "Permission" (id, resource, action, description)
VALUES
  (gen_random_uuid(), 'lecture', 'create', 'Create lecture requests'),
  (gen_random_uuid(), 'job', 'view', 'View job postings'),
  (gen_random_uuid(), 'job', 'create', 'Create job postings')
ON CONFLICT (resource, action) DO NOTHING;

-- New persona roles.
INSERT INTO "Role" (id, name, description, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Institution', 'College or institute requesting guest lectures', now(), now()),
  (gen_random_uuid(), 'Recruiter', 'Company or recruiter looking to hire students', now(), now())
ON CONFLICT (name) DO NOTHING;

-- Institution permissions: lecture.view/create + user.view.
INSERT INTO "RolePermission" (id, "roleId", "permissionId")
SELECT gen_random_uuid(), r.id, p.id
FROM "Role" r, "Permission" p
WHERE r.name = 'Institution'
  AND (
    (p.resource = 'lecture' AND p.action IN ('view', 'create'))
    OR (p.resource = 'user' AND p.action = 'view')
  )
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Recruiter permissions: job.view/create + user.view.
INSERT INTO "RolePermission" (id, "roleId", "permissionId")
SELECT gen_random_uuid(), r.id, p.id
FROM "Role" r, "Permission" p
WHERE r.name = 'Recruiter'
  AND (
    (p.resource = 'job' AND p.action IN ('view', 'create'))
    OR (p.resource = 'user' AND p.action = 'view')
  )
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
