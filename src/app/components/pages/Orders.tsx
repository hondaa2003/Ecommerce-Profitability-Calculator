import { useEffect, useState } from "react";
import { api } from "../../../services/api-client";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useI18n } from "../i18n";
import { formatCurrencyDecimal, getCurrency } from "../../../services/currency-store";

function numVal(v: number): string { return v === 0 ? "0" : v ? String(v) : ""; }

export function Orders() {
  const { t, dir } = useI18n();
  const curr = getCurrency();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: "", customer_name: "", amount: 0, status: "Pending" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([api.getOrders(), api.getProducts()]);
      setOrders(o);
      setProducts(p);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      await api.createOrder({ ...form, amount: Number(form.amount) });
      toast.success(t("orders.add"));
      setForm({ product_id: "", customer_name: "", amount: 0, status: "Pending" });
      setDialogOpen(false);
      fetchData();
    } catch { toast.error(t("orders.sub")); }
  };

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "returned": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const statusLabel = (s: string) => {
    switch (s?.toLowerCase()) {
      case "delivered": return t("status.delivered");
      case "returned": return t("status.returned");
      default: return t("status.pending");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">{t("empty.loading")}</div>;

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("orders.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("orders.sub")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 me-1" /> {t("orders.add")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("orders.add")}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>{t("orders.customer")}</Label>
                <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Ahmed Mohamed" />
              </div>
              <div>
                <Label>{t("products.product")}</Label>
                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder={t("products.product")} /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("orders.amount")} ({curr})</Label>
                <Input type="number" value={numVal(form.amount)} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="150" />
              </div>
              <div>
                <Label>{t("products.statusCol")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">{t("status.pending")}</SelectItem>
                    <SelectItem value="Delivered">{t("status.delivered")}</SelectItem>
                    <SelectItem value="Returned">{t("status.returned")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={!form.customer_name || form.amount <= 0} className="w-full">{t("orders.add")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><p className="text-lg">{t("empty.noOrders")}</p><p className="text-sm mt-1">{t("empty.noOrdersSub")}</p></div>
      ) : (
        <div className="grid gap-4">
          {orders.map(o => (
            <Card key={o.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{o.customer_name || `Order #${o.id?.slice(0, 8)}`}</div>
                <div className="text-sm text-slate-500">{products.find(p => p.id === o.product_id)?.name || o.product_id?.slice(0, 8) || "—"}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusColor(o.status)}>{statusLabel(o.status)}</Badge>
                <div className="font-bold">{formatCurrencyDecimal(o.amount || 0)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}