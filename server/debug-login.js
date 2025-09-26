const bcrypt = require('bcryptjs');

async function testLogin() {
  const email = 'admin@test.com';
  const password = 'password123';
  const storedHash = '$2b$12$XNMJt0zUJajzxklxqmQcnuyr/mm8JW/H5/.ETxyv2ji3D7FHzU/02';
  
  console.log('Testing login...');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Stored hash:', storedHash);
  
  const isValid = await bcrypt.compare(password, storedHash);
  console.log('Password valid:', isValid);
  
  if (isValid) {
    console.log('✅ Login should work!');
  } else {
    console.log('❌ Login will fail');
  }
}

testLogin();
