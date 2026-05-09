// src/components/pages/Dashboard.tsx
import { useEffect, useState } from 'react'
import { productsApi, ordersApi, campaignsApi, getCurrentUser } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Package, Target, ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

interface DashboardStats {
  totalRevenue: number
  totalProfit: number
  totalSpend: number
  totalOrders: number
  totalProducts: number
  roas: number
  avgMargin: number
  returnRate: number
}

export function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, totalProfit: 0, totalSpend: 0, totalOrders: 0,
    totalProducts: 0, roas: 0, avgMargin: 0, returnRate: 0
  })
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { initDashboard() }, [])

  const initDashboard = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) { navigate('/auth'); return }
      setUser(currentUser)
      await loadDashboardData()
    } catch (err: any) { setError(err.message) }
  }

  const loadDashboardData = async () => {
    setLoading(true); setError('')
    try {
      const [productsData, ordersData, campaignsData] = await Promise.all([
        productsApi.list(), ordersApi.list(), campaignsApi.list()
      ])
      setProducts(productsData); setOrders(ordersData); setCampaigns(campaignsData)

      const deliveredOrders = ordersData.filter(o => o.status === 'delivered')
      const returnedOrders = ordersData.filter(o => o.status === 'returned')
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
      const totalSpend = campaignsData.reduce((sum, c) => sum + (c.spend || 0), 0)
      const totalOrders = deliveredOrders.length

      let totalProfit = 0, totalMargin = 0, marginCount = 0
      deliveredOrders.forEach(order => {
        const product = productsData.find(p => p.id === order.product_id)
        if (product) {
          const cost = product.cogs + product.shipping + product.return_cost + product.cod + product.packaging + product.vat
          const profit = product.price - cost
          totalProfit += profit
          if (product.price > 0) { totalMargin += (profit / product.price) * 100; marginCount++ }
        }
      })

      const avgMargin = marginCount > 0 ? totalMargin / marginCount : 0
      const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0
      const returnRate = ordersData.length > 0 ? (returnedOrders.length / ordersData.length) * 100 : 0

      setStats({ totalRevenue, totalProfit, totalSpend, totalOrders, totalProducts: productsData.length, roas, avgMargin, returnRate })
    } catch (err: any) { setError('Failed to load dashboard data') }
    finally { setLoading(false) }
  }

  const productsWithMetrics = products.map(p => {
    const cost = p.cogs + p.shipping + p.return_cost + p.cod + p.packaging + p.vat
    const profit = p.price - cost
    const margin = p.price > 0 ? (profit / p.price) * 100 : 0
    const beRoas = profit > 0 ? (p.price / profit).toFixed(2) : '∞'
    return { ...p, profit, margin, beRoas }
  })

  const winning = productsWithMetrics.filter(p => p.profit > 0).sort((a, b) => b.profit - a.profit).slice(0, 5)
  const losing = productsWithMetrics.filter(p => p.profit < 0).sort((a, b) => a.profit - b.profit).slice(0, 5)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const chartData = last7Days.map(date => {
    const dayOrders = orders.filter(o => o.created_at?.startsWith(date) && o.status === 'delivered')
    const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
    let dayProfit = 0
    dayOrders.forEach(order => {
      const product = products.find(p => p.id === order.product_id)
      if (product) { dayProfit += product.price - (product.cogs + product.shipping + product.return_cost + product.cod + product.packaging + product.vat) }
    })
    const daySpend = campaigns.filter(c => c.created_at?.startsWith(date)).reduce((sum, c) => sum + (c.spend || 0), 0)
    return { date: date.slice(5), revenue: Math.round(dayRevenue), profit: Math.round(dayProfit), spend: Math.round(daySpend) }
  })

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayName} 👋</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2"><Calendar className="w-4 h-4" />Here's how your store performed this week.</p>
        </div>
        <button onClick={() => loadDashboardData()} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">Refresh Data</button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Revenue" value={`AED ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={stats.totalRevenue > 0 ? 'up' : 'neutral'} delta={`${stats.totalOrders} orders`} color="blue" />
        <KPICard title="Net Profit" value={`AED ${stats.totalProfit.toLocaleString()}`} icon={TrendingUp} trend={stats.totalProfit >= 0 ? 'up' : 'down'} delta={`${stats.avgMargin.toFixed(1)}% avg margin`} color={stats.totalProfit >= 0 ? 'green' : 'red'} />
        <KPICard title="ROAS" value={stats.roas.toFixed(2)} icon={Target} trend={stats.roas >= 2 ? 'up' : stats.roas > 0 ? 'neutral' : 'down'} delta={stats.roas > 0 ? `${stats.roas.toFixed(1)}x return` : 'No ad spend'} color={stats.roas >= 2 ? 'green' : 'yellow'} />
        <KPICard title="Store Health" value={`${stats.returnRate.toFixed(1)}%`} icon={ShoppingCart} trend={stats.returnRate < 10 ? 'up' : 'down'} delta={`${stats.totalProducts} products`} color={stats.returnRate < 10 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-1">Revenue & Profit Trend</h3>
          <p className="text-sm text-slate-500 mb-4">Last 7 days performance</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-1">Spend vs Profit</h3>
          <p className="text-sm text-slate-500 mb-4">Ad spend efficiency</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="spend" fill="#ef4444" radius={[4, 4, 0, 0]} name="Ad Spend" />
              <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div><h3 className="text-lg font-semibold">Winning Products</h3><p className="text-sm text-slate-500">Top profitable items</p></div>
          </div>
          {winning.length === 0 ? (
            <div className="text-center py-8"><Package className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-500 font-medium">No winning products yet</p><p className="text-sm text-slate-400 mt-1">Add products with positive margins to see them here</p></div>
          ) : (
            <div className="space-y-3">
              {winning.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-green-50/50 border border-green-100 rounded-xl hover:bg-green-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-green-600" /></div>
                    <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-sm text-green-600">Margin: {p.margin.toFixed(1)}%</p></div>
                  </div>
                  <div className="text-right"><p className="font-semibold text-green-600">AED {p.profit.toFixed(0)}</p><span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">BE ROAS: {p.beRoas}x</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-100 rounded-lg"><TrendingDown className="w-5 h-5 text-red-600" /></div>
            <div><h3 className="text-lg font-semibold">Losing Products</h3><p className="text-sm text-slate-500">Items needing attention</p></div>
          </div>
          {losing.length === 0 ? (
            <div className="text-center py-8"><TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-300" /><p className="text-slate-500 font-medium">No losing products!</p><p className="text-sm text-slate-400 mt-1">Great job! All your products are profitable</p></div>
          ) : (
            <div className="space-y-3">
              {losing.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-red-600" /></div>
                    <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-sm text-red-600">Margin: {p.margin.toFixed(1)}%</p></div>
                  </div>
                  <div className="text-right"><p className="font-semibold text-red-600">-AED {Math.abs(p.profit).toFixed(0)}</p><span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Loss per unit</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg"><ShoppingCart className="w-5 h-5 text-blue-600" /></div>
            <div><h3 className="text-lg font-semibold">Recent Orders</h3><p className="text-sm text-slate-500">Latest activity</p></div>
          </div>
          <button onClick={() => navigate('/orders')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All →</button>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8"><ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-500 font-medium">No orders yet</p><p className="text-sm text-slate-400 mt-1">Add your first order to start tracking</p></div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium text-slate-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">{order.customer_name} • {order.products?.name || 'Unknown Product'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{order.status}</span>
                  <p className="text-sm font-medium mt-1">AED {order.amount?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon, trend, delta, color }: {
  title: string; value: string; icon: any; trend: 'up' | 'down' | 'neutral'; delta: string; color: string
}) {
  const colorStyles = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600', yellow: 'bg-yellow-50 text-yellow-600' }
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorStyles[color as keyof typeof colorStyles]}`}><Icon className="w-5 h-5" /></div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-400'}`}>
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}{trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}{delta}
        </div>
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  )
}
