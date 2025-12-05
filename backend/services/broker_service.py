"""
Broker API integration service for Robinhood and Coinbase
"""
import requests
import hmac
import hashlib
import base64
import time
import secrets
from typing import List, Dict, Optional
from datetime import datetime
import logging

try:
    import jwt
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from cryptography.hazmat.backends import default_backend
    JWT_AVAILABLE = True
    ED25519_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False
    ED25519_AVAILABLE = False
    logger.warning("cryptography or PyJWT library not available. JWT authentication will not work.")

logger = logging.getLogger(__name__)

class BrokerService:
    """Base class for broker integrations"""
    
    def __init__(self, api_key: str = None, api_secret: str = None):
        self.api_key = api_key
        self.api_secret = api_secret
    
    def authenticate(self) -> bool:
        """Authenticate with broker API"""
        raise NotImplementedError
    
    def get_transactions(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict]:
        """Fetch transactions from broker"""
        raise NotImplementedError
    
    def normalize_transaction(self, raw_transaction: Dict) -> Dict:
        """Convert broker-specific transaction format to standard format"""
        raise NotImplementedError


class RobinhoodService(BrokerService):
    """Robinhood API integration"""
    
    BASE_URL = "https://api.robinhood.com"
    
    def __init__(self, username: str = None, password: str = None, mfa_code: str = None):
        super().__init__()
        self.username = username
        self.password = password
        self.mfa_code = mfa_code
        self.access_token = None
        self.refresh_token = None
    
    def authenticate(self) -> bool:
        """
        Authenticate with Robinhood API
        Note: Robinhood requires OAuth2. This is a placeholder structure.
        In production, implement proper OAuth2 flow.
        """
        try:
            # Placeholder for OAuth2 authentication
            # Real implementation would use OAuth2 flow
            logger.warning("Robinhood OAuth2 authentication not fully implemented")
            return False
        except Exception as e:
            logger.error(f"Robinhood authentication failed: {e}")
            return False
    
    def get_transactions(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict]:
        """Fetch crypto transactions from Robinhood"""
        if not self.authenticate():
            raise Exception("Failed to authenticate with Robinhood")
        
        try:
            # Placeholder implementation
            # Real implementation would call Robinhood API
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Accept": "application/json"
            }
            
            # This is a placeholder - actual endpoint may differ
            response = requests.get(
                f"{self.BASE_URL}/crypto/orders/",
                headers=headers,
                params={
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                transactions = []
                for order in data.get("results", []):
                    normalized = self.normalize_transaction(order)
                    if normalized:
                        transactions.append(normalized)
                return transactions
            else:
                logger.error(f"Robinhood API error: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error fetching Robinhood transactions: {e}")
            return []
    
    def normalize_transaction(self, raw_transaction: Dict) -> Optional[Dict]:
        """Convert Robinhood order to standard transaction format"""
        try:
            # Map Robinhood fields to standard format
            # This is a placeholder - adjust based on actual Robinhood API response
            transaction_type = "buy" if raw_transaction.get("side") == "buy" else "sell"
            
            return {
                "name": raw_transaction.get("currency", {}).get("name", ""),
                "symbol": raw_transaction.get("currency", {}).get("code", ""),
                "type": transaction_type,
                "coins": float(raw_transaction.get("quantity", 0)),
                "purchased_price": float(raw_transaction.get("price", 0)),
                "value_usd": float(raw_transaction.get("rounded_executed_notional", {}).get("amount", 0)),
                "date": raw_transaction.get("created_at", datetime.now().isoformat()),
                "source": "robinhood",
                "external_id": raw_transaction.get("id")
            }
        except Exception as e:
            logger.error(f"Error normalizing Robinhood transaction: {e}")
            return None


class CoinbaseService(BrokerService):
    """Coinbase Advanced Trade API (v3) integration"""
    
    BASE_URL = "https://api.coinbase.com/api/v3/brokerage"
    
    def __init__(self, api_key: str = None, api_secret: str = None):
        super().__init__(api_key, api_secret)
        if not api_key or not api_secret:
            logger.warning("Coinbase API credentials not provided")
    
    def _create_jwt_token(self, method: str, path: str, query_string: str = None) -> str:
        """
        Create JWT token for Coinbase CDP API authentication
        Uses ECDSA (ES256) algorithm as required for Advanced Trade API
        """
        if not JWT_AVAILABLE:
            raise Exception("PyJWT and cryptography libraries required for Coinbase CDP API")
        
        # Parse the PEM private key
        try:
            private_key = serialization.load_pem_private_key(
                self.api_secret.encode(),
                password=None
            )
        except Exception as e:
            logger.error(f"Failed to load private key: {e}")
            raise Exception("Invalid private key format. Must be PEM format.")
        
        # Build URI claim: "METHOD host/full_path"
        # BASE_URL is "https://api.coinbase.com/api/v3/brokerage"
        # So we need to extract the path part: "/api/v3/brokerage" + path
        request_host = "api.coinbase.com"
        # Extract path from BASE_URL (remove protocol and host)
        base_path = self.BASE_URL.replace("https://", "").replace("http://", "")
        if base_path.startswith(request_host):
            base_path = base_path[len(request_host):]
        # Ensure path starts with /
        if not path.startswith("/"):
            path = "/" + path
        full_path = base_path + path
        # Include query string in URI claim if present (as per Coinbase docs)
        if query_string:
            full_path = f"{full_path}?{query_string}"
        uri = f"{method.upper()} {request_host}{full_path}"
        
        # Debug logging
        logger.debug(f"JWT URI claim: {uri}")
        
        # JWT payload according to Coinbase CDP documentation
        now = int(time.time())
        payload = {
            "sub": self.api_key,  # Full path: organizations/{org}/apiKeys/{key_id}
            "iss": "cdp",
            "nbf": now,
            "exp": now + 120,  # 2 minutes expiration
            "uri": uri
        }
        
        # JWT headers
        headers = {
            "kid": self.api_key,  # Full API key path
            "nonce": secrets.token_hex(),  # Random nonce
            "alg": "ES256"  # ECDSA with P-256
        }
        
        # Sign JWT with ECDSA private key
        token = jwt.encode(
            payload,
            private_key,
            algorithm="ES256",
            headers=headers
        )
        
        return token
    
    def _make_request(self, method: str, path: str, params: Dict = None, body: Dict = None) -> requests.Response:
        """
        Make authenticated request to Coinbase CDP API using JWT
        """
        if not self.api_key or not self.api_secret:
            raise Exception("Coinbase API credentials not provided")
        
        # Build full URL
        url = f"{self.BASE_URL}{path}"
        
        # Build query string for URI claim (include query params if present)
        # Coinbase requires query params to be included in JWT URI claim
        query_string = None
        if params and method.upper() == "GET":
            import urllib.parse
            filtered_params = {k: v for k, v in params.items() if v is not None}
            sorted_params = sorted(filtered_params.items())
            query_string = urllib.parse.urlencode(sorted_params, doseq=True)
        
        # Create JWT token with query string
        jwt_token = self._create_jwt_token(method, path, query_string)
        
        # Prepare headers with Bearer token
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json"
        }
        
        # Log request details (without sensitive data)
        logger.info(f"Making {method} request to {path}")
        
        # Make request
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=body, params=params, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Log response status
            logger.info(f"Coinbase API response: {response.status_code}")
            
            # Log error details if request failed
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    logger.error(f"Coinbase API error response: {error_data}")
                except:
                    logger.error(f"Coinbase API error response (text): {response.text[:500]}")
            
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Request exception: {e}")
            raise Exception(f"Network error connecting to Coinbase API: {str(e)}")
    
    def authenticate(self) -> bool:
        """
        Authenticate with Coinbase API by validating credentials format
        """
        try:
            if not self.api_key or not self.api_secret:
                logger.warning("Coinbase API credentials not provided")
                return False
            
            # Validate API key format (should be full path: organizations/.../apiKeys/...)
            if not self.api_key.startswith("organizations/") or "/apiKeys/" not in self.api_key:
                logger.error("Coinbase API key format invalid. Should be: organizations/{org}/apiKeys/{key_id}")
                return False
            
            # Validate private key is PEM format
            if not self.api_secret.strip().startswith("-----BEGIN EC PRIVATE KEY-----"):
                logger.error("Coinbase API secret must be in PEM format (-----BEGIN EC PRIVATE KEY-----)")
                return False
            
            # Try to load the private key to validate it
            try:
                if JWT_AVAILABLE:
                    private_key = serialization.load_pem_private_key(
                        self.api_secret.encode(),
                        password=None
                    )
                    logger.info("Coinbase credentials format validated")
                    return True
                else:
                    logger.warning("PyJWT not available, cannot fully validate credentials")
                    return True  # Still return True if format looks correct
            except Exception as e:
                logger.error(f"Failed to load Coinbase private key: {e}")
                return False
            
        except Exception as e:
            logger.error(f"Coinbase authentication validation failed: {e}")
            return False
    
    def get_transactions(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, use_mock_data: bool = False) -> List[Dict]:
        """
        Fetch transactions (fills) from Coinbase Advanced Trade API
        Handles pagination automatically
        
        Args:
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            use_mock_data: If True, returns fake transactions for testing (no real API call)
        """
        if use_mock_data:
            return self._get_mock_transactions(start_date, end_date)
        
        if not self.authenticate():
            raise Exception("Failed to authenticate with Coinbase")
        
        all_transactions = []
        cursor = None
        max_pages = 10  # Limit to prevent infinite loops
        page_count = 0
        
        try:
            while page_count < max_pages:
                # Start with minimal params - query params cause 401 errors
                # We'll fetch all fills and filter client-side if needed
                params = {}
                
                if cursor:
                    params["cursor"] = cursor
                
                # Note: Adding query parameters (limit, product_types, dates) causes 401 errors
                # This appears to be a JWT URI claim matching issue with query strings
                # For now, fetch without filters and filter client-side
                # TODO: Fix JWT URI claim format for query parameters
                
                # Make API request without query parameters (except cursor for pagination)
                response = self._make_request("GET", "/orders/historical/fills", params=params if params else None)
                
                if response.status_code == 401:
                    error_msg = "Coinbase API authentication failed. Please check your API key and secret."
                    try:
                        error_data = response.json()
                        error_msg += f" Details: {error_data.get('message', 'Invalid credentials')}"
                    except:
                        pass
                    logger.error(error_msg)
                    raise Exception(error_msg)
                elif response.status_code == 403:
                    error_msg = "Coinbase API access forbidden. Check API key permissions."
                    logger.error(error_msg)
                    raise Exception(error_msg)
                elif response.status_code == 429:
                    error_msg = "Coinbase API rate limit exceeded. Please try again later."
                    logger.error(error_msg)
                    raise Exception(error_msg)
                elif response.status_code != 200:
                    error_msg = f"Coinbase API error: {response.status_code}"
                    try:
                        error_data = response.json()
                        error_msg += f" - {error_data.get('message', error_data.get('error', 'Unknown error'))}"
                        if 'errors' in error_data:
                            error_msg += f" Errors: {error_data['errors']}"
                    except:
                        error_msg += f" - {response.text[:200]}"
                    logger.error(error_msg)
                    raise Exception(error_msg)
                
                data = response.json()
                fills = data.get("fills", [])
                
                logger.info(f"Received {len(fills)} fills from Coinbase API")
                
                if not fills:
                    break
                
                # Log sample fill for debugging
                if page_count == 0 and fills:
                    sample_fill = fills[0]
                    logger.info(f"Sample fill: product_id={sample_fill.get('product_id')}, trade_time={sample_fill.get('trade_time')}")
                
                # Filter client-side (since query params cause 401 errors)
                filtered_fills = []
                skipped_product_type = 0
                skipped_date = 0
                
                for fill in fills:
                    # Filter by product type (SPOT only - ends with -USD)
                    product_id = fill.get("product_id", "")
                    if not product_id.endswith("-USD"):
                        skipped_product_type += 1
                        continue  # Skip non-SPOT products
                    
                    # Filter by date range if provided
                    if start_date or end_date:
                        try:
                            trade_time_str = fill.get("trade_time")
                            if trade_time_str:
                                # Parse ISO format timestamp
                                trade_time = datetime.fromisoformat(trade_time_str.replace('Z', '+00:00'))
                                
                                # Check date range
                                if start_date and trade_time < start_date:
                                    skipped_date += 1
                                    continue
                                if end_date and trade_time > end_date:
                                    skipped_date += 1
                                    continue
                        except Exception as e:
                            logger.warning(f"Error parsing trade_time for fill: {e}")
                            # Include fill if we can't parse date (better than missing data)
                    
                    filtered_fills.append(fill)
                
                if page_count == 0:
                    logger.info(f"Filtered: {len(filtered_fills)}/{len(fills)} fills passed filters (skipped {skipped_product_type} by product type, {skipped_date} by date)")
                
                # Normalize and add transactions
                for fill in filtered_fills:
                    normalized = self.normalize_transaction(fill)
                    if normalized:
                        all_transactions.append(normalized)
                
                # Check for pagination
                cursor = data.get("cursor")
                if not cursor:
                    break
                
                page_count += 1
                logger.info(f"Fetched page {page_count}, total transactions so far: {len(all_transactions)}")
            
            logger.info(f"Total transactions fetched from Coinbase: {len(all_transactions)}")
            return all_transactions
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error fetching Coinbase transactions: {e}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Error fetching Coinbase transactions: {e}")
            raise
    
    def normalize_transaction(self, raw_transaction: Dict) -> Optional[Dict]:
        """
        Convert Coinbase fill to standard transaction format
        
        Coinbase fill structure:
        {
            "entry_id": "...",
            "trade_id": "...",
            "order_id": "...",
            "trade_time": "2024-01-15T10:30:00.000Z",
            "trade_type": "FILL",
            "price": "45000.00",
            "size": "0.5",
            "commission": "2.25",
            "product_id": "BTC-USD",
            "sequence_timestamp": "2024-01-15T10:30:00.000Z",
            "liquidity_indicator": "MAKER",
            "size_in_quote": "22500.00"
        }
        """
        try:
            # Extract product info (e.g., "BTC-USD" -> "BTC")
            product_id = raw_transaction.get("product_id", "")
            if "-" in product_id:
                symbol = product_id.split("-")[0]
            else:
                symbol = product_id
            
            # Determine transaction type from trade_type or side
            # Coinbase fills are always executions, so we need to infer buy/sell
            # Typically, if you're receiving the base currency, it's a buy
            trade_type = raw_transaction.get("trade_type", "").upper()
            
            # For fills, we can't always determine buy/sell from the fill alone
            # We'll default to "buy" and let the user correct if needed
            # In a more sophisticated implementation, we'd check the order details
            transaction_type = "buy"  # Default assumption
            
            # Parse amounts
            size = float(raw_transaction.get("size", 0))
            price = float(raw_transaction.get("price", 0))
            size_in_quote = float(raw_transaction.get("size_in_quote", 0))
            commission = float(raw_transaction.get("commission", 0))
            
            # Calculate total value (size in quote currency, usually USD)
            value_usd = size_in_quote if size_in_quote > 0 else (size * price)
            
            # Parse date
            trade_time = raw_transaction.get("trade_time") or raw_transaction.get("sequence_timestamp")
            if trade_time:
                # Handle ISO format with or without timezone
                if trade_time.endswith('Z'):
                    trade_time = trade_time[:-1] + '+00:00'
                try:
                    date_obj = datetime.fromisoformat(trade_time.replace('Z', '+00:00'))
                    date_str = date_obj.isoformat()
                except:
                    date_str = datetime.now().isoformat()
            else:
                date_str = datetime.now().isoformat()
            
            # Get crypto name from symbol (simple mapping)
            crypto_names = {
                "BTC": "Bitcoin",
                "ETH": "Ethereum",
                "SOL": "Solana",
                "ADA": "Cardano",
                "XRP": "Ripple",
                "LTC": "Litecoin",
                "BCH": "Bitcoin Cash",
                "EOS": "EOS",
                "XLM": "Stellar",
                "DOGE": "Dogecoin",
                "MATIC": "Polygon",
                "DOT": "Polkadot",
                "AVAX": "Avalanche",
                "LINK": "Chainlink",
                "UNI": "Uniswap",
            }
            
            name = crypto_names.get(symbol, symbol)
            
            return {
                "name": name,
                "symbol": symbol,
                "type": transaction_type,
                "coins": size,
                "purchased_price": price,
                "value_usd": value_usd,
                "date": date_str,
                "source": "coinbase",
                "external_id": raw_transaction.get("order_id") or raw_transaction.get("trade_id"),
                "fees": commission
            }
        except Exception as e:
            logger.error(f"Error normalizing Coinbase transaction: {e}")
            logger.error(f"Raw transaction data: {raw_transaction}")
            return None
    
    def _get_mock_transactions(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict]:
        """
        Generate fake Coinbase transactions for testing
        Returns realistic-looking transaction data
        """
        import random
        from datetime import timedelta
        
        # Popular cryptocurrencies
        cryptos = [
            ("BTC", "Bitcoin"),
            ("ETH", "Ethereum"),
            ("SOL", "Solana"),
            ("ADA", "Cardano"),
            ("MATIC", "Polygon"),
            ("DOGE", "Dogecoin"),
            ("LINK", "Chainlink"),
            ("AVAX", "Avalanche"),
        ]
        
        # Generate 10-20 fake transactions
        num_transactions = random.randint(10, 20)
        transactions = []
        
        # Use provided date range or default to last 90 days
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=90)
        
        # Generate transactions spread across the date range
        for i in range(num_transactions):
            # Random date within range
            days_ago = random.randint(0, (end_date - start_date).days)
            trade_time = start_date + timedelta(days=days_ago, hours=random.randint(0, 23))
            
            # Random crypto
            symbol, name = random.choice(cryptos)
            
            # Random transaction type
            transaction_type = random.choice(["BUY", "SELL"])
            
            # Realistic price ranges (approximate current prices)
            price_ranges = {
                "BTC": (30000, 70000),
                "ETH": (2000, 4000),
                "SOL": (50, 200),
                "ADA": (0.3, 1.5),
                "MATIC": (0.5, 2.0),
                "DOGE": (0.05, 0.15),
                "LINK": (10, 30),
                "AVAX": (20, 60),
            }
            
            price_min, price_max = price_ranges.get(symbol, (1, 100))
            price = round(random.uniform(price_min, price_max), 2)
            
            # Random amount (small amounts for testing)
            coins = round(random.uniform(0.001, 1.0), 6)
            
            # Calculate values
            value_usd = round(price * coins, 2)
            fees = round(value_usd * 0.001, 2)  # 0.1% fee
            
            # Create fake fill data matching Coinbase format
            fill = {
                "product_id": f"{symbol}-USD",
                "trade_id": f"mock_trade_{i}_{random.randint(1000, 9999)}",
                "order_id": f"mock_order_{i}_{random.randint(1000, 9999)}",
                "trade_time": trade_time.isoformat() + "Z",
                "side": transaction_type,
                "size": str(coins),
                "price": str(price),
                "size_in_quote": str(value_usd),
                "commission": str(fees),
            }
            
            # Normalize to standard format
            normalized = self.normalize_transaction(fill)
            if normalized:
                transactions.append(normalized)
        
        # Sort by date (newest first)
        transactions.sort(key=lambda x: x.get("date", ""), reverse=True)
        
        logger.info(f"Generated {len(transactions)} mock transactions for testing")
        return transactions
    
    def _get_mock_transactions(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict]:
        """
        Generate fake Coinbase transactions for testing
        Returns realistic-looking transaction data
        """
        import random
        from datetime import timedelta
        
        # Popular cryptocurrencies
        cryptos = [
            ("BTC", "Bitcoin"),
            ("ETH", "Ethereum"),
            ("SOL", "Solana"),
            ("ADA", "Cardano"),
            ("MATIC", "Polygon"),
            ("DOGE", "Dogecoin"),
            ("LINK", "Chainlink"),
            ("AVAX", "Avalanche"),
        ]
        
        # Generate 10-20 fake transactions
        num_transactions = random.randint(10, 20)
        transactions = []
        
        # Use provided date range or default to last 90 days
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=90)
        
        # Generate transactions spread across the date range
        for i in range(num_transactions):
            # Random date within range
            days_ago = random.randint(0, (end_date - start_date).days)
            trade_time = start_date + timedelta(days=days_ago, hours=random.randint(0, 23))
            
            # Random crypto
            symbol, name = random.choice(cryptos)
            
            # Random transaction type
            transaction_type = random.choice(["BUY", "SELL"])
            
            # Realistic price ranges (approximate current prices)
            price_ranges = {
                "BTC": (30000, 70000),
                "ETH": (2000, 4000),
                "SOL": (50, 200),
                "ADA": (0.3, 1.5),
                "MATIC": (0.5, 2.0),
                "DOGE": (0.05, 0.15),
                "LINK": (10, 30),
                "AVAX": (20, 60),
            }
            
            price_min, price_max = price_ranges.get(symbol, (1, 100))
            price = round(random.uniform(price_min, price_max), 2)
            
            # Random amount (small amounts for testing)
            coins = round(random.uniform(0.001, 1.0), 6)
            
            # Calculate values
            value_usd = round(price * coins, 2)
            fees = round(value_usd * 0.001, 2)  # 0.1% fee
            
            # Create fake fill data matching Coinbase format
            fill = {
                "product_id": f"{symbol}-USD",
                "trade_id": f"mock_trade_{i}_{random.randint(1000, 9999)}",
                "order_id": f"mock_order_{i}_{random.randint(1000, 9999)}",
                "trade_time": trade_time.isoformat() + "Z",
                "side": transaction_type,
                "size": str(coins),
                "price": str(price),
                "size_in_quote": str(value_usd),
                "commission": str(fees),
            }
            
            # Normalize to standard format
            normalized = self.normalize_transaction(fill)
            if normalized:
                transactions.append(normalized)
        
        # Sort by date (newest first)
        transactions.sort(key=lambda x: x.get("date", ""), reverse=True)
        
        logger.info(f"Generated {len(transactions)} mock transactions for testing")
        return transactions


def get_broker_service(broker_name: str, **kwargs) -> Optional[BrokerService]:
    """Factory function to get broker service instance"""
    broker_name = broker_name.lower()
    
    if broker_name == "robinhood":
        return RobinhoodService(**kwargs)
    elif broker_name == "coinbase":
        return CoinbaseService(**kwargs)
    else:
        logger.error(f"Unknown broker: {broker_name}")
        return None
