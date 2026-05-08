import { useEffect, useState } from "react";
import { Landing } from "./components/Landing";
import { AppShell } from "./components/AppShell";
import { Auth } from "./components/Auth";
import { I18nProvider } from "./components/i18n";
import { Toaster } from "sonner";
import { getSupabase } from "./components/supabase-client";
import { setAuthToken } from "./components/api";

type View = "landing" | "auth" | "app";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthToken(data.session.access_token);
        setView("app");
      }
      setBooted(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthToken(session?.access_token ?? null);
      if (!session) setView("landing");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!booted) return null;

  return (
    <I18nProvider>
      <div className="min-h-screen bg-white">
        {view === "landing" && <Landing onEnter={() => setView("auth")} />}
        {view === "auth" && (
          <Auth onAuthed={() => setView("app")} onBack={() => setView("landing")} />
        )}
        {view === "app" && (
          <AppShell
            onExit={async () => {
              await getSupabase().auth.signOut();
              setView("landing");
            }}
          />
        )}
      </div>
      <Toaster richColors position="top-right" />
    </I18nProvider>
  );
}
