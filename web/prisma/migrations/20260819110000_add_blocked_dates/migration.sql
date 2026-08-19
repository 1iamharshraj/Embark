-- Add blocked dates for expert availability

CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlockedDate_expertProfileId_date_key" ON "BlockedDate"("expertProfileId", "date");
CREATE INDEX "BlockedDate_expertProfileId_idx" ON "BlockedDate"("expertProfileId");
CREATE INDEX "BlockedDate_date_idx" ON "BlockedDate"("date");

ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_expertProfileId_fkey"
    FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
