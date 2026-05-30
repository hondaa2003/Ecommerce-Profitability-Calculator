// Demo / mock data for when the Supabase backend is unavailable
// This allows the app to be fully functional without a backend

export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  cogs: number;
  shipping: number;
  return_cost: number;
  cod: number;
  packaging: number;
  vat: number;
  created_at: string;
}

export interface MockOrder {
  id: string;
  product_id: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface MockCampaign {
  id: string;
  name: string;
  platform: string;
  spend: number;
  orders_count: number;
  revenue: number;
  created_at: string;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

const SAMPLE_PRODUCTS: MockProduct[] = [
  { id: "prod-001", name: "Wireless Earbuds Pro", sku: "WEB-001", price: 149, cogs: 45, shipping: 15, return_cost: 8, cod: 12, packaging: 5, vat: 7, created_at: daysAgo(30) },
  { id: "prod-002", name: "Smart Watch Ultra", sku: "SWU-002", price: 299, cogs: 120, shipping: 20, return_cost: 15, cod: 15, packaging: 8, vat: 15, created_at: daysAgo(25) },
  { id: "prod-003", name: "Premium Phone Case", sku: "PPC-003", price: 49, cogs: 8, shipping: 10, return_cost: 3, cod: 10, packaging: 2, vat: 2, created_at: daysAgo(20) },
  { id: "prod-004", name: "Portable Charger 20000mAh", sku: "PC2-004", price: 89, cogs: 25, shipping: 12, return_cost: 5, cod: 10, packaging: 4, vat: 4, created_at: daysAgo(15) },
  { id: "prod-005", name: "Bluetooth Speaker Mini", sku: "BSM-005", price: 79, cogs: 22, shipping: 10, return_cost: 4, cod: 8, packaging: 3, vat: 4, created_at: daysAgo(10) },
  { id: "prod-006", name: "USB-C Hub 7-in-1", sku: "UCH-006", price: 119, cogs: 35, shipping: 12, return_cost: 6, cod: 10, packaging: 4, vat: 6, created_at: daysAgo(5) },
];

const SAMPLE_ORDERS: MockOrder[] = [
  { id: "ord-001", product_id: "prod-001", customer_name: "Ahmed Al-Rashid", amount: 149, status: "Delivered", created_at: daysAgo(3) },
  { id: "ord-002", product_id: "prod-002", customer_name: "Fatima Hassan", amount: 299, status: "Delivered", created_at: daysAgo(2) },
  { id: "ord-003", product_id: "prod-003", customer_name: "Omar Khalid", amount: 49, status: "Pending", created_at: daysAgo(1) },
  { id: "ord-004", product_id: "prod-004", customer_name: "Mona Ibrahim", amount: 89, status: "Delivered", created_at: daysAgo(1) },
  { id: "ord-005", product_id: "prod-001", customer_name: "Youssef Nasser", amount: 149, status: "Returned", created_at: daysAgo(4) },
  { id: "ord-006", product_id: "prod-005", customer_name: "Layla Mahmoud", amount: 79, status: "Delivered", created_at: daysAgo(0) },
  { id: "ord-007", product_id: "prod-006", customer_name: "Khalid Omar", amount: 119, status: "Pending", created_at: daysAgo(0) },
  { id: "ord-008", product_id: "prod-002", customer_name: "Sara Adel", amount: 299, status: "Delivered", created_at: daysAgo(5) },
];

const SAMPLE_CAMPAIGNS: MockCampaign[] = [
  { id: "camp-001", name: "Summer Sale 2024", platform: "Meta", spend: 1200, orders_count: 45, revenue: 4500, created_at: daysAgo(15) },
  { id: "camp-002", name: "Ramadan Special", platform: "Google", spend: 2500, orders_count: 80, revenue: 9800, created_at: daysAgo(12) },
  { id: "camp-003", name: "New Arrival Launch", platform: "TikTok", spend: 800, orders_count: 25, revenue: 2200, created_at: daysAgo(8) },
  { id: "camp-004", name: "Retargeting - Cart Abandoners", platform: "Meta", spend: 450, orders_count: 18, revenue: 1800, created_at: daysAgo(5) },
  { id: "camp-005", name: "Brand Awareness GCC", platform: "Snapchat", spend: 600, orders_count: 12, revenue: 900, created_at: daysAgo(3) },
];

export function getDashboardStats() {
  const totalRevenue = SAMPLE_ORDERS.reduce((s, o) => s + (o.status !== "Returned" ? o.amount : 0), 0);
  const totalOrders = SAMPLE_ORDERS.filter(o => o.status !== "Returned").length;
  const totalSpend = SAMPLE_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  
  const totalCost = SAMPLE_PRODUCTS.reduce((s, p) => {
    const orders = SAMPLE_ORDERS.filter(o => o.product_id === p.id && o.status !== "Returned");
    const costPerUnit = p.cogs + p.shipping + p.return_cost + p.cod + p.packaging + p.vat;
    return s + (costPerUnit * orders.length);
  }, 0);
  
  return {
    summary: {
      total_revenue: totalRevenue,
      total_profit: totalRevenue - totalCost - totalSpend,
      total_roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      total_orders: totalOrders,
    },
  };
}

let productCounter = SAMPLE_PRODUCTS.length + 1;
let orderCounter = SAMPLE_ORDERS.length + 1;
let campaignCounter = SAMPLE_CAMPAIGNS.length + 1;

export const mockApi = {
  getProducts: async (): Promise<MockProduct[]> => [...SAMPLE_PRODUCTS],
  createProduct: async (p: Omit<MockProduct, "id" | "created_at">): Promise<MockProduct> => {
    const product: MockProduct = { id: `prod-${String(productCounter++).padStart(3, "0")}`, ...p, created_at: new Date().toISOString() };
    SAMPLE_PRODUCTS.push(product);
    return product;
  },
  updateProduct: async (id: string, p: Partial<MockProduct>): Promise<MockProduct> => {
    const idx = SAMPLE_PRODUCTS.findIndex(x => x.id === id);
    if (idx === -1) throw new Error("Not found");
    SAMPLE_PRODUCTS[idx] = { ...SAMPLE_PRODUCTS[idx], ...p };
    return SAMPLE_PRODUCTS[idx];
  },
  deleteProduct: async (id: string): Promise<void> => {
    const idx = SAMPLE_PRODUCTS.findIndex(x => x.id === id);
    if (idx !== -1) SAMPLE_PRODUCTS.splice(idx, 1);
  },
  getOrders: async (): Promise<MockOrder[]> => [...SAMPLE_ORDERS],
  createOrder: async (o: Omit<MockOrder, "id" | "created_at">): Promise<MockOrder> => {
    const order: MockOrder = { id: `ord-${String(orderCounter++).padStart(3, "0")}`, ...o, created_at: new Date().toISOString() };
    SAMPLE_ORDERS.push(order);
    return order;
  },
  getCampaigns: async (): Promise<MockCampaign[]> => [...SAMPLE_CAMPAIGNS],
  createCampaign: async (c: Omit<MockCampaign, "id" | "created_at">): Promise<MockCampaign> => {
    const campaign: MockCampaign = { id: `camp-${String(campaignCounter++).padStart(3, "0")}`, ...c, created_at: new Date().toISOString() };
    SAMPLE_CAMPAIGNS.push(campaign);
    return campaign;
  },
  getDashboardStats: async () => getDashboardStats(),
};

// Simulate importing data from a connected platform
export function syncFromIntegration(platform: string): { products: number; orders: number; campaigns: number } {
  const newProducts = [
    { name: `${platform} Artisan Watch`, sku: `${platform.slice(0, 3).toUpperCase()}-010`, price: 189, cogs: 65, shipping: 15, return_cost: 8, cod: 10, packaging: 5, vat: 8 },
    { name: `${platform} Fitness Tracker`, sku: `${platform.slice(0, 3).toUpperCase()}-011`, price: 129, cogs: 40, shipping: 12, return_cost: 6, cod: 9, packaging: 4, vat: 6 },
    { name: `${platform} Wireless Charger`, sku: `${platform.slice(0, 3).toUpperCase()}-012`, price: 59, cogs: 18, shipping: 8, return_cost: 3, cod: 7, packaging: 3, vat: 3 },
  ];
  const results = { products: 0, orders: 0, campaigns: 0 };

  newProducts.forEach(np => {
    if (!SAMPLE_PRODUCTS.some(p => p.sku === np.sku)) {
      SAMPLE_PRODUCTS.push({ id: `prod-${String(productCounter++).padStart(3, "0")}`, ...np, created_at: new Date().toISOString() });
      results.products++;
    }
  });

  // Add a couple of orders for the new products
  const newProds = SAMPLE_PRODUCTS.slice(-3);
  newProds.forEach(np => {
    SAMPLE_ORDERS.push({
      id: `ord-${String(orderCounter++).padStart(3, "0")}`,
      product_id: np.id,
      customer_name: ["Ahmed Ali", "Noor Hassan", "Khalid Omar"][Math.floor(Math.random() * 3)],
      amount: np.price,
      status: "Delivered",
      created_at: new Date().toISOString(),
    });
    results.orders++;
  });

  // Add one campaign
  SAMPLE_CAMPAIGNS.push({
    id: `camp-${String(campaignCounter++).padStart(3, "0")}`,
    name: `${platform} Retargeting Q2`,
    platform: platform,
    spend: 350 + Math.floor(Math.random() * 400),
    orders_count: 8 + Math.floor(Math.random() * 15),
    revenue: 800 + Math.floor(Math.random() * 2000),
    created_at: new Date().toISOString(),
  });
  results.campaigns++;

  return results;
}