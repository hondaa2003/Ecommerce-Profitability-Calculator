// src/components/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Auth } from './components/Auth'
import { AppShell } from './components/AppShell'
import { Landing } from './components/Landing'
import { Dashboard } from './components/pages/Dashboard'
import { Products } from './components/pages/Products'
import { Orders } from './components/pages/Orders'
import { Campaigns } from './components/pages/Campaigns'
import { Reports } from './components/pages/Reports'
import { Settings } from './components/pages/Settings'
import { FuturePage } from './components/pages/Future'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthenticated(!!session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setAuthenticated(!!session)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export function App() {
  const navigateToAuth = () => {
    // Use a global navigation hack since we're inside the Router
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell onExit={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="future" element={<FuturePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function LandingWrapper() {
  const navigate = useNavigate();
  return <Landing onEnter={() => navigate('/auth')} />;
}
