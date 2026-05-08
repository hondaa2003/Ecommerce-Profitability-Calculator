import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Loader2, Plug, Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api";
import { toast } from "sonner";
import { useI18n } from "../i18n";

interface Campaign {
  id: string;
  name: string;
  platform: "Facebook" | "TikTok" | "Google";
  spend: number;
  orders: number;
  revenue: number;
}


const platformColors: Record<string, string> = {
  Facebook: "bg-blue-50 text-blue-700",
  TikTok: "bg-slate-900 text-white",
  Google: "bg-orange-50 text-orange-700",
};

export function Campaigns() {
  const { t } = useI18n();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<Campaign["platform"]>("Facebook");
  const [spend, setSpend] = useState(0);
  const [orders, setOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const items = await api.list<Campaign>("campaigns");
        setCampaigns(items);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
        toast.error("Could not load campaigns from server");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = campaigns.reduce(
    (a, c) => ({ spend: a.spend + c.spend, orders: a.orders + c.orders, revenue: a.revenue + c.revenue }),
    { spend: 0, orders: 0, revenue: 0 }
  );
  const totalRoas = totals.spend ? (totals.revenue / totals.spend).toFixed(2) : "0";
  const totalCpa = totals.orders ? (totals.spend / totals.orders).toFixed(0) : "0";
  const mer = totals.spend ? (totals.revenue / totals.spend).toFixed(2) : "0";

  const addCampaign = async () => {
    if (!name) return;
    setSaving(true);
    try {
      const item = await api.create<Campaign>("campaigns", { name, platform, spend, orders, revenue });
      setCampaigns((c) => [item, ...c]);
      setName(""); setSpend(0); setOrders(0); setRevenue(0);
      toast.success("Campaign saved");
    } catch (err) {
      console.error("Failed to create campaign:", err);
      toast.error("Could not save campaign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>Campaign Tracking</h1>
        <p className="text-slate-500 text-sm">Log ad spend manually today, connect APIs tomorrow.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Spend" value={`AED ${totals.spend.toLocaleString()}`} tip={tips.adSpend} color="orange" />
        <KpiCard label="Revenue" value={`AED ${totals.revenue.toLocaleString()}`} tip={tips.revenue} color="blue" />
        <KpiCard label="ROAS" value={`${totalRoas}x`} tip={tips.roas} color="emerald" />
        <KpiCard label="MER" value={`${mer}x`} tip={tips.mer} color="blue" />
      </div>

      {/* Manual entry */}
      <Card className="p-5 rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-900">Manual Ad Spend Entry</div>
            <div className="text-xs text-slate-500">Add a campaign and its results.</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <Label className="text-slate-700 mb-1 flex items-center gap-1">Campaign Name <InfoTip tipKey="campaign" /></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Watch X - Broad" />
          </div>
          <div>
            <Label className="text-slate-700 mb-1">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Campaign["platform"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-700 mb-1 flex items-center gap-1">Spend <InfoTip tipKey="adSpend" /></Label>
            <Input type="number" value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-slate-700 mb-1 flex items-center gap-1">Orders <InfoTip tipKey="orders" /></Label>
            <Input type="number" value={orders} onChange={(e) => setOrders(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-slate-700 mb-1 flex items-center gap-1">Revenue <InfoTip tipKey="revenue" /></Label>
            <Input type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={addCampaign} disabled={saving} className="bg-blue-700 hover:bg-blue-800">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Add Campaign
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-slate-200">
          <div className="text-slate-900 mb-4">Daily Performance</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-12} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="spend" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* API Integrations placeholder */}
        <Card className="p-5 rounded-2xl border-slate-200">
          <div className="text-slate-900 mb-1">API Integrations</div>
          <div className="text-xs text-slate-500 mb-4">Connect your ad accounts (coming soon).</div>
          <div className="space-y-3">
            {["Meta Ads API", "TikTok Ads API", "Google Ads API"].map((p) => (
              <div key={p} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Plug className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-900">{p}</div>
                    <div className="text-xs text-slate-400">Auto-sync spend & ROAS</div>
                  </div>
                </div>
                <Badge className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50">Soon</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Campaign table */}
      <Card className="rounded-2xl border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="text-slate-900">All Campaigns</div>
          <div className="text-xs text-slate-500">Total CPA: AED {totalCpa} · MER: {mer}x</div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Spend <InfoTip tipKey="adSpend" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Orders <InfoTip tipKey="orders" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Revenue <InfoTip tipKey="revenue" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">CPA <InfoTip tipKey="cpa" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">ROAS <InfoTip tipKey="roas" /></span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {t("empty.loading")}…
                </TableCell>
              </TableRow>
            )}
            {!loading && campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <Plug className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 mb-1">{t("empty.noCampaigns")}</div>
                      <div className="text-sm text-slate-500">{t("empty.noCampaignsSub")}</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && campaigns.map((c) => {
              const cpa = c.orders ? (c.spend / c.orders).toFixed(0) : "—";
              const roas = c.spend ? (c.revenue / c.spend).toFixed(2) : "—";
              const profitable = c.revenue > c.spend;
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-slate-900">{c.name}</TableCell>
                  <TableCell>
                    <Badge className={`${platformColors[c.platform]} hover:${platformColors[c.platform]} border-0`}>
                      {c.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>AED {c.spend.toLocaleString()}</TableCell>
                  <TableCell>{c.orders}</TableCell>
                  <TableCell>AED {c.revenue.toLocaleString()}</TableCell>
                  <TableCell>AED {cpa}</TableCell>
                  <TableCell className={profitable ? "text-emerald-600" : "text-orange-600"}>{roas}x</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, tip, color }: { label: string; value: string; tip: any; color: string }) {
  const palette: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <Card className="p-4 rounded-2xl border-slate-200">
      <div className={`inline-flex w-9 h-9 rounded-lg items-center justify-center mb-3 ${palette[color]}`}>
        <span className="text-xs">$</span>
      </div>
      <div className="text-xs text-slate-500 flex items-center gap-1">{label} <InfoTip {...tip} /></div>
      <div className="text-slate-900 mt-1">{value}</div>
    </Card>
  );
}
