const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for topups (money "created" from outside the platform)
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['topup', 'escrow_hold', 'escrow_release', 'escrow_refund'],
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
