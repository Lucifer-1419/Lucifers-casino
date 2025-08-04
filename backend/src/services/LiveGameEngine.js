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
          this.clearAllBets('lightningRoulette');
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
      totalPlayers: game.players.size + Math.floor(game.bots.length * 0.6), // Show 60% of bots as active
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
    // House edge algorithm
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

  clearAllBets(gameType) {
    this.games[gameType].bets.clear();
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
    const game = this.games[gameType];
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

module.exports = LiveGameEngine;
