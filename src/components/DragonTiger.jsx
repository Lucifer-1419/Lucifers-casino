import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Users, Clock, Crown, Zap, TrendingUp } from 'lucide-react';
import io from 'socket.io-client';

function DragonTiger({ user, balance, setBalance, onClose }) {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    phase: 'betting',
    timeLeft: 15,
    result: null,
    totalPlayers: 0,
    recentWins: []
  });
  
  const [selectedBets, setSelectedBets] = useState(new Map());
  const [betAmount, setBetAmount] = useState(50);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveBets, setLiveBets] = useState([]);
  const [error, setError] = useState('');
  const [sessionStats, setSessionStats] = useState({
    totalBets: 0,
    totalWins: 0,
    biggestWin: 0,
    winStreak: 0
  });

  const betOptions = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Join Dragon Tiger room
    newSocket.emit('joinDragonTiger', { 
      userId: user.id, 
      name: user.name 
    });

    // Listen for game updates
    newSocket.on('gameUpdate', (data) => {
      setGameState(data);
      
      // Play phase sounds
      if (data.phase === 'revealing' && soundEnabled) {
        console.log('🎴 Card reveal sound!');
      }
      if (data.phase === 'result' && soundEnabled) {
        console.log('🎯 Result sound!');
      }
    });

    // Listen for new bets
    newSocket.on('newBet', (betData) => {
      setLiveBets(prev => [...prev.slice(-9), betData]);
    });

    // Listen for bet confirmations
    newSocket.on('betPlaced', (response) => {
      if (response.success) {
        setBalance(response.newBalance);
      } else {
        setError(response.message);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, soundEnabled]);

  const placeBet = (betType) => {
    if (gameState.phase !== 'betting') {
      setError('Betting is closed!');
      return;
    }

    if (balance < betAmount) {
      setError('Insufficient balance!');
      return;
    }

    // Add to local selected bets
    setSelectedBets(prev => {
      const newBets = new Map(prev);
      const currentAmount = newBets.get(betType) || 0;
      newBets.set(betType, currentAmount + betAmount);
      return newBets;
    });

    // Send bet to server
    if (socket) {
      socket.emit('placeBet', {
        gameType: 'dragonTiger',
        betType,
        amount: betAmount,
        userId: user.id
      });
    }

    setSessionStats(prev => ({
      ...prev,
      totalBets: prev.totalBets + betAmount
    }));
  };

  const clearBets = () => {
    const totalBetAmount = Array.from(selectedBets.values()).reduce((sum, amount) => sum + amount, 0);
    setBalance(prev => prev + totalBetAmount);
    setSelectedBets(new Map());
  };

  const getPhaseColor = () => {
    switch (gameState.phase) {
      case 'betting': return '#10b981';
      case 'revealing': return '#f59e0b';
      case 'result': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPhaseText = () => {
    switch (gameState.phase) {
      case 'betting': return '🎯 PLACE YOUR BETS';
      case 'revealing': return '🎴 REVEALING CARDS';
      case 'result': return '🏆 RESULTS';
      default: return 'LOADING...';
    }
  };

  const renderCard = (card, isRevealed = true, cardType = '') => {
    if (!card || !isRevealed) {
      return (
        <div className="playing-card card-back">
          <div className="card-pattern">
            <div className="pattern-lines"></div>
            <div className="card-logo">🎰</div>
          </div>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    const cardValue = getCardDisplayValue(card.value);
    
    return (
      <div className={`playing-card card-front ${isRed ? 'red-card' : 'black-card'} ${cardType}`}>
        <div className="card-corner top-left">
          <div className="card-value">{cardValue}</div>
          <div className="card-suit">{card.suit}</div>
        </div>
        <div className="card-center">
          <div className="center-suit">{card.suit}</div>
        </div>
        <div className="card-corner bottom-right">
          <div className="card-value">{cardValue}</div>
          <div className="card-suit">{card.suit}</div>
        </div>
        <div className="card-glow"></div>
      </div>
    );
  };

  const getCardDisplayValue = (value) => {
    return value;
  };

  const getCardNumericValue = (card) => {
    if (card.value === 'A') return 1;
    if (['J', 'Q', 'K'].includes(card.value)) {
      return { 'J': 11, 'Q': 12, 'K': 13 }[card.value];
    }
    return parseInt(card.value);
  };

  const getWinnerDisplay = () => {
    if (!gameState.result) return '';
    
    const { winner, dragonCard, tigerCard } = gameState.result;
    const dragonValue = getCardNumericValue(dragonCard);
    const tigerValue = getCardNumericValue(tigerCard);
    
    if (winner === 'dragon') {
      return `🐉 DRAGON WINS! (${dragonValue} vs ${tigerValue})`;
    } else if (winner === 'tiger') {
      return `🐅 TIGER WINS! (${dragonValue} vs ${tigerValue})`;
    } else {
      return `🤝 TIE! (${dragonValue} vs ${tigerValue})`;
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString();
  };

  return (
    <div className="dragon-tiger">
      {/* Game Header */}
      <div className="game-header">
        <div className="game-title">
          <div className="game-logo">
            <span className="dragon-icon">🐉</span>
            <span className="vs-text">VS</span>
            <span className="tiger-icon">🐅</span>
          </div>
          <div className="game-info">
            <h2>DRAGON TIGER</h2>
            <div className="game-status">
              <div className="phase-indicator" style={{ background: getPhaseColor() }}>
                {getPhaseText()}
              </div>
              <div className="timer">
                <Clock size={16} />
                {gameState.timeLeft}s
              </div>
              <div className="players-count">
                <Users size={16} />
                {gameState.totalPlayers} players
              </div>
            </div>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="game-container">
        {/* Left Panel - Betting Controls */}
        <div className="betting-panel">
          <div className="balance-info">
            <h3>Your Balance</h3>
            <div className="balance-amount">{formatCurrency(balance)} CHIPS</div>
            <div className="balance-converted">≈ ₹{formatCurrency(balance)}</div>
          </div>

          <div className="bet-controls">
            <h4>Bet Amount</h4>
            <div className="bet-options">
              {betOptions.map(amount => (
                <button
                  key={amount}
                  className={`bet-btn ${betAmount === amount ? 'active' : ''} ${amount >= 1000 ? 'high-roller' : ''}`}
                  onClick={() => setBetAmount(amount)}
                  disabled={balance < amount}
                >
                  {amount >= 1000 ? `${amount/1000}K` : amount}
                  {amount >= 1000 && <span className="vip-indicator">👑</span>}
                </button>
              ))}
            </div>
            <div className="bet-info">
              Selected: <span className="selected-amount">{betAmount} CHIPS</span>
            </div>
          </div>

          <div className="my-bets">
            <h4>My Bets This Round</h4>
            <div className="selected-bets">
              {Array.from(selectedBets.entries()).map(([betType, amount]) => (
                <div key={betType} className="bet-item">
                  <span className="bet-type">{betType.toUpperCase()}</span>
                  <span className="bet-amount">{amount} CHIPS</span>
                </div>
              ))}
              {selectedBets.size === 0 && (
                <div className="no-bets">No bets placed</div>
              )}
            </div>
            {selectedBets.size > 0 && (
              <button className="clear-bets-btn" onClick={clearBets}>
                Clear All Bets
              </button>
            )}
          </div>

          <div className="session-stats">
            <h4>Session Stats</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span>Total Bet:</span>
                <strong>{formatCurrency(sessionStats.totalBets)}</strong>
              </div>
              <div className="stat-item">
                <span>Total Wins:</span>
                <strong className="win-stat">{formatCurrency(sessionStats.totalWins)}</strong>
              </div>
              <div className="stat-item">
                <span>Win Streak:</span>
                <strong className="streak-stat">{sessionStats.winStreak}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Game Table */}
        <div className="game-table">
          {error && <div className="error-banner">{error}</div>}

          {/* Game Result Display */}
          {gameState.phase === 'result' && gameState.result && (
            <div className="result-banner">
              <div className="result-text">{getWinnerDisplay()}</div>
            </div>
          )}

          {/* Cards Section */}
          <div className="cards-section">
            {/* Dragon Side */}
            <div className="card-side dragon-side">
              <div className="side-header">
                <div className="side-icon">🐉</div>
                <h3>DRAGON</h3>
                <div className="side-payout">1:1</div>
              </div>
              <div className="card-area">
                {renderCard(
                  gameState.result?.dragonCard, 
                  gameState.phase === 'result' || gameState.phase === 'revealing',
                  'dragon-card'
                )}
                {gameState.phase === 'result' && gameState.result && (
                  <div className="card-value-display">
                    Value: {getCardNumericValue(gameState.result.dragonCard)}
                  </div>
                )}
              </div>
              <button 
                className={`bet-area dragon-bet ${selectedBets.has('dragon') ? 'has-bet' : ''}`}
                onClick={() => placeBet('dragon')}
                disabled={gameState.phase !== 'betting'}
              >
                <div className="bet-label">BET ON DRAGON</div>
                <div className="bet-payout">Pays 1:1</div>
                {selectedBets.has('dragon') && (
                  <div className="bet-amount-display">
                    {selectedBets.get('dragon')} CHIPS
                  </div>
                )}
              </button>
            </div>

            {/* VS Divider */}
            <div className="vs-divider">
              <div className="vs-circle">
                <span className="vs-text">VS</span>
              </div>
              <div className="divider-line"></div>
            </div>

            {/* Tiger Side */}
            <div className="card-side tiger-side">
              <div className="side-header">
                <div className="side-icon">🐅</div>
                <h3>TIGER</h3>
                <div className="side-payout">1:1</div>
              </div>
              <div className="card-area">
                {renderCard(
                  gameState.result?.tigerCard, 
                  gameState.phase === 'result' || gameState.phase === 'revealing',
                  'tiger-card'
                )}
                {gameState.phase === 'result' && gameState.result && (
                  <div className="card-value-display">
                    Value: {getCardNumericValue(gameState.result.tigerCard)}
                  </div>
                )}
              </div>
              <button 
                className={`bet-area tiger-bet ${selectedBets.has('tiger') ? 'has-bet' : ''}`}
                onClick={() => placeBet('tiger')}
                disabled={gameState.phase !== 'betting'}
              >
                <div className="bet-label">BET ON TIGER</div>
                <div className="bet-payout">Pays 1:1</div>
                {selectedBets.has('tiger') && (
                  <div className="bet-amount-display">
                    {selectedBets.get('tiger')} CHIPS
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Tie Bet Section */}
          <div className="tie-section">
            <button 
              className={`tie-bet ${selectedBets.has('tie') ? 'has-bet' : ''}`}
              onClick={() => placeBet('tie')}
              disabled={gameState.phase !== 'betting'}
            >
              <div className="tie-icon">🤝</div>
              <div className="tie-label">TIE BET</div>
              <div className="tie-payout">Pays 8:1</div>
              {selectedBets.has('tie') && (
                <div className="bet-amount-display">
                  {selectedBets.get('tie')} CHIPS
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Live Activity & History */}
        <div className="activity-panel">
          <div className="live-bets">
            <h4>🔥 Live Bets</h4>
            <div className="bets-stream">
              {liveBets.map((bet, index) => (
                <div key={index} className={`live-bet ${bet.isBot ? 'bot' : 'player'}`}>
                  <div className="player-info">
                    <span className="player-name">{bet.player.name}</span>
                    {bet.isBot && <span className="bot-indicator">🤖</span>}
                    <span className="country-flag">{bet.player.country}</span>
                  </div>
                  <div className="bet-details">
                    <span className={`bet-type ${bet.betType.toLowerCase()}`}>
                      {bet.betType.toUpperCase()}
                    </span>
                    <span className="bet-amount">{bet.amount}</span>
                  </div>
                </div>
              ))}
              {liveBets.length === 0 && (
                <div className="no-live-bets">No bets yet this round</div>
              )}
            </div>
          </div>

          <div className="recent-results">
            <h4>📊 Recent Results</h4>
            <div className="results-list">
              {gameState.recentWins.map((result, index) => (
                <div key={index} className={`result-item ${result.winner}`}>
                  <div className="result-cards">
                    <span className="card-mini dragon">
                      {result.dragonCard?.value}
                      <span className={`suit ${result.dragonCard?.suit === '♥' || result.dragonCard?.suit === '♦' ? 'red' : 'black'}`}>
                        {result.dragonCard?.suit}
                      </span>
                    </span>
                    <span className="vs-mini">vs</span>
                    <span className="card-mini tiger">
                      {result.tigerCard?.value}
                      <span className={`suit ${result.tigerCard?.suit === '♥' || result.tigerCard?.suit === '♦' ? 'red' : 'black'}`}>
                        {result.tigerCard?.suit}
                      </span>
                    </span>
                  </div>
                  <div className={`result-winner ${result.winner}`}>
                    {result.winner === 'dragon' ? '🐉' : result.winner === 'tiger' ? '🐅' : '🤝'}
                    {result.winner.toUpperCase()}
                  </div>
                </div>
              ))}
              {gameState.recentWins.length === 0 && (
                <div className="no-results">No results yet</div>
              )}
            </div>
          </div>

          <div className="game-options">
            <button
              className={`option-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              Sound Effects
            </button>
          </div>

          <div className="game-rules">
            <h4>🎯 How to Play</h4>
            <ul className="rules-list">
              <li>Dragon and Tiger each get one card</li>
              <li>Higher card wins (A=1, K=13)</li>
              <li>Dragon/Tiger bets pay 1:1</li>
              <li>Tie bets pay 8:1</li>
              <li>Cards revealed simultaneously</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dragon-tiger {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          z-index: 2000;
          overflow-y: auto;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.95);
          border-bottom: 3px solid #f59e0b;
          backdrop-filter: blur(10px);
        }

        .game-title {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .game-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 2rem;
        }

        .dragon-icon {
          color: #dc2626;
          filter: drop-shadow(0 0 10px #dc2626);
          animation: dragonGlow 2s ease-in-out infinite;
        }

        .tiger-icon {
          color: #f59e0b;
          filter: drop-shadow(0 0 10px #f59e0b);
          animation: tigerGlow 2s ease-in-out infinite;
        }

        .vs-text {
          color: white;
          font-weight: 800;
          font-size: 1.5rem;
        }

        @keyframes dragonGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes tigerGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .game-info h2 {
          font-size: 2rem;
          background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.5rem 0;
          font-weight: 800;
        }

        .game-status {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .phase-indicator {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          animation: pulse 2s infinite;
        }

        .timer, .players-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888;
          font-size: 0.9rem;
        }

        .close-game-btn {
          background: var(--primary-red);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .game-container {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 1rem;
          padding: 1rem;
          max-width: 1600px;
          margin: 0 auto;
          min-height: calc(100vh - 100px);
        }

        .betting-panel, .activity-panel {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          height: fit-content;
        }

        .balance-info {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .balance-amount {
          font-size: 1.4rem;
          font-weight: 800;
          color: #10b981;
          margin-bottom: 0.25rem;
        }

        .balance-converted {
          color: #6ee7b7;
          font-size: 0.9rem;
        }

        .bet-controls h4, .my-bets h4, .session-stats h4, .live-bets h4, .recent-results h4, .game-rules h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1rem;
          font-weight: 700;
        }

        .bet-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.3rem;
          margin-bottom: 1rem;
        }

        .bet-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.4rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          font-weight: 600;
          position: relative;
        }

        .bet-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.02);
        }

        .bet-btn.active {
          background: var(--gradient-primary);
          border-color: var(--primary-red);
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);
        }

        .bet-btn.high-roller {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          border-color: var(--primary-gold);
        }

        .bet-btn.high-roller.active {
          background: var(--gradient-gold);
          color: #000;
        }

        .vip-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 0.6rem;
          animation: pulse 2s infinite;
        }

        .bet-info {
          text-align: center;
          color: #888;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .selected-amount {
          color: var(--primary-gold);
          font-weight: 700;
        }

        .selected-bets {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          max-height: 120px;
          overflow-y: auto;
        }

        .bet-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .bet-type {
          font-weight: 700;
          color: var(--primary-gold);
        }

        .no-bets {
          text-align: center;
          color: #666;
          padding: 1rem;
          font-size: 0.8rem;
        }

        .clear-bets-btn {
          width: 100%;
          background: #ef4444;
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .win-stat { color: #10b981; }
        .streak-stat { color: #f59e0b; }

        .game-table {
          background: linear-gradient(135deg, #134e4a 0%, #0f766e 100%);
          border: 3px solid #f59e0b;
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          min-height: 600px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          border: 1px solid #ef4444;
        }

        .result-banner {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
          animation: resultPulse 1s ease-in-out infinite;
        }

        @keyframes resultPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .cards-section {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
          flex: 1;
        }

        .card-side {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .side-header {
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 12px;
          width: 100%;
        }

        .side-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .dragon-side .side-icon {
          color: #dc2626;
          filter: drop-shadow(0 0 15px #dc2626);
        }

        .tiger-side .side-icon {
          color: #f59e0b;
          filter: drop-shadow(0 0 15px #f59e0b);
        }

        .side-header h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0.5rem 0;
        }

        .side-payout {
          color: #10b981;
          font-weight: 700;
        }

        .card-area {
          position: relative;
          margin-bottom: 1rem;
        }

        .playing-card {
          width: 120px;
          height: 168px;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          transition: all 0.5s ease;
          cursor: pointer;
        }

        .playing-card:hover {
          transform: translateY(-10px) scale(1.05);
        }

        .card-back {
          background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
          border: 2px solid #fbbf24;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .card-pattern {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .pattern-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 5px,
            rgba(251, 191, 36, 0.1) 5px,
            rgba(251, 191, 36, 0.1) 10px
          );
          border-radius: 10px;
        }

        .card-logo {
          font-size: 2rem;
          color: #fbbf24;
          z-index: 2;
        }

        .card-front {
          background: white;
          border: 2px solid #000;
          color: #000;
        }

        .card-front.red-card .card-value,
        .card-front.red-card .card-suit {
          color: #dc2626;
        }

        .card-front.black-card .card-value,
        .card-front.black-card .card-suit {
          color: #000;
        }

        .card-corner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
        }

        .card-corner.top-left {
          top: 8px;
          left: 8px;
        }

        .card-corner.bottom-right {
          bottom: 8px;
          right: 8px;
          transform: rotate(180deg);
        }

        .card-value {
          font-size: 1.2rem;
          font-weight: 800;
        }

        .card-suit {
          font-size: 1rem;
        }

        .card-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .center-suit {
          font-size: 4rem;
          opacity: 0.1;
        }

        .card-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 12px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .playing-card:hover .card-glow {
          opacity: 0.5;
        }

        .card-value-display {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          margin-top: 1rem;
        }

        .dragon-card {
          border-color: #dc2626;
        }

        .tiger-card {
          border-color: #f59e0b;
        }

        .vs-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .vs-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
          animation: vsRotate 4s linear infinite;
        }

        @keyframes vsRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .divider-line {
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, #dc2626, #f59e0b);
        }

        .bet-area {
          width: 100%;
          padding: 1.5rem;
          border: 2px dashed #888;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .bet-area:hover:not(:disabled) {
          border-color: #fbbf24;
          background: rgba(245, 158, 11, 0.1);
          transform: scale(1.02);
        }

        .bet-area:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bet-area.has-bet {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border-style: solid;
        }

        .dragon-bet:hover:not(:disabled) {
          border-color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .tiger-bet:hover:not(:disabled) {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .bet-label {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .bet-payout {
          color: #10b981;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .bet-amount-display {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 0.5rem;
          border-radius: 6px;
          margin-top: 0.5rem;
          font-weight: 700;
        }

        .tie-section {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .tie-bet {
          padding: 1.5rem 3rem;
          border: 2px dashed #888;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .tie-bet:hover:not(:disabled) {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
        }

        .tie-bet.has-bet {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border-style: solid;
        }

        .tie-icon {
          font-size: 2rem;
        }

        .tie-label {
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
        }

        .tie-payout {
          color: #8b5cf6;
          font-weight: 600;
        }

        .live-bets, .recent-results, .game-rules {
          margin-bottom: 2rem;
        }

        .bets-stream, .results-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 180px;
          overflow-y: auto;
        }

        .live-bet {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .live-bet.bot {
          border-left: 3px solid #f59e0b;
        }

        .live-bet.player {
          border-left: 3px solid #10b981;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .player-name {
          font-weight: 600;
          color: white;
          font-size: 0.75rem;
        }

        .bot-indicator, .country-flag {
          font-size: 0.7rem;
        }

        .bet-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bet-type {
          font-weight: 700;
          font-size: 0.75rem;
        }

        .bet-type.dragon { color: #dc2626; }
        .bet-type.tiger { color: #f59e0b; }
        .bet-type.tie { color: #8b5cf6; }

        .bet-amount {
          color: #10b981;
          font-weight: 600;
        }

        .result-item {
          padding: 0.5rem;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
        }

        .result-item.dragon {
          background: rgba(220, 38, 38, 0.1);
          border-left: 3px solid #dc2626;
        }

        .result-item.tiger {
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
        }

        .result-item.tie {
          background: rgba(139, 92, 246, 0.1);
          border-left: 3px solid #8b5cf6;
        }

        .result-cards {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-mini {
          background: white;
          border: 1px solid #000;
          border-radius: 3px;
          padding: 2px 4px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .suit.red { color: #dc2626; }
        .suit.black { color: #000; }

        .vs-mini {
          color: #888;
          font-size: 0.6rem;
        }

        .result-winner {
          font-weight: 700;
        }

        .result-winner.dragon { color: #dc2626; }
        .result-winner.tiger { color: #f59e0b; }
        .result-winner.tie { color: #8b5cf6; }

        .no-live-bets, .no-results {
          text-align: center;
          color: #666;
          padding: 1.5rem;
          font-size: 0.8rem;
        }

        .option-btn {
          width: 100%;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .option-btn.active {
          background: var(--gradient-primary);
          border-color: var(--primary-red);
        }

        .rules-list {
          list-style: none;
          padding: 0;
        }

        .rules-list li {
          color: #ccc;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .rules-list li::before {
          content: '•';
          color: var(--primary-gold);
          position: absolute;
          left: 0;
          font-weight: 700;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @media (max-width: 1200px) {
          .game-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .cards-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .vs-divider {
            order: -1;
            flex-direction: row;
          }
          
          .divider-line {
            width: 100px;
            height: 2px;
          }
        }

        @media (max-width: 768px) {
          .game-header {
            padding: 0.5rem 1rem;
          }
          
          .playing-card {
            width: 80px;
            height: 112px;
          }
          
          .card-value, .card-suit {
            font-size: 0.9rem;
          }
          
          .center-suit {
            font-size: 2.5rem;
          }
          
          .vs-circle {
            width: 60px;
            height: 60px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default DragonTiger;
