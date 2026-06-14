"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../utils/config/schema");
const User_1 = require("./User");
const sendEmails_1 = require("./sendEmails");
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(helpers_1.SECRETS.FLW_PUBLIC_KEY, helpers_1.SECRETS.FLW_SECRET_KEY);
const AuthData = new User_1.AuthenticationRepository();
class Hotels {
    // Create - Register New Hotel
    createHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hotelData = {
                    name: req.body.name,
                    short_description: req.body.short_description,
                    long_description: req.body.long_description,
                    star_rating: req.body.star_rating,
                    property_type: req.body.property_type,
                    built_year: req.body.built_year,
                    last_renovation_year: req.body.last_renovation_year,
                    category: req.body.category,
                    street_address: req.body.street_address,
                    city: req.body.city,
                    state: req.body.state,
                    province: req.body.province,
                    country: req.body.country,
                    postal_code: req.body.postal_code,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    map_url: req.body.map_url,
                    total_rooms: req.body.total_rooms,
                    cancellation_policy: req.body.cancellation_policy,
                    payment_options: req.body.payment_options,
                    menu_download_url: req.body.menu_download_url,
                    sponsored: req.body.sponsored,
                    status: req.body.status,
                    management_email: req.body.management_email,
                    management_name: req.body.management_name
                };
                const hotelDataSubAccountPayload = {
                    account_bank: req.body.account_bank,
                    account_number: req.body.account_number,
                    business_name: hotelData.name,
                    country: "RW",
                    business_mobile: req.body.business_mobile,
                    business_email: req.body.business_email,
                    business_contact: req.body.business_contact,
                    business_contact_mobile: req.body.business_contact_mobile,
                    split_type: 'percentage',
                    split_value: 0.05,
                };
                // First Create a payment subAccount
                const response = yield flw.Subaccount.create(hotelDataSubAccountPayload);
                console.log(response);
                const { status, message } = response;
                if (status === "success") {
                    const subAccountInfo = response.data;
                    const hotelPayload = Object.assign(Object.assign({}, hotelData), { account_bank: subAccountInfo.account_bank, account_number: subAccountInfo.account_number, bank_name: subAccountInfo.bank_name, business_name: hotelData.name, subaccount_id: subAccountInfo.subaccount_id, country: "RW", business_mobile: req.body.business_mobile, business_email: req.body.business_email, business_contact: req.body.business_contact, business_contact_mobile: req.body.business_contact_mobile, split_type: 'percentage', split_value: 0.05 });
                    const [createdHotel] = yield database_1.database
                        .insert(schema_1.hotels)
                        .values(hotelPayload)
                        .returning();
                    const userExists = yield AuthData.checkExistingUserWithData(hotelData.management_email);
                    const { emailValidationMessage, emailValidationStatus, data } = userExists;
                    if (emailValidationStatus !== helpers_1.HttpStatusCodes.OK) {
                        // a user exists, we need to update records in the hotel management Table
                        yield database_1.database.insert(schema_1.hotelManagement).values({
                            user_id: data === null || data === void 0 ? void 0 : data.id,
                            hotel_id: createdHotel.id
                        });
                        // a user exists, we need to update the roles to hotel manager
                        yield database_1.database.update(schema_1.userRolesTable).set({
                            user_id: data === null || data === void 0 ? void 0 : data.id,
                            roles: "hotel-manager"
                        });
                    }
                    // Register user's email and update records in the hotel management
                    // Generate password
                    const password = AuthData.generateSecurePassword();
                    const hashedPassword = yield AuthData.hashPassword(password);
                    const newUser = yield AuthData.createUser({
                        username: hotelData.management_name,
                        email: hotelData.management_email,
                        password: hashedPassword,
                        email_verified: false
                    });
                    // Insert Credentials into Hotel Management
                    yield database_1.database.insert(schema_1.hotelManagement).values({
                        user_id: newUser.id,
                        hotel_id: createdHotel.id
                    });
                    yield database_1.database.insert(schema_1.userRolesTable).values({
                        user_id: newUser.id,
                        roles: "hotel-manager"
                    });
                    yield (0, sendEmails_1.sendHotelManagementCredentials)({
                        username: newUser.username,
                        password,
                        managerEmail: newUser.email,
                        subject: "Your Hotel Management Access Credentials"
                    });
                    console.log("This is the Hotel Manager password ", password);
                    return {
                        data: createdHotel,
                        message: 'Hotel profile successfully created. Security credentials for hotel management have been sent via email.',
                        status: helpers_1.HttpStatusCodes.CREATED,
                    };
                }
                return {
                    message: `Something went wrong while registering Banking data`,
                    status: helpers_1.HttpStatusCodes.CREATED,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Read - Get All Hotels
    getAllHotels() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rawResults = yield database_1.database
                    .select({
                    // Hotel details
                    id: schema_1.hotels.id,
                    name: schema_1.hotels.name,
                    shortDescription: schema_1.hotels.short_description,
                    longDescription: schema_1.hotels.long_description,
                    starRating: schema_1.hotels.star_rating,
                    propertyType: schema_1.hotels.property_type,
                    builtYear: schema_1.hotels.built_year,
                    lastRenovationYear: schema_1.hotels.last_renovation_year,
                    category: schema_1.hotels.category,
                    // Location details
                    streetAddress: schema_1.hotels.street_address,
                    city: schema_1.hotels.city,
                    state: schema_1.hotels.state,
                    province: schema_1.hotels.province,
                    country: schema_1.hotels.country,
                    postalCode: schema_1.hotels.postal_code,
                    latitude: schema_1.hotels.latitude,
                    longitude: schema_1.hotels.longitude,
                    mapUrl: schema_1.hotels.map_url,
                    // Services
                    totalRooms: schema_1.hotels.total_rooms,
                    cancellationPolicy: schema_1.hotels.cancellation_policy,
                    paymentOptions: schema_1.hotels.payment_options,
                    menuDownloadUrl: schema_1.hotels.menu_download_url,
                    sponsored: schema_1.hotels.sponsored,
                    status: schema_1.hotels.status,
                    // Media details
                    media: schema_1.hotelMedia
                })
                    .from(schema_1.hotels)
                    .leftJoin(schema_1.hotelMedia, (0, drizzle_orm_1.eq)(schema_1.hotels.id, schema_1.hotelMedia.hotel_id))
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.status, 'active'));
                // Process results to group by hotel
                const hotelsMap = new Map();
                rawResults.forEach(row => {
                    if (!hotelsMap.has(row.id)) {
                        hotelsMap.set(row.id, Object.assign(Object.assign({}, row), { media: row.media ? [row.media] : [] }));
                    }
                    else {
                        if (row.media) {
                            hotelsMap.get(row.id).media.push(row.media);
                        }
                    }
                });
                const hotelsWithMedia = Array.from(hotelsMap.values());
                return {
                    data: hotelsWithMedia,
                    message: 'Hotels fetched successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Read - Get Specific Hotel
    getSpecificHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotelId = req.params.hotelId;
            try {
                // Fetch Hotel Base Information
                const hotelBase = yield database_1.database
                    .select()
                    .from(schema_1.hotels)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId))
                    .execute();
                if (hotelBase.length === 0) {
                    return {
                        data: null,
                        message: 'Hotel not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                // Fetch Media in a separate query
                const mediaList = yield database_1.database
                    .select({
                    id: schema_1.hotelMedia.id,
                    mediaType: schema_1.hotelMedia.media_type,
                    url: schema_1.hotelMedia.url,
                })
                    .from(schema_1.hotelMedia)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotelMedia.hotel_id, hotelId))
                    .execute();
                // Fetch Rooms with Pricing
                const roomsWithPricing = yield database_1.database
                    .select({
                    roomId: schema_1.room.id,
                    roomType: schema_1.room.type,
                    maxOccupancy: schema_1.room.max_occupancy,
                    roomFee: schema_1.roomPricing.roomFee,
                    serviceFee: schema_1.roomPricing.serviceFee,
                    currency: schema_1.roomPricing.currency,
                })
                    .from(schema_1.room)
                    .leftJoin(schema_1.roomPricing, (0, drizzle_orm_1.eq)(schema_1.room.id, schema_1.roomPricing.roomTypeId))
                    .where((0, drizzle_orm_1.eq)(schema_1.room.hotel_id, hotelId))
                    .execute();
                // Construct complete hotel profile
                const hotelProfile = Object.assign(Object.assign({}, hotelBase[0]), { media: mediaList, rooms: roomsWithPricing });
                return {
                    data: hotelProfile,
                    message: 'Hotel Profile fetched successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                console.error('Hotel Profile Fetch Error:', error);
                return {
                    data: null,
                    message: `Error retrieving hotel profile, ${error}`,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    getHotelById(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch Hotel Base Information
                const [hotelBase] = yield database_1.database
                    .select()
                    .from(schema_1.hotels)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId))
                    .execute();
                if (!hotelBase) {
                    return {
                        data: null,
                        message: 'Hotel not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                return {
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Hotel Profile Data fetched successfully",
                    data: hotelBase
                };
            }
            catch (error) {
                console.error('Hotel Profile Fetch Error:', error);
                return {
                    data: null,
                    message: `Error retrieving hotel profile, ${error}`,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Update - Update Hotel
    updateHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotelId = req.params.hotelId;
            const updateData = req.body;
            try {
                const [existingHotel] = yield database_1.database
                    .select()
                    .from(schema_1.hotels)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId));
                if (!existingHotel) {
                    return {
                        data: null,
                        message: 'Hotel not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                const updatedData = Object.assign(Object.assign(Object.assign(Object.assign({}, updateData), (updateData.check_in_time && {
                    check_in_time: new Date(updateData.check_in_time),
                })), (updateData.check_out_time && {
                    check_out_time: new Date(updateData.check_out_time),
                })), { updated_at: new Date() });
                const [updatedHotel] = yield database_1.database
                    .update(schema_1.hotels)
                    .set(updatedData)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId))
                    .returning();
                return {
                    data: updatedHotel,
                    message: 'Hotel updated successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Delete - Delete Specific Hotel (Soft Delete)
    deleteHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotelId = req.params.hotelId;
            try {
                const [deletedHotel] = yield database_1.database
                    .update(schema_1.hotels)
                    .set({
                    status: 'inactive',
                    updated_at: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId))
                    .returning();
                if (!deletedHotel) {
                    return {
                        data: null,
                        message: 'Hotel not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                return {
                    data: deletedHotel,
                    message: 'Hotel deleted successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
}
exports.hotelRepository = new Hotels();
