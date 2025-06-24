const bcrypt = require('bcrypt');

// Test password hashing
async function testPasswords() {
  console.log('🔐 Testing Password Hashing...\n');
  
  // The password we want to test
  const plainPassword = 'password123';
  const adminPassword = 'admin123';
  
  // Hash used in our test users
  const testHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  // Test if the hash matches
  const isValidStudent = await bcrypt.compare(plainPassword, testHash);
  console.log(`Student password match: ${isValidStudent}`);
  
  // Create new hashes for both passwords
  const newStudentHash = await bcrypt.hash(plainPassword, 10);
  const newAdminHash = await bcrypt.hash(adminPassword, 10);
  
  console.log(`\nNew student hash: ${newStudentHash}`);
  console.log(`New admin hash: ${newAdminHash}`);
  
  // Test the new hashes
  const testNewStudent = await bcrypt.compare(plainPassword, newStudentHash);
  const testNewAdmin = await bcrypt.compare(adminPassword, newAdminHash);
  
  console.log(`\nNew student hash test: ${testNewStudent}`);
  console.log(`New admin hash test: ${testNewAdmin}`);
}

testPasswords();
