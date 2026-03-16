-- CreateEnum
CREATE TYPE "MentorRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "mentor_access_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "status" "MentorRequestStatus" NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,
    "reviewed_by" UUID,
    "rejection_reason" TEXT,

    CONSTRAINT "mentor_access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_access_requests_user_id_key" ON "mentor_access_requests"("user_id");

-- CreateIndex
CREATE INDEX "mentor_access_requests_status_idx" ON "mentor_access_requests"("status");

-- AddForeignKey
ALTER TABLE "mentor_access_requests" ADD CONSTRAINT "mentor_access_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
