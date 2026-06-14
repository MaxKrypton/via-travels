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
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../utils/config/database");
class GenerateAndStoreOTP {
    generateAndStoreRegistrationOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate 6-digit OTP
            const { OTP, OTP_Expiry } = this.RegistrationOTP();
            // Calculate expiry timestamp
            const expiresAt = OTP_Expiry;
            // Prepare OTP record
            const OTPRecord = {
                email: email,
                code: OTP,
                expiresAt,
                verified: false
            };
            // Store OTP in the database with expiry
            const storeOTP = yield database_1.database.insert(schema_1.otpTable).values({
                email: OTPRecord.email,
                code: OTPRecord.code,
                expires_at: OTPRecord.expiresAt,
                verified: OTPRecord.verified
            }).returning();
            return storeOTP.length > 0 ? OTPRecord.code : "No OTP Generated";
        });
    }
    generateAndUpdateRegistrationOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate 6-digit OTP
            const { OTP, OTP_Expiry } = this.RegistrationOTP();
            // Calculate expiry timestamp
            const expiresAt = OTP_Expiry;
            // Prepare OTP record
            const OTPRecord = {
                email: email,
                code: OTP,
                expiresAt,
                verified: false
            };
            // Store OTP in the database with expiry
            const storeOTP = yield database_1.database.update(schema_1.otpTable).set({
                code: OTPRecord.code,
                expires_at: OTPRecord.expiresAt,
            }).where((0, drizzle_orm_1.eq)(schema_1.otpTable.email, email)).returning();
            return storeOTP.length > 0 ? OTPRecord.code : "No OTP Generated";
        });
    }
    generateAndStoreForgotPasswordOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate a temporary account password
            const PasswordOTP = this.ForgotPasswordOTP();
            // Store OTP in the database with expiry
            yield database_1.database.update(schema_1.userTable).set({
                password: PasswordOTP
            }).where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email));
            return PasswordOTP;
        });
    }
    RegistrationOTP() {
        const generateOTP = crypto_1.default.randomInt(100000, 999999).toString();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return {
            OTP: generateOTP,
            OTP_Expiry: tomorrow
        };
    }
    ForgotPasswordOTP() {
        const generateOTP = crypto_1.default.randomInt(10000000, 99999999).toString();
        return generateOTP;
    }
}
exports.default = new GenerateAndStoreOTP();
