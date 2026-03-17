CREATE TYPE "StudySubject" AS ENUM ('polity', 'geography', 'economy', 'csat', 'prelims', 'mains', 'interview');
CREATE TYPE "StudySessionStatus" AS ENUM ('active', 'paused', 'completed');

CREATE TABLE "study_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "subject" "StudySubject" NOT NULL,
    "status" "StudySessionStatus" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "segment_started_at" TIMESTAMPTZ,
    "accumulated_seconds" INTEGER NOT NULL DEFAULT 0,
    "ended_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "study_sessions_user_id_started_at_idx"
ON "study_sessions"("user_id", "started_at");

CREATE INDEX "study_sessions_user_id_status_idx"
ON "study_sessions"("user_id", "status");

ALTER TABLE "study_sessions"
ADD CONSTRAINT "study_sessions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
