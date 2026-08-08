-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "bookingRequestId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'playbook',
ALTER COLUMN "playbookId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
