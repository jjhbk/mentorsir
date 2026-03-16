-- CreateEnum
CREATE TYPE "SeedhaPeOrderStatus" AS ENUM ('created', 'pending', 'verified', 'disputed', 'resolved', 'expired', 'rejected');

-- CreateTable
CREATE TABLE "seedhape_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_code" "SubscriptionPlanCode" NOT NULL,
    "plan_name" TEXT NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "external_order_id" TEXT NOT NULL,
    "seedhape_order_id" TEXT NOT NULL,
    "status" "SeedhaPeOrderStatus" NOT NULL DEFAULT 'created',
    "upi_uri" TEXT,
    "qr_code" TEXT,
    "expires_at" TIMESTAMPTZ,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seedhape_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seedhape_orders_external_order_id_key" ON "seedhape_orders"("external_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "seedhape_orders_seedhape_order_id_key" ON "seedhape_orders"("seedhape_order_id");

-- CreateIndex
CREATE INDEX "seedhape_orders_user_id_created_at_idx" ON "seedhape_orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "seedhape_orders_status_created_at_idx" ON "seedhape_orders"("status", "created_at");

-- AddForeignKey
ALTER TABLE "seedhape_orders" ADD CONSTRAINT "seedhape_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
