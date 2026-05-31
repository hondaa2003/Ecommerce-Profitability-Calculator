import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Plug, Plus, Loader2, RefreshCw, Bell, X } from "lucide-react";
import { supabase } from "../../../utils/supabase/client";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import { CURRENCIES, CurrencyCode, getCurrency, setCurrency } from "../../../services/currency-store";
import { IntegrationManager, PLATFORMS, type PlatformId } from "../../../services/integration-manager";
import { SallaConnect } from "../SallaConnect";
import type { Profile } from "../../types";

export function Settings() {
  const { t, dir } = useI18n();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "store";
  const [profile, setProfile] = useState<Profile | null>(null);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setProfile(data as Profile);
        }
      }
    } catch {
      toast.error("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrency = (val: string) => {
    const code = val as CurrencyCode;
    setCurrency(code);
    // Note: Currency is stored in local storage for now, but we could add it to profile table
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: profile.full_name,
        onboarding_completed: profile.onboarding_completed
      }).eq("id", profile.id);
      
      if (error) throw error;
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
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

      <Tabs defaultValue={initialTab}>
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
              <div><Label>{t("store.fullName")}</Label><Input value={profile.full_name || ""} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
              <div><Label>{t("settings.currency")}</Label>
                <Select value={getCurrency()} onValueChange={handleCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {c.symbol} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
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
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 mb-4"><Plug className="w-5 h-5 text-blue-600" />{t("settings.storeApis")}</div>
            <div className="text-xs text-slate-500 mb-4">{t("settings.storeApisDesc")}</div>
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
              <Badge className="bg-blue-50 text-blue-700">{profile.plan} · Active</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "free", price: "$0", current: profile.plan === "free", action: "Current" },
                { name: "pro", price: "$49", current: profile.plan === "pro", action: "Upgrade" },
                { name: "agency", price: "$149", current: profile.plan === "agency", action: "Upgrade" },
              ].map(plan => (
                <Card key={plan.name} className={`p-4 rounded-xl ${plan.current ? "border-blue-700 ring-2 ring-blue-100" : "border-slate-200"}`}>
                  <div className="text-slate-900 capitalize">{plan.name}</div>
                  <div className="text-2xl mt-1">{plan.price}<span className="text-sm text-slate-500">/mo</span></div>
                  <Button variant={plan.current ? "default" : "outline"} className={`w-full mt-3 ${plan.current ? "bg-blue-700 hover:bg-blue-800" : "border-slate-200"}`} disabled={plan.current}>{plan.action}</Button>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

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
            <div className="space-y-2">
              <Label>{connectedP?.category === 'store' ? 'Store URL' : 'Ad Account ID'}</Label>
              <Input value={credentialValue} onChange={e => setCredentialValue(e.target.value)} placeholder={connectedP?.category === 'store' ? "https://mystore.com" : "123456789"} />
            </div>
            <Button onClick={handleConnect} className="w-full bg-blue-700 hover:bg-blue-800" disabled={!credentialValue}>Connect {connectedP?.name}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IntegrationRow({ id, connected, syncing, syncResult, onConnect, onDisconnect, onSync }: any) {
  const p = PLATFORMS[id as PlatformId];
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{p.icon}</div>
        <div><div className="text-slate-900 text-sm font-medium">{p.name}</div>{syncResult && <div className="text-[10px] text-emerald-600">{syncResult}</div>}</div>
      </div>
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <Button variant="ghost" size="sm" onClick={onSync} disabled={syncing}>{syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}</Button>
            <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-red-500 hover:text-red-600 hover:bg-red-50"><X className="w-3.5 h-3.5" /></Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onConnect} className="text-xs border-slate-200">{t("settings.connect")}</Button>
        )}
      </div>
    </div>
  );
}
