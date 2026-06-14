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
exports.profileRepository = exports.profileRepo = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const File_upload_1 = __importDefault(require("./File.upload"));
class profileRepo {
    checkExistingProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user_ID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // Only check userProfiles table for existing profile
            const existingProfile = yield database_1.database
                .select({
                profileId: schema_1.userProfiles.id,
            })
                .from(schema_1.userProfiles)
                .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.user_id, user_ID))
                .limit(1);
            return existingProfile.length > 0;
        });
    }
    registerProfile(req, res, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user_ID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                // Check if profile already exists
                const existingProfile = yield this.checkExistingProfile(req, res);
                if (existingProfile) {
                    return {
                        message: "Profile already exists for this user",
                        data: '',
                        status: helpers_1.HttpStatusCodes.UNAUTHORIZED
                    };
                }
                // Upload the profile Image
                const profilePicture = req.file;
                if (!profilePicture) {
                    return {
                        message: "Profile picture is required",
                        data: '',
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                const profilePictureURL = yield File_upload_1.default.uploadFileToS3(profilePicture);
                if (typeof profilePictureURL !== 'string') {
                    return {
                        message: "Failed to upload profile picture",
                        data: '',
                        status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                    };
                }
                profileData.profilePicture = profilePictureURL;
                const data = {
                    user_id: user_ID,
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    phone_number: profileData.phone_number,
                    date_of_birth: profileData.date_of_birth,
                    avatar_url: profileData.profilePicture,
                    preferred_language: profileData.preferred_language || 'en',
                    preferred_currency: profileData.preferred_currency || 'USD'
                };
                const createProfile = yield database_1.database
                    .insert(schema_1.userProfiles)
                    .values(data)
                    .returning();
                return {
                    data: createProfile[0],
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "User Profile Created Successfully"
                };
            }
            catch (error) {
                console.error('Profile registration error:', error);
                return {
                    data: '',
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    updateProfile(req, res, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile_id = req.params.profileId;
            try {
                const data = {
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    phone_number: profileData.phone_number,
                    date_of_birth: profileData.date_of_birth,
                    avatar_url: profileData.avatar_url,
                    preferred_language: profileData.preferred_language,
                    preferred_currency: profileData.preferred_currency
                };
                const updatedProfile = yield database_1.database
                    .update(schema_1.userProfiles)
                    .set(data)
                    .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.id, profile_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: updatedProfile,
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "User Profile Updated Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    getSingleProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profile_id = req.params.profileId;
                const profileData = yield database_1.database
                    .select({
                    // User fields (excluding password)
                    userId: schema_1.userTable.id,
                    profileId: schema_1.userProfiles.id,
                    username: schema_1.userTable.username,
                    firstName: schema_1.userProfiles.first_name,
                    lastName: schema_1.userProfiles.last_name,
                    email: schema_1.userTable.email,
                    default_auth_provider: schema_1.userTable.auth_provider,
                    phoneNumber: schema_1.userProfiles.phone_number,
                    dateOfBirth: schema_1.userProfiles.date_of_birth,
                    avatarUrl: schema_1.userProfiles.avatar_url,
                    preferredLanguage: schema_1.userProfiles.preferred_language,
                    preferredCurrency: schema_1.userProfiles.preferred_currency,
                    createdAt: schema_1.userProfiles.created_at,
                    updatedAt: schema_1.userProfiles.updated_at
                })
                    .from(schema_1.userProfiles)
                    .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.id, profile_id))
                    .innerJoin(schema_1.userTable, (0, drizzle_orm_1.eq)(schema_1.userProfiles.user_id, schema_1.userTable.id));
                return {
                    data: profileData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "User Profile Retrieved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    getAllProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profileData = yield database_1.database
                    .select({
                    userId: schema_1.userTable.id,
                    profileId: schema_1.userProfiles.id,
                    username: schema_1.userTable.username,
                    firstName: schema_1.userProfiles.first_name,
                    lastName: schema_1.userProfiles.last_name,
                    email: schema_1.userTable.email,
                    default_auth_provider: schema_1.userTable.auth_provider,
                    phoneNumber: schema_1.userProfiles.phone_number,
                    dateOfBirth: schema_1.userProfiles.date_of_birth,
                    avatarUrl: schema_1.userProfiles.avatar_url,
                    preferredLanguage: schema_1.userProfiles.preferred_language,
                    preferredCurrency: schema_1.userProfiles.preferred_currency,
                    createdAt: schema_1.userProfiles.created_at,
                    updatedAt: schema_1.userProfiles.updated_at
                })
                    .from(schema_1.userProfiles)
                    .innerJoin(schema_1.userTable, (0, drizzle_orm_1.eq)(schema_1.userProfiles.user_id, schema_1.userTable.id));
                return {
                    data: profileData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "User Profiles Retrieved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    deleteProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile_id = req.params.profileId;
            try {
                const deletedProfile = yield database_1.database
                    .delete(schema_1.userProfiles)
                    .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.id, profile_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: deletedProfile,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "User Profile deleted Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
}
exports.profileRepo = profileRepo;
exports.profileRepository = new profileRepo();
