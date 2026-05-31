import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts'
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const app = new Hono()

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.replace('Bearer ', '')
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  if (error || !user) return c.json({ error: 'Unauthorized' }, 401)
  c.set('user', user.id)
  await next()
}

// --- PRODUCTS ---
app.get('/products', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('products').select('*').eq('user_id', user_id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.post('/products', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const body = await c.req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('products').insert([{ ...body, user_id }]).select()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data[0], 201)
})

app.put('/products/:id', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('products').update(body).eq('id', id).eq('user_id', user_id).select()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data[0])
})

app.delete('/products/:id', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const id = c.req.param('id')
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user_id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ message: 'Deleted' })
})

// --- ORDERS ---
app.get('/orders', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('orders').select('*, products(*)').eq('user_id', user_id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.post('/orders', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const body = await c.req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('orders').insert([{ ...body, user_id }]).select()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data[0], 201)
})

// --- CAMPAIGNS ---
app.get('/campaigns', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('campaigns').select('*').eq('user_id', user_id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.post('/campaigns', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const body = await c.req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.from('campaigns').insert([{ ...body, user_id }]).select()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data[0], 201)
})

// --- DASHBOARD STATS ---
app.get('/dashboard-stats', authMiddleware, async (c) => {
  const user_id = c.get('user')
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  
  const { data: ordersData } = await supabase.from('orders').select('amount, product_id, status').eq('user_id', user_id)
  const { data: productsData } = await supabase.from('products').select('id, cogs, shipping, return_cost, cod, packaging, vat, name').eq('user_id', user_id)
  const { data: campaignsData } = await supabase.from('campaigns').select('spend, revenue').eq('user_id', user_id)

  const productMap = new Map(productsData?.map(p => [p.id, p]))
  let totalRev = 0, totalCost = 0, totalOrders = 0, deliveredOrders = 0
  
  const productPerformance = new Map()

  ordersData?.forEach(o => {
    totalOrders++
    if (o.status === 'Delivered') {
      deliveredOrders++
      totalRev += o.amount
      const p = productMap.get(o.product_id)
      if (p) {
        const cost = (p.cogs + p.shipping + p.return_cost + p.cod + p.packaging + p.vat)
        totalCost += cost
        
        const perf = productPerformance.get(o.product_id) || { name: p.name, revenue: 0, profit: 0, count: 0 }
        perf.revenue += o.amount
        perf.profit += (o.amount - cost)
        perf.count++
        productPerformance.set(o.product_id, perf)
      }
    }
  })

  const totalSpend = campaignsData?.reduce((s, c) => s + c.spend, 0) || 0
  const campRev = campaignsData?.reduce((s, c) => s + c.revenue, 0) || 0

  const topProducts = Array.from(productPerformance.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)

  return c.json({
    summary: {
      total_revenue: totalRev,
      total_profit: totalRev - totalCost - totalSpend,
      total_orders: totalOrders,
      delivered_rate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
      total_spend: totalSpend,
      total_roas: totalSpend > 0 ? campRev / totalSpend : 0,
      avg_order_value: deliveredOrders > 0 ? totalRev / deliveredOrders : 0
    },
    top_products: topProducts
  })
})

serve(app.fetch)
