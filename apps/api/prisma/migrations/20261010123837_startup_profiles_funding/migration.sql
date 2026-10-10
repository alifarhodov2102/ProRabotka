-- CreateEnum
CREATE TYPE "StartupFundingType" AS ENUM ('INVESTMENT', 'GRANT');

-- AlterTable
ALTER TABLE "Startup" ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "StartupFunding" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "type" "StartupFundingType" NOT NULL,
    "amount" DECIMAL(65,30),
    "currency" TEXT,
    "source" TEXT,
    "round" TEXT,
    "fundedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StartupFunding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StartupFunding_startupId_idx" ON "StartupFunding"("startupId");

-- CreateIndex
CREATE INDEX "StartupFunding_type_idx" ON "StartupFunding"("type");

-- CreateIndex
CREATE INDEX "Document_startupId_idx" ON "Document"("startupId");

-- CreateIndex
CREATE INDEX "Document_residentId_idx" ON "Document"("residentId");

-- CreateIndex
CREATE INDEX "Document_infrastructureId_idx" ON "Document"("infrastructureId");

-- AddForeignKey
ALTER TABLE "StartupFunding" ADD CONSTRAINT "StartupFunding_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
