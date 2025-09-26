const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://cbms:cbms123@cluster0.mongodb.net/cbms?retryWrites=true&w=majority';
mongoose.connect(mongoUri);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Check all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
      if (user.department) {
        console.log(`   Department: ${user.department}`);
      }
    });
    
    // Check departments
    const departments = await Department.find({});
    console.log(`\n🏢 Found ${departments.length} departments:`);
    
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (${dept.code}) - ID: ${dept._id}`);
    });
    
    // Create a test admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('\n👤 Creating test admin user...');
      const testAdmin = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('✅ Test admin created:', testAdmin.email);
    } else {
      console.log('\n✅ Admin user already exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
