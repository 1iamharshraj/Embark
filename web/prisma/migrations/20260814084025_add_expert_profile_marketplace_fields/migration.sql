-- AlterTable
ALTER TABLE "ExpertProfile" ADD COLUMN     "batch" TEXT,
ADD COLUMN     "guestLectures" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phases" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 1499,
ADD COLUMN     "reviewText" TEXT,
ADD COLUMN     "reviewWho" TEXT,
ADD COLUMN     "sessions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "streams" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "ExpertProfile_slug_key" ON "ExpertProfile"("slug");
