"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourismRoutes = void 0;
const express_1 = require("express");
const Tourism_entries_1 = require("../repository/Tourism.entries");
const authMiddleware_1 = require("../middleware/authMiddleware");
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.TourismRoutes = (0, express_1.Router)();
// Public — browse attractions
exports.TourismRoutes.get('/entries', (req, res) => {
    Tourism_entries_1.tourismRepository.getAllEntries(req).then(r => res.status(r.status).json(r));
});
// Protected — generate itinerary
exports.TourismRoutes.post('/itinerary/generate', authMiddleware_1.authMiddleware, (req, res) => {
    Tourism_entries_1.tourismRepository.generateItinerary(req).then(r => res.status(r.status).json(r));
});
// Protected — get my saved itineraries
exports.TourismRoutes.get('/itinerary/saved', authMiddleware_1.authMiddleware, (req, res) => {
    Tourism_entries_1.tourismRepository.getSavedItineraries(req).then(r => res.status(r.status).json(r));
});
// Admin only — manage entries
exports.TourismRoutes.post('/entries', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.viaAdminOnly, (req, res) => {
    Tourism_entries_1.tourismRepository.createEntry(req).then(r => res.status(r.status).json(r));
});
exports.TourismRoutes.patch('/entries/:id', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.viaAdminOnly, (req, res) => {
    Tourism_entries_1.tourismRepository.updateEntry(req).then(r => res.status(r.status).json(r));
});
exports.TourismRoutes.delete('/entries/:id', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.viaAdminOnly, (req, res) => {
    Tourism_entries_1.tourismRepository.deleteEntry(req).then(r => res.status(r.status).json(r));
});
