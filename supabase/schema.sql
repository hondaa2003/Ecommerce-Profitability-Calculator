-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    url TEXT,
    sku TEXT,
    cogs NUMERIC DEFAULT 0,
    shipping NUMERIC DEFAULT 0,
    return_cost NUMERIC DEFAULT 0,
    cod NUMERIC DEFAULT 0,
    packaging NUMERIC DEFAULT 0,
    vat NUMERIC DEFAULT 5,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    customer_name TEXT,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending', -- Pending, Delivered, Returned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    platform TEXT, -- Facebook, TikTok, Google, etc.
    spend NUMERIC DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own products" ON products
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own orders" ON orders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id);
