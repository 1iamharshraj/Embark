-- AlterTable
ALTER TABLE "LectureRequest" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "SpeakerApplication" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "SpeakerApplication" ADD CONSTRAINT "SpeakerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureRequest" ADD CONSTRAINT "LectureRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
