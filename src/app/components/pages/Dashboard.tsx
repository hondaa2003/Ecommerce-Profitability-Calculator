import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
  Package,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";

const revenueData = [
  { day: "Mon", revenue: 4200, profit: 1100, spend: 2100 },
  { day: "Tue", revenue: 5100, profit: 1450, spend: 2400 },
  { day: "Wed", revenue: 4800, profit: 1300, spend: 2200 },
  { day: "Thu", revenue: 6200, profit: 1900, spend: 2800 },
  { day: "Fri", revenue: 7400, profit: 2300, spend: 3000 },
  { day: "Sat", revenue: 8800, profit: 2900, spend: 3300 },
  { day: "Sun", revenue: 9500, profit: 3200, spend: 3500 },
];

const winning = [
  { name: "Smart Watch X", margin: 34, profit: 12400, status: "Winning" },
  { name: "Linen Abaya Set", margin: 28, profit: 9100, status: "Winning" },
  { name: "Bluetooth Earbuds", margin: 22, profit: 6700, status: "Winning" },
];
const losing = [
  { name: "USB Mini Lamp", margin: -6, profit: -820, status: "Losing" },
  { name: "Pet Feeder Pro", margin: -2, profit: -310, status: "Break-even" },
];

interface KPI {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: any;
  color: string;
  tipKey: TipKey;
}

const kpis: KPI[] = [
  { label: "Total Revenue", value: "AED 312,480", delta: "+12.4%", trend: "up", icon: CircleDollarSign, color: "blue", tipKey: "revenue" },
  { label: "Net Profit", value: "AED 84,320", delta: "+18.4%", trend: "up", icon: TrendingUp, color: "emerald", tipKey: "netProfit" },
  { label: "ROAS", value: "3.42x", delta: "+0.21", trend: "up", icon: Target, color: "blue", tipKey: "roas" },
  { label: "Max CPP", value: "AED 78", delta: "-AED 4", trend: "down", icon: Target, color: "orange", tipKey: "maxCpp" },
  { label: "Orders", value: "1,284", delta: "+9.1%", trend: "up", icon: ShoppingCart, color: "blue", tipKey: "orders" },
  { label: "Delivered Rate", value: "82%", delta: "+1.2%", trend: "up", icon: Truck, color: "emerald", tipKey: "delivered" },
  { label: "Return Rate", value: "8.4%", delta: "-0.6%", trend: "down", icon: Package, color: "orange", tipKey: "returnRate" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
};

export function Dashboard() {
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
          <Button variant="outline" className="border-slate-200">Last 7 days</Button>
          <Button className="bg-blue-700 hover:bg-blue-800">+ Add Order</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4 rounded-2xl border-slate-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[kpi.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`flex items-center gap-0.5 text-xs ${kpi.trend === "up" ? "text-emerald-600" : "text-orange-600"}`}>
                  {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.delta}
                </div>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                {kpi.label} <InfoTip tipKey={kpi.tipKey} />
              </div>
              <div className="text-slate-900">{kpi.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-900">Revenue & Profit Trend</div>
              <div className="text-xs text-slate-500">Last 7 days</div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">Revenue</Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">Profit</Badge>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} fill="url(#prof)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-900">Spend vs Profit</div>
            <InfoTip tipKey="netProfit" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="spend" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-900">Top Winning Products</div>
              <div className="text-xs text-slate-500">Sorted by net profit</div>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="space-y-2">
            {winning.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-900 text-sm">{p.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      Margin <InfoTip tipKey="margin" /> {p.margin}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600">+AED {p.profit.toLocaleString()}</div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 text-[10px]">
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-slate-900">Losing Products Alerts</div>
                <div className="text-xs text-slate-500">Action recommended</div>
              </div>
            </div>
            <div className="space-y-2">
              {losing.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/60 border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-900 text-sm">{p.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        Margin <InfoTip tipKey="margin" /> {p.margin}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={p.profit < 0 ? "text-orange-600" : "text-slate-700"}>
                      {p.profit < 0 ? "-" : ""}AED {Math.abs(p.profit).toLocaleString()}
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-100 hover:bg-orange-100 text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-3">Recent Activity</div>
            <ul className="space-y-3 text-sm">
              {[
                { t: "New order #4821 — AED 199", time: "2m ago", color: "emerald" },
                { t: "Campaign 'Summer Abaya' updated", time: "18m ago", color: "blue" },
                { t: "Return logged on order #4732", time: "1h ago", color: "orange" },
                { t: "Product 'USB Lamp' marked Losing", time: "3h ago", color: "orange" },
              ].map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full ${a.color === "emerald" ? "bg-emerald-500" : a.color === "blue" ? "bg-blue-500" : "bg-orange-500"}`} />
                  <div className="flex-1">
                    <div className="text-slate-700">{a.t}</div>
                    <div className="text-xs text-slate-400">{a.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-900">Notifications</div>
              <Badge className="bg-orange-100 text-orange-700 border-0 hover:bg-orange-100">3 new</Badge>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="p-3 rounded-lg bg-blue-50 text-blue-800">
                Your Break-even ROAS dropped to 1.62x — you have more room to scale 🎉
              </li>
              <li className="p-3 rounded-lg bg-orange-50 text-orange-800 flex items-start gap-2">
                <TrendingDown className="w-4 h-4 mt-0.5" />
                Pet Feeder Pro is losing — review COGS or pause ads.
              </li>
              <li className="p-3 rounded-lg bg-emerald-50 text-emerald-800">
                Delivered rate improved to 82%. Keep it up!
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
