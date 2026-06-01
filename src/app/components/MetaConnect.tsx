import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, Unlink, RefreshCw } from "lucide-react";
import { useI18n } from "./i18n";
import { toast } from "sonner";

const CONNECT_URL = "https://wljecfqzxvojsypqbkzp.supabase.co/functions/v1/meta-auth/connect";
const SYNC_URL = "https://wljecfqzxvojsypqbkzp.supabase.co/functions/v1/meta-auth/sync-ads";

interface MetaConnection {
  id: string;
  access_token: string;
  token_expires_at: string;
}

export function MetaConnect() {
  const { t } = useI18n();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConnected(false);
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("meta_connections")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setConnected(!!data);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  function handleConnect() {
    if (!userId) return;
    window.location.href = `${CONNECT_URL}?user_id=${userId}`;
  }

  async function handleDisconnect() {
    if (!userId) return;
    setDisconnecting(true);
    try {
      await supabase.from("meta_connections").delete().eq("user_id", userId);
      setConnected(false);
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleSync() {
    if (!userId) return;
    setSyncing(true);
    try {
      const res = await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.campaigns} campaigns synced from ${data.accounts} ad accounts`);
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          <span className="text-sm text-slate-400">{t("empty.loading")}</span>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📘</span>
            <div>
              <div className="font-semibold text-slate-900">Meta Ads</div>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium mt-0.5">
                متصل
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing} className="text-xs">
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin me-1" /> : <RefreshCw className="w-3.5 h-3.5 me-1" />}
              {syncing ? "Syncing..." : "Sync Campaigns"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
            >
              <Unlink className="w-3.5 h-3.5 me-1" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📘</span>
          <div>
            <div className="font-semibold text-slate-900">Meta Ads</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-xs font-medium">
                غير متصل
              </Badge>
              <span className="text-xs text-slate-400">Facebook + Instagram</span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleConnect}
          className="bg-blue-700 hover:bg-blue-800 text-xs"
        >
          ربط Meta Ads
        </Button>
      </div>
    </div>
  );
}