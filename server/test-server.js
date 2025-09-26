const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Mock users
const mockUsers = [
  {
    _id: '1',
    name: 'Test Admin',
    email: 'admin@test.com',
    password: '$2b$12$XNMJt0zUJajzxklxqmQcnuyr/mm8JW/H5/.ETxyv2ji3D7FHzU/02',
    role: 'admin',
    isActive: true
  }
];

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    
    const { email, password } = req.body;
    
    const user = mockUsers.find(u => u.email === email && u.isActive);
    console.log('Found user:', user ? user.email : 'none');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign({ userId: user._id }, 'fallback-secret', { expiresIn: '7d' });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

app.listen(5000, () => {
  console.log('🚀 Test server running on port 5000');
  console.log('🔐 Test user: admin@test.com / password123');
});
