import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  ChevronDown,
  LineChart,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { InfoTip } from "./InfoTip";
import { tips } from "./glossary";
import { useI18n } from "./i18n";
import { LangToggle } from "./LangToggle";

interface LandingProps {
  onEnter: () => void;
  onShop?: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  const { t, dir } = useI18n();
  return (
    <div className="min-h-screen bg-white text-slate-900" dir={dir}>
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-slate-900">ProfitPilot</span>
            <Badge className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
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
                {t("cta.startTrial")} <ArrowRight className="w-4 h-4 ms-1 rtl:rotate-180" />
              </Button>
              <Button size="lg" variant="outline" onClick={onEnter} className="border-slate-300">
                {t("cta.bookDemo")}
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

      {/* Calculator preview */}
      <section id="calculator" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 mb-4">{t("calc.badge")}</Badge>
            <h2 className="mb-4" style={{ fontSize: "2.25rem", fontWeight: 600 }}>
              {t("calc.title")}
            </h2>
            <p className="text-slate-600 mb-6">
              {t("calc.sub")}
            </p>
            <ul className="space-y-3 text-slate-700">
              {[
                "Auto-calculated Margin & Break-even ROAS",
                "Includes COD fees, VAT and return cost",
                "Tooltip explanations for every input",
                "Multi-currency, multi-store ready",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-6 border-slate-200 rounded-2xl bg-white shadow-xl">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Selling Price", value: "AED 199", tip: tips.sellingPrice },
                { label: "COGS", value: "AED 55", tip: tips.cogs },
                { label: "Shipping", value: "AED 18", tip: tips.shipping },
                { label: "COD Fees", value: "AED 8", tip: tips.cod },
                { label: "VAT", value: "5%", tip: tips.vat },
                { label: "Ad Spend / Order", value: "AED 60", tip: tips.adSpend },
              ].map((row) => (
                <div key={row.label} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    {row.label} <InfoTip {...row.tip} />
                  </div>
                  <div className="mt-1 text-slate-900">{row.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-blue-50">
                <div className="text-xs text-blue-700 flex items-center gap-1">Profit / Order <InfoTip tipKey="netProfit" /></div>
                <div className="mt-1 text-blue-800">AED 48</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50">
                <div className="text-xs text-emerald-700 flex items-center gap-1">Margin <InfoTip tipKey="margin" /></div>
                <div className="mt-1 text-emerald-800">24%</div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50">
                <div className="text-xs text-orange-700 flex items-center gap-1">Break-even ROAS <InfoTip tipKey="breakEvenRoas" /></div>
                <div className="mt-1 text-orange-800">1.62x</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-orange-50 text-orange-700 border-orange-100 mb-4">{t("testimonials.badge")}</Badge>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 600 }}>{t("testimonials.title")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ahmed Al-Fares", role: "Dropshipper · Riyadh", quote: "I finally see real profit after COD and returns. Stopped scaling losing products in week one." },
              { name: "Layla Mansour", role: "DTC Founder · Dubai", quote: "The tooltip system made my whole team understand ROAS and Max CPP without a course." },
              { name: "Karim Hosny", role: "Media Buyer · Cairo", quote: "Cleanest profit dashboard I've used. Triple Whale vibes, but built for our market." },
            ].map((t) => (
              <Card key={t.name} className="p-6 rounded-2xl border-slate-200">
                <div className="flex gap-0.5 mb-3 text-orange-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 mb-4">"{t.quote}"</p>
                <div className="text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 mb-4">{t("pricing.badge")}</Badge>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 600 }}>{t("pricing.title")}</h2>
            <p className="text-slate-600 mt-2">{t("pricing.sub")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Basic", price: "$19", desc: "For new sellers validating products.", features: ["1 store", "Up to 50 products", "Manual ad entry", "Email support"], cta: "Start Free" },
              { name: "Pro", price: "$49", desc: "For scaling stores and media buyers.", features: ["3 stores", "Unlimited products", "Campaign tracking", "Reports & exports", "Priority support"], cta: "Start Free Trial", featured: true },
              { name: "Agency", price: "$149", desc: "For agencies managing many clients.", features: ["10+ stores", "White-label dashboards", "Team & permissions", "API integrations", "Dedicated manager"], cta: "Contact Sales" },
            ].map((p) => (
              <Card
                key={p.name}
                className={`p-7 rounded-2xl border ${p.featured ? "border-blue-700 ring-2 ring-blue-100 shadow-xl bg-white" : "border-slate-200 bg-white"}`}
              >
                {p.featured && (
                  <Badge className="bg-blue-700 hover:bg-blue-700 text-white mb-3">Most Popular</Badge>
                )}
                <div className="text-slate-900">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl text-slate-900">{p.price}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <p className="text-slate-600 text-sm mt-2 mb-5">{p.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={onEnter}
                  className={`w-full ${p.featured ? "bg-blue-700 hover:bg-blue-800 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
                >
                  {p.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 mb-4">{t("faq.badge")}</Badge>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 600 }}>{t("faq.title")}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Do I need to connect my store to start?", a: "No. You can begin with manual entries today and connect Shopify, Salla, or Zid later when integrations are released." },
              { q: "Does it support Arabic?", a: "Yes — the entire UI, tooltips, and reports support Arabic and English with RTL layout." },
              { q: "Can I track Meta and TikTok ads?", a: "Today campaigns are entered manually. API integrations for Meta, TikTok, and Google Ads are on the roadmap." },
              { q: "Is COD and VAT supported?", a: "Yes. We support COD fees, VAT, return costs, and packaging — built specifically for the GCC/MENA market." },
              { q: "Can I cancel anytime?", a: "Yes. Plans are monthly with no long-term commitment." },
            ].map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <Card className="p-10 rounded-3xl border-0 bg-gradient-to-br from-blue-700 to-blue-900 text-white text-center">
            <h3 className="mb-3" style={{ fontSize: "2rem", fontWeight: 600 }}>
              {t("ctaFinal.title")}
            </h3>
            <p className="text-blue-100 mb-6">{t("ctaFinal.sub")}</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Button size="lg" onClick={onEnter} className="bg-white text-blue-800 hover:bg-blue-50">
                {t("cta.startTrial")}
              </Button>
              <Button size="lg" variant="outline" onClick={onEnter} className="bg-transparent border-white/40 text-white hover:bg-white/10">
                {t("cta.bookDemo")}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="text-slate-900">ProfitPilot</span>
            </div>
            <p className="text-slate-500">Real profit clarity for ecommerce sellers in GCC & MENA.</p>
          </div>
          <div>
            <div className="text-slate-900 mb-3">Product</div>
            <ul className="space-y-2 text-slate-500">
              <li>Features</li><li>Calculator</li><li>Pricing</li><li>Roadmap</li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 mb-3">Company</div>
            <ul className="space-y-2 text-slate-500">
              <li>About</li><li>Blog</li><li>Contact</li><li>Careers</li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 mb-3">Legal</div>
            <ul className="space-y-2 text-slate-500">
              <li>Terms</li><li>Privacy</li><li>Cookies</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
          <span>© 2026 ProfitPilot. All rights reserved.</span>
          <span className="flex items-center gap-1">English / العربية <ChevronDown className="w-3 h-3" /></span>
        </div>
      </footer>
    </div>
  );
}
