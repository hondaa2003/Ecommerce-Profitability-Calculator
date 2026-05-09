import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Landing } from "./components/Landing";
import { AppShell } from "./components/AppShell";
import { Auth } from "./components/Auth";
import { I18nProvider } from "./components/i18n";
import { Toaster } from "sonner";
import { getSupabase } from "./components/supabase-client";
import { setAuthToken } from "./components/api";

function AppRoutes({ session }: { session: any }) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          session ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Landing onEnter={() => navigate("/auth")} />
          )
        } 
      />
      <Route 
        path="/auth" 
        element={
          session ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Auth 
              onAuthed={() => navigate("/dashboard")} 
              onBack={() => navigate("/")} 
            />
          )
        } 
      />
      <Route 
        path="/*" 
        element={
          session ? (
            <AppShell
              onExit={async () => {
                await getSupabase().auth.signOut();
                navigate("/");
              }}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}

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
          <AppRoutes session={session} />
        </div>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </I18nProvider>
  );
}
