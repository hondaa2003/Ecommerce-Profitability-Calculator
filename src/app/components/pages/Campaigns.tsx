import { useEffect, useState } from "react";
import { api } from "../../../services/api-client";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", platform: "Meta", spend: 0, orders_count: 0, revenue: 0 });

  const fetchCampaigns = () => {
    setLoading(true);
    api.getCampaigns().then(setCampaigns).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleSave = async () => {
    try {
      await api.createCampaign({ ...form, spend: Number(form.spend), revenue: Number(form.revenue), orders_count: Number(form.orders_count) });
      toast.success("Campaign added");
      setForm({ name: "", platform: "Meta", spend: 0, orders_count: 0, revenue: 0 });
      setDialogOpen(false);
      fetchCampaigns();
    } catch {
      toast.error("Failed to save campaign");
    }
  };

  const roas = (s: number, r: number) => s > 0 ? (r / s).toFixed(2) : "0.00";

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading campaigns...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Ad Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Track your advertising performance.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Campaign</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Campaign Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Summer Sale 2024" />
              </div>
              <div>
                <Label>Platform</Label>
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
              <div>
                <Label>Ad Spend (AED)</Label>
                <Input type="number" value={form.spend || ""} onChange={e => setForm({ ...form, spend: Number(e.target.value) })} placeholder="500" />
              </div>
              <div>
                <Label>Revenue (AED)</Label>
                <Input type="number" value={form.revenue || ""} onChange={e => setForm({ ...form, revenue: Number(e.target.value) })} placeholder="1500" />
              </div>
              <div>
                <Label>Orders</Label>
                <Input type="number" value={form.orders_count || ""} onChange={e => setForm({ ...form, orders_count: Number(e.target.value) })} placeholder="10" />
              </div>
              <Button onClick={handleSave} disabled={!form.name || form.spend <= 0} className="w-full">
                Save Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No campaigns yet</p>
          <p className="text-sm mt-1">Add your first campaign to track ROAS</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(c => (
            <Card key={c.id} className="p-4 flex justify-between">
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-slate-500 capitalize">{c.platform} &middot; {c.orders_count} orders</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-600">Spend: AED {c.spend?.toFixed(2)}</div>
                <div className="text-sm text-emerald-600">Rev: AED {c.revenue?.toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-0.5">ROAS: {roas(c.spend, c.revenue)}x</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}