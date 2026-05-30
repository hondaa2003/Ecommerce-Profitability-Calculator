import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Bot,
  Brain,
  Building2,
  LayoutDashboard,
  LineChart,
  PackageSearch,
  Sparkles,
  Users,
} from "lucide-react";
import { useI18n } from "../i18n";
import { useState } from "react";

const features = [
  { icon: Brain,        title: "AI Profit Advisor",       titleKey: "aiAdvisor",  desc: "Daily AI recommendations on which products to scale, pause, or optimize for higher margin.",                                           eta: "Q3 2026" },
  { icon: Bot,          title: "AI Ad Analyzer",          titleKey: "aiAnalyzer", desc: "Diagnose underperforming campaigns with creative-level insights and cost-saving suggestions.",                                                eta: "Q3 2026" },
  { icon: LineChart,    title: "Forecasting",            titleKey: "forecast",  desc: "Predict revenue, profit, and inventory needs based on historical performance.",                                                                eta: "Q4 2026" },
  { icon: PackageSearch,title: "Inventory Management",    titleKey: "inventory", desc: "Track stock levels, low-stock alerts, and replenishment costs in your profit calculations.",                                                      eta: "Q4 2026" },
  { icon: Users,        title: "CRM",                     titleKey: "crm",       desc: "Customer LTV, repeat-purchase tracking, and segments to fuel retention campaigns.",                                                           eta: "Q1 2027" },
  { icon: Building2,    title: "Agency Mode",            titleKey: "agency",    desc: "Switch between client stores, consolidated views, and per-client billing.",                                                                     eta: "Q4 2026" },
  { icon: LayoutDashboard, title: "White-label Dashboards", titleKey: "whitelabel", desc: "Branded dashboards for agencies to share with clients under their own domain.",                                                             eta: "Q2 2027" },
];

const VOTES_KEY = "future_votes";
const VOTED_KEY = "future_voted";

function getVotes(): Record<string, number> {
  try { const raw = localStorage.getItem(VOTES_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
function getVoted(): Record<string, boolean> {
  try { const raw = localStorage.getItem(VOTED_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}

export function FuturePage() {
  const { t, dir } = useI18n();
  const [votes, setVotes] = useState<Record<string, number>>(getVotes);
  const [voted, setVoted] = useState<Record<string, boolean>>(getVoted);

  const handleVote = (id: string) => {
    const newVotes = { ...votes, [id]: (votes[id] || 0) + 1 };
    setVotes(newVotes);
    localStorage.setItem(VOTES_KEY, JSON.stringify(newVotes));
    const newVoted = { ...voted, [id]: true };
    setVoted(newVoted);
    localStorage.setItem(VOTED_KEY, JSON.stringify(newVoted));
  };

  const sorted = [...features].sort((a, b) => (votes[b.titleKey] || 0) - (votes[a.titleKey] || 0));

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto" dir={dir}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 text-white flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{t("future.title")}</h1>
          <p className="text-slate-500 text-sm">{t("future.sub")}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(f => {
          const Icon = f.icon;
          const vCount = votes[f.titleKey] || 0;
          const hasVoted = voted[f.titleKey];
          return (
            <Card key={f.titleKey} className="p-5 rounded-2xl border-slate-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <Badge className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50">{f.eta}</Badge>
              </div>
              <div className="text-slate-900 font-semibold mb-1">{f.title}</div>
              <p className="text-sm text-slate-600 mb-4">{f.desc}</p>
              <Button
                variant="outline"
                size="sm"
                className={`w-full border-slate-200 ${hasVoted ? "bg-blue-50 text-blue-700 border-blue-200" : ""}`}
                onClick={() => handleVote(f.titleKey)}
                disabled={hasVoted}
              >
                {hasVoted ? `${vCount} votes - Voted` : `Vote (${vCount})`}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}