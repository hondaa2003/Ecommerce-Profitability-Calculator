// src/components/pages/Campaigns.tsx
import { useEffect, useState } from 'react'
import { campaignsApi } from '../../lib/supabase'
import { Plus, Target, TrendingUp, DollarSign, Trash2, BarChart3 } from 'lucide-react'

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    name: '', platform: 'meta', spend: 0, orders_count: 0, revenue: 0,
    start_date: '', end_date: '', status: 'active' as 'active' | 'paused' | 'ended'
  })

  useEffect(() => { loadCampaigns() }, [])

  const loadCampaigns = async () => {
    setLoading(true); setError('')
    try { const data = await campaignsApi.list(); setCampaigns(data) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('')
    if (!formData.name.trim()) { setFormError('Campaign name is required'); return }
    if (formData.spend < 0) { setFormError('Spend cannot be negative'); return }

    try {
      await campaignsApi.create(formData)
      setShowForm(false)
      setFormData({ name: '', platform: 'meta', spend: 0, orders_count: 0, revenue: 0, start_date: '', end_date: '', status: 'active' })
      loadCampaigns()
    } catch (err: any) { setFormError(err.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return
    try { await campaignsApi.remove(id); loadCampaigns() }
    catch (err: any) { setError(err.message) }
  }

  const calculateRoas = (campaign: any) => campaign.spend > 0 ? (campaign.revenue / campaign.spend).toFixed(2) : '0.00'
  const calculateCpa = (campaign: any) => campaign.orders_count > 0 ? (campaign.spend / campaign.orders_count).toFixed(2) : '0.00'

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = { meta: '📘', google: '🔍', tiktok: '🎵', snapchat: '👻', other: '📢' }
    return icons[platform] || '📢'
  }

  const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)
  const totalOrders = campaigns.reduce((sum, c) => sum + (c.orders_count || 0), 0)
  const overallRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00'
  const overallCpa = totalOrders > 0 ? (totalSpend / totalOrders).toFixed(2) : '0.00'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-3xl font-bold text-slate-900">Campaigns</h1><p className="text-slate-500 mt-1">Track ad spend and measure ROI</p></div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) { setFormData({ name: '', platform: 'meta', spend: 0, orders_count: 0, revenue: 0, start_date: '', end_date: '', status: 'active' }); setFormError('') } }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />{showForm ? 'Cancel' : 'Add Campaign'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><DollarSign className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-sm text-slate-500">Total Spend</p><p className="text-xl font-bold text-slate-900">AED {totalSpend.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-sm text-slate-500">Total Revenue</p><p className="text-xl font-bold text-slate-900">AED {totalRevenue.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Target className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-sm text-slate-500">Overall ROAS</p><p className="text-xl font-bold text-slate-900">{overallRoas}x</p></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-sm text-slate-500">Avg CPA</p><p className="text-xl font-bold text-slate-900">AED {overallCpa}</p></div>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Campaign</h2>
          {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{formError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Summer Sale 2024" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
              <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                <option value="meta">Meta (Facebook/Instagram)</option>
                <option value="google">Google Ads</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="snapchat">Snapchat Ads</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Spend (AED)</label>
              <input type="number" step="0.01" min="0" value={formData.spend} onChange={(e) => setFormData({ ...formData, spend: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Orders Generated</label>
              <input type="number" min="0" value={formData.orders_count} onChange={(e) => setFormData({ ...formData, orders_count: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Revenue Generated (AED)</label>
              <input type="number" step="0.01" min="0" value={formData.revenue} onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Add Campaign</button>
              <button type="button" onClick={() => { setShowForm(false); setFormError('') }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Campaign</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Platform</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Spend</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">ROAS</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">CPA</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {campaigns.map((campaign) => {
                const roas = calculateRoas(campaign); const cpa = calculateCpa(campaign)
                return (
                  <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getPlatformIcon(campaign.platform)}</span>
                        <div>
                          <p className="font-medium text-slate-900">{campaign.name}</p>
                          <p className="text-xs text-slate-500">{campaign.start_date && new Date(campaign.start_date).toLocaleDateString()}{campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{campaign.platform}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-red-600">AED {campaign.spend?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-green-600">AED {campaign.revenue?.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${parseFloat(roas) >= 2 ? 'text-green-600' : parseFloat(roas) >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>{roas}x</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">AED {cpa}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>{campaign.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(campaign.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {campaigns.length === 0 && !loading && (
          <div className="text-center py-12"><Target className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-500 font-medium">No campaigns yet</p><p className="text-sm text-slate-400 mt-1">Add your first campaign to track ad performance</p></div>
        )}
      </div>
    </div>
  )
}
