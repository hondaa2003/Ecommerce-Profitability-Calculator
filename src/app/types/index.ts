// Global TypeScript interfaces for ProfitPilot
// No 'any' types — use these everywhere

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'agency';
  is_admin: boolean;
  agency_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  user_id: string;
  platform: 'salla' | 'zid' | 'shopify' | 'woocommerce' | 'manual';
  store_name: string;
  store_url: string;
  is_active: boolean;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  cogs: number;
  shipping: number;
  return_cost: number;
  cod: number;
  packaging: number;
  vat: number;
  sku: string | null;
  image: string | null;
  url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  store_id: string | null;
  external_id: string | null;
  product_id: string | null;
  amount: number;
  cost: number;
  status: 'Pending' | 'Delivered' | 'Returned';
  customer_name: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat' | 'manual';
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  orders_count: number;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  store_id: string | null;
  external_id: string | null;
  platform: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  last_order_at: string | null;
  first_order_at: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  type: 'warning' | 'opportunity' | 'tip' | 'achievement';
  metric: string;
}

export interface AIInsightResponse {
  summary: string;
  health_score: number;
  insights: AIInsight[];
  generated_at: string;
}

export interface AgencyClient {
  id: string;
  agency_id: string;
  client_user_id: string | null;
  client_name: string;
  client_email: string;
  access_level: 'view' | 'edit' | 'full';
  status: 'pending' | 'active' | 'inactive';
  invited_at: string;
  accepted_at: string | null;
}