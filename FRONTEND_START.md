# 🚀 How to Start the Frontend

## Step-by-Step Instructions

### Step 1: Install Dependencies (First Time Only)

```bash
cd frontend
npm install
```

This will take a few minutes to download all packages.

### Step 2: Start the Frontend Server

```bash
npm start
```

The app will:
- ✅ Start on `http://localhost:3000`
- ✅ Automatically open in your browser
- ✅ Hot reload enabled (auto-refresh on code changes)

### Step 3: Keep It Running

- Keep the terminal window open
- Press `Ctrl+C` to stop the server
- The browser will auto-refresh when you make changes

## Quick Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time)
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Environment Configuration

The `.env` file is already created with:
```
REACT_APP_API_URL=http://127.0.0.1:8085/api
```

Make sure your **backend is running** on port 8085 before starting the frontend!

## Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org/

### Port 3000 already in use
React will ask to use a different port (like 3001)

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to backend
1. Make sure backend is running: `cd backend && python app.py`
2. Check `.env` file has correct API URL
3. Verify backend is on port 8085

## What You'll See

Once started, you'll see:
- Terminal showing compilation status
- Browser opens to `http://localhost:3000`
- Modern UI with navigation bar
- Portfolio tracking interface

---

**Ready? Run these commands:**

```bash
cd frontend
npm install    # First time only
npm start      # Start the app
```

