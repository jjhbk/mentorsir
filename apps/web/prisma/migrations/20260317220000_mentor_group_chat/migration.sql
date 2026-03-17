ALTER TABLE "profiles"
ADD COLUMN "telegram_group_link" TEXT;

CREATE TABLE "mentor_group_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_group_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mentor_group_messages_mentor_id_created_at_idx"
ON "mentor_group_messages"("mentor_id", "created_at");

CREATE INDEX "mentor_group_messages_sender_id_created_at_idx"
ON "mentor_group_messages"("sender_id", "created_at");

ALTER TABLE "mentor_group_messages"
ADD CONSTRAINT "mentor_group_messages_mentor_id_fkey"
FOREIGN KEY ("mentor_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mentor_group_messages"
ADD CONSTRAINT "mentor_group_messages_sender_id_fkey"
FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
