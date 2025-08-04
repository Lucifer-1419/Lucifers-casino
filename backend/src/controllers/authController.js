const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      username, 
      email, 
      phone, 
      password, 
      referralCode,
      termsAccepted,
      privacyAccepted 
    } = req.body;

    // Validate terms and privacy acceptance
    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept Terms & Conditions and Privacy Policy'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existingUser) {
      let field = 'email';
      if (existingUser.username === username) field = 'username';
      if (existingUser.phone === phone) field = 'phone number';
      
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${field}`
      });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ myReferralCode: referralCode });
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referral code'
        });
      }
    }

    // Create new user
    const user = new User({
      name,
      username,
      email,
      phone,
      password,
      referralCode,
      termsAccepted,
      privacyAccepted,
      chipBalance: referralCode ? 1500 : 1000 // Bonus for referral
    });

    await user.save();

    // If referred, give bonus to referrer
    if (referrer) {
      referrer.chipBalance += 500; // Referral bonus
      await referrer.save();
    }

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

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
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { loginId, password } = req.body; // loginId can be email, username, or phone

    // Find user by email, username, or phone
    const user = await User.findOne({
      $or: [
        { email: loginId },
        { username: loginId },
        { phone: loginId }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.statistics.lastLoginDate = new Date();
    await user.save();

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

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
};

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body; // email, username, or phone

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this information'
      });
    }

    // TODO: Implement OTP system later
    // For now, just acknowledge the request
    res.json({
      success: true,
      message: 'Password reset instructions sent! (Feature coming soon)',
      userExists: true
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
