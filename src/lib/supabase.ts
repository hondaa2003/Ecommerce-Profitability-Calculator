// src/lib/supabase.ts
// Single source of truth for Supabase client and API access
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use environment variables with fallback for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cjteefcgtjvgxephwznm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdGVlZmNndGp2Z3hlcGh3em5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYxNTksImV4cCI6MjA5MzczMjE1OX0.U9BvJx4q_3Ah_G1BbCHGgQ2qjCW6ooG5YJQKgvFKJwY';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return supabaseClient;
}

// Singleton supabase instance for direct use (App.tsx, Auth.tsx)
export const supabase = getSupabaseClient();

// --- API helpers for Reports.tsx ---

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return session.access_token;
}

async function apiRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: any): Promise<T> {
  const token = await getAuthToken();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/server${endpoint}`, {
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

export const productsApi = {
  list: () => apiRequest<any[]>('GET', '/products'),
  create: (p: any) => apiRequest<any>('POST', '/products', p),
  update: (id: string, p: any) => apiRequest<any>('PUT', `/products/${id}`, p),
  delete: (id: string) => apiRequest<any>('DELETE', `/products/${id}`),
};

export const ordersApi = {
  list: () => apiRequest<any[]>('GET', '/orders'),
  create: (o: any) => apiRequest<any>('POST', '/orders', o),
};

export const campaignsApi = {
  list: () => apiRequest<any[]>('GET', '/campaigns'),
  create: (c: any) => apiRequest<any>('POST', '/campaigns', c),
};