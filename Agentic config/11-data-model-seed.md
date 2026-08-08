# Data model and seed plan

## 1. Prisma schema (v1)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String    // bcrypt hash
  college       String    @default("")
  isAdmin       Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  registrations Registration[]
  submissions   Submission[]
  progress      PlaybookProgress[]
  orders        Order[]
  bookingRequests BookingRequest[]
}

model Competition {
  id                     String   @id
  title                  String
  host                   String   @default("Embark India")
  category               String   @default("General Management")
  banner                 String   @default("orange")
  fee                    Int      @default(0)
  teamMin                Int      @default(1)
  teamMax                Int      @default(4)
  eligibility            String   @default("")
  about                  String   @default("")
  rules                  String[] @default([])
  prizes                 Json?    // [{key, cash, desc, benefits}]
  ppo                    Boolean  @default(false)
  beginner               Boolean  @default(false)
  draft                  Boolean  @default(true)
  regOpen                DateTime
  regClose               DateTime
  startAt                DateTime
  endAt                  DateTime
  resultAt               DateTime?
  rounds                 Json     // [{name, brief, type, link, opens, closes}]
  eligibilityCriteria    String[] @default([])
  teamStructure          String[] @default([])
  institutes             String[] @default([])
  compStructure          String[] @default([])
  submissionGuidelines   String[] @default([])
  contacts               Json?    // [{role, phone, email}]
  aboutHost              String   @default("")
  faqs                   Json?    // [{q, a}]
  viewBoost              Int      @default(0)
  logoUrl                String?
  banners                String[] @default([])
  views                  Int      @default(0)
  seedRegs               Int      @default(0)

  registrations Registration[]
  submissions   Submission[]
  advancements  Advancement[]
  winners       Winner[]
}

model Registration {
  id        String   @id @default(cuid())
  userId    String
  compId    String
  teamName  String
  members   Json     // [{name, email, college}]
  createdAt DateTime @default(now())

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  competition Competition   @relation(fields: [compId], references: [id], onDelete: Cascade)
  submissions Submission[]
  advancements Advancement[]
  winner      Winner?

  @@unique([userId, compId])
}

model Submission {
  id        String   @id @default(cuid())
  compId    String
  regId     String
  roundIdx  Int
  filePath  String?
  link      String?
  note      String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  competition  Competition   @relation(fields: [compId], references: [id], onDelete: Cascade)
  registration Registration  @relation(fields: [regId], references: [id], onDelete: Cascade)
  user         User          @relation(fields: [registration.userId], references: [id], onDelete: Cascade)

  @@unique([regId, roundIdx])
}

model Advancement {
  compId    String
  regId     String
  roundIdx  Int
  createdAt DateTime @default(now())

  competition  Competition  @relation(fields: [compId], references: [id], onDelete: Cascade)
  registration Registration @relation(fields: [regId], references: [id], onDelete: Cascade)

  @@id([compId, regId, roundIdx])
}

model Winner {
  compId    String
  regId     String @unique
  rank      Int
  teamName  String
  createdAt DateTime @default(now())

  competition  Competition  @relation(fields: [compId], references: [id], onDelete: Cascade)
  registration Registration @relation(fields: [regId], references: [id], onDelete: Cascade)

  @@id([compId, regId])
}

model Playbook {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  theme       String   // orange | dark | green
  category    String   // interview | case
  tagline     String
  oneLiner    String
  content     Json     // full playbook object from playbooks.js
  price       Int      @default(499)
  rating      Float    @default(4.6)
  meta        String   // e.g. "42 topics · 120+ Qs"
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  progress PlaybookProgress[]
  orders   Order[]
}

model PlaybookProgress {
  id        String   @id @default(cuid())
  userId    String
  playbookId String
  checked   Int[]    @default([])
  updatedAt DateTime @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  playbook Playbook @relation(fields: [playbookId], references: [id], onDelete: Cascade)

  @@unique([userId, playbookId])
}

model Order {
  id            String   @id @default(cuid())
  userId        String
  playbookId    String
  amount        Int
  status        String   @default("pending") // pending | paid | failed | refunded
  paymentId     String?
  paymentSignature String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  playbook Playbook @relation(fields: [playbookId], references: [id], onDelete: Cascade)
}

model Mentor {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  image         String
  role          String
  company       String
  college       String
  batch         String
  tier          String   // industry | alumni
  phases        Int[]
  streams       String[]
  rating        Float
  sessions      Int
  years         Int
  price         Int
  guestLectures Boolean @default(false)
  expertise     String[]
  bio           String
  reviewText    String
  reviewWho     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  bookingRequests BookingRequest[]
}

model BookingRequest {
  id        String   @id @default(cuid())
  userId    String
  mentorId  String
  topic     String
  status    String   @default("pending") // pending | confirmed | paid | cancelled | completed
  amount    Int?
  paymentId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  mentor Mentor @relation(fields: [mentorId], references: [id], onDelete: Cascade)
}

model SpeakerApplication {
  id          String   @id @default(cuid())
  name        String
  email       String
  role        String
  company     String
  linkedIn    String
  experience  String
  vertical    String
  city        String?
  format      String
  topics      String
  status      String   @default("pending") // pending | verified | rejected
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model LectureRequest {
  id            String   @id @default(cuid())
  institute     String
  name          String
  email         String
  phone         String?
  vertical      String
  engagement    String
  format        String
  dates         String?
  audienceSize  String
  budget        String
  message       String?
  status        String   @default("pending")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## 2. Seed data

The `prisma/seed.ts` script should create:

1. **Admin user** — founder’s email with a default test password (prompted to change).
2. **2–3 test users** — with different colleges for registration testing.
3. **Competitions** — import the 5 seed competitions from the existing Supabase schema, with dates shifted relative to the seed run so at least one competition is live, one upcoming, and one closed.
4. **Registrations** — a few test registrations so the admin flow can be demoed.
5. **Submissions** — one or two sample submissions (with placeholder file paths).
6. **Advancements** — sample advancing teams.
7. **Winners** — sample winners for a closed competition.
8. **Playbooks** — the 6 stream playbooks from `js/playbooks.js` plus the 15 shop items from `playbooks.html`.
9. **Mentors** — the 10 mentors from `js/mentors.js`.
10. **SpeakerApplication / LectureRequest** — 2–3 sample records so the admin views are not empty.
11. **Orders** — one paid and one pending order for playbook testing.

## 3. Running seed

```bash
# after docker-compose is up and prisma migrate dev
npx prisma migrate dev
npx prisma db seed
```

## 4. Notes

- `Submission.userId` is a virtual relation through `Registration` to avoid duplicate data. In queries, join via registration.
- The `Competition` table mirrors the existing Supabase schema so migration is mostly a copy-paste of rows.
- `Playbook.content` stores the full JSON blob from the current `playbooks.js`, which keeps the content flexible until a CMS is needed.
- `Order` is generic enough to later support mentorship bookings or competition fees with a `type` field added.
