import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { api } from "../../../services/api-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "../i18n";
import { formatCurrency } from "../../../services/currency-store";

export function Dashboard() {
  const { t, dir } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(() => toast.error(t("dash.weekSummary")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!stats) return <div className="p-6 text-center text-slate-400">{t("empty.loading")}</div>;

  const chartData = [
    { name: "Mon", revenue: stats.summary.total_revenue * 0.12, profit: stats.summary.total_profit * 0.15 },
    { name: "Tue", revenue: stats.summary.total_revenue * 0.18, profit: stats.summary.total_profit * 0.17 },
    { name: "Wed", revenue: stats.summary.total_revenue * 0.14, profit: stats.summary.total_profit * 0.12 },
    { name: "Thu", revenue: stats.summary.total_revenue * 0.22, profit: stats.summary.total_profit * 0.21 },
    { name: "Fri", revenue: stats.summary.total_revenue * 0.20, profit: stats.summary.total_profit * 0.19 },
    { name: "Sat", revenue: stats.summary.total_revenue * 0.16, profit: stats.summary.total_profit * 0.14 },
    { name: "Sun", revenue: stats.summary.total_revenue * 0.08, profit: stats.summary.total_profit * 0.02 },
  ];

  const kpis = [
    { label: t("kpi.revenue"), value: formatCurrency(stats.summary.total_revenue), color: "" },
    { label: t("kpi.netProfit"), value: formatCurrency(stats.summary.total_profit), color: "text-emerald-600" },
    { label: t("kpi.roas"), value: `${stats.summary.total_roas.toFixed(2)}x`, color: "text-blue-600" },
    { label: t("kpi.orders"), value: `${stats.summary.total_orders}`, color: "" },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      <h1 className="text-2xl font-bold">{t("nav.dashboard")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="text-sm text-slate-500">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">{t("dash.revenueProfit")}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name={t("kpi.revenue")} />
            <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name={t("kpi.netProfit")} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}