const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Task = require('../models/Task');
const Transaction = require('../models/Transaction');

// @desc    Platform-wide stats for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const [userCount, taskCounts, txCount] = await Promise.all([
    User.countDocuments(),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Transaction.countDocuments(),
  ]);

  const tasksByStatus = taskCounts.reduce((acc, t) => {
    acc[t._id] = t.count;
    return acc;
  }, {});

  res.json({
    success: true,
    stats: {
      userCount,
      tasksByStatus,
      transactionCount: txCount,
    },
  });
});

// @desc    List all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, search } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Ban or unban a user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isBanned = !user.isBanned;
  await user.save();
  res.json({ success: true, user });
});

// @desc    Verify a user (badge)
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const toggleVerifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isVerified = !user.isVerified;
  await user.save();
  res.json({ success: true, user });
});

// @desc    List all tasks (paginated, filterable by status — useful for disputes)
// @route   GET /api/admin/tasks
// @access  Private/Admin
const listTasksAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('postedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Task.countDocuments(query),
  ]);

  res.json({
    success: true,
    tasks,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Admin override: force a task's status (dispute resolution)
// @route   PUT /api/admin/tasks/:id/status
// @access  Private/Admin
const setTaskStatusAdmin = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'];
  if (!valid.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${valid.join(', ')}`);
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.status = status;
  await task.save();
  res.json({ success: true, task });
});

module.exports = {
  getStats,
  listUsers,
  toggleBanUser,
  toggleVerifyUser,
  listTasksAdmin,
  setTaskStatusAdmin,
};
