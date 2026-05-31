import { useEffect, useState, useRef } from "react";
import { api } from "../../../services/api-client";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { useI18n } from "../i18n";
import { formatCurrencyDecimal, getCurrency } from "../../../services/currency-store";

function numVal(v: number): string { return v === 0 ? "0" : v ? String(v) : ""; }

export function Campaigns() {
  const { t, dir } = useI18n();
  const curr = getCurrency();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", platform: "Meta", spend: 0, orders_count: 0, revenue: 0 });

  const fetchCampaigns = async () => {
    setLoading(true);
    try { setCampaigns(await api.getCampaigns()); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleSave = async () => {
    try {
      await api.createCampaign({ ...form, spend: Number(form.spend), revenue: Number(form.revenue), orders_count: Number(form.orders_count) });
      toast.success(t("camp.add"));
      setForm({ name: "", platform: "Meta", spend: 0, orders_count: 0, revenue: 0 });
      setDialogOpen(false);
      fetchCampaigns();
    } catch { toast.error(t("camp.sub")); }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = text.split("\n").map(line => line.trim()).filter(Boolean);
      if (rows.length < 2) { toast.error("CSV must have a header row + data"); return; }
      const headers = rows[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
      const items = rows.slice(1).map(row => {
        const vals = row.split(",").map(v => v.trim().replace(/"/g, ""));
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        return obj;
      }).filter(r => r.name);
      await api.importCampaigns(items);
      toast.success(`${items.length} campaigns imported`);
      fetchCampaigns();
    } catch { toast.error("Import failed. Check CSV format."); }
    finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const roas = (s: number, r: number) => s > 0 ? (r / s).toFixed(2) : "0.00";

  const platformLabel = (p: string) => {
    switch (p?.toLowerCase()) {
      case "meta": return "Meta (Facebook/Instagram)";
      case "google": return "Google Ads";
      case "tiktok": return "TikTok Ads";
      case "snapchat": return "Snapchat Ads";
      default: return p;
    }
  };

  const roasColor = (val: string) => {
    const n = parseFloat(val);
    if (n >= 2) return "text-green-600";
    if (n >= 1) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">{t("empty.loading")}</div>;

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("camp.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("camp.sub")}</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileImport} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
            <Upload className="w-4 h-4 me-1" /> {importing ? "Importing..." : "CSV"}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 me-1" /> {t("camp.add")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("camp.add")}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div><Label>{t("camp.name")}</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Summer Sale 2024" /></div>
              <div><Label>{t("camp.platform")}</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meta">Meta (Facebook/Instagram)</SelectItem>
                    <SelectItem value="Google">Google Ads</SelectItem>
                    <SelectItem value="TikTok">TikTok Ads</SelectItem>
                    <SelectItem value="Snapchat">Snapchat Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("kpi.spend")} ({curr})</Label><Input type="number" value={numVal(form.spend)} onChange={e => setForm({ ...form, spend: Number(e.target.value) })} placeholder="500" /></div>
              <div><Label>{t("kpi.revenue")} ({curr})</Label><Input type="number" value={numVal(form.revenue)} onChange={e => setForm({ ...form, revenue: Number(e.target.value) })} placeholder="1500" /></div>
              <div><Label>{t("kpi.orders")}</Label><Input type="number" value={numVal(form.orders_count)} onChange={e => setForm({ ...form, orders_count: Number(e.target.value) })} placeholder="10" /></div>
              <Button onClick={handleSave} disabled={!form.name || form.spend <= 0} className="w-full">{t("camp.add")}</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><p className="text-lg">{t("empty.noCampaigns")}</p><p className="text-sm mt-1">{t("empty.noCampaignsSub")}</p></div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(c => (
            <Card key={c.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-slate-500">{platformLabel(c.platform)} &middot; {c.orders_count} {t("kpi.orders")}</div>
              </div>
              <div className="text-end">
                <div className="font-bold text-orange-600">{t("kpi.spend")}: {formatCurrencyDecimal(c.spend || 0)}</div>
                <div className="text-sm text-emerald-600">Rev: {formatCurrencyDecimal(c.revenue || 0)}</div>
                <Badge className={`mt-0.5 ${roasColor(roas(c.spend, c.revenue))}`}>ROAS: {roas(c.spend, c.revenue)}x</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}