-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "college" TEXT NOT NULL DEFAULT '',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "host" TEXT NOT NULL DEFAULT 'Embark India',
    "category" TEXT NOT NULL DEFAULT 'General Management',
    "banner" TEXT NOT NULL DEFAULT 'orange',
    "fee" INTEGER NOT NULL DEFAULT 0,
    "teamMin" INTEGER NOT NULL DEFAULT 1,
    "teamMax" INTEGER NOT NULL DEFAULT 4,
    "eligibility" TEXT NOT NULL DEFAULT '',
    "about" TEXT NOT NULL DEFAULT '',
    "rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prizes" JSONB,
    "ppo" BOOLEAN NOT NULL DEFAULT false,
    "beginner" BOOLEAN NOT NULL DEFAULT false,
    "draft" BOOLEAN NOT NULL DEFAULT true,
    "regOpen" TIMESTAMP(3) NOT NULL,
    "regClose" TIMESTAMP(3) NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "resultAt" TIMESTAMP(3),
    "rounds" JSONB NOT NULL,
    "eligibilityCriteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "teamStructure" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "institutes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compStructure" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "submissionGuidelines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contacts" JSONB,
    "aboutHost" TEXT NOT NULL DEFAULT '',
    "faqs" JSONB,
    "viewBoost" INTEGER NOT NULL DEFAULT 0,
    "banners" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "seedRegs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "compId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "members" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "compId" TEXT NOT NULL,
    "regId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundIdx" INTEGER NOT NULL,
    "filePath" TEXT,
    "link" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advancement" (
    "compId" TEXT NOT NULL,
    "regId" TEXT NOT NULL,
    "roundIdx" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Advancement_pkey" PRIMARY KEY ("compId","regId","roundIdx")
);

-- CreateTable
CREATE TABLE "Winner" (
    "compId" TEXT NOT NULL,
    "regId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("compId","regId")
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "oneLiner" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 499,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.6,
    "meta" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "checked" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaybookProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentId" TEXT,
    "paymentSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "phases" INTEGER[],
    "streams" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL,
    "sessions" INTEGER NOT NULL,
    "years" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "guestLectures" BOOLEAN NOT NULL DEFAULT false,
    "expertise" TEXT[],
    "bio" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "reviewWho" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" INTEGER,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakerApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "linkedIn" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "vertical" TEXT NOT NULL,
    "city" TEXT,
    "format" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureRequest" (
    "id" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "vertical" TEXT NOT NULL,
    "engagement" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "dates" TEXT,
    "audienceSize" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_compId_key" ON "Registration"("userId", "compId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_regId_roundIdx_key" ON "Submission"("regId", "roundIdx");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_regId_key" ON "Winner"("regId");

-- CreateIndex
CREATE UNIQUE INDEX "Playbook_slug_key" ON "Playbook"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookProgress_userId_playbookId_key" ON "PlaybookProgress"("userId", "playbookId");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_slug_key" ON "Mentor"("slug");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_compId_fkey" FOREIGN KEY ("compId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_compId_fkey" FOREIGN KEY ("compId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_regId_fkey" FOREIGN KEY ("regId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advancement" ADD CONSTRAINT "Advancement_compId_fkey" FOREIGN KEY ("compId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advancement" ADD CONSTRAINT "Advancement_regId_fkey" FOREIGN KEY ("regId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_compId_fkey" FOREIGN KEY ("compId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_regId_fkey" FOREIGN KEY ("regId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookProgress" ADD CONSTRAINT "PlaybookProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookProgress" ADD CONSTRAINT "PlaybookProgress_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
