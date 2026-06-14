"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesAndPermissions = exports.PrivilegeMiddleware = exports.UserRole = void 0;
const helpers_1 = require("../utils/helpers");
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["HOTEL_MANAGER"] = "hotel-manager";
    UserRole["VIA_ADMIN"] = "via-admin";
})(UserRole || (exports.UserRole = UserRole = {}));
class PrivilegeMiddleware {
    customerPermitted(req, res, next) {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === UserRole.CUSTOMER) {
            return next();
        }
        return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only guests can access this resource' });
    }
    customerNotPermitted(req, res, next) {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === UserRole.CUSTOMER) {
            return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Guests are not allowed to perform this action' });
        }
        return next();
    }
    hotelManagerPermitted(req, res, next) {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === UserRole.HOTEL_MANAGER) {
            return next();
        }
        return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only hotel managers can access this resource' });
    }
    hotelManagerNotPermitted(req, res, next) {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === UserRole.HOTEL_MANAGER) {
            return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Hotel Managers are not allowed to perform this action' });
        }
        return next();
    }
    viaAdminOnly(req, res, next) {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === UserRole.VIA_ADMIN) {
            return next();
        }
        return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only via-admins can access this resource' });
    }
    hotelManagerOrAdminPermitted(req, res, next) {
        var _a;
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (role === UserRole.HOTEL_MANAGER || role === UserRole.VIA_ADMIN) {
            return next();
        }
        return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only hotel managers or via-admins can access this resource' });
    }
}
exports.PrivilegeMiddleware = PrivilegeMiddleware;
exports.rolesAndPermissions = new PrivilegeMiddleware();
