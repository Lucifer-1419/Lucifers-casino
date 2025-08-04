import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, HelpCircle, LogOut, ChevronDown, Star, TrendingUp, Trophy, Gamepad2, Plus } from 'lucide-react';
import FireJokerSlot from '../components/FireJokerSlot';
import BlackjackVIP from '../components/BlackjackVIP';
import LightningRoulette from '../components/LightningRoulette';
import DragonTiger from '../components/DragonTiger';
import ApiService from '../services/api';
import AdminPanel from '../components/AdminPanel';

function Dashboard({ user, setUser, balance, setBalance }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showGame, setShowGame] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

// Admin check function
const isAdmin = (user) => {
  const adminEmails = [
    'admin@lucifer.com',
    'owner@lucifer.com',
    'lucifer@fallenangle.com'  // Replace with your actual email
  ];
  return adminEmails.includes(user?.email);
};

  const navigate = useNavigate();

const games = [
  { name: 'Fire Joker', category: 'Slots', emoji: '🔥', hot: true, players: '2.1K' },
  { name: 'Lightning Roulette', category: 'Live Casino', emoji: '⚡', hot: true, players: '856' },
  { name: 'Blackjack VIP', category: 'Table Games', emoji: '🃏', hot: true, players: '1.3K' },
  { name: 'Mega Fortune', category: 'Jackpots', emoji: '💎', hot: true, players: '945' },
  { name: 'Dragon Tiger', category: 'Live Casino', emoji: '🐉', hot: true, players: '687' }, // Made it hot!
  { name: 'Sweet Bonanza', category: 'Slots', emoji: '🍭', hot: true, players: '1.8K' },
  { name: 'Crazy Time', category: 'Live Casino', emoji: '🎡', hot: false, players: '1.2K' },
  { name: 'Starburst', category: 'Slots', emoji: '⭐', hot: true, players: '2.5K' }
];

  const categories = ['All', 'Slots', 'Live Casino', 'Table Games', 'Jackpots'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGames = activeCategory === 'All' 
    ? games 
    : games.filter(game => game.category === activeCategory);

  // Refresh balance when component loads
  useEffect(() => {
    const refreshBalance = async () => {
      if (user) {
        try {
          const response = await ApiService.getBalance();
          if (response.success) {
            setBalance(response.balance);
          }
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      }
    };

    refreshBalance();
  }, [user, setBalance]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleGamePlay = (gameName) => {
    setShowGame(gameName);
  };

  const handleAdminAccess = () => {
  setShowAdmin(true);
};


  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="logo">
            <h1 className="gradient-text-gold">🔥 Lucifer's Casino</h1>
          </div>
          <div className="header-actions">
            <button 
              className="balance-display clickable-balance"
              onClick={() => navigate('/wallet')}
            >
              <Wallet size={20} />
              <span>{balance.toLocaleString()} CHIPS</span>
              <span className="wallet-hint">💰</span>
            </button>
            <div className="profile-dropdown">
              <button 
                className="profile-btn"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User size={20} />
                <span>{user?.name || 'Player'}</span>
                <ChevronDown size={16} />
              </button>
              {showProfile && (
  <div className="dropdown-menu">
    <button className="dropdown-item active" onClick={() => navigate('/dashboard')}>
      🎮 Dashboard
    </button>
    <button className="dropdown-item" onClick={() => navigate('/account')}>
      👤 Account
    </button>
    <button className="dropdown-item" onClick={() => navigate('/wallet')}>
      💰 Wallet
    </button>
    <button className="dropdown-item" onClick={() => navigate('/settings')}>
      ⚙️ Settings
    </button>
    
    {/* ADMIN ACCESS - ONLY FOR AUTHORIZED USERS */}
    {isAdmin(user) && (
      <button className="dropdown-item admin-access" onClick={handleAdminAccess}>
        👑 Admin Panel
      </button>
    )}
    
    <button className="dropdown-item logout" onClick={handleLogout}>
      🚪 Logout
    </button>
  </div>
)}

            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-container">
          <div className="welcome-content">
            <h2>Welcome back, {user?.name}! 👹</h2>
            <p>Ready to ignite your fortune in the flames of chance?</p>
            <div className="quick-actions">
              <button className="btn btn-primary" onClick={() => navigate('/wallet')}>
                <Plus size={18} />
                Deposit Funds
              </button>
              <button className="btn btn-outline">
                <Trophy size={18} />
                View Rewards
              </button>
            </div>
          </div>
          <div className="welcome-stats">
            <div className="stat-card glass-card">
              <div className="stat-icon">🎰</div>
              <div className="stat-info">
                <strong>23</strong>
                <span>Games Played</span>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <strong>₹8,450</strong>
                <span>Total Winnings</span>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <strong>Level 3</strong>
                <span>VIP Status</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section">
        <div className="games-container">
          <div className="games-header">
            <h2>🎮 Choose Your Game</h2>
            <div className="game-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="games-grid">
            {filteredGames.map((game, index) => (
              <div key={index} className="game-card glass-card hover-lift">
                {game.hot && (
                  <div className="hot-badge">
                    <Star size={12} />
                    HOT
                  </div>
                )}
                <div className="game-image">{game.emoji}</div>
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p className="game-category">{game.category}</p>
                  <div className="game-players">
                    <span>👥 {game.players} playing</span>
                  </div>
                </div>
                <div className="game-actions">
                  <button className="btn btn-outline btn-small">Demo</button>
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => handleGamePlay(game.name)}
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fire Joker Game Modal */}
      {showGame === 'Fire Joker' && (
        <FireJokerSlot
          user={user}
          balance={balance}
          setBalance={setBalance}
          onClose={() => setShowGame(null)}
        />
      )}

      {/* Blackjack modal */}
{showGame === 'Blackjack VIP' && (
  <BlackjackVIP
    user={user}
    balance={balance}
    setBalance={setBalance}
    onClose={() => setShowGame(null)}
  />
)}


{showGame === 'Lightning Roulette' && (
  <LightningRoulette
    user={user}
    balance={balance}
    setBalance={setBalance}
    onClose={() => setShowGame(null)}
  />
)}

{/* Dragon Tiger modal */}
{showGame === 'Dragon Tiger' && (
  <DragonTiger
    user={user}
    balance={balance}
    setBalance={setBalance}
    onClose={() => setShowGame(null)}
  />
)}

{/* ADMIN PANEL MODAL */}
{showAdmin && (
  <AdminPanel onClose={() => setShowAdmin(false)} />
)}


      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: var(--dark-bg);
          position: relative;
        }
        
        .dashboard::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .dashboard-header {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 80px;
        }
        
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .logo h1 {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .clickable-balance {
          background: var(--gradient-primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .clickable-balance:hover {
          background: var(--gradient-gold);
          color: #000;
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
        }

        .clickable-balance::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .clickable-balance:hover::before {
          left: 100%;
        }

        .wallet-hint {
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .clickable-balance:hover .wallet-hint {
          opacity: 1;
        }
        
        .profile-dropdown {
          position: relative;
        }
        
        .profile-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-weight: 600;
        }
        
        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary-red);
        }
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          min-width: 180px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 1001;
          overflow: hidden;
        }
        
        .dropdown-item {
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          text-align: left;
        }
        
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .dropdown-item.active {
          background: rgba(220, 38, 38, 0.1);
          color: var(--primary-red);
        }
        
        .dropdown-item.logout {
          color: var(--primary-red);
          border-top: 1px solid var(--glass-border);
        }
        
        .dropdown-item.logout:hover {
          background: rgba(220, 38, 38, 0.1);
        }
        
        .welcome-section {
          padding: 3rem 0;
          position: relative;
          z-index: 2;
        }
        
        .welcome-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: center;
        }
        
        .welcome-content h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: var(--primary-red);
        }
        
        .welcome-content p {
          color: #888;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        
        .quick-actions {
          display: flex;
          gap: 1rem;
        }
        
        .welcome-stats {
          display: flex;
          gap: 1.5rem;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          min-width: 160px;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }
        
        .stat-icon {
          font-size: 2rem;
        }
        
        .stat-info strong {
          display: block;
          font-size: 1.5rem;
          color: var(--primary-red);
          font-weight: 800;
        }
        
        .stat-info span {
          color: #888;
          font-size: 0.9rem;
        }
        
        .games-section {
          padding: 3rem 0;
          background: var(--dark-secondary);
          position: relative;
          z-index: 2;
        }
        
        .games-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .games-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        
        .games-header h2 {
          font-size: 2.5rem;
          color: var(--primary-red);
          font-weight: 800;
        }
        
        .game-filters {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          padding: 0.75rem 1.5rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: #888;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }
        
        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--primary-red);
        }
        
        .filter-btn.active {
          background: var(--gradient-primary);
          color: white;
          border-color: var(--primary-red);
        }
        
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .game-card {
          position: relative;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s ease;
        }
        
        .game-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .hot-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--gradient-gold);
          color: #000;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .game-image {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        
        .game-info h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .game-category {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .game-players {
          color: #666;
          font-size: 0.8rem;
          margin-bottom: 1.5rem;
        }
        
        .game-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .btn-small {
          padding: 0.6rem 1.2rem;
          font-size: 0.85rem;
        }
        
        @media (max-width: 768px) {
          .header-container {
            padding: 0 1rem;
          }
          
          .welcome-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
            padding: 0 1rem;
          }
          
          .welcome-stats {
            flex-direction: column;
            width: 100%;
          }
          
          .stat-card {
            min-width: auto;
          }
          
          .games-container {
            padding: 0 1rem;
          }
          
          .games-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .game-filters {
            justify-content: center;
          }
          
          .games-grid {
            grid-template-columns: 1fr;
          }
          
          .game-actions {
            flex-direction: column;
          }
        }
          .dropdown-item.admin-access {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  border: 1px solid #dc2626;
  margin: 0.5rem 0;
  font-weight: 700;
}

.dropdown-item.admin-access:hover {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
  transform: scale(1.02);
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
}

      `}</style>
    </div>
  );
}

export default Dashboard;
