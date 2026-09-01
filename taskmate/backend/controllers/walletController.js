const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get wallet balance + escrow held
// @route   GET /api/wallet
// @access  Private
const getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    wallet: {
      balance: user.walletBalance,
      escrowHeld: user.escrowHeld,
    },
  });
});

// @desc    Add mock funds to wallet (no real payment processor involved)
// @route   POST /api/wallet/topup
// @access  Private
const topUpWallet = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    res.status(400);
    throw new Error('Please provide a positive amount');
  }
  if (numericAmount > 100000) {
    res.status(400);
    throw new Error('Mock top-ups are capped at \u20b91,00,000 at a time');
  }

  const user = await User.findById(req.user._id);
  user.walletBalance += numericAmount;
  await user.save();

  await Transaction.create({
    to: user._id,
    amount: numericAmount,
    type: 'topup',
    note: 'Mock wallet top-up',
  });

  res.json({
    success: true,
    wallet: { balance: user.walletBalance, escrowHeld: user.escrowHeld },
  });
});

// @desc    Get transaction history for the logged-in user
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    $or: [{ from: req.user._id }, { to: req.user._id }],
  })
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ success: true, transactions });
});

module.exports = { getWallet, topUpWallet, getTransactions };
