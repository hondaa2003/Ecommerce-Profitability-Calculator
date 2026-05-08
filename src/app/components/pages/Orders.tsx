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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Loader2, Plug, Plus, Trash2, Edit3, AlertCircle } from "lucide-react";
import { useI18n } from "../i18n";

type Status = "Delivered" | "Returned" | "Pending";

interface Order {
  id: string;
  product_id?: string;
  customer_name?: string;
  amount: number;
  status: Status;
  created_at?: string;
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
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productId, setProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
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
    if (!amount) {
      toast.error("Amount is required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const item = await api.update<Order>("orders", editingId, {
          product_id: productId || null,
          customer_name: customerName || null,
          amount,
          status,
        });
        setOrders((o) => o.map((x) => (x.id === editingId ? item : x)));
        toast.success("Order updated");
      } else {
        const item = await api.create<Order>("orders", {
          product_id: productId || null,
          customer_name: customerName || null,
          amount,
          status,
        });
        setOrders((o) => [item, ...o]);
        toast.success("Order saved");
      }
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("Failed to save order:", err);
      toast.error("Could not save order");
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (id: string) => {
    const previous = orders;
    setOrders((arr) => arr.filter((x) => x.id !== id));
    try {
      await api.remove("orders", id);
    } catch (err) {
      console.error("Failed to delete order:", err);
      toast.error("Could not delete order");
      setOrders(previous);
    }
  };

  const startEdit = (order: Order) => {
    setProductId(order.product_id || "");
    setCustomerName(order.customer_name || "");
    setAmount(order.amount);
    setStatus(order.status);
    setEditingId(order.id);
    setOpen(true);
  };

  const resetForm = () => {
    setProductId("");
    setCustomerName("");
    setAmount(0);
    setStatus("Pending");
    setEditingId(null);
  };

  const closeDialog = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Orders & Fulfillment
        </h1>
        <p className="text-slate-500 text-sm">Track delivery success, returns, and overall fulfillment health.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Mini label="Total Orders" value={total.toString()} tip={tips.orders} />
        <Mini label="Delivered" value={delivered.toString()} tip={tips.delivered} color="emerald" />
        <Mini label="Returned" value={returned.toString()} tip={tips.returnRate} color="orange" />
        <Mini label="Pending" value={pending.toString()} tip={tips.pending} color="blue" />
        <Mini label="Success Rate" value={`${successRate}%`} tip={tips.delivered} color="emerald" />
        <Mini label="Return Rate" value={`${returnRate}%`} tip={tips.returnRate} color="orange" />
      </div>

      {/* Add Order Button */}
      <div className="flex justify-between items-center">
        <div></div>
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-1" /> Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Order" : "Add New Order"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-700 mb-1 block font-medium">Product ID (Optional)</Label>
                <Input
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="e.g., product-123"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label className="text-slate-700 mb-1 block font-medium">Customer Name (Optional)</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Ahmed Al-Mansouri"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label className="text-slate-700 mb-1 block font-medium">Amount (AED)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div>
                <Label className="text-slate-700 mb-1 block font-medium">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button className="bg-blue-700 hover:bg-blue-800" onClick={addOrder} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  {editingId ? "Update Order" : "Save Order"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Store Integrations */}
      <Card className="p-6 rounded-2xl border-slate-200 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Connect Your Store</h3>
            <p className="text-sm text-blue-800 mb-4">
              Automatically sync orders from your store. Coming soon: Shopify, Salla, Zid, WooCommerce
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100" disabled>
                <Plug className="w-4 h-4 mr-1" /> Shopify
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100" disabled>
                <Plug className="w-4 h-4 mr-1" /> Salla
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100" disabled>
                <Plug className="w-4 h-4 mr-1" /> Zid
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-2xl border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      <AlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 mb-1 font-medium">No orders yet</div>
                      <div className="text-sm text-slate-500">Start by adding your first order or connecting a store</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm text-slate-900">{o.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-slate-600">{o.customer_name || "-"}</TableCell>
                  <TableCell className="font-semibold">AED {o.amount}</TableCell>
                  <TableCell>
                    <Badge className={`${statusBadge[o.status]} hover:${statusBadge[o.status]} border`}>
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleDateString("ar-AE")
                      : "Today"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-blue-700"
                      onClick={() => startEdit(o)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-red-700"
                      onClick={() => deleteOrder(o.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Mini({
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
