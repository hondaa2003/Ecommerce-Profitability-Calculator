import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, ExternalLink, Unlink, Store } from "lucide-react";
import { useI18n } from "./i18n";

interface ConnectedStore {
  id: string;
  store_id: string;
  store_name: string;
  store_url: string;
  is_active: boolean;
}

const CONNECT_URL = "https://wljecfqzxvojsypqbkzp.supabase.co/functions/v1/salla-auth/connect";

export function SallaConnect() {
  const { t } = useI18n();
  const [store, setStore] = useState<ConnectedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStore(null);
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("stores")
        .select("id, store_id, store_name, store_url, is_active")
        .eq("user_id", user.id)
        .eq("platform", "salla")
        .eq("is_active", true)
        .maybeSingle();

      setStore(data || null);
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  }

  function handleConnect() {
    if (!userId) return;
    window.location.href = `${CONNECT_URL}?user_id=${userId}`;
  }

  async function handleDisconnect() {
    if (!store) return;
    setDisconnecting(true);
    try {
      await supabase
        .from("stores")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", store.id);
      setStore(null);
    } catch {
    } finally {
      setDisconnecting(false);
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

  if (store) {
    return (
      <div className="border border-green-200 rounded-xl p-4 bg-green-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛍️</span>
            <div>
              <div className="font-semibold text-slate-900">{store.store_name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">
                  متصل
                </Badge>
                {store.store_url && (
                  <a
                    href={`https://${store.store_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                  >
                    {store.store_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
          >
            <Unlink className="w-3.5 h-3.5 me-1" />
            {disconnecting ? "..." : "Disconnect"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛍️</span>
          <div>
            <div className="font-semibold text-slate-900">Salla</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-xs font-medium">
                غير متصل
              </Badge>
              <span className="text-xs text-slate-400">Custom OAuth</span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleConnect}
          className="bg-blue-700 hover:bg-blue-800 text-xs"
        >
          <Store className="w-3.5 h-3.5 me-1" />
          ربط متجر سلة
        </Button>
      </div>
    </div>
  );
}