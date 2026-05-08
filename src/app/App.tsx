import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./components/Landing";
import { AppShell } from "./components/AppShell";
import { Auth } from "./components/Auth";
import { I18nProvider } from "./components/i18n";
import { Toaster } from "sonner";
import { getSupabase } from "./components/supabase-client";
import { setAuthToken } from "./components/api";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthToken(data.session.access_token);
        setSession(data.session);
      }
      setBooted(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthToken(session?.access_token ?? null);
      setSession(session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (!booted) return null;

  return (
    <I18nProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route 
              path="/" 
              element={session ? <Navigate to="/dashboard" /> : <Landing onEnter={() => {}} />} 
            />
            <Route 
              path="/auth" 
              element={session ? <Navigate to="/dashboard" /> : <Auth onAuthed={() => {}} onBack={() => {}} />} 
            />
            <Route 
              path="/*" 
              element={
                session ? (
                  <AppShell
                    onExit={async () => {
                      await getSupabase().auth.signOut();
                    }}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </I18nProvider>
  );
}
