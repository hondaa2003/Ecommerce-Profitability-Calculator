import { useEffect, useState } from "react";
import { api } from "../../services/api-client";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await api.deleteProduct(id);
    toast.success("Product deleted");
    fetchProducts();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button>+ Add Product</Button>
      </div>
      <div className="grid gap-4">
        {products.map(p => (
          <Card key={p.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-bold">{p.name}</div>
              <div className="text-sm text-gray-500">SKU: {p.sku || 'N/A'}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
