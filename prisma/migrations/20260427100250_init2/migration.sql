/*
  Warnings:

  - You are about to drop the `Call` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExperienceMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Call" DROP CONSTRAINT "Call_leadId_fkey";

-- DropTable
DROP TABLE "Call";

-- DropTable
DROP TABLE "ExperienceMapping";

-- DropTable
DROP TABLE "Lead";

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "date" TIMESTAMP(3),
    "timeSlot" TEXT,
    "people" INTEGER,
    "experienceId" TEXT,
    "status" TEXT,
    "note" TEXT,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_date_timeSlot_idx" ON "Booking"("date", "timeSlot");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
