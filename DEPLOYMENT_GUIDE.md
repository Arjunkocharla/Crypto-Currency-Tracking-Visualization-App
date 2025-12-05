# DCrypto Deployment Guide

Complete step-by-step guide for deploying DCrypto to production.

## 🎯 Deployment Overview

- **Backend**: Render (Python/Flask)
- **Frontend**: Replit (React)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## 📋 Prerequisites

1. GitHub repository: `https://github.com/Arjunkocharla/DCrypto`
2. Supabase project created and configured
3. Google OAuth credentials (for Google Sign-In)
4. Render account (free tier works)
5. Replit account (free tier works)

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email if needed

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select repository: `Arjunkocharla/DCrypto`
4. Click **"Connect"**

### Step 3: Configure Service Settings

**Basic Settings:**
- **Name**: `dcrypto-backend`
- **Environment**: `Python 3`
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  pip install -r requirements-core.txt
  ```
- **Start Command**: 
  ```bash
  python app.py
  ```

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys on every push to main)
- **Health Check Path**: `/api/health` (optional)

### Step 4: Set Environment Variables

Click **"Environment"** tab and add:

```env
SUPABASE_URL=https://ytgtszmtrknfjmqcziud.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CORS_ORIGINS=https://dcrypto-frontend.repl.co,https://dcrypto-frontend.your-custom-domain.com
PORT=8085
FLASK_ENV=production
DEBUG=False
PYTHON_VERSION=3.11.0
```

**Important Notes:**
- Replace `your_anon_key_here` with your Supabase anon key
- Replace `your_service_role_key_here` with your Supabase service role key
- Update `CORS_ORIGINS` with your actual frontend URL after deployment
- `PYTHON_VERSION` is optional but recommended for consistency

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Render will start building (takes 2-5 minutes)
3. Watch the build logs for any errors
4. Once deployed, note your service URL: `https://dcrypto-backend.onrender.com`

### Step 6: Add Custom Domain (Optional)
1. Go to your Render service → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter: `api.dcrpyto.com` (or `backend.dcrpyto.com`)
4. Follow DNS configuration instructions:
   - Add a CNAME record pointing to your Render service
   - Or add an A record with Render's IP address
5. Wait for DNS propagation (can take up to 48 hours)
6. SSL certificate will be automatically provisioned

### Step 7: Update CORS (After Frontend Deployment)
1. Go to your Render service → **Environment**
2. Update `CORS_ORIGINS` with your frontend URLs:
   ```
   CORS_ORIGINS=https://dcrpyto.com,https://www.dcrpyto.com,https://dcrypto-frontend.repl.co
   ```
3. Click **"Save Changes"** (will trigger a redeploy)

### Render Pricing Options

**Free Tier (Hobby Plan):**
- ✅ Free forever
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds (cold start)
- ⚠️ Not ideal for production use

**Starter Plan ($7/month):**
- ✅ Always-on service (no spin-down)
- ✅ Faster response times
- ✅ Better for production
- ✅ Recommended for DCrypto backend

**Recommendation:** 
- For development/testing: Use free tier
- For production: Upgrade to Starter plan ($7/month) to avoid cold starts
- Alternative: Use Railway.app or Fly.io which have better free tiers

---

## 🎨 Frontend Deployment (Replit)

### Step 1: Create Replit Account
1. Go to [replit.com](https://replit.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email if needed

### Step 2: Import from GitHub
1. Click **"Create Repl"** (top right)
2. Select **"Import from GitHub"**
3. Enter repository URL: `https://github.com/Arjunkocharla/DCrypto`
4. Click **"Import"**

### Step 3: Configure Repl Settings

**General Settings:**
- **Name**: `dcrypto-frontend`
- **Template**: `Node.js` (auto-detected)
- **Root Directory**: `frontend` (important!)

**Configure `.replit` file:**
```toml
language = "nodejs"
run = "cd frontend && npm install && npm start"
entrypoint = "frontend/src/index.js"
```

### Step 4: Set Secrets (Environment Variables)

1. Click the **"Secrets"** tab (lock icon in sidebar)
2. Add the following secrets:

```
REACT_APP_SUPABASE_URL = https://ytgtszmtrknfjmqcziud.supabase.co
REACT_APP_SUPABASE_ANON_KEY = your_anon_key_here
REACT_APP_API_URL = https://dcrypto-backend.onrender.com/api
```

**Important:**
- Replace `your_anon_key_here` with your Supabase anon key
- Replace `https://dcrypto-backend.onrender.com` with your actual Render backend URL
- Secrets are automatically injected as environment variables

### Step 5: Install Dependencies
1. Open the **Shell** tab
2. Run:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```
3. Wait for installation to complete

### Step 6: Deploy
1. Click **"Run"** button (or press `Ctrl+Enter`)
2. Replit will start the React development server
3. Your app will be available at: `https://dcrypto-frontend.repl.co`

### Step 7: Enable Always On (Optional)
1. Go to **"Settings"** → **"Deployment"**
2. Enable **"Always On"** (requires Replit Hacker plan)
3. Or use free tier (spins down after inactivity)

### Step 8: Custom Domain Setup

#### Option A: Replit Custom Domain
1. Go to **"Settings"** → **"Deployment"**
2. Click **"Add Domain"**
3. Enter your domain: `dcrpyto.com` or `www.dcrpyto.com`
4. Follow DNS configuration instructions:
   - Add a CNAME record pointing to Replit's provided hostname
   - Or configure A records as instructed
5. Wait for DNS propagation (can take up to 48 hours)
6. SSL certificate will be automatically provisioned

#### Option B: Use Cloudflare or Another DNS Provider
1. Set up DNS records:
   - **A Record**: `@` → Your hosting provider's IP
   - **CNAME**: `www` → Your hosting provider's hostname
   - **CNAME**: `api` → Your Render backend URL (if using subdomain)
2. Configure SSL/TLS in your DNS provider
3. Update `CORS_ORIGINS` in Render backend with your domain

#### Update Environment Variables
After setting up custom domain, update frontend secrets:
```
REACT_APP_API_URL=https://api.dcrpyto.com/api
```
Or if using Render's default domain:
```
REACT_APP_API_URL=https://dcrypto-backend.onrender.com/api
```

---

## 🔄 Post-Deployment Checklist

### Backend (Render)
- [ ] Service is running and accessible
- [ ] Health check endpoint works: `https://your-backend.onrender.com/api/health` or `https://api.dcrpyto.com/api/health`
- [ ] Custom domain configured (if using `api.dcrpyto.com`)
- [ ] Environment variables are set correctly
- [ ] CORS_ORIGINS includes frontend URL and custom domain
- [ ] Logs show no errors

### Frontend (Replit)
- [ ] App loads without errors at `https://dcrpyto.com` or `https://www.dcrpyto.com`
- [ ] Custom domain configured and SSL certificate active
- [ ] Environment variables are set in Secrets
- [ ] API calls to backend work (check browser console)
- [ ] Authentication works (Google OAuth + Email/Password)
- [ ] No CORS errors in browser console

### Database (Supabase)
- [ ] Database schema is deployed (`supabase_schema.sql`)
- [ ] Row Level Security (RLS) policies are enabled
- [ ] Authentication providers are configured (Google OAuth)
- [ ] API keys are correct

### Testing
- [ ] User can sign up/login
- [ ] User can add transactions
- [ ] User can import from Coinbase
- [ ] Portfolio data loads correctly
- [ ] Analytics page works
- [ ] Real-time prices update

---

## 🐛 Troubleshooting

### Backend Issues

**Service won't start:**
- Check build logs in Render dashboard
- Verify Python version compatibility
- Check `requirements-core.txt` for missing dependencies

**CORS errors:**
- Verify `CORS_ORIGINS` includes frontend URL
- Check that frontend URL matches exactly (including `https://`)
- Restart service after updating environment variables

**Database connection errors:**
- Verify Supabase credentials in environment variables
- Check Supabase project is active
- Verify service role key (not anon key) is used

### Frontend Issues

**Build fails:**
- Check Node.js version (should be 14+)
- Run `npm install --legacy-peer-deps` manually
- Check for dependency conflicts

**API calls fail:**
- Verify `REACT_APP_API_URL` is correct
- Check backend is running and accessible
- Verify CORS is configured correctly

**Authentication not working:**
- Check Supabase credentials in Secrets
- Verify Google OAuth is configured in Supabase
- Check browser console for errors

### Common Errors

**"Module not found":**
- Run `npm install` in frontend directory
- Check `package.json` for correct dependencies

**"CORS policy blocked":**
- Update `CORS_ORIGINS` in backend
- Restart backend service
- Clear browser cache

**"Supabase not initialized":**
- Check environment variables are set
- Verify Supabase project URL is correct
- Check API keys are valid

---

## 🔐 Security Best Practices

1. **Never commit secrets:**
   - `.env` files are in `.gitignore`
   - Use environment variables/secrets in hosting platforms

2. **Use service role key only in backend:**
   - Never expose service role key in frontend
   - Use anon key in frontend

3. **Enable RLS in Supabase:**
   - Row Level Security ensures users only see their data
   - Policies are already configured in `supabase_schema.sql`

4. **Use HTTPS:**
   - Both Render and Replit provide HTTPS by default
   - Never use HTTP in production

5. **Update CORS regularly:**
   - Only allow trusted domains
   - Remove unused origins

---

## 📊 Monitoring

### Render
- View logs in Render dashboard
- Set up alerts for service failures
- Monitor response times

### Replit
- View console logs in Replit
- Monitor resource usage
- Check for errors in browser console

### Supabase
- Monitor database usage in Supabase dashboard
- Check API usage and limits
- Review authentication logs

---

## 🚀 Continuous Deployment

### Automatic Deploys
- **Render**: Auto-deploys on push to `main` branch (if enabled)
- **Replit**: Manual deploy (click "Run" after changes)

### Manual Deploys
1. Push changes to GitHub
2. Render will auto-deploy (if enabled)
3. In Replit, click "Run" to redeploy frontend

### Rollback
- **Render**: Use "Manual Deploy" → select previous commit
- **Replit**: Revert to previous commit in GitHub, then redeploy

---

## 📝 Notes

- Free tiers have limitations (spin-down, cold starts)
- Consider upgrading for production use
- Monitor usage to avoid hitting limits
- Keep dependencies updated for security

---

## 🆘 Support

If you encounter issues:
1. Check logs in Render/Replit dashboards
2. Review browser console for frontend errors
3. Check Supabase logs for database issues
4. Review this guide for common solutions

---

**Last Updated**: 2024
**Version**: 1.0.0

