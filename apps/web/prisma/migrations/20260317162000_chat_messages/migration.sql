-- Private mentor-student chat
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_messages_mentor_id_student_id_created_at_idx"
ON "chat_messages"("mentor_id", "student_id", "created_at");

CREATE INDEX "chat_messages_student_id_created_at_idx"
ON "chat_messages"("student_id", "created_at");

CREATE INDEX "chat_messages_mentor_id_created_at_idx"
ON "chat_messages"("mentor_id", "created_at");

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_mentor_id_fkey"
FOREIGN KEY ("mentor_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_student_id_fkey"
FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_sender_id_fkey"
FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_sender_participant_check"
CHECK ("sender_id" = "mentor_id" OR "sender_id" = "student_id");
