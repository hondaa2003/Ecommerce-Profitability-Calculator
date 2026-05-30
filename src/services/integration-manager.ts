// Integration Manager - handles connect/disconnect/sync for all platforms
// All ad platform integrations are READ-ONLY (monitoring only, no write operations)

import { syncFromIntegration } from './mock-data';

export type PlatformId = 'shopify' | 'salla' | 'zid' | 'meta' | 'tiktok' | 'google';

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  icon: string;
  category: 'store' | 'ads';
  description: string;
  docUrl: string;
  setupInstructions: string;
  credentialLabel: string;
  credentialPlaceholder: string;
}

export const PLATFORMS: Record<PlatformId, PlatformInfo> = {
  shopify: {
    id: 'shopify', name: 'Shopify', icon: '🛒', category: 'store',
    description: 'Sync products, orders, and customers',
    docUrl: 'https://shopify.dev/api',
    credentialLabel: 'Store URL',
    credentialPlaceholder: 'mystore.myshopify.com',
    setupInstructions: 'Go to Shopify Admin → Settings → Apps → Develop apps → Create an app with Admin API scopes (read_products, read_orders). Copy the Admin API access token.',
  },
  salla: {
    id: 'salla', name: 'Salla', icon: '🏪', category: 'store',
    description: 'Sync products, orders, and customers',
    docUrl: 'https://docs.salla.dev',
    credentialLabel: 'Store URL',
    credentialPlaceholder: 'https://my-store.salla.sa',
    setupInstructions: 'Log into your Salla merchant dashboard → Settings → API Keys → Generate new API key. Copy the key for read-only access to products and orders.',
  },
  zid: {
    id: 'zid', name: 'Zid', icon: '🎯', category: 'store',
    description: 'Sync products, orders, and customers',
    docUrl: 'https://developer.zid.sa',
    credentialLabel: 'Store URL',
    credentialPlaceholder: 'https://my-store.zid.store',
    setupInstructions: 'Go to Zid Dashboard → Developer Settings → API Management → Create new app. Use the generated token with products:read and orders:read scopes.',
  },
  meta: {
    id: 'meta', name: 'Meta Ads', icon: '📱', category: 'ads',
    description: 'Auto-sync spend and ROAS (read-only)',
    docUrl: 'https://developers.facebook.com',
    credentialLabel: 'Ad Account ID',
    credentialPlaceholder: 'act_123456789',
    setupInstructions: 'Go to Facebook Business Settings → Ad Accounts → Select your ad account. Copy the Ad Account ID. Create a Meta App at developers.facebook.com with ads_read permission.',
  },
  tiktok: {
    id: 'tiktok', name: 'TikTok Ads', icon: '🎵', category: 'ads',
    description: 'Auto-sync spend and ROAS (read-only)',
    docUrl: 'https://ads.tiktok.com',
    credentialLabel: 'Ad Account ID',
    credentialPlaceholder: '1234567890',
    setupInstructions: 'Log into TikTok Ads Manager → Account Settings → Account Info. Copy your Ad Account ID. Generate an API token from TikTok for Business → Developers.',
  },
  google: {
    id: 'google', name: 'Google Ads', icon: '🔍', category: 'ads',
    description: 'Auto-sync spend and ROAS (read-only)',
    docUrl: 'https://developers.google.com/google-ads',
    credentialLabel: 'Customer ID',
    credentialPlaceholder: '123-456-7890',
    setupInstructions: 'Open Google Ads → Tools → Setup → API Center. Copy your Customer ID. Create OAuth2 credentials at console.cloud.google.com for the Google Ads API.',
  },
};

interface ConnectionState {
  connected: boolean;
  connectedAt: string | null;
  lastSync: string | null;
  apiKey?: string;
  storeUrl?: string;
  adAccountId?: string;
}

const STORAGE_KEY = 'platform_connections';

function loadState(): Record<string, ConnectionState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveState(state: Record<string, ConnectionState>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const IntegrationManager = {
  getConnection(id: PlatformId): ConnectionState {
    return loadState()[id] || { connected: false, connectedAt: null, lastSync: null };
  },

  isConnected(id: PlatformId): boolean {
    return this.getConnection(id).connected;
  },

  connect(id: PlatformId, credentials?: { apiKey?: string; storeUrl?: string; adAccountId?: string }) {
    const state = loadState();
    state[id] = {
      connected: true,
      connectedAt: new Date().toISOString(),
      lastSync: null,
      ...credentials,
    };
    saveState(state);

    // Immediately do an initial sync
    this.sync(id).catch(console.error);

    return state[id];
  },

  disconnect(id: PlatformId) {
    const state = loadState();
    state[id] = { connected: false, connectedAt: null, lastSync: null };
    saveState(state);
  },

  async sync(id: PlatformId): Promise<{ success: boolean; message: string; records?: number }> {
    const state = loadState();
    if (!state[id]?.connected) {
      throw new Error(`${PLATFORMS[id].name} is not connected`);
    }

    // Simulate sync delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    // Generate mock data from the integration (like actually importing products)
    const result = syncFromIntegration(PLATFORMS[id].name);

    state[id].lastSync = new Date().toISOString();
    saveState(state);

    const total = result.products + result.orders + result.campaigns;

    return {
      success: true,
      message: `Imported ${result.products} products, ${result.orders} orders, ${result.campaigns} campaigns from ${PLATFORMS[id].name}`,
      records: total,
    };
  },

  getAllConnected(): PlatformId[] {
    const state = loadState();
    return Object.keys(PLATFORMS).filter(id => state[id]?.connected) as PlatformId[];
  },

  getConnectionDetails(id: PlatformId) {
    const state = loadState();
    const info = PLATFORMS[id];
    const conn = state[id];
    return {
      ...info,
      ...conn,
      connected: !!conn?.connected,
    };
  },
};