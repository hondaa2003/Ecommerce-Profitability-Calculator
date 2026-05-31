import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://wljecfqzxvojsypqbkzp.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsamVjZnF6eHZvanN5cHFia3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTg5MzIsImV4cCI6MjA5NTgzNDkzMn0.DXa7tAeiGX0eyGoCcY0_1DTrMJi3-zh8TjDCZxUv35A";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return supabaseClient;
}

export const supabase = getSupabaseClient();

async function apiRequest<T>(method: string, endpoint: string, body?: any): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/server${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "API Error");
  }
  return res.json() as Promise<T>;
}

export const productsApi = {
  list: () => apiRequest<any[]>("GET", "/products"),
  create: (p: any) => apiRequest<any>("POST", "/products", p),
  update: (id: string, p: any) => apiRequest<any>("PUT", `/products/${id}`, p),
  delete: (id: string) => apiRequest<any>("DELETE", `/products/${id}`),
};

export const ordersApi = {
  list: () => apiRequest<any[]>("GET", "/orders"),
  create: (o: any) => apiRequest<any>("POST", "/orders", o),
};

export const campaignsApi = {
  list: () => apiRequest<any[]>("GET", "/campaigns"),
  create: (c: any) => apiRequest<any>("POST", "/campaigns", c),
};
