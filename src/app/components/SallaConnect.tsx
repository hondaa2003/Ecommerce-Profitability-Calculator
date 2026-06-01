import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Loader2, ExternalLink, Link, Unlink } from "lucide-react";
import { useI18n } from "./i18n";

interface ConnectedStore {
  id: string;
  store_id: string;
  store_name: string;
  store_url: string;
  is_active: boolean;
}

export function SallaConnect() {
  const { t } = useI18n();
  const [store, setStore] = useState<ConnectedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("stores")
        .select("id, store_id, store_name, store_url, is_active")
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

  async function handleLink() {
    if (!storeUrl.trim()) return;
    setLinking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const domain = storeUrl.trim().replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();

      const { data: unclaimed } = await supabase
        .from("stores")
        .select("id")
        .eq("platform", "salla")
        .eq("store_url", domain)
        .is("user_id", null)
        .single();

      if (unclaimed) {
        await supabase.from("stores").update({
          user_id: user.id,
          updated_at: new Date().toISOString(),
        }).eq("id", unclaimed.id);
        setStoreUrl("");
        setShowLinkInput(false);
        checkConnection();
      }
    } catch {
      setLinking(false);
    }
  }

  async function handleDisconnect() {
    try {
      if (store) {
        await supabase.from("stores").update({
          is_active: false,
          updated_at: new Date().toISOString(),
        }).eq("id", store.id);
        setStore(null);
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-slate-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {t("empty.loading")}
      </div>
    );
  }

  if (store) {
    return (
      <div className="border border-green-200 rounded-xl p-4 bg-green-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{String.fromCodePoint(0x1F6CD)}</span>
            <div>
              <div className="font-medium text-slate-900">{store.store_name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Connected</Badge>
                {store.store_url && (
                  <a href={`https://${store.store_url}`} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                    {store.store_url} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleDisconnect}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs">
            <Unlink className="w-3.5 h-3.5 me-1" />
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{String.fromCodePoint(0x1F6CD)}</span>
        <div>
          <div className="font-medium text-slate-900">Salla</div>
          <p className="text-xs text-slate-500">Easy Mode — install from Salla App Store</p>
        </div>
      </div>

      {!showLinkInput ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Install <strong>ProfitPilot</strong> from the Salla App Store. Your store will be connected automatically via webhook.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowLinkInput(true)}>
              <Link className="w-3.5 h-3.5 me-1" />
              Link My Store
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Enter your Salla store domain (e.g. <code className="bg-slate-100 px-1 rounded">mystore.salla.sa</code>) to link it to your account.
          </p>
          <div className="flex gap-2">
            <Input
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="mystore.salla.sa"
              className="flex-1"
            />
            <Button size="sm" onClick={handleLink} disabled={linking || !storeUrl.trim()}>
              {linking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Link"}
            </Button>
          </div>
          <button onClick={() => setShowLinkInput(false)} className="text-xs text-slate-400 hover:text-slate-600">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}