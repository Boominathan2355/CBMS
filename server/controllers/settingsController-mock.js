// Mock settings database (in-memory)
const mockSettings = {
  general: {
    collegeName: 'College of Engineering and Technology',
    collegeCode: 'CET',
    academicYear: '2024-25',
    financialYear: '2024-25',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  budget: {
    defaultAllocationPeriod: 'yearly',
    maxAllocationAmount: 10000000,
    minAllocationAmount: 1000,
    approvalRequiredAmount: 50000,
    autoApprovalAmount: 10000,
    budgetCarryForward: true,
    budgetCarryForwardPercentage: 20
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: 'immediate',
    reminderDays: 7,
    escalationDays: 3
  },
  security: {
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorAuth: false
  },
  system: {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    maxFileUploadSize: 10485760,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    auditLogRetention: 2555,
    backupFrequency: 'daily',
    autoBackup: true
  }
};

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { settings: mockSettings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { category, settings } = req.body;
    
    if (!category || !settings) {
      return res.status(400).json({
        success: false,
        message: 'Category and settings are required'
      });
    }
    
    if (!mockSettings[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings category'
      });
    }
    
    // Update the specific category settings
    mockSettings[category] = { ...mockSettings[category], ...settings };
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: mockSettings[category] }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private/Admin
const resetSettings = async (req, res) => {
  try {
    const { category } = req.body;
    
    if (category && !mockSettings[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings category'
      });
    }
    
    // Reset to default values (in a real app, you'd have default settings)
    if (category) {
      // Reset specific category
      const defaultSettings = {
        general: {
          collegeName: 'College of Engineering and Technology',
          collegeCode: 'CET',
          academicYear: '2024-25',
          financialYear: '2024-25',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          language: 'en',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h'
        },
        budget: {
          defaultAllocationPeriod: 'yearly',
          maxAllocationAmount: 10000000,
          minAllocationAmount: 1000,
          approvalRequiredAmount: 50000,
          autoApprovalAmount: 10000,
          budgetCarryForward: true,
          budgetCarryForwardPercentage: 20
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          notificationFrequency: 'immediate',
          reminderDays: 7,
          escalationDays: 3
        },
        security: {
          passwordMinLength: 8,
          passwordRequireSpecialChars: true,
          passwordRequireNumbers: true,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          twoFactorAuth: false
        },
        system: {
          maintenanceMode: false,
          maintenanceMessage: 'System is under maintenance. Please try again later.',
          maxFileUploadSize: 10485760,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
          auditLogRetention: 2555,
          backupFrequency: 'daily',
          autoBackup: true
        }
      };
      
      mockSettings[category] = defaultSettings[category];
    } else {
      // Reset all settings
      Object.keys(mockSettings).forEach(key => {
        mockSettings[key] = {
          general: {
            collegeName: 'College of Engineering and Technology',
            collegeCode: 'CET',
            academicYear: '2024-25',
            financialYear: '2024-25',
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            language: 'en',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h'
          },
          budget: {
            defaultAllocationPeriod: 'yearly',
            maxAllocationAmount: 10000000,
            minAllocationAmount: 1000,
            approvalRequiredAmount: 50000,
            autoApprovalAmount: 10000,
            budgetCarryForward: true,
            budgetCarryForwardPercentage: 20
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            notificationFrequency: 'immediate',
            reminderDays: 7,
            escalationDays: 3
          },
          security: {
            passwordMinLength: 8,
            passwordRequireSpecialChars: true,
            passwordRequireNumbers: true,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            twoFactorAuth: false
          },
          system: {
            maintenanceMode: false,
            maintenanceMessage: 'System is under maintenance. Please try again later.',
            maxFileUploadSize: 10485760,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
            auditLogRetention: 2555,
            backupFrequency: 'daily',
            autoBackup: true
          }
        }[key];
      });
    }
    
    res.json({
      success: true,
      message: category ? `${category} settings reset to default` : 'All settings reset to default',
      data: { settings: category ? mockSettings[category] : mockSettings }
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get system information
// @route   GET /api/settings/system-info
// @access  Private/Admin
const getSystemInfo = async (req, res) => {
  try {
    const systemInfo = {
      version: '1.0.0',
      buildDate: '2025-09-12',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Mock Database',
      lastBackup: new Date(Date.now() - 86400000), // 1 day ago
      totalUsers: 5,
      totalDepartments: 6,
      totalBudgetHeads: 6,
      totalAllocations: 0,
      totalExpenditures: 0
    };
    
    res.json({
      success: true,
      data: { systemInfo }
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
  getSystemInfo
};
