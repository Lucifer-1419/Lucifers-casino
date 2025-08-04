import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Camera, Save, X, Eye, EyeOff, Crown, Star, Trophy, Target } from 'lucide-react';

function Account({ user, setUser, balance }) {
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Player',
    email: 'player@luciferscasino.com',
    phone: '+1 (555) 123-4567',
    address: '123 Hell Street, Underworld',
    dateOfBirth: '1990-01-01',
    bio: 'A devoted soul seeking fortune in the flames of chance.',
    avatar: '👤'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handlePasswordChange = () => {
    setShowPasswordChange(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    // Password change logic here
  };

  const accountStats = [
    { icon: Trophy, label: 'Total Wins', value: '₹45,230', color: '#f59e0b' },
    { icon: Target, label: 'Games Played', value: '1,247', color: '#dc2626' },
    { icon: Star, label: 'VIP Level', value: 'Diamond', color: '#8b5cf6' },
    { icon: Crown, label: 'Achievements', value: '23', color: '#10b981' }
  ];

  const recentActivity = [
    { game: 'Fire Joker', action: 'Won', amount: '+₹2,500', time: '2 hours ago', emoji: '🔥' },
    { game: 'Lightning Roulette', action: 'Lost', amount: '-₹500', time: '4 hours ago', emoji: '⚡' },
    { game: 'Mega Fortune', action: 'Won', amount: '+₹15,000', time: '1 day ago', emoji: '💎' },
    { game: 'Blackjack VIP', action: 'Won', amount: '+₹3,200', time: '2 days ago', emoji: '🃏' },
    { game: 'Dragon Tiger', action: 'Lost', amount: '-₹800', time: '3 days ago', emoji: '🐉' }
  ];

  return (
    <div className="account-page">
      {/* Header */}
      <header className="account-header">
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
                <span>{profileData.name}</span>
              </button>
              {showProfile && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => navigate('/dashboard')}>
                    🎮 Dashboard
                  </button>
                  <button className="dropdown-item active">
                    👤 Account
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/wallet')}>
                    💰 Wallet
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/settings')}>
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

      <div className="account-container">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="sidebar-header">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <div className="avatar">{profileData.avatar}</div>
                <button className="avatar-edit">
                  <Camera size={16} />
                </button>
              </div>
              <div className="user-info">
                <h3>{profileData.name}</h3>
                <p className="vip-status">
                  <Crown size={16} />
                  Diamond VIP
                </p>
              </div>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <Trophy size={20} />
              Statistics
            </button>
            <button 
              className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <Target size={20} />
              Activity
            </button>
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={20} />
              Security
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="account-main">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="content-section">
              <div className="section-header">
                <h2>👤 Profile Information</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <X size={18} /> : <Edit3 size={18} />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="profile-grid">
                <div className="profile-card glass-card">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  
                  {isEditing && (
                    <button className="btn btn-primary btn-full" onClick={handleSave}>
                      <Save size={18} />
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="content-section">
              <div className="section-header">
                <h2>📊 Your Statistics</h2>
              </div>
              
              <div className="stats-grid">
                {accountStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="stat-card glass-card hover-lift">
                      <div className="stat-icon" style={{ color: stat.color }}>
                        <IconComponent size={32} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="achievement-section">
                <h3>🏆 Recent Achievements</h3>
                <div className="achievements-grid">
                  <div className="achievement-card glass-card">
                    <div className="achievement-icon">🔥</div>
                    <div className="achievement-info">
                      <h4>Hot Streak</h4>
                      <p>Won 5 games in a row</p>
                    </div>
                  </div>
                  <div className="achievement-card glass-card">
                    <div className="achievement-icon">💎</div>
                    <div className="achievement-info">
                      <h4>Diamond Player</h4>
                      <p>Reached VIP Diamond level</p>
                    </div>
                  </div>
                  <div className="achievement-card glass-card">
                    <div className="achievement-icon">🎰</div>
                    <div className="achievement-info">
                      <h4>Slot Master</h4>
                      <p>Won 100 slot games</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="content-section">
              <div className="section-header">
                <h2>📈 Recent Activity</h2>
              </div>
              
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item glass-card">
                    <div className="activity-icon">{activity.emoji}</div>
                    <div className="activity-info">
                      <div className="activity-game">{activity.game}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                    <div className="activity-action">
                      <span className="action-type">{activity.action}</span>
                      <span className={`amount ${activity.action === 'Won' ? 'win' : 'loss'}`}>
                        {activity.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="content-section">
              <div className="section-header">
                <h2>🔒 Security Settings</h2>
              </div>
              
              <div className="security-grid">
                <div className="security-card glass-card">
                  <div className="security-header">
                    <Shield size={24} />
                    <h3>Password</h3>
                  </div>
                  <p>Keep your account secure with a strong password</p>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setShowPasswordChange(true)}
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="security-card glass-card">
                  <div className="security-header">
                    <Mail size={24} />
                    <h3>Email Verification</h3>
                  </div>
                  <p>Email address is verified and secure</p>
                  <div className="status-badge verified">✅ Verified</div>
                </div>
                
                <div className="security-card glass-card">
                  <div className="security-header">
                    <Phone size={24} />
                    <h3>Two-Factor Authentication</h3>
                  </div>
                  <p>Add extra security to your account</p>
                  <button className="btn btn-primary">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="modal-overlay" onClick={() => setShowPasswordChange(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔒 Change Password</h3>
              <button className="close-btn" onClick={() => setShowPasswordChange(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowPasswordChange(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handlePasswordChange}>
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .account-page {
          min-height: 100vh;
          background: var(--dark-bg);
          position: relative;
        }
        
        .account-page::before {
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
        
        .account-header {
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
        
        .account-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          position: relative;
          z-index: 2;
        }
        
        .account-sidebar {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        
        .sidebar-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .avatar-wrapper {
          position: relative;
        }
        
        .avatar {
          width: 80px;
          height: 80px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }
        
        .avatar-edit {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--primary-gold);
          color: #000;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .avatar-edit:hover {
          transform: scale(1.1);
        }
        
        .user-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .vip-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-gold);
          font-weight: 600;
        }
        
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s ease;
          text-align: left;
          font-size: 1rem;
        }
        
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        
        .nav-item.active {
          background: var(--gradient-primary);
          color: white;
        }
        
        .account-main {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
        }
        
        .content-section {
          max-width: 100%;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .section-header h2 {
          font-size: 2rem;
          color: var(--primary-red);
          font-weight: 800;
        }
        
        .profile-grid {
          display: grid;
          gap: 2rem;
        }
        
        .profile-card {
          padding: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #ccc;
          font-weight: 600;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-red);
          background: rgba(255, 255, 255, 0.1);
        }
        
        .form-group input:disabled,
        .form-group textarea:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #888;
          font-size: 0.9rem;
        }
        
        .achievement-section {
          margin-top: 3rem;
        }
        
        .achievement-section h3 {
          font-size: 1.5rem;
          color: var(--primary-gold);
          margin-bottom: 1.5rem;
        }
        
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .achievement-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .achievement-card:hover {
          transform: translateY(-3px);
        }
        
        .achievement-icon {
          font-size: 2.5rem;
        }
        
        .achievement-info h4 {
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .achievement-info p {
          color: #888;
          font-size: 0.9rem;
        }
        
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .activity-item:hover {
          transform: translateY(-2px);
        }
        
        .activity-icon {
          font-size: 2rem;
          width: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .activity-info {
          flex: 1;
        }
        
        .activity-game {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }
        
        .activity-time {
          color: #888;
          font-size: 0.9rem;
        }
        
        .activity-action {
          text-align: right;
        }
        
        .action-type {
          display: block;
          font-size: 0.9rem;
          color: #888;
          margin-bottom: 0.25rem;
        }
        
        .amount {
          font-size: 1.2rem;
          font-weight: 700;
        }
        
        .amount.win {
          color: #10b981;
        }
        
        .amount.loss {
          color: #ef4444;
        }
        
        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .security-card {
          padding: 2rem;
          text-align: center;
        }
        
        .security-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .security-header h3 {
          color: white;
          font-size: 1.2rem;
        }
        
        .security-card p {
          color: #888;
          margin-bottom: 1.5rem;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .status-badge.verified {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
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
          z-index: 2000;
          padding: 1rem;
        }
        
        .modal {
          width: 100%;
          max-width: 400px;
          padding: 0;
          overflow: hidden;
        }
        
        .modal-header {
          padding: 2rem 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--glass-border);
        }
        
        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--primary-red);
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--primary-red);
        }
        
        .modal-content {
          padding: 2rem;
        }
        
        .password-field {
          position: relative;
        }
        
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        
        .password-toggle:hover {
          color: var(--primary-red);
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .modal-actions .btn {
          flex: 1;
        }
        
        @media (max-width: 768px) {
          .account-container {
            grid-template-columns: 1fr;
            padding: 1rem;
          }
          
          .account-sidebar {
            position: static;
          }
          
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .achievements-grid {
            grid-template-columns: 1fr;
          }
          
          .security-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Account;
