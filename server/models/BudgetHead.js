const mongoose = require('mongoose');

const budgetHeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Budget head name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['infrastructure', 'equipment', 'events', 'maintenance', 'other'],
    required: [true, 'Budget head category is required'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance

budgetHeadSchema.index({ category: 1 });

module.exports = mongoose.model('BudgetHead', budgetHeadSchema);
