/**
 * API service layer for all backend communication
 */

/**
 * Get current user ID from localStorage
 * App.js syncs Supabase session to localStorage, so this works seamlessly
 * Falls back to 'default' if not logged in
 */
const getUserId = () => {
  return localStorage.getItem('userId') || 'default';
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8085/api';

class ApiService {
  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Transaction endpoints
  async getTransactions(userId = null, limit = 50) {
    const uid = userId || getUserId();
    return this.request(`/transactions?userId=${uid}&limit=${limit}`);
  }

  async addTransaction(transaction) {
    // Ensure userId is included in transaction data
    if (!transaction.userId) {
      transaction.userId = getUserId();
    }
    return this.request('/transactions', {
      method: 'POST',
      body: transaction,
    });
  }

  async updateTransaction(transactionId, transaction, userId = null) {
    const uid = userId || getUserId();
    return this.request(`/transactions/${transactionId}?userId=${uid}`, {
      method: 'PUT',
      body: transaction,
    });
  }

  async deleteTransaction(transactionId, userId = null) {
    const uid = userId || getUserId();
    return this.request(`/transactions/${transactionId}?userId=${uid}`, {
      method: 'DELETE',
    });
  }

  // Portfolio endpoints
  async getPortfolio(userId = null) {
    const uid = userId || getUserId();
    return this.request(`/portfolio?userId=${uid}`);
  }

  // Broker import endpoints
  async importBrokerTransactions(broker, credentials, userId = null, startDate = null, endDate = null, useMockData = false) {
    const uid = userId || getUserId();
    return this.request('/broker/import', {
      method: 'POST',
      body: {
        broker,
        credentials,
        userId: uid,
        start_date: startDate,
        end_date: endDate,
        use_mock_data: useMockData,
      },
    });
  }

  // Prediction endpoint
  async getPrediction() {
    return this.request('/prediction');
  }

  // Analytics endpoints
  async getPerformance(userId = null, period = 'all') {
    const uid = userId || getUserId();
    return this.request(`/analytics/performance?userId=${uid}&period=${period}`);
  }

  async getPerformers(userId = null, limit = 5) {
    const uid = userId || getUserId();
    return this.request(`/analytics/performers?userId=${uid}&limit=${limit}`);
  }

  async getPortfolioHistory(userId = null, days = 30) {
    const uid = userId || getUserId();
    return this.request(`/analytics/history?userId=${uid}&days=${days}`);
  }
}

export default new ApiService();

