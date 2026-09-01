const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const { CATEGORIES } = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, budget, budgetType, deadline } = req.body;

  // location arrives as JSON string when sent via multipart/form-data
  let location = req.body.location;
  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
    } catch {
      res.status(400);
      throw new Error('Location must be valid JSON: { coordinates: [lng, lat], address }');
    }
  }

  if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    res.status(400);
    throw new Error('Please provide a location with [longitude, latitude]');
  }

  const photos = (req.files || []).map((f) => `/uploads/${f.filename}`);

  const task = await Task.create({
    title,
    description,
    category,
    budget,
    budgetType,
    deadline,
    photos,
    location: {
      type: 'Point',
      coordinates: location.coordinates,
      address: location.address || '',
    },
    postedBy: req.user._id,
  });

  req.user.stats = req.user.stats || {};
  req.user.stats.tasksPosted = (req.user.stats.tasksPosted || 0) + 1;
  await req.user.save();

  const populated = await task.populate('postedBy', 'name avatar rating');
  res.status(201).json({ success: true, task: populated });
});

// @desc    Browse tasks with filters, search, geo, sorting
// @route   GET /api/tasks
// @access  Public
const getTasks = asyncHandler(async (req, res) => {
  const {
    category,
    minBudget,
    maxBudget,
    search,
    status,
    lat,
    lng,
    maxDistanceKm,
    sort,
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  query.status = status && status !== 'all' ? status : 'open';

  if (category && CATEGORIES.includes(category)) {
    query.category = category;
  }

  if (minBudget || maxBudget) {
    query.budget = {};
    if (minBudget) query.budget.$gte = Number(minBudget);
    if (maxBudget) query.budget.$lte = Number(maxBudget);
  }

  // MongoDB doesn't allow $text and $near in the same query, so text search wins
  // when both are supplied — a keyword search is a more explicit signal than
  // a default "near me" radius.
  if (search) {
    query.$text = { $search: search };
  } else if (lat && lng) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: (Number(maxDistanceKm) || 25) * 1000,
      },
    };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'budget_asc') sortOption = { budget: 1 };
  if (sort === 'budget_desc') sortOption = { budget: -1 };
  if (sort === 'deadline') sortOption = { deadline: 1 };
  // $near already sorts by distance — skip other sort options when it's active
  const usingGeoSort = Boolean(!search && lat && lng);

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  let findQuery = Task.find(query).populate('postedBy', 'name avatar rating');
  if (!usingGeoSort) findQuery = findQuery.sort(sortOption);

  const [tasks, total] = await Promise.all([
    findQuery.skip((pageNum - 1) * limitNum).limit(limitNum),
    Task.countDocuments(query),
  ]);

  res.json({
    success: true,
    tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get tasks posted by the logged-in user
// @route   GET /api/tasks/mine
// @access  Private
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ postedBy: req.user._id })
    .populate('assignedTo', 'name avatar rating')
    .sort({ createdAt: -1 });
  res.json({ success: true, tasks });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('postedBy', 'name avatar rating isVerified')
    .populate('assignedTo', 'name avatar rating');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  res.json({ success: true, task });
});

// @desc    Update a task (owner only, and only while still open)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own tasks');
  }
  if (task.status !== 'open') {
    res.status(400);
    throw new Error('Only open tasks can be edited');
  }

  const editable = ['title', 'description', 'category', 'budget', 'budgetType', 'deadline'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  if (req.body.location) {
    let location = req.body.location;
    if (typeof location === 'string') location = JSON.parse(location);
    task.location = {
      type: 'Point',
      coordinates: location.coordinates || task.location.coordinates,
      address: location.address ?? task.location.address,
    };
  }

  if (req.files && req.files.length > 0) {
    task.photos = [...task.photos, ...req.files.map((f) => `/uploads/${f.filename}`)];
  }

  const updated = await task.save();
  res.json({ success: true, task: updated });
});

// @desc    Cancel/delete a task (owner only)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (task.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only cancel your own tasks');
  }

  if (task.status === 'open') {
    await task.deleteOne();
    return res.json({ success: true, message: 'Task deleted' });
  }

  // Once someone is assigned, refund any held escrow before cancelling instead of deleting
  if (['assigned', 'in_progress'].includes(task.status)) {
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');
    const Bid = require('../models/Bid');

    const poster = await User.findById(task.postedBy);
    const acceptedBid = await Bid.findById(task.acceptedBid);
    const amount = acceptedBid ? acceptedBid.amount : task.budget;

    poster.escrowHeld = Math.max(0, poster.escrowHeld - amount);
    poster.walletBalance += amount;
    await poster.save();

    await Transaction.create({
      task: task._id,
      from: poster._id,
      to: poster._id,
      amount,
      type: 'escrow_refund',
      note: `Escrow refunded — "${task.title}" cancelled`,
    });
  }

  task.status = 'cancelled';
  await task.save();
  res.json({ success: true, task, message: 'Task cancelled' });
});

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
