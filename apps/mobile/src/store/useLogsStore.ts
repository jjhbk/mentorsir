import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DailyLog } from '../types';

interface LogsState {
  logs: Record<string, DailyLog>; // keyed by YYYY-MM-DD
  loading: boolean;
  fetchLogs: () => Promise<void>;
  upsertLog: (log: DailyLog) => Promise<void>;
  getLog: (date: string) => DailyLog | null;
}

function rowToLog(row: Record<string, unknown>): DailyLog {
  const feeling = (row.feeling_today as string | null) ?? 'neutral';
  const normalizedFeeling: DailyLog['feelingToday'] =
    feeling === 'neutral' || feeling === 'good' || feeling === 'motivated' || feeling === 'confused' || feeling === 'stressed' || feeling === 'tired'
      ? feeling
      : feeling === 'focused'
        ? 'motivated'
        : 'neutral';
  return {
    date: row.date as string,
    studyHours: Number(row.study_hours ?? 0),
    sleepHours: Number(row.sleep_hours ?? 0),
    meditationMinutes: Number(row.meditation_minutes ?? 0),
    sleepTime: (row.sleep_time as string) ?? '',
    wakeTime: (row.wake_time as string) ?? '',
    taskCompleted: (row.task_completed as DailyLog['taskCompleted']) ?? 'no',
    afternoonNapMinutes: Number(row.afternoon_nap_minutes ?? 0),
    taskList: (row.reason_not_studying as string) ?? '',
    feelingToday: normalizedFeeling,
  };
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: {},
  loading: false,

  fetchLogs: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(90);

    const logs: Record<string, DailyLog> = {};
    (data ?? []).forEach((row) => {
      logs[row.date] = rowToLog(row);
    });
    set({ logs, loading: false });
  },

  upsertLog: async (log: DailyLog) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const row = {
      user_id: user.id,
      date: log.date,
      study_hours: log.studyHours,
      sleep_hours: log.sleepHours,
      meditation_minutes: log.meditationMinutes,
      sleep_time: log.sleepTime,
      wake_time: log.wakeTime,
      task_completed: log.taskCompleted,
      afternoon_nap_minutes: log.afternoonNapMinutes,
      reason_not_studying: log.taskList,
      feeling_today: log.feelingToday,
    };

    const { error } = await supabase.from('daily_logs').upsert(row, {
      onConflict: 'user_id,date',
    });
    if (!error) {
      set((state) => ({ logs: { ...state.logs, [log.date]: log } }));
    }
  },

  getLog: (date: string) => get().logs[date] ?? null,
}));
