CREATE TYPE "MeetingApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE "mentor_meetings"
ADD COLUMN "status" "MeetingApprovalStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "reviewed_at" TIMESTAMPTZ,
ADD COLUMN "reviewed_by" UUID,
ADD COLUMN "rejection_reason" TEXT;

ALTER TABLE "mentor_meetings"
ADD CONSTRAINT "mentor_meetings_reviewed_by_fkey"
FOREIGN KEY ("reviewed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "mentor_meetings_mentor_id_status_scheduled_at_idx"
ON "mentor_meetings"("mentor_id", "status", "scheduled_at");
