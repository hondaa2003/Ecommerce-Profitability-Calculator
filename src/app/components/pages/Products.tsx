import { useEffect, useState } from "react";
import { api } from "../../../services/api-client";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  cogs: number;
  shipping: number;
  return_cost: number;
  cod: number;
  packaging: number;
  vat: number;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "", sku: "", price: 0, cogs: 0, shipping: 0,
    return_cost: 0, cod: 0, packaging: 0, vat: 0,
  });

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch {
      // Data table may be empty / no auth — ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setForm({ name: "", sku: "", price: 0, cogs: 0, shipping: 0, return_cost: 0, cod: 0, packaging: 0, vat: 0 });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.updateProduct(editingId, form);
        toast.success("Product updated");
      } else {
        await api.createProduct(form);
        toast.success("Product added");
      }
      resetForm();
      fetchProducts();
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, sku: p.sku || "", price: p.price, cogs: p.cogs,
      shipping: p.shipping, return_cost: p.return_cost, cod: p.cod,
      packaging: p.packaging, vat: p.vat,
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalCost = form.cogs + form.shipping + form.return_cost + form.cod + form.packaging + form.vat;
  const profit = form.price - totalCost;
  const margin = form.price > 0 ? (profit / form.price) * 100 : 0;

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading products...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your catalog and track profitability.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Product Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Wireless Earbuds" />
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={form.sku || ""} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" />
              </div>
              <div>
                <Label>Selling Price (AED)</Label>
                <Input type="number" value={form.price || ""} onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>COGS (AED)</Label>
                  <Input type="number" value={form.cogs || ""} onChange={e => setForm({ ...form, cogs: Number(e.target.value) })} placeholder="30" />
                </div>
                <div>
                  <Label>Shipping (AED)</Label>
                  <Input type="number" value={form.shipping || ""} onChange={e => setForm({ ...form, shipping: Number(e.target.value) })} placeholder="10" />
                </div>
                <div>
                  <Label>Return Cost (AED)</Label>
                  <Input type="number" value={form.return_cost || ""} onChange={e => setForm({ ...form, return_cost: Number(e.target.value) })} placeholder="5" />
                </div>
                <div>
                  <Label>COD Fee (AED)</Label>
                  <Input type="number" value={form.cod || ""} onChange={e => setForm({ ...form, cod: Number(e.target.value) })} placeholder="15" />
                </div>
                <div>
                  <Label>Packaging (AED)</Label>
                  <Input type="number" value={form.packaging || ""} onChange={e => setForm({ ...form, packaging: Number(e.target.value) })} placeholder="3" />
                </div>
                <div>
                  <Label>VAT (AED)</Label>
                  <Input type="number" value={form.vat || ""} onChange={e => setForm({ ...form, vat: Number(e.target.value) })} placeholder="5" />
                </div>
              </div>
              {form.price > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total Cost:</span>
                    <span className="font-medium">AED {totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit:</span>
                    <span className={`font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      AED {profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Margin:</span>
                    <span className={`font-medium ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.name || form.price <= 0}>
                  {editingId ? "Update" : "Save Product"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No products yet</p>
          <p className="text-sm mt-1">Click "Add Product" to start tracking profitability</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map(p => (
            <Card key={p.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-sm text-slate-500">
                  SKU: {p.sku || "N/A"} &middot; AED {p.price?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}