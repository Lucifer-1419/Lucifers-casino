const User = require('../models/User');
const GameSession = require('../models/GameSession');

// Fire Joker Slot Configuration
const FIRE_JOKER_CONFIG = {
  rtp: 0.85, // 85% RTP (15% house edge)
  symbols: ['🔥', '💎', '⭐', '🍒', '🔔', '💰', '⚡'],
  paylines: [
    [[0,0], [0,1], [0,2]], // Top row
    [[1,0], [1,1], [1,2]], // Middle row  
    [[2,0], [2,1], [2,2]], // Bottom row
    [[0,0], [1,1], [2,2]], // Diagonal \
    [[2,0], [1,1], [0,2]]  // Diagonal /
  ],
  payouts: {
    '🔥🔥🔥': 50,  // Jackpot
    '💎💎💎': 25,  // High win
    '⭐⭐⭐': 15,  // Medium win
    '🍒🍒🍒': 10,  // Low win
    '🔔🔔🔔': 8,
    '💰💰💰': 12,
    '⚡⚡⚡': 20,
    // Mixed combinations
    '🔥🔥': 3,
    '💎💎': 2,
    '🔥💎': 2
  }
};

// Generate slot outcome with controlled RTP
const generateSlotOutcome = (betAmount, userStats = {}) => {
  const random = Math.random();
  const rtp = FIRE_JOKER_CONFIG.rtp;
  
  // Determine if this should be a win or loss
  let shouldWin = random > (1 - rtp);
  
  // Add some variance for new players (slightly better odds)
  if (userStats.totalGames < 10) {
    shouldWin = random > 0.7; // 30% win rate for newbies
  }
  
  // Generate 3x3 grid
  const grid = [];
  for (let row = 0; row < 3; row++) {
    grid[row] = [];
    for (let col = 0; col < 3; col++) {
      if (shouldWin && row === 1 && col === 0) {
        // Start a winning line on middle row
        const winSymbol = getRandomWinningSymbol();
        grid[row][col] = winSymbol;
      } else if (shouldWin && row === 1 && col < 3) {
        // Continue the winning line
        grid[row][col] = grid[1][0];
      } else {
        // Random symbol
        grid[row][col] = getRandomSymbol();
      }
    }
  }
  
  // Calculate actual win
  const { winAmount, winningLines, multiplier } = calculateWin(grid, betAmount);
  
  return {
    grid,
    winAmount,
    winningLines,
    multiplier,
    isWin: winAmount > 0,
    symbols: FIRE_JOKER_CONFIG.symbols
  };
};

const getRandomSymbol = () => {
  const symbols = FIRE_JOKER_CONFIG.symbols;
  return symbols[Math.floor(Math.random() * symbols.length)];
};

const getRandomWinningSymbol = () => {
  const winningSymbols = ['🔥', '💎', '⭐', '🍒'];
  return winningSymbols[Math.floor(Math.random() * winningSymbols.length)];
};

const calculateWin = (grid, betAmount) => {
  let totalWin = 0;
  let winningLines = [];
  let maxMultiplier = 0;
  
  // Check each payline
  FIRE_JOKER_CONFIG.paylines.forEach((payline, index) => {
    const symbols = payline.map(([row, col]) => grid[row][col]);
    const symbolString = symbols.join('');
    
    // Check for exact matches
    if (FIRE_JOKER_CONFIG.payouts[symbolString]) {
      const multiplier = FIRE_JOKER_CONFIG.payouts[symbolString];
      const lineWin = betAmount * multiplier;
      totalWin += lineWin;
      maxMultiplier = Math.max(maxMultiplier, multiplier);
      
      winningLines.push({
        line: index,
        symbols: symbols,
        multiplier: multiplier,
        winAmount: lineWin
      });
    }
  });
  
  return { winAmount: totalWin, winningLines, multiplier: maxMultiplier };
};

// Play Fire Joker Slot
exports.playFireJoker = async (req, res) => {
  try {
    const { betAmount } = req.body;
    const userId = req.user._id;
    
    // Validation
    if (!betAmount || betAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bet amount. Minimum bet is 1 chip.'
      });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check balance
    if (user.chipBalance < betAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient chip balance'
      });
    }
    
    // Get user game stats for RTP adjustment
    const userStats = {
      totalGames: user.statistics.totalGamesPlayed || 0,
      totalWinnings: user.statistics.totalWinnings || 0
    };
    
    // Generate game outcome
    const outcome = generateSlotOutcome(betAmount, userStats);
    
    // Calculate new balance
    const balanceBefore = user.chipBalance;
    const balanceAfter = balanceBefore - betAmount + outcome.winAmount;
    
    // Update user balance and stats
    user.chipBalance = balanceAfter;
    user.statistics.totalGamesPlayed += 1;
    
    if (outcome.isWin) {
      user.statistics.totalWinnings += outcome.winAmount;
      if (outcome.winAmount > user.statistics.biggestWin) {
        user.statistics.biggestWin = outcome.winAmount;
      }
    } else {
      user.statistics.totalLosses += betAmount;
    }
    
    await user.save();
    
    // Save game session
    const gameSession = new GameSession({
      userId,
      gameType: 'SLOTS',
      gameName: 'Fire Joker',
      betAmount,
      winAmount: outcome.winAmount,
      outcome: outcome,
      isWin: outcome.isWin,
      multiplier: outcome.multiplier,
      balanceBefore,
      balanceAfter
    });
    
    await gameSession.save();
    
    // Prepare response
    const response = {
      success: true,
      gameResult: {
        ...outcome,
        betAmount,
        balanceBefore,
        balanceAfter,
        profit: outcome.winAmount - betAmount
      },
      newBalance: balanceAfter,
      message: outcome.isWin 
        ? `🔥 You won ${outcome.winAmount} chips! ${outcome.multiplier}x multiplier!` 
        : '💀 Better luck next time!'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Fire Joker game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while playing game'
    });
  }
};

// Get game history
exports.getGameHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameType, limit = 10 } = req.query;
    
    const filter = { userId };
    if (gameType) filter.gameType = gameType;
    
    const gameHistory = await GameSession.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');
    
    res.json({
      success: true,
      gameHistory
    });
    
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching game history'
    });
  }
};

// Get available games
exports.getAvailableGames = (req, res) => {
  const games = [
    {
      id: 'fire-joker',
      name: 'Fire Joker',
      type: 'SLOTS',
      category: 'Slots',
      description: 'Classic 3x3 slot with fire theme',
      minBet: 1,
      maxBet: 1000,
      rtp: '85%',
      volatility: 'Medium',
      paylines: 5,
      jackpot: 50000,
      features: ['Wild Symbols', 'Multipliers', 'Instant Wins'],
      image: '🔥',
      isActive: true,
      players: '2.1K'
    }
    // We'll add more games later
  ];
  
  res.json({
    success: true,
    games
  });
};
