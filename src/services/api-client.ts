import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://wljecfqzxvojsypqbkzp.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsamVjZnF6eHZvanN5cHFia3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTg5MzIsImV4cCI6MjA5NTgzNDkzMn0.DXa7tAeiGX0eyGoCcY0_1DTrMJi3-zh8TjDCZxUv35A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class ApiClient {
  private async getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return user.id;
  }

  async getProducts() {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("products").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createProduct(p: any) {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("products").insert([{ ...p, user_id: userId }]).select();
    if (error) throw error;
    return data?.[0];
  }

  async updateProduct(id: string, p: any) {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("products").update(p).eq("id", id).eq("user_id", userId).select();
    if (error) throw error;
    return data?.[0];
  }

  async deleteProduct(id: string) {
    const userId = await this.getUserId();
    const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }

  async getOrders() {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("orders").select("*, products(name)").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createOrder(o: any) {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("orders").insert([{ ...o, user_id: userId }]).select();
    if (error) throw error;
    return data?.[0];
  }

  async updateOrder(id: string, o: any) {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("orders").update(o).eq("id", id).eq("user_id", userId).select();
    if (error) throw error;
    return data?.[0];
  }

  async deleteOrder(id: string) {
    const userId = await this.getUserId();
    const { error } = await supabase.from("orders").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }

  async getCampaigns() {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("campaigns").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createCampaign(c: any) {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("campaigns").insert([{ ...c, user_id: userId }]).select();
    if (error) throw error;
    return data?.[0];
  }

  async updateCampaign(id: string, c: any) {
    const userId = await this.getUserId();
    const { data, error } = await supabase.from("campaigns").update(c).eq("id", id).eq("user_id", userId).select();
    if (error) throw error;
    return data?.[0];
  }

  async deleteCampaign(id: string) {
    const userId = await this.getUserId();
    const { error } = await supabase.from("campaigns").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }

  async getDashboardStats() {
    const userId = await this.getUserId();
    const { data: ordersData } = await supabase.from("orders").select("amount, product_id, status").eq("user_id", userId);
    const { data: productsData } = await supabase.from("products").select("id, cogs, shipping, return_cost, cod, packaging, vat, name").eq("user_id", userId);
    const { data: campaignsData } = await supabase.from("campaigns").select("spend, revenue").eq("user_id", userId);

    const productMap = new Map((productsData || []).map((p: any) => [p.id, p]));
    let totalRev = 0, totalCost = 0, totalOrders = 0, deliveredOrders = 0;
    const productPerformance = new Map<string, { name: string; revenue: number; profit: number; count: number }>();

    (ordersData || []).forEach((o: any) => {
      totalOrders++;
      if (o.status === "Delivered") {
        deliveredOrders++;
        totalRev += o.amount;
        const p = productMap.get(o.product_id);
        if (p) {
          const cost = (p.cogs || 0) + (p.shipping || 0) + (p.return_cost || 0) + (p.cod || 0) + (p.packaging || 0) + (p.vat || 0);
          totalCost += cost;
          const perf = productPerformance.get(o.product_id) || { name: p.name || "Unknown", revenue: 0, profit: 0, count: 0 };
          perf.revenue += o.amount;
          perf.profit += (o.amount - cost);
          perf.count++;
          productPerformance.set(o.product_id, perf);
        }
      }
    });

    const totalSpend = (campaignsData || []).reduce((s: number, c: any) => s + (c.spend || 0), 0);
    const campRev = (campaignsData || []).reduce((s: number, c: any) => s + (c.revenue || 0), 0);

    return {
      summary: {
        total_revenue: totalRev,
        total_profit: totalRev - totalCost - totalSpend,
        total_orders: totalOrders,
        delivered_rate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
        total_spend: totalSpend,
        total_roas: totalSpend > 0 ? campRev / totalSpend : 0,
        avg_order_value: deliveredOrders > 0 ? totalRev / deliveredOrders : 0,
      },
      top_products: Array.from(productPerformance.values()).sort((a, b) => b.profit - a.profit).slice(0, 5),
    };
  }

  async importProducts(items: any[]) {
    const userId = await this.getUserId();
    const rows = items.map((p) => ({
      user_id: userId,
      name: p.name,
      sku: p.sku || null,
      price: Number(p.price) || 0,
      cogs: Number(p.cogs) || 0,
      shipping: Number(p.shipping) || 0,
      return_cost: Number(p.return_cost) || 0,
      cod: Number(p.cod) || 0,
      packaging: Number(p.packaging) || 0,
      vat: Number(p.vat) || 0,
    }));
    const { error } = await supabase.from("products").insert(rows);
    if (error) throw error;
  }

  async importOrders(items: any[]) {
    const userId = await this.getUserId();
    const rows = items.map((o) => ({
      user_id: userId,
      product_id: o.product_id || null,
      customer_name: o.customer_name || null,
      amount: Number(o.amount) || 0,
      cost: Number(o.cost) || 0,
      status: o.status || "Pending",
    }));
    const { error } = await supabase.from("orders").insert(rows);
    if (error) throw error;
  }

  async importCampaigns(items: any[]) {
    const userId = await this.getUserId();
    const rows = items.map((c) => ({
      user_id: userId,
      name: c.name,
      platform: c.platform || "manual",
      spend: Number(c.spend) || 0,
      revenue: Number(c.revenue) || 0,
      impressions: Number(c.impressions) || 0,
      clicks: Number(c.clicks) || 0,
      orders_count: Number(c.orders_count) || 0,
    }));
    const { error } = await supabase.from("campaigns").insert(rows);
    if (error) throw error;
  }
}

export const api = new ApiClient();