# DCrypto - Modern Cryptocurrency Portfolio Tracker

A professional, full-stack cryptocurrency portfolio management application with real-time tracking, broker integration, advanced analytics, and AI-powered price predictions.

![DCrypto](https://img.shields.io/badge/DCrypto-Portfolio%20Tracker-blue)
![React](https://img.shields.io/badge/React-17.0.2-61DAFB)
![Flask](https://img.shields.io/badge/Flask-3.1.2-green)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

## 🎯 Overview

DCrypto is a modern web application that helps users track, analyze, and manage their cryptocurrency investments. It provides real-time portfolio valuation, transaction management, broker integration, and advanced analytics to help users make informed investment decisions.

### Key Highlights
- **Real-time Portfolio Tracking** - Live price updates and portfolio valuation
- **Multi-Broker Integration** - Import transactions from Coinbase (expandable to other exchanges)
- **Advanced Analytics** - Performance metrics, time-period analysis, and portfolio distribution
- **Secure Authentication** - Supabase Auth with Google OAuth and email/password
- **Modern UI/UX** - Professional gradient design with dark mode support
- **AI Price Predictions** - LSTM-based Bitcoin price forecasting

## ✨ Features

### Core Functionality
- ✅ **Transaction Management** - Add, edit, delete transactions manually
- ✅ **Broker Integration** - Import transactions from Coinbase with automatic duplicate detection
- ✅ **Portfolio Tracking** - Real-time portfolio value, gains/losses, and performance metrics
- ✅ **Advanced Analytics** - Time-period filtering, best/worst performers, portfolio history
- ✅ **Visualizations** - Interactive charts showing portfolio distribution (pie charts, bar charts)
- ✅ **Price Predictions** - LSTM-based Bitcoin price forecasting
- ✅ **User Authentication** - Secure login with Supabase Auth (Google OAuth + Email/Password)

### Modern UI/UX
- ✅ Professional gradient-based design with glassmorphism effects
- ✅ Responsive layout (mobile & desktop)
- ✅ Dark mode support with smooth transitions
- ✅ Intuitive navigation with protected routes
- ✅ Real-time data updates with session caching

## 🏗️ Tech Stack

### Frontend
- **React 17.0.2** - UI framework with hooks
- **Chakra UI 1.7.4** - Component library
- **Recharts 2.1.8** - Data visualization
- **React Router 6.4.3** - Client-side routing
- **Supabase JS** - Authentication and real-time data
- **Axios/Fetch** - API communication

### Backend
- **Python 3.8+** - Backend language
- **Flask 3.1.2** - REST API framework
- **Supabase (PostgreSQL)** - Database with Row Level Security
- **Flask-CORS** - Cross-origin resource sharing
- **CoinGecko API** - Real-time cryptocurrency prices
- **Coinbase Advanced Trade API** - Broker integration
- **TensorFlow/Keras** - LSTM price prediction model

### Infrastructure
- **Supabase** - Database, Authentication, and API (Free tier available)
- **Render** - Backend hosting (Free tier with spin-down, $7/month for always-on)
- **Replit** - Frontend hosting (Free tier available)
- **Custom Domain** - `dcrpyto.com` (configured)

**Hosting Costs:**
- **Free Option**: Render free tier (15min spin-down) + Replit free tier
- **Production Option**: Render Starter ($7/month) + Replit free tier = **$7/month total**

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (backend)
- Node.js 14+ and npm (frontend)
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Arjunkocharla/DCrypto.git
cd DCrypto
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-core.txt

# Create .env file
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PORT=8085
EOF

# Run the server
python app.py
```

Backend runs on `http://127.0.0.1:8085`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
cat > .env << EOF
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=http://127.0.0.1:8085/api
EOF

# Start the app
npm start
```

Frontend runs on `http://localhost:3000`

#### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL schema from `backend/supabase_schema.sql`
4. Enable Row Level Security (RLS) policies

See `SUPABASE_AUTH_SETUP.md` for detailed authentication setup.

## 📡 API Endpoints

### Transactions
- `GET /api/transactions?userId=<id>&limit=50` - Get user transactions
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/<id>?userId=<id>` - Update transaction
- `DELETE /api/transactions/<id>?userId=<id>` - Delete transaction

### Portfolio
- `GET /api/portfolio?userId=<id>` - Get portfolio summary with real-time prices

### Analytics
- `GET /api/analytics/performance?userId=<id>&period=<all|7d|30d|90d|1y>` - Performance metrics
- `GET /api/analytics/performers?userId=<id>&limit=5` - Best/worst performers
- `GET /api/analytics/history?userId=<id>&days=30` - Portfolio history

### Broker Integration
- `POST /api/broker/import` - Import transactions from broker (Coinbase)

### Predictions
- `GET /api/prediction` - Get Bitcoin price predictions

## 🌐 Deployment

**Live URLs:**
- **Frontend**: [https://dcrpyto.com](https://dcrpyto.com)
- **Backend API**: `https://api.dcrpyto.com/api` (or Render default URL)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Backend Deployment (Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up/login

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch

3. **Configure Service**
   - **Name**: `dcrypto-backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements-core.txt
     ```
   - **Start Command**: 
     ```bash
     python app.py
     ```
   - **Root Directory**: `backend`

4. **Set Environment Variables**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CORS_ORIGINS=https://your-frontend-url.repl.co,https://your-custom-domain.com
   PORT=8085
   FLASK_ENV=production
   DEBUG=False
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Note the service URL (e.g., `https://dcrypto-backend.onrender.com`)

### Frontend Deployment (Replit)

1. **Create Replit Account**
   - Go to [replit.com](https://replit.com)
   - Sign up/login

2. **Import Repository**
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Enter repository URL: `https://github.com/Arjunkocharla/DCrypto`
   - Select "Node.js" template

3. **Configure Replit**
   - **Root Directory**: Set to `frontend` folder
   - Update `.replit` file if needed:
     ```toml
     run = "cd frontend && npm start"
     ```

4. **Set Secrets (Environment Variables)**
   - Go to "Secrets" tab (lock icon)
   - Add the following:
     ```
     REACT_APP_SUPABASE_URL=https://your-project.supabase.co
     REACT_APP_SUPABASE_ANON_KEY=your_anon_key
     REACT_APP_API_URL=https://dcrypto-backend.onrender.com/api
     ```

5. **Deploy**
   - Click "Run" to start the app
   - Replit will provide a URL (e.g., `https://dcrypto-frontend.repl.co`)
   - Enable "Always On" for persistent deployment

### Alternative: Vercel/Netlify (Frontend)

If you prefer Vercel or Netlify for frontend:

#### Vercel
1. Connect GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy automatically on push

#### Netlify
1. Connect GitHub repository
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/build`
4. Add environment variables

### Post-Deployment Checklist

- [ ] Update CORS_ORIGINS in backend with frontend URL
- [ ] Update REACT_APP_API_URL in frontend with backend URL
- [ ] Test authentication (Google OAuth + Email/Password)
- [ ] Verify database connection
- [ ] Test transaction CRUD operations
- [ ] Test broker import functionality
- [ ] Verify real-time price updates
- [ ] Test analytics endpoints

## 🔐 Environment Variables

### Backend (.env)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Server
PORT=8085
FLASK_ENV=development
DEBUG=True
```

### Frontend (.env)
```env
# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Backend API
REACT_APP_API_URL=http://127.0.0.1:8085/api
```

## 📁 Project Structure

```
DCrypto/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── config.py                 # Configuration settings
│   ├── services/
│   │   ├── transaction_service.py    # Transaction business logic
│   │   ├── broker_service.py         # Broker integration (Coinbase)
│   │   └── analytics_service.py       # Analytics calculations
│   ├── supabase_schema.sql       # Database schema
│   └── requirements-core.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── Home.js            # Portfolio dashboard
│   │   │   ├── Analysis.js        # Analytics page
│   │   │   ├── Login.js           # Authentication
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.js             # API service layer
│   │   │   └── supabase.js        # Supabase client
│   │   └── theme.js               # Chakra UI theme
│   └── package.json
├── SUPABASE_AUTH_SETUP.md        # Auth setup guide
└── README.md                     # This file
```

## 🔌 Coinbase Integration

### Setup
1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new API key with:
   - **Signature Algorithm**: ECDSA (required)
   - **Permissions**: View (or higher)
3. Download the JSON file with your credentials

### Usage
1. Click "Connect Coinbase" in the app
2. Paste the entire JSON file content (auto-parses)
3. Transactions will be imported automatically

## 🐛 Troubleshooting

### Backend Issues
- **Supabase not initialized**: Check environment variables
- **CORS errors**: Update CORS_ORIGINS with frontend URL
- **Import errors**: Run `pip install -r requirements-core.txt`

### Frontend Issues
- **Module not found**: Run `npm install --legacy-peer-deps`
- **API connection errors**: Verify backend URL in .env
- **Auth not working**: Check Supabase credentials and OAuth setup

### Deployment Issues
- **Build fails on Render**: Check Python version and dependencies
- **CORS errors in production**: Update CORS_ORIGINS with production URLs
- **Environment variables not loading**: Ensure they're set in hosting platform

## 📚 Documentation

- [Supabase Auth Setup Guide](SUPABASE_AUTH_SETUP.md) - Authentication configuration
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Domain Setup](DOMAIN_SETUP.md) - Custom domain configuration for dcrpyto.com
- [Backend Design](backend/BACKEND_DESIGN.md) - Backend architecture
- [Coinbase Integration](backend/COINBASE_INTEGRATION.md) - Broker integration details

## 🛣️ Roadmap

- [ ] Add more broker integrations (Binance, Kraken, etc.)
- [ ] Multi-coin price predictions
- [ ] Transaction export (CSV, PDF)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Tax reporting features
- [ ] Portfolio sharing

## 📝 License

This project is for educational/portfolio purposes.

## 🙏 Acknowledgments

- **Supabase** - Database and authentication
- **Coinbase** - Broker API integration
- **CoinGecko** - Real-time price data
- **Chakra UI** - Component library
- **Render** - Backend hosting
- **Replit** - Frontend hosting

## 👤 Author

**Arjun Kocharla**
- GitHub: [@Arjunkocharla](https://github.com/Arjunkocharla)
- Project: [DCrypto](https://github.com/Arjunkocharla/DCrypto)

---

**Built with ❤️ using React, Flask, and Supabase**
