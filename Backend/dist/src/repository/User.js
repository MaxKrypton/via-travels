"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AuthenticationRepository = void 0;
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = require("bcrypt");
const helpers_1 = require("../utils/helpers");
const helpers_2 = require("../utils/helpers");
const bcrypt_2 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const EmailValidator = __importStar(require("email-validator"));
class AuthenticationRepository {
    checkExistingUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield database_1.database
                .select()
                .from(schema_1.userTable)
                .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email))
                .limit(1);
            if (existingUser.length > 0) {
                return {
                    emailValidationStatus: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                    emailValidationMessage: 'User already exists',
                };
            }
            return {
                emailValidationStatus: helpers_1.HttpStatusCodes.OK,
                emailValidationMessage: 'Register user',
            };
        });
    }
    checkExistingUserWithData(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield database_1.database
                .select({
                id: schema_1.userTable.id,
                email: schema_1.userTable.email,
                username: schema_1.userTable.username
            })
                .from(schema_1.userTable)
                .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email));
            if (existingUser.length > 0) {
                return {
                    emailValidationStatus: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                    emailValidationMessage: 'User already exists',
                    data: existingUser[0]
                };
            }
            return {
                emailValidationStatus: helpers_1.HttpStatusCodes.OK,
                emailValidationMessage: 'Register user',
                data: null
            };
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdUser = yield database_1.database
                .insert(schema_1.userTable)
                .values(userData)
                .returning()
                .then((rows) => rows[0]);
            return createdUser;
        });
    }
    createUserRole(role, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdUserRole = yield database_1.database
                .insert(schema_1.userRolesTable)
                .values({
                user_id: userId,
                roles: role
            })
                .returning()
                .then((rows) => rows[0]);
            return createdUserRole;
        });
    }
    validateUserData(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!EmailValidator.validate(userData.email)) {
                return {
                    message: 'Invalid email format',
                    status: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                };
            }
            if (userData.password.length < 8) {
                return {
                    message: 'Password must be at least 8 characters long',
                    status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                };
            }
            return {
                message: "valid email",
                status: helpers_1.HttpStatusCodes.OK
            };
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, bcrypt_1.hash)(password, AuthenticationRepository.SALT_ROUNDS);
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userWithProfile = yield database_1.database
                .select({
                // User fields
                id: schema_1.userTable.id,
                username: schema_1.userTable.username,
                email: schema_1.userTable.email,
                password: schema_1.userTable.password,
                auth_provider: schema_1.userTable.auth_provider,
                email_verified: schema_1.userTable.email_verified,
                user_created_at: schema_1.userTable.created_at,
                user_updated_at: schema_1.userTable.updated_at,
                // Profile fields (will be null if no profile exists)
                profileId: schema_1.userProfiles.id,
                firstName: schema_1.userProfiles.first_name,
                lastName: schema_1.userProfiles.last_name,
                phoneNumber: schema_1.userProfiles.phone_number,
                dateOfBirth: schema_1.userProfiles.date_of_birth,
                avatarUrl: schema_1.userProfiles.avatar_url,
                preferred_language: schema_1.userProfiles.preferred_language,
                preferred_currency: schema_1.userProfiles.preferred_currency,
                profile_created_at: schema_1.userProfiles.created_at,
                profile_updated_at: schema_1.userProfiles.updated_at
            })
                .from(schema_1.userTable)
                .leftJoin(schema_1.userProfiles, (0, drizzle_orm_1.eq)(schema_1.userTable.id, schema_1.userProfiles.user_id))
                .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email))
                .limit(1);
            return userWithProfile[0];
        });
    }
    findUserByEmailForAuth(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.database
                .select({
                id: schema_1.userTable.id,
                username: schema_1.userTable.username,
                email: schema_1.userTable.email,
                password: schema_1.userTable.password,
                email_verified: schema_1.userTable.email_verified,
                preferred_language: schema_1.userProfiles.preferred_language,
                preferred_currency: schema_1.userProfiles.preferred_currency,
                phone_number: schema_1.userProfiles.phone_number,
                role: schema_1.userRolesTable.roles
            })
                .from(schema_1.userTable)
                .leftJoin(schema_1.userProfiles, (0, drizzle_orm_1.eq)(schema_1.userTable.id, schema_1.userProfiles.user_id))
                .leftJoin(schema_1.userRolesTable, (0, drizzle_orm_1.eq)(schema_1.userTable.id, schema_1.userRolesTable.user_id))
                .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email))
                .limit(1);
            return user[0];
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.database
                .select()
                .from(schema_1.userTable)
                .where((0, drizzle_orm_1.eq)(schema_1.userTable.id, userId))
                .limit(1);
            return user;
        });
    }
    comparePasswords(loginDataPassword, userPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const comparePasswordCredentials = yield bcrypt_2.default.compare(loginDataPassword, userPassword);
            return comparePasswordCredentials;
        });
    }
    generateToken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = jsonwebtoken_1.default.sign({ email }, helpers_2.SECRETS.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
            return token;
        });
    }
    generateResetToken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return jsonwebtoken_1.default.sign({ email }, helpers_2.SECRETS.ACCESS_TOKEN_SECRET, { expiresIn: '15min' });
        });
    }
    verifyResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jsonwebtoken_1.default.verify(token, helpers_2.SECRETS.ACCESS_TOKEN_SECRET);
                return payload;
            }
            catch (error) {
                return null;
            }
        });
    }
    updateUserPassword(email, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.database
                .update(schema_1.userTable)
                .set({ password: hashedPassword })
                .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email));
        });
    }
    verifyEmailToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jsonwebtoken_1.default.verify(token, helpers_2.SECRETS.ACCESS_TOKEN_SECRET);
                return payload;
            }
            catch (error) {
                return null;
            }
        });
    }
    markEmailAsVerified(email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.database
                .update(schema_1.userTable)
                .set({ email_verified: true })
                .where((0, drizzle_orm_1.eq)(schema_1.userTable.email, email));
        });
    }
    generateSecurePassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
        const allChars = lowercase + digits + symbols;
        // Random length between 10 and 12
        const length = Math.floor(Math.random() * 3) + 10;
        // Ensure at least one uppercase and one digit
        const guaranteedUpper = uppercase[Math.floor(Math.random() * uppercase.length)];
        const guaranteedDigit = digits[Math.floor(Math.random() * digits.length)];
        let remainingChars = '';
        for (let i = 0; i < length - 2; i++) {
            const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
            remainingChars += randomChar;
        }
        // Mix guaranteed characters with the rest randomly
        const fullPassword = [guaranteedUpper, guaranteedDigit, ...remainingChars].sort(() => Math.random() - 0.5).join('');
        return fullPassword;
    }
}
exports.AuthenticationRepository = AuthenticationRepository;
AuthenticationRepository.SALT_ROUNDS = helpers_2.SECRETS.SALT_ROUNDS;
