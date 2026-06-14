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
exports.viaInvitation = void 0;
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const helpers_1 = require("../utils/helpers");
const User_1 = require("./User");
const drizzle_orm_1 = require("drizzle-orm");
const EmailingTemplates_1 = require("../utils/EmailingTemplates");
const sendEmails_1 = require("./sendEmails");
const authData = new User_1.AuthenticationRepository();
class ViaInvitation {
    generateInvitationEmail(req, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            try {
                const inviterRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
                const securePasscode = authData.generateSecurePassword();
                const { inviteeRole } = data;
                // Validate required fields
                if (!data.inviteeUsername || !data.inviteeEmail || !inviteeRole) {
                    return {
                        success: false,
                        message: "Missing required fields: inviteeUsername, inviteeEmail, and inviteeRole are required"
                    };
                }
                // Validate inviter authentication
                if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || !((_c = req.user) === null || _c === void 0 ? void 0 : _c.role)) {
                    return {
                        success: false,
                        message: "Inviter information missing from request. User must be authenticated."
                    };
                }
                if (inviterRole === "via-admin") {
                    const inviteData = {
                        inviteeUsername: data.inviteeUsername,
                        inviteeEmail: data.inviteeEmail,
                        inviterName: (_d = req.user) === null || _d === void 0 ? void 0 : _d.username,
                        inviterRole: (_e = req.user) === null || _e === void 0 ? void 0 : _e.role,
                        inviteeRole: data.inviteeRole,
                        password: securePasscode,
                        hotelId: data.hotelId
                    };
                    // we check the inviteeRole to know which template to send.
                    if (inviteeRole === "via-admin") {
                        // Check if the user exists & which role they currently have. If they have a customer account, update the role otherwise register the via-admin
                        yield this.processViaAdminRegistration(data, securePasscode);
                        const emailTemplate = EmailingTemplates_1.emailingOptions.viaAdminInvitationTemplate(inviteData);
                        yield (0, sendEmails_1.inviteViaAdmin)({
                            inviteeEmail: data.inviteeEmail,
                            inviteeUsername: data.inviteeUsername,
                            emailTemplate: emailTemplate
                        });
                        return { success: true };
                    }
                    else if (inviteeRole === "hotel-manager") {
                        if (!data.hotelId) {
                            return { success: false, message: "Hotel ID is required for hotel manager invitations" };
                        }
                        // Check if the user exists & which role they currently have. We do database queries to get the hotel name to be used in the invitation template & insert the user in the appropriate tables
                        const hotelData = yield this.getHotelData(data.hotelId);
                        if (!hotelData) {
                            return { success: false, message: "Invalid hotel ID provided" };
                        }
                        yield this.processHotelManagerRegistration(data, hotelData, securePasscode);
                        const inviteDataWithHotel = Object.assign(Object.assign({}, inviteData), { hotelName: hotelData.name });
                        const emailTemplate = EmailingTemplates_1.emailingOptions.hotelManagerInvitationTemplate(inviteDataWithHotel, hotelData.name);
                        yield (0, sendEmails_1.inviteHotelManager)({
                            inviteeEmail: data.inviteeEmail,
                            inviteeUsername: data.inviteeUsername,
                            emailTemplate: emailTemplate
                        });
                        return { success: true };
                    }
                    else if (inviteeRole === "customer") {
                        // Check if the user exists & which role they currently have. We insert the user in the db
                        yield this.processCustomerRegistration(data, securePasscode);
                        const emailTemplate = EmailingTemplates_1.emailingOptions.customerInvitationTemplate(inviteData);
                        yield (0, sendEmails_1.inviteCustomer)({
                            inviteeEmail: data.inviteeEmail,
                            inviteeUsername: data.inviteeUsername,
                            emailTemplate: emailTemplate
                        });
                        return { success: true };
                    }
                    return { success: false, message: "User role is out of scope or you don't have appropriate privileges" };
                }
                else if (inviterRole === "hotel-manager") {
                    const inviteData = {
                        inviteeUsername: data.inviteeUsername,
                        inviteeEmail: data.inviteeEmail,
                        inviterName: (_f = req.user) === null || _f === void 0 ? void 0 : _f.username,
                        inviterRole: (_g = req.user) === null || _g === void 0 ? void 0 : _g.role,
                        inviteeRole: data.inviteeRole,
                        password: securePasscode,
                        hotelId: data.hotelId
                    };
                    if (inviteeRole === "hotel-manager") {
                        if (!data.hotelId) {
                            return { success: false, message: "Hotel ID is required for hotel manager invitations" };
                        }
                        // Check if the user exists & which role they currently have. We do database queries to get the hotel name to be used in the invitation template & insert the user in the appropriate tables
                        const hotelData = yield this.getHotelData(data.hotelId);
                        if (!hotelData) {
                            return { success: false, message: "Invalid hotel ID provided" };
                        }
                        yield this.processHotelManagerRegistration(data, hotelData, securePasscode);
                        const inviteDataWithHotel = Object.assign(Object.assign({}, inviteData), { hotelName: hotelData.name });
                        const emailTemplate = EmailingTemplates_1.emailingOptions.hotelManagerInvitationTemplate(inviteDataWithHotel, hotelData.name);
                        yield (0, sendEmails_1.inviteHotelManager)({
                            inviteeEmail: data.inviteeEmail,
                            inviteeUsername: data.inviteeUsername,
                            emailTemplate: emailTemplate
                        });
                        return { success: true };
                    }
                    else if (inviteeRole === "customer") {
                        // Check if the user exists & which role they currently have. We insert the user in the db
                        yield this.processCustomerRegistration(data, securePasscode);
                        const emailTemplate = EmailingTemplates_1.emailingOptions.customerInvitationTemplate(inviteData);
                        yield (0, sendEmails_1.inviteCustomer)({
                            inviteeEmail: data.inviteeEmail,
                            inviteeUsername: data.inviteeUsername,
                            emailTemplate: emailTemplate
                        });
                        return { success: true, emailTemplate };
                    }
                    return { success: false, message: "User role is out of scope or you don't have appropriate privileges" };
                }
                else if (inviterRole === "customer") {
                    const inviteData = {
                        inviteeUsername: data.inviteeUsername,
                        inviteeEmail: data.inviteeEmail,
                        inviterName: (_h = req.user) === null || _h === void 0 ? void 0 : _h.username,
                        inviterRole: (_j = req.user) === null || _j === void 0 ? void 0 : _j.role,
                        inviteeRole: data.inviteeRole,
                        password: securePasscode,
                        hotelId: data.hotelId
                    };
                    if (inviteeRole === "customer") {
                        // Check if the user exists & which role they currently have. We insert the user in the db
                        yield this.processCustomerRegistration(data, securePasscode);
                        const emailTemplate = EmailingTemplates_1.emailingOptions.customerInvitationTemplate(inviteData);
                        yield (0, sendEmails_1.inviteCustomer)({
                            inviteeEmail: data.inviteeEmail,
                            inviteeUsername: data.inviteeUsername,
                            emailTemplate: emailTemplate
                        });
                        return { success: true, emailTemplate };
                    }
                    return { success: false, message: "User role is out of scope or you don't have appropriate privileges" };
                }
                return { success: false, message: "Invalid inviter role" };
            }
            catch (error) {
                console.error('Error generating invitation:', error);
                return { success: false, message: "An error occurred while processing the invitation" };
            }
        });
    }
    processViaAdminRegistration(data, securePasscode) {
        return __awaiter(this, void 0, void 0, function* () {
            const userCheck = yield this.checkUserExistence(data.inviteeEmail);
            if (userCheck.exists) {
                // User exists, update role to via-admin
                yield this.updateUserRole(userCheck.userData.id, 'via-admin');
            }
            else {
                // Create new user and assign via-admin role
                const hashedPassword = yield authData.hashPassword(securePasscode);
                const newUser = yield authData.createUser({
                    username: data.inviteeUsername,
                    email: data.inviteeEmail,
                    password: hashedPassword,
                    email_verified: false
                });
                yield authData.createUserRole('via-admin', newUser.id);
            }
        });
    }
    processHotelManagerRegistration(data, hotelData, securePasscode) {
        return __awaiter(this, void 0, void 0, function* () {
            const userCheck = yield this.checkUserExistence(data.inviteeEmail);
            if (userCheck.exists) {
                // User exists, add hotel-manager role and hotel association
                yield this.updateUserRole(userCheck.userData.id, 'hotel-manager');
                yield this.createHotelManagement(userCheck.userData.id, data.hotelId);
            }
            else {
                // Create new user, assign hotel-manager role, and create hotel association
                const hashedPassword = yield authData.hashPassword(securePasscode);
                const newUser = yield authData.createUser({
                    username: data.inviteeUsername,
                    email: data.inviteeEmail,
                    password: hashedPassword,
                    email_verified: false
                });
                yield authData.createUserRole('hotel-manager', newUser.id);
                yield this.createHotelManagement(newUser.id, data.hotelId);
            }
        });
    }
    processCustomerRegistration(data, securePasscode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userCheck = yield this.checkUserExistence(data.inviteeEmail);
            if (userCheck.exists) {
                // User exists, ensure they have customer role
                if (!((_a = userCheck.currentRoles) === null || _a === void 0 ? void 0 : _a.includes('customer'))) {
                    yield this.updateUserRole(userCheck.userData.id, 'customer');
                }
            }
            else {
                // Create new user and assign customer role
                const hashedPassword = yield authData.hashPassword(securePasscode);
                const newUser = yield authData.createUser({
                    username: data.inviteeUsername,
                    email: data.inviteeEmail,
                    password: hashedPassword,
                    email_verified: false
                });
                yield authData.createUserRole('customer', newUser.id);
            }
        });
    }
    checkUserExistence(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield authData.checkExistingUserWithData(email);
            if (result.emailValidationStatus === helpers_1.HttpStatusCodes.UNAUTHORIZED) {
                // User exists, get their roles
                const roles = yield this.getUserRoles(result.data.id);
                return {
                    exists: true,
                    userData: result.data,
                    currentRoles: roles
                };
            }
            return { exists: false };
        });
    }
    getUserRoles(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield database_1.database
                .select({ role: schema_1.userRolesTable.roles })
                .from(schema_1.userRolesTable)
                .where((0, drizzle_orm_1.eq)(schema_1.userRolesTable.user_id, userId));
            return roles.map(r => r.role);
        });
    }
    updateUserRole(userId, newRole) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user already has this role
            const existingRoles = yield this.getUserRoles(userId);
            if (!existingRoles.includes(newRole)) {
                yield authData.createUserRole(newRole, userId);
            }
        });
    }
    createHotelManagement(userId, hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.database
                .insert(schema_1.hotelManagement)
                .values({
                user_id: userId,
                hotel_id: hotelId
            });
        });
    }
    getHotelData(hotelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotel = yield database_1.database
                .select({
                id: schema_1.hotels.id,
                name: schema_1.hotels.name
            })
                .from(schema_1.hotels)
                .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId))
                .limit(1);
            return hotel.length > 0 ? hotel[0] : null;
        });
    }
}
exports.viaInvitation = new ViaInvitation();
