# API Integrations Guide

This document outlines the planned API integrations for the Ecommerce Profitability Calculator. These integrations will enable automatic data synchronization from various e-commerce and advertising platforms.

## E-Commerce Platform Integrations

### Shopify Integration

**Purpose:** Automatically sync products, orders, and inventory data from Shopify stores.

**Endpoints to Implement:**
- `GET /integrations/shopify/connect` - Initiate OAuth flow
- `POST /integrations/shopify/callback` - Handle OAuth callback
- `GET /integrations/shopify/products` - Sync products
- `GET /integrations/shopify/orders` - Sync orders
- `POST /integrations/shopify/webhook` - Handle real-time updates

**Data Mapping:**
```
Shopify Product → Local Product
- title → name
- variants[0].price → price
- cost → cogs
- images[0].src → image

Shopify Order → Local Order
- id → product_id
- customer.name → customer_name
- total_price → amount
- fulfillment_status → status
```

**Authentication:** OAuth 2.0 with Shopify App credentials

---

### Salla Integration

**Purpose:** Sync products and orders from Salla e-commerce platform (popular in Middle East).

**Endpoints to Implement:**
- `POST /integrations/salla/connect` - API key setup
- `GET /integrations/salla/products` - Fetch products
- `GET /integrations/salla/orders` - Fetch orders
- `POST /integrations/salla/webhook` - Real-time order updates

**Authentication:** API Key-based authentication

---

### Zid Integration

**Purpose:** Connect with Zid e-commerce platform.

**Endpoints to Implement:**
- Similar structure to Salla
- `POST /integrations/zid/connect`
- `GET /integrations/zid/products`
- `GET /integrations/zid/orders`

**Authentication:** API Token

---

## Advertising Platform Integrations

### Meta Ads Integration (Facebook & Instagram)

**Purpose:** Automatically fetch ad spend, impressions, clicks, and conversions from Meta Ads Manager.

**Endpoints to Implement:**
- `GET /integrations/meta/connect` - OAuth flow
- `POST /integrations/meta/callback` - Handle OAuth
- `GET /integrations/meta/campaigns` - Fetch campaign data
- `GET /integrations/meta/insights` - Fetch performance metrics

**Data Mapping:**
```
Meta Campaign → Local Campaign
- name → name
- "facebook" → platform
- spend → spend
- actions[0].value → orders_count
- purchase_roas → calculated ROAS
```

**Metrics to Fetch:**
- spend
- impressions
- clicks
- purchase_roas
- actions (conversions)
- cost_per_action_type

**Authentication:** OAuth 2.0 with Meta App

---

### Google Ads Integration

**Purpose:** Sync Google Ads campaign performance data.

**Endpoints to Implement:**
- `GET /integrations/google/connect` - OAuth flow
- `POST /integrations/google/callback`
- `GET /integrations/google/campaigns` - Fetch campaigns
- `GET /integrations/google/performance` - Fetch metrics

**Data Mapping:**
```
Google Campaign → Local Campaign
- name → name
- "google" → platform
- cost → spend
- conversions → orders_count
```

**Metrics to Fetch:**
- cost
- impressions
- clicks
- conversions
- conversion_value
- cost_per_conversion

**Authentication:** OAuth 2.0 with Google Ads API

---

### TikTok Ads Integration

**Purpose:** Fetch TikTok advertising campaign data.

**Endpoints to Implement:**
- `GET /integrations/tiktok/connect` - OAuth flow
- `POST /integrations/tiktok/callback`
- `GET /integrations/tiktok/campaigns`
- `GET /integrations/tiktok/insights`

**Data Mapping:**
```
TikTok Campaign → Local Campaign
- campaign_name → name
- "tiktok" → platform
- spend → spend
- conversions → orders_count
```

**Authentication:** OAuth 2.0 with TikTok Marketing API

---

## Implementation Architecture

### Backend Structure

```
supabase/functions/server/
├── integrations/
│   ├── shopify.ts
│   ├── salla.ts
│   ├── zid.ts
│   ├── meta.ts
│   ├── google.ts
│   ├── tiktok.ts
│   └── types.ts
├── webhooks/
│   ├── shopify-webhook.ts
│   ├── salla-webhook.ts
│   └── meta-webhook.ts
└── sync/
    ├── scheduler.ts
    └── data-mapper.ts
```

### Database Schema Extensions

```sql
-- Integration Credentials Table
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    platform TEXT NOT NULL, -- 'shopify', 'salla', 'meta', etc.
    api_key TEXT,
    api_secret TEXT,
    oauth_token TEXT,
    oauth_refresh_token TEXT,
    store_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Sync History Table
CREATE TABLE sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL,
    sync_type TEXT, -- 'products', 'orders', 'campaigns'
    status TEXT, -- 'pending', 'completed', 'failed'
    records_synced INTEGER,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

### Frontend Integration UI

**New Settings Page Components:**
- `IntegrationsList.tsx` - Display connected integrations
- `ConnectIntegration.tsx` - OAuth flow handler
- `SyncStatus.tsx` - Show sync progress and history
- `IntegrationSettings.tsx` - Manage credentials

---

## Implementation Timeline

### Phase 1: Shopify Integration (Week 1)
- OAuth setup
- Product sync
- Order sync
- Webhook handling

### Phase 2: Meta Ads Integration (Week 2)
- OAuth setup
- Campaign data fetch
- Performance metrics
- Real-time sync

### Phase 3: Google Ads Integration (Week 2-3)
- OAuth setup
- Campaign sync
- Metrics aggregation

### Phase 4: Regional Platforms (Week 3-4)
- Salla integration
- Zid integration
- TikTok Ads integration

### Phase 5: Advanced Features (Week 4+)
- Scheduled syncs
- Conflict resolution
- Data validation
- Error handling and retry logic

---

## Security Considerations

1. **Credential Storage:** All API keys and tokens are encrypted in Supabase
2. **OAuth Flow:** Use secure redirect URIs and state parameters
3. **Rate Limiting:** Implement backoff strategies for API calls
4. **Data Validation:** Validate all incoming data from external APIs
5. **Audit Logging:** Log all integration activities for compliance

---

## Testing Strategy

1. **Unit Tests:** Test data mapping functions
2. **Integration Tests:** Test API connections with sandbox/test environments
3. **E2E Tests:** Test full sync workflows
4. **Mock Data:** Use mock responses for development

---

## Future Enhancements

- Bi-directional sync (push inventory updates back to platforms)
- Advanced conflict resolution
- Custom field mapping
- Scheduled sync with cron jobs
- Webhook-based real-time updates
- Analytics dashboard for sync metrics
