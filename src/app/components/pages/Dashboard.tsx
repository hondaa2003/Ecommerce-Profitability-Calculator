import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { api } from "../../services/api-client";
import { Loader2, CircleDollarSign, TrendingUp, Target, ShoppingCart, Truck, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!stats) return <div>No data available.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">AED {stats.summary.total_revenue.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Net Profit</div>
          <div className="text-2xl font-bold text-emerald-600">AED {stats.summary.total_profit.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">ROAS</div>
          <div className="text-2xl font-bold text-blue-600">{stats.summary.total_roas.toFixed(2)}x</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{stats.summary.total_orders}</div>
        </Card>
      </div>
      {/* You can add charts here using stats.summary */}
    </div>
  );
}
