const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      'user_login',
      'user_logout',
      'user_created',
      'user_updated',
      'user_deleted',
      'department_created',
      'department_updated',
      'department_deleted',
      'budget_head_created',
      'budget_head_updated',
      'budget_head_deleted',
      'allocation_created',
      'allocation_updated',
      'allocation_deleted',
      'expenditure_submitted',
      'expenditure_verified',
      'expenditure_approved',
      'expenditure_rejected',
      'expenditure_resubmitted',
      'file_uploaded',
      'file_deleted',
      'report_generated',
      'settings_updated'
    ]
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actorRole: {
    type: String,
    required: true
  },
  targetEntity: {
    type: String,
    enum: ['User', 'Department', 'BudgetHead', 'Allocation', 'Expenditure', 'File', 'Report', 'System']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  previousValues: {
    type: mongoose.Schema.Types.Mixed
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
auditLogSchema.index({ eventType: 1 });
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ targetEntity: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

// Compound index for common queries
auditLogSchema.index({ eventType: 1, createdAt: -1 });
auditLogSchema.index({ targetEntity: 1, targetId: 1 });

// TTL index to automatically delete logs older than 7 years (compliance requirement)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 }); // 7 years

module.exports = mongoose.model('AuditLog', auditLogSchema);
