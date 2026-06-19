import {
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
  boolean,
  date,
  integer,
  time,
  decimal,
  jsonb,
  interval,
  inet,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const hotelStatus = pgEnum("hotel_status", ["active", "inactive"]);
export const paymentOptions = pgEnum('payment_options', ["Visa", "MasterCard", "Momo", "Irembo"]);
export const Roles = pgEnum('roles', ["customer","hotel-manager", "via-admin"]);

export const mediaType = pgEnum('media_type', ['photo', 'video']);
export const mediaTypeCategories = pgEnum('media_type_categories', ['landscape', 'portrait', 'profile', 'room', 'gallery', 'sponsored', 'virtualTours']);
export const paymentStatus = pgEnum("payment_status", ["pending", "completed", "failed", "cancelled"]);

// userTable & Profiles
export const userTable = pgTable('user_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'),
  auth_provider: varchar('auth_provider', { length: 20 }).default('email'),
  email_verified: boolean('email_verified').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const userRolesTable = pgTable('user_roles_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  roles: Roles('roles').default("customer").notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  first_name: varchar('first_name', { length: 50 }),
  last_name: varchar('last_name', { length: 50 }),
  phone_number: varchar('phone_number', { length: 20 }),
  date_of_birth: date('date_of_birth'),
  avatar_url: text('avatar_url'),
  preferred_language: varchar('preferred_language', { length: 10 }).default('en'),
  preferred_currency: varchar('preferred_currency', { length: 3 }).default('USD'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const otpTable = pgTable("OTP", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(), // 6-digit OTP code
  expires_at: timestamp("expires_at").notNull(), // Expiration time
  verified: boolean("verified").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// Core hotel information
export const hotels = pgTable('hotels', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  short_description: text('short_description'),
  long_description: text('long_description'),
  star_rating: decimal('star_rating').notNull(),
  property_type: varchar('property_type', { length: 50 }).notNull(),
  built_year: integer('built_year'),
  last_renovation_year: integer('last_renovation_year'),
  category: varchar('chain_affiliation', { length: 100 }),
  // Hotel Location
  street_address: text('street_address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull(),
  postal_code: varchar('postal_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  map_url: text('map_url'),
  // Banking data
  account_bank: varchar('account_bank'),
  account_number: varchar('account_number'),
  bank_name: varchar('bank_name'),
  subaccount_id: varchar('subaccount_id'),
  business_mobile: varchar('business_mobile'),
  business_email: varchar('business_email'),
  business_contact: varchar('business_contact'),
  business_contact_mobile: varchar('business_contact_mobile'),
  //hotel services
  total_rooms: integer('total_rooms').notNull(),
  cancellation_policy: text('cancellation_policy'),
  payment_options: paymentOptions('payment_options').array(),
  menu_download_url: text('menu_download_url'),
  sponsored: boolean('sponsored').default(false),
  status: hotelStatus('hotel_status').default('active').notNull(),
  // Hotel management
  management_email: varchar("management_email"),
  management_name: varchar("management_name"),
  // Hotel authentication - password for direct hotel login
  access_password: text('access_password'), // Hashed password for hotel login
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const hotelManagement = pgTable('hotel_management', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  hotel_id: uuid('hotel_id').references(() => hotels.id, { onDelete: 'cascade' }).notNull()
});

// Hotel media with enhanced categorization
export const hotelMedia = pgTable('hotel_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id').references(() => hotels.id, { onDelete: 'cascade' }).notNull(),
  media_type: mediaType('media_type').notNull(),
  media_category: mediaTypeCategories('media_type_categories').notNull(),
  url: varchar('media_url').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const hotelPosts = pgTable('hotel_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id').references(() => hotels.id, { onDelete: 'cascade' }).notNull(),
  caption: varchar('caption').notNull(),
  postDescription: varchar('postDescription').notNull(),
  url: varchar('media_url').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Room types
export const room = pgTable('room', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id').references(() => hotels.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type').notNull(),
  description: text('description'),
  max_occupancy: integer('max_occupancy').notNull(),
  num_beds: integer('num_beds').notNull(),
  room_size: decimal('room_size', { precision: 10, scale: 2 }),
  total_inventory: integer('total_inventory').default(1).notNull(),
  available_inventory: integer('available_inventory').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Room pricing
export const roomPricing = pgTable('room_pricing', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomTypeId: uuid('roomTypeId').references(() => room.id, { onDelete: 'cascade' }).notNull(),
  roomFee: decimal('room_fee', { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal('service_fee', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  tax_percentage: decimal('tax_percentage', { precision: 5, scale: 2 }).notNull(),
  child_policy: text('child_policy'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Room availability tracking
export const roomAvailability = pgTable('room_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomTypeId: uuid('roomTypeId').references(() => room.id, { onDelete: 'cascade' }).notNull(),
  available: boolean('available').default(true).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Price modifiers (seasonal rates, special offers)
export const priceModifiers = pgTable('price_modifiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomTypeId: uuid('roomTypeId').references(() => room.id, { onDelete: 'cascade' }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Bookings
export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => userTable.id).notNull(),
  hotel_id: uuid('hotel_id').references(() => hotels.id).notNull(),
  check_in_date: timestamp('check_in_date').notNull(),
  check_out_date: timestamp('check_out_date').notNull(),
  total_price: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  tx_ref: varchar('tx_ref'),
  payment_status: paymentStatus('payment_status').default("pending").notNull(),
  cancelled: boolean('cancelled_booking').default(false),
  cancellation_timestamp: timestamp('cancellation_timestamp'),
  cancellation_reason: text('cancellation_reason'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const bookingRoomTypes = pgTable('booking_room_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  booking_id: uuid('booking_id').references(() => bookings.id).notNull(),
  roomTypeId: uuid('roomTypeId').references(() => room.id).notNull(),
  num_rooms: integer('num_rooms').notNull(),
  num_guests: integer('num_guests').notNull()
});


// Reviews
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => userTable.id).notNull(),
  hotel_id: uuid('hotel_id').references(() => hotels.id).notNull(),
  rating: decimal('rating').notNull(),
  mediaUrl: text('media_url'),
  review_text: text('review_text'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

/*
// Destinations
export const destinations = pgTable('destinations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  cover_image_url: text('cover_image_url'),
  location_data: text('location_data'),
  featured: boolean('featured').default(false),
  display_order: integer('display_order'),
  season_recommendations: text('season_recommendations').array(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

*/

// Content Discovery
export const videos = pgTable('videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id').references(() => hotels.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  video_url: text('video_url').notNull(),
  thumbnail_url: text('thumbnail_url'),
  view_count: integer('view_count').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const videoLikes = pgTable('video_likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  video_id: uuid('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const videoSaves = pgTable('video_saves', {
  id: uuid('id').defaultRandom().primaryKey(),
  video_id: uuid('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Algorithm-based but can be added manually
/*
export const deals = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  hotel_id: uuid('hotel_id').references(() => hotels.id).notNull(),
  destination_id: uuid('destination_id').references(() => destinations.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  original_price: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  discounted_price: decimal('discounted_price', { precision: 10, scale: 2 }).notNull(),
  discount_percentage: decimal('discount_percentage', { precision: 5, scale: 2 }).notNull(),
  valid_from: date('valid_from').notNull(),
  valid_to: date('valid_to').notNull(),
  terms_conditions: text('terms_conditions'),
  available_inventory: integer('available_inventory').notNull(),
  booking_count: integer('booking_count').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Location-Based
export const recommendedPlaces = pgTable('recommended_places', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  place_type: varchar('place_type', { length: 50 }).notNull(),
  reference_id: uuid('reference_id').notNull(),
  recommendation_reason: text('recommendation_reason'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});
*/

// User Engagement
export const wishlists = pgTable('wishlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => userTable.id).notNull(),
  hotel_id: uuid('hotel_id').references(() => hotels.id).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => userTable.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  expiry_date: timestamp('expiry_date'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

/*
// Support System
export const helpArticles = pgTable('help_articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  view_count: integer('view_count').default(0),
  related_articles: uuid('related_articles').array(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});
*/


export const tourismCategories = pgEnum('tourism_category', [
  'accommodation', 'attraction', 'activity', 'transport', 'permit'
]);

export const tourismEntries = pgTable('tourism_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  category: tourismCategories('category').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  priceRWF: integer('price_rwf').default(0),
  priceUSD: integer('price_usd').default(0),
  pricingDetails: jsonb('pricing_details'),   // <-- add this line
  tags: text('tags').array(),
  bookingContact: varchar('booking_contact', { length: 100 }),
  lastVerified: timestamp('last_verified').defaultNow(),
  createdBy: uuid('created_by').references(() => userTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const itineraries = pgTable('itineraries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  rawText: text('raw_text').notNull(),
  travelDates: varchar('travel_dates', { length: 100 }),
  budget: varchar('budget', { length: 50 }),
  groupSize: integer('group_size'),
  interests: text('interests').array(),
  durationDays: integer('duration_days'),
  rating: integer('rating'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});
