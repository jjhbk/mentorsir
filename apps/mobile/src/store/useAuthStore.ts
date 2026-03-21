import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  role: 'student' | 'mentor' | 'admin';
  name: string | null;
  mobile: string | null;
  mentorId: string | null;
  telegramId: string | null;
  telegramGroupLink: string | null;
  whatsappGroupLink: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateProfile: (input: { name?: string; mobile?: string; telegramId?: string }) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, role, name, mobile, mentor_id, telegram_id, telegram_group_link, whatsapp_group_link')
    .eq('id', userId)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    role: data.role,
    name: data.name,
    mobile: data.mobile,
    mentorId: data.mentor_id,
    telegramId: data.telegram_id,
    telegramGroupLink: data.telegram_group_link,
    whatsappGroupLink: data.whatsapp_group_link,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    set({ loading: true });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await loadProfile(session.user.id);
      set({ user: session.user, profile, loading: false });
    } else {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (user) {
        const profile = await loadProfile(user.id);
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  setUser: (user) => set({ user }),

  updateProfile: async (input) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { ok: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update({
        name: input.name?.trim() || null,
        mobile: input.mobile?.trim() || null,
        telegram_id: input.telegramId?.trim() || null,
      })
      .eq('id', user.id);

    if (error) return { ok: false, error: error.message };

    const profile = await loadProfile(user.id);
    set({ profile });
    return { ok: true };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
