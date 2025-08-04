import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, TrendingUp, Flame, Zap } from 'lucide-react';
import ApiService from '../services/api';

function FireJokerSlot({ user, balance, setBalance, onClose }) {
  const [gameState, setGameState] = useState({
    grid: [
      ['🔔', '🍒', '💰'],
      ['⭐', '🔥', '💎'],
      ['💰', '⚡', '🔔']
    ],
    isSpinning: false,
    lastWin: null,
    winAmount: 0,
    multiplier: 0,
    showWinAnimation: false
  });

  const [betAmount, setBetAmount] = useState(10); // Minimum bet 10
  const [autoSpin, setAutoSpin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [winStreak, setWinStreak] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);

  const symbols = ['🔥', '💎', '⭐', '🍒', '🔔', '💰', '⚡'];
  // Updated bet options: 10 minimum, 5000 maximum
  const betOptions = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = async () => {
    try {
      const response = await ApiService.getGameHistory('SLOTS', 10);
      setGameHistory(response.gameHistory || []);
    } catch (error) {
      console.error('Error loading game history:', error);
    }
  };

  const playSpinSound = () => {
    if (!soundEnabled) return;
    console.log('🎵 Spin sound!');
  };

  const playWinSound = (isJackpot = false) => {
    if (!soundEnabled) return;
    console.log(isJackpot ? '🎵 JACKPOT SOUND!' : '🎵 Win sound!');
  };

  const spinReels = async () => {
    if (loading || gameState.isSpinning) return;
    
    if (balance < betAmount) {
      setError('Insufficient chip balance!');
      return;
    }

    setLoading(true);
    setError('');
    setGameState(prev => ({ ...prev, isSpinning: true, showWinAnimation: false }));
    
    playSpinSound();

    try {
      const spinDuration = 2000;
      const spinInterval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          grid: prev.grid.map(row => 
            row.map(() => symbols[Math.floor(Math.random() * symbols.length)])
          )
        }));
      }, 100);

      const response = await ApiService.playFireJoker(betAmount);
      
      setTimeout(() => {
        clearInterval(spinInterval);
        
        if (response.success) {
          const { gameResult, newBalance } = response;
          
          setBalance(newBalance);
          setTotalSpins(prev => prev + 1);
          
          setGameState(prev => ({
            ...prev,
            grid: gameResult.grid,
            isSpinning: false,
            lastWin: gameResult.isWin ? gameResult : null,
            winAmount: gameResult.winAmount,
            multiplier: gameResult.multiplier,
            showWinAnimation: gameResult.isWin
          }));

          if (gameResult.isWin) {
            setWinStreak(prev => prev + 1);
            playWinSound(gameResult.multiplier >= 20);
            
            setTimeout(() => {
              setGameState(prev => ({ ...prev, showWinAnimation: false }));
            }, 3000);
          } else {
            setWinStreak(0);
          }

          loadGameHistory();
        } else {
          setError(response.message);
        }
      }, spinDuration);

    } catch (error) {
      setError(error.message);
      setGameState(prev => ({ ...prev, isSpinning: false }));
    } finally {
      setLoading(false);
    }
  };

  const getSymbolStyle = (symbol, rowIndex, colIndex) => {
    const baseStyle = {
      fontSize: '3rem',
      transition: 'all 0.3s ease',
      filter: gameState.showWinAnimation ? 'drop-shadow(0 0 10px #f59e0b)' : 'none',
      transform: gameState.showWinAnimation ? 'scale(1.1)' : 'scale(1)'
    };

    if (gameState.isSpinning) {
      return {
        ...baseStyle,
        animation: `spin 0.1s linear infinite`,
        transform: 'scale(0.9)'
      };
    }

    return baseStyle;
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString();
  };

  const formatBetAmount = (amount) => {
    return amount >= 1000 ? `${amount/1000}K` : amount;
  };

  return (
    <div className="fire-joker-slot">
      <div className="game-header">
        <div className="game-title">
          <Flame size={32} />
          <h2>🔥 FIRE JOKER</h2>
          <div className="game-stats">
            <span>RTP: 85%</span>
            <span>Volatility: Medium</span>
            <span>Min: 10 | Max: 5000</span>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="game-container">
        <div className="game-controls">
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
                  disabled={gameState.isSpinning || balance < amount}
                >
                  {formatBetAmount(amount)}
                  {amount >= 1000 && <span className="vip-indicator">👑</span>}
                </button>
              ))}
            </div>
            <div className="bet-info">
              <span>Total Bet: {betAmount} CHIPS</span>
            </div>
            {betAmount >= 1000 && (
              <div className="high-roller-warning">
                👑 High Roller Mode - Bet Responsibly!
              </div>
            )}
          </div>

          <div className="game-options">
            <button
              className={`option-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              Sound
            </button>
            
            <button
              className={`option-btn ${autoSpin ? 'active' : ''}`}
              onClick={() => setAutoSpin(!autoSpin)}
              disabled={gameState.isSpinning}
            >
              <RotateCcw size={16} />
              Auto
            </button>
          </div>

          <div className="session-stats">
            <h4>Session Stats</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span>Spins:</span>
                <strong>{totalSpins}</strong>
              </div>
              <div className="stat-item">
                <span>Win Streak:</span>
                <strong>{winStreak}</strong>
              </div>
              <div className="stat-item">
                <span>Last Win:</span>
                <strong>{gameState.winAmount > 0 ? `${formatCurrency(gameState.winAmount)}` : 'None'}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="slot-machine">
          {error && <div className="error-banner">{error}</div>}
          
          {gameState.showWinAnimation && (
            <div className="win-overlay">
              <div className="win-animation">
                <Zap className="win-icon" />
                <div className="win-text">
                  <h3>🔥 BIG WIN! 🔥</h3>
                  <div className="win-amount">{formatCurrency(gameState.winAmount)} CHIPS</div>
                  {gameState.multiplier > 0 && (
                    <div className="win-multiplier">{gameState.multiplier.toFixed(1)}x MULTIPLIER!</div>
                  )}
                </div>
                <Zap className="win-icon" />
              </div>
            </div>
          )}

          <div className="slot-grid">
            {gameState.grid.map((row, rowIndex) => (
              <div key={rowIndex} className="slot-row">
                {row.map((symbol, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="slot-cell"
                    style={getSymbolStyle(symbol, rowIndex, colIndex)}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="paylines-overlay">
            {gameState.lastWin?.winningLines?.map((line, index) => (
              <div key={index} className="winning-line">
                Line {line.line + 1}: {line.multiplier.toFixed(1)}x
              </div>
            ))}
          </div>

          <button
            className={`spin-btn ${gameState.isSpinning ? 'spinning' : ''} ${betAmount >= 1000 ? 'high-roller-spin' : ''}`}
            onClick={spinReels}
            disabled={gameState.isSpinning || loading || balance < betAmount}
          >
            {gameState.isSpinning ? (
              <div className="spinning-text">
                <RotateCcw className="spin-icon" />
                SPINNING...
              </div>
            ) : (
              <div className="spin-text">
                <Flame size={20} />
                SPIN ({formatBetAmount(betAmount)} CHIPS)
              </div>
            )}
          </button>
        </div>

        <div className="game-info">
          <div className="paytable">
            <h4>🏆 Paytable</h4>
            <div className="paytable-items">
              <div className="payout-item">
                <span>🔥🔥🔥</span>
                <span>50x</span>
              </div>
              <div className="payout-item">
                <span>💎💎💎</span>
                <span>25x</span>
              </div>
              <div className="payout-item">
                <span>⭐⭐⭐</span>
                <span>15x</span>
              </div>
              <div className="payout-item">
                <span>🍒🍒🍒</span>
                <span>10x</span>
              </div>
              <div className="payout-item">
                <span>💰💰💰</span>
                <span>12x</span>
              </div>
              <div className="payout-item">
                <span>⚡⚡⚡</span>
                <span>20x</span>
              </div>
            </div>
          </div>

          <div className="recent-history">
            <h4>📊 Recent Spins</h4>
            <div className="history-list">
              {gameHistory.slice(0, 5).map((game, index) => (
                <div key={index} className={`history-item ${game.isWin ? 'win' : 'loss'}`}>
                  <span className="bet-amount">{game.betAmount}</span>
                  <span className="result">
                    {game.isWin ? `+${game.winAmount}` : `-${game.betAmount}`}
                  </span>
                  <span className="multiplier">
                    {game.isWin ? `${game.multiplier.toFixed(1)}x` : '0x'}
                  </span>
                </div>
              ))}
              {gameHistory.length === 0 && (
                <div className="no-history">No spins yet!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .fire-joker-slot {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          z-index: 2000;
          overflow-y: auto;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.9);
          border-bottom: 2px solid var(--primary-red);
        }

        .game-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .game-title h2 {
          font-size: 2rem;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .game-stats {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: #888;
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

        .close-game-btn:hover {
          background: #b91c1c;
          transform: scale(1.1);
        }

        .game-container {
          display: grid;
          grid-template-columns: 300px 1fr 250px;
          gap: 2rem;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 80px);
        }

        .game-controls {
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

        .balance-info h3 {
          color: #10b981;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .balance-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: #10b981;
        }

        .bet-controls {
          margin-bottom: 2rem;
        }

        .bet-controls h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .bet-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
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
          font-weight: 600;
          font-size: 0.85rem;
          position: relative;
        }

        .bet-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .bet-btn.active {
          background: var(--gradient-primary);
          border-color: var(--primary-red);
        }

        .bet-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.05);
        }

        .bet-btn.high-roller {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          border-color: var(--primary-gold);
          font-weight: 700;
        }

        .bet-btn.high-roller:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
          transform: scale(1.05);
        }

        .bet-btn.high-roller.active {
          background: var(--gradient-gold);
          color: #000;
          font-weight: 800;
        }

        .vip-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 0.6rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .bet-info {
          text-align: center;
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .high-roller-warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid var(--primary-gold);
          color: var(--primary-gold);
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
          text-align: center;
          margin-top: 0.5rem;
        }

        .game-options {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .option-btn {
          flex: 1;
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
          font-size: 0.9rem;
        }

        .option-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .option-btn.active {
          background: var(--gradient-primary);
          border-color: var(--primary-red);
        }

        .session-stats h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .stat-item span {
          color: #888;
        }

        .stat-item strong {
          color: white;
        }

        .slot-machine {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          position: relative;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem 2rem;
          border-radius: 8px;
          border: 1px solid #ef4444;
          text-align: center;
          font-weight: 600;
        }

        .win-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          pointer-events: none;
        }

        .win-animation {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(245, 158, 11, 0.95);
          color: #000;
          padding: 2rem 3rem;
          border-radius: 20px;
          animation: winPulse 1s ease-in-out infinite;
          box-shadow: 0 0 50px rgba(245, 158, 11, 0.8);
        }

        @keyframes winPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .win-icon {
          font-size: 3rem;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .win-text {
          text-align: center;
        }

        .win-text h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .win-amount {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }

        .win-multiplier {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .slot-grid {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border: 3px solid var(--primary-red);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.5);
          position: relative;
          overflow: hidden;
        }

        .slot-grid::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.1) 50%, transparent 51%);
          pointer-events: none;
        }

        .slot-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .slot-row:last-child {
          margin-bottom: 0;
        }

        .slot-cell {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          position: relative;
          overflow: hidden;
        }

        .slot-cell::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .slot-cell:hover::before {
          opacity: 1;
        }

        .paylines-overlay {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .winning-line {
          background: var(--gradient-gold);
          color: #000;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          animation: winPulse 1s ease-in-out infinite;
        }

        .spin-btn {
          background: var(--gradient-primary);
          border: none;
          color: white;
          padding: 1.5rem 3rem;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          min-width: 200px;
        }

        .spin-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.5);
        }

        .spin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin-btn.spinning {
          background: var(--gradient-gold);
          color: #000;
          animation: winPulse 0.5s ease-in-out infinite;
        }

        .spin-btn.high-roller-spin {
          background: var(--gradient-gold);
          color: #000;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
        }

        .spin-btn.high-roller-spin:hover:not(:disabled) {
          box-shadow: 0 10px 40px rgba(245, 158, 11, 0.7);
        }

        .spinning-text, .spin-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        .game-info {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          height: fit-content;
        }

        .paytable {
          margin-bottom: 2rem;
        }

        .paytable h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .paytable-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payout-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .payout-item span:first-child {
          font-size: 1.2rem;
        }

        .payout-item span:last-child {
          color: var(--primary-gold);
          font-weight: 700;
        }

        .recent-history h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .history-item {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .history-item.win {
          border-left: 3px solid #10b981;
        }

        .history-item.loss {
          border-left: 3px solid #ef4444;
        }

        .history-item .bet-amount {
          color: #888;
        }

        .history-item .result {
          font-weight: 600;
        }

        .history-item.win .result {
          color: #10b981;
        }

        .history-item.loss .result {
          color: #ef4444;
        }

        .history-item .multiplier {
          color: var(--primary-gold);
          font-weight: 600;
        }

        .no-history {
          text-align: center;
          color: #666;
          padding: 2rem;
        }

        @media (max-width: 1200px) {
          .game-container {
            grid-template-columns: 250px 1fr 200px;
            gap: 1rem;
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .game-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .slot-grid {
            padding: 1rem;
          }
          
          .slot-cell {
            width: 60px;
            height: 60px;
            font-size: 2rem;
          }
          
          .game-header {
            padding: 0.5rem 1rem;
          }
          
          .game-title h2 {
            font-size: 1.5rem;
          }

          .bet-options {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default FireJokerSlot;
