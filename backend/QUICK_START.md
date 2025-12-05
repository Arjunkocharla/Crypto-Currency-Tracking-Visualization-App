# Quick Start Guide

## ✅ Virtual Environment Setup Complete!

Your virtual environment has been created and core dependencies installed.

## How to Use

### 1. Activate Virtual Environment

**Every time you want to work on the project:**

```bash
cd backend
source venv/bin/activate
```

You'll see `(venv)` in your terminal prompt when it's active.

### 2. Run the Application

```bash
python app.py
```

The server will start on `http://127.0.0.1:8085`

### 3. Deactivate When Done

```bash
deactivate
```

## What Was Installed

✅ Flask & Flask-CORS (web framework)
✅ Firebase Admin SDK (database)
✅ Python-dotenv (environment variables)
✅ Requests (HTTP client)
✅ PostgreSQL driver (psycopg2)
✅ Pandas & NumPy (data processing)
✅ TensorFlow & Keras (ML model)
✅ Scikit-learn (ML utilities)
✅ yfinance (crypto price data)
✅ Matplotlib (plotting)

## Next Steps

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

2. **Run the server:**
   ```bash
   source venv/bin/activate
   python app.py
   ```

3. **Start frontend** (in another terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Troubleshooting

- **"venv: command not found"**: Make sure you're in the `backend` directory
- **"python: command not found"**: Try `python3` instead
- **Import errors**: Make sure venv is activated (you should see `(venv)` in prompt)
- **Flask/Werkzeug compatibility error**: Already fixed! Flask upgraded to 3.1.2

## Notes

- The old `requirements.txt` had compatibility issues with Python 3.13
- We created `requirements-core.txt` with updated, compatible versions
- All essential packages are installed and ready to use!

