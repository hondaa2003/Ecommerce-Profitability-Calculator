import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './app/components/Layout';
import { AdminGuard } from './app/components/AdminGuard';
import { PlaceholderPage } from './app/components/PlaceholderPage';
import { Landing } from './app/components/Landing';
import { Auth } from './app/components/Auth';
import { Dashboard } from './app/components/pages/Dashboard';
import { Products } from './app/components/pages/Products';
import { Orders } from './app/components/pages/Orders';
import { Campaigns } from './app/components/pages/Campaigns';
import { Reports } from './app/components/pages/Reports';
import { Settings } from './app/components/pages/Settings';
import { FuturePage } from './app/components/pages/Future';
import { useAuth } from './app/hooks/useAuth';

function RootRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return <Landing onEnter={() => navigate('/login')} />;
}

function LoginWrapper() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root: Landing Page */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/register" element={<LoginWrapper />} />
        <Route path="/auth" element={<LoginWrapper />} />

        {/* Protected routes */}
        <Route element={<Layout />}>
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
        <Route path="/admin" element={<AdminGuard><Layout /></AdminGuard>}>
          <Route index element={<PlaceholderPage label="Admin Dashboard" />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
