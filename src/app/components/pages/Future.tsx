import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Bot,
  Brain,
  Building2,
  LayoutDashboard,
  LineChart,
  Package,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  { icon: Brain, title: "AI Profit Advisor", desc: "Daily AI recommendations on which products to scale, pause, or optimize for higher margin.", eta: "Q3 2026" },
  { icon: Bot, title: "AI Ad Analyzer", desc: "Diagnose underperforming campaigns with creative-level insights and cost-saving suggestions.", eta: "Q3 2026" },
  { icon: LineChart, title: "Forecasting", desc: "Predict revenue, profit, and inventory needs based on historical performance.", eta: "Q4 2026" },
  { icon: Package, title: "Inventory Management", desc: "Track stock levels, low-stock alerts, and replenishment costs in your profit calculations.", eta: "Q4 2026" },
  { icon: Users, title: "CRM", desc: "Customer LTV, repeat-purchase tracking, and segments to fuel retention campaigns.", eta: "2027" },
  { icon: Building2, title: "Agency Mode", desc: "Switch between client stores, consolidated views, and per-client billing.", eta: "Q4 2026" },
  { icon: LayoutDashboard, title: "White-label Dashboards", desc: "Branded dashboards for agencies to share with clients under their own domain.", eta: "2027" },
];

export function FuturePage() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 text-white flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>Coming Soon</h1>
          <p className="text-slate-500 text-sm">A peek at what we're building next. Vote and join the beta.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="p-5 rounded-2xl border-slate-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <Badge className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50">{f.eta}</Badge>
              </div>
              <div className="text-slate-900 mb-1">{f.title}</div>
              <p className="text-sm text-slate-600 mb-4">{f.desc}</p>
              <Button variant="outline" className="w-full border-slate-200">Join Beta Waitlist</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
