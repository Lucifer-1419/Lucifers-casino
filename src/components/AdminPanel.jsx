import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Activity, Settings, Eye, EyeOff, 
  CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle,
  Play, Pause, Zap, RefreshCw, Crown, Shield
} from 'lucide-react';
import io from 'socket.io-client';

function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin data states
  const [adminData, setAdminData] = useState({
    stats: {
      todayRevenue: 0,
      activeUsers: 0,
      totalGames: 0,
      pendingWithdrawals: 0,
      totalUsers: 0,
      totalDeposits: 0,
      todayProfit: 0
    },
    liveGames: {
      lightningRoulette: { phase: 'betting', timeLeft: 15, players: 0 },
      dragonTiger: { phase: 'revealing', timeLeft: 3, players: 0 }
    },
    pendingRequests: {
      deposits: [],
      withdrawals: []
    },
    users: [],
    gameOverrides: {
      lightningRoulette: null,
      dragonTiger: null
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      initializeAdminSocket();
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = () => {
    if (adminKey === 'LUCIFER_ADMIN_2025') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin key!');
    }
  };

  const initializeAdminSocket = () => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('joinAdminRoom', { name: 'Admin' });

    // Listen for real-time updates
    newSocket.on('adminStatsUpdate', (data) => {
      setAdminData(prev => ({
        ...prev,
        stats: { ...prev.stats, ...data },
        liveGames: data.liveGames || prev.liveGames
      }));
    });

    newSocket.on('overrideSet', (response) => {
      if (response.success) {
        alert(`✅ ${response.message}`);
      } else {
        alert(`❌ ${response.message}`);
      }
    });

    return () => newSocket.disconnect();
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Fetch all admin data
      const responses = await Promise.all([
        fetch('http://localhost:3001/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/admin/pending-deposits', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/admin/pending-withdrawals', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [usersRes, depositsRes, withdrawalsRes, statsRes] = responses;
      
      const usersData = await usersRes.json();
      const depositsData = await depositsRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      const statsData = await statsRes.json();

      setAdminData({
        users: usersData.users || [],
        pendingRequests: {
          deposits: depositsData.deposits || [],
          withdrawals: withdrawalsData.withdrawals || []
        },
        stats: statsData.stats || adminData.stats,
        liveGames: statsData.stats?.liveGames || adminData.liveGames,
        gameOverrides: {
          lightningRoulette: null,
          dragonTiger: null
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin ', error);
      setError('Failed to load admin  ' + error.message);
      setLoading(false);
    }
  };

  const setGameOverride = (gameType, result) => {
    if (socket) {
      socket.emit('adminOverride', {
        gameType,
        result,
        adminKey: 'LUCIFER_ADMIN_2025'
      });
    }
  };

  const approveDeposit = async (depositId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/approve-deposit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ depositId })
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Deposit approved successfully!');
        loadAdminData(); // Refresh data
      } else {
        alert('❌ Failed to approve deposit: ' + result.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

const rejectDeposit = async (depositId, reason) => {
  try {
    // Input validation
    if (!depositId || !reason) {
      alert('❌ Deposit ID and reason are required');
      return;
    }

    // Token validation
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ No authentication token found. Please login again.');
      return;
    }

    const response = await fetch('http://localhost:3001/api/admin/reject-deposit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ depositId, reason })
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      alert('✅ Deposit rejected successfully!');
      loadAdminData(); // Refresh data
    } else {
      alert('❌ Failed to reject deposit: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error rejecting deposit:', error);
    
    // More specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      alert('❌ Network error. Please check your connection.');
    } else if (error.message.includes('HTTP error')) {
      alert('❌ Server error. Please try again later.');
    } else {
      alert('❌ Error: ' + error.message);
    }
  }
};

  const addChipsToUser = async (userId, amount) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/update-balance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, amount, action: 'add' })
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
        loadAdminData(); // Refresh data
      } else {
        alert('❌ Failed to add chips: ' + result.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-overlay">
          <div className="login-modal">
            <div className="login-header">
              <Shield size={48} />
              <h2>🔥 ADMIN ACCESS 🔥</h2>
              <p>Enter admin key to access control center</p>
            </div>
            <div className="login-form">
              {error && <div className="error-message">{error}</div>}
              <input
                type="password"
                placeholder="Enter Admin Key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <button className="admin-login-btn" onClick={handleAdminLogin}>
                <Crown size={20} />
                ACCESS CONTROL CENTER
              </button>
              <button className="close-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .admin-login {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .login-overlay {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }

          .login-modal {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border: 2px solid #dc2626;
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            box-shadow: 0 0 50px rgba(220, 38, 38, 0.5);
            max-width: 400px;
            width: 90%;
          }

          .login-header {
            margin-bottom: 2rem;
          }

          .login-header svg {
            color: #dc2626;
            margin-bottom: 1rem;
          }

          .login-header h2 {
            color: #dc2626;
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
          }

          .login-header p {
            color: #888;
          }

          .login-form input {
            width: 100%;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #444;
            border-radius: 10px;
            color: white;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            text-align: center;
            font-weight: 600;
          }

          .login-form input:focus {
            outline: none;
            border-color: #dc2626;
          }

          .admin-login-btn {
            width: 100%;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            border: none;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
          }

          .admin-login-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 5px 20px rgba(220, 38, 38, 0.4);
          }

          .close-btn {
            background: none;
            border: 1px solid #444;
            color: #888;
            padding: 0.75rem;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
          }

          .error-message {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #ef4444;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-title">
          <Crown size={32} />
          <h1>🔥 LUCIFER'S CASINO - ADMIN CONTROL CENTER 🔥</h1>
          <div className="admin-status">
            <span className="online-indicator"></span>
            SYSTEM ONLINE
          </div>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={loadAdminData} disabled={loading}>
            <RefreshCw size={20} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="close-admin-btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="admin-nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={20} />
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          <Zap size={20} />
          Game Control
        </button>
        <button 
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          User Management
        </button>
        <button 
          className={`nav-btn ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          <DollarSign size={20} />
          Financial
        </button>
        <button 
          className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          Settings
        </button>
      </div>

      {/* Admin Content */}
      <div className="admin-content">
        {error && <div className="global-error">{error}</div>}
        {activeTab === 'dashboard' && <DashboardTab adminData={adminData} />}
        {activeTab === 'games' && <GameControlTab adminData={adminData} setGameOverride={setGameOverride} />}
        {activeTab === 'users' && <UserManagementTab adminData={adminData} addChipsToUser={addChipsToUser} />}
        {activeTab === 'finance' && <FinancialTab adminData={adminData} approveDeposit={approveDeposit} rejectDeposit={rejectDeposit} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      <style jsx>{`
        .admin-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          z-index: 3000;
          overflow-y: auto;
        }

        .admin-header {
          background: rgba(0, 0, 0, 0.9);
          border-bottom: 3px solid #dc2626;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(10px);
        }

        .admin-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-title h1 {
          font-size: 1.8rem;
          color: #dc2626;
          margin: 0;
          font-weight: 800;
        }

        .admin-title svg {
          color: #fbbf24;
        }

        .admin-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .online-indicator {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .refresh-btn {
          background: #10b981;
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #059669;
          transform: scale(1.05);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .close-admin-btn {
          background: #dc2626;
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .close-admin-btn:hover {
          background: #b91c1c;
          transform: scale(1.1);
        }

        .admin-nav {
          background: rgba(0, 0, 0, 0.8);
          padding: 1rem 2rem;
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid #333;
        }

        .nav-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #333;
          color: #888;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .nav-btn.active {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          color: white;
          border-color: #dc2626;
        }

        .admin-content {
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        .global-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #ef4444;
          text-align: center;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .admin-header {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }
          
          .admin-title h1 {
            font-size: 1.4rem;
          }
          
          .admin-nav {
            flex-wrap: wrap;
            padding: 1rem;
          }
          
          .nav-btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

// Dashboard Tab Component with REAL data
// Dashboard Tab Component with SAFE data handling
function DashboardTab({ adminData }) {
  const [realTimeStats, setRealTimeStats] = useState({
    todayRevenue: 0,
    activeUsers: 0,
    totalGames: 0,
    pendingWithdrawals: 0,
    totalBalance: 0
  });

  useEffect(() => {
    const calculateRealStats = () => {
      try {
        const today = new Date().toDateString();
        
        // Safely get deposits with fallbacks
        const deposits = adminData.pendingRequests?.deposits || [];
        const withdrawals = adminData.pendingRequests?.withdrawals || [];
        const users = adminData.users || [];
        
        const todayDeposits = deposits.filter(d => {
          try {
            return new Date(d.createdAt).toDateString() === today;
          } catch {
            return false;
          }
        });
        
        // Safe calculations with fallbacks
        const todayRevenue = todayDeposits.reduce((sum, d) => sum + (Number(d.chipAmount) || 0), 0);
        const activeUsers = users.length || 0;
        const pendingWithdrawals = withdrawals.length || 0;
        const totalBalance = users.reduce((sum, u) => sum + (Number(u.chipBalance) || 0), 0);

        setRealTimeStats({
          todayRevenue,
          activeUsers,
          totalGames: activeUsers * 5, // Estimate
          pendingWithdrawals,
          totalBalance
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
        // Set safe default values if calculation fails
        setRealTimeStats({
          todayRevenue: 0,
          activeUsers: 0,
          totalGames: 0,
          pendingWithdrawals: 0,
          totalBalance: 0
        });
      }
    };

    calculateRealStats();
  }, [adminData]);

  // Safe number formatting function
  const safeFormatNumber = (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString();
  };

  return (
    <div className="dashboard-tab">
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Today's Revenue</h3>
            <div className="stat-value">₹{safeFormatNumber(realTimeStats.todayRevenue)}</div>
            <div className="stat-change positive">From deposits</div>
          </div>
        </div>
        
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="stat-value">{safeFormatNumber(realTimeStats.activeUsers)}</div>
            <div className="stat-change positive">Registered</div>
          </div>
        </div>
        
        <div className="stat-card games">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <h3>Total Balance</h3>
            <div className="stat-value">₹{safeFormatNumber(realTimeStats.totalBalance)}</div>
            <div className="stat-change positive">All users</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pending Withdrawals</h3>
            <div className="stat-value">{safeFormatNumber(realTimeStats.pendingWithdrawals)}</div>
            <div className="stat-change urgent">
              {realTimeStats.pendingWithdrawals > 0 ? 'Requires attention' : 'All clear'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Games Status */}
      <div className="live-games-status">
        <h2>🔴 LIVE GAMES STATUS</h2>
        <div className="games-grid">
          <div className="game-status lightning">
            <div className="game-header">
              <span className="game-icon">⚡</span>
              <h3>Lightning Roulette</h3>
              <span className="status-badge live">LIVE</span>
            </div>
            <div className="game-info">
              <div className="info-item">
                <span>Phase:</span>
                <strong>{(adminData.liveGames?.lightningRoulette?.phase || 'loading').toUpperCase()}</strong>
              </div>
              <div className="info-item">
                <span>Time Left:</span>
                <strong>{adminData.liveGames?.lightningRoulette?.timeLeft || 0}s</strong>
              </div>
              <div className="info-item">
                <span>Players:</span>
                <strong>{adminData.liveGames?.lightningRoulette?.players || 0}</strong>
              </div>
            </div>
          </div>
          
          <div className="game-status dragon">
            <div className="game-header">
              <span className="game-icon">🐉</span>
              <h3>Dragon Tiger</h3>
              <span className="status-badge live">LIVE</span>
            </div>
            <div className="game-info">
              <div className="info-item">
                <span>Phase:</span>
                <strong>{(adminData.liveGames?.dragonTiger?.phase || 'loading').toUpperCase()}</strong>
              </div>
              <div className="info-item">
                <span>Time Left:</span>
                <strong>{adminData.liveGames?.dragonTiger?.timeLeft || 0}s</strong>
              </div>
              <div className="info-item">
                <span>Players:</span>
                <strong>{adminData.liveGames?.dragonTiger?.players || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ QUICK ACTIONS</h2>
        <div className="actions-grid">
          <button className="action-btn emergency" onClick={() => alert('Emergency stop feature ready!')}>
            <AlertTriangle size={24} />
            <span>EMERGENCY STOP ALL GAMES</span>
          </button>
          <button className="action-btn approve" onClick={() => alert(`${realTimeStats.pendingWithdrawals} withdrawals pending`)}>
            <CheckCircle size={24} />
            <span>Process Pending Withdrawals ({realTimeStats.pendingWithdrawals})</span>
          </button>
          <button className="action-btn boost" onClick={() => alert('House edge controls in Game Control tab')}>
            <TrendingUp size={24} />
            <span>Adjust House Edge</span>
          </button>
          <button className="action-btn refresh" onClick={() => window.location.reload()}>
            <RefreshCw size={24} />
            <span>Refresh All Data</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .dashboard-tab {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .stat-card.revenue { border-left: 4px solid #10b981; }
        .stat-card.users { border-left: 4px solid #3b82f6; }
        .stat-card.games { border-left: 4px solid #f59e0b; }
        .stat-card.pending { border-left: 4px solid #ef4444; }

        .stat-icon {
          font-size: 3rem;
          opacity: 0.8;
        }

        .stat-info h3 {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.25rem;
        }

        .stat-change {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .stat-change.positive { color: #10b981; }
        .stat-change.urgent { color: #ef4444; }

        .live-games-status h2, .quick-actions h2 {
          color: #dc2626;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .game-status {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .game-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .game-icon {
          font-size: 2rem;
        }

        .game-header h3 {
          color: white;
          margin: 0;
          flex: 1;
        }

        .status-badge {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          animation: pulse 2s infinite;
        }

        .game-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          color: #888;
        }

        .info-item strong {
          color: white;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 600;
        }

        .action-btn:hover {
          transform: scale(1.02);
        }

        .action-btn.emergency {
          border-color: #ef4444;
          color: #ef4444;
        }

        .action-btn.emergency:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .action-btn.approve {
          border-color: #10b981;
          color: #10b981;
        }

        .action-btn.approve:hover {
          background: rgba(16, 185, 129, 0.1);
        }

        .action-btn.boost {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .action-btn.boost:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .action-btn.refresh {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .action-btn.refresh:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .games-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}


// Game Control Tab Component
function GameControlTab({ adminData, setGameOverride }) {
  const [overrideValues, setOverrideValues] = useState({
    lightningRoulette: { number: 17, color: 'red' },
    dragonTiger: { winner: 'dragon' }
  });

  const applyRouletteOverride = () => {
    setGameOverride('lightningRoulette', overrideValues.lightningRoulette);
  };

  const applyDragonTigerOverride = () => {
    setGameOverride('dragonTiger', {
      dragonCard: { value: 'K', suit: '♠' },
      tigerCard: { value: 'Q', suit: '♥' },
      winner: overrideValues.dragonTiger.winner
    });
  };

  return (
    <div className="game-control-tab">
      <h2>🎮 LIVE GAME CONTROL CENTER</h2>
      
      {/* Lightning Roulette Control */}
      <div className="game-control-section">
        <div className="control-header">
          <h3>⚡ Lightning Roulette Override</h3>
          <span className="current-phase">
            Current: {adminData.liveGames?.lightningRoulette?.phase?.toUpperCase() || 'LOADING'}
          </span>
        </div>
        
        <div className="control-panel">
          <div className="override-controls">
            <div className="control-group">
              <label>Winning Number:</label>
              <select 
                value={overrideValues.lightningRoulette.number}
                onChange={(e) => setOverrideValues(prev => ({
                  ...prev,
                  lightningRoulette: { ...prev.lightningRoulette, number: parseInt(e.target.value) }
                }))}
              >
                {Array.from({length: 37}, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Color:</label>
              <select 
                value={overrideValues.lightningRoulette.color}
                onChange={(e) => setOverrideValues(prev => ({
                  ...prev,
                  lightningRoulette: { ...prev.lightningRoulette, color: e.target.value }
                }))}
              >
                <option value="red">Red</option>
                <option value="black">Black</option>
                <option value="green">Green</option>
              </select>
            </div>
            
            <button className="override-btn lightning" onClick={applyRouletteOverride}>
              <Zap size={20} />
              OVERRIDE NEXT RESULT
            </button>
          </div>
        </div>
      </div>

      {/* Dragon Tiger Control */}
      <div className="game-control-section">
        <div className="control-header">
          <h3>🐉 Dragon Tiger Override</h3>
          <span className="current-phase">
            Current: {adminData.liveGames?.dragonTiger?.phase?.toUpperCase() || 'LOADING'}
          </span>
        </div>
        
        <div className="control-panel">
          <div className="override-controls">
            <div className="control-group">
              <label>Force Winner:</label>
              <select 
                value={overrideValues.dragonTiger.winner}
                onChange={(e) => setOverrideValues(prev => ({
                  ...prev,
                  dragonTiger: { ...prev.dragonTiger, winner: e.target.value }
                }))}
              >
                <option value="dragon">Dragon Wins</option>
                <option value="tiger">Tiger Wins</option>
                <option value="tie">Tie</option>
              </select>
            </div>
            
            <button className="override-btn dragon" onClick={applyDragonTigerOverride}>
              <Crown size={20} />
              OVERRIDE NEXT RESULT
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .game-control-tab {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .game-control-tab h2 {
          color: #dc2626;
          font-size: 1.8rem;
          margin-bottom: 2rem;
        }

        .game-control-section {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
        }

        .control-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .control-header h3 {
          color: #f59e0b;
          font-size: 1.3rem;
          margin: 0;
        }

        .current-phase {
          background: #10b981;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .override-controls {
          display: flex;
          gap: 2rem;
          align-items: end;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          color: #888;
          font-weight: 600;
        }

        .control-group select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 1rem;
        }

        .override-btn {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          height: fit-content;
        }

        .override-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(220, 38, 38, 0.4);
        }

        .override-btn.lightning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .override-btn.dragon {
          background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%);
        }

        @media (max-width: 768px) {
          .override-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

// User Management Tab Component
function UserManagementTab({ adminData, addChipsToUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [chipAmount, setChipAmount] = useState('');
  const [actionType, setActionType] = useState('add');

  const filteredUsers = adminData.users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateBalance = async () => {
    if (selectedUser && chipAmount) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/admin/update-balance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            amount: parseInt(chipAmount),
            action: actionType
          })
        });

        const result = await response.json();
        if (result.success) {
          alert(`✅ ${result.message}`);
          setChipAmount('');
          setSelectedUser(null);
          window.location.reload();
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        alert('❌ Error updating balance: ' + error.message);
      }
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/ban-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          isBanned,
          reason: isBanned ? 'Admin action' : ''
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
        window.location.reload();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert('❌ Error updating user status: ' + error.message);
    }
  };

  return (
    <div className="user-management-tab">
      <h2>👥 USER MANAGEMENT ({adminData.users?.length || 0} Total Users)</h2>
      
      <div className="user-controls">
        <input
          type="text"
          placeholder="Search users by name, email, or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="user-stats">
          <span>Active: {adminData.users?.filter(u => !u.isBanned).length || 0}</span>
          <span>Banned: {adminData.users?.filter(u => u.isBanned).length || 0}</span>
          <span>Total Balance: ₹{(adminData.users?.reduce((sum, u) => sum + (Number(u.chipBalance) || 0), 0) || 0).toLocaleString()}</span>

        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <span>User Details</span>
          <span>Balance</span>
          <span>Status</span>
          <span>Registration</span>
          <span>Actions</span>
        </div>
        
        {filteredUsers.map(user => (
          <div key={user.id} className="table-row">
            <div className="user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className="username">@{user.username}</span>
            </div>
            <div className="balance-info">
              <span className="balance">₹{(Number(user.chipBalance) || 0).toLocaleString()}</span>
<small>({Number(user.chipBalance) || 0} chips)</small>

            </div>
            <span className={`status ${user.isBanned ? 'banned' : 'active'}`}>
              {user.isBanned ? '🚫 Banned' : '✅ Active'}
            </span>
            <span className="registration-date">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <div className="user-actions">
              <button 
                className="action-btn add-chips"
                onClick={() => setSelectedUser(user)}
              >
                💰 Manage
              </button>
              <button 
                className={`action-btn ${user.isBanned ? 'unban' : 'ban'}`}
                onClick={() => handleBanUser(user.id, !user.isBanned)}
              >
                {user.isBanned ? '✅ Unban' : '🚫 Ban'}
              </button>
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="no-users">
            {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
          </div>
        )}
      </div>

      {/* Chip Management Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="chip-management-modal">
            <h3>💰 Manage Chips - {selectedUser.name}</h3>
            <div className="current-balance">
              Current Balance: <strong>₹{(selectedUser.chipBalance || 0).toLocaleString()}</strong>
            </div>
            
            <div className="action-selector">
              <label>
                <input 
                  type="radio" 
                  name="action" 
                  value="add" 
                  checked={actionType === 'add'}
                  onChange={(e) => setActionType(e.target.value)}
                />
                Add Chips
              </label>
              <label>
                <input 
                  type="radio" 
                  name="action" 
                  value="subtract" 
                  checked={actionType === 'subtract'}
                  onChange={(e) => setActionType(e.target.value)}
                />
                Subtract Chips
              </label>
            </div>
            
            <input
              type="number"
              placeholder="Amount"
              value={chipAmount}
              onChange={(e) => setChipAmount(e.target.value)}
              min="1"
            />
            
            <div className="preview">
              New Balance: <strong>
                ₹{actionType === 'add' 
  ? ((Number(selectedUser.chipBalance) || 0) + parseInt(chipAmount || 0)).toLocaleString()
  : Math.max(0, (Number(selectedUser.chipBalance) || 0) - parseInt(chipAmount || 0)).toLocaleString()
}
              </strong>
            </div>
            
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleUpdateBalance}>
                {actionType === 'add' ? '➕ Add' : '➖ Subtract'} Chips
              </button>
              <button className="cancel-btn" onClick={() => setSelectedUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-management-tab h2 {
          color: #dc2626;
          margin-bottom: 2rem;
        }

        .user-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .search-input {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1rem;
          flex: 1;
          max-width: 400px;
        }

        .user-stats {
          display: flex;
          gap: 2rem;
          color: #888;
          font-size: 0.9rem;
        }

        .user-stats span {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .users-table {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.5);
          font-weight: 700;
          color: #888;
          border-bottom: 1px solid var(--glass-border);
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          align-items: center;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-info strong {
          color: white;
          margin-bottom: 0.25rem;
        }

        .user-info span {
          color: #888;
          font-size: 0.9rem;
        }

        .username {
          color: #10b981;
          font-size: 0.8rem;
        }

        .balance-info {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .balance {
          color: #10b981;
          font-weight: 700;
        }

        .balance-info small {
          color: #888;
          font-size: 0.8rem;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
        }

        .status.active {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status.banned {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .action-btn.add-chips {
          background: #10b981;
          color: white;
        }

        .action-btn.ban {
          background: #ef4444;
          color: white;
        }

        .action-btn.unban {
          background: #10b981;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 4000;
        }

        .chip-management-modal {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          min-width: 400px;
        }

        .current-balance {
          background: rgba(16, 185, 129, 0.1);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          color: #10b981;
        }

        .action-selector {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .action-selector label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          cursor: pointer;
        }

        .chip-management-modal input[type="number"] {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          font-size: 1rem;
          margin-bottom: 1rem;
          width: 200px;
        }

        .preview {
          margin-top: 1rem;
          color: #f59e0b;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .confirm-btn {
          background: #10b981;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-btn {
          background: #ef4444;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .no-users {
          text-align: center;
          color: #666;
          padding: 3rem;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .user-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .user-stats {
            justify-content: space-between;
          }
          
          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

// Financial Tab Component
function FinancialTab({ adminData, approveDeposit, rejectDeposit }) {
  const pendingDeposits = adminData.pendingRequests?.deposits || [];
  const pendingWithdrawals = adminData.pendingRequests?.withdrawals || [];

  return (
    <div className="financial-tab">
      <h2>💰 FINANCIAL MANAGEMENT</h2>
      
      {/* Pending Deposits */}
      <div className="financial-section">
        <h3>📥 Pending Deposits ({pendingDeposits.length})</h3>
        <div className="requests-list">
          {pendingDeposits.length === 0 ? (
            <div className="no-requests">
              <div className="empty-icon">📋</div>
              <h4>No Pending Deposits</h4>
              <p>All deposit requests have been processed</p>
            </div>
          ) : (
            pendingDeposits.map(deposit => (
              <div key={deposit.id} className="request-item">
                <div className="request-info">
                  <strong>{deposit.userName || 'Unknown User'}</strong>
                  <span className="amount">₹{(deposit.chipAmount || 0).toLocaleString()}</span>
                  <span className="utr">UTR: {deposit.utrNumber}</span>
                  <span className="time">{new Date(deposit.createdAt).toLocaleString()}</span>
                  <span className="channel">Channel: {deposit.paymentChannel}</span>
                </div>
                <div className="request-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => approveDeposit(deposit.id)}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => rejectDeposit(deposit.id, 'Invalid UTR')}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Withdrawals */}
      <div className="financial-section">
        <h3>📤 Pending Withdrawals ({pendingWithdrawals.length})</h3>
        <div className="requests-list">
          {pendingWithdrawals.length === 0 ? (
            <div className="no-requests">
              <div className="empty-icon">💸</div>
              <h4>No Pending Withdrawals</h4>
              <p>All withdrawal requests have been processed</p>
            </div>
          ) : (
            pendingWithdrawals.map(withdrawal => (
              <div key={withdrawal.id} className="request-item">
                <div className="request-info">
                  <strong>{withdrawal.userName || 'Unknown User'}</strong>
                  <span className="amount">₹{(withdrawal.chipAmount || 0).toLocaleString()}</span>
                  <span className="method">{withdrawal.withdrawalMethod}</span>
                  <span className="time">{new Date(withdrawal.createdAt).toLocaleString()}</span>
                </div>
                <div className="request-actions">
                  <button className="approve-btn">
                    <CheckCircle size={16} />
                    Process
                  </button>
                  <button className="reject-btn">
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Financial Stats */}
      <div className="financial-stats">
        <h3>📊 Financial Summary</h3>
        <div className="stats-row">
          <div className="financial-stat">
            <span>Total Users:</span>
            <strong className="positive">{adminData.users?.length || 0}</strong>
          </div>
          <div className="financial-stat">
            <span>Pending Deposits:</span>
            <strong className="neutral">{pendingDeposits.length}</strong>
          </div>
          <div className="financial-stat">
            <span>Pending Withdrawals:</span>
            <strong className="neutral">{pendingWithdrawals.length}</strong>
          </div>
          <div className="financial-stat">
            <span>Total User Balance:</span>
            <strong className="positive">₹{(adminData.users?.reduce((sum, u) => sum + (u.chipBalance || 0), 0) || 0).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        .financial-tab h2 {
          color: #dc2626;
          margin-bottom: 2rem;
        }

        .financial-section {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .financial-section h3 {
          color: #f59e0b;
          margin-bottom: 1.5rem;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .no-requests {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-requests h4 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .request-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .request-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .request-info strong {
          color: white;
          font-size: 1.1rem;
        }

        .request-info span {
          color: #888;
          font-size: 0.9rem;
        }

        .amount {
          color: #10b981 !important;
          font-weight: 700 !important;
        }

        .utr {
          color: #f59e0b !important;
          font-family: monospace;
        }

        .request-actions {
          display: flex;
          gap: 1rem;
        }

        .approve-btn, .reject-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .approve-btn {
          background: #10b981;
          color: white;
        }

        .approve-btn:hover {
          background: #059669;
          transform: scale(1.05);
        }

        .reject-btn {
          background: #ef4444;
          color: white;
        }

        .reject-btn:hover {
          background: #dc2626;
          transform: scale(1.05);
        }

        .financial-stats {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
        }

        .financial-stats h3 {
          color: #10b981;
          margin-bottom: 1.5rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .financial-stat {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .financial-stat span {
          color: #888;
        }

        .financial-stat strong.positive {
          color: #10b981;
        }

        .financial-stat strong.negative {
          color: #ef4444;
        }

        .financial-stat strong.neutral {
          color: #f59e0b;
        }

        @media (max-width: 768px) {
          .request-item {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .request-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="settings-tab">
      <h2>⚙️ SYSTEM SETTINGS</h2>
      
      <div className="settings-section">
        <h3>🎮 Game Settings</h3>
        <div className="setting-item">
          <label>Maintenance Mode:</label>
          <button className="toggle-btn">OFF</button>
        </div>
        <div className="setting-item">
          <label>New User Registrations:</label>
          <button className="toggle-btn active">ON</button>
        </div>
        <div className="setting-item">
          <label>Auto-approve small deposits (&lt;₹1000):</label>
          <button className="toggle-btn active">ON</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>💰 Financial Settings</h3>
        <div className="setting-item">
          <label>Maximum bet per game:</label>
          <input type="number" defaultValue="5000" />
        </div>
        <div className="setting-item">
          <label>Daily withdrawal limit:</label>
          <input type="number" defaultValue="50000" />
        </div>
        <div className="setting-item">
          <label>Minimum deposit amount:</label>
          <input type="number" defaultValue="100" />
        </div>
      </div>

      <style jsx>{`
        .settings-tab h2 {
          color: #dc2626;
          margin-bottom: 2rem;
        }

        .settings-section {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .settings-section h3 {
          color: #f59e0b;
          margin-bottom: 1.5rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid var(--glass-border);
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-item label {
          color: white;
          font-weight: 600;
        }

        .toggle-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .toggle-btn.active {
          background: #10b981;
        }

        .setting-item input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          width: 120px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;
