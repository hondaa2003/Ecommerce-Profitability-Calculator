import { useEffect, useState } from "react";
import { api } from "../../../services/api-client";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "../i18n";
import { formatCurrencyDecimal, getCurrency } from "../../../services/currency-store";

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

function numVal(v: number): string {
  return v === 0 ? "0" : v ? String(v) : "";
}

export function Products() {
  const { t, dir } = useI18n();
  const curr = getCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "", sku: "", price: 0, cogs: 0, shipping: 0,
    return_cost: 0, cod: 0, packaging: 0, vat: 0,
  });

  const fetchProducts = async () => {
    try { setProducts(await api.getProducts()); }
    catch { toast.error(t("products.sub")); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setForm({ name: "", sku: "", price: 0, cogs: 0, shipping: 0, return_cost: 0, cod: 0, packaging: 0, vat: 0 });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) { await api.updateProduct(editingId, form); toast.success(t("products.save")); }
      else { await api.createProduct(form); toast.success(t("products.add")); }
      resetForm();
      fetchProducts();
    } catch { toast.error(t("products.sub")); }
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, sku: p.sku || "", price: p.price, cogs: p.cogs, shipping: p.shipping, return_cost: p.return_cost, cod: p.cod, packaging: p.packaging, vat: p.vat });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("products.cancel"))) return;
    try { await api.deleteProduct(id); toast.success(t("products.save")); fetchProducts(); }
    catch { toast.error(t("products.sub")); }
  };

  const totalCost = form.cogs + form.shipping + form.return_cost + form.cod + form.packaging + form.vat;
  const profit = form.price - totalCost;
  const margin = form.price > 0 ? (profit / form.price) * 100 : 0;

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">{t("empty.loading")}</div>;

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("products.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("products.sub")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 me-1" /> {t("products.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? t("products.edit") || "Edit Product" : t("products.addNew")}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div><Label>{t("products.name")}</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Wireless Earbuds" /></div>
              <div><Label>{t("products.sku")}</Label><Input value={form.sku || ""} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" /></div>
              <div><Label>{t("products.sellingPrice")} ({curr})</Label><Input type="number" value={numVal(form.price)} onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="100" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("products.cogs")} ({curr})</Label><Input type="number" value={numVal(form.cogs)} onChange={e => setForm({ ...form, cogs: Number(e.target.value) })} placeholder="30" /></div>
                <div><Label>{t("products.shipping")} ({curr})</Label><Input type="number" value={numVal(form.shipping)} onChange={e => setForm({ ...form, shipping: Number(e.target.value) })} placeholder="10" /></div>
                <div><Label>{t("products.returnCost")} ({curr})</Label><Input type="number" value={numVal(form.return_cost)} onChange={e => setForm({ ...form, return_cost: Number(e.target.value) })} placeholder="5" /></div>
                <div><Label>{t("products.cod")} ({curr})</Label><Input type="number" value={numVal(form.cod)} onChange={e => setForm({ ...form, cod: Number(e.target.value) })} placeholder="15" /></div>
                <div><Label>{t("products.packaging")} ({curr})</Label><Input type="number" value={numVal(form.packaging)} onChange={e => setForm({ ...form, packaging: Number(e.target.value) })} placeholder="3" /></div>
                <div><Label>{t("products.vat")} ({curr})</Label><Input type="number" value={numVal(form.vat)} onChange={e => setForm({ ...form, vat: Number(e.target.value) })} placeholder="5" /></div>
              </div>
              {form.price > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-1">
                  <div className="flex justify-between text-sm"><span>{t("products.totalCost")}:</span><span className="font-medium">{formatCurrencyDecimal(totalCost)}</span></div>
                  <div className="flex justify-between text-sm"><span>{t("kpi.profit")}:</span><span className={`font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrencyDecimal(profit)}</span></div>
                  <div className="flex justify-between text-sm"><span>{t("kpi.margin")}:</span><span className={`font-medium ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>{margin.toFixed(1)}%</span></div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>{t("products.cancel")}</Button>
                <Button onClick={handleSave} disabled={!form.name || form.price <= 0}>{editingId ? t("products.save") : t("products.addNew")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><p className="text-lg">{t("empty.noProducts")}</p><p className="text-sm mt-1">{t("empty.noProductsSub")}</p></div>
      ) : (
        <div className="grid gap-4">
          {products.map(p => {
            const cost = p.cogs + p.shipping + p.return_cost + p.cod + p.packaging + p.vat;
            const pProfit = p.price - cost;
            return (
              <Card key={p.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm text-slate-500">SKU: {p.sku || "N/A"} &middot; {formatCurrencyDecimal(p.price || 0)} &middot; <span className={pProfit >= 0 ? "text-green-600" : "text-red-600"}>Profit: {formatCurrencyDecimal(pProfit)}</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}