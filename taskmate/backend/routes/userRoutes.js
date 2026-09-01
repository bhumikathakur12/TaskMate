const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  updateAvatar,
  switchMode,
} = require('../controllers/userController');
const { getReviewsForUser } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/me', protect, updateProfile);
router.put('/me/avatar', protect, upload.single('avatar'), updateAvatar);
router.put('/me/mode', protect, switchMode);
router.get('/:id/reviews', getReviewsForUser);
router.get('/:id', getUserProfile);

module.exports = router;
