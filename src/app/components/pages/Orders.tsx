// src/components/pages/Orders.tsx
import { useEffect, useState } from 'react'
import { ordersApi, productsApi } from '../../lib/supabase'
import { Plus, ShoppingCart, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'

export function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    product_id: '', customer_name: '', amount: 0,
    status: 'pending' as 'pending' | 'delivered' | 'returned', notes: ''
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true); setError('')
    try {
      const [ordersData, productsData] = await Promise.all([ordersApi.list(), productsApi.list()])
      setOrders(ordersData); setProducts(productsData)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('')
    if (!formData.product_id) { setFormError('Please select a product'); return }
    if (!formData.customer_name.trim()) { setFormError('Customer name is required'); return }
    if (formData.amount <= 0) { setFormError('Amount must be greater than 0'); return }

    try {
      await ordersApi.create(formData)
      setShowForm(false); setFormData({ product_id: '', customer_name: '', amount: 0, status: 'pending', notes: '' })
      loadData()
    } catch (err: any) { setFormError(err.message) }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try { await ordersApi.update(id, { status: status as any }); loadData() }
    catch (err: any) { setError(err.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return
    try { await ordersApi.remove(id); loadData() }
    catch (err: any) { setError(err.message) }
  }

  const stats = {
    total: orders.length, delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
    returned: orders.filter(o => o.status === 'returned').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.amount || 0), 0),
    returnRate: orders.length > 0 ? (orders.filter(o => o.status === 'returned').length / orders.length) * 100 : 0
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'returned': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-3xl font-bold text-slate-900">Orders</h1><p className="text-slate-500 mt-1">Track and manage your orders</p></div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) { setFormData({ product_id: '', customer_name: '', amount: 0, status: 'pending', notes: '' }); setFormError('') } }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />{showForm ? 'Cancel' : 'Add Order'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Orders" value={stats.total} icon={ShoppingCart} color="blue" />
        <StatCard title="Delivered" value={stats.delivered} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard title="Returned" value={stats.returned} icon={XCircle} color="red" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><p className="text-sm text-slate-500">Total Revenue</p><p className="text-2xl font-bold text-slate-900">AED {stats.revenue.toLocaleString()}</p></div>
          <div><p className="text-sm text-slate-500">Return Rate</p><p className={`text-2xl font-bold ${stats.returnRate < 10 ? 'text-green-600' : 'text-red-600'}`}>{stats.returnRate.toFixed(1)}%</p></div>
          <div><p className="text-sm text-slate-500">Success Rate</p><p className="text-2xl font-bold text-blue-600">{stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0}%</p></div>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Order</h2>
          {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{formError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product <span className="text-red-500">*</span></label>
              <select value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" required>
                <option value="">Select a product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (AED {p.price})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} placeholder="Customer name" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (AED) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status <span className="text-red-500">*</span></label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." rows={2} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none resize-none" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Add Order</button>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3"><span className="text-sm font-mono font-medium text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-700">{order.products?.name || 'Unknown Product'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{order.customer_name}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium">AED {order.amount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer outline-none transition-colors ${getStatusStyle(order.status)}`}>
                        <option value="pending">Pending</option>
                        <option value="delivered">Delivered</option>
                        <option value="returned">Returned</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && !loading && (
          <div className="text-center py-12"><ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-500 font-medium">No orders yet</p><p className="text-sm text-slate-400 mt-1">Add your first order to start tracking</p></div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600', red: 'bg-red-50 text-red-600'
  }
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon className="w-5 h-5" /></div>
        <div><p className="text-sm text-slate-500">{title}</p><p className="text-xl font-bold text-slate-900">{value}</p></div>
      </div>
    </div>
  )
}
