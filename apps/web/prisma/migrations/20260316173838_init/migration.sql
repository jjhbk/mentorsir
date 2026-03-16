-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'mentor');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('yes', 'no', 'partial');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('study', 'ca-test', 'sectional-test', 'mentor-connect');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "name" TEXT,
    "mobile" TEXT,
    "medium" TEXT,
    "graduation_stream" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intake_forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "medium" TEXT,
    "graduation_stream" TEXT,
    "prelims_experience" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "gs_score_band" TEXT,
    "personal_difficulties" TEXT,
    "strong_gs_subjects" TEXT[],
    "weak_gs_subjects" TEXT[],
    "current_affairs_source" TEXT,
    "csat_strong_area" TEXT,
    "csat_weak_area" TEXT,
    "csat_score_band" TEXT,
    "mock_frequency" TEXT,
    "test_analysis" TEXT,
    "wrong_question_revision" TEXT,
    "pyq_practice" TEXT,
    "plan_consistency" TEXT,
    "daily_study_hours" TEXT,
    "revision_count" TEXT,
    "sources_per_subject" TEXT,
    "core_challenges" TEXT[],
    "mentorship_expectations" TEXT[],
    "discovery_platform" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intake_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "study_hours" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "sleep_hours" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "meditation_minutes" INTEGER NOT NULL DEFAULT 0,
    "sleep_time" TEXT,
    "wake_time" TEXT,
    "task_completed" "TaskStatus",
    "afternoon_nap_minutes" INTEGER NOT NULL DEFAULT 0,
    "had_mentor_discussion" BOOLEAN NOT NULL DEFAULT false,
    "relaxation_activity" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "subject" TEXT,
    "syllabus" TEXT,
    "primary_source" TEXT,
    "entry_type" "EntryType" NOT NULL DEFAULT 'study',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "revision1" BOOLEAN NOT NULL DEFAULT false,
    "revision2" BOOLEAN NOT NULL DEFAULT false,
    "revision3" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "test_name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "score" DECIMAL(5,1),
    "total_questions" INTEGER,
    "mistake_conceptual" INTEGER NOT NULL DEFAULT 0,
    "mistake_recall" INTEGER NOT NULL DEFAULT 0,
    "mistake_reading" INTEGER NOT NULL DEFAULT 0,
    "mistake_elimination" INTEGER NOT NULL DEFAULT 0,
    "mistake_decision_making" INTEGER NOT NULL DEFAULT 0,
    "mistake_silly" INTEGER NOT NULL DEFAULT 0,
    "mistake_psychological" INTEGER NOT NULL DEFAULT 0,
    "mistake_pattern_misjudgment" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_audits" (
    "user_id" UUID NOT NULL,
    "strong_academic_subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weak_academic_subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "strong_personality_traits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weak_personality_traits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_audits_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "intake_forms_user_id_key" ON "intake_forms"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_user_id_date_key" ON "daily_logs"("user_id", "date");

-- AddForeignKey
ALTER TABLE "intake_forms" ADD CONSTRAINT "intake_forms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_audits" ADD CONSTRAINT "student_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
