import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Edit3, ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { api } from "../api";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import { getSupabase } from "../supabase-client";

interface ProductForm {
  name: string;
  image: string;
  url: string;
  sku: string;
  cogs: number;
  shipping: number;
  returnCost: number;
  cod: number;
  packaging: number;
  vat: number;
  price: number;
}

function calculate(p: ProductForm) {
  const vatAmount = (p.price * p.vat) / 100;
  const totalCost = p.cogs + p.shipping + p.returnCost + p.cod + p.packaging + vatAmount;
  const profit = p.price - totalCost;
  const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
  const breakEvenRoas = profit > 0 ? p.price / profit : 0;
  return { profit, margin, breakEvenRoas, totalCost };
}

function statusOf(margin: number): { label: string; classes: string } {
  if (margin >= 15) return { label: "Winning", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  if (margin >= 0) return { label: "Break-even", classes: "bg-blue-50 text-blue-700 border-blue-100" };
  return { label: "Losing", classes: "bg-orange-50 text-orange-700 border-orange-100" };
}

const emptyForm: ProductForm = {
  name: "", image: "", url: "", sku: "", cogs: 0, shipping: 0, returnCost: 0, cod: 0, packaging: 0, vat: 5, price: 0,
};

type Product = ProductForm & { id: string };

export function Products() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const calc = useMemo(() => calculate(form), [form]);

  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const numberInput = (k: keyof ProductForm) => (
    <Input
      type="number"
      value={form[k] as number}
      onChange={(e) => set(k, Number(e.target.value) as any)}
      className="bg-slate-50 border-slate-200"
    />
  );

  // Load products from server
  useEffect(() => {
    (async () => {
      try {
        const items = await api.list<Product>("products");
        setProducts(items);
      } catch (err) {
        console.error("Failed to load products:", err);
        toast.error("Could not load products from server");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = getSupabase();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      set("image", data.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error("Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const addProduct = async () => {
    if (!form.name) {
      toast.error("Product name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const item = await api.update<Product>("products", editingId, form);
        setProducts((p) => p.map((x) => (x.id === editingId ? item : x)));
        toast.success("Product updated");
      } else {
        const item = await api.create<Product>("products", form);
        setProducts((p) => [item, ...p]);
        toast.success("Product saved");
      }
      setForm(emptyForm);
      setEditingId(null);
      setOpen(false);
    } catch (err) {
      console.error("Failed to save product:", err);
      toast.error("Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product: Product) => {
    setForm(product);
    setEditingId(product.id);
    setOpen(true);
  };

  const deleteProduct = async (id: string) => {
    const previous = products;
    setProducts((arr) => arr.filter((x) => x.id !== id));
    try {
      await api.remove("products", id);
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Could not delete product");
      setProducts(previous);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>Products</h1>
          <p className="text-slate-500 text-sm">Manage your catalog and auto-calculate profitability per product.</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-5 mt-2">
              <div className="space-y-3">
                <Field label="Product Name">
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Smart Watch X" />
                </Field>
                <Field label="Product URL">
                  <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="store.ae/product" />
                </Field>
                <Field label="SKU" tip={tips.sku}>
                  <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SW-X-001" />
                </Field>
                <Field label="Product Image">
                  <div className="space-y-2">
                    {form.image && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-100">
                        <img src={form.image} alt="Product" className="w-full h-full object-cover" />
                        <button
                          onClick={() => set("image", "")}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-slate-400 transition-colors">
                      <Upload className="w-5 h-5 mb-1" />
                      <div className="text-xs">
                        {uploading ? "Uploading..." : "Click to upload image"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </Field>
                <Field label="Selling Price (AED)" tip={tips.sellingPrice}>{numberInput("price")}</Field>
              </div>

              <div className="space-y-3">
                <Field label="COGS (AED)" tip={tips.cogs}>{numberInput("cogs")}</Field>
                <Field label="Shipping Cost (AED)" tip={tips.shipping}>{numberInput("shipping")}</Field>
                <Field label="Return Cost (AED)" tip={tips.returnCost}>{numberInput("returnCost")}</Field>
                <Field label="COD Fees (AED)" tip={tips.cod}>{numberInput("cod")}</Field>
                <Field label="Packaging Fees (AED)" tip={tips.packaging}>{numberInput("packaging")}</Field>
                <Field label="VAT (%)" tip={tips.vat}>{numberInput("vat")}</Field>
              </div>
            </div>

            {/* Live calc */}
            <Card className="mt-4 p-4 bg-slate-50 border-slate-200 rounded-xl">
              <div className="text-sm text-slate-600 mb-3">Auto Profit Calculator</div>
              <div className="grid grid-cols-4 gap-3">
                <Stat label="Total Cost" value={`AED ${calc.totalCost.toFixed(0)}`} />
                <Stat label="Profit / Order" value={`AED ${calc.profit.toFixed(0)}`} tip={tips.netProfit} color="emerald" />
                <Stat label="Margin" value={`${calc.margin.toFixed(1)}%`} tip={tips.margin} color="blue" />
                <Stat label="Break-even ROAS" value={`${calc.breakEvenRoas.toFixed(2)}x`} tip={tips.breakEvenRoas} color="orange" />
              </div>
            </Card>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button className="bg-blue-700 hover:bg-blue-800" onClick={addProduct} disabled={saving || uploading}>
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                {editingId ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead><span className="inline-flex items-center gap-1">SKU <InfoTip tipKey="sku" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Price <InfoTip tipKey="sellingPrice" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Profit <InfoTip tipKey="netProfit" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">Margin <InfoTip tipKey="margin" /></span></TableHead>
              <TableHead><span className="inline-flex items-center gap-1">B/E ROAS <InfoTip tipKey="breakEvenRoas" /></span></TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {t("empty.loading")}…
                </TableCell>
              </TableRow>
            )}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 mb-1">{t("empty.noProducts")}</div>
                      <div className="text-sm text-slate-500">{t("empty.noProductsSub")}</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && products.map((p) => {
              const c = calculate(p);
              const status = statusOf(c.margin);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-slate-900 text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.url}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{p.sku}</TableCell>
                  <TableCell>AED {p.price}</TableCell>
                  <TableCell className={c.profit >= 0 ? "text-emerald-600 font-medium" : "text-orange-600 font-medium"}>
                    {c.profit >= 0 ? "+" : "-"}AED {Math.abs(c.profit).toFixed(0)}
                  </TableCell>
                  <TableCell className="font-medium">{c.margin.toFixed(1)}%</TableCell>
                  <TableCell>{c.breakEvenRoas.toFixed(2)}x</TableCell>
                  <TableCell>
                    <Badge className={`${status.classes} hover:${status.classes} border`}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-700" onClick={() => startEdit(p)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-700"
                      onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Field({ label, tip, children }: { label: string; tip?: { title: string; content: string }; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-slate-700 mb-1 flex items-center gap-1 font-medium">
        {label}
        {tip && <InfoTip {...tip} />}
      </Label>
      {children}
    </div>
  );
}

function Stat({ label, value, tip, color }: { label: string; value: string; tip?: any; color?: string }) {
  const palette: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div className={`rounded-lg p-3 ${color ? palette[color] : "bg-white border border-slate-200"}`}>
      <div className="text-xs flex items-center gap-1 opacity-80 font-medium">
        {label}{tip && <InfoTip {...tip} />}
      </div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
