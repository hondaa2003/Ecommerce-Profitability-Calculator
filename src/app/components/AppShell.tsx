import { useState } from "react";
import {
  Bell,
  Calculator,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Campaigns } from "./pages/Campaigns";
import { Orders } from "./pages/Orders";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { FuturePage } from "./pages/Future";
import { useI18n } from "./i18n";
import { LangToggle } from "./LangToggle";

export type PageKey =
  | "dashboard"
  | "products"
  | "campaigns"
  | "orders"
  | "reports"
  | "settings"
  | "future";

interface AppShellProps {
  onExit: () => void;
}

const NAV: { key: PageKey; tKey: string; icon: any; group: "workspace" | "account" }[] = [
  { key: "dashboard", tKey: "nav.dashboard", icon: LayoutDashboard, group: "workspace" },
  { key: "products", tKey: "nav.products", icon: Package, group: "workspace" },
  { key: "campaigns", tKey: "nav.campaigns", icon: Megaphone, group: "workspace" },
  { key: "orders", tKey: "nav.orders", icon: ShoppingCart, group: "workspace" },
  { key: "reports", tKey: "nav.reports", icon: FileBarChart, group: "workspace" },
  { key: "settings", tKey: "nav.settings", icon: SettingsIcon, group: "account" },
  { key: "future", tKey: "nav.future", icon: Sparkles, group: "account" },
];

export function AppShell({ onExit }: AppShellProps) {
  const [page, setPage] = useState<PageKey>("dashboard");
  const { t, dir } = useI18n();

  const groups: { key: "workspace" | "account"; label: string }[] = [
    { key: "workspace", label: t("app.workspace") },
    { key: "account", label: t("app.account") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-slate-200 hidden lg:flex flex-col border-e">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-900">ProfitPilot</div>
            <div className="text-xs text-slate-500">{t("brand.tagline")}</div>
          </div>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          {groups.map((g) => (
            <div key={g.key} className="mb-6">
              <div className="text-xs uppercase tracking-wider text-slate-400 px-3 mb-2">{g.label}</div>
              <div className="space-y-1">
                {NAV.filter((i) => i.group === g.key).map((item) => {
                  const Icon = item.icon;
                  const active = page === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setPage(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-start">{t(item.tKey)}</span>
                      {item.key === "future" && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-[10px]">
                          {t("nav.new")}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-100">
          <div className="rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white p-4">
            <div className="text-sm">{t("app.trial")}</div>
            <div className="text-xs text-blue-100 mt-1 mb-3">{t("app.trialDesc")}</div>
            <Button size="sm" className="w-full bg-white text-blue-800 hover:bg-blue-50">
              {t("cta.upgrade")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-20">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
            <Input placeholder={t("app.search")} className="ps-9 bg-slate-50 border-slate-200" />
          </div>

          <LangToggle />

          <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 end-2 w-2 h-2 rounded-full bg-orange-500" />
          </button>

          <button onClick={onExit} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-700 text-white text-xs">AF</AvatarFallback>
            </Avatar>
            <div className="text-start hidden md:block">
              <div className="text-sm text-slate-900">Ahmed Fares</div>
              <div className="text-xs text-slate-500">Owner</div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          {page === "dashboard" && <Dashboard />}
          {page === "products" && <Products />}
          {page === "campaigns" && <Campaigns />}
          {page === "orders" && <Orders />}
          {page === "reports" && <Reports />}
          {page === "settings" && <Settings />}
          {page === "future" && <FuturePage />}
        </main>
      </div>
    </div>
  );
}
