import { createClient } from "@supabase/supabase-js";
import { mockApi } from "./mock-data";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cjteefcgtjvgxephwznm.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdGVlZmNndGp2Z3hlcGh3em5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYxNTksImV4cCI6MjA5MzczMjE1OX0.U9BvJx4q_3Ah_G1BbCHGgQ2qjCW6ooG5YJQKgvFKJwY";
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/server`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Track whether we're in demo/offline mode
let useMockData = false;

function enableMockIfNeeded(err: any) {
  // If we get a network error or the edge function is unreachable, switch to mock data
  if (!useMockData) {
    console.warn("Backend unavailable, switching to demo mode with sample data:", err?.message || err);
    useMockData = true;
  }
}

class ApiClient {
  private async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${EDGE_FUNCTION_URL}${endpoint}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "API Error");
      }
      return res.json() as Promise<T>;
    } catch (err: any) {
      enableMockIfNeeded(err);
      throw err; // Re-throw so callers can fall back
    }
  }

  async getProducts() {
    try { return await this.request<any[]>("GET", "/products"); }
    catch { return mockApi.getProducts(); }
  }
  async createProduct(p: any) {
    try { return await this.request<any>("POST", "/products", p); }
    catch { return mockApi.createProduct(p); }
  }
  async updateProduct(id: string, p: any) {
    try { return await this.request<any>("PUT", `/products/${id}`, p); }
    catch { return mockApi.updateProduct(id, p); }
  }
  async deleteProduct(id: string) {
    try { return await this.request<any>("DELETE", `/products/${id}`); }
    catch { mockApi.deleteProduct(id); }
  }

  async getOrders() {
    try { return await this.request<any[]>("GET", "/orders"); }
    catch { return mockApi.getOrders(); }
  }
  async createOrder(o: any) {
    try { return await this.request<any>("POST", "/orders", o); }
    catch { return mockApi.createOrder(o); }
  }

  async getCampaigns() {
    try { return await this.request<any[]>("GET", "/campaigns"); }
    catch { return mockApi.getCampaigns(); }
  }
  async createCampaign(c: any) {
    try { return await this.request<any>("POST", "/campaigns", c); }
    catch { return mockApi.createCampaign(c); }
  }

  async getDashboardStats() {
    try { return await this.request<any>("GET", "/dashboard-stats"); }
    catch { return mockApi.getDashboardStats(); }
  }
}

export const api = new ApiClient();