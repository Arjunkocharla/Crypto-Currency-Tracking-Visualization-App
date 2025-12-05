# Crypto Portfolio Tracker - Modern Redesign

A professional cryptocurrency portfolio tracking application with broker integration, modern UI, and price prediction capabilities.

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your credentials

# Run the server
python app.py
```

Server will run on `http://127.0.0.1:8085`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://127.0.0.1:8085/api" > .env

# Run the app
npm start
```

App will run on `http://localhost:3000`

## ✨ Features

### Modern UI/UX
- Professional, clean design
- Responsive layout (mobile & desktop)
- Real-time portfolio updates
- Interactive charts and visualizations

### Transaction Management
- Add transactions manually
- Import from brokers (Robinhood, Coinbase)
- View transaction history
- Delete transactions

### Portfolio Analysis
- Real-time portfolio value
- Gain/loss tracking
- Cost vs equity comparison
- Distribution charts (pie & bar)

### Price Prediction
- Bitcoin price forecasting using LSTM
- Interactive prediction charts
- Historical data analysis

## 🏗️ Architecture

### Backend
- **Flask** REST API
- **Firebase Firestore** database
- **Service layer** architecture
- **Broker integration** modules

### Frontend
- **React** with hooks
- **Chakra UI** components
- **Recharts** for visualizations
- **React Router** for navigation

## 📡 API Endpoints

- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Add transaction
- `DELETE /api/transactions/<id>` - Delete transaction
- `GET /api/portfolio` - Get portfolio summary
- `POST /api/broker/import` - Import from broker
- `GET /api/prediction` - Get price predictions

## 🔌 Broker Integration

### Supported Brokers
- **Robinhood** (OAuth2 - placeholder)
- **Coinbase** (API keys - placeholder)

### How to Import
1. Click "Import from Broker" button
2. Select your broker
3. Enter credentials
4. Transactions will be imported automatically

**Note**: Broker integrations are placeholder implementations. Full OAuth2/HMAC authentication needs to be implemented for production.

## 🛠️ Tech Stack

### Backend
- Python 3.8+
- Flask 2.2.2
- Firebase Admin SDK
- TensorFlow/Keras (LSTM model)
- yfinance, pandas, numpy

### Frontend
- React 17.0.2
- Chakra UI 1.7.4
- Recharts 2.1.8
- React Router 6.4.3

## 📁 Project Structure

```
cryptoapp/
├── backend/
│   ├── app.py              # Main Flask app
│   ├── config.py           # Configuration
│   ├── services/            # Business logic
│   │   ├── transaction_service.py
│   │   └── broker_service.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main app
│   │   ├── services/       # API service
│   │   └── components/     # React components
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

See `.env.example` files in backend and frontend directories.

## 📝 Notes

- This is a complete redesign of the original project
- Old endpoints are deprecated but still functional
- Broker integrations need full OAuth2/HMAC implementation
- User authentication can be added as next step

## 🐛 Troubleshooting

1. **Backend won't start**: Check Firebase credentials path
2. **Frontend API errors**: Verify REACT_APP_API_URL in .env
3. **CORS errors**: Update CORS_ORIGINS in backend config
4. **Import fails**: Check broker credentials

## 📚 Documentation

- See `MIGRATION_GUIDE.md` for migration details
- See `PROJECT_DOCUMENTATION.md` for complete documentation

## 🎯 Next Steps

1. Implement full OAuth2 for Robinhood
2. Implement HMAC signing for Coinbase
3. Add user authentication
4. Add more brokers (Binance, Kraken)
5. Add transaction editing
6. Add export functionality

---

Built with ❤️ using modern web technologies

