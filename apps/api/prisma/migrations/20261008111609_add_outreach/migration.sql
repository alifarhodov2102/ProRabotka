-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'REPLIED', 'FOLLOW_UP', 'MEETING_PLANNED', 'INTERESTED', 'NOT_INTERESTED', 'NO_RESPONSE');

-- CreateTable
CREATE TABLE "OutreachCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetSectors" TEXT,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "companyLinkedIn" TEXT,
    "contactName" TEXT,
    "contactPosition" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactLinkedIn" TEXT,
    "source" TEXT,
    "channel" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "campaignId" TEXT,
    "ownerId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutreachCampaign" ADD CONSTRAINT "OutreachCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
