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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelAuthMiddleware = void 0;
const helpers_1 = require("../utils/helpers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const hotelAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || req.cookies.access_token;
        if (!token) {
            return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                message: "Access denied. No Token Provided"
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, helpers_1.SECRETS.ACCESS_TOKEN_SECRET);
            console.log('Decoded hotel token:', decoded);
            // Verify this is a hotel token
            if (decoded.type !== 'hotel') {
                return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                    message: 'Invalid token type. Hotel authentication required.'
                });
            }
            // Verify hotel exists in database
            const [hotel] = yield database_1.database
                .select()
                .from(schema_1.hotels)
                .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, decoded.hotel_id))
                .limit(1);
            if (!hotel) {
                console.log('No hotel found for ID:', decoded.hotel_id);
                return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid hotel token' });
            }
            // Attach hotel info to request
            req.hotel = {
                id: hotel.id,
                name: hotel.name,
                email: hotel.business_email,
                type: 'hotel'
            };
            // Also set req.user for backwards compatibility with some endpoints
            req.user = {
                id: hotel.id,
                email: hotel.business_email || '',
                role: 'hotel',
                email_verified: true,
                username: hotel.name,
                preferred_currency: 'RWF',
                preferred_language: 'en',
                phone_number: hotel.business_contact_mobile || ''
            };
            next();
        }
        catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred', error });
    }
});
exports.hotelAuthMiddleware = hotelAuthMiddleware;
