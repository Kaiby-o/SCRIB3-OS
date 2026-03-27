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
  try {
    // Simple query — no timeout race. If RLS blocks, it returns an error, not a hang.
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('[os-auth] Profile fetch failed:', error?.message);
      return null;
    }

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
  } catch (e) {
    console.warn('[os-auth] Profile load error:', e);
    return null;
  }
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

    try {
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
    } catch (e) {
      console.warn('[os-auth] Init failed:', e);
      set({ loading: false, initialised: true });
    }

    // Listen for auth changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[os-auth] Auth event:', event);
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        set({
          user: session.user,
          profile,
          role: profile?.role ?? 'team',
          loading: false,
        });
      } else {
        set({ user: null, profile: null, role: null, loading: false });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      set({ loading: false });
      throw error;
    }

    // Don't load profile here — the onAuthStateChange listener will handle it.
    // But set a safety timeout in case the listener doesn't fire.
    setTimeout(() => {
      const state = get();
      if (state.loading) {
        console.warn('[os-auth] Sign-in timeout — forcing loading:false');
        set({ loading: false });
      }
    }, 15000);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, role: null, loading: false });
  },
}));
