"""
Analytics service for portfolio performance calculations
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Service for portfolio analytics and performance metrics"""
    
    def __init__(self, transaction_service):
        self.transaction_service = transaction_service
    
    def get_performance_by_period(
        self, 
        user_id: str, 
        period: str = 'all'
    ) -> Dict:
        """
        Calculate portfolio performance for a specific time period
        
        Args:
            user_id: User ID
            period: Time period ('1d', '7d', '30d', '90d', '1y', 'all')
        
        Returns:
            Dictionary with performance metrics
        """
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = self._get_period_start_date(period, end_date)
            
            # Get all transactions
            all_transactions, _ = self.transaction_service.get_transactions(
                user_id=user_id, 
                limit=10000
            )
            
            # Filter transactions by date range
            if period != 'all':
                filtered_transactions = [
                    tx for tx in all_transactions
                    if self._is_transaction_in_range(tx, start_date, end_date)
                ]
            else:
                filtered_transactions = all_transactions
            
            # Calculate portfolio at start of period
            start_portfolio = self._calculate_portfolio_at_date(
                all_transactions, 
                start_date, 
                user_id
            )
            
            # Calculate current portfolio
            current_portfolio = self.transaction_service.get_coin_wise_details(
                user_id=user_id
            )
            
            # Calculate performance metrics
            start_value = start_portfolio.get('total_value', 0)
            current_value = current_portfolio.get('total_value', 0)
            start_cost = start_portfolio.get('total_cost', 0)
            current_cost = current_portfolio.get('total_cost', 0)
            
            # Calculate gains
            period_gain = current_value - start_value
            period_gain_percent = (
                (period_gain / start_value * 100) if start_value > 0 else 0
            )
            
            # Calculate total gains (from cost basis)
            total_gain = current_value - current_cost
            total_gain_percent = (
                (total_gain / current_cost * 100) if current_cost > 0 else 0
            )
            
            # Calculate transactions in period
            transactions_in_period = len(filtered_transactions)
            buys_in_period = sum(1 for tx in filtered_transactions if tx.get('type') == 'buy')
            sells_in_period = sum(1 for tx in filtered_transactions if tx.get('type') == 'sell')
            
            # Calculate volume in period
            volume_in_period = sum(
                float(tx.get('value_usd', 0)) for tx in filtered_transactions
            )
            
            return {
                'period': period,
                'start_date': start_date.isoformat() if start_date else None,
                'end_date': end_date.isoformat(),
                'start_value': start_value,
                'current_value': current_value,
                'start_cost': start_cost,
                'current_cost': current_cost,
                'period_gain': period_gain,
                'period_gain_percent': period_gain_percent,
                'total_gain': total_gain,
                'total_gain_percent': total_gain_percent,
                'transactions_count': transactions_in_period,
                'buys_count': buys_in_period,
                'sells_count': sells_in_period,
                'volume': volume_in_period
            }
            
        except Exception as e:
            logger.error(f"Error calculating performance: {e}")
            return {
                'period': period,
                'error': str(e)
            }
    
    def get_best_worst_performers(
        self, 
        user_id: str, 
        limit: int = 5
    ) -> Dict:
        """
        Get best and worst performing assets
        
        Args:
            user_id: User ID
            limit: Number of top/bottom performers to return
        
        Returns:
            Dictionary with best and worst performers
        """
        try:
            portfolio = self.transaction_service.get_coin_wise_details(
                user_id=user_id
            )
            
            coins = portfolio.get('coins', {})
            
            # Calculate performance for each coin
            performers = []
            for symbol, coin_data in coins.items():
                if coin_data.get('coins', 0) > 0:
                    performers.append({
                        'symbol': symbol,
                        'coins': coin_data.get('coins', 0),
                        'cost': coin_data.get('cost', 0),
                        'value': coin_data.get('value', 0),
                        'gain': coin_data.get('gain', 0),
                        'gain_percent': coin_data.get('gain_percent', 0),
                        'price': coin_data.get('price', 0)
                    })
            
            # Sort by gain percent
            performers.sort(key=lambda x: x['gain_percent'], reverse=True)
            
            best = performers[:limit] if len(performers) >= limit else performers
            worst = performers[-limit:] if len(performers) >= limit else performers
            worst.reverse()  # Show worst first (most negative)
            
            return {
                'best': best,
                'worst': worst,
                'total_assets': len(performers)
            }
            
        except Exception as e:
            logger.error(f"Error getting best/worst performers: {e}")
            return {
                'best': [],
                'worst': [],
                'total_assets': 0,
                'error': str(e)
            }
    
    def get_portfolio_history(
        self,
        user_id: str,
        days: int = 30
    ) -> List[Dict]:
        """
        Get portfolio value history over time
        
        Args:
            user_id: User ID
            days: Number of days of history to return
        
        Returns:
            List of daily portfolio snapshots
        """
        try:
            # Get all transactions
            all_transactions, _ = self.transaction_service.get_transactions(
                user_id=user_id,
                limit=10000
            )
            
            # Generate date range
            end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            dates = []
            for i in range(days):
                date = end_date - timedelta(days=i)
                dates.append(date)
            dates.reverse()  # Oldest first
            
            # Calculate portfolio for each date
            history = []
            for date in dates:
                portfolio = self._calculate_portfolio_at_date(
                    all_transactions,
                    date,
                    user_id
                )
                
                history.append({
                    'date': date.isoformat(),
                    'value': portfolio.get('total_value', 0),
                    'cost': portfolio.get('total_cost', 0),
                    'gain': portfolio.get('total_value', 0) - portfolio.get('total_cost', 0)
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting portfolio history: {e}")
            return []
    
    def _get_period_start_date(self, period: str, end_date: datetime) -> Optional[datetime]:
        """Get start date for a given period"""
        if period == 'all':
            return None
        elif period == '1d':
            return end_date - timedelta(days=1)
        elif period == '7d':
            return end_date - timedelta(days=7)
        elif period == '30d':
            return end_date - timedelta(days=30)
        elif period == '90d':
            return end_date - timedelta(days=90)
        elif period == '1y':
            return end_date - timedelta(days=365)
        else:
            return None
    
    def _is_transaction_in_range(
        self, 
        transaction: Dict, 
        start_date: datetime, 
        end_date: datetime
    ) -> bool:
        """Check if transaction is within date range"""
        try:
            tx_date_str = transaction.get('date')
            if not tx_date_str:
                return False
            
            # Parse date
            if isinstance(tx_date_str, str):
                tx_date = datetime.fromisoformat(tx_date_str.replace('Z', '+00:00'))
            else:
                return False
            
            # Remove timezone for comparison
            if tx_date.tzinfo:
                tx_date = tx_date.replace(tzinfo=None)
            if start_date.tzinfo:
                start_date = start_date.replace(tzinfo=None)
            if end_date.tzinfo:
                end_date = end_date.replace(tzinfo=None)
            
            return start_date <= tx_date <= end_date
        except Exception as e:
            logger.warning(f"Error parsing transaction date: {e}")
            return False
    
    def _calculate_portfolio_at_date(
        self,
        transactions: List[Dict],
        date: datetime,
        user_id: str
    ) -> Dict:
        """Calculate portfolio state at a specific date"""
        try:
            # Filter transactions up to this date
            portfolio_transactions = [
                tx for tx in transactions
                if self._is_transaction_before_date(tx, date)
            ]
            
            # Calculate holdings
            holdings = defaultdict(lambda: {"coins": 0, "total_value": 0})
            
            for tx in portfolio_transactions:
                if tx.get('status') not in ['active', 'pending']:
                    continue
                
                symbol = tx.get('symbol', '').upper()
                tx_type = tx.get('type', '').lower()
                value = float(tx.get('value_usd', 0))
                coins = float(tx.get('coins', 0))
                
                if tx_type == 'buy':
                    holdings[symbol]["coins"] += coins
                    holdings[symbol]["total_value"] += value
                elif tx_type == 'sell':
                    holdings[symbol]["coins"] -= coins
                    holdings[symbol]["total_value"] -= value
            
            # Calculate totals
            total_cost = sum(h["total_value"] for h in holdings.values())
            
            # For historical value, we'd need historical prices
            # For now, use cost as value (will be improved with price history)
            total_value = total_cost
            
            return {
                'total_cost': total_cost,
                'total_value': total_value,
                'holdings': dict(holdings)
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio at date: {e}")
            return {
                'total_cost': 0,
                'total_value': 0,
                'holdings': {}
            }
    
    def _is_transaction_before_date(self, transaction: Dict, date: datetime) -> bool:
        """Check if transaction occurred before given date"""
        try:
            tx_date_str = transaction.get('date')
            if not tx_date_str:
                return False
            
            if isinstance(tx_date_str, str):
                tx_date = datetime.fromisoformat(tx_date_str.replace('Z', '+00:00'))
            else:
                return False
            
            # Remove timezone for comparison
            if tx_date.tzinfo:
                tx_date = tx_date.replace(tzinfo=None)
            if date.tzinfo:
                date = date.replace(tzinfo=None)
            
            return tx_date <= date
        except Exception as e:
            logger.warning(f"Error parsing transaction date: {e}")
            return False

