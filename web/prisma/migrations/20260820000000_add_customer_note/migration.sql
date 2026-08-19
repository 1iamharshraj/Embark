-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerNote_expertProfileId_studentId_key" ON "CustomerNote"("expertProfileId", "studentId");

-- CreateIndex
CREATE INDEX "CustomerNote_expertProfileId_idx" ON "CustomerNote"("expertProfileId");

-- CreateIndex
CREATE INDEX "CustomerNote_studentId_idx" ON "CustomerNote"("studentId");

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
