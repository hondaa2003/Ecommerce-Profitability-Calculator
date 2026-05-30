import { createClient } from "@supabase/supabase-js";
import { mockApi } from "./mock-data";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cjteefcgtjvgxephwznm.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdGVlZmNndGp2Z3hlcGh3em5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYxNTksImV4cCI6MjA5MzczMjE1OX0.U9BvJx4q_3Ah_G1BbCHGgQ2qjCW6ooG5YJQKgvFKJwY";
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/server`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function isDemoMode(): boolean {
  return localStorage.getItem("demo_mode") === "true";
}

let backendAvailable = true;

class ApiClient {
  private async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    if (isDemoMode() || !backendAvailable) {
      throw new Error("Using mock data");
    }
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
  }

  private mockCatch<T>(fn: () => Promise<T>, mockFn: () => Promise<T>): Promise<T> {
    return fn().catch(() => {
      if (backendAvailable) {
        backendAvailable = false;
      }
      return mockFn();
    });
  }

  async getProducts() { return this.mockCatch(() => this.request<any[]>("GET", "/products"), () => mockApi.getProducts()); }
  async createProduct(p: any) { return this.mockCatch(() => this.request<any>("POST", "/products", p), () => mockApi.createProduct(p)); }
  async updateProduct(id: string, p: any) { return this.mockCatch(() => this.request<any>("PUT", `/products/${id}`, p), () => mockApi.updateProduct(id, p)); }
  async deleteProduct(id: string) { return this.mockCatch(() => this.request<any>("DELETE", `/products/${id}`), async () => { mockApi.deleteProduct(id); }); }

  async getOrders() { return this.mockCatch(() => this.request<any[]>("GET", "/orders"), () => mockApi.getOrders()); }
  async createOrder(o: any) { return this.mockCatch(() => this.request<any>("POST", "/orders", o), () => mockApi.createOrder(o)); }

  async getCampaigns() { return this.mockCatch(() => this.request<any[]>("GET", "/campaigns"), () => mockApi.getCampaigns()); }
  async createCampaign(c: any) { return this.mockCatch(() => this.request<any>("POST", "/campaigns", c), () => mockApi.createCampaign(c)); }

  async getDashboardStats() { return this.mockCatch(() => this.request<any>("GET", "/dashboard-stats"), () => mockApi.getDashboardStats()); }
}

export const api = new ApiClient();