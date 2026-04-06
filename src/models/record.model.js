const mongoose = require('mongoose');

const RECORD_TYPES = ['income', 'expense'];

const CATEGORIES = [
  'salary',
  'freelance',
  'investment',
  'rent',
  'utilities',
  'groceries',
  'transport',
  'healthcare',
  'entertainment',
  'education',
  'other',
];

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: RECORD_TYPES,
      required: [true, 'Type (income/expense) is required'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // soft delete flag
    },
  },
  { timestamps: true }
);

// Always exclude soft-deleted records from queries unless explicitly asked
recordSchema.pre(/^find/, function (next) {
  if (!this.getQuery().isDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

module.exports = mongoose.model('Record', recordSchema);
module.exports.RECORD_TYPES = RECORD_TYPES;
module.exports.CATEGORIES = CATEGORIES;
