import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  LineChart,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { InfoTip } from "./InfoTip";
import { tips } from "./glossary";
import { useI18n } from "./i18n";
import { LangToggle } from "./LangToggle";

interface LandingProps {
  onEnter: () => void;
  onDemo?: () => void;
}

export function Landing({ onEnter, onDemo }: LandingProps) {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  
  const handleDemo = () => {
    localStorage.setItem("demo_mode", "true");
    onEnter();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900" dir={dir}>
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-slate-900 font-bold">ProfitPilot</span>
            <Badge className="ms-2 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
              MENA · GCC
            </Badge>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">{t("nav.features")}</a>
            <a href="#calculator" className="hover:text-slate-900">{t("nav.calculator")}</a>
            <a href="#pricing" className="hover:text-slate-900">{t("nav.pricing")}</a>
            <a href="#faq" className="hover:text-slate-900">{t("nav.faq")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle />
            <Button variant="ghost" onClick={onEnter}>{t("nav.signin")}</Button>
            <Button onClick={onEnter} className="bg-blue-700 hover:bg-blue-800 text-white">
              {t("cta.startTrial")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50/40 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-50 mb-6">
              <Sparkles className="w-3.5 h-3.5 me-1" /> {t("hero.badge")}
            </Badge>
            <h1 className="text-slate-900 mb-6" style={{ fontSize: "3rem", lineHeight: 1.1, fontWeight: 600 }}>
              {t("hero.title")}
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-xl">
              {t("hero.sub")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={onEnter} className="bg-blue-700 hover:bg-blue-800 text-white">
                {t("cta.startTrial")} <ArrowRight className={`w-4 h-4 ms-1 ${isRTL ? "-scale-x-100" : ""}`} />
              </Button>
              <Button size="lg" variant="outline" onClick={handleDemo} className="border-slate-300">
                Try Demo <Zap className="w-4 h-4 ms-1" />
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 flex-wrap">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> {t("hero.noCard")}</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> {t("hero.bilingual")}</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> {t("hero.trial")}</div>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-6 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl" />
            <Card className="relative p-6 border-slate-200 shadow-2xl rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    Net Profit <InfoTip tipKey="netProfit" />
                  </div>
                  <div className="text-3xl text-slate-900 mt-1">AED 84,320</div>
                  <div className="text-emerald-600 text-sm flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +18.4% this week
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Profitable</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "ROAS", value: "3.42x", tip: tips.roas, color: "text-blue-700" },
                  { label: "Max CPP", value: "AED 78", tip: tips.maxCpp, color: "text-orange-600" },
                  { label: "Margin", value: "27%", tip: tips.margin, color: "text-emerald-600" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      {m.label} <InfoTip {...m.tip} />
                    </div>
                    <div className={`mt-1 ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-end gap-1.5 h-24">
                  {[40, 55, 35, 70, 60, 85, 75, 92, 80, 96, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 rounded bg-gradient-to-t from-blue-600 to-blue-400"
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-2">Weekly Profit Trend</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Logos */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="text-center text-xs uppercase tracking-widest text-slate-400 mb-4">
            Trusted by sellers using
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400">
            {["Shopify", "Salla", "Zid", "Meta Ads", "TikTok Ads", "Google Ads"].map((b) => (
              <div key={b} className="px-3 py-1">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 mb-4">{t("features.badge")}</Badge>
            <h2 className="text-slate-900 mb-3" style={{ fontSize: "2.25rem", fontWeight: 600 }}>
              {t("features.title")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t("features.sub")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calculator, color: "blue", title: "True Profit Calculator", desc: "Calculate net profit per product including COGS, COD, VAT, returns and shipping." },
              { icon: BarChart3, color: "emerald", title: "Live Dashboard", desc: "Revenue, profit, ROAS and Max CPP in real time with educational tooltips." },
              { icon: PackageSearch, color: "orange", title: "Product Performance", desc: "Auto-tag products as Winning, Break-even, or Losing — make data-led decisions." },
              { icon: LineChart, color: "blue", title: "Campaign Tracking", desc: "Manual entry today, Meta / TikTok / Google API tomorrow. Same dashboard." },
              { icon: ShieldCheck, color: "emerald", title: "Beginner Friendly", desc: "Every metric has an info icon with a clear, jargon-free explanation in Arabic & English." },
              { icon: Zap, color: "orange", title: "AI Profit Advisor (soon)", desc: "Forecasting, ad analysis, and smart recommendations powered by your real data." },
            ].map((f) => {
              const Icon = f.icon;
              const palette: Record<string, string> = {
                blue: "bg-blue-50 text-blue-700",
                emerald: "bg-emerald-50 text-emerald-700",
                orange: "bg-orange-50 text-orange-700",
              };
              return (
                <Card key={f.title} className="p-6 border-slate-200 rounded-2xl hover:shadow-md transition-shadow">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${palette[f.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-slate-900 mb-2">{f.title}</div>
                  <p className="text-slate-600 text-sm">{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-white font-bold">ProfitPilot</span>
          </div>
          <p className="text-sm">© 2024 ProfitPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
