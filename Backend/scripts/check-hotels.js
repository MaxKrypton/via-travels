#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.NEON_DATABASE_URL);

async function checkHotels() {
  console.log('\n🔍 CHECKING EXISTING HOTELS\n');

  try {
    const hotels = await sql`SELECT id, name, business_email, business_contact_mobile, city, country FROM hotels`;

    if (hotels.length === 0) {
      console.log('❌ No hotels found in database\n');
      console.log('Run: node scripts/setup-hotel-login.js\n');
    } else {
      console.log(`✅ Found ${hotels.length} hotel(s):\n`);

      hotels.forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.name}`);
        console.log(`   ID: ${hotel.id}`);
        console.log(`   Email: ${hotel.business_email || 'N/A'}`);
        console.log(`   Phone: ${hotel.business_contact_mobile || 'N/A'}`);
        console.log(`   Location: ${hotel.city}, ${hotel.country}`);
        console.log('');
      });

      console.log('📝 To set passwords for these hotels, use:');
      console.log('   POST /api/v1/hotel-auth/set-password');
      console.log('   Body: { "hotel_id": "UUID", "new_password": "YourPassword" }\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkHotels();
