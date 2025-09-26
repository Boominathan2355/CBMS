const { getSystemLocksStatus } = require('../middleware/concurrencyControl');

// @desc    Get system concurrency status
// @route   GET /api/system/concurrency-status
// @access  Private (Admin, Office)
const getConcurrencyStatus = async (req, res) => {
  try {
    const locksStatus = getSystemLocksStatus();
    
    res.json({
      success: true,
      data: {
        concurrencyControl: {
          active: true,
          lockTimeout: 5 * 60 * 1000, // 5 minutes
          totalLocks: locksStatus.totalLocks,
          activeLocks: locksStatus.locks,
          cleanupNeeded: locksStatus.cleanupNeeded
        },
        systemInfo: {
          nodeVersion: process.version,
          platform: process.platform,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Get concurrency status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching concurrency status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getConcurrencyStatus
};
