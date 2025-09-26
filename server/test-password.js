const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'password123';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Is valid:', isValid);
  
  // Test with the old hash
  const oldHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8Kz2';
  const isValidOld = await bcrypt.compare(password, oldHash);
  console.log('Is valid with old hash:', isValidOld);
}

testPassword();
