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
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: "", customer_name: "", amount: 0, status: "Pending" });

  const fetchOrders = () => {
    setLoading(true);
    api.getOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSave = async () => {
    try {
      await api.createOrder({ ...form, amount: Number(form.amount) });
      toast.success("Order added");
      setForm({ product_id: "", customer_name: "", amount: 0, status: "Pending" });
      setDialogOpen(false);
      fetchOrders();
    } catch {
      toast.error("Failed to save order");
    }
  };

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "returned": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Track your order fulfillment.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Add Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Order</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Customer Name</Label>
                <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Ahmed Mohamed" />
              </div>
              <div>
                <Label>Amount (AED)</Label>
                <Input type="number" value={form.amount || ""} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="150" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={!form.customer_name || form.amount <= 0} className="w-full">
                Save Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No orders yet</p>
          <p className="text-sm mt-1">Start adding orders to track fulfillment</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(o => (
            <Card key={o.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{o.customer_name || `Order #${o.id.slice(0, 8)}`}</div>
                <div className="text-sm text-slate-500">{o.product_id?.slice(0, 8)}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusColor(o.status)}>{o.status || "Pending"}</Badge>
                <div className="font-bold">AED {o.amount?.toFixed(2) || "0.00"}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}