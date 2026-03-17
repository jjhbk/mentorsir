-- Add mentor assignment field to profiles
ALTER TABLE "profiles"
ADD COLUMN "mentor_id" UUID;

-- Improve lookup performance for mentor dashboards/admin tools
CREATE INDEX "profiles_mentor_id_idx" ON "profiles"("mentor_id");

-- Ensure assigned mentor always points to a valid profile
ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_mentor_id_fkey"
FOREIGN KEY ("mentor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Prevent accidental self-assignment
ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_mentor_id_not_self"
CHECK ("mentor_id" IS NULL OR "mentor_id" <> "id");

-- Backfill existing students evenly across available mentors (if any)
WITH students AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "created_at", "id") AS rn
  FROM "profiles"
  WHERE "role" = 'student'::"Role"
    AND "mentor_id" IS NULL
),
mentors AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "created_at", "id") AS rn,
    COUNT(*) OVER () AS total
  FROM "profiles"
  WHERE "role" = 'mentor'::"Role"
)
UPDATE "profiles" AS s
SET "mentor_id" = m.id
FROM students st
JOIN mentors m ON m.rn = ((st.rn - 1) % m.total) + 1
WHERE s.id = st.id;
