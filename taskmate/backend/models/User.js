const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '', // relative path served from /uploads
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    // A user can operate as a task poster and/or a tasker (worker) — no rigid single role.
    roles: {
      type: [String],
      enum: ['poster', 'tasker'],
      default: ['poster', 'tasker'],
    },
    // Which "mode" the UI should default to on login
    activeMode: {
      type: String,
      enum: ['poster', 'tasker'],
      default: 'poster',
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
      address: {
        type: String,
        default: '',
      },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    // Mock wallet — no real money moves, used to simulate an escrow flow.
    // walletBalance is spendable/withdrawable; escrowHeld is locked against
    // an in-progress task and moves to the tasker's walletBalance on completion,
    // or back to the poster's walletBalance if the task is cancelled.
    walletBalance: {
      type: Number,
      default: 0,
    },
    escrowHeld: {
      type: Number,
      default: 0,
    },
    stats: {
      tasksPosted: { type: Number, default: 0 },
      tasksCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never leak password hash even if select was overridden
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
