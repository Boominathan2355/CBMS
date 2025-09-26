// Concurrency control middleware for budget updates
// This simulates database-level locking and transaction management

// In-memory locks for budget allocations
const budgetLocks = new Map();

// Lock timeout (5 minutes)
const LOCK_TIMEOUT = 5 * 60 * 1000;

// @desc    Acquire a lock for budget allocation
// @param   {string} allocationId - The allocation ID to lock
// @param   {string} userId - The user requesting the lock
// @returns {boolean} - Whether the lock was acquired
const acquireBudgetLock = (allocationId, userId) => {
  const lockKey = `allocation_${allocationId}`;
  const now = Date.now();
  
  // Check if lock exists and is still valid
  if (budgetLocks.has(lockKey)) {
    const lock = budgetLocks.get(lockKey);
    
    // If lock is expired, remove it
    if (now - lock.timestamp > LOCK_TIMEOUT) {
      budgetLocks.delete(lockKey);
    } else {
      // Lock is still active
      return false;
    }
  }
  
  // Acquire new lock
  budgetLocks.set(lockKey, {
    userId,
    timestamp: now,
    allocationId
  });
  
  return true;
};

// @desc    Release a lock for budget allocation
// @param   {string} allocationId - The allocation ID to unlock
// @param   {string} userId - The user releasing the lock
// @returns {boolean} - Whether the lock was released
const releaseBudgetLock = (allocationId, userId) => {
  const lockKey = `allocation_${allocationId}`;
  
  if (budgetLocks.has(lockKey)) {
    const lock = budgetLocks.get(lockKey);
    
    // Only the user who acquired the lock can release it
    if (lock.userId === userId) {
      budgetLocks.delete(lockKey);
      return true;
    }
  }
  
  return false;
};

// @desc    Check if a budget allocation is locked
// @param   {string} allocationId - The allocation ID to check
// @returns {object|null} - Lock information or null if not locked
const checkBudgetLock = (allocationId) => {
  const lockKey = `allocation_${allocationId}`;
  const now = Date.now();
  
  if (budgetLocks.has(lockKey)) {
    const lock = budgetLocks.get(lockKey);
    
    // If lock is expired, remove it
    if (now - lock.timestamp > LOCK_TIMEOUT) {
      budgetLocks.delete(lockKey);
      return null;
    }
    
    return lock;
  }
  
  return null;
};

// @desc    Clean up expired locks
const cleanupExpiredLocks = () => {
  const now = Date.now();
  
  for (const [lockKey, lock] of budgetLocks.entries()) {
    if (now - lock.timestamp > LOCK_TIMEOUT) {
      budgetLocks.delete(lockKey);
    }
  }
};

// @desc    Middleware to handle budget allocation concurrency
const budgetConcurrencyMiddleware = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!id) {
    return next();
  }
  
  // Check if allocation is locked
  const existingLock = checkBudgetLock(id);
  
  if (existingLock) {
    if (existingLock.userId === userId) {
      // User already has the lock, extend it
      existingLock.timestamp = Date.now();
      next();
    } else {
      // Allocation is locked by another user
      return res.status(423).json({
        success: false,
        message: 'Budget allocation is currently being modified by another user. Please try again later.',
        error: 'LOCKED',
        lockedBy: existingLock.userId,
        lockedAt: new Date(existingLock.timestamp)
      });
    }
  } else {
    // No lock exists, acquire one
    if (acquireBudgetLock(id, userId)) {
      // Add cleanup function to response
      res.on('finish', () => {
        releaseBudgetLock(id, userId);
      });
      
      res.on('close', () => {
        releaseBudgetLock(id, userId);
      });
      
      next();
    } else {
      return res.status(423).json({
        success: false,
        message: 'Failed to acquire lock on budget allocation',
        error: 'LOCK_FAILED'
      });
    }
  }
};

// @desc    Middleware for expenditure approval concurrency
const expenditureConcurrencyMiddleware = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!id) {
    return next();
  }
  
  // For expenditure approval, we need to lock the related budget allocation
  // This is a simplified version - in a real system, you'd query the expenditure
  // to get the allocation ID
  
  // For now, we'll use a generic lock key
  const lockKey = `expenditure_${id}`;
  const now = Date.now();
  
  // Check if expenditure is locked
  if (budgetLocks.has(lockKey)) {
    const lock = budgetLocks.get(lockKey);
    
    if (now - lock.timestamp > LOCK_TIMEOUT) {
      budgetLocks.delete(lockKey);
    } else if (lock.userId !== userId) {
      return res.status(423).json({
        success: false,
        message: 'Expenditure is currently being processed by another user. Please try again later.',
        error: 'LOCKED',
        lockedBy: lock.userId,
        lockedAt: new Date(lock.timestamp)
      });
    }
  }
  
  // Acquire lock
  budgetLocks.set(lockKey, {
    userId,
    timestamp: now,
    expenditureId: id
  });
  
  // Release lock when response finishes
  res.on('finish', () => {
    budgetLocks.delete(lockKey);
  });
  
  res.on('close', () => {
    budgetLocks.delete(lockKey);
  });
  
  next();
};

// @desc    Transaction simulation for budget updates
const simulateTransaction = async (operations) => {
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Simulate transaction start
    console.log(`Transaction ${transactionId} started`);
    
    // Execute operations
    const results = [];
    for (const operation of operations) {
      const result = await operation();
      results.push(result);
    }
    
    // Simulate transaction commit
    console.log(`Transaction ${transactionId} committed`);
    
    return {
      success: true,
      transactionId,
      results
    };
  } catch (error) {
    // Simulate transaction rollback
    console.log(`Transaction ${transactionId} rolled back:`, error.message);
    
    return {
      success: false,
      transactionId,
      error: error.message
    };
  }
};

// @desc    Atomic budget update with concurrency control
const atomicBudgetUpdate = async (allocationId, updateFunction, userId) => {
  // Acquire lock
  if (!acquireBudgetLock(allocationId, userId)) {
    throw new Error('Failed to acquire lock for budget allocation');
  }
  
  try {
    // Execute update within transaction
    const result = await simulateTransaction([updateFunction]);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.results[0];
  } finally {
    // Always release lock
    releaseBudgetLock(allocationId, userId);
  }
};

// @desc    Check system locks status
const getSystemLocksStatus = () => {
  const now = Date.now();
  const activeLocks = [];
  
  for (const [lockKey, lock] of budgetLocks.entries()) {
    if (now - lock.timestamp <= LOCK_TIMEOUT) {
      activeLocks.push({
        lockKey,
        userId: lock.userId,
        timestamp: lock.timestamp,
        age: now - lock.timestamp,
        allocationId: lock.allocationId || lock.expenditureId
      });
    }
  }
  
  return {
    totalLocks: activeLocks.length,
    locks: activeLocks,
    cleanupNeeded: budgetLocks.size > activeLocks.length
  };
};

// Clean up expired locks every 5 minutes
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);

module.exports = {
  acquireBudgetLock,
  releaseBudgetLock,
  checkBudgetLock,
  cleanupExpiredLocks,
  budgetConcurrencyMiddleware,
  expenditureConcurrencyMiddleware,
  simulateTransaction,
  atomicBudgetUpdate,
  getSystemLocksStatus
};
