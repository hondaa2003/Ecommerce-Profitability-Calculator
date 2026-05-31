import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FileText, Megaphone, Users, Bot,
  BarChart3, Plug, Building2, Settings, Shield, Bell, Store,
  LogOut, Search, ChevronDown, Calculator,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, profile, isAdmin, isAgency, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', arLabel: 'الرئيسية' },
    { path: '/products', icon: Package, label: 'Products', arLabel: 'المنتجات' },
    { path: '/orders', icon: FileText, label: 'Orders', arLabel: 'الطلبات' },
    { path: '/campaigns', icon: Megaphone, label: 'Campaigns', arLabel: 'الحملات' },
    { path: '/crm', icon: Users, label: 'CRM', arLabel: 'العملاء' },
    { path: '/ai-advisor', icon: Bot, label: 'AI Advisor', arLabel: 'مستشار الذكاء' },
    { path: '/ad-analyzer', icon: BarChart3, label: 'Ad Analyzer', arLabel: 'محلل الإعلانات' },
    { path: '/integrations', icon: Plug, label: 'Integrations', arLabel: 'الربط' },
    ...(isAgency ? [{ path: '/agency', icon: Building2, label: 'Agency', arLabel: 'الوكالة' }] : []),
    { path: '/settings', icon: Settings, label: 'Settings', arLabel: 'الإعدادات' },
    ...(isAdmin ? [{ path: '/admin', icon: Shield, label: 'Admin', arLabel: 'المشرف' }] : []),
  ];

  const pageTitle = navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 end-auto z-30 w-60 bg-white border-l border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:flex`}>
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-900 font-semibold text-sm">ProfitPilot</div>
            <div className="text-[10px] text-slate-400">مراقب الربحية</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>{item.arLabel}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link to="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-900 truncate">{profile?.full_name || user?.email || 'User'}</div>
              <div className="text-[10px] text-slate-400 capitalize">{profile?.plan || 'free'}</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>

          <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>

          <div className="flex-1" />

          <Store className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 hidden sm:inline">Store connected</span>

          <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
          </button>

          <button onClick={signOut} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}