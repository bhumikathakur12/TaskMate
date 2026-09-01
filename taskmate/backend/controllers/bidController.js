const asyncHandler = require('express-async-handler');
const Bid = require('../models/Bid');
const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Place a bid on a task
// @route   POST /api/tasks/:taskId/bids
// @access  Private
const createBid = asyncHandler(async (req, res) => {
  const { amount, message } = req.body;
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.status !== 'open') {
    res.status(400);
    throw new Error('This task is no longer accepting offers');
  }
  if (task.postedBy.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot bid on your own task');
  }

  const existing = await Bid.findOne({ task: task._id, tasker: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You already placed an offer on this task — edit or withdraw it instead');
  }

  const bid = await Bid.create({
    task: task._id,
    tasker: req.user._id,
    amount,
    message,
  });

  task.bidCount = (task.bidCount || 0) + 1;
  await task.save();

  const populated = await bid.populate('tasker', 'name avatar rating isVerified');
  res.status(201).json({ success: true, bid: populated });
});

// @desc    Get all bids for a task (owner only)
// @route   GET /api/tasks/:taskId/bids
// @access  Private (task owner)
const getBidsForTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the task owner can view offers');
  }

  const bids = await Bid.find({ task: task._id })
    .populate('tasker', 'name avatar rating isVerified')
    .sort({ createdAt: -1 });

  res.json({ success: true, bids });
});

// @desc    Get bids the logged-in user has placed
// @route   GET /api/bids/mine
// @access  Private
const getMyBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ tasker: req.user._id })
    .populate('task', 'title status budget deadline category')
    .sort({ createdAt: -1 });
  res.json({ success: true, bids });
});

// @desc    Accept a bid — assigns the task and holds the amount in escrow
// @route   PUT /api/bids/:id/accept
// @access  Private (task owner)
const acceptBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);
  if (!bid) {
    res.status(404);
    throw new Error('Offer not found');
  }

  const task = await Task.findById(bid.task);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the task owner can accept an offer');
  }
  if (task.status !== 'open') {
    res.status(400);
    throw new Error('This task is no longer open');
  }

  const poster = await User.findById(task.postedBy);
  if (poster.walletBalance < bid.amount) {
    res.status(400);
    throw new Error(
      `Insufficient wallet balance to hold ${bid.amount} in escrow. Top up your wallet first.`
    );
  }

  // Hold funds in escrow
  poster.walletBalance -= bid.amount;
  poster.escrowHeld += bid.amount;
  await poster.save();

  await Transaction.create({
    task: task._id,
    from: poster._id,
    to: poster._id, // still "owned" by poster, just locked, until release
    amount: bid.amount,
    type: 'escrow_hold',
    note: `Escrow held for "${task.title}"`,
  });

  task.status = 'assigned';
  task.assignedTo = bid.tasker;
  task.acceptedBid = bid._id;
  await task.save();

  bid.status = 'accepted';
  await bid.save();

  await Bid.updateMany(
    { task: task._id, _id: { $ne: bid._id }, status: 'pending' },
    { status: 'rejected' }
  );

  const populatedTask = await Task.findById(task._id)
    .populate('postedBy', 'name avatar rating')
    .populate('assignedTo', 'name avatar rating');

  res.json({ success: true, task: populatedTask, bid });
});

// @desc    Reject a single bid
// @route   PUT /api/bids/:id/reject
// @access  Private (task owner)
const rejectBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);
  if (!bid) {
    res.status(404);
    throw new Error('Offer not found');
  }
  const task = await Task.findById(bid.task);
  if (!task || task.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the task owner can reject an offer');
  }

  bid.status = 'rejected';
  await bid.save();
  res.json({ success: true, bid });
});

// @desc    Withdraw your own pending bid
// @route   DELETE /api/bids/:id
// @access  Private (bidder)
const withdrawBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);
  if (!bid) {
    res.status(404);
    throw new Error('Offer not found');
  }
  if (bid.tasker.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only withdraw your own offers');
  }
  if (bid.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending offers can be withdrawn');
  }

  bid.status = 'withdrawn';
  await bid.save();

  await Task.findByIdAndUpdate(bid.task, { $inc: { bidCount: -1 } });

  res.json({ success: true, message: 'Offer withdrawn' });
});

module.exports = {
  createBid,
  getBidsForTask,
  getMyBids,
  acceptBid,
  rejectBid,
  withdrawBid,
};
