import { prisma } from "@/lib/prisma";

interface MentorAssignmentRow {
  mentorId: string | null;
}

export async function autoAssignMentorIfMissing(studentId: string): Promise<string | null> {
  const updatedRows = await prisma.$queryRaw<MentorAssignmentRow[]>`
    WITH selected_mentor AS (
      SELECT
        mentor.id
      FROM profiles AS mentor
      LEFT JOIN profiles AS assigned_student
        ON assigned_student.mentor_id = mentor.id
       AND assigned_student.role = 'student'::"Role"
      WHERE mentor.role = 'mentor'::"Role"
      GROUP BY mentor.id, mentor.created_at
      ORDER BY COUNT(assigned_student.id) ASC, mentor.created_at ASC, mentor.id ASC
      LIMIT 1
    )
    UPDATE profiles AS student
    SET mentor_id = selected_mentor.id
    FROM selected_mentor
    WHERE student.id = ${studentId}::uuid
      AND student.role = 'student'::"Role"
      AND student.mentor_id IS NULL
    RETURNING student.mentor_id AS "mentorId"
  `;

  if (updatedRows[0]?.mentorId) {
    return updatedRows[0].mentorId;
  }

  const existingRows = await prisma.$queryRaw<MentorAssignmentRow[]>`
    SELECT mentor_id AS "mentorId"
    FROM profiles
    WHERE id = ${studentId}::uuid
    LIMIT 1
  `;

  return existingRows[0]?.mentorId ?? null;
}
