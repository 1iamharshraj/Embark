# Embark 2.0.0 — Data Model

> Prisma schema and seed plan for the 2.0.0 backend.

## 1. Schema design principles

- UUID/CUID primary keys (Prisma `@id @default(cuid())` or `@id @default(uuid())`).
- `createdAt` and `updatedAt` on every table.
- Soft deletion via `deletedAt` where needed.
- Immutable financial records: `Order`, `Payment`, `Refund`, `Commission`, `Payout` are append-only.
- JSON fields for flexible content (problem statements, criteria, package content).
- Foreign key constraints with `onDelete: Cascade` for tightly coupled relations.
- Database transactions for payment and booking state changes.

## 2. Prisma schema (v2.0.0)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// -------------------------
// Auth & RBAC
// -------------------------

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String?   // argon2id hash; null for OAuth users
  name          String
  phone         String?
  image         String?
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  roles         UserRole[]
  auditLogs     AuditLog[]
  notifications Notification[]

  studentProfile StudentProfile?
  expertProfile  ExpertProfile?

  hackathonRegistrations HackathonRegistration[]
  teamMembers            HackathonTeamMember[]
  hackathonSubmissions   HackathonSubmission[]
  evaluations            Evaluation[]
  judgeAssignments       JudgeAssignment[]
  certificates           Certificate[]

  servicesCreated Service[]
  bookingsAsClient Booking[]      @relation("BookingClient")
  bookingsAsExpert Booking[]      @relation("BookingExpert")
  priorityDMs      PriorityDM[]   @relation("PriorityDMStudent")
  dmResponses      PriorityDM[] @relation("PriorityDMExpert")
  packagesCreated  Package[]
  packagePurchases PackagePurchase[]
  reviewsGiven     Review[]       @relation("ReviewStudent")
  reviewsReceived  Review[]       @relation("ReviewExpert")
  orders           Order[]
  payouts          Payout[]

  walletTransactions WalletTransaction[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       UserRole[]
  permissions RolePermission[]
}

model Permission {
  id          String   @id @default(cuid())
  resource    String   // e.g. "hackathon"
  action      String   // e.g. "create"
  description String?
  createdAt   DateTime @default(now())

  roles RolePermission[]

  @@unique([resource, action])
}

model UserRole {
  id     String @id @default(cuid())
  userId String
  roleId String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
}

model RolePermission {
  id           String @id @default(cuid())
  roleId       String
  permissionId String

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
}

// -------------------------
// Profiles
// -------------------------

model StudentProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  college          String?
  degree           String?
  specialization   String?
  graduationYear   Int?
  currentSemester  String?
  targetIndustry   String?
  targetRoles      String[]
  skills           String[]
  interests        String[]
  bio              String?
  linkedIn         String?
  portfolio        String?
  resumeUrl        String?
  location         String?
  isPublic         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ExpertProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  headline          String?
  bio               String?
  location          String?
  bSchool           String?
  degree            String?
  specialization    String?
  graduationYear    Int?
  currentCompany    String?
  currentRole       String?
  previousCompanies String[]
  yearsExperience   Int?
  industry          String?
  function          String?
  expertise         String[]
  verificationStatus String   @default("UNVERIFIED") // UNVERIFIED PENDING_VERIFICATION VERIFIED REJECTED SUSPENDED
  verificationNote  String?
  sessionsCompleted Int      @default(0)
  studentsHelped    Int      @default(0)
  rating            Float    @default(0)
  reviewCount       Int      @default(0)
  isPublic          Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user               User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  verifications      ExpertVerification[]
  services           Service[]
  availabilities     ServiceAvailability[]
  packages           Package[]
}

model ExpertVerification {
  id              String   @id @default(cuid())
  expertProfileId String
  status          String   @default("PENDING_VERIFICATION")
  educationProof  String?
  employmentProof String?
  linkedInUrl     String?
  resumeUrl       String?
  supportingDocs  String[]
  adminNote       String?
  reviewedById    String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  expertProfile ExpertProfile @relation(fields: [expertProfileId], references: [id], onDelete: Cascade)
}

// -------------------------
// Marketplace: Services
// -------------------------

model Service {
  id              String   @id @default(cuid())
  expertProfileId String
  type            String   // ONE_ON_ONE | PRIORITY_DM | PACKAGE
  name            String
  description     String?
  category        String?
  durationMinutes Int?
  price           Int      // INR paise
  currency        String   @default("INR")
  bufferMinutes   Int      @default(0)
  cancellationPolicy String?
  intakeQuestions Json?    // [{question, type, required}]
  meetingMethod   String?  // GOOGLE_MEET | ZOOM | PHONE | OTHER
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  expertProfile ExpertProfile @relation(fields: [expertProfileId], references: [id], onDelete: Cascade)
  bookings      Booking[]
  packageItems  PackageItem[]
}

model ServiceAvailability {
  id              String   @id @default(cuid())
  expertProfileId String
  dayOfWeek       Int      // 0-6
  startTime       String   // "HH:mm"
  endTime         String   // "HH:mm"
  timeZone        String   @default("Asia/Kolkata")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  expertProfile ExpertProfile @relation(fields: [expertProfileId], references: [id], onDelete: Cascade)
}

model Booking {
  id          String   @id @default(cuid())
  serviceId   String
  clientId    String
  expertId    String
  scheduledAt DateTime
  durationMinutes Int
  status      String   @default("PENDING_PAYMENT") // PENDING_PAYMENT CONFIRMED RESCHEDULE_REQUESTED RESCHEDULED CANCELLED NO_SHOW IN_PROGRESS COMPLETED REFUNDED
  intakeResponses Json?
  meetingLink String?
  amount      Int
  platformFee Int
  expertEarnings Int
  cancellationReason String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  service       Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  client        User          @relation("BookingClient", fields: [clientId], references: [id], onDelete: Cascade)
  expert        User          @relation("BookingExpert", fields: [expertId], references: [id], onDelete: Cascade)
  order         Order?
  review        Review?
}

model PriorityDM {
  id          String   @id @default(cuid())
  expertId    String
  studentId   String
  title       String
  question    String
  context     String?
  attachments String[]
  response    String?
  responseAttachments String[]
  responseAt  DateTime?
  status      String   @default("PENDING_PAYMENT") // PENDING_PAYMENT PAID ASSIGNED IN_PROGRESS RESPONDED COMPLETED CANCELLED REFUNDED EXPIRED
  amount      Int
  platformFee Int
  expertEarnings Int
  dueHours    Int      @default(48)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  expert  User  @relation("PriorityDMExpert", fields: [expertId], references: [id], onDelete: Cascade)
  student User  @relation("PriorityDMStudent", fields: [studentId], references: [id], onDelete: Cascade)
  order   Order?
  review  Review?
}

// -------------------------
// Packages
// -------------------------

model Package {
  id              String   @id @default(cuid())
  expertProfileId String
  name            String
  description     String?
  price           Int
  currency        String   @default("INR")
  validityDays    Int
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  expertProfile ExpertProfile @relation(fields: [expertProfileId], references: [id], onDelete: Cascade)
  items         PackageItem[]
  purchases     PackagePurchase[]
}

model PackageItem {
  id        String @id @default(cuid())
  packageId String
  serviceId String
  quantity  Int

  package Package @relation(fields: [packageId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
}

model PackagePurchase {
  id            String   @id @default(cuid())
  packageId     String
  studentId     String
  status        String   @default("ACTIVE") // ACTIVE PARTIALLY_USED COMPLETED EXPIRED CANCELLED
  validUntil    DateTime
  amount        Int
  platformFee   Int
  expertEarnings Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  package Package @relation(fields: [packageId], references: [id], onDelete: Cascade)
  student User    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  order   Order?
  usages  PackageUsage[]
}

model PackageUsage {
  id                String   @id @default(cuid())
  purchaseId        String
  serviceType       String
  relatedBookingId  String?
  relatedDmId       String?
  quantityUsed      Int      @default(1)
  usedAt            DateTime @default(now())

  purchase PackagePurchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
}

// -------------------------
// Payments & Wallet
// -------------------------

model Order {
  id               String   @id @default(cuid())
  userId           String
  type             String   // BOOKING | PRIORITY_DM | PACKAGE | HACKATHON_FEE | PLAYBOOK
  status           String   @default("PENDING") // PENDING PAID FAILED REFUNDED CANCELLED
  amount           Int
  currency         String   @default("INR")
  razorpayOrderId  String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  payment  Payment?
  refund   Refund?
  booking  Booking?
  dm       PriorityDM?
  purchase PackagePurchase?
  commission Commission?
}

model Payment {
  id                String   @id @default(cuid())
  orderId           String   @unique
  status            String   // AUTHORIZED CAPTURED FAILED
  razorpayPaymentId String
  razorpaySignature String?
  amount            Int
  capturedAt        DateTime?
  createdAt         DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model Refund {
  id                String   @id @default(cuid())
  orderId           String   @unique
  amount            Int
  reason            String?
  status            String   @default("PENDING") // PENDING PROCESSED FAILED
  razorpayRefundId  String?
  processedAt       DateTime?
  createdAt         DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model Commission {
  id              String   @id @default(cuid())
  orderId         String   @unique
  rate            Float
  platformAmount  Int
  expertAmount    Int
  createdAt       DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model WalletTransaction {
  id          String   @id @default(cuid())
  userId      String
  type        String   // CREDIT DEBIT HOLD RELEASE
  amount      Int
  currency    String   @default("INR")
  description String?
  referenceType String? // BOOKING | PRIORITY_DM | PACKAGE | PAYOUT
  referenceId String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Payout {
  id                String   @id @default(cuid())
  userId            String
  amount            Int
  currency          String   @default("INR")
  status            String   @default("PENDING") // PENDING APPROVED REJECTED PROCESSED
  method            String?  // BANK | UPI
  accountDetails    Json?
  processedAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// -------------------------
// Reviews
// -------------------------

model Review {
  id          String   @id @default(cuid())
  studentId   String
  expertId    String
  bookingId   String?  @unique
  dmId        String?  @unique
  rating      Int
  text        String?
  status      String   @default("PENDING") // PENDING PUBLISHED HIDDEN REMOVED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  student User        @relation("ReviewStudent", fields: [studentId], references: [id], onDelete: Cascade)
  expert  User        @relation("ReviewExpert", fields: [expertId], references: [id], onDelete: Cascade)
  booking Booking?    @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  dm      PriorityDM? @relation(fields: [dmId], references: [id], onDelete: SetNull)
}

// -------------------------
// Hackathons
// -------------------------

model Hackathon {
  id                  String   @id @default(cuid())
  slug                String   @unique
  title               String
  subtitle            String?
  banner              String?
  bannerUrl           String?
  logoUrl             String?
  status              String   @default("DRAFT") // DRAFT PUBLISHED REGISTRATION_OPEN REGISTRATION_CLOSED ACTIVE SUBMISSION_OPEN SUBMISSION_CLOSED EVALUATION RESULTS_FINALIZED RESULTS_PUBLISHED CERTIFICATES_ISSUED ARCHIVED
  shortDescription    String?
  detailedDescription String?
  organizer           String?
  category            String?
  tags                String[]
  participationMode   String   @default("TEAM") // INDIVIDUAL TEAM
  teamMin             Int      @default(1)
  teamMax             Int      @default(4)
  eligibility         Json?    // {colleges[], courses[], years[], geography[]}
  fee                 Int      @default(0)
  rules               Json?    // [{title, content}]
  problemStatement    Json?    // {background, problem, objectives, output, constraints, resources}
  evaluationCriteria  Json?    // [{name, weight, description}]
  resources           Json?    // [{name, url}]
  faqs                Json?    // [{q, a}]
  timeline            Json?    // stored as structured milestones; see HackathonTimeline
  settings            Json?    // {maxFileSize, allowedTypes, submissionFields[]}
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  timelines      HackathonTimeline[]
  registrations  HackathonRegistration[]
  teams          HackathonTeam[]
  submissions    HackathonSubmission[]
  judges         Judge[]
  judgeAssignments JudgeAssignment[]
  evaluations    Evaluation[]
  results        HackathonResult[]
  certificates   Certificate[]
}

model HackathonTimeline {
  id          String   @id @default(cuid())
  hackathonId String
  phase       String   // REGISTRATION_OPEN REGISTRATION_CLOSE HACKATHON_START HACKATHON_END SUBMISSION_DEADLINE EVALUATION_START EVALUATION_DEADLINE RESULTS_PUBLICATION CERTIFICATE_ISSUANCE
  startsAt    DateTime
  endsAt      DateTime?
  createdAt   DateTime @default(now())

  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
}

model HackathonRegistration {
  id          String   @id @default(cuid())
  hackathonId String
  userId      String
  status      String   @default("REGISTERED") // REGISTERED CANCELLED
  formData    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([hackathonId, userId])
}

model HackathonTeam {
  id           String   @id @default(cuid())
  hackathonId  String
  name         String
  leaderId     String
  submissionId String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  hackathon Hackathon             @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  leader    User                  @relation(fields: [leaderId], references: [id], onDelete: Cascade)
  members   HackathonTeamMember[]
  submission HackathonSubmission?
}

model HackathonTeamMember {
  id     String @id @default(cuid())
  teamId String
  userId String
  role   String @default("MEMBER") // LEADER MEMBER

  team HackathonTeam @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
}

model HackathonSubmission {
  id          String   @id @default(cuid())
  hackathonId String
  teamId      String   @unique
  title       String
  content     Json?    // {problemUnderstanding, proposedSolution, businessImpact, ...}
  status      String   @default("DRAFT") // DRAFT SUBMITTED UPDATED LOCKED UNDER_EVALUATION EVALUATED SHORTLISTED WINNER REJECTED
  score       Float?
  rank        Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  hackathon  Hackathon      @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  team       HackathonTeam  @relation(fields: [teamId], references: [id], onDelete: Cascade)
  files      SubmissionFile[]
  evaluations  Evaluation[]
  result     HackathonResult?
}

model SubmissionFile {
  id           String @id @default(cuid())
  submissionId String
  name         String
  url          String
  type         String
  size         Int
  version      Int    @default(1)
  createdAt    DateTime @default(now())

  submission HackathonSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
}

model Judge {
  id          String @id @default(cuid())
  hackathonId String
  userId      String
  bio         String?
  createdAt   DateTime @default(now())

  hackathon    Hackathon          @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignments  JudgeAssignment[]
  evaluations  Evaluation[]

  @@unique([hackathonId, userId])
}

model JudgeAssignment {
  id           String @id @default(cuid())
  hackathonId  String
  judgeId      String
  submissionId String
  createdAt    DateTime @default(now())

  hackathon  Hackathon          @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  judge      Judge              @relation(fields: [judgeId], references: [id], onDelete: Cascade)
  submission HackathonSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@unique([judgeId, submissionId])
}

model Evaluation {
  id           String   @id @default(cuid())
  hackathonId  String
  submissionId String
  judgeId      String
  score        Float
  comment      String?
  finalizedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  hackathon  Hackathon          @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  submission HackathonSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  judge      Judge              @relation(fields: [judgeId], references: [id], onDelete: Cascade)
  scores     EvaluationScore[]

  @@unique([submissionId, judgeId])
}

model EvaluationScore {
  id            String @id @default(cuid())
  evaluationId  String
  criterionName String
  weight        Float
  score         Float
  comment       String?

  evaluation Evaluation @relation(fields: [evaluationId], references: [id], onDelete: Cascade)
}

model HackathonResult {
  id           String   @id @default(cuid())
  hackathonId  String
  submissionId String   @unique
  rank         Int
  award        String?  // WINNER RUNNER_UP FINALIST SPECIAL_RECOGNITION
  score        Float?
  publishedAt  DateTime?
  createdAt    DateTime @default(now())

  hackathon  Hackathon          @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  submission HackathonSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
}

// -------------------------
// Certificates
// -------------------------

model Certificate {
  id              String   @id @default(cuid())
  hackathonId     String
  userId          String
  type            String   // PARTICIPATION FINALIST WINNER RUNNER_UP SPECIAL_RECOGNITION
  certificateId   String   @unique
  verificationUrl String?
  pdfUrl          String?
  status          String   @default("VALID") // VALID REVOKED EXPIRED
  issuedAt        DateTime @default(now())

  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([hackathonId, userId, type])
}

// -------------------------
// Notifications
// -------------------------

model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        String
  title       String
  message     String
  entityType  String?  // BOOKING | HACKATHON | PAYMENT | etc.
  entityId    String?
  read        Boolean  @default(false)
  sentEmail   Boolean  @default(false)
  sentWhatsApp Boolean @default(false)
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model NotificationTemplate {
  id      String @id @default(cuid())
  name    String @unique
  channel String // EMAIL | IN_APP | WHATSAPP
  subject String?
  body    String
  variables String[]
  active  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// -------------------------
// Audit Logs
// -------------------------

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  resource    String
  resourceId  String?
  oldValue    Json?
  newValue    Json?
  ip          String?
  userAgent   String?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

## 3. Migration strategy

1. Create new tables without dropping existing ones.
2. Backfill `User` roles: existing admins become `Super Admin`; all other users become `Student`.
3. Migrate `Competition` → `Hackathon` while preserving IDs and slugs.
4. Migrate `Registration` → `HackathonRegistration`.
5. Migrate `Submission` → `HackathonSubmission` + `SubmissionFile`.
6. Migrate `Winner` → `HackathonResult`.
7. Keep `Playbook`, `Order` (extend with `type` field), and `Mentor` data intact.
8. Run smoke tests against migrated data before dropping old tables.

## 4. Seed data plan

Seed enough data to test every flow:

1. **Roles & permissions** — all system roles and permissions.
2. **Users** — 1 super admin, 2 admins, 3 experts (1 unverified, 1 pending, 1 verified), 5 students.
3. **Profiles** — student and expert profiles with full fields.
4. **Services** — 1:1 sessions, priority DM, and packages from verified expert.
5. **Availability** — recurring slots for each expert.
6. **Bookings/DMs/Purchases** — pending and completed records.
7. **Orders & payments** — paid, pending, failed, refunded samples.
8. **Reviews** — a few published reviews.
9. **Hackathons** — draft, registration open, active, evaluation, completed.
10. **Teams & submissions** — sample teams with members and submissions.
11. **Judges & evaluations** — assigned judge and evaluation scores.
12. **Results & certificates** — winners and certificates for completed hackathon.
13. **Notifications** — sample in-app notifications.
14. **Audit logs** — sample audit records.

## 5. Running seed

```bash
# After Docker Compose is up and migrations are applied
npx prisma migrate dev
npx prisma db seed
```

Add to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```
