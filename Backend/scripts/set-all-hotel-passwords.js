#!/usr/bin/env node

/**
 * Set passwords for all existing hotels
 * This makes them ready for Hotel ID login
 */

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sql = neon(process.env.NEON_DATABASE_URL);

// Default password for all hotels (can be customized per hotel)
const DEFAULT_PASSWORD = 'Hotel2024';

async function setAllHotelPasswords() {
  console.log('\n🔐 SETTING HOTEL PASSWORDS\n');
  console.log('='.repeat(60));

  try {
    // Get all hotels
    const hotels = await sql`SELECT id, name FROM hotels`;

    if (hotels.length === 0) {
      console.log('\n❌ No hotels found in database\n');
      return;
    }

    console.log(`\n✅ Found ${hotels.length} hotels\n`);

    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Update all hotels with the password
    const updated = await sql`
      UPDATE hotels
      SET access_password = ${hashedPassword},
          updated_at = NOW()
      WHERE id IS NOT NULL
      RETURNING id, name
    `;

    console.log(`✅ Set passwords for ${updated.length} hotels\n`);
    console.log('='.repeat(60));
    console.log('\n📋 HOTEL LOGIN CREDENTIALS:\n');

    hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      console.log(`   Hotel ID: ${hotel.id}`);
      console.log(`   Password: ${DEFAULT_PASSWORD}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n💡 HOW TO LOGIN:\n');
    console.log('1. Go to: http://localhost:3000');
    console.log('2. Enter Hotel ID (copy from above)');
    console.log(`3. Enter Password: ${DEFAULT_PASSWORD}`);
    console.log('4. View your hotel-specific dashboard!\n');

    console.log('🔒 SECURITY NOTES:\n');
    console.log('• Each hotel sees ONLY their own data');
    console.log('• Change passwords after first login');
    console.log(`• All hotels currently use: ${DEFAULT_PASSWORD}\n`);

    console.log('📝 To change a specific hotel password:');
    console.log('   POST /api/v1/hotel-auth/set-password');
    console.log('   Body: { "hotel_id": "UUID", "new_password": "NewPass123" }\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

setAllHotelPasswords()
  .then(() => {
    console.log('✅ Done!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
