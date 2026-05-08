# Deployment & Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- GitHub account for version control
- Domain name (optional, for production)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hondaa2003/Ecommerce-Profitability-Calculator.git
cd Ecommerce-Profitability-Calculator
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project settings.

### 4. Database Setup

#### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option B: Manual Setup

1. Go to Supabase SQL Editor
2. Run the SQL from `supabase/schema.sql`
3. Create storage bucket for product images:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('product-images', 'product-images', true);
   ```

### 5. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage → Buckets
2. Create new bucket: `product-images`
3. Set to public
4. Add CORS policy:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### 6. Deploy Edge Function

```bash
# Deploy the server function
supabase functions deploy server

# Set environment variables for the function
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 7. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:5173`

---

## Production Deployment

### Option 1: Vercel (Recommended)

#### 1. Push to GitHub

```bash
git push origin main
```

#### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### 3. Deploy

```bash
vercel --prod
```

### Option 2: Netlify

#### 1. Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Select your GitHub repository

#### 2. Build Settings

- Build command: `pnpm build`
- Publish directory: `dist`

#### 3. Environment Variables

Add in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option 3: Self-Hosted (Docker)

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "preview"]
```

#### 2. Build and Run

```bash
docker build -t profitpilot .
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  profitpilot
```

---

## Database Maintenance

### Backup

```bash
# Backup database
supabase db pull

# This creates a migration file with current schema
```

### Restore

```bash
# Restore from backup
supabase db push
```

### Monitor

```bash
# View logs
supabase functions logs server

# View database activity
# Go to Supabase Dashboard → Database → Logs
```

---

## Monitoring & Logging

### Application Monitoring

1. **Vercel Analytics:** Automatic with Vercel deployment
2. **Sentry:** Add error tracking
   ```bash
   npm install @sentry/react
   ```

3. **LogRocket:** Session replay and logging
   ```bash
   npm install logrocket
   ```

### Database Monitoring

1. Go to Supabase Dashboard
2. Check Database → Performance
3. Monitor query times and slow queries

---

## Security Checklist

- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Set up proper authentication
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (automatic with Vercel/Netlify)
- [ ] Set up rate limiting on Edge Functions
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Enable RLS

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies are already created in schema.sql
```

---

## Scaling Considerations

### Database

- Use connection pooling for high traffic
- Add indexes on frequently queried columns
- Archive old data periodically

### Frontend

- Enable caching headers
- Use CDN for static assets
- Implement lazy loading

### Backend

- Scale Edge Functions horizontally
- Use caching for API responses
- Implement rate limiting

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Supabase connection fails

**Solution:**
1. Check environment variables
2. Verify Supabase project is active
3. Check firewall/network settings

### Issue: Image upload fails

**Solution:**
1. Verify storage bucket exists and is public
2. Check CORS settings
3. Verify file size limits

### Issue: Edge Function errors

**Solution:**
```bash
# Check function logs
supabase functions logs server

# Redeploy function
supabase functions deploy server
```

---

## Performance Optimization

### Frontend

1. **Code Splitting:** Implemented with React Router
2. **Image Optimization:** Use next-gen formats
3. **Bundle Analysis:**
   ```bash
   pnpm build -- --analyze
   ```

### Backend

1. **Query Optimization:** Add indexes
2. **Caching:** Implement Redis (optional)
3. **Compression:** Enable gzip

---

## Backup & Recovery

### Automated Backups

Supabase provides daily backups. To restore:

1. Go to Supabase Dashboard
2. Settings → Backups
3. Select backup and restore

### Manual Backup

```bash
# Export data
supabase db pull

# This creates a migration file
git commit -am "Database backup"
git push
```

---

## Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)

---

## Next Steps

1. Set up monitoring and logging
2. Configure automated backups
3. Set up CI/CD pipeline
4. Implement API integrations (see `API_INTEGRATIONS.md`)
5. Set up analytics tracking
6. Configure email notifications
