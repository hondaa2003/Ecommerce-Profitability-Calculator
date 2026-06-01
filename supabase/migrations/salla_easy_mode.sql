-- Salla Easy Mode Integration Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wljecfqzxvojsypqbkzp/sql/new

-- 1. Create stores table if not exists (with nullable user_id for Easy Mode)
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT DEFAULT 'salla',
    store_id TEXT,
    store_name TEXT,
    store_url TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- 2. Allow user_id to be NULL for Easy Mode (merchant installs first, links later)
ALTER TABLE stores ALTER COLUMN user_id DROP NOT NULL;

-- 3. Ensure store_name can be nullable
ALTER TABLE stores ALTER COLUMN store_name DROP NOT NULL;

-- 4. Ensure orders table has store linking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_id TEXT;

-- 5. Create unique index on external_id for upsert deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_external_id ON orders(external_id) WHERE external_id IS NOT NULL;

-- 6. Enable RLS and create policy
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own stores" ON stores;
CREATE POLICY "Users manage own stores" ON stores
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);