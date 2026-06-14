"use strict";
// Hotel-specific authentication service
// Hotels login with their unique Hotel ID instead of email
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelAuthenticationService = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class HotelAuthenticationService {
    /**
     * Hotel Login with Hotel ID
     * Hotels can login using their unique hotel_id and password
     */
    loginWithHotelId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hotel_id, password } = req.body;
                // Validate input
                if (!hotel_id || !password) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        success: false,
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                        message: 'Hotel ID and password are required',
                    });
                }
                // Find hotel by ID
                const hotel = yield database_1.database
                    .select()
                    .from(schema_1.hotels)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotel_id))
                    .limit(1);
                if (!hotel || hotel.length === 0) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        status: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                        message: 'Invalid Hotel ID or password',
                    });
                }
                const hotelData = hotel[0];
                // Check if hotel has a password set
                if (!hotelData.access_password) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        status: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                        message: 'Hotel account not properly configured. Please contact support.',
                    });
                }
                // Verify password
                const isPasswordValid = yield bcrypt_1.default.compare(password, hotelData.access_password);
                if (!isPasswordValid) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        status: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                        message: 'Invalid Hotel ID or password',
                    });
                }
                // Generate JWT token with hotel information
                const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
                const token = jsonwebtoken_1.default.sign({
                    hotel_id: hotelData.id,
                    hotel_name: hotelData.name,
                    hotel_email: hotelData.business_email,
                    type: 'hotel',
                }, tokenSecret, { expiresIn: '7d' });
                // Set cookie
                res.cookie("access_token", token, {
                    httpOnly: true,
                    maxAge: 3600000 * 24 * 7 // 7 days
                });
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: 'Login successful',
                    data: {
                        token: token,
                        hotel: {
                            id: hotelData.id,
                            name: hotelData.name,
                            email: hotelData.business_email,
                            phone: hotelData.business_contact_mobile,
                            address: hotelData.street_address,
                            city: hotelData.city,
                            country: hotelData.country,
                            star_rating: hotelData.star_rating,
                        }
                    }
                });
            }
            catch (error) {
                console.error('Hotel login error:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'An error occurred during login',
                });
            }
        });
    }
    /**
     * Set or update hotel password
     * This allows admin to set initial password for hotels
     */
    setHotelPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hotel_id, new_password } = req.body;
                if (!hotel_id || !new_password) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        success: false,
                        message: 'Hotel ID and new password are required',
                    });
                }
                // Hash the password
                const hashedPassword = yield bcrypt_1.default.hash(new_password, 10);
                // Update hotel password
                yield database_1.database
                    .update(schema_1.hotels)
                    .set({
                    access_password: hashedPassword,
                    updated_at: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotel_id));
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    message: 'Hotel password set successfully',
                    data: {
                        hotel_id: hotel_id
                    }
                });
            }
            catch (error) {
                console.error('Set hotel password error:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'An error occurred while setting password',
                });
            }
        });
    }
    /**
     * Get hotel data by token
     * Middleware will validate the token
     */
    getHotelData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Extract hotel_id from authenticated request
                const hotel_id = (_a = req.hotel) === null || _a === void 0 ? void 0 : _a.hotel_id;
                if (!hotel_id) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: 'Unauthorized access',
                    });
                }
                // Get complete hotel data
                const hotel = yield database_1.database
                    .select()
                    .from(schema_1.hotels)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotel_id))
                    .limit(1);
                if (!hotel || hotel.length === 0) {
                    return res.status(helpers_1.HttpStatusCodes.NOT_FOUND).json({
                        success: false,
                        message: 'Hotel not found',
                    });
                }
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    data: {
                        hotel: hotel[0]
                    }
                });
            }
            catch (error) {
                console.error('Get hotel data error:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'An error occurred',
                });
            }
        });
    }
}
exports.HotelAuthenticationService = HotelAuthenticationService;
