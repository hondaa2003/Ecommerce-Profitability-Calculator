// src/components/pages/Products.tsx
import { useEffect, useState } from 'react'
import { productsApi } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Package, ExternalLink, Calculator } from 'lucide-react'

export function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    name: '', sku: '', cogs: 0, shipping: 0, return_cost: 0,
    cod: 0, packaging: 0, vat: 0, price: 0, url: ''
  })

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true); setError('')
    try { const data = await productsApi.list(); setProducts(data) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('')
    if (!formData.name.trim()) { setFormError('Product name is required'); return }
    if (!formData.sku.trim()) { setFormError('SKU is required'); return }
    if (formData.price <= 0) { setFormError('Price must be greater than 0'); return }

    try {
      if (editingProduct) { await productsApi.update(editingProduct.id, formData) }
      else { await productsApi.create(formData) }
      setShowForm(false); setEditingProduct(null); resetForm(); loadProducts()
    } catch (err: any) { setFormError(err.message) }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name, sku: product.sku, cogs: product.cogs || 0, shipping: product.shipping || 0,
      return_cost: product.return_cost || 0, cod: product.cod || 0, packaging: product.packaging || 0,
      vat: product.vat || 0, price: product.price || 0, url: product.url || ''
    })
    setShowForm(true); setFormError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    try { await productsApi.remove(id); loadProducts() }
    catch (err: any) { setError(err.message) }
  }

  const resetForm = () => setFormData({ name: '', sku: '', cogs: 0, shipping: 0, return_cost: 0, cod: 0, packaging: 0, vat: 0, price: 0, url: '' })

  const calculateProfit = (product: any) => product.price - (product.cogs + product.shipping + product.return_cost + product.cod + product.packaging + product.vat)
  const calculateMargin = (product: any) => { const profit = calculateProfit(product); return product.price > 0 ? (profit / product.price) * 100 : 0 }
  const calculateBreakEvenRoas = (product: any) => { const profit = calculateProfit(product); return profit > 0 ? (product.price / profit).toFixed(2) : '∞' }
  const calculateTotalCost = (product: any) => product.cogs + product.shipping + product.return_cost + product.cod + product.packaging + product.vat

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage your product catalog and track profitability</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) { setEditingProduct(null); resetForm() } setFormError('') }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />{showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4"><Calculator className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2></div>
          {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Wireless Headphones" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">SKU <span className="text-red-500">*</span></label>
                <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g., WH-001" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product URL</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">COGS (AED)</label><input type="number" step="0.01" min="0" value={formData.cogs} onChange={(e) => setFormData({ ...formData, cogs: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Shipping (AED)</label><input type="number" step="0.01" min="0" value={formData.shipping} onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Return Cost (AED)</label><input type="number" step="0.01" min="0" value={formData.return_cost} onChange={(e) => setFormData({ ...formData, return_cost: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">COD Fee (AED)</label><input type="number" step="0.01" min="0" value={formData.cod} onChange={(e) => setFormData({ ...formData, cod: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Packaging (AED)</label><input type="number" step="0.01" min="0" value={formData.packaging} onChange={(e) => setFormData({ ...formData, packaging: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">VAT (AED)</label><input type="number" step="0.01" min="0" value={formData.vat} onChange={(e) => setFormData({ ...formData, vat: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Selling Price (AED) <span className="text-red-500">*</span></label><input type="number" step="0.01" min="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Profitability Preview</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500">Total Cost:</span><span className="ml-2 font-medium">AED {calculateTotalCost(formData).toFixed(2)}</span></div>
                <div><span className="text-slate-500">Profit:</span><span className={`ml-2 font-medium ${calculateProfit(formData) >= 0 ? 'text-green-600' : 'text-red-600'}`}>AED {calculateProfit(formData).toFixed(2)}</span></div>
                <div><span className="text-slate-500">Margin:</span><span className={`ml-2 font-medium ${calculateMargin(formData) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{calculateMargin(formData).toFixed(1)}%</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">{editingProduct ? 'Update Product' : 'Add Product'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); setFormError('') }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">SKU</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Cost</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Profit</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Margin</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">BE ROAS</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => {
                const profit = calculateProfit(product); const margin = calculateMargin(product)
                const beRoas = calculateBreakEvenRoas(product); const totalCost = calculateTotalCost(product)
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-slate-400" /></div>
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          {product.url && <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">View Product <ExternalLink className="w-3 h-3" /></a>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{product.sku}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">AED {product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">AED {totalCost.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>AED {profit.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{margin.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600 font-mono">{beRoas}x</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && !loading && (
          <div className="text-center py-12"><Package className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-500 font-medium">No products yet</p><p className="text-sm text-slate-400 mt-1">Add your first product to start tracking profitability</p></div>
        )}
      </div>
    </div>
  )
}
