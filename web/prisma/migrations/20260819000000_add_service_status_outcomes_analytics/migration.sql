-- Add service lifecycle status, outcomes, archive timestamp and analytics

-- Add status column
ALTER TABLE "Service" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- Backfill status for existing services based on previous isActive boolean
UPDATE "Service" SET "status" = CASE WHEN "isActive" THEN 'PUBLISHED' ELSE 'PAUSED' END;

-- Add outcomes array
ALTER TABLE "Service" ADD COLUMN "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add archive timestamp
ALTER TABLE "Service" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Align isActive default with DRAFT status (inactive until explicitly published)
ALTER TABLE "Service" ALTER COLUMN "isActive" SET DEFAULT false;

-- Create service analytics table
CREATE TABLE "ServiceAnalytics" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "bookingAttempts" INTEGER NOT NULL DEFAULT 0,
    "bookings" INTEGER NOT NULL DEFAULT 0,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAnalytics_pkey" PRIMARY KEY ("id")
);

-- Create unique index on serviceId
CREATE UNIQUE INDEX "ServiceAnalytics_serviceId_key" ON "ServiceAnalytics"("serviceId");

-- Create foreign key to Service
ALTER TABLE "ServiceAnalytics" ADD CONSTRAINT "ServiceAnalytics_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index on serviceId for lookups
CREATE INDEX "ServiceAnalytics_serviceId_idx" ON "ServiceAnalytics"("serviceId");

-- Seed analytics rows for existing services
INSERT INTO "ServiceAnalytics" ("id", "serviceId", "updatedAt")
SELECT gen_random_uuid(), "id", CURRENT_TIMESTAMP FROM "Service";

-- Create status index
CREATE INDEX "Service_status_idx" ON "Service"("status");
