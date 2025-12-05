# Railway Deployment Guide for DCrypto Backend

Step-by-step guide for deploying DCrypto backend to Railway.app.

## 🚂 Why Railway?

- ✅ Better free tier than Render ($5 free credit/month)
- ✅ Always-on service (no cold starts)
- ✅ Easy deployment from GitHub
- ✅ Automatic SSL certificates
- ✅ Custom domains supported

## 📋 Prerequisites

1. GitHub repository: `https://github.com/Arjunkocharla/Crypto-Currency-Tracking-Visualization-App`
2. Railway account (sign up at [railway.app](https://railway.app))
3. Supabase credentials ready

## 🚀 Deployment Steps

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Verify your email if needed

### Step 2: Create New Project

1. Click **"New Project"** (top right)
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub if needed
4. Select repository: `Arjunkocharla/Crypto-Currency-Tracking-Visualization-App`
5. Click **"Deploy"**

### Step 3: Configure Service

Railway will try to auto-detect, but you need to configure it:

1. **Set Root Directory:**
   - Go to your service → **Settings** → **Source**
   - Set **Root Directory** to: `backend`
   - Click **"Save"**

2. **Configure Build Settings:**
   - Railway should auto-detect Python
   - If not, go to **Settings** → **Build**
   - Build Command: `pip install -r requirements-core.txt`
   - Start Command: `python app.py`

### Step 4: Set Environment Variables

1. Go to your service → **Variables** tab
2. Click **"New Variable"** and add:

```env
SUPABASE_URL=https://ytgtszmtrknfjmqcziud.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PORT=8085
FLASK_ENV=production
DEBUG=False
```

**Important:**
- Replace `your_anon_key_here` with your Supabase anon key
- Replace `your_service_role_key_here` with your Supabase service role key
- Update `CORS_ORIGINS` later with your frontend URL

### Step 5: Deploy

1. Railway will automatically start building
2. Watch the build logs for any errors
3. Once deployed, Railway will provide a URL like: `https://dcrypto-backend-production.up.railway.app`
4. Test the health endpoint: `https://your-url.up.railway.app/api/health`

### Step 6: Add Custom Domain (Optional)

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** (for Railway domain) or **"Add Custom Domain"**
3. For custom domain: Enter `api.dcrpyto.com`
4. Follow DNS instructions:
   - Add CNAME record: `api` → Railway provided hostname
5. Wait for DNS propagation (5-10 minutes)
6. SSL certificate will be automatically provisioned

### Step 7: Update CORS (After Frontend Deployment)

1. Go to **Variables** tab
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://dcrpyto.com,https://www.dcrpyto.com,https://dcrypto-frontend.repl.co
   ```
3. Railway will automatically redeploy

## 🔧 Configuration Files

The repository includes these Railway configuration files:

- `backend/nixpacks.toml` - Build configuration
- `backend/Procfile` - Process file for Railway
- `railway.json` - Railway project configuration

## ✅ Verification

After deployment, test:

1. **Health Check:**
   ```
   https://your-service.up.railway.app/api/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "service": "crypto-portfolio-api",
     "version": "2.0.0"
   }
   ```

2. **Check Logs:**
   - Go to **Deployments** tab
   - Click on latest deployment
   - View logs for any errors

## 🐛 Troubleshooting

### Build Fails

**Error: "Could not find requirements-core.txt"**
- Verify Root Directory is set to `backend`
- Check file exists in `backend/` directory

**Error: "Module not found"**
- Check `requirements-core.txt` has all dependencies
- Railway might need Python version specified

### Service Won't Start

**Error: "Port already in use"**
- Railway sets `PORT` environment variable automatically
- Update `app.py` to use: `port=int(os.getenv('PORT', 8085))`

**Error: "Supabase not initialized"**
- Check environment variables are set correctly
- Verify Supabase credentials are valid

### CORS Errors

- Update `CORS_ORIGINS` with your frontend URL
- Include both `http://` and `https://` if needed
- Restart service after updating variables

## 💰 Railway Pricing

**Free Tier:**
- $5 free credit per month
- Usually enough for small apps
- Pay-as-you-go after free credits
- No credit card required for free tier

**Usage:**
- ~$0.01 per hour for small apps
- $5 credit = ~500 hours/month
- More than enough for DCrypto backend

## 📊 Monitoring

- View logs in Railway dashboard
- Monitor usage in **Usage** tab
- Set up alerts if needed

## 🔄 Updates

Railway auto-deploys on push to `main` branch:
1. Push changes to GitHub
2. Railway detects changes
3. Automatically rebuilds and redeploys
4. Zero-downtime deployments

## 🆚 Railway vs Render

| Feature | Railway | Render Free |
|---------|---------|-------------|
| Always-on | ✅ | ❌ (spins down) |
| Cold Start | None | ~30 seconds |
| Free Tier | $5 credit/month | Free but spins down |
| Auto-deploy | ✅ | ✅ |
| Custom Domain | ✅ | ✅ |
| SSL | ✅ | ✅ |

**Recommendation:** Railway is better for free tier (always-on, no cold starts)

---

**Last Updated**: 2024

