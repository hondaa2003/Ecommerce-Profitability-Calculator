-- Salla Easy Mode Integration Migration
-- Run this in Supabase SQL Editor

-- 1. Add store_id column to stores table (Salla merchant ID)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_id TEXT;

-- 2. Allow user_id to be NULL (merchant installs first, links later)
ALTER TABLE stores ALTER COLUMN user_id DROP NOT NULL;

-- 3. Remove NOT NULL from store_name (will be set during auth)
ALTER TABLE stores ALTER COLUMN store_name DROP NOT NULL;

-- 4. Add unique constraint per user per platform
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_user_platform_unique') THEN
    ALTER TABLE stores ADD CONSTRAINT stores_user_platform_unique UNIQUE (user_id, platform);
  END IF;
END $$;

-- 5. Orders columns should already exist from schema.sql, but ensure:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_id TEXT;

-- 6. RLS Policy for stores (re-create to be safe)
DROP POLICY IF EXISTS "Users manage own stores" ON stores;
CREATE POLICY "Users manage own stores" ON stores
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);