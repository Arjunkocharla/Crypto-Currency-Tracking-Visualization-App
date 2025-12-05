# Backend Setup Guide

## Creating Virtual Environment

### Step 1: Create Virtual Environment

```bash
cd backend
python3 -m venv venv
```

### Step 2: Activate Virtual Environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt when activated.

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Create .env File

```bash
cp .env.example .env
# Then edit .env with your actual credentials
```

### Step 5: Run the Application

```bash
python app.py
```

## Deactivating Virtual Environment

When you're done, deactivate the virtual environment:

```bash
deactivate
```

## Troubleshooting

### If `python3` doesn't work:
- Try `python` instead
- Make sure Python 3.8+ is installed: `python --version`

### If venv creation fails:
- Install venv: `pip install virtualenv`
- Or use: `python -m virtualenv venv`

### If pip install fails:
- Upgrade pip first: `pip install --upgrade pip`
- Check Python version (needs 3.8+)

