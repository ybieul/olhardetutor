import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
};

/**
 * Reactive mirror of the current Supabase auth session — mirrors the
 * useLanguageStore pattern: Supabase owns the session lifecycle, this
 * store just exposes it reactively for route guards and screens.
 */
export const useAuthStore = create<AuthState>(() => ({
  status: 'loading',
  session: null,
  user: null,
}));

function applySession(session: Session | null) {
  useAuthStore.setState({
    status: session ? 'authenticated' : 'unauthenticated',
    session,
    user: session?.user ?? null,
  });
}

void supabase.auth.getSession().then(({ data }) => applySession(data.session));

supabase.auth.onAuthStateChange((_event, session) => {
  applySession(session);
});
