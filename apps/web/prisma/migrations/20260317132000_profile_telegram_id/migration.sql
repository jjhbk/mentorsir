-- Add Telegram profile field for student/mentor management
ALTER TABLE "profiles"
ADD COLUMN "telegram_id" TEXT;
