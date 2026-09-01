const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Leave a review for the other party on a completed task
// @route   POST /api/tasks/:taskId/reviews
// @access  Private (poster or assigned tasker on that task)
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review completed tasks');
  }

  const isPoster = task.postedBy.toString() === req.user._id.toString();
  const isTasker = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isPoster && !isTasker) {
    res.status(403);
    throw new Error('Only the poster or the assigned tasker can review this task');
  }

  const revieweeId = isPoster ? task.assignedTo : task.postedBy;

  const existing = await Review.findOne({ task: task._id, reviewer: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You already reviewed this task');
  }

  const review = await Review.create({
    task: task._id,
    reviewer: req.user._id,
    reviewee: revieweeId,
    rating,
    comment,
  });

  // Recalculate the reviewee's aggregate rating
  const reviewee = await User.findById(revieweeId);
  const newCount = reviewee.rating.count + 1;
  const newAverage =
    (reviewee.rating.average * reviewee.rating.count + rating) / newCount;

  reviewee.rating.count = newCount;
  reviewee.rating.average = Math.round(newAverage * 10) / 10;
  await reviewee.save();

  res.status(201).json({ success: true, review });
});

// @desc    Get all reviews written about a user
// @route   GET /api/users/:id/reviews
// @access  Public
const getReviewsForUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.id })
    .populate('reviewer', 'name avatar')
    .populate('task', 'title')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

module.exports = { createReview, getReviewsForUser };
