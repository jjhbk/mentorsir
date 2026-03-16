import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { TestResult } from '../types';

interface TestsState {
  tests: TestResult[];
  loading: boolean;
  fetchTests: () => Promise<void>;
  addTest: (test: Omit<TestResult, 'id'>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
}

function rowToTest(row: Record<string, unknown>): TestResult {
  return {
    id: row.id as string,
    testName: (row.test_name as string) ?? '',
    date: row.date as string,
    score: Number(row.score ?? 0),
    totalQuestions: Number(row.total_questions ?? 100),
    mistakes: {
      conceptual: Number(row.mistake_conceptual ?? 0),
      recall: Number(row.mistake_recall ?? 0),
      reading: Number(row.mistake_reading ?? 0),
      elimination: Number(row.mistake_elimination ?? 0),
      decisionMaking: Number(row.mistake_decision_making ?? 0),
      silly: Number(row.mistake_silly ?? 0),
      psychological: Number(row.mistake_psychological ?? 0),
      patternMisjudgment: Number(row.mistake_pattern_misjudgment ?? 0),
    },
  };
}

export const useTestsStore = create<TestsState>((set) => ({
  tests: [],
  loading: false,

  fetchTests: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('test_results')
      .select('*')
      .order('date', { ascending: false });
    set({ tests: (data ?? []).map(rowToTest), loading: false });
  },

  addTest: async (test) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const row = {
      user_id: user.id,
      test_name: test.testName,
      date: test.date,
      score: test.score,
      total_questions: test.totalQuestions,
      mistake_conceptual: test.mistakes.conceptual,
      mistake_recall: test.mistakes.recall,
      mistake_reading: test.mistakes.reading,
      mistake_elimination: test.mistakes.elimination,
      mistake_decision_making: test.mistakes.decisionMaking,
      mistake_silly: test.mistakes.silly,
      mistake_psychological: test.mistakes.psychological,
      mistake_pattern_misjudgment: test.mistakes.patternMisjudgment,
    };

    const { data } = await supabase.from('test_results').insert(row).select().single();
    if (data) {
      set((s) => ({ tests: [rowToTest(data), ...s.tests] }));
    }
  },

  deleteTest: async (id: string) => {
    await supabase.from('test_results').delete().eq('id', id);
    set((s) => ({ tests: s.tests.filter((t) => t.id !== id) }));
  },
}));
