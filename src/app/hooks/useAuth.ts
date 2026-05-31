import { useEffect, useState } from 'react';
import type { Profile } from '../types';
import { localAuth } from '../../services/local-auth';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  isAgency: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const demoProfile: Profile = {
  id: 'demo', full_name: 'User', avatar_url: null, plan: 'free',
  is_admin: false, agency_id: null, onboarding_completed: false,
  created_at: '', updated_at: '',
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fast path: check localStorage auth
    const localUser = localAuth.getUser();
    if (localUser) {
      setUser({ id: localUser.id, email: localUser.email });
      setProfile({ ...demoProfile, id: localUser.id, full_name: localUser.name });
      setLoading(false);
      return;
    }

    // Demo mode
    if (localStorage.getItem('demo_mode') === 'true') {
      setUser({ id: 'demo', email: 'demo@profitpilot.app' });
      setProfile({ ...demoProfile, full_name: 'Demo User' });
      setLoading(false);
      return;
    }

    // Try Supabase
    import('../../utils/supabase/client').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' });
          loadSupabaseProfile(supabase, session.user.id);
        } else {
          setLoading(false);
        }
      }).catch(() => setLoading(false));

      supabase.auth.onAuthStateChange((_event: string, session: any) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' });
          loadSupabaseProfile(supabase, session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });
    }).catch(() => setLoading(false));
  }, []);

  async function loadSupabaseProfile(supabase: any, userId: string) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data ? (data as Profile) : { ...demoProfile, id: userId });
    } catch {
      setProfile({ ...demoProfile, id: userId });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    localAuth.signOut();
    try {
      const { supabase } = await import('../../utils/supabase/client');
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
  }

  return {
    user,
    profile,
    isAdmin: profile?.is_admin ?? false,
    isAgency: profile?.plan === 'agency',
    loading,
    signOut,
  };
}