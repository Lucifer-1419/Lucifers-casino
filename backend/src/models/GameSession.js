const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['SLOTS', 'BLACKJACK', 'ROULETTE', 'DRAGON_TIGER'],
    required: true
  },
  gameName: {
    type: String,
    required: true // 'Fire Joker', 'Lightning Roulette', etc.
  },
  betAmount: {
    type: Number,
    required: true,
    min: 1
  },
  winAmount: {
    type: Number,
    default: 0
  },
  outcome: {
    type: mongoose.Schema.Types.Mixed, // Game-specific outcome data
    required: true
  },
  isWin: {
    type: Boolean,
    default: false
  },
  multiplier: {
    type: Number,
    default: 0
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  sessionDuration: {
    type: Number, // in milliseconds
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
gameSessionSchema.index({ userId: 1, createdAt: -1 });
gameSessionSchema.index({ gameType: 1, createdAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);
