const express = require('express');
const router = express.Router();
const {
  getMyBids,
  acceptBid,
  rejectBid,
  withdrawBid,
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

router.get('/mine', protect, getMyBids);
router.put('/:id/accept', protect, acceptBid);
router.put('/:id/reject', protect, rejectBid);
router.delete('/:id', protect, withdrawBid);

module.exports = router;
