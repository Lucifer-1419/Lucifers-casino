const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscore']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number with +91']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  referralCode: {
    type: String,
    default: null
  },
  myReferralCode: {
    type: String,
    unique: true
  },
  chipBalance: {
    type: Number,
    default: 1000, // Starting bonus chips
    min: [0, 'Chip balance cannot be negative']
  },
  profile: {
    avatar: { type: String, default: '👤' },
    dateOfBirth: Date,
    address: String,
    bio: String
  },
  vipLevel: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum'],
    default: 'Bronze'
  },
  withdrawalMethods: [{
    type: {
      type: String,
      enum: ['UPI', 'BANK_TRANSFER', 'E_WALLET'],
      required: true
    },
    details: {
      // For UPI
      upiId: String,
      // For Bank Transfer
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String,
      // For E-Wallet
      walletType: String, // Paytm, PhonePe, etc.
      walletNumber: String
    },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  statistics: {
    totalGamesPlayed: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 },
    biggestWin: { type: Number, default: 0 },
    favoriteGame: String,
    lastLoginDate: Date,
    registrationDate: { type: Date, default: Date.now }
  },
  settings: {
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  termsAccepted: { type: Boolean, required: true },
  privacyAccepted: { type: Boolean, required: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, {
  timestamps: true
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (!this.myReferralCode) {
    this.myReferralCode = this.username.toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
