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
exports.InvitationRoutes = void 0;
const express_1 = require("express");
const invitations_1 = require("../repository/invitations");
exports.InvitationRoutes = (0, express_1.Router)();
exports.InvitationRoutes.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invitationData = req.body;
        // Validate required fields from request body
        if (!invitationData.inviteeUsername || !invitationData.inviteeEmail || !invitationData.inviteeRole) {
            return res.status(400).json({
                error: 'Missing required fields: inviteeUsername, inviteeEmail, and inviteeRole are required'
            });
        }
        // Validate invitee role
        const validRoles = ['customer', 'hotel-manager', 'via-admin'];
        if (!validRoles.includes(invitationData.inviteeRole)) {
            return res.status(400).json({
                error: 'Invalid inviteeRole. Must be one of: customer, hotel-manager, via-admin'
            });
        }
        // Check if user is authenticated (inviter details come from here)
        if (!req.user || !req.user.username || !req.user.role) {
            return res.status(401).json({
                error: 'Authentication required. Inviter details must be available in request.'
            });
        }
        const result = yield invitations_1.viaInvitation.generateInvitationEmail(req, invitationData);
        if (result.success) {
            return res.status(200).json({
                message: 'Invitation sent successfully',
            });
        }
        else {
            return res.status(400).json({ error: result.message });
        }
    }
    catch (error) {
        console.error('Error in invitation route:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}));
