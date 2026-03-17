ALTER TABLE "yearly_plan_entries"
ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "student_edit_request_pending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "student_edit_request_note" TEXT,
ADD COLUMN "student_edit_request_requested_at" TIMESTAMPTZ,
ADD COLUMN "student_edit_request_reviewed_at" TIMESTAMPTZ;
