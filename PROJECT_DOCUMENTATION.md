# Crypto Portfolio Tracking Application - Complete Documentation

## Project Overview

This is a full-stack cryptocurrency portfolio tracking and visualization application built with:
- **Backend**: Python Flask API with PostgreSQL/Firebase Firestore
- **Frontend**: React.js with Chakra UI
- **ML Component**: LSTM model for Bitcoin price prediction

**Team Members:**
- Nagarjuna Kocharla: Backend API development, database integration
- Sahithi Nallani: LSTM prediction model development
- Niharika Chundury: Frontend React development

---

## Architecture Overview

### System Architecture
```
Frontend (React) → Backend API (Flask) → Database (PostgreSQL/Firestore)
                              ↓
                    ML Model (LSTM) for Predictions
                              ↓
                    External APIs (CoinGecko, Yahoo Finance)
```

### Technology Stack

**Backend:**
- Flask 2.2.2
- Flask-CORS for cross-origin requests
- PostgreSQL (via psycopg2) or Firebase Firestore
- TensorFlow/Keras for LSTM model
- yfinance for historical price data
- CoinGecko API for live prices

**Frontend:**
- React 17.0.2
- React Router DOM 6.4.3
- Chakra UI 1.7.4
- Recharts 2.1.8 for visualizations

---

## Backend Architecture

### File Structure

#### 1. `server.py` (Main PostgreSQL-based Server)
**Port**: 5000  
**Purpose**: Primary Flask server using PostgreSQL database

**Key Components:**
- PostgreSQL connection pool (1-600 connections)
- Database: `postgres` on AWS RDS (`cryptodb.cb0o6zu61rpk.us-east-1.rds.amazonaws.com`)
- Connection credentials: user=`docker`, password=`docker1234`

**API Endpoints:**

1. **GET `/`** - Health check
   - Returns: "DataBase is up and running!!"

2. **GET `/transactions`**
   - Fetches last 15 transactions (excluding deleted)
   - Returns: JSON grouped by coin symbol
   - Format: `{ "BTC": [transaction1, transaction2, ...], ... }`

3. **GET `/get_details_coinwise`**
   - Calculates portfolio summary per coin
   - Returns array with:
     - `symbol`: Coin symbol (BTC, ETH, etc.)
     - `coins`: Total coins held
     - `total_value`: Total USD invested
     - `total_equity`: Current market value
     - `live_price`: Current price from CoinGecko
   - Logic: Aggregates buy/sell transactions, fetches live prices

4. **POST `/transactions`**
   - Adds new transaction
   - Request body:
     ```json
     {
       "name": "Bitcoin",
       "symbol": "BTC",
       "type": "buy" | "sell",
       "value_usd": 1000.00,
       "purchased_price": 50000.00,
       "date": "2023-01-01-12:00",
       "coins": 0.02
     }
     ```
   - Validation: For "sell", checks if user has enough coins
   - Returns: Transaction JSON or error message

5. **DELETE `/transactions`**
   - Soft delete transaction (sets status='delete')
   - Request body: `{ "id": 123 }`
   - Resets sequence after deletion

6. **GET `/prediction`**
   - Generates Bitcoin price forecast using LSTM model
   - Process:
     1. Loads pre-trained model from `model.pkl`
     2. Fetches BTC-USD data from yfinance (from 2022-05-05 to 50 days future)
     3. Preprocesses data with MinMaxScaler
     4. Creates sequences of 100 days for prediction
     5. Generates predictions and scales back
     6. Saves plot to `../frontend/src/components/Prediction.png`
   - Returns: Array of predicted prices

**Helper Functions:**
- `total_coins_value(symbol)`: Calculates total coins and value for a symbol
- Uses `convert_entry_to_transaction()` from `backend_logic.py`

**Coin Symbol Mapping:**
```python
{
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "XRP": "ripple",
    "LTC": "litecoin",
    "BCH": "bitcoin-cash",
    "EOS": "eos",
    "XLM": "stellar",
    "ADA": "cardano",
    "SOL": "solana"
}
```

---

#### 2. `server_side.py` (Firebase-based Server)
**Port**: 8085  
**Purpose**: Alternative Flask server using Firebase Firestore

**Key Components:**
- Firebase Admin SDK initialization
- Firestore database connection
- Uses `transactions.py` module for business logic

**API Endpoints:**

1. **POST `/add_transaction`**
   - Adds transaction to Firestore
   - Calls `add_transaction()` from `transactions.py`
   - Returns: Success message with transaction ID or error

2. **GET `/get_transactions`**
   - Fetches all transactions from Firestore
   - Calls `get_transactions()` from `transactions.py`
   - Returns: Array of transaction objects with IDs

3. **GET `/get_details_coinwise`**
   - Gets coin-wise portfolio details
   - Calls `get_coin_wise_details()` from `transactions.py`
   - Enriches with live prices from CoinGecko
   - Returns: Array similar to PostgreSQL version

---

#### 3. `transactions.py` (Firebase Transaction Logic)
**Purpose**: Business logic for Firestore operations

**Functions:**

1. **`add_transaction(db, data)`**
   - Adds transaction to Firestore `transaction` collection
   - Fields:
     - `name`, `symbol`, `type`, `value_usd`, `purchased_price`
     - `date`: SERVER_TIMESTAMP
     - `coins`, `status` (default: 'active')
     - `createdBy`, `userId`
   - Validation: Checks required fields (`value_usd`, `purchased_price`, `coins`, `userId`)
   - Returns: Success message with transaction ID or error

2. **`get_transactions(db)`**
   - Fetches all transactions from Firestore
   - Returns: Array of transaction dictionaries with document IDs

3. **`get_coin_wise_details(db)`**
   - Aggregates transactions by coin symbol
   - Calculates:
     - `coins`: Net coins (buy - sell)
     - `total_value`: Net USD invested
   - Filters: Excludes transactions with `status='delete'`
   - Returns: Dictionary `{symbol: {coins, total_value}}`

---

#### 4. `backend_logic.py` (Transaction Utilities)
**Purpose**: Helper functions for transaction processing

**Components:**

1. **Transaction Dataclass:**
   ```python
   @dataclass(frozen=True)
   class Transaction:
       id: int
       name: str
       symbol: str
       Type: str
       value_usd: float
       purchased_price: float
       date: datetime
       coins: float
   ```

2. **`convert_entry_to_transaction(entry)`**
   - Converts database row tuple to transaction dictionary
   - Handles:
     - Value conversion: `value_usd/100` (stored as cents)
     - Date formatting: `YYYY-MM-DD-HH:MM`
     - Type casting for floats

**Constants:**
- `buy = 1`
- `sell = 0`

---

#### 5. `prediction_model.py` (LSTM Model Development)
**Purpose**: Jupyter notebook-style code for training LSTM model

**Model Architecture:**
- **Type**: Sequential LSTM (RNN)
- **Layers**:
  1. LSTM(50 units, return_sequences=True) + Dropout(0.2)
  2. LSTM(60 units, return_sequences=True) + Dropout(0.3)
  3. LSTM(80 units, return_sequences=True) + Dropout(0.4)
  4. LSTM(120 units) + Dropout(0.5)
  5. Dense(1 unit) - output layer
- **Input Shape**: (100, 5) - 100 days of 5 features
- **Features**: Open, High, Low, Close, Volume (excludes Adj Close)
- **Optimizer**: Adam
- **Loss**: Mean Squared Error
- **Training**: 100 epochs, batch_size=50, validation_split=0.1

**Data Processing:**
- Source: yfinance BTC-USD (from 2014-09-17 to present)
- Training cutoff: Before 2022-12-01
- Normalization: MinMaxScaler
- Sequence creation: 100-day windows for time series prediction
- Model saved as: `model.pkl` (pickle) and `sahithi/` (TensorFlow SavedModel)

---

### Database Schema

#### PostgreSQL (server.py)
**Table: `transactions`**
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR
- symbol: VARCHAR (BTC, ETH, etc.)
- type: VARCHAR (buy/sell)
- value_usd: INTEGER (stored as cents, divided by 100 in API)
- purchased_price: DECIMAL
- date: TIMESTAMP
- coins: DECIMAL
- status: VARCHAR (default: 'active', 'delete' for soft deletes)
```

#### Firebase Firestore (server_side.py)
**Collection: `transaction`**
```javascript
{
  name: string,
  symbol: string,
  type: string,
  value_usd: number,
  purchased_price: number,
  date: Timestamp (SERVER_TIMESTAMP),
  coins: number,
  status: string,
  createdBy: string,
  userId: string
}
```

---

## Frontend Architecture

### File Structure

#### 1. `App.js` (Main Router)
**Purpose**: Application routing

**Routes:**
- `/` → `<Home />` component
- `/Analysis` → `<Analysis />` component

**Dependencies:**
- React Router DOM for client-side routing

---

#### 2. `Home.js` (Main Dashboard)
**Purpose**: Transaction management interface

**State Management:**
- `transactions`: Array of transaction objects
- `isOpen`: Modal open/close state (Chakra UI)

**Features:**
- Fetches transactions from `http://127.0.0.1:8085/get_transactions`
- Displays transactions in table format
- "Enter Transaction" button opens AddModal
- "Portfolio Analysis" button navigates to `/Analysis`
- Auto-refreshes transactions when modal closes

**Components Used:**
- `TransactionsTable`: Displays transaction list
- `AddModal`: Form for adding new transactions

**Styling:**
- Background: `#004b49` (dark teal)
- Chakra UI components with teal color scheme

---

#### 3. `Analysis.js` (Portfolio Analysis)
**Purpose**: Portfolio performance visualization

**State Management:**
- `portfolioCost`: Total USD invested
- `portfolioValue`: Current market value
- `absoluteGain`: Profit/loss in USD
- `totalGainPercent`: Profit/loss percentage
- `rollups`: Array of coin-wise details

**Data Flow:**
1. Fetches from `http://127.0.0.1:8085/get_details_coinwise`
2. Calculates portfolio metrics:
   - Cost = sum of `total_value`
   - Value = sum of `total_equity`
   - Gain = Value - Cost
   - Gain % = (Gain / Cost) * 100

**Components Used:**
- `Summary`: Displays portfolio metrics
- `Visualization`: Charts and graphs
- Navigation buttons: "Back" (to home), "Forecast" (placeholder)

---

#### 4. `TransactionsTable.js` (Transaction List)
**Purpose**: Renders transaction table

**Props:**
- `transactions`: Array of transaction objects

**Features:**
- Chakra UI Table component
- Columns:
  - Name, Symbol, Type, Number of Coins
  - Price Purchased At, Value USD, Transaction Date, Actions
- Maps transactions to `TransactionItem` components
- Table caption: "All crypto buy and sell records"

**Note:** `handleSaveTransaction` function is defined but `addTransaction` is not imported (potential bug)

---

#### 5. `TransactionItem.js` (Individual Transaction Row)
**Purpose**: Editable transaction row

**State Management:**
- `editMode`: Boolean for edit/view mode
- `editedTransaction`: Local copy of transaction data

**Features:**
- View mode: Displays transaction data
- Edit mode: Input fields for all transaction fields
- "Edit" button toggles edit mode
- "Save" button calls `onSave` prop (from parent)
- Fields: name, symbol, type, coins, purchased_price, value_usd, date

**Styling:**
- Chakra UI Input and Button components
- Numeric fields use `isNumeric` prop

---

#### 6. `AddModal.js` (Add Transaction Form)
**Purpose**: Modal form for adding new transactions

**State Management:**
- Form fields: `type`, `name`, `symbol`, `purchasedPrice`, `date`, `coins`, `valueUSD`

**Features:**
- Chakra UI Modal component
- Input fields with green focus border
- "Add Transaction" button submits form
- API call: `POST http://127.0.0.1:8085/add_transaction`
- Payload structure:
  ```json
  {
    "name": string,
    "symbol": string,
    "type": string,
    "purchased_price": number,
    "date": string,
    "coins": number,
    "value_usd": number
  }
  ```
- On success: Closes modal and triggers refresh (via `onAdd` callback)

**Note:** `onAdd` prop is referenced but not passed from `Home.js` (potential bug)

---

#### 7. `Summary.js` (Portfolio Metrics)
**Purpose**: Displays portfolio summary cards

**Props:**
- `portfolioCost`: Total invested
- `portfolioValue`: Current value
- `absoluteGain`: Profit/loss amount
- `totalGainPercent`: Profit/loss percentage

**Features:**
- Four Chakra UI Container cards with orange background
- Metrics displayed:
  1. Portfolio Cost (formatted with commas)
  2. Portfolio Value (formatted with commas)
  3. Absolute Gain / Loss (formatted with commas)
  4. Gain / Loss % (2 decimal places)

**Styling:**
- Orange background containers
- Large text (2xl) for values
- Small text (xs) for labels

---

#### 8. `Visualization.js` (Charts and Graphs)
**Purpose**: Portfolio visualization with charts

**Props:**
- `rollups`: Array of coin-wise data

**Features:**
- **Bar Chart** (Recharts):
  - X-axis: Coin symbols
  - Y-axis: USD values
  - Bars: `total_equity` (orange) and `total_cost` (pink)
  - Title: "Cost vs Equity"
  
- **Pie Charts** (Recharts):
  1. Cost Distribution: `total_value` by symbol
  2. Equity Distribution: `total_equity` by symbol
  - Color palette: 11 predefined colors (rotating)
  - Legend and tooltips enabled

**Color Palette:**
```javascript
["#FFA500", "#FFC0CB", "#FFBB28", "#F28042", "#9fd3c7", 
 "#142d4c", "#feff9a", "#ffb6b9", "#fae3d9", "#bbded6", "#61c0bf"]
```

---

### Frontend Data Flow

1. **Transaction Management:**
   ```
   User → AddModal → POST /add_transaction → Firestore
   User → Home → GET /get_transactions → Display in TransactionsTable
   ```

2. **Portfolio Analysis:**
   ```
   User → Analysis → GET /get_details_coinwise → Calculate metrics → Display Summary + Visualization
   ```

3. **State Updates:**
   - Transactions refresh when AddModal closes
   - Analysis data fetched on component mount

---

## API Integration Points

### External APIs

1. **CoinGecko API**
   - Endpoint: `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd`
   - Used for: Live cryptocurrency prices
   - Mapped symbols: BTC, ETH, XRP, LTC, BCH, EOS, XLM, ADA, SOL

2. **Yahoo Finance (yfinance)**
   - Used for: Historical Bitcoin price data
   - Symbol: `BTC-USD`
   - Data range: 2022-05-05 to 50 days future (for predictions)

---

## Key Business Logic

### Transaction Processing

1. **Buy Transaction:**
   - Adds coins to portfolio
   - Increases `total_value` (cost basis)
   - No validation needed

2. **Sell Transaction:**
   - Validates: `coin_details["total_value"] >= value_usd`
   - Reduces coins from portfolio
   - Decreases `total_value` (cost basis)
   - Error: "You cannot sell more than you have"

### Portfolio Calculation

**Per Coin:**
```python
# Buy transactions
coins += transaction_coins
total_value += transaction_value

# Sell transactions
if transaction_coins >= collection[coin]["coins"]:
    coins -= transaction_coins
    total_value -= transaction_value
```

**Total Portfolio:**
```javascript
portfolioCost = sum(total_value) for all coins
portfolioValue = sum(total_equity) for all coins
absoluteGain = portfolioValue - portfolioCost
totalGainPercent = (absoluteGain / portfolioCost) * 100
```

### Price Fetching

1. Map symbol to CoinGecko ID
2. Fetch live price from API
3. Calculate `total_equity = coins * live_price`

---

## Configuration Files

### `docker-compose.yaml`
- **PostgreSQL Service:**
  - Image: `postgres`
  - Port: 5432
  - Database: `cryptodb`
  - User: `docker`
  - Password: `docker`
  
- **Adminer Service:**
  - Image: `adminer`
  - Port: 8080
  - Database admin interface

### `requirements.txt`
Key dependencies:
- Flask, Flask-CORS
- psycopg2-binary (PostgreSQL)
- tensorflow, keras (ML model)
- yfinance, pandas, numpy
- matplotlib, scikit-learn

### `package.json`
Key dependencies:
- React, React-DOM
- React Router DOM
- Chakra UI
- Recharts

---

## Known Issues & Notes

1. **Frontend Bugs:**
   - `TransactionsTable.js`: `addTransaction` function not imported
   - `AddModal.js`: `onAdd` prop not passed from `Home.js`
   - `TransactionItem.js`: Edit functionality may not persist (no API call visible)

2. **Backend Notes:**
   - Two separate servers: `server.py` (PostgreSQL, port 5000) and `server_side.py` (Firebase, port 8085)
   - Frontend currently uses port 8085 (Firebase version)
   - Prediction endpoint saves image to frontend directory (may cause path issues)

3. **Data Consistency:**
   - PostgreSQL stores `value_usd` as cents (divided by 100 in API)
   - Firestore stores `value_usd` as dollars
   - Date formats: PostgreSQL uses timestamp, Firestore uses SERVER_TIMESTAMP

4. **Security:**
   - Database credentials hardcoded in `server.py`
   - Firebase credentials file in repository (should be in .gitignore)
   - No authentication/authorization implemented

---

## Deployment Considerations

1. **Environment Variables:**
   - Database credentials should be environment variables
   - Firebase credentials should not be in repository

2. **CORS:**
   - Currently allows all origins
   - Should restrict to frontend domain in production

3. **Error Handling:**
   - Basic error handling present
   - Should add comprehensive error logging

4. **Model Loading:**
   - LSTM model loaded from pickle file
   - Ensure model file is available in production

---

## Future Enhancements

1. **Prediction Integration:**
   - Connect `/prediction` endpoint to frontend
   - Display forecast chart in Analysis page

2. **User Authentication:**
   - Add user login/registration
   - Filter transactions by userId

3. **Real-time Updates:**
   - WebSocket for live price updates
   - Auto-refresh portfolio values

4. **Transaction Editing:**
   - Implement PUT endpoint for updates
   - Connect frontend edit functionality

5. **Multi-coin Predictions:**
   - Extend LSTM model to other cryptocurrencies
   - Allow user to select coin for prediction

---

## Development Workflow

1. **Backend:**
   - Start PostgreSQL: `docker-compose up`
   - Run server: `python server.py` (port 5000) or `python server_side.py` (port 8085)

2. **Frontend:**
   - Install: `npm install`
   - Run: `npm start` (port 3000)

3. **Testing:**
   - Backend: Use Insomnia/Postman
   - Frontend: React development server with hot reload

---

## File Locations Reference

**Backend:**
- Main server (PostgreSQL): `backend/server.py`
- Firebase server: `backend/server_side.py`
- Transaction logic: `backend/transactions.py`
- Utilities: `backend/backend_logic.py`
- ML model: `backend/prediction_model.py`
- Model file: `backend/model.pkl`
- Saved model: `backend/sahithi/`

**Frontend:**
- Entry point: `frontend/src/index.js`
- Router: `frontend/src/App.js`
- Components: `frontend/src/components/`
- Prediction image: `frontend/src/components/Prediction.png`

---

*Documentation generated for context and reference purposes.*

