-- Auto-assign a mentor when a new student profile is inserted
CREATE OR REPLACE FUNCTION assign_mentor_to_new_student()
RETURNS TRIGGER AS $$
DECLARE
  selected_mentor_id UUID;
BEGIN
  IF NEW.role <> 'student'::"Role" OR NEW.mentor_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT
    mentor.id
  INTO selected_mentor_id
  FROM profiles AS mentor
  LEFT JOIN profiles AS assigned_student
    ON assigned_student.mentor_id = mentor.id
   AND assigned_student.role = 'student'::"Role"
  WHERE mentor.role = 'mentor'::"Role"
  GROUP BY mentor.id, mentor.created_at
  ORDER BY COUNT(assigned_student.id) ASC, mentor.created_at ASC, mentor.id ASC
  LIMIT 1;

  IF selected_mentor_id IS NOT NULL THEN
    NEW.mentor_id := selected_mentor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_auto_assign_mentor ON profiles;

CREATE TRIGGER profiles_auto_assign_mentor
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION assign_mentor_to_new_student();
