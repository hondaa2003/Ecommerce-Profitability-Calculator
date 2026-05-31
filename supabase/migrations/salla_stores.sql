-- Connected stores table for OAuth integrations (Salla, Shopify, Zid, etc.)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'salla',
  store_id TEXT,
  store_name TEXT,
  store_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own stores"
  ON stores FOR ALL
  USING (auth.uid() = user_id);

-- Link orders to a store
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_id TEXT;

-- User profiles table (referenced by AppShell and Settings)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  store_name TEXT,
  store_url TEXT,
  currency TEXT DEFAULT 'AED',
  default_vat NUMERIC DEFAULT 5,
  default_shipping NUMERIC DEFAULT 0,
  default_cod_fee NUMERIC DEFAULT 0,
  default_packaging NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id);