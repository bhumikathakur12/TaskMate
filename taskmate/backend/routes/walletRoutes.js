const express = require('express');
const router = express.Router();
const { getWallet, topUpWallet, getTransactions } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWallet);
router.post('/topup', protect, topUpWallet);
router.get('/transactions', protect, getTransactions);

module.exports = router;
