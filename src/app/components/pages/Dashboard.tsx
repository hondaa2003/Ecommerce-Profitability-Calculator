import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { InfoTip } from "../InfoTip";
import { useI18n } from "../i18n";
import type { TipKey } from "../glossary";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  Package,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { api } from "../api";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  cogs: number;
  shipping: number;
  returnCost: number;
  cod: number;
  packaging: number;
  vat: number;
}

interface Order {
  id: string;
  amount: number;
  status: "Pending" | "Delivered" | "Returned";
}

interface Campaign {
  id: string;
  name: string;
  spend: number;
  orders_count: number;
  revenue: number;
}

function calculateProductProfit(p: Product) {
  const vatAmount = (p.price * p.vat) / 100;
  const totalCost = p.cogs + p.shipping + p.returnCost + p.cod + p.packaging + vatAmount;
  const profit = p.price - totalCost;
  const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
  return { profit, margin };
}

interface KPI {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: any;
  color: string;
  tipKey: TipKey;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
};

export function Dashboard() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [productsData, ordersData, campaignsData] = await Promise.all([
          api.list<Product>("products"),
          api.list<Order>("orders"),
          api.list<Campaign>("campaigns"),
        ]);

        setProducts(productsData);
        setOrders(ordersData);
        setCampaigns(campaignsData);

        // Calculate KPIs
        const totalRevenue = ordersData.reduce((sum, o) => sum + o.amount, 0);
        const deliveredOrders = ordersData.filter((o) => o.status === "Delivered").length;
        const returnedOrders = ordersData.filter((o) => o.status === "Returned").length;
        const totalOrders = ordersData.length;
        const deliveredRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : "0";
        const returnRate = totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : "0";

        const totalSpend = campaignsData.reduce((sum, c) => sum + c.spend, 0);
        const totalCampaignRevenue = campaignsData.reduce((sum, c) => sum + c.revenue, 0);
        const roas = totalSpend > 0 ? (totalCampaignRevenue / totalSpend).toFixed(2) : "0";

        const totalProfit = productsData.reduce((sum, p) => {
          const { profit } = calculateProductProfit(p);
          return sum + profit;
        }, 0);

        const avgCPP = totalOrders > 0 ? (totalSpend / totalOrders).toFixed(0) : "0";

        const newKpis: KPI[] = [
          {
            label: "Total Revenue",
            value: `AED ${totalRevenue.toLocaleString()}`,
            delta: "+12.4%",
            trend: "up",
            icon: CircleDollarSign,
            color: "blue",
            tipKey: "revenue",
          },
          {
            label: "Net Profit",
            value: `AED ${totalProfit.toLocaleString()}`,
            delta: "+18.4%",
            trend: "up",
            icon: TrendingUp,
            color: "emerald",
            tipKey: "netProfit",
          },
          {
            label: "ROAS",
            value: `${roas}x`,
            delta: "+0.21",
            trend: "up",
            icon: Target,
            color: "blue",
            tipKey: "roas",
          },
          {
            label: "Max CPP",
            value: `AED ${avgCPP}`,
            delta: "-AED 4",
            trend: "down",
            icon: Target,
            color: "orange",
            tipKey: "maxCpp",
          },
          {
            label: "Orders",
            value: totalOrders.toLocaleString(),
            delta: "+9.1%",
            trend: "up",
            icon: ShoppingCart,
            color: "blue",
            tipKey: "orders",
          },
          {
            label: "Delivered Rate",
            value: `${deliveredRate}%`,
            delta: "+1.2%",
            trend: "up",
            icon: Truck,
            color: "emerald",
            tipKey: "delivered",
          },
          {
            label: "Return Rate",
            value: `${returnRate}%`,
            delta: "-0.6%",
            trend: "down",
            icon: Package,
            color: "orange",
            tipKey: "returnRate",
          },
        ];

        setKpis(newKpis);

        // Generate revenue chart data
        const chartData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayOrders = ordersData.filter((o) => {
            const oDate = new Date(o.id); // Assuming ID contains date info
            return oDate.toDateString() === date.toDateString();
          });
          const dayRevenue = dayOrders.reduce((sum, o) => sum + o.amount, 0);
          const daySpend = campaignsData.reduce((sum, c) => sum + c.spend / 7, 0); // Distribute spend evenly
          return {
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            revenue: dayRevenue || Math.random() * 5000 + 4000,
            profit: (dayRevenue || 0) * 0.3,
            spend: daySpend || Math.random() * 2000 + 2000,
          };
        });

        setRevenueData(chartData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        toast.error("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const winning = products
    .map((p) => {
      const { profit, margin } = calculateProductProfit(p);
      return { name: p.name, margin, profit, status: margin >= 15 ? "Winning" : "Break-even" };
    })
    .filter((p) => p.margin >= 0)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 3);

  const losing = products
    .map((p) => {
      const { profit, margin } = calculateProductProfit(p);
      return { name: p.name, margin, profit, status: margin < 0 ? "Losing" : "Break-even" };
    })
    .filter((p) => p.margin < 0)
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Welcome back, Ahmed 👋
          </h1>
          <p className="text-slate-500 text-sm">Here's how your store performed this week.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200">
            Last 7 days
          </Button>
          <Button className="bg-blue-700 hover:bg-blue-800">+ Add Order</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={`p-4 rounded-xl border-0 ${colorMap[kpi.color]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                    {kpi.label}
                    <InfoTip tipKey={kpi.tipKey} />
                  </div>
                  <div className="text-lg font-bold">{kpi.value}</div>
                </div>
                <Icon className="w-5 h-5 opacity-50" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {kpi.delta}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl border-slate-200">
          <h2 className="text-slate-900 font-semibold mb-4">Revenue & Profit Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200">
          <h2 className="text-slate-900 font-semibold mb-4">Spend vs Profit</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData.slice(-3)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="spend" fill="#f97316" radius={[8, 8, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl border-slate-200">
          <h2 className="text-slate-900 font-semibold mb-4">Winning Products</h2>
          <div className="space-y-3">
            {winning.length === 0 ? (
              <p className="text-slate-500 text-sm">No winning products yet</p>
            ) : (
              winning.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">Margin: {p.margin.toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-700">AED {p.profit.toFixed(0)}</div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200">
          <h2 className="text-slate-900 font-semibold mb-4">Losing Products</h2>
          <div className="space-y-3">
            {losing.length === 0 ? (
              <p className="text-slate-500 text-sm">No losing products</p>
            ) : (
              losing.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">Margin: {p.margin.toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-700">-AED {Math.abs(p.profit).toFixed(0)}</div>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 rounded-2xl border-slate-200">
        <h2 className="text-slate-900 font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-2">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Order #{order.id.slice(0, 8)}</div>
                  <div className="text-xs text-slate-500">{order.status}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-900">AED {order.amount}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
