import { useEffect, useState } from "react";
import { api } from "../api";
import { toast } from "sonner";
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
import { useI18n } from "../i18n";

type Status = "Delivered" | "Returned" | "Pending";

interface Order {
  id: string;
  product: string;
  customer: string;
  amount: number;
  status: Status;
  date: string;
}


const statusBadge: Record<Status, string> = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Returned: "bg-orange-50 text-orange-700 border-orange-100",
  Pending: "bg-blue-50 text-blue-700 border-blue-100",
};

export function Orders() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<Status>("Pending");

  useEffect(() => {
    (async () => {
      try {
        const items = await api.list<Order>("orders");
        setOrders(items);
      } catch (err) {
        console.error("Failed to load orders:", err);
        toast.error("Could not load orders from server");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = orders.length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;
  const returned = orders.filter((o) => o.status === "Returned").length;
  const pending = orders.filter((o) => o.status === "Pending").length;
  const successRate = total ? ((delivered / total) * 100).toFixed(1) : "0";
  const returnRate = total ? ((returned / total) * 100).toFixed(1) : "0";

  const addOrder = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const item = await api.create<Order>("orders", {
        id: `#${Math.floor(Math.random() * 9000) + 1000}`,
        product,
        customer,
        amount,
        status,
        date: "Today",
      });
      setOrders((o) => [item, ...o]);
      setProduct(""); setCustomer(""); setAmount(0); setStatus("Pending");
      toast.success("Order saved");
    } catch (err) {
      console.error("Failed to create order:", err);
      toast.error("Could not save order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>Orders & Fulfillment</h1>
        <p className="text-slate-500 text-sm">Track delivery success, returns, and overall fulfillment health.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Mini label="Total Orders" value={total.toString()} tip={tips.orders} />
        <Mini label="Delivered" value={delivered.toString()} tip={tips.delivered} color="emerald" />
        <Mini label="Returned" value={returned.toString()} tip={tips.returnRate} color="orange" />
        <Mini label="Pending" value={pending.toString()} tip={tips.pending} color="blue" />
        <Mini label="Success Rate" value={`${successRate}%`} tip={tips.successRate} color="emerald" />
        <Mini label="Return Rate" value={`${returnRate}%`} tip={tips.returnRate} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-900">Manual Order Entry</div>
              <div className="text-xs text-slate-500">Add orders not yet synced from your store.</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <Label className="text-slate-700 mb-1">Product</Label>
              <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Smart Watch X" />
            </div>
            <div>
              <Label className="text-slate-700 mb-1">Customer</Label>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Name" />
            </div>
            <div>
              <Label className="text-slate-700 mb-1">Amount (AED)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-slate-700 mb-1">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={addOrder} disabled={saving} className="bg-blue-700 hover:bg-blue-800">
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Add Order
            </Button>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-slate-200">
          <div className="text-slate-900 mb-1">Store Integrations</div>
          <div className="text-xs text-slate-500 mb-4">Coming soon</div>
          <div className="space-y-3">
            {["Salla API", "Zid API", "Shopify API"].map((p) => (
              <div key={p} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Plug className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-slate-900">{p}</div>
                </div>
                <Badge className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50">Soon</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {t("empty.loading")}…
                </TableCell>
              </TableRow>
            )}
            {!loading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <Plug className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 mb-1">{t("empty.noOrders")}</div>
                      <div className="text-sm text-slate-500">{t("empty.noOrdersSub")}</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-slate-900">{o.id}</TableCell>
                <TableCell>{o.product}</TableCell>
                <TableCell className="text-slate-600">{o.customer}</TableCell>
                <TableCell>AED {o.amount}</TableCell>
                <TableCell>
                  <Badge className={`${statusBadge[o.status]} hover:${statusBadge[o.status]}`}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-slate-500">{o.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Mini({ label, value, tip, color = "blue" }: { label: string; value: string; tip: any; color?: string }) {
  const palette: Record<string, string> = {
    blue: "text-blue-700",
    emerald: "text-emerald-600",
    orange: "text-orange-600",
  };
  return (
    <Card className="p-4 rounded-2xl border-slate-200">
      <div className="text-xs text-slate-500 flex items-center gap-1">{label} <InfoTip {...tip} /></div>
      <div className={`mt-1 ${palette[color]}`}>{value}</div>
    </Card>
  );
}
