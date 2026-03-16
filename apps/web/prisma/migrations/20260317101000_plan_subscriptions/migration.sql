-- CreateEnum
CREATE TYPE "SubscriptionPlanCode" AS ENUM ('ptp_3m', 'mtp_2_3m');

-- CreateTable
CREATE TABLE "plan_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_code" "SubscriptionPlanCode" NOT NULL,
    "plan_name" TEXT NOT NULL,
    "amount_inr" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_subscriptions_active_created_at_idx" ON "plan_subscriptions"("active", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "plan_subscriptions_user_id_plan_code_key" ON "plan_subscriptions"("user_id", "plan_code");

-- AddForeignKey
ALTER TABLE "plan_subscriptions" ADD CONSTRAINT "plan_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
