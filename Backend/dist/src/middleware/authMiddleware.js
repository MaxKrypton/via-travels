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
exports.authMiddleware = void 0;
const helpers_1 = require("../utils/helpers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../repository/User");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            console.log('Decoded token:', decoded);
            const authRepository = new User_1.AuthenticationRepository();
            const user = yield authRepository.findUserByEmailForAuth(decoded.email);
            console.log('Found user:', user);
            if (!user) {
                console.log('No user found for email:', decoded.email);
                return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
            }
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                email_verified: user.email_verified,
                username: user.username,
                preferred_currency: user.preferred_currency,
                preferred_language: user.preferred_language,
                phone_number: user.phone_number
            };
            next();
        }
        catch (jwtError) {
            return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid token', jwtError });
        }
    }
    catch (error) {
        return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred', error });
    }
});
exports.authMiddleware = authMiddleware;
