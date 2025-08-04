const mongoose = require('mongoose');

const withdrawRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chipAmount: {
    type: Number,
    required: true,
    min: [100, 'Minimum withdrawal is 100 chips']
  },
  inrAmount: {
    type: Number,
    required: true
  },
  withdrawalMethod: {
    type: String,
    enum: ['UPI', 'BANK_TRANSFER', 'E_WALLET'],
    required: true
  },
  withdrawalDetails: {
    // For UPI
    upiId: String,
    // For Bank Transfer
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String,
    // For E-Wallet
    walletType: String,
    walletNumber: String
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

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);
