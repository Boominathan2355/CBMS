const express = require('express');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

// Simple login test
app.post('/login', async (req, res) => {
  console.log('Received request:', req.body);
  
  const { email, password } = req.body;
  const hash = '$2b$12$XNMJt0zUJajzxklxqmQcnuyr/mm8JW/H5/.ETxyv2ji3D7FHzU/02';
  
  if (email === 'admin@test.com') {
    const valid = await bcrypt.compare(password, hash);
    console.log('Password valid:', valid);
    
    if (valid) {
      res.json({ success: true, message: 'Login successful!' });
    } else {
      res.json({ success: false, message: 'Invalid password' });
    }
  } else {
    res.json({ success: false, message: 'User not found' });
  }
});

app.listen(5001, () => {
  console.log('🚀 Simple test server on port 5001');
  console.log('Test: POST http://localhost:5001/login');
  console.log('Body: {"email":"admin@test.com","password":"password123"}');
});
