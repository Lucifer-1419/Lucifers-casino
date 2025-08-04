const User = require('../models/User');
const DepositRequest = require('../models/DepositRequest');
const WithdrawRequest = require('../models/WithdrawRequest');

// Get chip packages
exports.getChipPackages = (req, res) => {
  const packages = [
    { id: 1, chips: 100, price: 100, bonus: 0, popular: false },
    { id: 2, chips: 300, price: 300, bonus: 10, popular: false },
    { id: 3, chips: 500, price: 500, bonus: 25, popular: true },
    { id: 4, chips: 1000, price: 1000, bonus: 75, popular: false },
    { id: 5, chips: 3000, price: 3000, bonus: 300, popular: false },
    { id: 6, chips: 5000, price: 5000, bonus: 750, popular: false },
    { id: 7, chips: 10000, price: 10000, bonus: 2000, popular: false }
  ];

  res.json({
    success: true,
    packages
  });
};

// Get payment channels
exports.getPaymentChannels = (req, res) => {
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

  res.json({
    success: true,
    channels
  });
};

// Create deposit request
exports.createDepositRequest = async (req, res) => {
  try {
    const { chipAmount, paymentMethod, paymentChannel, utrNumber } = req.body;
    const userId = req.user._id;

    // Validation
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

    // Check if UTR already exists
    const existingRequest = await DepositRequest.findOne({ utrNumber });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'This UTR/Transaction ID has already been used'
      });
    }

    // Create deposit request
    const depositRequest = new DepositRequest({
      userId,
      chipAmount,
      inrAmount: chipAmount, // 1 CHIP = 1 INR
      paymentMethod,
      paymentChannel,
      utrNumber: utrNumber.toUpperCase().trim()
    });

    await depositRequest.save();

    res.status(201).json({
      success: true,
      message: 'Deposit request created successfully! ⏳ Please wait for admin approval.',
      request: depositRequest
    });

  } catch (error) {
    console.error('Create deposit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating deposit request'
    });
  }
};

// Get user's deposit history
exports.getDepositHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = req.query.limit || 5;

    const deposits = await DepositRequest.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('processedBy', 'username');

    res.json({
      success: true,
      deposits
    });

  } catch (error) {
    console.error('Get deposit history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching deposit history'
    });
  }
};

// Add withdrawal method
exports.addWithdrawalMethod = async (req, res) => {
  try {
    const { type, details } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is the first withdrawal method, make it default
    const isFirst = user.withdrawalMethods.length === 0;

    // Add withdrawal method
    user.withdrawalMethods.push({
      type,
      details,
      isDefault: isFirst
    });

    await user.save();

    res.json({
      success: true,
      message: 'Withdrawal method added successfully!',
      withdrawalMethods: user.withdrawalMethods
    });

  } catch (error) {
    console.error('Add withdrawal method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding withdrawal method'
    });
  }
};

// Get user's withdrawal methods
exports.getWithdrawalMethods = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('withdrawalMethods');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      withdrawalMethods: user.withdrawalMethods
    });

  } catch (error) {
    console.error('Get withdrawal methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching withdrawal methods'
    });
  }
};

// Create withdrawal request
exports.createWithdrawalRequest = async (req, res) => {
  try {
    const { chipAmount, withdrawalMethodId } = req.body;
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validation
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

    // Get withdrawal method
    const withdrawalMethod = user.withdrawalMethods.id(withdrawalMethodId);
    if (!withdrawalMethod) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal method'
      });
    }

    // Create withdrawal request
    const withdrawalRequest = new WithdrawRequest({
      userId,
      chipAmount,
      inrAmount: chipAmount, // 1 CHIP = 1 INR
      withdrawalMethod: withdrawalMethod.type,
      withdrawalDetails: withdrawalMethod.details
    });

    await withdrawalRequest.save();

    // Deduct chips from user balance (will be restored if rejected)
    user.chipBalance -= chipAmount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully! ⏳ Please wait for admin approval.',
      request: withdrawalRequest,
      newBalance: user.chipBalance
    });

  } catch (error) {
    console.error('Create withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating withdrawal request'
    });
  }
};

// Get user's withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = req.query.limit || 5;

    const withdrawals = await WithdrawRequest.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('processedBy', 'username');

    res.json({
      success: true,
      withdrawals
    });

  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching withdrawal history'
    });
  }
};

// Get user's current balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('chipBalance');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      balance: user.chipBalance
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching balance'
    });
  }
};
