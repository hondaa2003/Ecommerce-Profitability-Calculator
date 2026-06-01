-- Meta Ads Integration Migration
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/wljecfqzxvojsypqbkzp/sql/new

-- 1. Meta connections table
CREATE TABLE IF NOT EXISTS meta_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own meta connection" ON meta_connections;
CREATE POLICY "Users see own meta connection" ON meta_connections
    FOR ALL USING (auth.uid() = user_id);

-- 2. Campaigns table: add impressions and clicks columns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS impressions INT DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS clicks INT DEFAULT 0;

-- 3. Campaigns table: unique constraint for upsert by user_id, name, platform
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campaigns_user_name_platform_unique') THEN
    ALTER TABLE campaigns ADD CONSTRAINT campaigns_user_name_platform_unique UNIQUE (user_id, name, platform);
  END IF;
END $$;