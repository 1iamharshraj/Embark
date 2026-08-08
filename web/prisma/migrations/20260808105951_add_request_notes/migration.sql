-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "note" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "LectureRequest" ADD COLUMN     "note" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SpeakerApplication" ADD COLUMN     "note" TEXT NOT NULL DEFAULT '';
