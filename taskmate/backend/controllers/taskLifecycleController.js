const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Tasker marks the assigned work as done, awaiting poster confirmation
// @route   PUT /api/tasks/:id/request-completion
// @access  Private (assigned tasker)
const requestCompletion = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the assigned tasker can request completion');
  }
  if (!['assigned', 'in_progress'].includes(task.status)) {
    res.status(400);
    throw new Error('This task is not in a state that can be marked complete');
  }

  task.status = 'in_progress';
  task.completionRequested = true;
  await task.save();

  res.json({ success: true, task });
});

// @desc    Poster confirms the work is done — releases escrow to the tasker
// @route   PUT /api/tasks/:id/confirm-completion
// @access  Private (task owner)
const confirmCompletion = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the task owner can confirm completion');
  }
  if (!task.completionRequested) {
    res.status(400);
    throw new Error('The tasker has not requested completion yet');
  }

  const poster = await User.findById(task.postedBy);
  const tasker = await User.findById(task.assignedTo);

  const Bid = require('../models/Bid');
  const acceptedBid = await Bid.findById(task.acceptedBid);
  const amount = acceptedBid ? acceptedBid.amount : task.budget;

  poster.escrowHeld = Math.max(0, poster.escrowHeld - amount);
  await poster.save();

  tasker.walletBalance += amount;
  tasker.stats = tasker.stats || {};
  tasker.stats.tasksCompleted = (tasker.stats.tasksCompleted || 0) + 1;
  await tasker.save();

  await Transaction.create({
    task: task._id,
    from: poster._id,
    to: tasker._id,
    amount,
    type: 'escrow_release',
    note: `Payment released for "${task.title}"`,
  });

  task.status = 'completed';
  await task.save();

  res.json({ success: true, task, message: 'Task marked complete and payment released' });
});

module.exports = { requestCompletion, confirmCompletion };
