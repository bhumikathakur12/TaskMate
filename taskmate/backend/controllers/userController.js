const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get a public user profile by id
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update own profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phone, bio, skills, roles, activeMode, location } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = skills;
  if (roles !== undefined) user.roles = roles;
  if (activeMode !== undefined) user.activeMode = activeMode;
  if (location !== undefined) {
    user.location = {
      type: 'Point',
      coordinates: location.coordinates || user.location.coordinates,
      address: location.address ?? user.location.address,
    };
  }

  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// @desc    Upload / change avatar
// @route   PUT /api/users/me/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please attach an image file');
  }

  const user = await User.findById(req.user._id);
  user.avatar = `/uploads/${req.file.filename}`;
  await user.save();

  res.json({ success: true, user });
});

// @desc    Switch between poster / tasker mode
// @route   PUT /api/users/me/mode
// @access  Private
const switchMode = asyncHandler(async (req, res) => {
  const { activeMode } = req.body;
  if (!['poster', 'tasker'].includes(activeMode)) {
    res.status(400);
    throw new Error('activeMode must be either "poster" or "tasker"');
  }

  const user = await User.findById(req.user._id);
  user.activeMode = activeMode;
  if (!user.roles.includes(activeMode)) {
    user.roles.push(activeMode);
  }
  await user.save();

  res.json({ success: true, user });
});

module.exports = { getUserProfile, updateProfile, updateAvatar, switchMode };
