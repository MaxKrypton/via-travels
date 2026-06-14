// Quick setup script - Creates test accounts and hotel
// Run with: node scripts/quick-setup.js

const fetch = require('node-fetch');

const API_URL = 'http://localhost:8000/api/v1';

async function quickSetup() {
  console.log('\n🏨 NESTLY QUICK SETUP\n');
  console.log('====================\n');

  console.log('This script will:');
  console.log('1. Create an admin account');
  console.log('2. Create a hotel');
  console.log('3. Create a hotel manager');
  console.log('4. Link the manager to the hotel\n');

  try {
    // Step 1: Register admin
    console.log('📝 Step 1: Creating admin account...');
    const adminResponse = await fetch(`${API_URL}/auth/register/via-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nestly.com',
        username: 'admin',
        password: 'Admin123'
      })
    });

    const adminData = await adminResponse.json();

    if (adminResponse.ok) {
      console.log('✅ Admin created:', adminData.data?.user?.email || 'admin@nestly.com');
    } else if (adminResponse.status === 409) {
      console.log('ℹ️  Admin already exists, continuing...');
    } else {
      console.log('❌ Failed to create admin:', adminData.message);
      return;
    }

    // Step 2: Login as admin
    console.log('\n🔑 Step 2: Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nestly.com',
        password: 'Admin123'
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.message);
      console.log('\nℹ️  If email is not verified, you need to verify it first.');
      console.log('Check your email or manually set email_verified=true in database.\n');
      return;
    }

    const adminToken = loginData.data?.token || loginData.token;
    console.log('✅ Admin logged in successfully');

    // Step 3: Create hotel
    console.log('\n🏨 Step 3: Creating test hotel...');
    const hotelResponse = await fetch(`${API_URL}/hotels/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Grand Test Hotel',
        description: 'A beautiful test hotel for development',
        address: '123 Test Street',
        city: 'Kigali',
        country: 'Rwanda',
        email: 'hotel@grandtest.com',
        phone: '+250788123456',
        check_in_time: '14:00',
        check_out_time: '11:00',
        star_rating: 5,
        account_number: '123456789',
        bank_name: 'Bank of Kigali',
        account_holder_name: 'Grand Test Hotel Ltd'
      })
    });

    const hotelData = await hotelResponse.json();

    if (!hotelResponse.ok) {
      console.log('❌ Failed to create hotel:', hotelData.message);
      return;
    }

    const hotelId = hotelData.data?.hotel?.id || hotelData.hotel?.id;
    console.log('✅ Hotel created with ID:', hotelId);

    // Step 4: Create hotel manager
    console.log('\n👤 Step 4: Creating hotel manager account...');
    const managerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@grandtest.com',
        username: 'hotelmanager',
        password: 'Manager123'
      })
    });

    const managerData = await managerResponse.json();

    if (managerResponse.ok) {
      console.log('✅ Manager created:', managerData.data?.user?.email || 'manager@grandtest.com');
    } else if (managerResponse.status === 409) {
      console.log('ℹ️  Manager already exists, continuing...');
    } else {
      console.log('❌ Failed to create manager:', managerData.message);
      return;
    }

    const managerId = managerData.data?.user?.id;

    // Step 5: Link manager to hotel
    console.log('\n🔗 Step 5: Linking manager to hotel...');
    console.log('\nℹ️  This requires a database query. Run this SQL in your database:');
    console.log('\n--- SQL COMMAND ---');
    console.log(`INSERT INTO "hotelManagement" (user_id, hotel_id, created_at)`);
    console.log(`VALUES ('${managerId}', '${hotelId}', NOW());`);
    console.log('-------------------\n');

    // Final summary
    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('📋 Account Details:\n');
    console.log('Admin Account:');
    console.log('  Email: admin@nestly.com');
    console.log('  Password: Admin123\n');
    console.log('Manager Account:');
    console.log('  Email: manager@grandtest.com');
    console.log('  Password: Manager123\n');
    console.log('Hotel:');
    console.log('  Name: Grand Test Hotel');
    console.log(`  ID: ${hotelId}\n`);
    console.log('⚠️  IMPORTANT: Run the SQL command above to link the manager to the hotel!\n');
    console.log('Then login at: http://localhost:3000\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend is running on port 8000');
    console.log('2. Database is connected');
    console.log('3. All environment variables are set\n');
  }
}

// Run the setup
quickSetup();
