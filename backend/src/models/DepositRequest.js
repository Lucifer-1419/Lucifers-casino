const mongoose = require('mongoose');

const depositRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chipAmount: {
    type: Number,
    required: true,
    min: [100, 'Minimum deposit is 100 chips']
  },
  inrAmount: {
    type: Number,
    required: true // chipAmount = inrAmount (1 CHIP = 1 INR)
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'E_WALLET'],
    required: true
  },
  paymentChannel: {
    type: String,
    enum: ['CHANNEL_1', 'CHANNEL_2', 'CHANNEL_3', 'CHANNEL_4'],
    required: true
  },
  utrNumber: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['PROCESSING', 'ACCEPTED', 'REJECTED'],
    default: 'PROCESSING'
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('DepositRequest', depositRequestSchema);
