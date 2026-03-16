import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ScheduleEntry } from '../types';
import { ptpScheduleSeed } from '../data/ptpSchedule';

interface ScheduleState {
  entries: ScheduleEntry[];
  loading: boolean;
  fetchEntries: () => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  toggleRevision: (id: string, rev: 1 | 2 | 3) => Promise<void>;
}

function rowToEntry(row: Record<string, unknown>): ScheduleEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    subject: (row.subject as string) ?? '',
    syllabus: (row.syllabus as string) ?? '',
    primarySource: (row.primary_source as string) ?? '',
    completed: Boolean(row.completed),
    revision1: Boolean(row.revision1),
    revision2: Boolean(row.revision2),
    revision3: Boolean(row.revision3),
    entryType: (row.entry_type as ScheduleEntry['entryType']) ?? 'study',
  };
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  entries: [],
  loading: false,

  fetchEntries: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }

    const { data, count } = await supabase
      .from('schedule_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date');

    // Seed PTP schedule on first login if empty
    if ((count ?? 0) === 0) {
      const seedRows = ptpScheduleSeed.map((s) => ({ ...s, user_id: user.id }));
      await supabase.from('schedule_entries').insert(seedRows);
      const { data: seeded } = await supabase
        .from('schedule_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date');
      set({ entries: (seeded ?? []).map(rowToEntry), loading: false });
      return;
    }

    set({ entries: (data ?? []).map(rowToEntry), loading: false });
  },

  toggleCompleted: async (id: string) => {
    const entry = get().entries.find((e) => e.id === id);
    if (!entry) return;
    const updated = !entry.completed;
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, completed: updated } : e)),
    }));
    await supabase.from('schedule_entries').update({ completed: updated }).eq('id', id);
  },

  toggleRevision: async (id: string, rev: 1 | 2 | 3) => {
    const entry = get().entries.find((e) => e.id === id);
    if (!entry) return;
    const key = `revision${rev}` as 'revision1' | 'revision2' | 'revision3';
    const updated = !entry[key];
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, [key]: updated } : e)),
    }));
    await supabase.from('schedule_entries').update({ [key]: updated }).eq('id', id);
  },
}));
