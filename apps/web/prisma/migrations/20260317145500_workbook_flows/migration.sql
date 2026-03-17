-- Resource mapping rows (mentor-owned)
CREATE TABLE "resource_mapping_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "part" TEXT,
    "resource" TEXT,
    "prelims_pyq_practice" TEXT,
    "mains_pyq" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_mapping_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "resource_mapping_entries_owner_id_created_at_idx"
ON "resource_mapping_entries"("owner_id", "created_at");

ALTER TABLE "resource_mapping_entries"
ADD CONSTRAINT "resource_mapping_entries_owner_id_fkey"
FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Yearly plan rows (student-owned)
CREATE TABLE "yearly_plan_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "month" TEXT NOT NULL,
    "subject_1" TEXT,
    "subject_2" TEXT,
    "subject_3" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yearly_plan_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "yearly_plan_entries_user_id_month_key"
ON "yearly_plan_entries"("user_id", "month");

CREATE INDEX "yearly_plan_entries_user_id_created_at_idx"
ON "yearly_plan_entries"("user_id", "created_at");

ALTER TABLE "yearly_plan_entries"
ADD CONSTRAINT "yearly_plan_entries_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Alternate schedule rows (student-owned)
CREATE TABLE "alternate_schedule_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "focus" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alternate_schedule_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "alternate_schedule_entries_user_id_date_idx"
ON "alternate_schedule_entries"("user_id", "date");

ALTER TABLE "alternate_schedule_entries"
ADD CONSTRAINT "alternate_schedule_entries_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
