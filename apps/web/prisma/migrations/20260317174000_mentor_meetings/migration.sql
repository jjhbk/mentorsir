-- Mentor-student meetings + private notes
CREATE TABLE "mentor_meetings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "mode" TEXT,
    "agenda" TEXT,
    "student_notes" TEXT,
    "mentor_notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_meetings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mentor_meetings_mentor_id_scheduled_at_idx"
ON "mentor_meetings"("mentor_id", "scheduled_at");

CREATE INDEX "mentor_meetings_student_id_scheduled_at_idx"
ON "mentor_meetings"("student_id", "scheduled_at");

CREATE INDEX "mentor_meetings_mentor_id_student_id_scheduled_at_idx"
ON "mentor_meetings"("mentor_id", "student_id", "scheduled_at");

ALTER TABLE "mentor_meetings"
ADD CONSTRAINT "mentor_meetings_mentor_id_fkey"
FOREIGN KEY ("mentor_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mentor_meetings"
ADD CONSTRAINT "mentor_meetings_student_id_fkey"
FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mentor_meetings"
ADD CONSTRAINT "mentor_meetings_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mentor_meetings"
ADD CONSTRAINT "mentor_meetings_creator_participant_check"
CHECK ("created_by" = "mentor_id" OR "created_by" = "student_id");
