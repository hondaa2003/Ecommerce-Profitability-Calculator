import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
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
import { useI18n } from "./i18n";
import { LangToggle } from "./LangToggle";
import { getSupabase } from "./supabase-client";
import { localAuth } from "../../services/local-auth";

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

const NAV: { key: PageKey; path: string; tKey: string; icon: any; group: "workspace" | "account" }[] = [
  { key: "dashboard", path: "/app/dashboard", tKey: "nav.dashboard", icon: LayoutDashboard, group: "workspace" },
  { key: "products", path: "/app/products", tKey: "nav.products", icon: Package, group: "workspace" },
  { key: "campaigns", path: "/app/campaigns", tKey: "nav.campaigns", icon: Megaphone, group: "workspace" },
  { key: "orders", path: "/app/orders", tKey: "nav.orders", icon: ShoppingCart, group: "workspace" },
  { key: "reports", path: "/app/reports", tKey: "nav.reports", icon: FileBarChart, group: "workspace" },
  { key: "settings", path: "/app/settings", tKey: "nav.settings", icon: SettingsIcon, group: "account" },
  { key: "future", path: "/app/future", tKey: "nav.future", icon: Sparkles, group: "account" },
];

export function AppShell({ onExit }: AppShellProps) {
  const { t, dir } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("Owner");
  const [userInitials, setUserInitials] = useState<string>("U");

  useEffect(() => {
    (async () => {
      try {
        // Demo mode uses fixed values
        if (localStorage.getItem("demo_mode") === "true") {
          setUserName("Demo User");
          setUserEmail("demo@profitpilot.app");
          setUserInitials("DU");
          return;
        }

        // Check localStorage auth first
        const localUser = localAuth.getUser();
        if (localUser) {
          setUserName(localUser.name);
          setUserEmail(localUser.email);
          const linitials = localUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
          setUserInitials(linitials || "U");
          return;
        }

        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserEmail(user.email || "");
          
          // Try to get user profile
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          
          const name = profile?.full_name || user.email?.split("@")[0] || "User";
          setUserName(name);
          
          // Generate initials
          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          setUserInitials(initials);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    })();
  }, []);

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
          <div className="cursor-pointer" onClick={() => navigate("/app/dashboard")}>
            <div className="text-slate-900 font-semibold">ProfitPilot</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t("brand.tagline")}</div>
          </div>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          {groups.map((g) => (
            <div key={g.key} className="mb-6">
              <div className="text-xs uppercase tracking-wider text-slate-400 px-3 mb-2 font-medium">{g.label}</div>
              <div className="space-y-1">
                {NAV.filter((i) => i.group === g.key).map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.key}
                      to={item.path}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        active
                          ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-blue-700" : "text-slate-400"}`} />
                      <span className="flex-1 text-start">{t(item.tKey)}</span>
                      {item.key === "future" && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-[10px] px-1.5 py-0">
                          {t("nav.new")}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-100">
          <div className="rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white p-4 shadow-lg shadow-blue-900/20">
            <div className="text-sm font-medium">{t("app.trial")}</div>
            <div className="text-xs text-blue-100 mt-1 mb-3 leading-relaxed">{t("app.trialDesc")}</div>
            <Button size="sm" className="w-full bg-white text-blue-800 hover:bg-blue-50 border-0 font-semibold">
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
            <Input placeholder={t("app.search")} className="ps-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
          </div>

          <LangToggle />

          <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 end-2.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
          </button>

          <button onClick={onExit} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
            <Avatar className="w-8 h-8 border border-slate-200">
              <AvatarFallback className="bg-blue-700 text-white text-xs font-bold">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="text-start hidden md:block">
              <div className="text-sm text-slate-900 font-medium">{userName}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-tight">{userRole}</div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
