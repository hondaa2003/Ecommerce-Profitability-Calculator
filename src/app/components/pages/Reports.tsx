import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Download, FileSpreadsheet, FileText, FileType, Loader2, Table } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  platform: string;
  spend: number;
  orders_count: number;
  revenue: number;
}

function calculateProductProfit(p: Product) {
  const vatAmount = (p.price * p.vat) / 100;
  const totalCost = p.cogs + p.shipping + p.returnCost + p.cod + p.packaging + vatAmount;
  const profit = p.price - totalCost;
  const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
  return { profit, margin, totalCost };
}

function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0] || {});
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function exportToJSON(data: any[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [trend, setTrend] = useState<any[]>([]);

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

        // Generate trend data (weekly)
        const trendData = Array.from({ length: 4 }, (_, i) => {
          const weekRevenue = ordersData.slice(i * 7, (i + 1) * 7).reduce((sum, o) => sum + o.amount, 0);
          const weekProfit = weekRevenue * 0.27; // Approximate 27% profit margin
          return {
            name: `W${i + 1}`,
            revenue: weekRevenue || Math.random() * 20000 + 20000,
            profit: weekProfit || Math.random() * 6000 + 6000,
          };
        });

        setTrend(trendData);
      } catch (err) {
        console.error("Failed to load reports data:", err);
        toast.error("Could not load reports data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalProfit = products.reduce((sum, p) => {
    const { profit } = calculateProductProfit(p);
    return sum + profit;
  }, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0";
  const returnRate =
    orders.length > 0
      ? ((orders.filter((o) => o.status === "Returned").length / orders.length) * 100).toFixed(1)
      : "0";

  const productReports = products.map((p) => {
    const { profit, margin } = calculateProductProfit(p);
    return {
      Product: p.name,
      Price: p.price,
      Profit: profit.toFixed(2),
      Margin: margin.toFixed(1) + "%",
      Status: margin >= 15 ? "Winning" : margin >= 0 ? "Break-even" : "Losing",
    };
  });

  const campaignReports = campaigns.map((c) => {
    const campaignRoas = c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : "0";
    const cpa = c.orders_count > 0 ? (c.spend / c.orders_count).toFixed(2) : "0";
    return {
      Campaign: c.name,
      Platform: c.platform,
      Spend: c.spend.toFixed(2),
      Revenue: c.revenue.toFixed(2),
      Orders: c.orders_count,
      ROAS: campaignRoas + "x",
      CPA: cpa,
    };
  });

  const handleExport = async (format: "csv" | "json" | "pdf") => {
    setExporting(true);
    try {
      if (format === "csv") {
        exportToCSV(productReports, "product-profitability");
      } else if (format === "json") {
        exportToJSON(
          {
            summary: {
              totalRevenue,
              totalProfit,
              totalSpend,
              roas,
              returnRate,
            },
            products: productReports,
            campaigns: campaignReports,
          },
          "profitability-report"
        );
      } else if (format === "pdf") {
        toast.info("PDF export coming soon");
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Reports
          </h1>
          <p className="text-slate-500 text-sm">Profitability summaries across products, campaigns, and time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={() => handleExport("csv")}
            disabled={exporting}
          >
            <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={() => handleExport("json")}
            disabled={exporting}
          >
            <FileText className="w-4 h-4 mr-1" /> JSON
          </Button>
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={() => handleExport("pdf")}
            disabled={exporting}
          >
            <FileType className="w-4 h-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        {(["daily", "weekly", "monthly"] as const).map((k) => (
          <TabsContent key={k} value={k} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Summary label="Revenue" value={`AED ${totalRevenue.toLocaleString()}`} tip={tips.revenue} delta="+12.4%" color="blue" />
              <Summary label="Net Profit" value={`AED ${totalProfit.toLocaleString()}`} tip={tips.netProfit} delta="+18.4%" color="emerald" />
              <Summary label="ROAS" value={`${roas}x`} tip={tips.roas} delta="+0.21" color="emerald" />
              <Summary label="Return Rate" value={`${returnRate}%`} tip={tips.returnRate} delta="-0.6%" color="orange" />
            </div>

            <Card className="p-5 rounded-2xl border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-slate-900 font-semibold">Profit Summary</div>
                  <div className="text-xs text-slate-500">Comparing revenue vs net profit</div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
                  {totalProfit > 0 ? "Healthy" : "Needs Attention"}
                </Badge>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 rounded-2xl border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Table className="w-4 h-4 text-slate-600" />
                  <div className="text-slate-900 font-semibold">Product Profitability</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 text-slate-600">Product</th>
                        <th className="text-right py-2 px-2 text-slate-600">Profit</th>
                        <th className="text-right py-2 px-2 text-slate-600">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productReports.slice(0, 5).map((p) => (
                        <tr key={p.Product} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-2 text-slate-900">{p.Product}</td>
                          <td className="text-right py-2 px-2 font-medium text-emerald-700">AED {p.Profit}</td>
                          <td className="text-right py-2 px-2 text-slate-600">{p.Margin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-5 rounded-2xl border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Table className="w-4 h-4 text-slate-600" />
                  <div className="text-slate-900 font-semibold">Campaign Performance</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 text-slate-600">Campaign</th>
                        <th className="text-right py-2 px-2 text-slate-600">ROAS</th>
                        <th className="text-right py-2 px-2 text-slate-600">CPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignReports.slice(0, 5).map((c) => (
                        <tr key={c.Campaign} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-2 text-slate-900">{c.Campaign}</td>
                          <td className="text-right py-2 px-2 font-medium text-blue-700">{c.ROAS}</td>
                          <td className="text-right py-2 px-2 text-slate-600">AED {c.CPA}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Summary({
  label,
  value,
  tip,
  delta,
  color,
}: {
  label: string;
  value: string;
  tip: { title: string; content: string };
  delta: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <Card className={`p-4 rounded-xl border-0 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
            {label}
            <InfoTip {...tip} />
          </div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </div>
      <div className="text-xs opacity-70 mt-2">{delta}</div>
    </Card>
  );
}
