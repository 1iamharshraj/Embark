-- DropIndex
DROP INDEX "MbaCollege_specializations_idx";

-- AlterTable
ALTER TABLE "ExpertProfile" ADD COLUMN     "country" TEXT DEFAULT 'IN',
ADD COLUMN     "currency" TEXT DEFAULT 'INR',
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "whatsappNumber" TEXT;

-- CreateIndex
CREATE INDEX "MbaCollege_specializations_idx" ON "MbaCollege"("specializations");
