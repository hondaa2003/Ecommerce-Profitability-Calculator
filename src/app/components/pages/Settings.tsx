import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Plug, Plus, Loader2, RefreshCw, Check, X, ExternalLink } from "lucide-react";
import { getSupabase } from "../supabase-client";
import { localAuth } from "../../../services/local-auth";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import { CURRENCIES, CurrencyCode, getCurrency, setCurrency } from "../../../services/currency-store";
import { IntegrationManager, PLATFORMS, type PlatformId } from "../../../services/integration-manager";
import { SallaConnect } from "../SallaConnect";

function isOffline(): boolean {
  return localStorage.getItem("demo_mode") === "true" || localAuth.isAuthenticated();
}

interface UserProfile {
  id: string; email: string; full_name: string; store_name: string; store_url: string;
  currency: CurrencyCode; default_vat: number; default_shipping: number;
  default_cod_fee: number; default_packaging: number;
}

const demoProfile: UserProfile = {
  id: "demo-user", email: "demo@profitpilot.app", full_name: "Demo User",
  store_name: "My Store", store_url: "", currency: getCurrency(),
  default_vat: 5, default_shipping: 10, default_cod_fee: 15, default_packaging: 5,
};

export function Settings() {
  const { t, dir } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [teamMembers] = useState([{ name: "You", role: "Owner", email: "you@example.com" }]);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [syncResults, setSyncResults] = useState<Record<string, string>>({});
  const [connectDialog, setConnectDialog] = useState<PlatformId | null>(null);
  const [credentialValue, setCredentialValue] = useState("");

  useEffect(() => { loadProfile(); refreshConnections(); }, []);
  
  const refreshConnections = () => {
    const c: Record<string, boolean> = {};
    Object.keys(PLATFORMS).forEach(id => { c[id] = IntegrationManager.isConnected(id as PlatformId); });
    setConnections(c);
  };

  const loadProfile = async () => {
    try {
      const localUser = localAuth.getUser();
      if (isOffline() || localUser) {
        setProfile({ ...demoProfile, id: localUser?.id || "demo-user", email: localUser?.email || "demo@profitpilot.app", full_name: localUser?.name || "Demo User", currency: getCurrency() });
        setLoading(false); return;
      }
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
        setProfile(data || { id: user.id, email: user.email || "", full_name: user.email?.split("@")[0] || "User", store_name: "My Store", store_url: "", currency: getCurrency(), default_vat: 5, default_shipping: 0, default_cod_fee: 0, default_packaging: 0 });
      }
    } catch { if (isOffline()) setProfile({ ...demoProfile, currency: getCurrency() }); }
    finally { setLoading(false); }
  };

  const handleCurrency = (val: string) => {
    const code = val as CurrencyCode;
    setProfile(p => p ? { ...p, currency: code } : null);
    setCurrency(code);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      setCurrency(profile.currency);
      if (isOffline()) { toast.success("Settings saved"); setSaving(false); return; }
      const supabase = getSupabase();
      const { error } = await supabase.from("user_profiles").upsert({ ...profile });
      if (error) throw error;
      toast.success("Profile saved");
    } catch { toast.error("Could not save profile"); }
    finally { setSaving(false); }
  };

  const openConnectDialog = (id: PlatformId) => {
    setCredentialValue("");
    setConnectDialog(id);
  };

  const handleConnect = () => {
    if (!connectDialog) return;
    const p = PLATFORMS[connectDialog];
    const creds = p.category === 'store' ? { storeUrl: credentialValue } : { adAccountId: credentialValue };
    IntegrationManager.connect(connectDialog, { ...creds, apiKey: credentialValue });
    refreshConnections();
    setConnectDialog(null);
    toast.success(`${p.name} connected successfully`);
  };

  const handleDisconnect = (id: PlatformId) => {
    IntegrationManager.disconnect(id);
    refreshConnections();
    setSyncResults(prev => { const n = { ...prev }; delete n[id]; return n; });
    toast.success(`${PLATFORMS[id].name} disconnected`);
  };

  const handleSync = async (id: PlatformId) => {
    setSyncing(id);
    try {
      const result = await IntegrationManager.sync(id);
      refreshConnections();
      setSyncResults(prev => ({ ...prev, [id]: result.message }));
      toast.success(result.message);
    } catch (err: any) { toast.error(err.message); }
    finally { setSyncing(null); }
  };

  const storePlatforms = ['shopify', 'zid'] as PlatformId[];
  const adsPlatforms = ['meta', 'tiktok', 'google'] as PlatformId[];

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-700" /></div>;
  if (!profile) return <div className="p-6 text-slate-500">{t("empty.loading")}</div>;

  const connectedP = connectDialog ? PLATFORMS[connectDialog] : null;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto" dir={dir}>
      <div><h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{t("settings.title")}</h1><p className="text-slate-500 text-sm">{t("settings.sub")}</p></div>

      <Tabs defaultValue="store">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="store">{t("settings.store")}</TabsTrigger>
          <TabsTrigger value="team">{t("settings.team")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("settings.integrations")}</TabsTrigger>
          <TabsTrigger value="billing">{t("settings.billing")}</TabsTrigger>
        </TabsList>

        {/* STORE TAB */}
        <TabsContent value="store" className="mt-4 space-y-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-4">{t("settings.storeInfo")}</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>{t("store.fullName")}</Label><Input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
              <div><Label>{t("store.email")}</Label><Input value={profile.email} disabled /></div>
              <div><Label>{t("settings.storeName")}</Label><Input value={profile.store_name} onChange={e => setProfile({ ...profile, store_name: e.target.value })} /></div>
              <div><Label>{t("settings.storeUrl")}</Label><Input value={profile.store_url} onChange={e => setProfile({ ...profile, store_url: e.target.value })} placeholder="https://example.com" /></div>
              <div><Label>{t("settings.currency")}</Label>
                <Select value={profile.currency} onValueChange={handleCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {c.symbol} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="flex items-center gap-1">{t("products.vat")} (%) <InfoTip tipKey="vat" /></Label><Input type="number" value={profile.default_vat} onChange={e => setProfile({ ...profile, default_vat: Number(e.target.value) })} min="0" max="100" /></div>
            </div>
          </Card>
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-4">{t("settings.defaults")}</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label className="flex items-center gap-1">{t("products.shipping")} <InfoTip tipKey="shipping" /></Label><Input type="number" value={profile.default_shipping} onChange={e => setProfile({ ...profile, default_shipping: Number(e.target.value) })} min="0" /></div>
              <div><Label className="flex items-center gap-1">{t("products.cod")} <InfoTip tipKey="cod" /></Label><Input type="number" value={profile.default_cod_fee} onChange={e => setProfile({ ...profile, default_cod_fee: Number(e.target.value) })} min="0" /></div>
              <div><Label className="flex items-center gap-1">{t("products.packaging")} <InfoTip tipKey="packaging" /></Label><Input type="number" value={profile.default_packaging} onChange={e => setProfile({ ...profile, default_packaging: Number(e.target.value) })} min="0" /></div>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
              <Button className="bg-blue-700 hover:bg-blue-800" onClick={saveProfile} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 me-1 animate-spin" />} Save Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="mt-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-900">{t("settings.teamMembers")}</div>
              <Button className="bg-blue-700 hover:bg-blue-800" disabled><Plus className="w-4 h-4 me-1" /> {t("settings.invite")}</Button>
            </div>
            <div className="space-y-3">
              {teamMembers.map(m => (
                <div key={m.email} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9"><AvatarFallback className="bg-blue-700 text-white text-xs">{m.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div><div className="text-slate-900 text-sm">{m.name}</div><div className="text-xs text-slate-500">{m.email}</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-4 p-3 bg-slate-50 rounded-lg">Team collaboration coming soon.</div>
          </Card>
        </TabsContent>

        {/* INTEGRATIONS TAB */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          {/* Store APIs */}
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 mb-4"><Plug className="w-5 h-5 text-blue-600" />{t("settings.storeApis")}</div>
            <div className="text-xs text-slate-500 mb-4">{t("settings.storeApisDesc")}</div>

            {/* Salla — Full OAuth integration */}
            <div className="mb-4">
              <SallaConnect />
            </div>
            <div className="space-y-3">
              {storePlatforms.map(id => (
                <IntegrationRow key={id} id={id} connected={connections[id]} syncing={syncing === id} syncResult={syncResults[id]}
                  onConnect={() => openConnectDialog(id)} onDisconnect={() => handleDisconnect(id)} onSync={() => handleSync(id)} />
              ))}
            </div>
          </Card>

          {/* Ad Platform APIs */}
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 mb-2"><RefreshCw className="w-5 h-5 text-purple-600" />{t("settings.adApis")}</div>
            <div className="text-xs text-slate-500 mb-2">{t("settings.adApisDesc")}</div>
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4">
              ⚠️ Read-only access only. Your ad accounts will never be modified — we only monitor campaign performance.
            </div>
            <div className="space-y-3">
              {adsPlatforms.map(id => (
                <IntegrationRow key={id} id={id} connected={connections[id]} syncing={syncing === id} syncResult={syncResults[id]}
                  onConnect={() => openConnectDialog(id)} onDisconnect={() => handleDisconnect(id)} onSync={() => handleSync(id)} />
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* BILLING TAB */}
        <TabsContent value="billing" className="mt-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div><div className="text-slate-900">{t("settings.subscription")}</div><div className="text-xs text-slate-500">{t("settings.subDesc")}</div></div>
              <Badge className="bg-blue-50 text-blue-700">Pro · Trial</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Basic", price: "$19", current: false, action: t("settings.downgrade") },
                { name: "Pro", price: "$49", current: true, action: t("settings.manage") },
                { name: "Agency", price: "$149", current: false, action: t("cta.upgrade") },
              ].map(plan => (
                <Card key={plan.name} className={`p-4 rounded-xl ${plan.current ? "border-blue-700 ring-2 ring-blue-100" : "border-slate-200"}`}>
                  <div className="text-slate-900">{plan.name}{plan.current ? " · Current" : ""}</div>
                  <div className="text-2xl mt-1">{plan.price}<span className="text-sm text-slate-500">/mo</span></div>
                  <Button variant={plan.current ? "default" : "outline"} className={`w-full mt-3 ${plan.current ? "bg-blue-700 hover:bg-blue-800" : "border-slate-200"}`}>{plan.action}</Button>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Connection Dialog */}
      <Dialog open={!!connectDialog} onOpenChange={(open) => { if (!open) setConnectDialog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{connectedP?.icon}</span>
              Connect {connectedP?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="text-sm text-slate-700">{connectedP?.description}</div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-medium text-sm text-blue-800 mb-2">How to get your credentials:</div>
              <p className="text-xs text-blue-700 leading-relaxed mb-2">{connectedP?.setupInstructions}</p>
              <a href={connectedP?.docUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                Open documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <Label>{connectedP?.credentialLabel}</Label>
              <Input
                value={credentialValue}
                onChange={e => setCredentialValue(e.target.value)}
                placeholder={connectedP?.credentialPlaceholder}
                className="mt-1"
              />
              <p className="text-xs text-slate-400 mt-1">
                {connectedP?.category === 'store' ? 'Enter your store URL to connect' : 'Enter your ad account ID to monitor'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConnectDialog(null)}>Cancel</Button>
              <Button onClick={handleConnect} disabled={!credentialValue.trim()} className="bg-blue-700 hover:bg-blue-800">
                <Plug className="w-4 h-4 me-1" /> Authorize & Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IntegrationRow({ id, connected, syncing, syncResult, onConnect, onDisconnect, onSync }: {
  id: PlatformId; connected: boolean; syncing: boolean; syncResult?: string;
  onConnect: () => void; onDisconnect: () => void; onSync: () => void;
}) {
  const p = PLATFORMS[id];
  const conn = IntegrationManager.getConnectionDetails(id);
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors bg-white">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{p.icon}</div>
        <div>
          <div className="text-slate-900 text-sm font-medium">{p.name}</div>
          <div className="text-xs text-slate-500">{p.description}</div>
          {connected && conn.storeUrl && <div className="text-xs text-slate-400 mt-0.5">{conn.storeUrl}</div>}
          {connected && conn.adAccountId && <div className="text-xs text-slate-400 mt-0.5">{conn.adAccountId}</div>}
          {connected && conn.lastSync && <div className="text-xs text-green-600 mt-0.5">Last sync: {new Date(conn.lastSync).toLocaleString()}</div>}
          {syncResult && <div className="text-xs text-blue-600 mt-0.5">{syncResult}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <Button size="sm" variant="outline" onClick={onSync} disabled={syncing} className="border-slate-200">
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="ms-1">Sync</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={onDisconnect} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onConnect} className="bg-blue-700 hover:bg-blue-800">
            <Plug className="w-3.5 h-3.5 me-1" /> Connect
          </Button>
        )}
      </div>
    </div>
  );
}