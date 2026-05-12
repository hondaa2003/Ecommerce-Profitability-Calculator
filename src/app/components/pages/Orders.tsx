import { useEffect, useState } from "react";
import { api } from "../../services/api-client";
import { Card } from "../ui/card";
import { toast } from "sonner";

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="grid gap-4">
        {orders.map(o => (
          <Card key={o.id} className="p-4 flex justify-between">
            <div>
              <div className="font-bold">Order #{o.id.slice(0,8)}</div>
              <div className="text-sm text-gray-500">{o.status}</div>
            </div>
            <div className="font-bold">AED {o.amount}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
