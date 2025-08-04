import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, Shield, Globe, Moon, Sun } from 'lucide-react';

function SettingsPage({ user, setUser, balance }) {
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="settings-header">
        <div className="header-container">
          <div className="logo">
            <h1 className="gradient-text-gold">🔥 Lucifer's Casino</h1>
          </div>
          <div className="header-actions">
            <div className="balance-display">
              <span>₹{balance.toLocaleString()}</span>
            </div>
            <div className="profile-dropdown">
              <button 
                className="profile-btn"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User size={20} />
                <span>{user?.name || 'Player'}</span>
              </button>
              {showProfile && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => navigate('/dashboard')}>
                    🎮 Dashboard
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/account')}>
                    👤 Account
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/wallet')}>
                    💰 Wallet
                  </button>
                  <button className="dropdown-item active">
                    ⚙️ Settings
                  </button>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="settings-container">
        <div className="settings-header-section">
          <h2>⚙️ Settings</h2>
          <p>Customize your casino experience</p>
        </div>

        <div className="settings-content">
          <div className="settings-card glass-card">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div className="setting-details">
                  <h3>Dark Mode</h3>
                  <p>Switch between light and dark themes</p>
                </div>
              </div>
              <div className="setting-control">
                <button 
                  className={`toggle-btn ${darkMode ? 'active' : ''}`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <Bell size={24} />
                </div>
                <div className="setting-details">
                  <h3>Notifications</h3>
                  <p>Receive updates about wins, bonuses, and promotions</p>
                </div>
              </div>
              <div className="setting-control">
                <button 
                  className={`toggle-btn ${notifications ? 'active' : ''}`}
                  onClick={() => setNotifications(!notifications)}
                >
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <Globe size={24} />
                </div>
                <div className="setting-details">
                  <h3>Language</h3>
                  <p>Choose your preferred language</p>
                </div>
              </div>
              <div className="setting-control">
                <select className="language-select">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">
                  <Shield size={24} />
                </div>
                <div className="setting-details">
                  <h3>Privacy</h3>
                  <p>Manage your privacy and data settings</p>
                </div>
              </div>
              <div className="setting-control">
                <button className="btn btn-outline">Manage</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          background: var(--dark-bg);
          position: relative;
        }
        
        .settings-page::before {
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
        
        .settings-header {
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
        
        .balance-display {
          background: var(--gradient-primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 1.1rem;
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
        
        .settings-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 2;
        }
        
        .settings-header-section {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .settings-header-section h2 {
          font-size: 3rem;
          color: var(--primary-red);
          font-weight: 800;
          margin-bottom: 1rem;
        }
        
        .settings-header-section p {
          color: #888;
          font-size: 1.2rem;
        }
        
        .settings-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .settings-card {
          padding: 2rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }
        
        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
          border-bottom: 1px solid var(--glass-border);
        }
        
        .setting-item:last-child {
          border-bottom: none;
        }
        
        .setting-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .setting-icon {
          width: 50px;
          height: 50px;
          background: var(--glass-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-red);
        }
        
        .setting-details h3 {
          color: white;
          margin-bottom: 0.25rem;
          font-size: 1.1rem;
        }
        
        .setting-details p {
          color: #888;
          font-size: 0.9rem;
        }
        
        .setting-control {
          display: flex;
          align-items: center;
        }
        
        .toggle-btn {
          width: 60px;
          height: 30px;
          background: #333;
          border: none;
          border-radius: 15px;
          position: relative;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .toggle-btn.active {
          background: var(--primary-red);
        }
        
        .toggle-slider {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.3s ease;
        }
        
        .toggle-btn.active .toggle-slider {
          transform: translateX(30px);
        }
        
        .language-select {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          cursor: pointer;
        }
        
        .language-select:focus {
          outline: none;
          border-color: var(--primary-red);
        }
        
        @media (max-width: 768px) {
          .settings-container {
            padding: 1rem;
          }
          
          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .setting-control {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

export default SettingsPage;
