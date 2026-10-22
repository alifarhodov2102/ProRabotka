-- Create the new explicit many-to-many assignment table.
CREATE TABLE "TaskAssignee" (
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignee_pkey" PRIMARY KEY ("taskId", "userId")
);

-- Preserve every existing single assignee before removing Task.assigneeId.
INSERT INTO "TaskAssignee" ("taskId", "userId", "assignedAt")
SELECT "id", "assigneeId", COALESCE("createdAt", CURRENT_TIMESTAMP)
FROM "Task"
WHERE "assigneeId" IS NOT NULL
ON CONFLICT ("taskId", "userId") DO NOTHING;

-- Remove the old single-assignee foreign key/column.
ALTER TABLE "Task"
DROP CONSTRAINT IF EXISTS "Task_assigneeId_fkey";

DROP INDEX IF EXISTS "Task_assigneeId_idx";

ALTER TABLE "Task"
DROP COLUMN IF EXISTS "assigneeId";

-- Index and foreign keys for the new relation.
CREATE INDEX "TaskAssignee_userId_idx"
ON "TaskAssignee"("userId");

ALTER TABLE "TaskAssignee"
ADD CONSTRAINT "TaskAssignee_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskAssignee"
ADD CONSTRAINT "TaskAssignee_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
