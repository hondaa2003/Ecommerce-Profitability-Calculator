/**
 * Salla Integration Service
 * Handles OAuth2 authentication and API calls to Salla
 * Reference: https://docs.salla.dev
 */

export interface SallaConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBaseUrl: string;
}

export interface SallaAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface SallaProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  cost: number;
  sku: string;
  image: string;
  status: 'active' | 'inactive';
}

export interface SallaOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: SallaOrderItem[];
  createdAt: string;
}

export interface SallaOrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
}

export class SallaIntegration {
  private config: SallaConfig;
  private token: SallaAuthToken | null = null;

  constructor(config: SallaConfig) {
    this.config = config;
    this.loadTokenFromStorage();
  }

  /**
   * Get OAuth2 authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      state,
      scope: 'products:read orders:read inventory:read',
    });

    return `https://accounts.salla.dev/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SallaAuthToken> {
    const response = await fetch('https://accounts.salla.dev/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json();
    this.token = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    this.saveTokenToStorage();
    return this.token;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<SallaAuthToken> {
    if (!this.token?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://accounts.salla.dev/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.token.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    this.token = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    this.saveTokenToStorage();
    return this.token;
  }

  /**
   * Ensure token is valid, refresh if needed
   */
  private async ensureValidToken(): Promise<string> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    // Refresh if token expires in less than 5 minutes
    if (this.token.expiresAt - Date.now() < 5 * 60 * 1000) {
      await this.refreshAccessToken();
    }

    return this.token.accessToken;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.ensureValidToken();

    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all products
   */
  async getProducts(page: number = 1, limit: number = 100): Promise<SallaProduct[]> {
    const data = await this.apiRequest(`/products?page=${page}&limit=${limit}`);
    return data.data || [];
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<SallaProduct> {
    const data = await this.apiRequest(`/products/${productId}`);
    return data.data;
  }

  /**
   * Get all orders
   */
  async getOrders(page: number = 1, limit: number = 100): Promise<SallaOrder[]> {
    const data = await this.apiRequest(`/orders?page=${page}&limit=${limit}`);
    return data.data || [];
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<SallaOrder> {
    const data = await this.apiRequest(`/orders/${orderId}`);
    return data.data;
  }

  /**
   * Sync all products from Salla
   */
  async syncProducts(): Promise<SallaProduct[]> {
    const products: SallaProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pageProducts = await this.getProducts(page, 100);
      if (pageProducts.length === 0) {
        hasMore = false;
      } else {
        products.push(...pageProducts);
        page++;
      }
    }

    return products;
  }

  /**
   * Sync all orders from Salla
   */
  async syncOrders(): Promise<SallaOrder[]> {
    const orders: SallaOrder[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pageOrders = await this.getOrders(page, 100);
      if (pageOrders.length === 0) {
        hasMore = false;
      } else {
        orders.push(...pageOrders);
        page++;
      }
    }

    return orders;
  }

  /**
   * Save token to localStorage
   */
  private saveTokenToStorage(): void {
    if (typeof window !== 'undefined' && this.token) {
      localStorage.setItem('salla_token', JSON.stringify(this.token));
    }
  }

  /**
   * Load token from localStorage
   */
  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('salla_token');
      if (stored) {
        try {
          this.token = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored Salla token', e);
        }
      }
    }
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salla_token');
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null && this.token.expiresAt > Date.now();
  }
}
