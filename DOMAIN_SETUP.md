# Custom Domain Setup for dcrpyto.com

This guide explains how to configure your custom domain `dcrpyto.com` for DCrypto.

## 🌐 Domain Configuration Overview

- **Frontend**: `dcrpyto.com` and `www.dcrpyto.com` → Replit
- **Backend API**: `api.dcrpyto.com` → Render (optional, can use Render default)

## 📋 DNS Configuration

### Option 1: Using Replit for Frontend

1. **In Replit Dashboard:**
   - Go to your repl → **Settings** → **Deployment**
   - Click **"Add Domain"**
   - Enter: `dcrpyto.com`
   - Replit will provide DNS instructions

2. **In Your Domain Registrar (e.g., GoDaddy, Namecheap, Cloudflare):**
   
   **For Root Domain (`dcrpyto.com`):**
   - Add **A Record**:
     - Type: `A`
     - Name: `@` or `dcrpyto.com`
     - Value: IP address provided by Replit
     - TTL: `3600` (or default)
   
   **For WWW Subdomain (`www.dcrpyto.com`):**
   - Add **CNAME Record**:
     - Type: `CNAME`
     - Name: `www`
     - Value: `dcrpyto.com` (or Replit hostname)
     - TTL: `3600` (or default)

### Option 2: Using Cloudflare (Recommended)

1. **Add Domain to Cloudflare:**
   - Sign up/login at [cloudflare.com](https://cloudflare.com)
   - Add site: `dcrpyto.com`
   - Update nameservers at your domain registrar

2. **Configure DNS Records:**
   
   **Frontend (Replit):**
   - Type: `CNAME`
   - Name: `@` (or `dcrpyto.com`)
   - Target: Replit hostname (e.g., `dcrypto-frontend.repl.co`)
   - Proxy: `Proxied` (orange cloud) ✅
   
   - Type: `CNAME`
   - Name: `www`
   - Target: `dcrpyto.com`
   - Proxy: `Proxied` (orange cloud) ✅
   
   **Backend API (Render - Optional):**
   - Type: `CNAME`
   - Name: `api`
   - Target: `dcrypto-backend.onrender.com`
   - Proxy: `Proxied` (orange cloud) ✅

3. **SSL/TLS Settings:**
   - Go to **SSL/TLS** → **Overview**
   - Set to **"Full"** or **"Full (strict)"**
   - SSL certificate will be automatically provisioned

## 🔧 Backend API Subdomain Setup (Optional)

If you want `api.dcrpyto.com` for your backend:

1. **In Render:**
   - Go to your service → **Settings** → **Custom Domains**
   - Click **"Add Custom Domain"**
   - Enter: `api.dcrpyto.com`

2. **In DNS Provider:**
   - Add **CNAME Record**:
     - Type: `CNAME`
     - Name: `api`
     - Value: Render's provided hostname
     - TTL: `3600`

3. **Wait for SSL:**
   - Render will automatically provision SSL certificate
   - Can take 5-10 minutes

## 🔄 Update Environment Variables

### Frontend (Replit Secrets)
After domain is configured, update:
```
REACT_APP_API_URL=https://api.dcrpyto.com/api
```
Or keep using Render default:
```
REACT_APP_API_URL=https://dcrypto-backend.onrender.com/api
```

### Backend (Render Environment)
Update CORS to include your domain:
```
CORS_ORIGINS=https://dcrpyto.com,https://www.dcrpyto.com,https://dcrypto-frontend.repl.co
```

## ✅ Verification Checklist

- [ ] DNS records are configured correctly
- [ ] Domain resolves (check with `nslookup dcrpyto.com`)
- [ ] SSL certificate is active (HTTPS works)
- [ ] Frontend loads at `https://dcrpyto.com`
- [ ] WWW redirects work (`www.dcrpyto.com` → `dcrpyto.com`)
- [ ] API subdomain works (if configured: `https://api.dcrpyto.com/api/health`)
- [ ] CORS is updated in backend
- [ ] Frontend environment variables are updated
- [ ] No mixed content warnings (all resources use HTTPS)

## 🐛 Troubleshooting

### Domain Not Resolving
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Use `dig dcrpyto.com` or `nslookup dcrpyto.com` to verify

### SSL Certificate Issues
- Ensure DNS is pointing correctly
- Wait 5-10 minutes after DNS changes
- Check SSL/TLS settings in Cloudflare (if using)

### CORS Errors
- Verify `CORS_ORIGINS` includes `https://dcrpyto.com`
- Include both `dcrpyto.com` and `www.dcrpyto.com`
- Restart backend after updating CORS

### Mixed Content Warnings
- Ensure all API calls use HTTPS
- Check `REACT_APP_API_URL` uses `https://`
- Verify backend is accessible via HTTPS

## 📝 DNS Record Examples

### GoDaddy/Namecheap
```
Type    Name    Value                           TTL
A       @       [Replit IP or Render IP]       3600
CNAME   www     dcrpyto.com                     3600
CNAME   api     dcrypto-backend.onrender.com    3600
```

### Cloudflare
```
Type    Name    Target                           Proxy
CNAME   @       dcrypto-frontend.repl.co        ✅ Proxied
CNAME   www     dcrpyto.com                      ✅ Proxied
CNAME   api     dcrypto-backend.onrender.com     ✅ Proxied
```

## 🔒 Security Best Practices

1. **Always use HTTPS:**
   - Force HTTPS redirects
   - Use HSTS headers (Cloudflare does this automatically)

2. **Subdomain Security:**
   - Use `api.dcrpyto.com` for backend (separate from frontend)
   - Keep backend URL in environment variables

3. **CORS Configuration:**
   - Only allow your domain in CORS_ORIGINS
   - Remove development URLs in production

## 📚 Additional Resources

- [Replit Custom Domain Docs](https://docs.replit.com/hosting/custom-domains)
- [Render Custom Domain Docs](https://render.com/docs/custom-domains)
- [Cloudflare DNS Setup](https://developers.cloudflare.com/dns/)

---

**Domain**: `dcrpyto.com`  
**Last Updated**: 2024

