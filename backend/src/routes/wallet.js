const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const walletController = require('../controllers/walletController');
const { auth } = require('../middleware/auth');

// All wallet routes require authentication
router.use(auth);

// Validation middleware
const depositValidation = [
  body('chipAmount').isInt({ min: 100 }).withMessage('Minimum deposit is 100 chips'),
  body('paymentMethod').isIn(['UPI', 'E_WALLET']).withMessage('Invalid payment method'),
  body('paymentChannel').isIn(['CHANNEL_1', 'CHANNEL_2', 'CHANNEL_3', 'CHANNEL_4']).withMessage('Invalid payment channel'),
  body('utrNumber').isLength({ min: 10 }).withMessage('UTR number must be at least 10 characters')
];

const withdrawalMethodValidation = [
  body('type').isIn(['UPI', 'BANK_TRANSFER', 'E_WALLET']).withMessage('Invalid withdrawal method type')
];

const withdrawalValidation = [
  body('chipAmount').isInt({ min: 100 }).withMessage('Minimum withdrawal is 100 chips'),
  body('withdrawalMethodId').notEmpty().withMessage('Withdrawal method is required')
];

// Routes
router.get('/packages', walletController.getChipPackages);
router.get('/payment-channels', walletController.getPaymentChannels);
router.get('/balance', walletController.getBalance);

// Deposit routes
router.post('/deposit', depositValidation, walletController.createDepositRequest);
router.get('/deposit-history', walletController.getDepositHistory);

// Withdrawal routes
router.get('/withdrawal-methods', walletController.getWithdrawalMethods);
router.post('/withdrawal-methods', withdrawalMethodValidation, walletController.addWithdrawalMethod);
router.post('/withdraw', withdrawalValidation, walletController.createWithdrawalRequest);
router.get('/withdrawal-history', walletController.getWithdrawalHistory);

module.exports = router;
