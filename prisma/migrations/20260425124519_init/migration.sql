/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "eventType" TEXT,
    "city" TEXT,
    "peopleCount" INTEGER,
    "experience" TEXT,
    "secondActivity" TEXT,
    "preferredDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "foodOption" BOOLEAN DEFAULT false,
    "rezgoTourId" TEXT,
    "rezgoSlotId" TEXT,
    "availability" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "fromNumber" TEXT,
    "toNumber" TEXT,
    "status" TEXT,
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceMapping" (
    "id" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "rezgoTourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceMapping_experience_city_key" ON "ExperienceMapping"("experience", "city");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
