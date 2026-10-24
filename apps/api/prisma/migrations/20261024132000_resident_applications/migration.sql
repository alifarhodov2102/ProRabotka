CREATE TYPE "ResidentApplicationStatus" AS ENUM ('PENDING', 'REJECTED', 'APPROVED');

CREATE TABLE "ResidentApplication" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tin" TEXT,
    "activity" TEXT,
    "exporter" BOOLEAN NOT NULL DEFAULT false,
    "founderCountry" TEXT,
    "region" TEXT,
    "district" TEXT,
    "appliedAt" TIMESTAMP(3),
    "focalPoint" TEXT,
    "broughtBy" TEXT,
    "status" "ResidentApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidentApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ResidentApplication_companyName_idx" ON "ResidentApplication"("companyName");
CREATE INDEX "ResidentApplication_tin_idx" ON "ResidentApplication"("tin");
CREATE INDEX "ResidentApplication_status_idx" ON "ResidentApplication"("status");
