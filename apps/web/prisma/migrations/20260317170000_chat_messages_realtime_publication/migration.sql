-- Ensure chat messages are streamed through Supabase Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "chat_messages";
EXCEPTION
  WHEN duplicate_object THEN
    -- already part of publication
    NULL;
END $$;
