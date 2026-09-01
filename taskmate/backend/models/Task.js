const mongoose = require('mongoose');

const CATEGORIES = [
  'delivery',
  'cleaning',
  'moving',
  'repairs',
  'errands',
  'petcare',
  'yardwork',
  'assembly',
  'other',
];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Please choose a category'],
    },
    budget: {
      type: Number,
      required: [true, 'Please set a budget'],
      min: [1, 'Budget must be at least 1'],
    },
    budgetType: {
      type: String,
      enum: ['fixed', 'negotiable'],
      default: 'fixed',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: [true, 'Please add a location'],
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
      address: {
        type: String,
        default: '',
      },
    },
    deadline: {
      type: Date,
      required: [true, 'Please set a deadline'],
    },
    photos: {
      type: [String], // relative paths under /uploads
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'],
      default: 'open',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    // Tasker marks the work done; poster then confirms to release escrow.
    completionRequested: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

taskSchema.index({ location: '2dsphere' });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);
module.exports.CATEGORIES = CATEGORIES;
