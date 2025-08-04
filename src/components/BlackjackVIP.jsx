import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, Flame, Zap, TrendingUp, Award } from 'lucide-react';
import ApiService from '../services/api';

function BlackjackVIP({ user, balance, setBalance, onClose }) {
  const [gameState, setGameState] = useState({
    phase: 'betting', // betting, dealing, playing, dealer, finished
    playerHand: [],
    dealerHand: [],
    playerValue: 0,
    dealerValue: 0,
    playerBust: false,
    dealerBust: false,
    gameResult: null,
    canDouble: false,
    canSplit: false,
    isDealing: false
  });

  const [betAmount, setBetAmount] = useState(50);
  const [sideBets, setSideBets] = useState({
    perfectPairs: 0,
    insurance: 0
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionStats, setSessionStats] = useState({
    hands: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0
  });

  // Bet options for high rollers
  const betOptions = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  
  // Card suits and values
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = async () => {
    try {
      const response = await ApiService.getGameHistory('BLACKJACK', 10);
      setGameHistory(response.gameHistory || []);
    } catch (error) {
      console.error('Error loading game history:', error);
    }
  };

  const getCardValue = (card) => {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
  };

  const calculateHandValue = (hand) => {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    });

    // Handle aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  const generateCard = () => {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { suit, value, id: Date.now() + Math.random() };
  };

  const isBlackjack = (hand) => {
    return hand.length === 2 && calculateHandValue(hand) === 21;
  };

  const startNewHand = async () => {
    if (balance < betAmount) {
      setError('Insufficient chip balance!');
      return;
    }

    setLoading(true);
    setError('');
    
    // Reset game state
    const newPlayerHand = [generateCard(), generateCard()];
    const newDealerHand = [generateCard(), generateCard()];

    setGameState({
      phase: 'dealing',
      playerHand: newPlayerHand,
      dealerHand: newDealerHand,
      playerValue: calculateHandValue(newPlayerHand),
      dealerValue: calculateHandValue(newDealerHand),
      playerBust: false,
      dealerBust: false,
      gameResult: null,
      canDouble: true,
      canSplit: newPlayerHand[0].value === newPlayerHand[1].value,
      isDealing: true
    });

    // Simulate dealing animation
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isDealing: false, phase: 'playing' }));
      
      // Check for blackjacks
      const playerBJ = isBlackjack(newPlayerHand);
      const dealerBJ = isBlackjack(newDealerHand);
      
      if (playerBJ || dealerBJ) {
        finishHand(newPlayerHand, newDealerHand, playerBJ, dealerBJ);
      }
    }, 2000);

    setLoading(false);
  };

  const hit = () => {
    const newCard = generateCard();
    const newPlayerHand = [...gameState.playerHand, newCard];
    const newValue = calculateHandValue(newPlayerHand);

    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      playerValue: newValue,
      canDouble: false,
      canSplit: false
    }));

    if (newValue > 21) {
      // Player busts
      setTimeout(() => {
        finishHand(newPlayerHand, gameState.dealerHand, false, false, true);
      }, 500);
    }
  };

  const stand = () => {
    setGameState(prev => ({ ...prev, phase: 'dealer' }));
    dealerPlay();
  };

  const doubleDown = () => {
    if (balance < betAmount * 2) {
      setError('Insufficient chips to double down!');
      return;
    }

    const newCard = generateCard();
    const newPlayerHand = [...gameState.playerHand, newCard];
    const newValue = calculateHandValue(newPlayerHand);

    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      playerValue: newValue,
      phase: 'dealer'
    }));

    setBetAmount(prev => prev * 2);

    if (newValue > 21) {
      finishHand(newPlayerHand, gameState.dealerHand, false, false, true);
    } else {
      dealerPlay();
    }
  };

  const dealerPlay = () => {
    let dealerHand = [...gameState.dealerHand];
    let dealerValue = calculateHandValue(dealerHand);

    const dealerHit = () => {
      if (dealerValue < 17) {
        const newCard = generateCard();
        dealerHand.push(newCard);
        dealerValue = calculateHandValue(dealerHand);
        
        setGameState(prev => ({
          ...prev,
          dealerHand: [...dealerHand],
          dealerValue
        }));

        setTimeout(dealerHit, 1000);
      } else {
        finishHand(gameState.playerHand, dealerHand, false, false, gameState.playerValue > 21, dealerValue > 21);
      }
    };

    setTimeout(dealerHit, 1000);
  };

  const finishHand = async (playerHand, dealerHand, playerBJ = false, dealerBJ = false, playerBust = false, dealerBust = false) => {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    let result;
    let winAmount = 0;

    if (playerBust) {
      result = 'lose';
      winAmount = 0;
    } else if (dealerBust) {
      result = 'win';
      winAmount = betAmount * 2;
    } else if (playerBJ && !dealerBJ) {
      result = 'blackjack';
      winAmount = Math.floor(betAmount * 2.5); // 3:2 payout
    } else if (dealerBJ && !playerBJ) {
      result = 'lose';
      winAmount = 0;
    } else if (playerBJ && dealerBJ) {
      result = 'push';
      winAmount = betAmount;
    } else if (playerValue > dealerValue) {
      result = 'win';
      winAmount = betAmount * 2;
    } else if (dealerValue > playerValue) {
      result = 'lose';
      winAmount = 0;
    } else {
      result = 'push';
      winAmount = betAmount;
    }

    // Update balance
    const newBalance = balance - betAmount + winAmount;
    setBalance(newBalance);

    // Update session stats
    setSessionStats(prev => ({
      hands: prev.hands + 1,
      wins: result === 'win' || result === 'blackjack' ? prev.wins + 1 : prev.wins,
      losses: result === 'lose' ? prev.losses + 1 : prev.losses,
      pushes: result === 'push' ? prev.pushes + 1 : prev.pushes,
      blackjacks: result === 'blackjack' ? prev.blackjacks + 1 : prev.blackjacks
    }));

    setGameState(prev => ({
      ...prev,
      phase: 'finished',
      gameResult: result,
      playerBust,
      dealerBust,
      playerValue,
      dealerValue
    }));

    // Send result to backend
    try {
      await ApiService.playBlackjack({
        betAmount,
        result,
        winAmount,
        playerHand,
        dealerHand,
        playerValue,
        dealerValue
      });
      loadGameHistory();
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  };

  const newHand = () => {
    setBetAmount(50);
    setGameState({
      phase: 'betting',
      playerHand: [],
      dealerHand: [],
      playerValue: 0,
      dealerValue: 0,
      playerBust: false,
      dealerBust: false,
      gameResult: null,
      canDouble: false,
      canSplit: false,
      isDealing: false
    });
  };

  const getCardColor = (suit) => {
    return suit === '♥' || suit === '♦' ? '#dc2626' : '#000';
  };

  const getResultMessage = () => {
    switch (gameState.gameResult) {
      case 'win': return '🎉 You Win!';
      case 'lose': return '💀 Dealer Wins';
      case 'push': return '🤝 Push';
      case 'blackjack': return '🃏 BLACKJACK! 🃏';
      default: return '';
    }
  };

  const getResultColor = () => {
    switch (gameState.gameResult) {
      case 'win':
      case 'blackjack': return '#10b981';
      case 'lose': return '#ef4444';
      case 'push': return '#f59e0b';
      default: return '#fff';
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString();
  };

  return (
    <div className="blackjack-vip">
      {/* Game Header */}
      <div className="game-header">
        <div className="game-title">
          <Award size={32} />
          <h2>🃏 BLACKJACK VIP</h2>
          <div className="game-stats">
            <span>House Edge: 1%</span>
            <span>Blackjack Pays: 3:2</span>
            <span>Min: 10 | Max: 5000</span>
          </div>
        </div>
        <button className="close-game-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="game-container">
        {/* Left Panel - Controls */}
        <div className="game-controls">
          <div className="balance-info">
            <h3>Your Balance</h3>
            <div className="balance-amount">{formatCurrency(balance)} CHIPS</div>
          </div>

          {gameState.phase === 'betting' && (
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
                <span>Current Bet: {betAmount} CHIPS</span>
              </div>
              {betAmount >= 1000 && (
                <div className="high-roller-warning">
                  👑 High Roller Table - Premium Experience!
                </div>
              )}
            </div>
          )}

          <div className="session-stats">
            <h4>Session Stats</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span>Hands:</span>
                <strong>{sessionStats.hands}</strong>
              </div>
              <div className="stat-item">
                <span>Wins:</span>
                <strong className="win-stat">{sessionStats.wins}</strong>
              </div>
              <div className="stat-item">
                <span>Losses:</span>
                <strong className="loss-stat">{sessionStats.losses}</strong>
              </div>
              <div className="stat-item">
                <span>Blackjacks:</span>
                <strong className="bj-stat">{sessionStats.blackjacks}</strong>
              </div>
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

        {/* Center - Game Table */}
        <div className="game-table">
          {error && <div className="error-banner">{error}</div>}

          {/* Dealer Section */}
          <div className="dealer-section">
            <h3>Dealer</h3>
            <div className="hand-value">
              {gameState.phase === 'playing' && gameState.dealerHand.length > 0 
                ? `${getCardValue(gameState.dealerHand[0])}` 
                : gameState.dealerValue > 0 ? gameState.dealerValue : ''}
              {gameState.dealerBust && <span className="bust">BUST!</span>}
            </div>
            <div className="cards-container">
              {gameState.dealerHand.map((card, index) => (
                <div 
                  key={card.id} 
                  className={`card ${index === 1 && gameState.phase === 'playing' ? 'hidden' : ''}`}
                >
                  {index === 1 && gameState.phase === 'playing' ? (
                    <div className="card-back">🂠</div>
                  ) : (
                    <div className="card-front" style={{ color: getCardColor(card.suit) }}>
                      <div className="card-value">{card.value}</div>
                      <div className="card-suit">{card.suit}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Result */}
          {gameState.gameResult && (
            <div className="game-result" style={{ color: getResultColor() }}>
              <h2>{getResultMessage()}</h2>
              {gameState.gameResult === 'win' && (
                <div className="win-amount">+{betAmount} CHIPS</div>
              )}
              {gameState.gameResult === 'blackjack' && (
                <div className="win-amount">+{Math.floor(betAmount * 1.5)} CHIPS</div>
              )}
              {gameState.gameResult === 'push' && (
                <div className="win-amount">Bet Returned</div>
              )}
            </div>
          )}

          {/* Player Section */}
          <div className="player-section">
            <h3>You</h3>
            <div className="hand-value">
              {gameState.playerValue > 0 ? gameState.playerValue : ''}
              {gameState.playerBust && <span className="bust">BUST!</span>}
              {isBlackjack(gameState.playerHand) && <span className="blackjack">BLACKJACK!</span>}
            </div>
            <div className="cards-container">
              {gameState.playerHand.map((card) => (
                <div key={card.id} className="card">
                  <div className="card-front" style={{ color: getCardColor(card.suit) }}>
                    <div className="card-value">{card.value}</div>
                    <div className="card-suit">{card.suit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Actions */}
          <div className="game-actions">
            {gameState.phase === 'betting' && (
              <button 
                className="action-btn deal-btn"
                onClick={startNewHand}
                disabled={loading || balance < betAmount}
              >
                {loading ? 'Dealing...' : `Deal Cards (${betAmount} chips)`}
              </button>
            )}

            {gameState.phase === 'playing' && !gameState.playerBust && (
              <div className="action-buttons">
                <button className="action-btn hit-btn" onClick={hit}>
                  Hit
                </button>
                <button className="action-btn stand-btn" onClick={stand}>
                  Stand
                </button>
                {gameState.canDouble && (
                  <button 
                    className="action-btn double-btn" 
                    onClick={doubleDown}
                    disabled={balance < betAmount * 2}
                  >
                    Double
                  </button>
                )}
              </div>
            )}

            {gameState.phase === 'finished' && (
              <button className="action-btn new-hand-btn" onClick={newHand}>
                New Hand
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="game-info">
          <div className="rules-section">
            <h4>🃏 Rules</h4>
            <ul className="rules-list">
              <li>Get as close to 21 without going over</li>
              <li>Blackjack pays 3:2</li>
              <li>Dealer stands on soft 17</li>
              <li>Double down on any two cards</li>
              <li>Split pairs (coming soon)</li>
            </ul>
          </div>

          <div className="recent-history">
            <h4>📊 Recent Hands</h4>
            <div className="history-list">
              {gameHistory.slice(0, 5).map((game, index) => (
                <div key={index} className={`history-item ${game.isWin ? 'win' : 'loss'}`}>
                  <span className="bet-amount">{game.betAmount}</span>
                  <span className="result">
                    {game.isWin ? `+${game.winAmount}` : `-${game.betAmount}`}
                  </span>
                  <span className="game-type">
                    {game.outcome?.isBlackjack ? 'BJ' : game.isWin ? 'W' : 'L'}
                  </span>
                </div>
              ))}
              {gameHistory.length === 0 && (
                <div className="no-history">No hands yet!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .blackjack-vip {
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
          border-bottom: 2px solid var(--primary-red);
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
        }

        .bet-btn.high-roller {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          border-color: var(--primary-gold);
          font-weight: 700;
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

        .win-stat { color: #10b981 !important; }
        .loss-stat { color: #ef4444 !important; }
        .bj-stat { color: #f59e0b !important; }

        .game-options {
          margin-top: 2rem;
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
          font-size: 0.9rem;
        }

        .option-btn.active {
          background: var(--gradient-primary);
          border-color: var(--primary-red);
        }

        .game-table {
          background: linear-gradient(135deg, #134e4a 0%, #0f766e 100%);
          border: 3px solid #fbbf24;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          min-height: 600px;
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
          margin-bottom: 1rem;
        }

        .dealer-section, .player-section {
          text-align: center;
        }

        .dealer-section h3, .player-section h3 {
          color: #fbbf24;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .hand-value {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          min-height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .bust {
          color: #ef4444;
          font-size: 1.5rem;
          animation: pulse 1s infinite;
        }

        .blackjack {
          color: #f59e0b;
          font-size: 1.5rem;
          animation: pulse 1s infinite;
        }

        .cards-container {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          min-height: 120px;
          align-items: center;
        }

        .card {
          width: 80px;
          height: 112px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .card.hidden .card-back {
          background: #1e40af;
          color: #fbbf24;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }

        .card-front {
          background: white;
          border: 2px solid #000;
          border-radius: 8px;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.5rem;
          position: relative;
        }

        .card-value {
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1;
        }

        .card-suit {
          font-size: 2rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .game-result {
          text-align: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 12px;
          margin: 1rem 0;
        }

        .game-result h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .win-amount {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .game-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: auto;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          background: var(--gradient-primary);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .deal-btn {
          background: var(--gradient-gold);
          color: #000;
          font-size: 1.2rem;
          padding: 1.2rem 3rem;
        }

        .hit-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stand-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #000;
        }

        .double-btn {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .new-hand-btn {
          background: var(--gradient-gold);
          color: #000;
          font-size: 1.2rem;
          padding: 1.2rem 3rem;
        }

        .game-info {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          height: fit-content;
        }

        .rules-section {
          margin-bottom: 2rem;
        }

        .rules-section h4 {
          color: var(--primary-red);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .rules-list {
          list-style: none;
          padding: 0;
        }

        .rules-list li {
          color: #ccc;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .rules-list li::before {
          content: '•';
          color: var(--primary-gold);
          position: absolute;
          left: 0;
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

        .history-item .game-type {
          color: var(--primary-gold);
          font-weight: 600;
          text-align: center;
        }

        .no-history {
          text-align: center;
          color: #666;
          padding: 2rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
          
          .game-header {
            padding: 0.5rem 1rem;
          }
          
          .game-title h2 {
            font-size: 1.5rem;
          }

          .bet-options {
            grid-template-columns: repeat(2, 1fr);
          }

          .cards-container {
            gap: 0.5rem;
          }

          .card {
            width: 60px;
            height: 84px;
          }

          .action-buttons {
            flex-wrap: wrap;
          }

          .action-btn {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default BlackjackVIP;
