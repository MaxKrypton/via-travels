#!/usr/bin/env node

/**
 * Hotel Login Setup Script
 *
 * This script:
 * 1. Creates sample hotels with unique IDs
 * 2. Sets passwords for each hotel
 * 3. Provides login credentials for testing
 *
 * Run: node scripts/setup-hotel-login.js
 */

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sql = neon(process.env.NEON_DATABASE_URL);

const sampleHotels = [
  {
    name: 'Grand Paradise Hotel',
    password: 'GrandParadise2024',
    description: 'Luxury 5-star hotel in the heart of Kigali',
    address: '123 KN 4 Ave',
    city: 'Kigali',
    state: 'Kigali',
    country: 'Rwanda',
    email: 'info@grandparadise.rw',
    phone: '+250788111222',
    star_rating: 5,
    property_type: 'Hotel',
    total_rooms: 150,
  },
  {
    name: 'Serena Hotel Kigali',
    password: 'Serena2024',
    description: 'Premium business hotel with conference facilities',
    address: '456 KG 5 Ave',
    city: 'Kigali',
    state: 'Kigali',
    country: 'Rwanda',
    email: 'reservations@serenakigali.rw',
    phone: '+250788333444',
    star_rating: 5,
    property_type: 'Hotel',
    total_rooms: 120,
  },
  {
    name: 'Lake View Resort',
    password: 'LakeView2024',
    description: 'Beautiful resort by Lake Kivu',
    address: '789 Beach Road',
    city: 'Gisenyi',
    state: 'Western Province',
    country: 'Rwanda',
    email: 'stay@lakeviewresort.rw',
    phone: '+250788555666',
    star_rating: 4,
    property_type: 'Resort',
    total_rooms: 80,
  }
];

async function setupHotelLogins() {
  console.log('\n🏨 HOTEL LOGIN SETUP\n');
  console.log('='.repeat(60));
  console.log('\nThis will create hotels with password-based login\n');

  try {
    // Check if migration is needed
    console.log('📋 Step 1: Checking database schema...');

    const checkColumn = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'hotels' AND column_name = 'access_password'
    `;

    if (checkColumn.length === 0) {
      console.log('⚠️  Adding access_password column to hotels table...');
      await sql`
        ALTER TABLE hotels
        ADD COLUMN IF NOT EXISTS access_password TEXT
      `;
      console.log('✅ Column added successfully');
    } else {
      console.log('✅ Schema is up to date');
    }

    // Create hotels
    console.log('\n🏗️  Step 2: Creating hotels...\n');
    const createdHotels = [];

    for (const hotel of sampleHotels) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(hotel.password, 10);

        // Insert hotel
        const result = await sql`
          INSERT INTO hotels (
            name, short_description, star_rating, property_type, total_rooms,
            street_address, city, state, country,
            business_email, business_contact_mobile,
            access_password, status, created_at, updated_at
          ) VALUES (
            ${hotel.name},
            ${hotel.description},
            ${hotel.star_rating},
            ${hotel.property_type},
            ${hotel.total_rooms},
            ${hotel.address},
            ${hotel.city},
            ${hotel.state},
            ${hotel.country},
            ${hotel.email},
            ${hotel.phone},
            ${hashedPassword},
            'active',
            NOW(),
            NOW()
          )
          ON CONFLICT (business_email)
          DO UPDATE SET
            access_password = EXCLUDED.access_password,
            updated_at = NOW()
          RETURNING id, name, business_email
        `;

        if (result && result.length > 0) {
          createdHotels.push({
            id: result[0].id,
            name: result[0].name,
            email: result[0].business_email,
            password: hotel.password,
          });

          console.log(`✅ ${hotel.name}`);
          console.log(`   ID: ${result[0].id}`);
          console.log(`   Password: ${hotel.password}\n`);
        }

      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`ℹ️  ${hotel.name} already exists, password updated\n`);
        } else {
          console.error(`❌ Error creating ${hotel.name}:`, error.message);
        }
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('📋 Hotel Login Credentials:\n');

    console.log('Copy your Hotel ID from above and use these credentials:\n');

    for (const hotel of createdHotels) {
      console.log(`🏨 ${hotel.name}`);
      console.log(`   Hotel ID: ${hotel.id}`);
      console.log(`   Password: ${hotel.password}`);
      console.log('');
    }

    console.log('\n📱 Login at: http://localhost:3000');
    console.log('\n💡 How to login:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Enter your Hotel ID (the UUID from above)');
    console.log('   3. Enter your password');
    console.log('   4. View your hotel-specific dashboard!\n');

    console.log('🔒 Each hotel can ONLY see their own data:');
    console.log('   • Bookings for their hotel');
    console.log('   • Reviews for their hotel');
    console.log('   • Rooms in their hotel');
    console.log('   • Media for their hotel');
    console.log('   • Analytics for their hotel\n');

    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error('\nDetails:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. NEON_DATABASE_URL is set in .env');
    console.log('   2. Database is accessible');
    console.log('   3. Hotels table exists\n');
    process.exit(1);
  }
}

// Run the setup
setupHotelLogins()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
