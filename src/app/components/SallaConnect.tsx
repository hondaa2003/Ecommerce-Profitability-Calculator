import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RefreshCw, ExternalLink } from "lucide-react";
import { useI18n } from "./i18n";

interface ConnectedStore {
  id: string;
  store_name: string;
  store_url: string;
  is_active: boolean;
}

export function SallaConnect() {
  const { t } = useI18n();
  const [store, setStore] = useState<ConnectedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnection();

    // Handle redirect back from Salla OAuth after successful connect
    const params = new URLSearchParams(window.location.search);
    if (params.get("salla") === "connected") {
      checkConnection();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function checkConnection() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("stores")
        .select("id, store_name, store_url, is_active")
        .eq("user_id", user.id)
        .eq("platform", "salla")
        .eq("is_active", true)
        .single();

      setStore(data || null);
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wljecfqzxvojsypqbkzp.supabase.co";
      window.location.href = `${supabaseUrl}/functions/v1/salla-auth/connect?user_id=${user.id}`;
    } catch {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("stores")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("platform", "salla");

      setStore(null);
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 text-sm text-slate-400">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Checking connection...
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏪</span>
        <div>
          <div className="font-medium text-slate-900 text-sm">Salla</div>
          {store ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                ✓ Connected
              </Badge>
              <span className="text-xs text-slate-500">{store.store_name}</span>
              {store.store_url && (
                <a href={store.store_url} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Connect your Salla store for automatic order sync
            </p>
          )}
        </div>
      </div>

      {store ? (
        <Button size="sm" variant="ghost" onClick={handleDisconnect}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs">
          Disconnect
        </Button>
      ) : (
        <Button size="sm" onClick={handleConnect} disabled={connecting}
          className="bg-green-600 hover:bg-green-700 text-white text-xs">
          {connecting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin me-1" />
          ) : null}
          Connect Salla Store
        </Button>
      )}
    </div>
  );
}