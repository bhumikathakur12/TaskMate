const express = require('express');
const router = express.Router();
const {
  getStats,
  listUsers,
  toggleBanUser,
  toggleVerifyUser,
  listTasksAdmin,
  setTaskStatusAdmin,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/verify', toggleVerifyUser);
router.get('/tasks', listTasksAdmin);
router.put('/tasks/:id/status', setTaskStatusAdmin);

module.exports = router;
