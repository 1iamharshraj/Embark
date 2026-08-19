-- AlterTable
ALTER TABLE "ExpertProfile" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "pageSettings" JSONB;

-- CreateTable
CREATE TABLE "ExpertEducation" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT,
    "specialization" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertEducation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpertEducation_expertProfileId_idx" ON "ExpertEducation"("expertProfileId");

-- AddForeignKey
ALTER TABLE "ExpertEducation" ADD CONSTRAINT "ExpertEducation_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ExpertExperience" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT,
    "description" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertExperience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpertExperience_expertProfileId_idx" ON "ExpertExperience"("expertProfileId");

-- AddForeignKey
ALTER TABLE "ExpertExperience" ADD CONSTRAINT "ExpertExperience_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
