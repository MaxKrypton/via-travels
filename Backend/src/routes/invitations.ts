import { InvitationData } from './../utils/types';
import { Router, Request, Response } from "express";
import { viaInvitation } from "../repository/invitations"

export const InvitationRoutes = Router();


InvitationRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const invitationData: InvitationData = req.body;

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

    const result = await viaInvitation.generateInvitationEmail(req, invitationData);

    if (result.success) {
      return res.status(200).json({
        message: 'Invitation sent successfully',
      });
    } else {
      return res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error in invitation route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
