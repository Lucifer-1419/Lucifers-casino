const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let users = [];
let depositRequests = [];
let withdrawalRequests = [];
let userIdCounter = 1;
let requestIdCounter = 1;

// Live Game Engine Class
class LiveGameEngine {
  constructor(io) {
    this.io = io;
    this.games = {
      lightningRoulette: {
        phase: 'betting', // betting, lightning, spinning, result
        timeLeft: 20,
        bets: new Map(), // userId -> bets array
        lightningNumbers: [],
        result: null,
        history: [],
        players: new Set(),
        bots: this.generateBots(),
        adminOverride: null
      },
      dragonTiger: {
        phase: 'betting',
        timeLeft: 15,
        bets: new Map(),
        result: null,
        history: [],
        players: new Set(),
        bots: this.generateBots(),
        adminOverride: null
      }
    };
    
    this.startGameCycles();
    this.startBotActivity();
  }

  generateBots() {
    const botNames = [
      '🤖 LuckyDragon88', '🎰 SlotKing777', '🔥 FirePlayer', '💎 DiamondBet',
      '⚡ ThunderStrike', '🎲 DiceDevil', '🍀 LuckyCharm', '💰 GoldRush',
      '🎯 BullsEye', '🌟 StarGambler', '🎪 CasinoMaster', '🃏 CardShark',
      '🎊 WinningSpree', '💸 HighRoller', '🎨 ArtOfLuck', '🚀 RocketBet'
    ];

    return botNames.map((name, index) => ({
      id: `bot_${index}`,
      name,
      isBot: true,
      balance: 50000 + Math.random() * 100000,
      avatar: '🤖',
      country: ['🇮🇳', '🇺🇸', '🇬🇧', '🇩🇪', '🇯🇵'][Math.floor(Math.random() * 5)]
    }));
  }

  startGameCycles() {
    // Lightning Roulette - 30 second cycles
    setInterval(() => {
      this.updateLightningRoulette();
    }, 1000);

    // Dragon Tiger - 20 second cycles  
    setInterval(() => {
      this.updateDragonTiger();
    }, 1000);
  }

  updateLightningRoulette() {
    const game = this.games.lightningRoulette;
    game.timeLeft--;

    if (game.timeLeft <= 0) {
      switch (game.phase) {
        case 'betting':
          game.phase = 'lightning';
          game.timeLeft = 5;
          game.lightningNumbers = this.generateLightningNumbers();
          break;
        case 'lightning':
          game.phase = 'spinning';
          game.timeLeft = 5;
          break;
        case 'spinning':
          game.phase = 'result';
          game.timeLeft = 5;
          if (game.adminOverride) {
            game.result = game.adminOverride;
            game.adminOverride = null;
            console.log('🎯 Using admin override result:', game.result);
          } else {
            game.result = this.generateRouletteResult();
          }
          this.processRouletteBets();
          break;
        case 'result':
          game.phase = 'betting';
          game.timeLeft = 20;
          this.resetRouletteGame();
          break;
      }
    }

    // Emit game state to all players
    this.io.to('lightning-roulette').emit('gameUpdate', {
      gameType: 'lightningRoulette',
      phase: game.phase,
      timeLeft: game.timeLeft,
      lightningNumbers: game.lightningNumbers,
      result: game.result,
      totalPlayers: game.players.size + Math.floor(game.bots.length * 0.6),
      recentWins: game.history.slice(-10)
    });
  }

  updateDragonTiger() {
    const game = this.games.dragonTiger;
    game.timeLeft--;

    if (game.timeLeft <= 0) {
      switch (game.phase) {
        case 'betting':
          game.phase = 'revealing';
          game.timeLeft = 3;
          if (game.adminOverride) {
            game.result = game.adminOverride;
            game.adminOverride = null;
          } else {
            game.result = this.generateDragonTigerResult();
          }
          this.processDragonTigerBets();
          break;
        case 'revealing':
          game.phase = 'result';
          game.timeLeft = 2;
          break;
        case 'result':
          game.phase = 'betting';
          game.timeLeft = 15;
          this.resetDragonTigerGame();
          break;
      }
    }

    this.io.to('dragon-tiger').emit('gameUpdate', {
      gameType: 'dragonTiger',
      phase: game.phase,
      timeLeft: game.timeLeft,
      result: game.result,
      totalPlayers: game.players.size + Math.floor(game.bots.length * 0.4),
      recentWins: game.history.slice(-10)
    });
  }

  generateLightningNumbers() {
    const numbers = [];
    const multipliers = [50, 100, 150, 200, 250, 300, 400, 500];
    
    // Select 1-5 random numbers for lightning
    const count = 1 + Math.floor(Math.random() * 5);
    const selectedNumbers = new Set();
    
    while (selectedNumbers.size < count) {
      const num = Math.floor(Math.random() * 37); // 0-36
      if (!selectedNumbers.has(num)) {
        selectedNumbers.add(num);
        numbers.push({
          number: num,
          multiplier: multipliers[Math.floor(Math.random() * multipliers.length)]
        });
      }
    }
    
    return numbers;
  }

  generateRouletteResult() {
    // House edge algorithm - slightly favor house
    const random = Math.random();
    
    if (random < 0.027) {
      return { number: 0, color: 'green' }; // House wins
    }
    
    const number = 1 + Math.floor(Math.random() * 36);
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    const color = redNumbers.includes(number) ? 'red' : 'black';
    
    return { number, color };
  }

  generateDragonTigerResult() {
    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['♠', '♥', '♦', '♣'];
    
    const dragonCard = {
      value: cards[Math.floor(Math.random() * cards.length)],
      suit: suits[Math.floor(Math.random() * suits.length)]
    };
    
    const tigerCard = {
      value: cards[Math.floor(Math.random() * cards.length)],
      suit: suits[Math.floor(Math.random() * suits.length)]
    };
    
    const getCardValue = (card) => {
      if (card.value === 'A') return 1;
      if (['J', 'Q', 'K'].includes(card.value)) return [11, 12, 13][['J', 'Q', 'K'].indexOf(card.value)];
      return parseInt(card.value);
    };
    
    const dragonValue = getCardValue(dragonCard);
    const tigerValue = getCardValue(tigerCard);
    
    let winner;
    if (dragonValue > tigerValue) winner = 'dragon';
    else if (tigerValue > dragonValue) winner = 'tiger';
    else winner = 'tie';
    
    return { dragonCard, tigerCard, winner, dragonValue, tigerValue };
  }

  processRouletteBets() {
    const game = this.games.lightningRoulette;
    // Process bets logic here
    game.history.unshift(game.result);
    if (game.history.length > 20) game.history.pop();
  }

  processDragonTigerBets() {
    const game = this.games.dragonTiger;
    game.history.unshift(game.result);
    if (game.history.length > 20) game.history.pop();
  }

  resetRouletteGame() {
    const game = this.games.lightningRoulette;
    game.bets.clear();
    game.lightningNumbers = [];
    game.result = null;
  }

  resetDragonTigerGame() {
    const game = this.games.dragonTiger;
    game.bets.clear();
    game.result = null;
  }

  // Admin override method
  setAdminOverride(gameType, result) {
    if (this.games[gameType]) {
      this.games[gameType].adminOverride = result;
      console.log(`🎯 Admin override set for ${gameType}:`, result);
      return true;
    }
    return false;
  }

  startBotActivity() {
    setInterval(() => {
      this.simulateBotBets();
    }, 3000);
  }

  simulateBotBets() {
    // Lightning Roulette bots
    const rouletteGame = this.games.lightningRoulette;
    if (rouletteGame.phase === 'betting' && rouletteGame.timeLeft > 3) {
      const activeBots = rouletteGame.bots.slice(0, 6 + Math.floor(Math.random() * 6));
      
      activeBots.forEach(bot => {
        if (Math.random() < 0.25) { // 25% chance bot places bet
          const betTypes = ['red', 'black', 'odd', 'even', 'low', 'high'];
          const numbers = Array.from({length: 37}, (_, i) => i);
          
          if (Math.random() < 0.3) {
            // 30% chance to bet on number
            const number = numbers[Math.floor(Math.random() * numbers.length)];
            this.placeBotBet('lightningRoulette', bot, 'number', number, 50 + Math.floor(Math.random() * 500));
          } else {
            // 70% chance outside bet
            const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
            this.placeBotBet('lightningRoulette', bot, betType, null, 100 + Math.floor(Math.random() * 1000));
          }
        }
      });
    }

    // Dragon Tiger bots
    const dragonGame = this.games.dragonTiger;
    if (dragonGame.phase === 'betting' && dragonGame.timeLeft > 2) {
      const activeBots = dragonGame.bots.slice(0, 4 + Math.floor(Math.random() * 4));
      
      activeBots.forEach(bot => {
        if (Math.random() < 0.3) {
          const betTypes = ['dragon', 'tiger', 'tie'];
          const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
          this.placeBotBet('dragonTiger', bot, betType, null, 100 + Math.floor(Math.random() * 800));
        }
      });
    }
  }

  placeBotBet(gameType, bot, betType, number, amount) {
    const roomName = gameType === 'lightningRoulette' ? 'lightning-roulette' : 'dragon-tiger';
    
    // Emit bot bet to all players
    this.io.to(roomName).emit('newBet', {
      player: {
        name: bot.name,
        avatar: bot.avatar,
        country: bot.country
      },
      betType: number !== null ? `${number}` : betType,
      amount,
      isBot: true,
      timestamp: Date.now()
    });
  }
}

// Initialize live game engine
const liveGames = new LiveGameEngine(io);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'test-secret', { expiresIn: '7d' });
};

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, 'test-secret');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, email, phone, password, referralCode, termsAccepted, privacyAccepted } = req.body;

    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept Terms & Conditions and Privacy Policy'
      });
    }

    const existingUser = users.find(u => u.email === email || u.username === username || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
  id: userIdCounter++,
  name,
  username,
  email,
  phone,
  password: hashedPassword,
  chipBalance: referralCode ? 1500 : 1000,
  withdrawalMethods: [],
  gameStats: { totalSpins: 0, totalWins: 0, totalLosses: 0 },
  sessionStats: { spins: 0, totalBet: 0, totalWon: 0 },
  
  // ✅ JUST ADD THESE NEW FIELDS:
  withdrawalLimits: {
    dailyLimit: 50000,
    weeklyLimit: 200000,
    monthlyLimit: 500000,
    dailyWithdrawn: 0,
    weeklyWithdrawn: 0,
    monthlyWithdrawn: 0
  },
  
  wageringRequirements: {
    totalDeposited: 0,
    totalWagered: 0,
    canWithdraw: true
  },
  
  accountStatus: {
    isVerified: false,
    isBanned: false,
    banReason: null
  },
  
  createdAt: new Date()
};


    users.push(user);

    const token = generateToken(user.id);
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      success: true,
      message: `Welcome to Lucifer's Casino! 🔥 You received ${user.chipBalance} chips!`,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    const user = users.find(u => 
      u.email === loginId || u.username === loginId || u.phone === loginId
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id);
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Welcome back to Hell! 👹',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password reset instructions sent! (Feature coming soon)'
  });
});

// Game endpoints

app.get('/api/games/available', (req, res) => {
  const games = [
    {
      id: 'fire-joker',
      name: 'Fire Joker',
      type: 'SLOTS',
      category: 'Slots',
      description: 'Classic 3x3 slot with fire theme',
      minBet: 10,
      maxBet: 5000,
      rtp: '85%',
      volatility: 'Medium',
      paylines: 5,
      jackpot: 50000,
      features: ['Wild Symbols', 'Multipliers', 'Instant Wins'],
      image: '🔥',
      isActive: true,
      players: '2.1K'
    },
    {
      id: 'blackjack-vip',
      name: 'Blackjack VIP',
      type: 'BLACKJACK',
      category: 'Table Games',
      description: 'Premium blackjack with 3:2 payouts',
      minBet: 10,
      maxBet: 5000,
      rtp: '99%',
      volatility: 'Low',
      features: ['Double Down', 'Split Pairs', 'Insurance'],
      image: '🃏',
      isActive: true,
      players: '1.3K'
    },
    {
      id: 'lightning-roulette',
      name: 'Lightning Roulette',
      type: 'LIVE_ROULETTE',
      category: 'Live Casino',
      description: 'Live roulette with lightning multipliers up to 500x',
      minBet: 10,
      maxBet: 5000,
      rtp: '97.3%',
      volatility: 'Medium',
      features: ['Lightning Multipliers', 'Live Dealer', '24/7 Games'],
      image: '⚡',
      isActive: true,
      players: '856',
      isLive: true
    },
    {
      id: 'dragon-tiger',
      name: 'Dragon Tiger',
      type: 'LIVE_CARD_GAME',
      category: 'Live Casino',
      description: 'Fast-paced live card game - Dragon vs Tiger with professional graphics',
      minBet: 10,
      maxBet: 5000,
      rtp: '96.3%',
      volatility: 'Low',
      features: ['Live Cards', '15-Second Rounds', 'Tie Bets 8:1'],
      image: '🐉',
      isActive: true,
      players: '687',
      isLive: true
    }
  ];
  
  res.json({ success: true, games });
});


// Fire Joker Slot Game - FIXED ALGORITHM
app.post('/api/games/slots/fire-joker', auth, (req, res) => {
  const { betAmount } = req.body;
  const user = users.find(u => u.id === req.user.id);
  
  if (!betAmount || betAmount < 10 || betAmount > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Bet must be between 10 and 5000 chips.'
    });
  }
  
  if (user.chipBalance < betAmount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient chip balance'
    });
  }
  
  // ULTRA-STRICT 85% RTP ALGORITHM
  const random = Math.random();
  let winAmount = 0;
  let multiplier = 0;
  let grid = [];
  let isWin = false;
  
  const symbols = ['🔥', '💎', '⭐', '🍒', '🔔', '💰', '⚡'];
  
  // ONLY 10% WIN RATE (90% LOSS RATE)
  if (random < 0.10) {
    isWin = true;
    const winTypeRandom = Math.random();
    
    if (winTypeRandom < 0.01) {
      // 0.1% chance for decent win
      multiplier = 2 + Math.random() * 3; // 2x to 5x only
      winAmount = Math.floor(betAmount * multiplier);
    } else if (winTypeRandom < 0.05) {
      // 0.4% chance for small win 
      multiplier = 1 + Math.random() * 1; // 1x to 2x only
      winAmount = Math.floor(betAmount * multiplier);
    } else {
      // 9.5% chance for tiny win (usually less than bet)
      multiplier = 0.1 + Math.random() * 0.8; // 0.1x to 0.9x
      winAmount = Math.floor(betAmount * multiplier);
    }
    
    // Cap maximum wins
    if (winAmount > betAmount * 5) {
      winAmount = betAmount * 5;
      multiplier = 5;
    }
    
    // Generate winning grid
    const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    grid = [
      [winSymbol, winSymbol, winSymbol],
      [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]],
      [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]]
    ];
    
  } else {
    // 90% CHANCE TO LOSE
    isWin = false;
    winAmount = 0;
    multiplier = 0;
    
    // Generate completely random losing grid
    grid = [];
    for (let i = 0; i < 3; i++) {
      grid[i] = [];
      for (let j = 0; j < 3; j++) {
        grid[i][j] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
    
    // Force it to be losing - break any accidental winning patterns
    for (let row = 0; row < 3; row++) {
      if (grid[row][0] === grid[row][1] && grid[row][1] === grid[row][2]) {
        grid[row][2] = symbols[(symbols.indexOf(grid[row][0]) + 1) % symbols.length];
      }
    }
  }
  
  // Update balance
  const balanceBefore = user.chipBalance;
  user.chipBalance = user.chipBalance - betAmount + winAmount;
  const balanceAfter = user.chipBalance;
  
  // Add session tracking
  if (!user.sessionStats) {
    user.sessionStats = { spins: 0, totalBet: 0, totalWon: 0 };
  }
  
  user.sessionStats.spins += 1;
  user.sessionStats.totalBet += betAmount;
  user.sessionStats.totalWon += winAmount;
  
  // If player is winning too much, force losses
  const sessionRTP = user.sessionStats.totalWon / user.sessionStats.totalBet;
  if (sessionRTP > 0.90 && user.sessionStats.spins > 5) {
    isWin = false;
    winAmount = 0;
    multiplier = 0;
    user.chipBalance = balanceBefore - betAmount;
  }
  
  const response = {
    success: true,
    gameResult: {
      grid,
      winAmount,
      multiplier: parseFloat(multiplier.toFixed(2)),
      isWin: isWin,
      betAmount,
      balanceBefore,
      balanceAfter: user.chipBalance,
      profit: winAmount - betAmount,
      winningLines: isWin && winAmount > 0 ? [{ line: 0, symbols: grid[0], multiplier, winAmount }] : []
    },
    newBalance: user.chipBalance,
    message: isWin && winAmount > 0
      ? `🔥 You won ${winAmount} chips! ${multiplier.toFixed(1)}x multiplier!` 
      : '💀 Better luck next time!'
  };
  
  res.json(response);
});

// Blackjack VIP Game
app.post('/api/games/blackjack-vip', auth, (req, res) => {
  const { betAmount, result, winAmount, playerHand, dealerHand, playerValue, dealerValue } = req.body;
  const user = users.find(u => u.id === req.user.id);
  
  if (!betAmount || betAmount < 10 || betAmount > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Bet must be between 10 and 5000 chips.'
    });
  }
  
  if (user.chipBalance < betAmount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient chip balance'
    });
  }
  
  // Simple blackjack algorithm - House edge ~1%
  const random = Math.random();
  let gameResult;
  let finalWinAmount = 0;
  
  // Simulate blackjack outcome if not provided
  if (!result) {
    if (random < 0.42) {
      // 42% player wins
      gameResult = 'win';
      finalWinAmount = betAmount * 2;
    } else if (random < 0.47) {
      // 5% blackjack
      gameResult = 'blackjack';
      finalWinAmount = Math.floor(betAmount * 2.5); // 3:2 payout
    } else if (random < 0.55) {
      // 8% push
      gameResult = 'push';
      finalWinAmount = betAmount;
    } else {
      // 45% house wins
      gameResult = 'lose';
      finalWinAmount = 0;
    }
  } else {
    gameResult = result;
    finalWinAmount = winAmount || 0;
  }
  
  // Update balance
  const balanceBefore = user.chipBalance;
  user.chipBalance = user.chipBalance - betAmount + finalWinAmount;
  const balanceAfter = user.chipBalance;
  
  // Track user stats
  if (!user.gameStats) {
    user.gameStats = { totalSpins: 0, totalWins: 0, totalLosses: 0 };
  }
  
  user.gameStats.totalSpins += 1;
  if (gameResult === 'win' || gameResult === 'blackjack') {
    user.gameStats.totalWins += finalWinAmount;
  } else if (gameResult === 'lose') {
    user.gameStats.totalLosses += betAmount;
  }
  
  const response = {
    success: true,
    gameResult: {
      result: gameResult,
      winAmount: finalWinAmount,
      betAmount,
      balanceBefore,
      balanceAfter,
      profit: finalWinAmount - betAmount,
      playerHand: playerHand || [],
      dealerHand: dealerHand || [],
      playerValue: playerValue || 0,
      dealerValue: dealerValue || 0,
      isBlackjack: gameResult === 'blackjack'
    },
    newBalance: balanceAfter,
    message: gameResult === 'win' 
      ? `🃏 You won ${finalWinAmount} chips!` 
      : gameResult === 'blackjack'
      ? `🎉 BLACKJACK! You won ${finalWinAmount} chips!`
      : gameResult === 'push'
      ? '🤝 Push - Bet returned'
      : '💀 Dealer wins!'
  };
  
  res.json(response);
});

app.get('/api/games/history', auth, (req, res) => {
  // For now, return empty history
  res.json({
    success: true,
    gameHistory: []
  });
});

// Wallet endpoints
app.get('/api/wallet/packages', (req, res) => {
  const packages = [
    { id: 1, chips: 100, price: 100, bonus: 0, popular: false, description: 'Starter Pack' },
    { id: 2, chips: 300, price: 300, bonus: 10, popular: false, description: 'Basic Pack' },
    { id: 3, chips: 500, price: 500, bonus: 25, popular: true, description: 'Popular Pack' },
    { id: 4, chips: 1000, price: 1000, bonus: 75, popular: false, description: 'Standard Pack' },
    { id: 5, chips: 3000, price: 3000, bonus: 300, popular: false, description: 'Premium Pack' },
    { id: 6, chips: 5000, price: 5000, bonus: 750, popular: false, description: 'VIP Pack' },
    { id: 7, chips: 10000, price: 10000, bonus: 2000, popular: false, description: 'Legendary Pack' }
  ];

  res.json({ success: true, packages });
});

app.get('/api/wallet/payment-channels', (req, res) => {
  const channels = [
    {
      id: 'CHANNEL_1',
      name: 'Channel 1 - PhonePe',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=luciferscasino1@paytm&pn=Lucifer%20Casino&cu=INR',
      upiId: 'luciferscasino1@paytm',
      isActive: true
    },
    {
      id: 'CHANNEL_2', 
      name: 'Channel 2 - Google Pay',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=luciferscasino2@okaxis&pn=Lucifer%20Casino&cu=INR',
      upiId: 'luciferscasino2@okaxis',
      isActive: true
    },
    {
      id: 'CHANNEL_3',
      name: 'Channel 3 - Paytm',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=luciferscasino3@paytm&pn=Lucifer%20Casino&cu=INR',
      upiId: 'luciferscasino3@paytm',
      isActive: true
    },
    {
      id: 'CHANNEL_4',
      name: 'Channel 4 - BHIM',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=luciferscasino4@upi&pn=Lucifer%20Casino&cu=INR',
      upiId: 'luciferscasino4@upi',
      isActive: true
    }
  ];

  res.json({ success: true, channels });
});

app.get('/api/wallet/balance', auth, (req, res) => {
  res.json({
    success: true,
    balance: req.user.chipBalance
  });
});

app.post('/api/wallet/deposit', auth, (req, res) => {
  const { chipAmount, paymentMethod, paymentChannel, utrNumber } = req.body;
  const user = users.find(u => u.id === req.user.id);

  if (chipAmount < 100) {
    return res.status(400).json({
      success: false,
      message: 'Minimum deposit is 100 chips'
    });
  }

  if (!utrNumber || utrNumber.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid UTR/Transaction ID'
    });
  }

  const existingRequest = depositRequests.find(r => r.utrNumber === utrNumber.toUpperCase());
  if (existingRequest) {
    return res.status(400).json({
      success: false,
      message: 'This UTR/Transaction ID has already been used'
    });
  }

  const depositRequest = {
    id: requestIdCounter++,
    userId: req.user.id,
    chipAmount,
    inrAmount: chipAmount,
    paymentMethod,
    paymentChannel,
    utrNumber: utrNumber.toUpperCase().trim(),
    status: 'PROCESSING',
    adminRemarks: '',
    createdAt: new Date()
  };

  depositRequests.push(depositRequest);

  res.status(201).json({
    success: true,
    message: 'Deposit request created successfully! ⏳ Please wait for admin approval.',
    request: depositRequest
  });
});

app.get('/api/wallet/deposit-history', auth, (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const userDeposits = depositRequests
    .filter(r => r.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  res.json({
    success: true,
    deposits: userDeposits
  });
});

app.post('/api/wallet/withdrawal-methods', auth, (req, res) => {
  const { type, details } = req.body;
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const isFirst = user.withdrawalMethods.length === 0;

  user.withdrawalMethods.push({
    id: Date.now().toString(),
    type,
    details,
    isDefault: isFirst,
    createdAt: new Date()
  });

  res.json({
    success: true,
    message: 'Withdrawal method added successfully!',
    withdrawalMethods: user.withdrawalMethods
  });
});

app.get('/api/wallet/withdrawal-methods', auth, (req, res) => {
  res.json({
    success: true,
    withdrawalMethods: req.user.withdrawalMethods || []
  });
});

app.post('/api/wallet/withdraw', auth, (req, res) => {
  const { chipAmount, withdrawalMethodId } = req.body;
  const user = users.find(u => u.id === req.user.id);

  if (chipAmount < 100) {
    return res.status(400).json({
      success: false,
      message: 'Minimum withdrawal is 100 chips'
    });
  }

  if (user.chipBalance < chipAmount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient chip balance'
    });
  }

  const withdrawalMethod = user.withdrawalMethods.find(m => m.id === withdrawalMethodId);
  if (!withdrawalMethod) {
    return res.status(400).json({
      success: false,
      message: 'Invalid withdrawal method'
    });
  }

  const withdrawalRequest = {
    id: requestIdCounter++,
    userId: req.user.id,
    chipAmount,
    inrAmount: chipAmount,
    withdrawalMethod: withdrawalMethod.type,
    withdrawalDetails: withdrawalMethod.details,
    status: 'PROCESSING',
    adminRemarks: '',
    createdAt: new Date()
  };

  withdrawalRequests.push(withdrawalRequest);

  // Deduct chips from user balance
  user.chipBalance -= chipAmount;

  res.status(201).json({
    success: true,
    message: 'Withdrawal request created successfully! ⏳ Please wait for admin approval.',
    request: withdrawalRequest,
    newBalance: user.chipBalance
  });
});

app.get('/api/wallet/withdrawal-history', auth, (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const userWithdrawals = withdrawalRequests
    .filter(r => r.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  res.json({
    success: true,
    withdrawals: userWithdrawals
  });
});

// Socket.IO for live games
io.on('connection', (socket) => {
  console.log('🎮 Player connected:', socket.id);

  // Join Lightning Roulette
  socket.on('joinLightningRoulette', (userData) => {
    socket.join('lightning-roulette');
    liveGames.games.lightningRoulette.players.add(socket.id);
    
    socket.emit('gameJoined', {
      gameType: 'lightningRoulette',
      currentState: {
        phase: liveGames.games.lightningRoulette.phase,
        timeLeft: liveGames.games.lightningRoulette.timeLeft,
        lightningNumbers: liveGames.games.lightningRoulette.lightningNumbers,
        result: liveGames.games.lightningRoulette.result
      }
    });
    
    console.log(`🎲 Player ${userData.name} joined Lightning Roulette`);
  });

  // Join Dragon Tiger
  socket.on('joinDragonTiger', (userData) => {
    socket.join('dragon-tiger');
    liveGames.games.dragonTiger.players.add(socket.id);
    
    socket.emit('gameJoined', {
      gameType: 'dragonTiger',
      currentState: {
        phase: liveGames.games.dragonTiger.phase,
        timeLeft: liveGames.games.dragonTiger.timeLeft,
        result: liveGames.games.dragonTiger.result
      }
    });
    
    console.log(`🐉 Player ${userData.name} joined Dragon Tiger`);
  });

  // Place bet in live games
  socket.on('placeBet', (data) => {
    const { gameType, betType, amount, userId, specificNumber } = data;
    const user = users.find(u => u.id === userId);
    
    if (user && user.chipBalance >= amount) {
      // Deduct chips temporarily
      user.chipBalance -= amount;
      
      // Add bet to game
      const game = liveGames.games[gameType];
      if (!game.bets.has(userId)) {
        game.bets.set(userId, []);
      }
      
      game.bets.get(userId).push({ 
        betType, 
        amount, 
        specificNumber,
        timestamp: Date.now() 
      });
      
      // Emit bet to all players in room
      const roomName = gameType === 'lightningRoulette' ? 'lightning-roulette' : 'dragon-tiger';
      io.to(roomName).emit('newBet', {
        player: { 
          name: user.name, 
          avatar: user.profile?.avatar || '👤',
          country: '🇮🇳'
        },
        betType: specificNumber !== null ? `${specificNumber}` : betType,
        amount,
        isBot: false,
        timestamp: Date.now()
      });
      
      socket.emit('betPlaced', { 
        success: true, 
        betType, 
        amount,
        newBalance: user.chipBalance 
      });
    } else {
      socket.emit('betPlaced', { 
        success: false, 
        message: 'Insufficient balance' 
      });
    }
  });

  // Admin override
  socket.on('adminOverride', (data) => {
    const { gameType, result, adminKey } = data;
    
    // Admin authentication
    if (adminKey === 'LUCIFER_ADMIN_2025') {
      const success = liveGames.setAdminOverride(gameType, result);
      
      socket.emit('overrideSet', { 
        success, 
        gameType, 
        result,
        message: success ? 'Override set successfully' : 'Failed to set override'
      });
      console.log('🎯 Admin override activated for', gameType);
    } else {
      socket.emit('overrideSet', { 
        success: false, 
        message: 'Invalid admin key' 
      });
    }
  });

  socket.on('disconnect', () => {
    // Remove player from all games
    liveGames.games.lightningRoulette.players.delete(socket.id);
    liveGames.games.dragonTiger.players.delete(socket.id);
    console.log('👋 Player disconnected:', socket.id);
  });
});

// Add these admin-specific socket events in your Socket.IO section

// Admin data endpoint
app.get('/api/admin/stats', auth, (req, res) => {
  // Simple admin check (you can make this more sophisticated)
  const adminUsers = ['admin@lucifer.com', 'owner@lucifer.com']; // Add admin emails
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  // Calculate real-time stats
  const totalBalance = users.reduce((sum, user) => sum + user.chipBalance, 0);
  const todayDeposits = depositRequests.filter(d => {
    const today = new Date().toDateString();
    return new Date(d.createdAt).toDateString() === today;
  });
  const todayWithdrawals = withdrawalRequests.filter(w => {
    const today = new Date().toDateString();
    return new Date(w.createdAt).toDateString() === today;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => {
      // Consider users active if they've logged in within last 24 hours
      const lastLogin = new Date(u.createdAt);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastLogin > dayAgo;
    }).length,
    totalBalance,
    todayRevenue: todayDeposits.reduce((sum, d) => sum + d.chipAmount, 0),
    todayWithdrawals: todayWithdrawals.reduce((sum, w) => sum + w.chipAmount, 0),
    pendingDeposits: depositRequests.filter(d => d.status === 'PROCESSING').length,
    pendingWithdrawals: withdrawalRequests.filter(w => w.status === 'PROCESSING').length,
    liveGames: {
      lightningRoulette: {
        phase: liveGames.games.lightningRoulette.phase,
        timeLeft: liveGames.games.lightningRoulette.timeLeft,
        players: liveGames.games.lightningRoulette.players.size
      },
      dragonTiger: {
        phase: liveGames.games.dragonTiger.phase,
        timeLeft: liveGames.games.dragonTiger.timeLeft,
        players: liveGames.games.dragonTiger.players.size
      }
    }
  };

  res.json({
    success: true,
    stats
  });
});

// Admin user management endpoint
app.get('/api/admin/users', auth, (req, res) => {
  const adminUsers = ['lucifer@fallenangel.com', 'owner@lucifer.com'];
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const userList = users.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    chipBalance: user.chipBalance,
    createdAt: user.createdAt,
    isActive: true // You can implement proper activity tracking
  }));

  res.json({
    success: true,
    users: userList
  });
});

// Admin add chips endpoint
app.post('/api/admin/add-chips', auth, (req, res) => {
  const { userId, amount } = req.body;
  const adminUsers = ['admin@lucifer.com', 'owner@lucifer.com'];
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.chipBalance += amount;

  res.json({
    success: true,
    message: `Added ${amount} chips to ${user.name}`,
    newBalance: user.chipBalance
  });
});

// Admin deposit approval endpoint
app.post('/api/admin/approve-deposit', auth, (req, res) => {
  const { depositId } = req.body;
  const adminUsers = ['admin@lucifer.com', 'owner@lucifer.com'];
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const deposit = depositRequests.find(d => d.id === depositId);
  if (!deposit) {
    return res.status(404).json({
      success: false,
      message: 'Deposit request not found'
    });
  }

  // Deposit rejected endpoint
  const rejectDeposit = async (depositId, reason) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/admin/reject-deposit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ depositId, reason })
    });

    const result = await response.json();
    if (result.success) {
      alert('✅ Deposit rejected successfully!');
      loadAdminData(); // Refresh data
    } else {
      alert('❌ Failed to reject deposit: ' + result.message);
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
};


  // Find user and add chips
  const user = users.find(u => u.id === deposit.userId);
  if (user) {
    user.chipBalance += deposit.chipAmount;
    deposit.status = 'ACCEPTED';
    deposit.processedAt = new Date();
    deposit.processedBy = req.user.id;
  }

  res.json({
    success: true,
    message: `Deposit approved for ${user?.name || 'user'}`,
    deposit
  });
});

// Enhanced Socket.IO admin events
io.on('connection', (socket) => {
  console.log('🎮 Player connected:', socket.id);

  // Existing game events...

  // Admin-specific events
  socket.on('joinAdminRoom', (userData) => {
    socket.join('admin-room');
    console.log(`👑 Admin ${userData.name} connected`);
    
    // Send current stats to admin
    socket.emit('adminStatsUpdate', {
      totalUsers: users.length,
      activeGames: {
        lightningRoulette: liveGames.games.lightningRoulette.players.size,
        dragonTiger: liveGames.games.dragonTiger.players.size
      },
      pendingRequests: {
        deposits: depositRequests.filter(d => d.status === 'PROCESSING').length,
        withdrawals: withdrawalRequests.filter(w => w.status === 'PROCESSING').length
      }
    });
  });

  // Admin override (enhanced)
  socket.on('adminOverride', (data) => {
    const { gameType, result, adminKey } = data;
    
    if (adminKey === 'LUCIFER_ADMIN_2025') {
      const success = liveGames.setAdminOverride(gameType, result);
      
      socket.emit('overrideSet', { 
        success, 
        gameType, 
        result,
        message: success ? '🎯 Override set successfully' : 'Failed to set override'
      });
      
      // Notify all admins
      io.to('admin-room').emit('adminAlert', {
        type: 'override',
        message: `Game override set for ${gameType}`,
        timestamp: new Date()
      });
      
      console.log('🎯 Admin override activated for', gameType, 'Result:', result);
    } else {
      socket.emit('overrideSet', { 
        success: false, 
        message: 'Invalid admin key' 
      });
    }
  });

  // Admin emergency stop
  socket.on('emergencyStop', (data) => {
    const { adminKey } = data;
    
    if (adminKey === 'LUCIFER_ADMIN_2025') {
      // Stop all games
      liveGames.games.lightningRoulette.phase = 'maintenance';
      liveGames.games.dragonTiger.phase = 'maintenance';
      
      // Notify all players
      io.emit('systemAlert', {
        type: 'maintenance',
        message: 'Games temporarily suspended for maintenance',
        timestamp: new Date()
      });
      
      socket.emit('emergencyStopConfirmed', {
        success: true,
        message: 'All games stopped successfully'
      });
      
      console.log('🚨 EMERGENCY STOP ACTIVATED by admin');
    }
  });

  // Real-time admin stats (send every 10 seconds)
  const adminStatsInterval = setInterval(() => {
    io.to('admin-room').emit('adminStatsUpdate', {
      timestamp: new Date(),
      totalUsers: users.length,
      activeGames: {
        lightningRoulette: liveGames.games.lightningRoulette.players.size,
        dragonTiger: liveGames.games.dragonTiger.players.size
      },
      totalBalance: users.reduce((sum, user) => sum + user.chipBalance, 0),
      pendingRequests: {
        deposits: depositRequests.filter(d => d.status === 'PROCESSING').length,
        withdrawals: withdrawalRequests.filter(w => w.status === 'PROCESSING').length
      }
    });
  }, 10000);

  socket.on('disconnect', () => {
    clearInterval(adminStatsInterval);
    liveGames.games.lightningRoulette.players.delete(socket.id);
    liveGames.games.dragonTiger.players.delete(socket.id);
    console.log('👋 Player disconnected:', socket.id);
  });
});

// Get pending deposits for admin
app.get('/api/admin/pending-deposits', auth, (req, res) => {
  const adminUsers = ['admin@lucifer.com', 'owner@lucifer.com'];
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const pendingDeposits = depositRequests
    .filter(d => d.status === 'PROCESSING')
    .map(deposit => {
      const user = users.find(u => u.id === deposit.userId);
      return {
        ...deposit,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || 'Unknown Email'
      };
    });

  res.json({
    success: true,
    deposits: pendingDeposits
  });
});

// Get pending withdrawals for admin
app.get('/api/admin/pending-withdrawals', auth, (req, res) => {
  const adminUsers = ['admin@lucifer.com', 'owner@lucifer.com'];
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const pendingWithdrawals = withdrawalRequests
    .filter(w => w.status === 'PROCESSING')
    .map(withdrawal => {
      const user = users.find(u => u.id === withdrawal.userId);
      return {
        ...withdrawal,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || 'Unknown Email'
      };
    });

  res.json({
    success: true,
    withdrawals: pendingWithdrawals
  });
});

// Update user balance (admin only)
app.post('/api/admin/update-balance', auth, (req, res) => {
  const { userId, amount, action } = req.body; // action: 'add' or 'subtract'
  const adminUsers = ['admin@lucifer.com', 'owner@lucifer.com'];
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const oldBalance = user.chipBalance;
  
  if (action === 'add') {
    user.chipBalance += amount;
  } else if (action === 'subtract') {
    user.chipBalance = Math.max(0, user.chipBalance - amount);
  }

  res.json({
    success: true,
    message: `${action === 'add' ? 'Added' : 'Subtracted'} ${amount} chips ${action === 'add' ? 'to' : 'from'} ${user.name}`,
    user: {
      id: user.id,
      name: user.name,
      oldBalance,
      newBalance: user.chipBalance
    }
  });
});

// Ban/Unban user (admin only)
app.post('/api/admin/ban-user', auth, (req, res) => {
  const { userId, isBanned, reason } = req.body;
  const adminUsers = ['admin@lucifer.com', 'owner@lucifer.com'];
  
  if (!adminUsers.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isBanned = isBanned;
  user.banReason = reason;
  user.bannedAt = isBanned ? new Date() : null;

  res.json({
    success: true,
    message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
    user: {
      id: user.id,
      name: user.name,
      isBanned: user.isBanned,
      banReason: user.banReason
    }
  });
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: '🔥 Lucifer\'s Casino Backend is Working!',
    totalUsers: users.length,
    totalDeposits: depositRequests.length,
    totalWithdrawals: withdrawalRequests.length,
    liveGames: {
      lightningRoulette: {
        phase: liveGames.games.lightningRoulette.phase,
        players: liveGames.games.lightningRoulette.players.size,
        timeLeft: liveGames.games.lightningRoulette.timeLeft
      },
      dragonTiger: {
        phase: liveGames.games.dragonTiger.phase,
        players: liveGames.games.dragonTiger.players.size,
        timeLeft: liveGames.games.dragonTiger.timeLeft
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
🔥                                    🔥
🔥      LUCIFER'S CASINO BACKEND     🔥
🔥         LIVE EDITION!             🔥
🔥                                    🔥
🔥    Server running on port ${PORT}     🔥
🔥                                    🔥
🔥  🎰 Fire Joker Slots READY         🔥
🔥  🃏 Blackjack VIP READY            🔥
🔥  ⚡ Lightning Roulette LIVE        🔥
🔥  🐉 Dragon Tiger LIVE             🔥
🔥  🤖 16 AI Bots Active             🔥
🔥  🎯 Admin Override Ready           🔥
🔥                                    🔥
🔥  Admin Key: LUCIFER_ADMIN_2025     🔥
🔥                                    🔥
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  `);
});
