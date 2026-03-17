DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "mentor_group_messages";
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
