// Script to create a test hotel manager account
// Run with: node scripts/create-test-manager.js

const bcrypt = require('bcrypt');

async function generateData() {
  const password = 'TestPassword123';
  const hash = await bcrypt.hash(password, 10);

  console.log('\n🏨 CREATE TEST HOTEL MANAGER ACCOUNT\n');
  console.log('===================================\n');

  console.log('📝 Use these SQL commands in your database:\n');

  console.log('-- 1. Create User');
  console.log(`INSERT INTO "userTable" (email, username, password_hash, email_verified, created_at)
VALUES (
  'manager@test.com',
  'testmanager',
  '${hash}',
  true,
  NOW()
) RETURNING id;\n`);

  console.log('-- 2. Get the user ID from above, then assign role');
  console.log(`INSERT INTO "userRolesTable" (user_id, role)
VALUES ('REPLACE_WITH_USER_ID_FROM_STEP_1', 'hotel-manager');\n`);

  console.log('-- 3. Create Hotel');
  console.log(`INSERT INTO hotels (name, description, address, city, country, email, phone, created_at)
VALUES (
  'Test Hotel',
  'A test hotel for development',
  '123 Test Street',
  'Kigali',
  'Rwanda',
  'test@testhotel.com',
  '+250788000000',
  NOW()
) RETURNING id;\n`);

  console.log('-- 4. Get hotel ID from above, then link manager to hotel');
  console.log(`INSERT INTO "hotelManagement" (user_id, hotel_id, created_at)
VALUES ('REPLACE_WITH_USER_ID', 'REPLACE_WITH_HOTEL_ID', NOW());\n`);

  console.log('\n✅ After running these commands, you can login with:');
  console.log('   Email: manager@test.com');
  console.log('   Password: TestPassword123\n');
}

generateData().catch(console.error);
