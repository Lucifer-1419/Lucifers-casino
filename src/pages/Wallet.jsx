import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Wallet, ArrowUp, ArrowDown, CreditCard, DollarSign, 
  TrendingUp, Clock, X, Plus, Copy, QrCode, CheckCircle,
  AlertCircle, Smartphone, Building, Zap, Gift
} from 'lucide-react';
import ApiService from '../services/api';

function WalletPage({ user, setUser, balance, setBalance }) {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [chipPackages, setChipPackages] = useState([]);
  const [paymentChannels, setPaymentChannels] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  
  // Deposit flow states
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [depositStep, setDepositStep] = useState(1); // 1: package, 2: payment, 3: channel, 4: UTR
  
  // Withdrawal states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState(null);
  
  // Add method states
  const [newMethodType, setNewMethodType] = useState('');
  const [newMethodDetails, setNewMethodDetails] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      const [packagesRes, channelsRes, balanceRes, depositRes, withdrawalRes, methodsRes] = await Promise.all([
        ApiService.getChipPackages(),
        ApiService.getPaymentChannels(),
        ApiService.getBalance(),
        ApiService.getDepositHistory(5),
        ApiService.getWithdrawalHistory(5),
        ApiService.getWithdrawalMethods()
      ]);

      setChipPackages(packagesRes.packages);
      setPaymentChannels(channelsRes.channels);
      setBalance(balanceRes.balance);
      setDepositHistory(depositRes.deposits);
      setWithdrawalHistory(withdrawalRes.withdrawals);
      setWithdrawalMethods(methodsRes.withdrawalMethods);
      
    } catch (error) {
      console.error('Error loading wallet ', error);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setDepositStep(2);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setDepositStep(3);
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setDepositStep(4);
  };

  const handleDepositSubmit = async () => {
    if (!utrNumber || utrNumber.length < 10) {
      setError('Please enter a valid UTR/Transaction ID');
      return;
    }

    try {
      setLoading(true);
      
      const depositData = {
        chipAmount: selectedPackage.chips + selectedPackage.bonus,
        paymentMethod: selectedPaymentMethod,
        paymentChannel: selectedChannel.id,
        utrNumber: utrNumber.trim()
      };

      const response = await ApiService.createDepositRequest(depositData);
      
      if (response.success) {
        alert('🔥 Deposit request submitted successfully! Please wait for admin approval.');
        setShowDepositModal(false);
        resetDepositFlow();
        loadWalletData(); // Refresh data
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetDepositFlow = () => {
    setSelectedPackage(null);
    setSelectedPaymentMethod(null);
    setSelectedChannel(null);
    setUtrNumber('');
    setDepositStep(1);
    setError('');
  };

  const handleAddWithdrawalMethod = async () => {
    try {
      setLoading(true);
      
      const response = await ApiService.addWithdrawalMethod({
        type: newMethodType,
        details: newMethodDetails
      });

      if (response.success) {
        setWithdrawalMethods(response.withdrawalMethods);
        setShowAddMethodModal(false);
        setNewMethodType('');
        setNewMethodDetails({});
        alert('✅ Withdrawal method added successfully!');
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || withdrawAmount < 100) {
      setError('Minimum withdrawal is 100 chips');
      return;
    }

    if (!selectedWithdrawMethod) {
      setError('Please select a withdrawal method');
      return;
    }

    try {
      setLoading(true);
      
      const response = await ApiService.createWithdrawalRequest({
        chipAmount: parseInt(withdrawAmount),
        withdrawalMethodId: selectedWithdrawMethod.id
      });

      if (response.success) {
        setBalance(response.newBalance);
        alert('🔥 Withdrawal request submitted successfully! Please wait for admin approval.');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setSelectedWithdrawMethod(null);
        loadWalletData(); // Refresh data
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PROCESSING': return <Clock size={16} className="text-yellow-500" />;
      case 'ACCEPTED': return <CheckCircle size={16} className="text-green-500" />;
      case 'REJECTED': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROCESSING': return 'text-yellow-500';
      case 'ACCEPTED': return 'text-green-500';
      case 'REJECTED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="wallet-page">
      {/* Header */}
      <header className="wallet-header">
        <div className="header-container">
          <div className="logo">
            <h1 className="gradient-text-gold">🔥 Lucifer's Casino</h1>
          </div>
          <div className="header-actions">
            <div className="balance-display">
              <Wallet size={20} />
              <span>{balance.toLocaleString()} CHIPS</span>
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
                  <button className="dropdown-item active">
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

      <div className="wallet-container">
        {/* Balance Card */}
        <div className="balance-card glass-card">
          <div className="balance-info">
            <div className="balance-icon">💰</div>
            <div className="balance-details">
              <h3>Total Chip Balance</h3>
              <div className="balance-amount">{balance.toLocaleString()} CHIPS</div>
              <div className="balance-value">≈ ₹{balance.toLocaleString()}</div>
            </div>
          </div>
          <div className="balance-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowDepositModal(true)}
            >
              <ArrowUp size={18} />
              Buy Chips
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => setShowWithdrawModal(true)}
            >
              <ArrowDown size={18} />
              Withdraw
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="wallet-tabs">
          <button 
            className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            <ArrowUp size={18} />
            Deposit History
          </button>
          <button 
            className={`tab-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            <ArrowDown size={18} />
            Withdraw History
          </button>
        </div>

        {/* Transaction History */}
        <div className="transaction-history">
          {activeTab === 'deposit' && (
            <div className="history-section">
              <div className="section-header">
                <h3>Recent Deposits</h3>
                <button className="btn btn-outline btn-small">View All</button>
              </div>
              <div className="transactions-list">
                {depositHistory.length === 0 ? (
                  <div className="empty-state">
                    <Gift size={48} />
                    <h4>No Deposits Yet</h4>
                    <p>Start by buying your first chip package!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowDepositModal(true)}
                    >
                      Buy Chips Now
                    </button>
                  </div>
                ) : (
                  depositHistory.map((deposit, index) => (
                    <div key={index} className="transaction-item glass-card">
                      <div className="transaction-icon deposit">
                        <ArrowUp size={20} />
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-type">Chip Purchase</div>
                        <div className="transaction-details">
                          {deposit.chipAmount} Chips • {deposit.paymentChannel}
                        </div>
                        <div className="transaction-time">
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="transaction-status">
                        {getStatusIcon(deposit.status)}
                        <span className={getStatusColor(deposit.status)}>
                          {deposit.status}
                        </span>
                      </div>
                      <div className="transaction-amount positive">
                        +{deposit.chipAmount} CHIPS
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="history-section">
              <div className="section-header">
                <h3>Recent Withdrawals</h3>
                <button className="btn btn-outline btn-small">View All</button>
              </div>
              <div className="transactions-list">
                {withdrawalHistory.length === 0 ? (
                  <div className="empty-state">
                    <Wallet size={48} />
                    <h4>No Withdrawals Yet</h4>
                    <p>Add a withdrawal method to cash out your chips!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddMethodModal(true)}
                    >
                      Add Withdrawal Method
                    </button>
                  </div>
                ) : (
                  withdrawalHistory.map((withdrawal, index) => (
                    <div key={index} className="transaction-item glass-card">
                      <div className="transaction-icon withdraw">
                        <ArrowDown size={20} />
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-type">Chip Withdrawal</div>
                        <div className="transaction-details">
                          {withdrawal.withdrawalMethod} • ₹{withdrawal.inrAmount}
                        </div>
                        <div className="transaction-time">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="transaction-status">
                        {getStatusIcon(withdrawal.status)}
                        <span className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </span>
                      </div>
                      <div className="transaction-amount negative">
                        -{withdrawal.chipAmount} CHIPS
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => {
          setShowDepositModal(false);
          resetDepositFlow();
        }}>
          <div className="modal glass deposit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="gradient-text">🔥 Buy Chip Packages</h3>
              <button className="close-btn" onClick={() => {
                setShowDepositModal(false);
                resetDepositFlow();
              }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              {error && <div className="error-message">{error}</div>}
              
              {/* Step 1: Package Selection */}
              {depositStep === 1 && (
                <div className="step-content">
                  <h4>Choose Your Chip Package</h4>
                  <div className="packages-grid">
                    {chipPackages.map((pkg) => (
                      <div 
                        key={pkg.id} 
                        className={`package-card ${pkg.popular ? 'popular' : ''}`}
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {pkg.popular && <div className="popular-badge">🔥 Popular</div>}
                        <div className="package-chips">{pkg.chips.toLocaleString()}</div>
                        <div className="package-price">₹{pkg.price}</div>
                        {pkg.bonus > 0 && (
                          <div className="package-bonus">+{pkg.bonus} Bonus</div>
                        )}
                        <div className="package-description">{pkg.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {depositStep === 2 && (
                <div className="step-content">
                  <button className="back-btn" onClick={() => setDepositStep(1)}>
                    ← Back to Packages
                  </button>
                  <h4>Choose Payment Method</h4>
                  <div className="selected-package">
                    <strong>{selectedPackage.chips + selectedPackage.bonus} Chips</strong>
                    <span>₹{selectedPackage.price}</span>
                  </div>
                  <div className="payment-methods">
                    <button 
                      className={`method-btn ${selectedPaymentMethod === 'UPI' ? 'active' : ''}`}
                      onClick={() => handlePaymentMethodSelect('UPI')}
                    >
                      <Smartphone size={24} />
                      <span>UPI Payment</span>
                      <div className="method-desc">Instant & Secure</div>
                    </button>
                    <button 
                      className={`method-btn ${selectedPaymentMethod === 'E_WALLET' ? 'active' : ''}`}
                      onClick={() => handlePaymentMethodSelect('E_WALLET')}
                    >
                      <Wallet size={24} />
                      <span>E-Wallet</span>
                      <div className="method-desc">Paytm, PhonePe, etc.</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Channel */}
              {depositStep === 3 && (
                <div className="step-content">
                  <button className="back-btn" onClick={() => setDepositStep(2)}>
                    ← Back to Payment Method
                  </button>
                  <h4>Select Payment Channel</h4>
                  <div className="channels-grid">
                    {paymentChannels.map((channel) => (
                      <button
                        key={channel.id}
                        className={`channel-btn ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                        onClick={() => handleChannelSelect(channel)}
                      >
                        <div className="channel-name">{channel.name}</div>
                        <div className="channel-upi">{channel.upiId}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: QR Code & UTR */}
              {depositStep === 4 && (
                <div className="step-content">
                  <button className="back-btn" onClick={() => setDepositStep(3)}>
                    ← Back to Channels
                  </button>
                  <h4>Complete Payment</h4>
                  
                  <div className="payment-details">
                    <div className="amount-info">
                      <strong>Amount to Pay: ₹{selectedPackage.price}</strong>
                      <span>You'll receive: {selectedPackage.chips + selectedPackage.bonus} Chips</span>
                    </div>
                    
                    <div className="qr-section">
                      <div className="qr-code">
                        <img 
                          src={selectedChannel.qrCode} 
                          alt="Payment QR Code"
                          className="qr-image"
                        />
                      </div>
                      <div className="qr-instructions">
                        <p>1. Scan QR code with any UPI app</p>
                        <p>2. Pay exactly ₹{selectedPackage.price}</p>
                        <p>3. Copy the UTR/Transaction ID</p>
                        <p>4. Paste it below and submit</p>
                      </div>
                    </div>
                    
                    <div className="upi-details">
                      <label>UPI ID:</label>
                      <div className="upi-id">
                        {selectedChannel.upiId}
                        <button 
                          className="copy-btn"
                          onClick={() => navigator.clipboard.writeText(selectedChannel.upiId)}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="utr-input">
                      <label>UTR/Transaction ID:</label>
                      <input
                        type="text"
                        placeholder="Enter 12-digit UTR number"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="utr-field"
                      />
                    </div>
                    
                    <button 
                      className="btn btn-primary btn-full"
                      onClick={handleDepositSubmit}
                      disabled={loading || !utrNumber}
                    >
                      {loading ? 'Submitting...' : 'Submit Payment Proof'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="gradient-text">💸 Withdraw Chips</h3>
              <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              {error && <div className="error-message">{error}</div>}
              
              <div className="current-balance">
                Available Balance: <strong>{balance.toLocaleString()} CHIPS</strong>
              </div>
              
              {withdrawalMethods.length === 0 ? (
                <div className="no-methods">
                  <Building size={48} />
                  <h4>No Withdrawal Methods</h4>
                  <p>Add a withdrawal method first to cash out your chips</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setShowAddMethodModal(true);
                    }}
                  >
                    Add Withdrawal Method
                  </button>
                </div>
              ) : (
                <div className="withdraw-form">
                  <div className="form-group">
                    <label>Withdrawal Amount (Chips):</label>
                    <input
                      type="number"
                      placeholder="Minimum 100 chips"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="100"
                      max={balance}
                    />
                    <div className="amount-info">
                      You'll receive: ₹{withdrawAmount || 0}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Withdrawal Method:</label>
                    <div className="methods-list">
                      {withdrawalMethods.map((method) => (
                        <button
                          key={method.id}
                          className={`method-item ${selectedWithdrawMethod?.id === method.id ? 'active' : ''}`}
                          onClick={() => setSelectedWithdrawMethod(method)}
                        >
                          <div className="method-type">{method.type}</div>
                          <div className="method-details">
                            {method.type === 'UPI' && method.details.upiId}
                            {method.type === 'BANK_TRANSFER' && method.details.accountNumber}
                            {method.type === 'E_WALLET' && method.details.walletNumber}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-full"
                    onClick={handleWithdrawSubmit}
                    disabled={loading || !withdrawAmount || !selectedWithdrawMethod}
                  >
                    {loading ? 'Processing...' : 'Submit Withdrawal Request'}
                  </button>
                  
                  <button 
                    className="btn btn-outline btn-full"
                    onClick={() => setShowAddMethodModal(true)}
                  >
                    <Plus size={18} />
                    Add New Withdrawal Method
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD WITHDRAWAL METHOD MODAL */}
      {showAddMethodModal && (
        <div className="modal-overlay" onClick={() => setShowAddMethodModal(false)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="gradient-text">➕ Add Withdrawal Method</h3>
              <button className="close-btn" onClick={() => setShowAddMethodModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              {error && <div className="error-message">{error}</div>}
              
              <div className="method-types">
                <button 
                  className={`type-btn ${newMethodType === 'UPI' ? 'active' : ''}`}
                  onClick={() => setNewMethodType('UPI')}
                >
                  <Smartphone size={24} />
                  <span>UPI</span>
                </button>
                <button 
                  className={`type-btn ${newMethodType === 'BANK_TRANSFER' ? 'active' : ''}`}
                  onClick={() => setNewMethodType('BANK_TRANSFER')}
                >
                  <Building size={24} />
                  <span>Bank Transfer</span>
                </button>
                <button 
                  className={`type-btn ${newMethodType === 'E_WALLET' ? 'active' : ''}`}
                  onClick={() => setNewMethodType('E_WALLET')}
                >
                  <Wallet size={24} />
                  <span>E-Wallet</span>
                </button>
              </div>
              
              {newMethodType === 'UPI' && (
                <div className="method-form">
                  <div className="form-group">
                    <label>UPI ID:</label>
                    <input
                      type="text"
                      placeholder="yourname@paytm"
                      value={newMethodDetails.upiId || ''}
                      onChange={(e) => setNewMethodDetails({...newMethodDetails, upiId: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              {newMethodType === 'BANK_TRANSFER' && (
                <div className="method-form">
                  <div className="form-group">
                    <label>Account Holder Name:</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={newMethodDetails.accountHolderName || ''}
                      onChange={(e) => setNewMethodDetails({...newMethodDetails, accountHolderName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number:</label>
                    <input
                      type="text"
                      placeholder="Account number"
                      value={newMethodDetails.accountNumber || ''}
                      onChange={(e) => setNewMethodDetails({...newMethodDetails, accountNumber: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>IFSC Code:</label>
                    <input
                      type="text"
                      placeholder="ABCD0123456"
                      value={newMethodDetails.ifscCode || ''}
                      onChange={(e) => setNewMethodDetails({...newMethodDetails, ifscCode: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bank Name:</label>
                    <input
                      type="text"
                      placeholder="Bank name"
                      value={newMethodDetails.bankName || ''}
                      onChange={(e) => setNewMethodDetails({...newMethodDetails, bankName: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              {newMethodType === 'E_WALLET' && (
                <div className="method-form">
                  <div className="form-group">
                    <label>Wallet Type:</label>
                    <select
                      value={newMethodDetails.walletType || ''}
                      onChange={(e) => setNewMethodDetails({...newMethodDetails, walletType: e.target.value})}
                    >
                      <option value="">Select wallet</option>
                      <option value="Paytm">Paytm</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="Amazon Pay">Amazon Pay</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Wallet Number:</label>
                    <input
                      type="text"
                      placeholder="Mobile number linked to wallet"
                      value={newMethodDetails.walletNumber || ''}
                      onChange={(e) => setNewMethodDetails({...newMethodDetails, walletNumber: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              {newMethodType && (
                <button 
                  className="btn btn-primary btn-full"
                  onClick={handleAddWithdrawalMethod}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Withdrawal Method'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .wallet-page {
          min-height: 100vh;
          background: var(--dark-bg);
          position: relative;
        }
        
        .wallet-page::before {
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
        
        .wallet-header {
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
        
        .wallet-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 2;
        }
        
        .balance-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 3rem;
          margin-bottom: 2rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        
        .balance-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .balance-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .balance-icon {
          font-size: 4rem;
          filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3));
        }
        
        .balance-details h3 {
          color: #888;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }
        
        .balance-amount {
          font-size: 3rem;
          font-weight: 800;
          color: var(--primary-red);
          margin-bottom: 0.5rem;
          line-height: 1;
        }
        
        .balance-value {
          color: #666;
          font-size: 1.1rem;
        }
        
        .balance-actions {
          display: flex;
          gap: 1rem;
        }
        
        .wallet-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .tab-btn {
          padding: 1rem 2rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: #888;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }
        
        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .tab-btn.active {
          background: var(--gradient-primary);
          color: white;
          border-color: var(--primary-red);
        }
        
        .transaction-history {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-header h3 {
          color: var(--primary-red);
          font-size: 1.5rem;
        }
        
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .transaction-item:hover {
          transform: translateY(-2px);
        }
        
        .transaction-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .transaction-icon.deposit {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        
        .transaction-icon.withdraw {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        
        .transaction-info {
          flex: 1;
        }
        
        .transaction-type {
          color: white;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .transaction-details {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .transaction-time {
          color: #666;
          font-size: 0.8rem;
        }
        
        .transaction-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-right: 1rem;
        }
        
        .transaction-amount {
          font-size: 1.2rem;
          font-weight: 700;
          min-width: 120px;
          text-align: right;
        }
        
        .transaction-amount.positive {
          color: #10b981;
        }
        
        .transaction-amount.negative {
          color: #ef4444;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #888;
        }
        
        .empty-state svg {
          color: #666;
          margin-bottom: 1rem;
        }
        
        .empty-state h4 {
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          margin-bottom: 2rem;
        }
        
        /* Modal Styles */
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
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 0;
        }
        
        .deposit-modal {
          max-width: 600px;
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
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .step-content h4 {
          color: var(--primary-red);
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }
        
        .back-btn {
          background: none;
          border: none;
          color: var(--primary-red);
          cursor: pointer;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .package-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .package-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-red);
        }
        
        .package-card.popular {
          border-color: var(--primary-gold);
          background: rgba(245, 158, 11, 0.05);
        }
        
        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gradient-gold);
          color: #000;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        
        .package-chips {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary-red);
          margin-bottom: 0.5rem;
        }
        
        .package-price {
          font-size: 1.1rem;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .package-bonus {
          color: var(--primary-gold);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .package-description {
          color: #888;
          font-size: 0.8rem;
        }
        
        .selected-package {
          display: flex;
          justify-content: space-between;
          background: rgba(220, 38, 38, 0.1);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        
        .payment-methods {
          display: grid;
          gap: 1rem;
        }
        
        .method-btn {
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
          text-align: left;
        }
        
        .method-btn:hover {
          border-color: var(--primary-red);
        }
        
        .method-btn.active {
          border-color: var(--primary-red);
          background: rgba(220, 38, 38, 0.1);
        }
        
        .method-btn span {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .method-desc {
          color: #888;
          font-size: 0.9rem;
        }
        
        .channels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .channel-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        
        .channel-btn:hover {
          border-color: var(--primary-red);
        }
        
        .channel-btn.active {
          border-color: var(--primary-red);
          background: rgba(220, 38, 38, 0.1);
        }
        
        .channel-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .channel-upi {
          color: #888;
          font-size: 0.9rem;
        }
        
        .payment-details {
          text-align: center;
        }
        
        .amount-info {
          background: rgba(245, 158, 11, 0.1);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        
        .amount-info strong {
          display: block;
          font-size: 1.2rem;
          color: var(--primary-gold);
          margin-bottom: 0.5rem;
        }
        
        .qr-section {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }
        
        .qr-code {
          background: white;
          padding: 1rem;
          border-radius: 12px;
        }
        
        .qr-image {
          width: 200px;
          height: 200px;
          display: block;
        }
        
        .qr-instructions {
          text-align: left;
        }
        
        .qr-instructions p {
          color: #888;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .upi-details {
          margin-bottom: 1.5rem;
        }
        
        .upi-details label {
          display: block;
          color: #888;
          margin-bottom: 0.5rem;
        }
        
        .upi-id {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--glass-bg);
          padding: 1rem;
          border-radius: 8px;
          justify-content: center;
        }
        
        .copy-btn {
          background: var(--primary-red);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .utr-input {
          margin-bottom: 1.5rem;
        }
        
        .utr-input label {
          display: block;
          color: #888;
          margin-bottom: 0.5rem;
        }
        
        .utr-field {
          width: 100%;
          padding: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }
        
        .utr-field:focus {
          outline: none;
          border-color: var(--primary-red);
        }
        
        .current-balance {
          text-align: center;
          background: rgba(16, 185, 129, 0.1);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          color: #10b981;
        }
        
        .no-methods {
          text-align: center;
          padding: 2rem;
          color: #888;
        }
        
        .no-methods svg {
          color: #666;
          margin-bottom: 1rem;
        }
        
        .no-methods h4 {
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .no-methods p {
          margin-bottom: 2rem;
        }
        
        .withdraw-form {
          space-y: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          color: #ccc;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-red);
        }
        
        .amount-info {
          color: #888;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        
        .methods-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .method-item {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }
        
        .method-item:hover {
          border-color: var(--primary-red);
        }
        
        .method-item.active {
          border-color: var(--primary-red);
          background: rgba(220, 38, 38, 0.1);
        }
        
        .method-type {
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }
        
        .method-details {
          color: #888;
          font-size: 0.9rem;
        }
        
        .method-types {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .type-btn {
          flex: 1;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .type-btn:hover {
          border-color: var(--primary-red);
        }
        
        .type-btn.active {
          border-color: var(--primary-red);
          background: rgba(220, 38, 38, 0.1);
        }
        
        .method-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .btn-full {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
          .wallet-container {
            padding: 1rem;
          }
          
          .balance-card {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
            padding: 2rem;
          }
          
          .balance-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .wallet-tabs {
            flex-direction: column;
          }
          
          .packages-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .qr-section {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .method-types {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default WalletPage;
