import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../config/dashboardConfig';

export interface OSProfile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string | null;
  xp: number;
}

interface AuthState {
  user: User | null;
  profile: OSProfile | null;
  role: UserRole | null;
  loading: boolean;
  initialised: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  init: () => Promise<void>;
}

async function loadProfile(userId: string): Promise<OSProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.warn('[os-auth] Profile fetch failed:', error?.message);
    return null;
  }

  // Normalise role to lowercase OS role format
  const rawRole = (data.role ?? data.os_role ?? 'team').toString().toLowerCase();
  const validRoles: UserRole[] = ['admin', 'team', 'csuite', 'client', 'vendor'];
  const role: UserRole = validRoles.includes(rawRole as UserRole)
    ? (rawRole as UserRole)
    : 'team';

  return {
    id: data.id,
    email: data.email ?? '',
    display_name: data.display_name ?? data.username ?? data.email ?? 'OPERATOR',
    role,
    avatar_url: data.avatar_url ?? null,
    xp: data.xp ?? 0,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  role: null,
  loading: false,
  initialised: false,

  init: async () => {
    if (get().initialised) return;
    set({ loading: true });

    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await loadProfile(session.user.id);
      set({
        user: session.user,
        profile,
        role: profile?.role ?? 'team',
        loading: false,
        initialised: true,
      });
    } else {
      set({ loading: false, initialised: true });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        set({
          user: session.user,
          profile,
          role: profile?.role ?? 'team',
        });
      } else {
        set({ user: null, profile: null, role: null });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ loading: false });
        throw error;
      }
      if (data.user) {
        let profile = null;
        try {
          profile = await loadProfile(data.user.id);
        } catch (e) {
          console.warn('[os-auth] Profile load failed after sign-in:', e);
        }
        set({
          user: data.user,
          profile,
          role: profile?.role ?? 'team',
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, role: null });
  },
}));
