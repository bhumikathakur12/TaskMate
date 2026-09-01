const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    tasker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please offer an amount'],
      min: [1, 'Amount must be at least 1'],
    },
    message: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One active bid per tasker per task
bidSchema.index({ task: 1, tasker: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
