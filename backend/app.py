"""
Modern Flask application with proper structure
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
import logging
try:
    from config import Config
    from services.transaction_service import TransactionService
    from services.broker_service import get_broker_service
    from services.analytics_service import AnalyticsService
except ImportError:
    # Fallback for development
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from config import Config
    from services.transaction_service import TransactionService
    from services.broker_service import get_broker_service
    from services.analytics_service import AnalyticsService
from datetime import datetime
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# CORS configuration
CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

# Initialize Supabase
supabase_client: Optional[Client] = None
try:
    if Config.SUPABASE_URL and Config.SUPABASE_SERVICE_ROLE_KEY:
        supabase_client = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_SERVICE_ROLE_KEY
        )
        logger.info("Supabase initialized successfully")
    else:
        logger.warning("Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
except Exception as e:
    logger.error(f"Supabase initialization failed: {e}")
    supabase_client = None

# Initialize services
transaction_service = TransactionService(supabase_client) if supabase_client else None
analytics_service = AnalyticsService(transaction_service) if transaction_service else None


@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "crypto-portfolio-api",
        "version": "2.0.0"
    }), 200


@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    """Get all transactions"""
    try:
        user_id = request.args.get('userId', 'default')
        limit = int(request.args.get('limit', 50))
        
        if not transaction_service:
            return jsonify({"error": "Database not initialized"}), 500
        
        transactions, status_code = transaction_service.get_transactions(user_id=user_id, limit=limit)
        return jsonify(transactions), status_code
    except Exception as e:
        logger.error(f"Error in get_transactions: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    """Add a new transaction"""
    try:
        if not transaction_service:
            return jsonify({"error": "Database not initialized"}), 500
        
        data = request.json
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        result, status_code = transaction_service.add_transaction(data)
        return jsonify(result), status_code
    except Exception as e:
        logger.error(f"Error in add_transaction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/transactions/<transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    """Update an existing transaction"""
    try:
        if not transaction_service:
            return jsonify({"error": "Database not initialized"}), 500
        
        data = request.json
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        user_id = request.args.get('userId')
        result, status_code = transaction_service.update_transaction(transaction_id, data, user_id)
        return jsonify(result), status_code
    except Exception as e:
        logger.error(f"Error in update_transaction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/transactions/<transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    """Delete a transaction"""
    try:
        if not transaction_service:
            return jsonify({"error": "Database not initialized"}), 500
        
        user_id = request.args.get('userId')
        result, status_code = transaction_service.delete_transaction(transaction_id, user_id)
        return jsonify(result), status_code
    except Exception as e:
        logger.error(f"Error in delete_transaction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():
    """Get portfolio summary"""
    try:
        if not transaction_service:
            return jsonify({"error": "Database not initialized"}), 500
        
        user_id = request.args.get('userId', 'default')
        portfolio_data = transaction_service.get_coin_wise_details(user_id=user_id)
        
        # get_coin_wise_details already returns the summary structure
        # Format: {total_cost, total_value, gain, gain_percent, coins}
        if isinstance(portfolio_data, dict):
            # Convert coins dict to list for holdings
            holdings = []
            if 'coins' in portfolio_data and isinstance(portfolio_data['coins'], dict):
                for symbol, coin_data in portfolio_data['coins'].items():
                    holdings.append({
                        'symbol': symbol,
                        **coin_data
                    })
            
            return jsonify({
                "holdings": holdings,
                "summary": {
                    "total_cost": portfolio_data.get('total_cost', 0),
                    "total_equity": portfolio_data.get('total_value', 0),
                    "absolute_gain": portfolio_data.get('gain', 0),
                    "gain_percent": portfolio_data.get('gain_percent', 0)
                }
            }), 200
        else:
            # Fallback if structure is unexpected
            return jsonify({
                "holdings": [],
                "summary": {
                    "total_cost": 0,
                    "total_equity": 0,
                    "absolute_gain": 0,
                    "gain_percent": 0
                }
            }), 200
    except Exception as e:
        logger.error(f"Error in get_portfolio: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/analytics/performance", methods=["GET"])
def get_performance():
    """Get portfolio performance for a specific time period"""
    try:
        if not analytics_service:
            return jsonify({"error": "Analytics service not initialized"}), 500
        
        user_id = request.args.get('userId', 'default')
        period = request.args.get('period', 'all')  # 1d, 7d, 30d, 90d, 1y, all
        
        performance = analytics_service.get_performance_by_period(user_id, period)
        return jsonify(performance), 200
    except Exception as e:
        logger.error(f"Error in get_performance: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/analytics/performers", methods=["GET"])
def get_performers():
    """Get best and worst performing assets"""
    try:
        if not analytics_service:
            return jsonify({"error": "Analytics service not initialized"}), 500
        
        user_id = request.args.get('userId', 'default')
        limit = int(request.args.get('limit', 5))
        
        performers = analytics_service.get_best_worst_performers(user_id, limit)
        return jsonify(performers), 200
    except Exception as e:
        logger.error(f"Error in get_performers: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/analytics/history", methods=["GET"])
def get_portfolio_history():
    """Get portfolio value history over time"""
    try:
        if not analytics_service:
            return jsonify({"error": "Analytics service not initialized"}), 500
        
        user_id = request.args.get('userId', 'default')
        days = int(request.args.get('days', 30))
        
        history = analytics_service.get_portfolio_history(user_id, days)
        return jsonify(history), 200
    except Exception as e:
        logger.error(f"Error in get_portfolio_history: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/broker/import", methods=["POST"])
def import_broker_transactions():
    """Import transactions from broker (Robinhood, Coinbase)"""
    try:
        data = request.json
        broker_name = data.get('broker')
        credentials = data.get('credentials', {})
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        user_id = data.get('userId', 'default')
        
        if not broker_name:
            return jsonify({"error": "Broker name is required"}), 400
        
        # Validate credentials based on broker
        if broker_name.lower() == 'coinbase':
            # Handle JSON file format from Coinbase
            api_key = None
            api_secret = None
            
            # Check if credentials are in JSON file format (Coinbase CDP format)
            # Format: {"name": "organizations/.../apiKeys/...", "privateKey": "-----BEGIN EC PRIVATE KEY-----..."}
            if 'name' in credentials and ('privateKey' in credentials or 'private_key' in credentials):
                # Coinbase JSON file format
                api_key = credentials.get('name')
                api_secret = credentials.get('privateKey') or credentials.get('private_key')
                # Ensure newlines are preserved in PEM format
                if api_secret and '\\n' in api_secret:
                    api_secret = api_secret.replace('\\n', '\n')
            elif 'api_key' in credentials or 'apiKey' in credentials:
                # Standard format (legacy)
                api_key = credentials.get('api_key') or credentials.get('apiKey')
                api_secret = credentials.get('api_secret') or credentials.get('apiSecret') or credentials.get('privateKey') or credentials.get('private_key')
            else:
                # Try to extract from any format
                api_key = credentials.get('key') or credentials.get('access_key') or credentials.get('CB-ACCESS-KEY')
                api_secret = credentials.get('secret') or credentials.get('access_secret') or credentials.get('privateKey') or credentials.get('private_key')
            
            if not api_key or not api_secret:
                return jsonify({
                    "error": "Coinbase API key and secret are required",
                    "hint": "If you downloaded a JSON file from Coinbase, make sure to extract the 'name' (API key) and 'private_key' (API secret) fields"
                }), 400
            
            # Update credentials with extracted values
            credentials = {
                'api_key': api_key,
                'api_secret': api_secret
            }
        elif broker_name.lower() == 'robinhood':
            # Robinhood will use OAuth2, credentials handled differently
            pass
        
        # Get broker service
        broker_service = get_broker_service(broker_name, **credentials)
        if not broker_service:
            return jsonify({"error": f"Unsupported broker: {broker_name}"}), 400
        
        # Parse dates (if not provided, don't filter by date)
        start = None
        end = None
        if start_date:
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            except:
                try:
                    start = datetime.fromisoformat(start_date)
                except:
                    logger.warning(f"Could not parse start_date: {start_date}")
        if end_date:
            try:
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            except:
                try:
                    end = datetime.fromisoformat(end_date)
                except:
                    logger.warning(f"Could not parse end_date: {end_date}")
        
        # If no dates provided, fetch all transactions (no date filtering)
        if not start and not end:
            logger.info("No date range provided, fetching all transactions")
        
        # Check if mock mode is requested (for testing without real trades)
        use_mock = data.get('use_mock_data', False)
        
        # Fetch transactions from broker
        try:
            # For Coinbase: If authentication succeeds but no transactions found, use mock data automatically
            if broker_name.lower() == 'coinbase' and not use_mock:
                try:
                    transactions = broker_service.get_transactions(start_date=start, end_date=end, use_mock_data=False)
                    # If no transactions found but auth succeeded, use mock data
                    if len(transactions) == 0:
                        logger.info("Coinbase authentication succeeded but no transactions found. Using mock data.")
                        transactions = broker_service.get_transactions(start_date=start, end_date=end, use_mock_data=True)
                except Exception as auth_error:
                    # If auth fails, don't fall back to mock
                    raise auth_error
            else:
                transactions = broker_service.get_transactions(start_date=start, end_date=end, use_mock_data=use_mock)
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error fetching transactions from {broker_name}: {error_msg}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Provide more user-friendly error messages
            if "authentication" in error_msg.lower() or "401" in error_msg or "credentials" in error_msg.lower():
                user_error = "Invalid Coinbase API credentials. Please check your API key and secret."
            elif "403" in error_msg or "forbidden" in error_msg.lower():
                user_error = "API access forbidden. Please check your API key permissions."
            elif "rate limit" in error_msg.lower() or "429" in error_msg:
                user_error = "Rate limit exceeded. Please try again in a few minutes."
            else:
                user_error = f"Failed to fetch transactions: {error_msg}"
            
            return jsonify({
                "error": user_error,
                "details": error_msg
            }), 500
        
        if not transactions:
            return jsonify({
                "message": "No transactions found",
                "imported": 0,
                "total": 0,
                "errors": []
            }), 200
        
        # Import transactions (with duplicate detection)
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for transaction in transactions:
            try:
                # Add user ID and ensure required fields
                transaction['userId'] = user_id
                
                # Check for duplicate using external_id
                if transaction.get('external_id'):
                    # Check if transaction with this external_id already exists
                    existing_transactions, _ = transaction_service.get_transactions(user_id=user_id, limit=1000)
                    duplicate = any(
                        t.get('external_id') == transaction.get('external_id') and 
                        t.get('source') == transaction.get('source')
                        for t in existing_transactions
                    )
                    
                    if duplicate:
                        skipped_count += 1
                        logger.info(f"Skipping duplicate transaction: {transaction.get('external_id')} (source: {transaction.get('source')})")
                        continue
                else:
                    # If no external_id, log a warning
                    logger.warning(f"Transaction missing external_id: {transaction.get('symbol')} {transaction.get('type')}")
                
                # Add transaction
                result, status_code = transaction_service.add_transaction(transaction)
                if status_code == 201:
                    imported_count += 1
                    logger.info(f"Successfully imported transaction: {transaction.get('symbol')} {transaction.get('type')} (external_id: {transaction.get('external_id')})")
                else:
                    error_msg = result.get('error', 'Unknown error') if isinstance(result, dict) else str(result)
                    logger.error(f"Failed to import transaction: {error_msg}")
                    errors.append({
                        "transaction": transaction.get('external_id', transaction.get('symbol', 'unknown')),
                        "error": error_msg
                    })
            except Exception as e:
                logger.error(f"Error importing transaction: {e}")
                errors.append({
                    "transaction": transaction.get('external_id', 'unknown'),
                    "error": str(e)
                })
        
        return jsonify({
            "message": f"Imported {imported_count} transactions, skipped {skipped_count} duplicates",
            "imported": imported_count,
            "skipped": skipped_count,
            "total": len(transactions),
            "errors": errors[:10]  # Limit errors in response
        }), 200
        
    except Exception as e:
        logger.error(f"Error in import_broker_transactions: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/broker/test/coinbase", methods=["POST"])
def test_coinbase_connection():
    """Test Coinbase API connection (for debugging)"""
    try:
        data = request.json
        credentials = data.get('credentials', {})
        api_key = credentials.get('api_key')
        api_secret = credentials.get('api_secret')
        
        if not api_key or not api_secret:
            return jsonify({"error": "API key and secret are required"}), 400
        
        from services.broker_service import CoinbaseService
        service = CoinbaseService(api_key=api_key, api_secret=api_secret)
        
        # Try to make a simple request
        try:
            response = service._make_request("GET", "/accounts")
            return jsonify({
                "status": "success" if response.status_code == 200 else "error",
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text[:500]
            }), 200
        except Exception as e:
            return jsonify({
                "status": "error",
                "error": str(e),
                "error_type": type(e).__name__
            }), 500
            
    except Exception as e:
        logger.error(f"Error in test_coinbase_connection: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/prediction", methods=["GET"])
def get_prediction():
    """Get Bitcoin price prediction"""
    try:
        import pickle
        import numpy as np
        import pandas as pd
        from sklearn.preprocessing import MinMaxScaler
        import yfinance as yf
        from datetime import timedelta
        
        # Load model
        model = pickle.load(open('model.pkl', 'rb'))
        
        # Get data
        start = datetime(2022, 5, 5)
        end = datetime.now().date() + timedelta(days=50)
        
        symbol = 'BTC-USD'
        df = yf.download(symbol, start=start, end=end.strftime('%Y-%m-%d'))
        
        # Preprocess
        data = df.copy()
        data_test = data.drop(['Adj Close'], axis=1)
        data_test.index = pd.to_datetime(data_test.index)
        
        scaler = MinMaxScaler()
        data_test = scaler.fit_transform(data_test)
        
        X_test = []
        for i in range(100, data_test.shape[0]):
            X_test.append(data_test[i-100:i])
        
        X_test = np.array(X_test)
        
        # Predict
        Y_pred = model.predict(X_test)
        
        # Scale back
        scale = 1/1.48427770e-05
        Y_pred = Y_pred * scale
        
        return jsonify({
            "predictions": Y_pred.tolist(),
            "dates": [end.strftime('%Y-%m-%d')] * len(Y_pred)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_prediction: {e}")
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=Config.DEBUG, port=Config.PORT, host='0.0.0.0')

