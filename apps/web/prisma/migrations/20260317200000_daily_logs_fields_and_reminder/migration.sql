ALTER TABLE "daily_logs"
ADD COLUMN "reason_not_studying" TEXT,
ADD COLUMN "feeling_today" TEXT;

ALTER TABLE "daily_logs"
DROP COLUMN "had_mentor_discussion";
