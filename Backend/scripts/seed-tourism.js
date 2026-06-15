const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.NEON_DATABASE_URL);

const entries = [
  // ACCOMMODATIONS
  { category: 'accommodation', name: 'Kigali Serena Hotel', description: 'Five-star luxury hotel in the heart of Kigali with pool, spa, and multiple restaurants.', location: 'Kigali City Center', price_rwf: 180000, price_usd: 120, tags: ['luxury', 'kigali', 'business', 'spa'], booking_contact: '+250 252 597 100' },
  { category: 'accommodation', name: 'Heaven Restaurant & Boutique Hotel', description: 'Boutique hotel with stunning Kigali views, rooftop bar, and locally inspired rooms.', location: 'Kigali, Nyarutarama', price_rwf: 90000, price_usd: 60, tags: ['boutique', 'kigali', 'mid-range', 'view'], booking_contact: '+250 788 383 835' },
  { category: 'accommodation', name: 'Gorillas Hotel Kigali', description: 'Comfortable mid-range hotel close to the city centre, ideal for budget-conscious travelers.', location: 'Kigali, Remera', price_rwf: 45000, price_usd: 30, tags: ['budget', 'kigali', 'comfortable'], booking_contact: '+250 252 501 201' },
  { category: 'accommodation', name: 'Sabyinyo Silverback Lodge', description: 'Luxury eco-lodge at the foot of the Virunga volcanoes, closest lodge to gorilla tracking.', location: 'Volcanoes National Park, Musanze', price_rwf: 900000, price_usd: 600, tags: ['luxury', 'gorilla', 'eco-lodge', 'wildlife', 'musanze'], booking_contact: '+250 788 607 505' },
  { category: 'accommodation', name: 'Kinigi Guesthouse', description: 'Affordable guesthouse near Volcanoes National Park, popular with budget gorilla trekkers.', location: 'Kinigi, Musanze', price_rwf: 30000, price_usd: 20, tags: ['budget', 'gorilla', 'musanze', 'guesthouse'], booking_contact: '+250 788 301 421' },
  { category: 'accommodation', name: 'Akagera Game Lodge', description: 'The only lodge inside Akagera National Park, with stunning views over Lake Ihema.', location: 'Akagera National Park, Eastern Province', price_rwf: 225000, price_usd: 150, tags: ['safari', 'wildlife', 'akagera', 'lake', 'luxury'], booking_contact: '+250 788 386 086' },

  // ATTRACTIONS
  { category: 'attraction', name: 'Kigali Genocide Memorial', description: 'A powerful and moving memorial to the 1994 genocide, offering important historical and cultural context for visitors to Rwanda.', location: 'Kigali, Gisozi', price_rwf: 0, price_usd: 0, tags: ['history', 'culture', 'kigali', 'memorial', 'free'], booking_contact: '+250 252 501 727' },
  { category: 'attraction', name: 'Volcanoes National Park', description: 'Home to endangered mountain gorillas and golden monkeys. One of Africa\'s most iconic wildlife destinations.', location: 'Musanze, Northern Province', price_rwf: 0, price_usd: 0, tags: ['wildlife', 'gorilla', 'nature', 'musanze', 'adventure'], booking_contact: 'bookings@rdb.rw' },
  { category: 'attraction', name: 'Akagera National Park', description: 'Rwanda\'s largest national park featuring the Big Five, lakes, savannah, and over 500 bird species.', location: 'Eastern Province', price_rwf: 30000, price_usd: 20, tags: ['safari', 'wildlife', 'big five', 'birds', 'akagera', 'nature'], booking_contact: '+250 788 386 086' },
  { category: 'attraction', name: 'Nyungwe Forest National Park', description: 'Ancient montane rainforest with chimpanzee trekking, canopy walkway, and exceptional birdwatching.', location: 'Southern Province', price_rwf: 60000, price_usd: 40, tags: ['chimpanzee', 'forest', 'canopy', 'birds', 'nature', 'adventure'], booking_contact: 'bookings@rdb.rw' },
  { category: 'attraction', name: 'Lake Kivu', description: 'Beautiful lake on the Congo border offering boat trips, beach relaxation, and water sports in Rubavu and Karongi.', location: 'Western Province, Rubavu / Karongi', price_rwf: 0, price_usd: 0, tags: ['lake', 'beach', 'relaxation', 'boat', 'culture', 'scenery'], booking_contact: '' },
  { category: 'attraction', name: 'Inema Arts Center', description: 'Vibrant contemporary art gallery and cultural space in Kigali showcasing Rwandan and African artists.', location: 'Kigali, Kimironko', price_rwf: 5000, price_usd: 3, tags: ['art', 'culture', 'kigali', 'gallery'], booking_contact: '+250 788 500 698' },
  { category: 'attraction', name: 'Kimironko Market', description: 'Kigali\'s largest and most vibrant local market — great for fabrics, crafts, fresh produce, and local culture.', location: 'Kigali, Kimironko', price_rwf: 0, price_usd: 0, tags: ['market', 'culture', 'kigali', 'shopping', 'free'], booking_contact: '' },

  // ACTIVITIES
  { category: 'activity', name: 'Mountain Gorilla Trekking', description: 'Once-in-a-lifetime guided trek to spend one hour with wild mountain gorilla families in Volcanoes National Park.', location: 'Volcanoes National Park, Musanze', price_rwf: 1125000, price_usd: 750, tags: ['gorilla', 'wildlife', 'trekking', 'musanze', 'adventure'], booking_contact: 'bookings@rdb.rw' },
  { category: 'activity', name: 'Chimpanzee Trekking — Nyungwe', description: 'Guided trek to find and observe wild chimpanzee communities in Nyungwe Forest National Park.', location: 'Nyungwe Forest National Park', price_rwf: 112500, price_usd: 75, tags: ['chimpanzee', 'wildlife', 'trekking', 'forest', 'adventure'], booking_contact: 'bookings@rdb.rw' },
  { category: 'activity', name: 'Nyungwe Canopy Walkway', description: 'Walk across a suspended canopy bridge 70 metres above the forest floor with panoramic rainforest views.', location: 'Nyungwe Forest National Park', price_rwf: 60000, price_usd: 40, tags: ['canopy', 'forest', 'adventure', 'nature', 'views'], booking_contact: 'bookings@rdb.rw' },
  { category: 'activity', name: 'Kigali City Walking Tour', description: 'Guided walking tour of Kigali covering the genocide memorial, local markets, art galleries, and city viewpoints.', location: 'Kigali', price_rwf: 15000, price_usd: 10, tags: ['culture', 'kigali', 'history', 'walking', 'city'], booking_contact: '' },
  { category: 'activity', name: 'Lake Kivu Boat Trip', description: 'Scenic boat trip on Lake Kivu visiting islands and local fishing villages with stunning views of the Congo hills.', location: 'Rubavu, Western Province', price_rwf: 22500, price_usd: 15, tags: ['lake', 'boat', 'scenery', 'culture', 'relaxation'], booking_contact: '' },
  { category: 'activity', name: 'Akagera Game Drive', description: 'Full-day guided game drive in Akagera National Park in search of lions, elephants, hippos, and rhinos.', location: 'Akagera National Park', price_rwf: 75000, price_usd: 50, tags: ['safari', 'wildlife', 'game drive', 'akagera', 'big five'], booking_contact: '+250 788 386 086' },
  { category: 'activity', name: 'Golden Monkey Trekking', description: 'Guided trek to encounter the rare and playful golden monkeys in the bamboo forests of Volcanoes National Park.', location: 'Volcanoes National Park, Musanze', price_rwf: 112500, price_usd: 75, tags: ['golden monkey', 'wildlife', 'trekking', 'musanze', 'nature'], booking_contact: 'bookings@rdb.rw' },

  // TRANSPORT
  { category: 'transport', name: 'Kigali to Musanze Bus', description: 'Regular express bus service from Nyabugogo bus station in Kigali to Musanze. Journey approx 2.5 hours.', location: 'Kigali → Musanze', price_rwf: 2000, price_usd: 2, tags: ['bus', 'transport', 'musanze', 'budget'], booking_contact: '' },
  { category: 'transport', name: 'Kigali to Musanze Private Transfer', description: 'Private car transfer from Kigali to Musanze with a driver. Comfortable and flexible, approx 2.5 hours.', location: 'Kigali → Musanze', price_rwf: 75000, price_usd: 50, tags: ['private', 'transfer', 'musanze', 'comfortable'], booking_contact: '' },
  { category: 'transport', name: 'Kigali to Rubavu Private Transfer', description: 'Private car transfer from Kigali to Rubavu (Lake Kivu). Scenic mountain drive, approx 3 hours.', location: 'Kigali → Rubavu', price_rwf: 90000, price_usd: 60, tags: ['private', 'transfer', 'lake kivu', 'rubavu'], booking_contact: '' },
  { category: 'transport', name: 'Kigali Moto-Taxi', description: 'Motorcycle taxis are the fastest and cheapest way to get around Kigali for short distances.', location: 'Kigali', price_rwf: 1000, price_usd: 1, tags: ['moto', 'kigali', 'budget', 'local', 'transport'], booking_contact: '' },

  // PERMITS
  { category: 'permit', name: 'Mountain Gorilla Trekking Permit', description: 'Official RDB permit required for gorilla trekking in Volcanoes National Park. Must be booked in advance.', location: 'Rwanda Development Board, Kigali', price_rwf: 1125000, price_usd: 750, tags: ['gorilla', 'permit', 'rdb', 'volcanoes', 'required'], booking_contact: 'bookings@rdb.rw' },
  { category: 'permit', name: 'Chimpanzee Trekking Permit — Nyungwe', description: 'Official RDB permit for chimpanzee trekking in Nyungwe Forest. Book at least 2 weeks in advance during peak season.', location: 'Rwanda Development Board, Kigali', price_rwf: 112500, price_usd: 75, tags: ['chimpanzee', 'permit', 'rdb', 'nyungwe', 'required'], booking_contact: 'bookings@rdb.rw' },
  { category: 'permit', name: 'Golden Monkey Trekking Permit', description: 'Official RDB permit for golden monkey trekking in Volcanoes National Park.', location: 'Rwanda Development Board, Kigali', price_rwf: 112500, price_usd: 75, tags: ['golden monkey', 'permit', 'rdb', 'volcanoes', 'required'], booking_contact: 'bookings@rdb.rw' },
];

async function seed() {
  try {
    console.log('🌱 Seeding Rwanda tourism data...');

    // Clear existing entries
    await sql`DELETE FROM tourism_entries`;
    console.log('🗑️  Cleared existing tourism entries');

    // Insert all entries
    for (const entry of entries) {
      await sql`
        INSERT INTO tourism_entries (category, name, description, location, price_rwf, price_usd, tags, booking_contact, last_verified, created_at, updated_at)
        VALUES (
          ${entry.category},
          ${entry.name},
          ${entry.description},
          ${entry.location},
          ${entry.price_rwf},
          ${entry.price_usd},
          ${entry.tags},
          ${entry.booking_contact},
          NOW(),
          NOW(),
          NOW()
        )
      `;
    }

    console.log(`✅ Inserted ${entries.length} Rwanda tourism entries`);
    console.log('\n📋 Breakdown:');
    const categories = [...new Set(entries.map(e => e.category))];
    for (const cat of categories) {
      const count = entries.filter(e => e.category === cat).length;
      console.log(`   ${cat}: ${count} entries`);
    }
    console.log('\n🎉 Rwanda tourism dataset is ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();