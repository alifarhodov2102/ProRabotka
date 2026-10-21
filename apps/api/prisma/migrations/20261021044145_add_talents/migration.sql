-- CreateEnum
CREATE TYPE "TalentStatus" AS ENUM ('AVAILABLE', 'OPEN_TO_OFFERS', 'EMPLOYED', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "LanguageLevel" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE');

-- AlterEnum
ALTER TYPE "SectionType" ADD VALUE 'TALENTS';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "talentId" TEXT;

-- CreateTable
CREATE TABLE "Talent" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "telegram" TEXT,
    "location" TEXT,
    "currentCompany" TEXT,
    "experienceYears" INTEGER,
    "salaryExpectation" DECIMAL(65,30),
    "salaryCurrency" TEXT,
    "status" "TalentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "talentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentLanguage" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" "LanguageLevel" NOT NULL,
    "talentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Talent_fullName_idx" ON "Talent"("fullName");

-- CreateIndex
CREATE INDEX "Talent_position_idx" ON "Talent"("position");

-- CreateIndex
CREATE INDEX "Talent_status_idx" ON "Talent"("status");

-- CreateIndex
CREATE INDEX "TalentSkill_talentId_idx" ON "TalentSkill"("talentId");

-- CreateIndex
CREATE INDEX "TalentSkill_name_idx" ON "TalentSkill"("name");

-- CreateIndex
CREATE INDEX "TalentLanguage_talentId_idx" ON "TalentLanguage"("talentId");

-- CreateIndex
CREATE INDEX "TalentLanguage_language_idx" ON "TalentLanguage"("language");

-- CreateIndex
CREATE INDEX "Document_talentId_idx" ON "Document"("talentId");

-- AddForeignKey
ALTER TABLE "TalentSkill" ADD CONSTRAINT "TalentSkill_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "Talent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentLanguage" ADD CONSTRAINT "TalentLanguage_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "Talent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "Talent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
