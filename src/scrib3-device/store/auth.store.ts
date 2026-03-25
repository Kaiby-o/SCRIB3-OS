import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

import type { AvatarConfig } from '../components/virtual-office/game/systems/AvatarConfig';

export interface Profile {
  id: string;
  username: string;
  role: 'TEAM' | 'CLIENT' | 'CONTRACTOR';
  xp: number;
  level: number;
  avatar_config?: AvatarConfig | null;
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  role: 'TEAM' | 'CLIENT' | 'CONTRACTOR' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[auth] Profile fetch error:', error.code, error.message);
    return null;
  }
  if (!data) return null;

  console.log('[auth] Profile raw data:', data);

  // Normalise field names — handle both `username`/`handle`/`display_name`
  return {
    id: data.id,
    username: data.username ?? data.handle ?? data.display_name ?? data.email ?? 'OPERATOR',
    role: (data.role ?? data.access_level ?? 'TEAM') as Profile['role'],
    xp: data.xp ?? 0,
    level: data.level ?? 1,
    avatar_config: data.avatar_config ?? null,
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  role: null,
  loading: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false });
      throw error;
    }
    if (data.user) {
      set({ user: data.user });
      const profile = await loadProfile(data.user.id);
      if (profile) {
        set({ profile, role: profile.role });
      } else {
        // Fallback: derive role from user metadata if profile fetch fails
        const metaRole = data.user.user_metadata?.role as Profile['role'] | undefined;
        set({ role: metaRole ?? 'TEAM' });
      }
    }
    set({ loading: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, role: null });
  },

  fetchProfile: async (userId: string) => {
    const profile = await loadProfile(userId);
    if (profile) {
      set({ profile, role: profile.role });
    }
  },
}));
