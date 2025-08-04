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
        bots: this.generateBots()
      },
      dragonTiger: {
        phase: 'betting',
        timeLeft: 15,
        bets: new Map(),
        result: null,
        history: [],
        players: new Set(),
        bots: this.generateBots()
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
    // Lightning Roulette - 35 second cycles
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
          if (!game.adminOverride) {
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
      totalPlayers: game.players.size + game.bots.length,
      recentWins: game.history.slice(-5)
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

  // Admin override method
  setAdminOverride(gameType, result) {
    if (this.games[gameType]) {
      this.games[gameType].adminOverride = result;
      console.log(`🎯 Admin override set for ${gameType}:`, result);
    }
  }

  startBotActivity() {
    setInterval(() => {
      this.simulateBotBets();
    }, 2000);
  }

  simulateBotBets() {
    const rouletteGame = this.games.lightningRoulette;
    
    if (rouletteGame.phase === 'betting' && rouletteGame.timeLeft > 5) {
      const activeBots = rouletteGame.bots.slice(0, 8 + Math.floor(Math.random() * 8));
      
      activeBots.forEach(bot => {
        if (Math.random() < 0.3) { // 30% chance bot places bet
          const betTypes = ['number', 'red', 'black', 'odd', 'even', 'low', 'high'];
          const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
          const amount = 50 + Math.floor(Math.random() * 500);
          
          this.placeBotBet('lightningRoulette', bot.id, betType, amount);
        }
      });
    }
  }

  placeBotBet(gameType, botId, betType, amount) {
    const game = this.games[gameType];
    if (!game.bets.has(botId)) {
      game.bets.set(botId, []);
    }
    
    game.bets.get(botId).push({ betType, amount, timestamp: Date.now() });
    
    // Emit bot bet to all players
    const bot = game.bots.find(b => b.id === botId);
    this.io.to(gameType).emit('newBet', {
      player: bot,
      betType,
      amount,
      isBot: true
    });
  }
}

module.exports = LiveGameEngine;
