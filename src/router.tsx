import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './app/components/Layout';
import { AdminGuard } from './app/components/AdminGuard';
import { PlaceholderPage } from './app/components/PlaceholderPage';
import { Auth } from './app/components/Auth';
import { Landing } from './app/components/Landing';
import { Dashboard } from './app/components/pages/Dashboard';
import { Products } from './app/components/pages/Products';
import { Orders } from './app/components/pages/Orders';
import { Campaigns } from './app/components/pages/Campaigns';
import { Reports } from './app/components/pages/Reports';
import { Settings } from './app/components/pages/Settings';
import { FuturePage } from './app/components/pages/Future';
import { useAuth } from './app/hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LoginWrapper() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/register" element={<LoginWrapper />} />
        <Route path="/auth" element={<LoginWrapper />} />
        <Route path="/demo" element={<DemoEntry />} />

        {/* Protected routes — wrapped in Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/crm" element={<PlaceholderPage label="CRM" />} />
          <Route path="/ai-advisor" element={<PlaceholderPage label="AI Profit Advisor" />} />
          <Route path="/ad-analyzer" element={<PlaceholderPage label="Ad Analyzer" />} />
          <Route path="/integrations" element={<Settings />} />
          <Route path="/agency" element={<PlaceholderPage label="Agency Dashboard" />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/future" element={<FuturePage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminGuard>
              <Layout />
            </AdminGuard>
          </ProtectedRoute>
        }>
          <Route index element={<PlaceholderPage label="Admin Dashboard" />} />
        </Route>

        {/* Legacy app routes — redirect to new routes */}
        <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function LandingWrapper() {
  const navigate = useNavigate();
  return <Landing onEnter={() => navigate('/login')} onDemo={() => navigate('/demo')} />;
}

function DemoEntry() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem('demo_mode', 'true');
    navigate('/dashboard', { replace: true });
  }, [navigate]);
  return null;
}