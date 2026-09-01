const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { createBid, getBidsForTask } = require('../controllers/bidController');
const { requestCompletion, confirmCompletion } = require('../controllers/taskLifecycleController');
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
  .route('/')
  .get(getTasks)
  .post(protect, upload.array('photos', 5), createTask);

router.get('/mine', protect, getMyTasks);

router
  .route('/:id')
  .get(getTaskById)
  .put(protect, upload.array('photos', 5), updateTask)
  .delete(protect, deleteTask);

router.post('/:taskId/bids', protect, createBid);
router.get('/:taskId/bids', protect, getBidsForTask);

router.put('/:id/request-completion', protect, requestCompletion);
router.put('/:id/confirm-completion', protect, confirmCompletion);

router.post('/:taskId/reviews', protect, createReview);

module.exports = router;
