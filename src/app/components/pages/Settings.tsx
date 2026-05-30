import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Plug, Plus, Loader2 } from "lucide-react";
import { getSupabase } from "../supabase-client";
import { localAuth } from "../../../services/local-auth";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import { CURRENCIES, CurrencyCode, getCurrency, setCurrency } from "../../../services/currency-store";

function isDemoMode(): boolean {
  return localStorage.getItem("demo_mode") === "true" || localAuth.isAuthenticated();
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  store_name: string;
  store_url: string;
  currency: CurrencyCode;
  default_vat: number;
  default_shipping: number;
  default_cod_fee: number;
  default_packaging: number;
}

const demoProfile: UserProfile = {
  id: "demo-user",
  email: "demo@profitpilot.app",
  full_name: "Demo User",
  store_name: "My Store",
  store_url: "",
  currency: getCurrency(),
  default_vat: 5,
  default_shipping: 10,
  default_cod_fee: 15,
  default_packaging: 5,
};

export function Settings() {
  const { t, dir } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamMembers] = useState([
    { name: t("settings.teamMembers") === "Team Members" ? "You" : "أنت", role: "Owner", email: "you@example.com" },
  ]);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const localUser = localAuth.getUser();
      if (localAuth.isDemoMode() || localUser) {
        setProfile({
          ...demoProfile,
          id: localUser?.id || "demo-user",
          email: localUser?.email || "demo@profitpilot.app",
          full_name: localUser?.name || "Demo User",
          currency: getCurrency(),
        });
        setLoading(false);
        return;
      }
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
        if (data) {
          setProfile(data);
          const savedCur = getCurrency();
          if (data.currency !== savedCur && CURRENCIES.some(c => c.code === data.currency)) {
            setCurrency(data.currency as CurrencyCode);
          }
        } else {
          const np: UserProfile = {
            id: user.id, email: user.email || "", full_name: user.email?.split("@")[0] || "User",
            store_name: "My Store", store_url: "", currency: getCurrency(),
            default_vat: 5, default_shipping: 0, default_cod_fee: 0, default_packaging: 0,
          };
          setProfile(np);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      if (isDemoMode()) {
        setProfile({ ...demoProfile, currency: getCurrency() });
      } else {
        toast.error("Could not load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (val: string) => {
    const code = val as CurrencyCode;
    setProfile(p => p ? { ...p, currency: code } : null);
    setCurrency(code);
    toast.success(`Currency set to ${code}`);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      setCurrency(profile.currency);
      if (isDemoMode()) {
        toast.success(t("settings.team") || "Settings saved");
        setSaving(false);
        return;
      }
      const supabase = getSupabase();
      const { error } = await supabase.from("user_profiles").upsert({
        id: profile.id, email: profile.email, full_name: profile.full_name,
        store_name: profile.store_name, store_url: profile.store_url, currency: profile.currency,
        default_vat: profile.default_vat, default_shipping: profile.default_shipping,
        default_cod_fee: profile.default_cod_fee, default_packaging: profile.default_packaging,
      });
      if (error) throw error;
      toast.success("Profile saved");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-700" /></div>;
  }
  if (!profile) {
    return <div className="p-6 text-slate-500">{t("empty.loading")}</div>;
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto" dir={dir}>
      <div>
        <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{t("settings.title")}</h1>
        <p className="text-slate-500 text-sm">{t("settings.sub")}</p>
      </div>

      <Tabs defaultValue="store">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="store">{t("settings.store")}</TabsTrigger>
          <TabsTrigger value="team">{t("settings.team")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("settings.integrations")}</TabsTrigger>
          <TabsTrigger value="billing">{t("settings.billing")}</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-4 space-y-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-4">{t("settings.storeInfo")}</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700 mb-1">{t("store.fullName")}</Label>
                <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-slate-700 mb-1">{t("store.email")}</Label>
                <Input value={profile.email} disabled />
              </div>
              <div>
                <Label className="text-slate-700 mb-1">{t("settings.storeName")}</Label>
                <Input value={profile.store_name} onChange={(e) => setProfile({ ...profile, store_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-slate-700 mb-1">{t("settings.storeUrl")}</Label>
                <Input value={profile.store_url} onChange={(e) => setProfile({ ...profile, store_url: e.target.value })} placeholder="https://example.com" />
              </div>
              <div>
                <Label className="text-slate-700 mb-1">{t("settings.currency")}</Label>
                <Select value={profile.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} — {c.symbol} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">{t("products.vat")} (%) <InfoTip tipKey="vat" /></Label>
                <Input type="number" value={profile.default_vat} onChange={(e) => setProfile({ ...profile, default_vat: Number(e.target.value) })} min="0" max="100" />
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-4">{t("settings.defaults")}</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">{t("products.shipping")} <InfoTip tipKey="shipping" /></Label>
                <Input type="number" value={profile.default_shipping} onChange={(e) => setProfile({ ...profile, default_shipping: Number(e.target.value) })} min="0" />
              </div>
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">{t("products.cod")} <InfoTip tipKey="cod" /></Label>
                <Input type="number" value={profile.default_cod_fee} onChange={(e) => setProfile({ ...profile, default_cod_fee: Number(e.target.value) })} min="0" />
              </div>
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">{t("products.packaging")} <InfoTip tipKey="packaging" /></Label>
                <Input type="number" value={profile.default_packaging} onChange={(e) => setProfile({ ...profile, default_packaging: Number(e.target.value) })} min="0" />
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
              <Button className="bg-blue-700 hover:bg-blue-800" onClick={saveProfile} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
                {t("settings.store") === "Store" ? "Save Settings" : t("products.save")}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-900">{t("settings.teamMembers")}</div>
              <Button className="bg-blue-700 hover:bg-blue-800" disabled><Plus className="w-4 h-4 me-1" /> {t("settings.invite")}</Button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((m) => (
                <div key={m.email} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9"><AvatarFallback className="bg-blue-700 text-white text-xs">{m.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div><div className="text-slate-900 text-sm">{m.name}</div><div className="text-xs text-slate-500">{m.email}</div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue={m.role}>
                      <SelectTrigger className="w-40" disabled><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Media Buyer">Media Buyer</SelectItem>
                        <SelectItem value="Analyst">Analyst</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-4 p-3 bg-slate-50 rounded-lg">
              Team collaboration features coming soon. Upgrade to Pro plan to invite team members.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-1">{t("settings.storeApis")}</div>
            <div className="text-xs text-slate-500 mb-4">{t("settings.storeApisDesc")}</div>
            <div className="grid md:grid-cols-3 gap-3">
              {["Shopify", "Salla", "Zid"].map((s) => <IntegrationCard key={s} name={s} desc="Sync products, orders, and customers" t={t} />)}
            </div>
          </Card>
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-1">{t("settings.adApis")}</div>
            <div className="text-xs text-slate-500 mb-4">{t("settings.adApisDesc")}</div>
            <div className="grid md:grid-cols-3 gap-3">
              {["Meta Ads", "TikTok Ads", "Google Ads"].map((s) => <IntegrationCard key={s} name={s} desc="Auto-sync spend and ROAS" t={t} />)}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-slate-900">{t("settings.subscription")}</div>
                <div className="text-xs text-slate-500">{t("settings.subDesc")}</div>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">Pro · Trial</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 rounded-xl border-slate-200">
                <div className="text-slate-900">Basic</div>
                <div className="text-2xl mt-1">$19<span className="text-sm text-slate-500">/mo</span></div>
                <Button variant="outline" className="w-full mt-3 border-slate-200">{t("settings.downgrade")}</Button>
              </Card>
              <Card className="p-4 rounded-xl border-blue-700 ring-2 ring-blue-100">
                <div className="text-slate-900">Pro · Current</div>
                <div className="text-2xl mt-1">$49<span className="text-sm text-slate-500">/mo</span></div>
                <Button className="w-full mt-3 bg-blue-700 hover:bg-blue-800">{t("settings.manage")}</Button>
              </Card>
              <Card className="p-4 rounded-xl border-slate-200">
                <div className="text-slate-900">Agency</div>
                <div className="text-2xl mt-1">$149<span className="text-sm text-slate-500">/mo</span></div>
                <Button variant="outline" className="w-full mt-3 border-slate-200">{t("cta.upgrade")}</Button>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntegrationCard({ name, desc, t }: { name: string; desc: string; t: (k: string) => string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Plug className="w-4 h-4" /></div>
        <div><div className="text-slate-900 text-sm">{name}</div><div className="text-xs text-slate-500">{desc}</div></div>
      </div>
      <Button variant="outline" className="w-full border-slate-200" disabled>{t("settings.connect")}</Button>
      <div className="text-[10px] text-orange-600 mt-2">{t("settings.availableSoon")}</div>
    </div>
  );
}