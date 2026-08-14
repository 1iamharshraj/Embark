-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderType" TEXT NOT NULL DEFAULT 'PLAYBOOK',
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "relatedId" TEXT;

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "defaultCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConfig_key_key" ON "PlatformConfig"("key");

-- CreateIndex
CREATE INDEX "PlatformConfig_key_idx" ON "PlatformConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_expertId_scheduledAt_key" ON "Booking"("expertId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_orderType_idx" ON "Order"("orderType");

-- CreateIndex
CREATE INDEX "Order_relatedId_idx" ON "Order"("relatedId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_orderType_relatedId_status_idx" ON "Order"("orderType", "relatedId", "status");
