import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";
import { useI18n } from "../i18n";

interface FutureFeature {
  id: string;
  title: string;
  desc: string;
  eta: string;
  icon: string;
}

const features: FutureFeature[] = [
  { id: "ai-advisor", title: "AI Profit Advisor", desc: "Daily AI recommendations on which products to scale, pause, or optimize for higher margin.", eta: "Q3 2026", icon: "🤖" },
  { id: "ai-analyzer", title: "AI Ad Analyzer", desc: "Diagnose underperforming campaigns with creative-level insights and cost-saving suggestions.", eta: "Q3 2026", icon: "🔍" },
  { id: "forecasting", title: "Forecasting", desc: "Predict revenue, profit, and inventory needs based on historical performance.", eta: "Q4 2026", icon: "📈" },
  { id: "inventory", title: "Inventory Management", desc: "Track stock levels, low-stock alerts, and replenishment costs in your profit calculations.", eta: "Q4 2026", icon: "📦" },
  { id: "crm", title: "CRM", desc: "Customer LTV, repeat-purchase tracking, and segments to fuel retention campaigns.", eta: "Q1 2027", icon: "👥" },
  { id: "agency", title: "Agency Mode", desc: "Switch between client stores, consolidated views, and per-client billing.", eta: "Q4 2026", icon: "🏢" },
  { id: "white-label", title: "White-label Dashboards", desc: "Branded dashboards for agencies to share with clients under their own domain.", eta: "Q2 2027", icon: "🎨" },
];

const votesKey = "future_votes";

function getVotes(): Record<string, number> {
  try { const raw = localStorage.getItem(votesKey); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}

function addVote(featureId: string): Record<string, number> {
  const votes = getVotes();
  votes[featureId] = (votes[featureId] || 0) + 1;
  localStorage.setItem(votesKey, JSON.stringify(votes));
  return votes;
}

export function FuturePage() {
  const { t, dir } = useI18n();
  const [votes, setVotes] = useState<Record<string, number>>(getVotes);
  const [voted, setVoted] = useState<Record<string, boolean>>(() => {
    try { const raw = localStorage.getItem("future_voted"); return raw ? JSON.parse(raw) : {}; }
    catch { return {}; }
  });

  const handleVote = (id: string) => {
    const newVotes = addVote(id);
    setVotes(newVotes);
    const newVoted = { ...voted, [id]: true };
    setVoted(newVoted);
    localStorage.setItem("future_voted", JSON.stringify(newVoted));
  };

  const sorted = [...features].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto" dir={dir}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 text-white flex items-center justify-center text-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{t("future.title")}</h1>
          <p className="text-slate-500 text-sm">{t("future.sub")}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(f => (
          <Card key={f.id} className="p-5 rounded-2xl border-slate-200 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">{f.icon}</div>
              <Badge className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50">{f.eta}</Badge>
            </div>
            <div className="text-slate-900 font-semibold mb-1">{f.title}</div>
            <p className="text-sm text-slate-600 mb-4">{f.desc}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 border-slate-200 ${voted[f.id] ? "bg-blue-50 text-blue-700 border-blue-200" : ""}`}
                onClick={() => handleVote(f.id)}
                disabled={voted[f.id]}
              >
                {voted[f.id] ? `Voted (${votes[f.id] || 0})` : `Vote (${votes[f.id] || 0})`}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-slate-500 py-4">
        Cast your vote to help us prioritize what to build next.
      </div>
    </div>
  );
}