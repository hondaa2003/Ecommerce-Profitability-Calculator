# ProfitPilot - Ecommerce Profitability Calculator

A comprehensive web application for e-commerce sellers to track, analyze, and optimize their business profitability. Built with React, TypeScript, Supabase, and modern web technologies.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)

---

## 🚀 Features

### Core Features

- **Dashboard:** Real-time KPIs including revenue, profit, ROAS, and fulfillment metrics
- **Product Management:** Add, edit, and track product profitability with automatic calculations
- **Order Tracking:** Manage orders with status tracking (Pending, Delivered, Returned)
- **Campaign Analytics:** Track ad spend and ROI across multiple platforms
- **Reports & Export:** Generate detailed reports and export data (CSV, JSON, PDF)
- **Image Management:** Upload and manage product images via Supabase Storage

### Technical Features

- **URL-based Routing:** Clean navigation with React Router
- **PostgreSQL Database:** Relational data model with proper schema
- **Real-time Calculations:** Automatic profit, margin, and ROAS calculations
- **Row Level Security:** User-scoped data access with RLS policies
- **Responsive Design:** Mobile-friendly UI with TailwindCSS
- **Multi-language Support:** Built-in i18n support (English, Arabic)

### Upcoming Features

- **Store Integrations:** Shopify, Salla, Zid, WooCommerce
- **Ad Platform Integrations:** Meta Ads, Google Ads, TikTok Ads
- **Automated Syncing:** Real-time data sync from connected platforms
- **Advanced Analytics:** Cohort analysis, customer lifetime value
- **Inventory Management:** Stock tracking and alerts
- **Team Collaboration:** Multi-user support with roles

---

## 📋 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v7** - Client-side routing
- **TailwindCSS** - Styling
- **Radix UI** - Component library
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Deno** - Edge Functions runtime
- **Hono** - Lightweight web framework

### DevTools
- **Vite** - Build tool
- **pnpm** - Package manager
- **TypeScript** - Type checking

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/hondaa2003/Ecommerce-Profitability-Calculator.git
   cd Ecommerce-Profitability-Calculator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up database**
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

5. **Deploy Edge Function**
   ```bash
   supabase functions deploy server
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:5173`

---

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[API Integrations](./API_INTEGRATIONS.md)** - Third-party API integration roadmap
- **[Database Schema](./supabase/schema.sql)** - Database structure

---

## 🏗️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── pages/           # Page components
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── App.tsx          # Main app with routing
│   │   │   ├── AppShell.tsx     # Layout wrapper
│   │   │   ├── Auth.tsx         # Authentication
│   │   │   └── api.ts           # API client
│   │   ├── styles/              # Global styles
│   │   └── main.tsx             # Entry point
│   └── utils/                   # Utility functions
├── supabase/
│   ├── functions/
│   │   └── server/              # Edge Functions
│   └── schema.sql               # Database schema
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🎯 Key Pages

### Dashboard
Displays real-time KPIs and performance metrics:
- Total Revenue, Net Profit, ROAS, Max CPP
- Revenue & Profit trends
- Winning and losing products
- Recent orders

### Products
Manage your product catalog:
- Add/Edit/Delete products
- Upload product images
- Auto-calculate profit and margin
- Track product performance

### Orders
Track order fulfillment:
- Manual order entry
- Status tracking (Pending, Delivered, Returned)
- Success and return rates
- Store integration placeholders

### Campaigns
Monitor advertising campaigns:
- Manual campaign entry
- Track spend and revenue
- Calculate ROAS and CPA
- Platform-specific tracking

### Reports
Generate comprehensive reports:
- Profit summaries
- Product profitability analysis
- Campaign performance
- Export to CSV/JSON

---

## 💰 Profitability Calculations

### Profit Per Order
```
Profit = Price - (COGS + Shipping + Return Cost + COD + Packaging + VAT)
```

### Margin
```
Margin = (Profit / Price) × 100%
```

### Break-even ROAS
```
Break-even ROAS = Price / Profit
```

### ROAS (Return on Ad Spend)
```
ROAS = Total Revenue / Total Ad Spend
```

### CPA (Cost Per Acquisition)
```
CPA = Total Ad Spend / Total Orders
```

---

## 🔐 Security

- **Row Level Security (RLS):** All data is user-scoped
- **OAuth 2.0:** Secure authentication via Supabase
- **Encrypted Credentials:** API keys stored securely
- **HTTPS Only:** All communications encrypted
- **Rate Limiting:** API endpoints protected

---

## 📊 Database Schema

### Products Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name, image, url, sku
- cogs, shipping, return_cost, cod, packaging, vat, price
- created_at (Timestamp)
```

### Orders Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- product_id, customer_name, amount
- status (Pending, Delivered, Returned)
- created_at (Timestamp)
```

### Campaigns Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name, platform, spend, orders_count, revenue
- created_at (Timestamp)
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Netlify
Connect your GitHub repository and Netlify will auto-deploy on push.

### Self-Hosted
See [DEPLOYMENT.md](./DEPLOYMENT.md) for Docker setup.

---

## 🔄 API Endpoints

All endpoints require authentication with Bearer token.

### Products
- `GET /products` - List all products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders
- `GET /orders` - List all orders
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

### Campaigns
- `GET /campaigns` - List all campaigns
- `POST /campaigns` - Create campaign
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign

---

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API_INTEGRATIONS.md for integration help

---

## 🗺️ Roadmap

### Q2 2024
- [ ] Shopify integration
- [ ] Meta Ads integration
- [ ] Google Ads integration

### Q3 2024
- [ ] Salla & Zid integration
- [ ] TikTok Ads integration
- [ ] Advanced analytics

### Q4 2024
- [ ] Team collaboration
- [ ] Custom dashboards
- [ ] Mobile app

---

## 📞 Contact

- **Author:** mohannad amr 
- **GitHub:** [@hondaa2003](https://github.com/hondaa2003)

---

## 🎉 Acknowledgments

- Built with [Supabase](https://supabase.com)
- UI components from [Radix UI](https://radix-ui.com)
- Charts from [Recharts](https://recharts.org)
- Styling with [TailwindCSS](https://tailwindcss.com)

---

**Made with ❤️ for e-commerce sellers**
