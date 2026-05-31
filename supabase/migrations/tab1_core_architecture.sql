-- TAB 1: Core Architecture Migration
-- Run in Supabase SQL Editor

-- 1A: Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  is_admin BOOLEAN DEFAULT false,
  agency_id UUID,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

-- 1B: Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 1C: Add missing columns to existing tables
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id),
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id),
  ADD COLUMN IF NOT EXISTS external_id TEXT;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS impressions INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'meta';

-- 1D: Make first user admin (replace with your email)
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE');