"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itineraries = exports.tourismEntries = exports.tourismCategories = exports.notifications = exports.wishlists = exports.videoSaves = exports.videoLikes = exports.videos = exports.reviews = exports.bookingRoomTypes = exports.bookings = exports.priceModifiers = exports.roomAvailability = exports.roomPricing = exports.room = exports.hotelPosts = exports.hotelMedia = exports.hotelManagement = exports.hotels = exports.otpTable = exports.userProfiles = exports.userRolesTable = exports.userTable = exports.paymentStatus = exports.mediaTypeCategories = exports.mediaType = exports.Roles = exports.paymentOptions = exports.hotelStatus = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Enums
exports.hotelStatus = (0, pg_core_1.pgEnum)("hotel_status", ["active", "inactive"]);
exports.paymentOptions = (0, pg_core_1.pgEnum)('payment_options', ["Visa", "MasterCard", "Momo", "Irembo"]);
exports.Roles = (0, pg_core_1.pgEnum)('roles', ["customer", "hotel-manager", "via-admin"]);
exports.mediaType = (0, pg_core_1.pgEnum)('media_type', ['photo', 'video']);
exports.mediaTypeCategories = (0, pg_core_1.pgEnum)('media_type_categories', ['landscape', 'portrait', 'profile', 'room', 'gallery', 'sponsored', 'virtualTours']);
exports.paymentStatus = (0, pg_core_1.pgEnum)("payment_status", ["pending", "completed", "failed", "cancelled"]);
// userTable & Profiles
exports.userTable = (0, pg_core_1.pgTable)('user_table', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    username: (0, pg_core_1.varchar)('username', { length: 50 }).notNull().unique(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.text)('password'),
    auth_provider: (0, pg_core_1.varchar)('auth_provider', { length: 20 }).default('email'),
    email_verified: (0, pg_core_1.boolean)('email_verified').default(false),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.userRolesTable = (0, pg_core_1.pgTable)('user_roles_table', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id, { onDelete: 'cascade' }).notNull(),
    roles: (0, exports.Roles)('roles').default("customer").notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.userProfiles = (0, pg_core_1.pgTable)('user_profiles', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id, { onDelete: 'cascade' }).notNull(),
    first_name: (0, pg_core_1.varchar)('first_name', { length: 50 }),
    last_name: (0, pg_core_1.varchar)('last_name', { length: 50 }),
    phone_number: (0, pg_core_1.varchar)('phone_number', { length: 20 }),
    date_of_birth: (0, pg_core_1.date)('date_of_birth'),
    avatar_url: (0, pg_core_1.text)('avatar_url'),
    preferred_language: (0, pg_core_1.varchar)('preferred_language', { length: 10 }).default('en'),
    preferred_currency: (0, pg_core_1.varchar)('preferred_currency', { length: 3 }).default('USD'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.otpTable = (0, pg_core_1.pgTable)("OTP", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    code: (0, pg_core_1.varchar)("code", { length: 6 }).notNull(), // 6-digit OTP code
    expires_at: (0, pg_core_1.timestamp)("expires_at").notNull(), // Expiration time
    verified: (0, pg_core_1.boolean)("verified").notNull().default(false),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Core hotel information
exports.hotels = (0, pg_core_1.pgTable)('hotels', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    short_description: (0, pg_core_1.text)('short_description'),
    long_description: (0, pg_core_1.text)('long_description'),
    star_rating: (0, pg_core_1.decimal)('star_rating').notNull(),
    property_type: (0, pg_core_1.varchar)('property_type', { length: 50 }).notNull(),
    built_year: (0, pg_core_1.integer)('built_year'),
    last_renovation_year: (0, pg_core_1.integer)('last_renovation_year'),
    category: (0, pg_core_1.varchar)('chain_affiliation', { length: 100 }),
    // Hotel Location
    street_address: (0, pg_core_1.text)('street_address').notNull(),
    city: (0, pg_core_1.varchar)('city', { length: 100 }).notNull(),
    state: (0, pg_core_1.varchar)('state', { length: 100 }).notNull(),
    province: (0, pg_core_1.varchar)('province', { length: 100 }),
    country: (0, pg_core_1.varchar)('country', { length: 100 }).notNull(),
    postal_code: (0, pg_core_1.varchar)('postal_code', { length: 20 }),
    latitude: (0, pg_core_1.decimal)('latitude', { precision: 10, scale: 7 }),
    longitude: (0, pg_core_1.decimal)('longitude', { precision: 10, scale: 7 }),
    map_url: (0, pg_core_1.text)('map_url'),
    // Banking data
    account_bank: (0, pg_core_1.varchar)('account_bank'),
    account_number: (0, pg_core_1.varchar)('account_number'),
    bank_name: (0, pg_core_1.varchar)('bank_name'),
    subaccount_id: (0, pg_core_1.varchar)('subaccount_id'),
    business_mobile: (0, pg_core_1.varchar)('business_mobile'),
    business_email: (0, pg_core_1.varchar)('business_email'),
    business_contact: (0, pg_core_1.varchar)('business_contact'),
    business_contact_mobile: (0, pg_core_1.varchar)('business_contact_mobile'),
    //hotel services
    total_rooms: (0, pg_core_1.integer)('total_rooms').notNull(),
    cancellation_policy: (0, pg_core_1.text)('cancellation_policy'),
    payment_options: (0, exports.paymentOptions)('payment_options').array(),
    menu_download_url: (0, pg_core_1.text)('menu_download_url'),
    sponsored: (0, pg_core_1.boolean)('sponsored').default(false),
    status: (0, exports.hotelStatus)('hotel_status').default('active').notNull(),
    // Hotel management
    management_email: (0, pg_core_1.varchar)("management_email"),
    management_name: (0, pg_core_1.varchar)("management_name"),
    // Hotel authentication - password for direct hotel login
    access_password: (0, pg_core_1.text)('access_password'), // Hashed password for hotel login
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.hotelManagement = (0, pg_core_1.pgTable)('hotel_management', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id, { onDelete: 'cascade' }).notNull(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id, { onDelete: 'cascade' }).notNull()
});
// Hotel media with enhanced categorization
exports.hotelMedia = (0, pg_core_1.pgTable)('hotel_media', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id, { onDelete: 'cascade' }).notNull(),
    media_type: (0, exports.mediaType)('media_type').notNull(),
    media_category: (0, exports.mediaTypeCategories)('media_type_categories').notNull(),
    url: (0, pg_core_1.varchar)('media_url').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.hotelPosts = (0, pg_core_1.pgTable)('hotel_posts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id, { onDelete: 'cascade' }).notNull(),
    caption: (0, pg_core_1.varchar)('caption').notNull(),
    postDescription: (0, pg_core_1.varchar)('postDescription').notNull(),
    url: (0, pg_core_1.varchar)('media_url').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// Room types
exports.room = (0, pg_core_1.pgTable)('room', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id, { onDelete: 'cascade' }).notNull(),
    type: (0, pg_core_1.varchar)('type').notNull(),
    description: (0, pg_core_1.text)('description'),
    max_occupancy: (0, pg_core_1.integer)('max_occupancy').notNull(),
    num_beds: (0, pg_core_1.integer)('num_beds').notNull(),
    room_size: (0, pg_core_1.decimal)('room_size', { precision: 10, scale: 2 }),
    total_inventory: (0, pg_core_1.integer)('total_inventory').default(1).notNull(),
    available_inventory: (0, pg_core_1.integer)('available_inventory').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// Room pricing
exports.roomPricing = (0, pg_core_1.pgTable)('room_pricing', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    roomTypeId: (0, pg_core_1.uuid)('roomTypeId').references(() => exports.room.id, { onDelete: 'cascade' }).notNull(),
    roomFee: (0, pg_core_1.decimal)('room_fee', { precision: 10, scale: 2 }).notNull(),
    serviceFee: (0, pg_core_1.decimal)('service_fee', { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('USD').notNull(),
    tax_percentage: (0, pg_core_1.decimal)('tax_percentage', { precision: 5, scale: 2 }).notNull(),
    child_policy: (0, pg_core_1.text)('child_policy'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// Room availability tracking
exports.roomAvailability = (0, pg_core_1.pgTable)('room_availability', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    roomTypeId: (0, pg_core_1.uuid)('roomTypeId').references(() => exports.room.id, { onDelete: 'cascade' }).notNull(),
    available: (0, pg_core_1.boolean)('available').default(true).notNull(),
    date: (0, pg_core_1.timestamp)('date').defaultNow().notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// Price modifiers (seasonal rates, special offers)
exports.priceModifiers = (0, pg_core_1.pgTable)('price_modifiers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    roomTypeId: (0, pg_core_1.uuid)('roomTypeId').references(() => exports.room.id, { onDelete: 'cascade' }).notNull(),
    percentage: (0, pg_core_1.decimal)('percentage', { precision: 5, scale: 2 }).notNull(),
    start_date: (0, pg_core_1.timestamp)('start_date').notNull(),
    end_date: (0, pg_core_1.timestamp)('end_date').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// Bookings
exports.bookings = (0, pg_core_1.pgTable)('bookings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id).notNull(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id).notNull(),
    check_in_date: (0, pg_core_1.timestamp)('check_in_date').notNull(),
    check_out_date: (0, pg_core_1.timestamp)('check_out_date').notNull(),
    total_price: (0, pg_core_1.decimal)('total_price', { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('USD').notNull(),
    tx_ref: (0, pg_core_1.varchar)('tx_ref'),
    payment_status: (0, exports.paymentStatus)('payment_status').default("pending").notNull(),
    cancelled: (0, pg_core_1.boolean)('cancelled_booking').default(false),
    cancellation_timestamp: (0, pg_core_1.timestamp)('cancellation_timestamp'),
    cancellation_reason: (0, pg_core_1.text)('cancellation_reason'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.bookingRoomTypes = (0, pg_core_1.pgTable)('booking_room_types', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    booking_id: (0, pg_core_1.uuid)('booking_id').references(() => exports.bookings.id).notNull(),
    roomTypeId: (0, pg_core_1.uuid)('roomTypeId').references(() => exports.room.id).notNull(),
    num_rooms: (0, pg_core_1.integer)('num_rooms').notNull(),
    num_guests: (0, pg_core_1.integer)('num_guests').notNull()
});
// Reviews
exports.reviews = (0, pg_core_1.pgTable)('reviews', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id).notNull(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id).notNull(),
    rating: (0, pg_core_1.decimal)('rating').notNull(),
    mediaUrl: (0, pg_core_1.text)('media_url'),
    review_text: (0, pg_core_1.text)('review_text'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
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
exports.videos = (0, pg_core_1.pgTable)('videos', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    video_url: (0, pg_core_1.text)('video_url').notNull(),
    thumbnail_url: (0, pg_core_1.text)('thumbnail_url'),
    view_count: (0, pg_core_1.integer)('view_count').default(0),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.videoLikes = (0, pg_core_1.pgTable)('video_likes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    video_id: (0, pg_core_1.uuid)('video_id').references(() => exports.videos.id, { onDelete: 'cascade' }).notNull(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id, { onDelete: 'cascade' }).notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.videoSaves = (0, pg_core_1.pgTable)('video_saves', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    video_id: (0, pg_core_1.uuid)('video_id').references(() => exports.videos.id, { onDelete: 'cascade' }).notNull(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id, { onDelete: 'cascade' }).notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
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
exports.wishlists = (0, pg_core_1.pgTable)('wishlists', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id).notNull(),
    hotel_id: (0, pg_core_1.uuid)('hotel_id').references(() => exports.hotels.id).notNull(),
    notes: (0, pg_core_1.text)('notes'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// Notifications
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    read: (0, pg_core_1.boolean)('read').default(false),
    expiry_date: (0, pg_core_1.timestamp)('expiry_date'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
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
// Via Travels — Tourism Data
exports.tourismCategories = (0, pg_core_1.pgEnum)('tourism_category', [
    'accommodation', 'attraction', 'activity', 'transport', 'permit'
]);
exports.tourismEntries = (0, pg_core_1.pgTable)('tourism_entries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    category: (0, exports.tourismCategories)('category').notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    location: (0, pg_core_1.varchar)('location', { length: 255 }),
    priceRWF: (0, pg_core_1.integer)('price_rwf').default(0),
    priceUSD: (0, pg_core_1.integer)('price_usd').default(0),
    tags: (0, pg_core_1.text)('tags').array(),
    bookingContact: (0, pg_core_1.varchar)('booking_contact', { length: 100 }),
    lastVerified: (0, pg_core_1.timestamp)('last_verified').defaultNow(),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.userTable.id),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.itineraries = (0, pg_core_1.pgTable)('itineraries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.userTable.id, { onDelete: 'cascade' }).notNull(),
    rawText: (0, pg_core_1.text)('raw_text').notNull(),
    travelDates: (0, pg_core_1.varchar)('travel_dates', { length: 100 }),
    budget: (0, pg_core_1.varchar)('budget', { length: 50 }),
    groupSize: (0, pg_core_1.integer)('group_size'),
    interests: (0, pg_core_1.text)('interests').array(),
    durationDays: (0, pg_core_1.integer)('duration_days'),
    rating: (0, pg_core_1.integer)('rating'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
