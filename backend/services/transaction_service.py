"""
Transaction service for managing cryptocurrency transactions using Supabase
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import logging
import requests
import time
from supabase import Client

logger = logging.getLogger(__name__)

class TransactionService:
    """Service for transaction operations using Supabase"""
    
    def __init__(self, supabase_client: Client):
        self.db = supabase_client
        self.price_url = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd"
        self.symbol_coin_mapping = {
            "BTC": "bitcoin",
            "ETH": "ethereum",
            "XRP": "ripple",
            "LTC": "litecoin",
            "BCH": "bitcoin-cash",
            "EOS": "eos",
            "XLM": "stellar",
            "ADA": "cardano",
            "SOL": "solana",
            "AVAX": "avalanche-2",
            "MATIC": "matic-network",
            "LINK": "chainlink"
        }
        # Simple in-memory cache for prices (expires after 60 seconds)
        self._price_cache = {}
        self._price_cache_time = {}
        self._cache_duration = 60  # Cache for 60 seconds
    
    def add_transaction(self, data: Dict) -> tuple:
        """Add a new transaction"""
        try:
            # Prepare transaction data
            transaction_data = {
                'name': data.get('name', ''),
                'symbol': data.get('symbol', '').upper(),
                'type': data.get('type', '').lower(),
                'value_usd': float(data.get('value_usd', 0)),
                'purchased_price': float(data.get('purchased_price', 0)),
                'coins': float(data.get('coins', 0)),
                'status': data.get('status', 'active'),
                'created_by': data.get('createdBy', data.get('created_by', 'system')),
                'user_id': data.get('userId', data.get('user_id', 'default')),
                'source': data.get('source', 'manual'),
                'external_id': data.get('external_id')
            }
            
            # Handle date - Supabase expects ISO format string or None
            if data.get('date'):
                if isinstance(data['date'], str):
                    # Already a string, use it directly (Supabase will parse it)
                    transaction_data['date'] = data['date']
                elif isinstance(data['date'], datetime):
                    # Convert datetime to ISO string
                    transaction_data['date'] = data['date'].isoformat()
                else:
                    # Try to convert to string
                    transaction_data['date'] = str(data['date'])
            # If no date, database will use DEFAULT NOW()
            
            # Validation
            required_fields = ['value_usd', 'purchased_price', 'coins', 'symbol', 'type']
            for field in required_fields:
                if transaction_data.get(field) is None or transaction_data[field] == '':
                    return {'error': f'Field {field} is required'}, 400
            
            # Validate transaction type
            if transaction_data['type'] not in ['buy', 'sell']:
                return {'error': 'Transaction type must be "buy" or "sell"'}, 400
            
            # For sell transactions, validate sufficient holdings
            if transaction_data['type'] == 'sell':
                holdings = self._get_holdings(transaction_data['symbol'], transaction_data['user_id'])
                if holdings['coins'] < transaction_data['coins']:
                    return {'error': f'Insufficient holdings. You have {holdings["coins"]} {transaction_data["symbol"]}'}, 400
            
            # Insert transaction
            result = self.db.table('transactions').insert(transaction_data).execute()
            
            if result.data and len(result.data) > 0:
                transaction_id = result.data[0]['id']
                return {'message': 'Transaction added successfully', 'id': transaction_id}, 201
            else:
                return {'error': 'Failed to insert transaction'}, 500
            
        except Exception as e:
            logger.error(f"Error adding transaction: {e}")
            return {'error': str(e)}, 500
    
    def get_transactions(self, user_id: Optional[str] = None, limit: int = 50) -> tuple:
        """Get all transactions"""
        try:
            query = self.db.table('transactions')\
                .select('*')\
                .in_('status', ['active', 'pending'])
            
            if user_id:
                query = query.eq('user_id', user_id)
            
            # Order by date descending and limit
            result = query.order('date', desc=True).limit(limit).execute()
            
            transactions_list = []
            for transaction in result.data:
                # Convert datetime to ISO format string
                if 'date' in transaction and transaction['date']:
                    if isinstance(transaction['date'], str):
                        transactions_list.append(transaction)
                    else:
                        # Convert datetime object to ISO string
                        transaction['date'] = transaction['date'].isoformat()
                        transactions_list.append(transaction)
                else:
                    transactions_list.append(transaction)
            
            return transactions_list, 200
        except Exception as e:
            logger.error(f"Error fetching transactions: {e}")
            import traceback
            logger.error(traceback.format_exc())
            # Return empty list on error instead of error dict to maintain consistent return type
            return [], 200
    
    def get_coin_wise_details(self, user_id: Optional[str] = None) -> Dict:
        """Get portfolio details grouped by coin"""
        try:
            query = self.db.table('transactions')\
                .select('*')\
                .in_('status', ['active', 'pending'])
            
            if user_id:
                query = query.eq('user_id', user_id)
            
            result = query.execute()
            
            collection = defaultdict(lambda: {"coins": 0, "total_value": 0})
            
            for transaction in result.data:
                coin = transaction.get('symbol', '')
                transaction_type = transaction.get('type', '').lower()
                transaction_value = float(transaction.get('value_usd', 0))
                transaction_coins = float(transaction.get('coins', 0))
                
                if transaction_type == "buy":
                    collection[coin]["coins"] += transaction_coins
                    collection[coin]["total_value"] += transaction_value
                elif transaction_type == "sell":
                    collection[coin]["coins"] -= transaction_coins
                    collection[coin]["total_value"] -= transaction_value
            
            # Fetch current prices for all coins
            symbols = list(collection.keys())
            if symbols:
                prices = self._fetch_prices(symbols)
                
                portfolio_summary = {
                    "total_cost": 0,
                    "total_value": 0,
                    "gain": 0,
                    "gain_percent": 0,
                    "coins": {}
                }
                
                for symbol, details in collection.items():
                    if details["coins"] > 0:
                        coin_id = self.symbol_coin_mapping.get(symbol, symbol.lower())
                        current_price = prices.get(coin_id, 0)
                        current_value = details["coins"] * current_price
                        
                        portfolio_summary["total_cost"] += details["total_value"]
                        portfolio_summary["total_value"] += current_value
                        
                        coin_gain = current_value - details["total_value"]
                        coin_gain_percent = (coin_gain / details["total_value"] * 100) if details["total_value"] > 0 else 0
                        
                        portfolio_summary["coins"][symbol] = {
                            "coins": details["coins"],
                            "cost": details["total_value"],
                            "value": current_value,
                            "gain": coin_gain,
                            "gain_percent": coin_gain_percent,
                            "price": current_price
                        }
                
                portfolio_summary["gain"] = portfolio_summary["total_value"] - portfolio_summary["total_cost"]
                portfolio_summary["gain_percent"] = (
                    (portfolio_summary["gain"] / portfolio_summary["total_cost"] * 100)
                    if portfolio_summary["total_cost"] > 0 else 0
                )
                
                return portfolio_summary
            
            return {
                "total_cost": 0,
                "total_value": 0,
                "gain": 0,
                "gain_percent": 0,
                "coins": {}
            }
            
        except Exception as e:
            logger.error(f"Error fetching coin-wise details: {e}")
            return {
                "total_cost": 0,
                "total_value": 0,
                "gain": 0,
                "gain_percent": 0,
                "coins": {}
            }
    
    def _fetch_prices(self, symbols: List[str]) -> Dict[str, float]:
        """Fetch current prices for multiple cryptocurrencies with caching"""
        cache_key = None
        try:
            # Map symbols to CoinGecko IDs
            coin_ids = [self.symbol_coin_mapping.get(symbol, symbol.lower()) for symbol in symbols]
            coin_ids = [cid for cid in coin_ids if cid]  # Filter out None values
            
            if not coin_ids:
                logger.warning("No valid coin IDs found for symbols: %s", symbols)
                return {}
            
            # Check cache first
            current_time = time.time()
            cache_key = ','.join(sorted(coin_ids))
            
            if cache_key in self._price_cache:
                cache_time = self._price_cache_time.get(cache_key, 0)
                if current_time - cache_time < self._cache_duration:
                    logger.info("Using cached prices for: %s", cache_key)
                    return self._price_cache[cache_key]
            
            # Fetch prices in batch
            ids_param = ','.join(coin_ids)
            url = f"{self.price_url}&ids={ids_param}"
            
            logger.info("Fetching prices from CoinGecko for: %s", ids_param)
            response = requests.get(url, timeout=10)
            
            # Check for rate limiting
            if response.status_code == 429:
                logger.error("CoinGecko rate limit exceeded. Using cached prices if available.")
                # Try to use cached prices even if expired
                if cache_key and cache_key in self._price_cache:
                    logger.warning("Rate limited - using expired cache")
                    return self._price_cache[cache_key]
                return {}
            
            response.raise_for_status()
            data = response.json()
            
            # Map back to symbols
            prices = {}
            for symbol in symbols:
                coin_id = self.symbol_coin_mapping.get(symbol, symbol.lower())
                if coin_id in data:
                    price = data[coin_id].get('usd', 0)
                    prices[coin_id] = price
                    if price == 0:
                        logger.warning("Price is 0 for %s (coin_id: %s)", symbol, coin_id)
            
            # Update cache
            if prices and cache_key:
                self._price_cache[cache_key] = prices
                self._price_cache_time[cache_key] = current_time
                logger.info("Cached prices for %d coins", len(prices))
            
            return prices
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error fetching prices: {e}")
            # Try to use cached prices even if expired
            if cache_key and cache_key in self._price_cache:
                logger.warning("Network error - using expired cache")
                return self._price_cache[cache_key]
            return {}
        except Exception as e:
            logger.error(f"Error fetching prices: {e}", exc_info=True)
            # Try to use cached prices even if expired
            if cache_key and cache_key in self._price_cache:
                logger.warning("Error - using expired cache")
                return self._price_cache[cache_key]
            return {}
    
    def update_transaction(self, transaction_id: str, data: Dict, user_id: Optional[str] = None) -> tuple:
        """Update an existing transaction"""
        try:
            # Get existing transaction
            result = self.db.table('transactions').select('*').eq('id', transaction_id).execute()
            
            if not result.data or len(result.data) == 0:
                return {'error': 'Transaction not found'}, 404
            
            transaction_data = result.data[0]
            
            # Optional: Verify user owns the transaction
            if user_id and transaction_data.get('user_id') != user_id:
                return {'error': 'Unauthorized'}, 403
            
            # Prepare update data
            update_data = {}
            if 'name' in data:
                update_data['name'] = data['name']
            if 'symbol' in data:
                update_data['symbol'] = data['symbol'].upper()
            if 'type' in data:
                update_data['type'] = data['type'].lower()
            if 'value_usd' in data:
                update_data['value_usd'] = float(data['value_usd'])
            if 'purchased_price' in data:
                update_data['purchased_price'] = float(data['purchased_price'])
            if 'coins' in data:
                update_data['coins'] = float(data['coins'])
            if 'date' in data:
                if data['date']:
                    if isinstance(data['date'], str):
                        update_data['date'] = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
                    else:
                        update_data['date'] = data['date']
            if 'source' in data:
                update_data['source'] = data['source']
            
            # Validate transaction type
            if 'type' in update_data and update_data['type'] not in ['buy', 'sell']:
                return {'error': 'Transaction type must be "buy" or "sell"'}, 400
            
            # For sell transactions, validate sufficient holdings (excluding current transaction)
            if 'type' in update_data and update_data['type'] == 'sell':
                symbol = update_data.get('symbol', transaction_data.get('symbol'))
                coins_to_sell = update_data.get('coins', transaction_data.get('coins', 0))
                holdings = self._get_holdings_excluding(symbol, transaction_data.get('user_id', 'default'), transaction_id)
                if holdings['coins'] < coins_to_sell:
                    return {'error': f'Insufficient holdings. You have {holdings["coins"]} {symbol}'}, 400
            
            # Update transaction
            self.db.table('transactions').update(update_data).eq('id', transaction_id).execute()
            
            return {'message': 'Transaction updated successfully'}, 200
            
        except Exception as e:
            logger.error(f"Error updating transaction: {e}")
            return {'error': str(e)}, 500
    
    def delete_transaction(self, transaction_id: str, user_id: Optional[str] = None) -> tuple:
        """Soft delete a transaction"""
        try:
            # Get existing transaction
            result = self.db.table('transactions').select('*').eq('id', transaction_id).execute()
            
            if not result.data or len(result.data) == 0:
                return {'error': 'Transaction not found'}, 404
            
            transaction_data = result.data[0]
            
            # Optional: Verify user owns the transaction
            if user_id and transaction_data.get('user_id') != user_id:
                return {'error': 'Unauthorized'}, 403
            
            # Soft delete by updating status
            self.db.table('transactions').update({'status': 'delete'}).eq('id', transaction_id).execute()
            
            return {'message': 'Transaction deleted successfully'}, 200
        except Exception as e:
            logger.error(f"Error deleting transaction: {e}")
            return {'error': str(e)}, 500
    
    def _get_holdings(self, symbol: str, user_id: str) -> Dict:
        """Get current holdings for a symbol"""
        try:
            result = self.db.table('transactions')\
                .select('*')\
                .in_('status', ['active', 'pending'])\
                .eq('symbol', symbol)\
                .eq('user_id', user_id)\
                .execute()
            
            holdings = {"coins": 0, "total_value": 0}
            
            for transaction in result.data:
                transaction_type = transaction.get('type', '').lower()
                transaction_value = float(transaction.get('value_usd', 0))
                transaction_coins = float(transaction.get('coins', 0))
                
                if transaction_type == "buy":
                    holdings["coins"] += transaction_coins
                    holdings["total_value"] += transaction_value
                elif transaction_type == "sell":
                    holdings["coins"] -= transaction_coins
                    holdings["total_value"] -= transaction_value
            
            return holdings
        except Exception as e:
            logger.error(f"Error getting holdings: {e}")
            return {"coins": 0, "total_value": 0}
    
    def _get_holdings_excluding(self, symbol: str, user_id: str, exclude_id: str) -> Dict:
        """Get current holdings for a symbol, excluding a specific transaction"""
        try:
            result = self.db.table('transactions')\
                .select('*')\
                .in_('status', ['active', 'pending'])\
                .eq('symbol', symbol)\
                .eq('user_id', user_id)\
                .neq('id', exclude_id)\
                .execute()
            
            holdings = {"coins": 0, "total_value": 0}
            
            for transaction in result.data:
                transaction_type = transaction.get('type', '').lower()
                transaction_value = float(transaction.get('value_usd', 0))
                transaction_coins = float(transaction.get('coins', 0))
                
                if transaction_type == "buy":
                    holdings["coins"] += transaction_coins
                    holdings["total_value"] += transaction_value
                elif transaction_type == "sell":
                    holdings["coins"] -= transaction_coins
                    holdings["total_value"] -= transaction_value
            
            return holdings
        except Exception as e:
            logger.error(f"Error getting holdings excluding: {e}")
            return {"coins": 0, "total_value": 0}
