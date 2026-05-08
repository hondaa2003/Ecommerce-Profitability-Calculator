import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Loader2, Plug, Plus, Trash2, Edit3, AlertCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api";
import { toast } from "sonner";
import { useI18n } from "../i18n";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  spend: number;
  orders_count?: number;
  revenue: number;
}

const platformColors: Record<string, string> = {
  Facebook: "bg-blue-50 text-blue-700 border-blue-100",
  TikTok: "bg-slate-900 text-white border-slate-900",
  Google: "bg-orange-50 text-orange-700 border-orange-100",
  Instagram: "bg-pink-50 text-pink-700 border-pink-100",
  LinkedIn: "bg-blue-50 text-blue-700 border-blue-100",
};

export function Campaigns() {
  const { t } = useI18n();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("Facebook");
  const [spend, setSpend] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
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
    (a, c) => ({
      spend: a.spend + c.spend,
      orders: a.orders + (c.orders_count || 0),
      revenue: a.revenue + c.revenue,
    }),
    { spend: 0, orders: 0, revenue: 0 }
  );

  const totalRoas = totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : "0";
  const totalCpa = totals.orders > 0 ? (totals.spend / totals.orders).toFixed(0) : "0";
  const mer = totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : "0";

  const addCampaign = async () => {
    if (!name) {
      toast.error("Campaign name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const item = await api.update<Campaign>("campaigns", editingId, {
          name,
          platform,
          spend,
          orders_count: ordersCount,
          revenue,
        });
        setCampaigns((c) => c.map((x) => (x.id === editingId ? item : x)));
        toast.success("Campaign updated");
      } else {
        const item = await api.create<Campaign>("campaigns", {
          name,
          platform,
          spend,
          orders_count: ordersCount,
          revenue,
        });
        setCampaigns((c) => [item, ...c]);
        toast.success("Campaign saved");
      }
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("Failed to save campaign:", err);
      toast.error("Could not save campaign");
    } finally {
      setSaving(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    const previous = campaigns;
    setCampaigns((arr) => arr.filter((x) => x.id !== id));
    try {
      await api.remove("campaigns", id);
    } catch (err) {
      console.error("Failed to delete campaign:", err);
      toast.error("Could not delete campaign");
      setCampaigns(previous);
    }
  };

  const startEdit = (campaign: Campaign) => {
    setName(campaign.name);
    setPlatform(campaign.platform);
    setSpend(campaign.spend);
    setOrdersCount(campaign.orders_count || 0);
    setRevenue(campaign.revenue);
    setEditingId(campaign.id);
    setOpen(true);
  };

  const resetForm = () => {
    setName("");
    setPlatform("Facebook");
    setSpend(0);
    setOrdersCount(0);
    setRevenue(0);
    setEditingId(null);
  };

  const closeDialog = () => {
    setOpen(false);
    resetForm();
  };

  const chartData = campaigns.slice(0, 5).map((c) => ({
    name: c.name.slice(0, 10),
    spend: c.spend,
    revenue: c.revenue,
  }));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Campaign Tracking
        </h1>
        <p className="text-slate-500 text-sm">Log ad spend manually today, connect APIs tomorrow.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Spend" value={`AED ${totals.spend.toLocaleString()}`} tip={tips.adSpend} color="orange" />
        <KpiCard label="Revenue" value={`AED ${totals.revenue.toLocaleString()}`} tip={tips.revenue} color="blue" />
        <KpiCard label="ROAS" value={`${totalRoas}x`} tip={tips.roas} color="emerald" />
        <KpiCard label="CPA" value={`AED ${totalCpa}`} tip={tips.cpa} color="blue" />
      </div>

      {/* API Integrations */}
      <Card className="p-6 rounded-2xl border-slate-200 bg-purple-50 border-purple-100">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-2">Connect Ad Platforms</h3>
            <p className="text-sm text-purple-800 mb-4">
              Automatically sync ad spend and performance data. Coming soon: Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-100" disabled>
                <Plug className="w-4 h-4 mr-1" /> Meta Ads
              </Button>
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-100" disabled>
                <Plug className="w-4 h-4 mr-1" /> Google Ads
              </Button>
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-100" disabled>
                <Plug className="w-4 h-4 mr-1" /> TikTok Ads
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Manual Entry */}
      <Card className="p-5 rounded-2xl border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-900 font-semibold">Manual Campaign Entry</div>
            <div className="text-xs text-slate-500">Add campaign data manually</div>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
            <DialogTrigger asChild>
              <Button className="bg-blue-700 hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-1" /> Add Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Campaign" : "Add New Campaign"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-700 mb-1 block font-medium">Campaign Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Summer Sale 2024"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 mb-1 block font-medium">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Google">Google Ads</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-700 mb-1 block font-medium">Ad Spend (AED)</Label>
                  <Input
                    type="number"
                    value={spend}
                    onChange={(e) => setSpend(Number(e.target.value))}
                    placeholder="0"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 mb-1 block font-medium">Orders Generated</Label>
                  <Input
                    type="number"
                    value={ordersCount}
                    onChange={(e) => setOrdersCount(Number(e.target.value))}
                    placeholder="0"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 mb-1 block font-medium">Revenue Generated (AED)</Label>
                  <Input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    placeholder="0"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-700 hover:bg-blue-800" onClick={addCampaign} disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    {editingId ? "Update Campaign" : "Save Campaign"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="p-5 rounded-2xl border-slate-200">
          <div className="text-slate-900 font-semibold mb-4">Spend vs Revenue</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="spend" fill="#f97316" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      <Card className="rounded-2xl border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>ROAS</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      <AlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 mb-1 font-medium">No campaigns yet</div>
                      <div className="text-sm text-slate-500">Start by adding your first campaign</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              campaigns.map((c) => {
                const campaignRoas = c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : "0";
                const roasStatus =
                  parseFloat(campaignRoas) >= 3
                    ? "bg-emerald-50 text-emerald-700"
                    : parseFloat(campaignRoas) >= 2
                      ? "bg-blue-50 text-blue-700"
                      : "bg-orange-50 text-orange-700";
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${platformColors[c.platform] || platformColors.Facebook} hover:${platformColors[c.platform]} border`}
                      >
                        {c.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>AED {c.spend.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">AED {c.revenue.toLocaleString()}</TableCell>
                    <TableCell>{c.orders_count || 0}</TableCell>
                    <TableCell>
                      <Badge className={`${roasStatus} hover:${roasStatus} border`}>{campaignRoas}x</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-blue-700"
                        onClick={() => startEdit(c)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-red-700"
                        onClick={() => deleteCampaign(c.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tip,
  color = "blue",
}: {
  label: string;
  value: string;
  tip: { title: string; content: string };
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <Card className={`p-4 rounded-xl border-0 ${colorMap[color]}`}>
      <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
        {label}
        <InfoTip {...tip} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}
