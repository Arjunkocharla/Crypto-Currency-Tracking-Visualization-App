"""
Configuration settings for the application
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'cryptodb.cb0o6zu61rpk.us-east-1.rds.amazonaws.com')
    DB_NAME = os.getenv('DB_NAME', 'postgres')
    DB_USER = os.getenv('DB_USER', 'docker')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'docker1234')
    DB_POOL_MIN = int(os.getenv('DB_POOL_MIN', 1))
    DB_POOL_MAX = int(os.getenv('DB_POOL_MAX', 600))
    
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    
    # API Configuration
    COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd"
    YFINANCE_SYMBOL = "BTC-USD"
    
    # Broker API Keys (set these in environment variables)
    ROBINHOOD_CLIENT_ID = os.getenv('ROBINHOOD_CLIENT_ID', '')
    ROBINHOOD_CLIENT_SECRET = os.getenv('ROBINHOOD_CLIENT_SECRET', '')
    COINBASE_API_KEY = os.getenv('COINBASE_API_KEY', '')
    COINBASE_API_SECRET = os.getenv('COINBASE_API_SECRET', '')
    
    # CORS Configuration
    # Allow common localhost ports for development
    # In production, set CORS_ORIGINS environment variable to your frontend domain
    default_origins = 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', default_origins).split(',')
    
    # Server Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    PORT = int(os.getenv('PORT', 8085))

