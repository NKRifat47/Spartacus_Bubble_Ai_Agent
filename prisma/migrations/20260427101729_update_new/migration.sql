-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "activityPrimary" TEXT,
ADD COLUMN     "activitySecondary" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "customerNote" TEXT,
ADD COLUMN     "experienceName" TEXT,
ADD COLUMN     "experiencePrice" DOUBLE PRECISION,
ADD COLUMN     "planningType" TEXT,
ADD COLUMN     "rawPayload" JSONB,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "source" TEXT;
