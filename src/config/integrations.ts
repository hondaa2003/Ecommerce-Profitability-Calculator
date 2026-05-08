/**
 * Integration Configuration for ProfitPilot
 * Defines all supported platforms and their API endpoints
 */

export interface IntegrationConfig {
  id: string;
  name: string;
  category: 'store' | 'ads' | 'accounting';
  icon: string;
  description: string;
  enabled: boolean;
  comingSoon: boolean;
  documentation: string;
  scopes: string[];
  rateLimit: number; // requests per minute
  syncInterval: number; // minutes
}

// Store Integrations (E-commerce Platforms)
export const STORE_INTEGRATIONS: Record<string, IntegrationConfig> = {
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    category: 'store',
    icon: '🛒',
    description: 'Connect your Shopify store to sync products, orders, and inventory',
    enabled: false,
    comingSoon: true,
    documentation: 'https://shopify.dev/api/admin-rest',
    scopes: ['read_products', 'read_orders', 'read_inventory'],
    rateLimit: 2,
    syncInterval: 60,
  },
  salla: {
    id: 'salla',
    name: 'سلة (Salla)',
    category: 'store',
    icon: '🏪',
    description: 'ربط متجرك من سلة لمزامنة المنتجات والطلبات',
    enabled: false,
    comingSoon: true,
    documentation: 'https://docs.salla.dev',
    scopes: ['products:read', 'orders:read', 'inventory:read'],
    rateLimit: 2,
    syncInterval: 60,
  },
  zid: {
    id: 'zid',
    name: 'زد (Zid)',
    category: 'store',
    icon: '🎯',
    description: 'ربط متجرك من زد لمزامنة البيانات تلقائياً',
    enabled: false,
    comingSoon: true,
    documentation: 'https://developer.zid.sa',
    scopes: ['products:read', 'orders:read', 'inventory:read'],
    rateLimit: 2,
    syncInterval: 60,
  },
  woocommerce: {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'store',
    icon: '🌐',
    description: 'Connect your WooCommerce store via WordPress',
    enabled: false,
    comingSoon: true,
    documentation: 'https://woocommerce.com/document/rest-api/',
    scopes: ['read_products', 'read_orders', 'read_inventory'],
    rateLimit: 10,
    syncInterval: 60,
  },
};

// Advertising Platform Integrations
export const ADS_INTEGRATIONS: Record<string, IntegrationConfig> = {
  meta: {
    id: 'meta',
    name: 'Meta Ads',
    category: 'ads',
    icon: 'f',
    description: 'Connect your Meta (Facebook/Instagram) ad accounts for campaign tracking',
    enabled: false,
    comingSoon: true,
    documentation: 'https://developers.facebook.com/docs/marketing-api',
    scopes: ['ads_read', 'campaigns_read', 'insights_read'],
    rateLimit: 10,
    syncInterval: 360, // 6 hours
  },
  google: {
    id: 'google',
    name: 'Google Ads',
    category: 'ads',
    icon: 'G',
    description: 'Connect your Google Ads account for campaign and conversion tracking',
    enabled: false,
    comingSoon: true,
    documentation: 'https://developers.google.com/google-ads/api',
    scopes: ['campaigns:read', 'conversions:read', 'insights:read'],
    rateLimit: 5,
    syncInterval: 360, // 6 hours
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Ads',
    category: 'ads',
    icon: '♪',
    description: 'Connect your TikTok Ads Manager for campaign performance tracking',
    enabled: false,
    comingSoon: true,
    documentation: 'https://ads.tiktok.com/marketing_api/docs',
    scopes: ['campaigns:read', 'ads:read', 'insights:read'],
    rateLimit: 5,
    syncInterval: 360, // 6 hours
  },
};

// Accounting Software Integrations
export const ACCOUNTING_INTEGRATIONS: Record<string, IntegrationConfig> = {
  quickbooks: {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'accounting',
    icon: 'Q',
    description: 'Sync your financial data with QuickBooks Online',
    enabled: false,
    comingSoon: true,
    documentation: 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting-api-reference',
    scopes: ['accounting:read', 'accounting:write'],
    rateLimit: 5,
    syncInterval: 1440, // 24 hours
  },
  xero: {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    icon: 'X',
    description: 'Connect your Xero account for automated financial reporting',
    enabled: false,
    comingSoon: true,
    documentation: 'https://developer.xero.com/documentation/guides/oauth2/overview',
    scopes: ['accounting:read', 'accounting:write'],
    rateLimit: 5,
    syncInterval: 1440, // 24 hours
  },
};

// All integrations combined
export const ALL_INTEGRATIONS = {
  ...STORE_INTEGRATIONS,
  ...ADS_INTEGRATIONS,
  ...ACCOUNTING_INTEGRATIONS,
};

// Get integrations by category
export function getIntegrationsByCategory(category: 'store' | 'ads' | 'accounting'): IntegrationConfig[] {
  return Object.values(ALL_INTEGRATIONS).filter(
    (integration) => integration.category === category
  );
}

// Check if integration is available
export function isIntegrationAvailable(integrationId: string): boolean {
  const integration = ALL_INTEGRATIONS[integrationId as keyof typeof ALL_INTEGRATIONS];
  return integration?.enabled ?? false;
}

// Get integration by ID
export function getIntegration(integrationId: string): IntegrationConfig | null {
  return ALL_INTEGRATIONS[integrationId as keyof typeof ALL_INTEGRATIONS] || null;
}
