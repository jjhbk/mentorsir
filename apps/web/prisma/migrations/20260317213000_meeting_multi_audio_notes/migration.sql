CREATE TYPE "MeetingNoteAudioRole" AS ENUM ('student', 'mentor');

CREATE TABLE "mentor_meeting_note_audios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL,
    "role" "MeetingNoteAudioRole" NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_meeting_note_audios_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mentor_meeting_note_audios_meeting_id_role_created_at_idx"
ON "mentor_meeting_note_audios"("meeting_id", "role", "created_at");

ALTER TABLE "mentor_meeting_note_audios"
ADD CONSTRAINT "mentor_meeting_note_audios_meeting_id_fkey"
FOREIGN KEY ("meeting_id") REFERENCES "mentor_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
