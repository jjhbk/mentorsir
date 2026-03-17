CREATE TABLE "resource_mapping_values" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "owner_id" UUID NOT NULL,
  "row_key" TEXT NOT NULL,
  "resource" TEXT,
  "prelims_pyq_practice" TEXT,
  "prelims_test_series" TEXT,
  "mains_pyq" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "resource_mapping_values_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "resource_mapping_values_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "resource_mapping_values_owner_id_row_key_key"
  ON "resource_mapping_values"("owner_id", "row_key");

CREATE INDEX "resource_mapping_values_owner_id_created_at_idx"
  ON "resource_mapping_values"("owner_id", "created_at");
