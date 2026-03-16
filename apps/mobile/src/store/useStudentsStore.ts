import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface StudentSummary {
  id: string;
  name: string | null;
  mobile: string | null;
  latestLog: {
    date: string;
    studyHours: number;
    taskCompleted: string;
  } | null;
  audit: {
    strongAcademicSubjects: string[];
    weakAcademicSubjects: string[];
    strongPersonalityTraits: string[];
    weakPersonalityTraits: string[];
  } | null;
}

interface StudentsState {
  students: StudentSummary[];
  loading: boolean;
  fetchStudents: () => Promise<void>;
  updateAudit: (
    studentId: string,
    audit: StudentSummary['audit']
  ) => Promise<void>;
}

export const useStudentsStore = create<StudentsState>((set) => ({
  students: [],
  loading: false,

  fetchStudents: async () => {
    set({ loading: true });

    const [{ data: profiles }, { data: logs }, { data: audits }] = await Promise.all([
      supabase.from('profiles').select('id, name, mobile').eq('role', 'student'),
      supabase
        .from('daily_logs')
        .select('user_id, date, study_hours, task_completed')
        .order('date', { ascending: false }),
      supabase.from('student_audits').select('*'),
    ]);

    // Latest log per student
    const latestLogMap: Record<string, (typeof logs)[0]> = {};
    (logs ?? []).forEach((log) => {
      if (!latestLogMap[log.user_id]) latestLogMap[log.user_id] = log;
    });

    const auditMap: Record<string, (typeof audits)[0]> = {};
    (audits ?? []).forEach((a) => { auditMap[a.user_id] = a; });

    const students: StudentSummary[] = (profiles ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      mobile: p.mobile,
      latestLog: latestLogMap[p.id]
        ? {
            date: latestLogMap[p.id].date,
            studyHours: Number(latestLogMap[p.id].study_hours),
            taskCompleted: latestLogMap[p.id].task_completed,
          }
        : null,
      audit: auditMap[p.id]
        ? {
            strongAcademicSubjects: auditMap[p.id].strong_academic_subjects ?? [],
            weakAcademicSubjects: auditMap[p.id].weak_academic_subjects ?? [],
            strongPersonalityTraits: auditMap[p.id].strong_personality_traits ?? [],
            weakPersonalityTraits: auditMap[p.id].weak_personality_traits ?? [],
          }
        : null,
    }));

    set({ students, loading: false });
  },

  updateAudit: async (studentId, audit) => {
    if (!audit) return;
    await supabase.from('student_audits').upsert({
      user_id: studentId,
      strong_academic_subjects: audit.strongAcademicSubjects,
      weak_academic_subjects: audit.weakAcademicSubjects,
      strong_personality_traits: audit.strongPersonalityTraits,
      weak_personality_traits: audit.weakPersonalityTraits,
      updated_at: new Date().toISOString(),
    });
    set((s) => ({
      students: s.students.map((st) =>
        st.id === studentId ? { ...st, audit } : st
      ),
    }));
  },
}));
