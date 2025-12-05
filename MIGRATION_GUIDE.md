# Migration Guide - Modern Redesign

## Overview

The application has been completely redesigned with:
- **Modern UI/UX** with professional styling
- **Refactored Backend** with proper architecture
- **Broker Integration** for Robinhood and Coinbase
- **Improved Code Quality** and maintainability

## Backend Changes

### New Structure

```
backend/
├── app.py                 # Main Flask application (replaces server_side.py)
├── config.py              # Configuration management
├── services/
│   ├── __init__.py
│   ├── transaction_service.py    # Transaction business logic
│   └── broker_service.py         # Broker API integrations
└── requirements.txt       # Updated dependencies
```

### Key Improvements

1. **Configuration Management**: Uses environment variables via `config.py`
2. **Service Layer**: Separated business logic from API routes
3. **Error Handling**: Comprehensive error handling and logging
4. **Broker Integration**: Support for Robinhood and Coinbase APIs
5. **RESTful API**: Clean, consistent API endpoints

### New API Endpoints

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add transaction
- `DELETE /api/transactions/<id>` - Delete transaction
- `GET /api/portfolio` - Get portfolio summary
- `POST /api/broker/import` - Import from broker
- `GET /api/prediction` - Get price predictions

### Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run the server:**
   ```bash
   python app.py
   ```

## Frontend Changes

### New Structure

```
frontend/src/
├── App.js                 # Main app with routing
├── services/
│   └── api.js             # API service layer
└── components/
    ├── Layout.js          # Main layout with navigation
    ├── Home.js            # Dashboard (replaces old Home.js)
    ├── Analysis.js        # Portfolio analysis
    ├── AddTransactionModal.js    # Add transaction form
    ├── ImportBrokerModal.js       # Broker import
    ├── TransactionsTable.js       # Transaction list
    ├── TransactionItem.js        # Transaction row
    ├── Summary.js                # Portfolio summary cards
    ├── Visualization.js          # Charts and graphs
    └── PredictionChart.js         # Price prediction chart
```

### Key Improvements

1. **Modern UI**: Professional design with Chakra UI
2. **API Service Layer**: Centralized API communication
3. **Better State Management**: Improved React patterns
4. **Responsive Design**: Works on all screen sizes
5. **Error Handling**: Toast notifications for user feedback
6. **Broker Integration UI**: Easy import from brokers

### Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   echo "REACT_APP_API_URL=http://127.0.0.1:8085/api" > .env
   ```

3. **Run the app:**
   ```bash
   npm start
   ```

## Broker Integration

### Supported Brokers

1. **Robinhood**
   - Requires OAuth2 authentication
   - Placeholder implementation (needs OAuth2 flow)
   - Username/password for now (will be updated)

2. **Coinbase**
   - Uses API key and secret
   - HMAC authentication
   - Placeholder implementation (needs proper signing)

### How to Use

1. Go to the Transactions page
2. Click "Import from Broker"
3. Select your broker
4. Enter credentials
5. Click "Import Transactions"

**Note**: Broker integrations are placeholder implementations. Full OAuth2/HMAC authentication needs to be implemented for production use.

## Migration Steps

### For Existing Data

1. **Backup your database** before migrating
2. The new API is compatible with existing Firestore structure
3. Old endpoints still work but new ones are recommended

### Breaking Changes

1. **API Endpoints**: Changed from `/get_transactions` to `/api/transactions`
2. **Response Format**: Some endpoints return different structures
3. **Frontend Routes**: Changed from `/Analysis` to `/analysis`

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=your_host
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password

# Firebase
FIREBASE_CREDENTIALS_PATH=path/to/credentials.json

# Broker APIs
ROBINHOOD_CLIENT_ID=your_id
ROBINHOOD_CLIENT_SECRET=your_secret
COINBASE_API_KEY=your_key
COINBASE_API_SECRET=your_secret

# Server
FLASK_ENV=development
DEBUG=True
PORT=8085
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://127.0.0.1:8085/api
```

## Features

### New Features

1. **Broker Import**: Import transactions from Robinhood/Coinbase
2. **Better UI**: Modern, professional design
3. **Portfolio Summary**: Quick overview cards
4. **Improved Charts**: Better visualizations
5. **Error Handling**: User-friendly error messages
6. **Loading States**: Better UX with loading indicators

### Improved Features

1. **Transaction Management**: Better forms and validation
2. **Portfolio Analysis**: Enhanced charts and metrics
3. **Price Predictions**: Integrated prediction chart
4. **Responsive Design**: Works on mobile and desktop

## Troubleshooting

### Backend Issues

1. **Firebase not initialized**: Check credentials file path
2. **Import errors**: Ensure broker credentials are correct
3. **Port conflicts**: Change PORT in .env

### Frontend Issues

1. **API errors**: Check REACT_APP_API_URL in .env
2. **CORS errors**: Ensure backend CORS_ORIGINS includes frontend URL
3. **Build errors**: Run `npm install` again

## Next Steps

1. **Implement OAuth2** for Robinhood
2. **Implement HMAC signing** for Coinbase
3. **Add user authentication**
4. **Add more brokers** (Binance, Kraken, etc.)
5. **Add transaction editing**
6. **Add export functionality**

## Support

For issues or questions, check:
- Backend logs in console
- Browser console for frontend errors
- Network tab for API calls

