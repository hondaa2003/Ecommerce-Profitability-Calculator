// src/components/pages/Reports.tsx
import { useEffect, useState } from 'react'
import { productsApi, ordersApi, campaignsApi } from '../../lib/supabase'
import { Download, FileText, BarChart3, Calendar } from 'lucide-react'

export function Reports() {
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, o, c] = await Promise.all([productsApi.list(), ordersApi.list(), campaignsApi.list()])
      setProducts(p); setOrders(o); setCampaigns(c)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const filterByDate = (items: any[]) => {
    if (dateRange === 'all') return items
    const now = new Date()
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return items.filter(item => new Date(item.created_at) >= cutoff)
  }

  const filteredOrders = filterByDate(orders)
  const filteredCampaigns = filterByDate(campaigns)

  const productReport = products.map(p => {
    const cost = p.cogs + p.shipping + p.return_cost + p.cod + p.packaging + p.vat
    const profit = p.price - cost
    const margin = p.price > 0 ? (profit / p.price) * 100 : 0
    const beRoas = profit > 0 ? (p.price / profit).toFixed(2) : '∞'
    const productOrders = filteredOrders.filter(o => o.product_id === p.id && o.status === 'delivered')
    const totalSold = productOrders.length
    const totalRevenue = productOrders.reduce((sum, o) => sum + o.amount, 0)
    return { name: p.name, sku: p.sku, price: p.price, cost, profit, margin, beRoas, totalSold, totalRevenue }
  }).sort((a, b) => b.profit - a.profit)

  const campaignReport = filteredCampaigns.map(c => ({
    name: c.name, platform: c.platform, spend: c.spend, revenue: c.revenue,
    roas: c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : '0.00',
    cpa: c.orders_count > 0 ? (c.spend / c.orders_count).toFixed(2) : '0.00',
    orders: c.orders_count, status: c.status
  })).sort((a, b) => b.revenue - a.revenue)

  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return
    const headers = Object.keys(data[0])
    const csv = [headers.join(','), ...data.map(row => headers.map(h => {
      const val = row[h]
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    }).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = (data: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const totalProfit = productReport.reduce((sum, p) => sum + (p.profit * p.totalSold), 0)
  const totalRevenue = productReport.reduce((sum, p) => sum + p.totalRevenue, 0)
  const totalCampaignSpend = campaignReport.reduce((sum, c) => sum + c.spend, 0)
  const totalCampaignRevenue = campaignReport.reduce((sum, c) => sum + c.revenue, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-3xl font-bold text-slate-900">Reports</h1><p className="text-slate-500 mt-1">Profitability summaries and analytics</p></div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
          <option value="all">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-5 h-5 text-blue-600" /><span className="text-sm text-slate-500">Total Profit</span></div>
          <p className="text-2xl font-bold text-slate-900">AED {totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><FileText className="w-5 h-5 text-green-600" /><span className="text-sm text-slate-500">Total Revenue</span></div>
          <p className="text-2xl font-bold text-slate-900">AED {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Calendar className="w-5 h-5 text-purple-600" /><span className="text-sm text-slate-500">Ad ROAS</span></div>
          <p className="text-2xl font-bold text-slate-900">{totalCampaignSpend > 0 ? (totalCampaignRevenue / totalCampaignSpend).toFixed(2) : '0.00'}x</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Product Profitability</h3>
          <div className="flex gap-2">
            <button onClick={() => exportCSV(productReport, 'product_report')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><Download className="w-3.5 h-3.5" />CSV</button>
            <button onClick={() => exportJSON(productReport, 'product_report')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><Download className="w-3.5 h-3.5" />JSON</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Product</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Cost</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Profit</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Margin</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">BE ROAS</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Sold</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productReport.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><p className="font-medium text-slate-900">{p.name}</p><p className="text-xs text-slate-500">{p.sku}</p></td>
                  <td className="px-4 py-3 text-right text-sm">AED {p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">AED {p.cost.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right text-sm font-medium ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>AED {p.profit.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right text-sm font-medium ${p.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{p.margin.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{p.beRoas}x</td>
                  <td className="px-4 py-3 text-right text-sm">{p.totalSold}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium">AED {p.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productReport.length === 0 && <div className="text-center py-8 text-slate-400">No products to report</div>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Campaign Performance</h3>
          <div className="flex gap-2">
            <button onClick={() => exportCSV(campaignReport, 'campaign_report')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><Download className="w-3.5 h-3.5" />CSV</button>
            <button onClick={() => exportJSON(campaignReport, 'campaign_report')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"><Download className="w-3.5 h-3.5" />JSON</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Campaign</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Platform</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Spend</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">ROAS</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">CPA</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {campaignReport.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 capitalize">{c.platform}</td>
                  <td className="px-4 py-3 text-right text-sm text-red-600">AED {c.spend.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-sm text-green-600">AED {c.revenue.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right text-sm font-semibold ${parseFloat(c.roas) >= 2 ? 'text-green-600' : parseFloat(c.roas) >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>{c.roas}x</td>
                  <td className="px-4 py-3 text-right text-sm">AED {c.cpa}</td>
                  <td className="px-4 py-3 text-right text-sm">{c.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {campaignReport.length === 0 && <div className="text-center py-8 text-slate-400">No campaigns to report</div>}
      </div>
    </div>
  )
}
