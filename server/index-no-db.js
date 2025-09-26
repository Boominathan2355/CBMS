const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth-mock');
// const userRoutes = require('./routes/users');
// const departmentRoutes = require('./routes/departments');
// const budgetHeadRoutes = require('./routes/budgetHeads');
// const allocationRoutes = require('./routes/allocations');
// const expenditureRoutes = require('./routes/expenditures');
// const notificationRoutes = require('./routes/notifications');
// const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for uploaded attachments)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CBMS Backend API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      departments: '/api/departments',
      budgetHeads: '/api/budget-heads',
      allocations: '/api/allocations',
      expenditures: '/api/expenditures',
      notifications: '/api/notifications',
      reports: '/api/reports'
    }
  });
});

app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/departments', departmentRoutes);
// app.use('/api/budget-heads', budgetHeadRoutes);
// app.use('/api/allocations', allocationRoutes);
// app.use('/api/expenditures', expenditureRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server without MongoDB for now
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CBMS Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('⚠️  Running without database - some features may not work');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});
