"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRoute = void 0;
const express_1 = require("express");
const profile_1 = require("../services/profile");
const multer_1 = require("../utils/config/multer");
const contentAwareImageMiddleware_1 = __importDefault(require("../middleware/contentAwareImageMiddleware"));
const authMiddleware_1 = require("../middleware/authMiddleware");
exports.ProfileRoute = (0, express_1.Router)();
// get all user profiles
exports.ProfileRoute.get('/all-profiles', authMiddleware_1.authMiddleware, (req, res) => {
    return profile_1.profileService.getAllProfile(req, res);
});
// get a specific user profile
exports.ProfileRoute.get('/:profileId', authMiddleware_1.authMiddleware, (req, res) => {
    return profile_1.profileService.getSpecificProfile(req, res);
});
// Register a user profile
exports.ProfileRoute.post('/register', authMiddleware_1.authMiddleware, multer_1.upload.single('profilePicture'), (0, contentAwareImageMiddleware_1.default)({
    maxWidth: 500,
    maxHeight: 500,
    quality: 85
}), (req, res) => {
    return profile_1.profileService.registerProfile(req, res);
});
// Update a user Profile
exports.ProfileRoute.patch('/update/:profileId', authMiddleware_1.authMiddleware, multer_1.upload.single('profilePicture'), (0, contentAwareImageMiddleware_1.default)({
    maxWidth: 500,
    maxHeight: 500,
    quality: 85
}), (req, res) => {
    return profile_1.profileService.updateProfile(req, res);
});
// Delete a user Profile
exports.ProfileRoute.delete('/delete/:profileId', authMiddleware_1.authMiddleware, (req, res) => {
    return profile_1.profileService.deleteProfile(req, res);
});
