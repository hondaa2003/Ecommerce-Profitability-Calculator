import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const trend = [
  { name: "W1", revenue: 22000, profit: 6200 },
  { name: "W2", revenue: 26000, profit: 7400 },
  { name: "W3", revenue: 31000, profit: 9100 },
  { name: "W4", revenue: 38000, profit: 11800 },
];

export function Reports() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>Reports</h1>
          <p className="text-slate-500 text-sm">Profitability summaries across products, campaigns, and time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-slate-200"><FileType className="w-4 h-4 mr-1" /> PDF</Button>
          <Button variant="outline" className="border-slate-200"><FileSpreadsheet className="w-4 h-4 mr-1" /> Excel</Button>
          <Button variant="outline" className="border-slate-200"><FileText className="w-4 h-4 mr-1" /> CSV</Button>
          <Button className="bg-blue-700 hover:bg-blue-800"><Download className="w-4 h-4 mr-1" /> Export</Button>
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
              <Summary label="Revenue" value="AED 312,480" tip={tips.revenue} delta="+12.4%" color="blue" />
              <Summary label="Net Profit" value="AED 84,320" tip={tips.netProfit} delta="+18.4%" color="emerald" />
              <Summary label="ROAS" value="3.42x" tip={tips.roas} delta="+0.21" color="emerald" />
              <Summary label="Return Rate" value="8.4%" tip={tips.returnRate} delta="-0.6%" color="orange" />
            </div>

            <Card className="p-5 rounded-2xl border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-slate-900">Profit Summary</div>
                  <div className="text-xs text-slate-500">Comparing revenue vs net profit</div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">Healthy</Badge>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 rounded-2xl border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-slate-900">Product Profitability</div>
                  <Button variant="ghost" size="sm">Export</Button>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-slate-500">
                    <tr><th className="text-left py-2">Product</th><th className="text-left">Revenue</th><th className="text-left">Profit</th><th className="text-left">Margin</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ["Smart Watch X", 96400, 32800, "34%"],
                      ["Linen Abaya Set", 62100, 17400, "28%"],
                      ["Bluetooth Earbuds", 38200, 8400, "22%"],
                      ["USB Mini Lamp", 11200, -820, "-7%"],
                    ].map(([n, r, p, m]) => (
                      <tr key={String(n)} className="border-t border-slate-100">
                        <td className="py-2 text-slate-900">{n}</td>
                        <td>AED {r.toLocaleString()}</td>
                        <td className={(p as number) >= 0 ? "text-emerald-600" : "text-orange-600"}>AED {(p as number).toLocaleString()}</td>
                        <td>{m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="p-5 rounded-2xl border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-slate-900">Campaign Performance</div>
                  <Button variant="ghost" size="sm">Export</Button>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-slate-500">
                    <tr><th className="text-left py-2">Campaign</th><th className="text-left">Spend</th><th className="text-left">ROAS</th><th className="text-left">CPA</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ["Watch X - TikTok", 3100, "4.26x", "AED 48"],
                      ["Abaya - FB", 4200, "3.48x", "AED 54"],
                      ["Earbuds - Google", 2200, "3.36x", "AED 52"],
                      ["Lamp - Retarget", 800, "0.90x", "AED 89"],
                    ].map(([n, s, r, c]) => (
                      <tr key={String(n)} className="border-t border-slate-100">
                        <td className="py-2 text-slate-900">{n}</td>
                        <td>AED {(s as number).toLocaleString()}</td>
                        <td>{r}</td>
                        <td>{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Summary({ label, value, tip, delta, color }: { label: string; value: string; tip: any; delta: string; color: string }) {
  const palette: Record<string, string> = {
    blue: "text-blue-700",
    emerald: "text-emerald-600",
    orange: "text-orange-600",
  };
  return (
    <Card className="p-4 rounded-2xl border-slate-200">
      <div className="text-xs text-slate-500 flex items-center gap-1">{label} <InfoTip {...tip} /></div>
      <div className="text-slate-900 mt-1">{value}</div>
      <div className={`text-xs mt-1 ${palette[color]}`}>{delta}</div>
    </Card>
  );
}
