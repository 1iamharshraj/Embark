-- Add response SLA hours for Priority DM services

ALTER TABLE "Service" ADD COLUMN "responseSlaHours" INTEGER NOT NULL DEFAULT 48;
