-- Add isFeatured column to Review
ALTER TABLE "Review" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- Create index for featured reviews
CREATE INDEX "Review_isFeatured_idx" ON "Review"("isFeatured");
