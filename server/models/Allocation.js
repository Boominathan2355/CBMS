const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  financialYear: {
    type: String,
    required: [true, 'Financial year is required'],
    match: [/^\d{4}-\d{4}$/, 'Financial year must be in format YYYY-YYYY']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  budgetHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BudgetHead',
    required: [true, 'Budget head is required']
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: [0, 'Allocated amount cannot be negative']
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  remarks: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for remaining amount
allocationSchema.virtual('remainingAmount').get(function() {
  return this.allocatedAmount - this.spentAmount;
});

// Ensure virtual fields are serialized
allocationSchema.set('toJSON', { virtuals: true });

// Compound index to ensure unique allocation per department/budget head/financial year
allocationSchema.index({ 
  financialYear: 1, 
  department: 1, 
  budgetHead: 1 
}, { unique: true });

// Index for better query performance
allocationSchema.index({ financialYear: 1 });
allocationSchema.index({ department: 1 });
allocationSchema.index({ budgetHead: 1 });

// Pre-save middleware to validate spent amount doesn't exceed allocated amount
allocationSchema.pre('save', function(next) {
  if (this.spentAmount > this.allocatedAmount) {
    const error = new Error('Spent amount cannot exceed allocated amount');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Allocation', allocationSchema);
