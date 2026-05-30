import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Store } from 'lucide-react'
import { useI18n } from './i18n'
import { localAuth } from '../../services/local-auth'

export function Auth() {
  const { t, dir } = useI18n()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    try {
      if (mode === 'signup') {
        // Try Supabase first, fall back to localStorage
        try {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin }
          })
          if (!signUpError && data.session) {
            navigate('/app/dashboard')
            return
          }
          if (!signUpError) {
            setMessage("Account created! Please check your email to confirm.")
            setLoading(false)
            return
          }
        } catch (_) {
          // Supabase unreachable, fall back to localStorage
        }

        // localStorage fallback
        try {
          localAuth.signUp(fullName, email, password)
          setMessage("Account created successfully! You are now signed in.")
          setTimeout(() => navigate('/app/dashboard'), 500)
        } catch (localErr: any) {
          setError(localErr.message)
        }
      } else {
        // Try Supabase first, fall back to localStorage
        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
          if (!signInError && data.session) {
            navigate('/app/dashboard')
            return
          }
          if (signInError) throw signInError
        } catch (_) {
          // Supabase unreachable, fall back to localStorage
        }

        // localStorage fallback
        try {
          localAuth.signIn(email, password)
          setMessage("Signed in successfully!")
          setTimeout(() => navigate('/app/dashboard'), 300)
        } catch (localErr: any) {
          if (localErr.message.includes("No account")) {
            setError("No account found. Please create an account first.")
          } else {
            setError(localErr.message)
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir={dir}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ProfitPilot</h1>
          <p className="text-slate-500 mt-1">{t("brand.tagline")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
              {t("nav.signin")}
            </button>
            <button onClick={() => { setMode('signup'); setError(''); setMessage('') }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'signup' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
              {t("store.signup")}
            </button>
          </div>

          <div className="p-8">
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
            {message && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("store.fullName")}</label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe"
                      className="w-full ps-10 pe-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required={mode === 'signup'} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("store.email")}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full ps-10 pe-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("store.password")}</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                    className="w-full ps-10 pe-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required minLength={6} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
                  {mode === 'signup' ? t("store.signup") : t("nav.signin")} <ArrowRight className="w-4 h-4" />
                </>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {mode === 'signup' ? t("store.haveAccount") : t("store.noAccount")}{' '}
              <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage('') }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                {mode === 'signup' ? t("nav.signin") : t("store.signup")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}