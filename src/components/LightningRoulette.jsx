import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Users, Zap, Clock, Crown, TrendingUp } from 'lucide-react';
import io from 'socket.io-client';

function LightningRoulette({ user, balance, setBalance, onClose }) {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    phase: 'betting',
    timeLeft: 20,
    lightningNumbers: [],
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
    biggestWin: 0
  });

  const betOptions = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

  // Roulette numbers layout
  const rouletteNumbers = [
    { number: 0, color: 'green' },
    ...Array.from({ length: 36 }, (_, i) => ({
      number: i + 1,
      color: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(i + 1) ? 'red' : 'black'
    }))
  ];

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Join Lightning Roulette room
    newSocket.emit('joinLightningRoulette', { 
      userId: user.id, 
      name: user.name 
    });

    // Listen for game updates
    newSocket.on('gameUpdate', (data) => {
      setGameState(data);
      
      // Play phase sounds
      if (data.phase === 'lightning' && soundEnabled) {
        console.log('⚡ Lightning phase sound!');
      }
      if (data.phase === 'spinning' && soundEnabled) {
        console.log('🎲 Spinning sound!');
      }
    });

    // Listen for new bets from other players
    newSocket.on('newBet', (betData) => {
      setLiveBets(prev => [...prev.slice(-9), betData]); // Keep last 10 bets
    });

    // Listen for bet confirmations
    newSocket.on('betPlaced', (response) => {
      if (response.success) {
        console.log('✅ Bet placed successfully!');
      } else {
        setError(response.message);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, soundEnabled]);

  const placeBet = (betType, specificNumber = null) => {
    if (gameState.phase !== 'betting') {
      setError('Betting is closed!');
      return;
    }

    if (balance < betAmount) {
      setError('Insufficient balance!');
      return;
    }

    const betKey = specificNumber !== null ? `number_${specificNumber}` : betType;
    
    // Add to local selected bets
    setSelectedBets(prev => {
      const newBets = new Map(prev);
      const currentAmount = newBets.get(betKey) || 0;
      newBets.set(betKey, currentAmount + betAmount);
      return newBets;
    });

    // Send bet to server
    if (socket) {
      socket.emit('placeBet', {
        gameType: 'lightningRoulette',
        betType: specificNumber !== null ? 'number' : betType,
        amount: betAmount,
        userId: user.id,
        specificNumber
      });
    }

    // Update local balance
    setBalance(prev => prev - betAmount);
    setSessionStats(prev => ({
      ...prev,
      totalBets: prev.totalBets + betAmount
    }));
  };

  const clearBets = () => {
    // Restore balance
    const totalBetAmount = Array.from(selectedBets.values()).reduce((sum, amount) => sum + amount, 0);
    setBalance(prev => prev + totalBetAmount);
    setSelectedBets(new Map());
  };

  const getPhaseColor = () => {
    switch (gameState.phase) {
      case 'betting': return '#10b981';
      case 'lightning': return '#f59e0b';
      case 'spinning': return '#8b5cf6';
      case 'result': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPhaseText = () => {
    switch (gameState.phase) {
      case 'betting': return '💰 PLACE YOUR BETS';
      case 'lightning': return '⚡ LIGHTNING ROUND';
      case 'spinning': return '🎲 SPINNING...';
      case 'result': return '🎯 RESULTS';
      default: return 'LOADING...';
    }
  };

  const isLightningNumber = (number) => {
    return gameState.lightningNumbers.some(ln => ln.number === number);
  };

  const getLightningMultiplier = (number) => {
    const lightning = gameState.lightningNumbers.find(ln => ln.number === number);
    return lightning ? lightning.multiplier : null;
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString();
  };

  return (
    <div className="lightning-roulette">
      {/* Game Header */}
      <div className="game-header">
        <div className="game-title">
          <Zap size={32} />
          <h2>⚡ LIGHTNING ROULETTE</h2>
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
                </button>
              ))}
            </div>
            <div className="bet-info">
              Selected: {betAmount} CHIPS
            </div>
          </div>

          <div className="my-bets">
            <h4>My Bets This Round</h4>
            <div className="selected-bets">
              {Array.from(selectedBets.entries()).map(([betKey, amount]) => (
                <div key={betKey} className="bet-item">
                  <span className="bet-type">{betKey.replace('_', ' ')}</span>
                  <span className="bet-amount">{amount}</span>
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
                <span>Biggest Win:</span>
                <strong className="big-win-stat">{formatCurrency(sessionStats.biggestWin)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Roulette Table */}
        <div className="roulette-table">
          {error && <div className="error-banner">{error}</div>}

          {/* Lightning Numbers Display */}
          {gameState.lightningNumbers.length > 0 && (
            <div className="lightning-display">
              <h3>⚡ LIGHTNING NUMBERS ⚡</h3>
              <div className="lightning-numbers">
                {gameState.lightningNumbers.map((ln, index) => (
                  <div key={index} className="lightning-number">
                    <span className="number">{ln.number}</span>
                    <span className="multiplier">{ln.multiplier}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roulette Wheel */}
          <div className="wheel-container">
            <div className={`roulette-wheel ${gameState.phase === 'spinning' ? 'spinning' : ''}`}>
              <div className="wheel-center">
                {gameState.result && gameState.phase === 'result' && (
                  <div className={`result-number ${gameState.result.color}`}>
                    {gameState.result.number}
                  </div>
                )}
                {gameState.phase !== 'result' && (
                  <div className="wheel-logo">⚡</div>
                )}
              </div>
            </div>
            <div className="wheel-pointer">▼</div>
          </div>

          {/* Betting Grid */}
          <div className="betting-grid">
            {/* Numbers Grid */}
            <div className="numbers-grid">
              {rouletteNumbers.map((num) => (
                <button
                  key={num.number}
                  className={`number-btn ${num.color} ${isLightningNumber(num.number) ? 'lightning' : ''}`}
                  onClick={() => placeBet('number', num.number)}
                  disabled={gameState.phase !== 'betting'}
                >
                  <span className="number">{num.number}</span>
                  {isLightningNumber(num.number) && (
                    <span className="lightning-multiplier">
                      ⚡{getLightningMultiplier(num.number)}x
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Outside Bets */}
            <div className="outside-bets">
              <button 
                className="outside-bet red"
                onClick={() => placeBet('red')}
                disabled={gameState.phase !== 'betting'}
              >
                Red (2:1)
              </button>
              <button 
                className="outside-bet black"
                onClick={() => placeBet('black')}
                disabled={gameState.phase !== 'betting'}
              >
                Black (2:1)
              </button>
              <button 
                className="outside-bet even"
                onClick={() => placeBet('even')}
                disabled={gameState.phase !== 'betting'}
              >
                Even (2:1)
              </button>
              <button 
                className="outside-bet odd"
                onClick={() => placeBet('odd')}
                disabled={gameState.phase !== 'betting'}
              >
                Odd (2:1)
              </button>
              <button 
                className="outside-bet low"
                onClick={() => placeBet('low')}
                disabled={gameState.phase !== 'betting'}
              >
                1-18 (2:1)
              </button>
              <button 
                className="outside-bet high"
                onClick={() => placeBet('high')}
                disabled={gameState.phase !== 'betting'}
              >
                19-36 (2:1)
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Live Activity */}
        <div className="live-panel">
          <div className="live-bets">
            <h4>🔥 Live Bets</h4>
            <div className="bets-stream">
              {liveBets.map((bet, index) => (
                <div key={index} className={`live-bet ${bet.isBot ? 'bot' : 'player'}`}>
                  <div className="player-info">
                    <span className="player-name">{bet.player.name}</span>
                    {bet.isBot && <span className="bot-indicator">🤖</span>}
                  </div>
                  <div className="bet-details">
                    <span className="bet-type">{bet.betType}</span>
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
                <div key={index} className={`result-item ${result.color}`}>
                  <span className="result-number">{result.number}</span>
                  <span className="result-color">{result.color}</span>
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
              Sound
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .lightning-roulette {
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
          background: rgba(0, 0, 0, 0.9);
          border-bottom: 2px solid #f59e0b;
        }

        .game-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .game-title h2 {
          font-size: 2rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
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
          min-height: calc(100vh - 80px);
        }

        .betting-panel, .live-panel {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          height: fit-content;
        }

        .balance-info {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
        }

        .balance-amount {
          font-size: 1.3rem;
          font-weight: 800;
          color: #10b981;
        }

        .bet-controls h4, .my-bets h4, .session-stats h4, .live-bets h4, .recent-results h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1rem;
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
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .bet-btn.active {
          background: var(--gradient-primary);
          border-color: var(--primary-red);
        }

        .bet-btn.high-roller {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          border-color: var(--primary-gold);
        }

        .bet-info {
          text-align: center;
          color: #888;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
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
          font-size: 0.85rem;
        }

        .no-bets {
          text-align: center;
          color: #666;
          padding: 1rem;
          font-size: 0.85rem;
        }

        .clear-bets-btn {
          width: 100%;
          background: #ef4444;
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
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
          font-size: 0.85rem;
        }

        .win-stat { color: #10b981; }
        .big-win-stat { color: #f59e0b; }

        .roulette-table {
          background: linear-gradient(135deg, #134e4a 0%, #0f766e 100%);
          border: 3px solid #fbbf24;
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
        }

        .lightning-display {
          text-align: center;
          background: rgba(245, 158, 11, 0.1);
          padding: 1rem;
          border-radius: 12px;
          border: 2px solid #f59e0b;
        }

        .lightning-display h3 {
          color: #f59e0b;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          animation: pulse 1s infinite;
        }

        .lightning-numbers {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .lightning-number {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #000;
          padding: 0.75rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
          animation: lightningPulse 1s ease-in-out infinite;
        }

        .lightning-number .number {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .lightning-number .multiplier {
          display: block;
          font-size: 1rem;
          font-weight: 700;
        }

        @keyframes lightningPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .wheel-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .roulette-wheel {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            #dc2626 0deg, #000 9.7deg,
            #dc2626 9.7deg, #000 19.4deg,
            #dc2626 19.4deg, #000 29.1deg,
            #dc2626 29.1deg, #000 38.8deg,
            #10b981 38.8deg, #000 48.5deg
          );
          border: 8px solid #fbbf24;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.1s linear;
        }

        .roulette-wheel.spinning {
          animation: spin 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(1800deg); }
        }

        .wheel-center {
          width: 80px;
          height: 80px;
          background: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #fbbf24;
        }

        .result-number {
          font-size: 2rem;
          font-weight: 800;
          color: white;
        }

        .result-number.red { background: #dc2626; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
        .result-number.black { background: #000; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
        .result-number.green { background: #10b981; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }

        .wheel-logo {
          font-size: 2rem;
          color: #f59e0b;
        }

        .wheel-pointer {
          font-size: 2rem;
          color: #fbbf24;
          margin-top: -1rem;
        }

        .betting-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .numbers-grid {
          display: grid;
          grid-template-columns: repeat(13, 1fr);
          gap: 0.25rem;
          max-width: 100%;
          overflow-x: auto;
        }

        .number-btn {
          aspect-ratio: 1;
          border: 2px solid #fbbf24;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40px;
        }

        .number-btn.red { background: #dc2626; color: white; }
        .number-btn.black { background: #000; color: white; }
        .number-btn.green { background: #10b981; color: white; }

        .number-btn.lightning {
          box-shadow: 0 0 15px #f59e0b;
          animation: lightningGlow 1s ease-in-out infinite;
        }

        @keyframes lightningGlow {
          0%, 100% { box-shadow: 0 0 15px #f59e0b; }
          50% { box-shadow: 0 0 25px #f59e0b, 0 0 35px #f59e0b; }
        }

        .number-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }

        .number-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lightning-multiplier {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #f59e0b;
          color: #000;
          font-size: 0.6rem;
          padding: 2px 4px;
          border-radius: 8px;
          font-weight: 700;
        }

        .outside-bets {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.5rem;
        }

        .outside-bet {
          padding: 0.75rem;
          border: 2px solid #fbbf24;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          background: rgba(0, 0, 0, 0.5);
          color: white;
        }

        .outside-bet.red { border-color: #dc2626; }
        .outside-bet.black { border-color: #000; }

        .outside-bet:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
        }

        .outside-bet:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .live-bets, .recent-results {
          margin-bottom: 2rem;
        }

        .bets-stream, .results-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
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
        }

        .bot-indicator {
          font-size: 0.7rem;
        }

        .bet-details {
          display: flex;
          justify-content: space-between;
          color: #888;
        }

        .result-item {
          padding: 0.5rem;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .result-item.red { background: rgba(220, 38, 38, 0.2); color: #dc2626; }
        .result-item.black { background: rgba(0, 0, 0, 0.2); color: white; }
        .result-item.green { background: rgba(16, 185, 129, 0.2); color: #10b981; }

        .no-live-bets, .no-results {
          text-align: center;
          color: #666;
          padding: 1rem;
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
          
          .game-header {
            padding: 0.5rem 1rem;
          }
          
          .numbers-grid {
            grid-template-columns: repeat(10, 1fr);
          }
          
          .outside-bets {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .numbers-grid {
            grid-template-columns: repeat(7, 1fr);
          }
          
          .outside-bets {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .roulette-wheel {
            width: 150px;
            height: 150px;
          }
          
          .wheel-center {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
}

export default LightningRoulette;
