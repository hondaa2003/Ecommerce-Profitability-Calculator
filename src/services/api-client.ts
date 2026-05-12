import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/server`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class ApiClient {
  private async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: any) {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`${EDGE_FUNCTION_URL}${endpoint}`, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'API Error');
    }
    return res.json() as Promise<T>;
  }

  async getProducts() { return this.request<any[]>('GET', '/products'); }
  async createProduct(p: any) { return this.request<any>('POST', '/products', p); }
  async updateProduct(id: string, p: any) { return this.request<any>('PUT', `/products/${id}`, p); }
  async deleteProduct(id: string) { return this.request<any>('DELETE', `/products/${id}'); }

  async getOrders() { return this.request<any[]>('GET', '/orders'); }
  async createOrder(o: any) { return this.request<any>('POST', '/orders', o); }

  async getCampaigns() { return this.request<any[]>('GET', '/campaigns'); }
  async createCampaign(c: any) { return this.request<any>('POST', '/campaigns', c); }

  async getDashboardStats() { return this.request<any>('GET', '/dashboard-stats'); }
}

export const api = new ApiClient();
