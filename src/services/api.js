const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async forgotPassword(identifier) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: { identifier },
    });
  }

  // Wallet endpoints
  async getChipPackages() {
    return this.makeRequest('/wallet/packages');
  }

  async getPaymentChannels() {
    return this.makeRequest('/wallet/payment-channels');
  }

  async getBalance() {
    return this.makeRequest('/wallet/balance');
  }

  async createDepositRequest(depositData) {
    return this.makeRequest('/wallet/deposit', {
      method: 'POST',
      body: depositData,
    });
  }

  async getDepositHistory(limit = 5) {
    return this.makeRequest(`/wallet/deposit-history?limit=${limit}`);
  }

  async addWithdrawalMethod(methodData) {
    return this.makeRequest('/wallet/withdrawal-methods', {
      method: 'POST',
      body: methodData,
    });
  }

  async getWithdrawalMethods() {
    return this.makeRequest('/wallet/withdrawal-methods');
  }

  async createWithdrawalRequest(withdrawalData) {
    return this.makeRequest('/wallet/withdraw', {
      method: 'POST',
      body: withdrawalData,
    });
  }

  async getWithdrawalHistory(limit = 5) {
    return this.makeRequest(`/wallet/withdrawal-history?limit=${limit}`);
  }

  // 🎰 GAME ENDPOINTS - ADD THESE
  async getAvailableGames() {
    return this.makeRequest('/games/available');
  }

  async playFireJoker(betAmount) {
    return this.makeRequest('/games/slots/fire-joker', {
      method: 'POST',
      body: { betAmount },
    });
  }
  
  async playBlackjack(gameData) {
  return this.makeRequest('/games/blackjack-vip', {
    method: 'POST',
    body: gameData,
  });
}

  async getGameHistory(gameType = null, limit = 10) {
    const params = new URLSearchParams({ limit });
    if (gameType) params.append('gameType', gameType);
    
    return this.makeRequest(`/games/history?${params}`);
  }
}

export default new ApiService();
