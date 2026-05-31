import { useEffect, useState } from 'react';
import type { Profile } from '../types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  isAgency: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const defaultProfile: Profile = {
  id: '', full_name: 'User', avatar_url: null, plan: 'free',
  is_admin: false, agency_id: null, onboarding_completed: false,
  created_at: '', updated_at: '',
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { supabase } = await import('../../utils/supabase/client');
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser({ id: session.user.id, email: session.user.email ?? '' });
          await loadSupabaseProfile(supabase, session.user.id);
        } else if (mounted) {
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email ?? '' });
            await loadSupabaseProfile(supabase, session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        if (mounted) setLoading(false);
      }
    };

    const cleanup = initAuth();
    return () => {
      mounted = false;
      cleanup.then(unsub => unsub?.());
    };
  }, []);

  async function loadSupabaseProfile(supabase: any, userId: string) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      setProfile({ ...defaultProfile, id: userId });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      const { supabase } = await import('../../utils/supabase/client');
      await supabase.auth.signOut();
      localStorage.removeItem('demo_mode');
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
