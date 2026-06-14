import express from 'express';
import { Request, Response } from 'express';
import { ComplaintService } from '../services/Client.complaints';
const Router = express.Router();

Router.post('/send', async (req: Request, res: Response) => {
  ComplaintService.sendComplaints(req, res);
});

Router.post('/glitch/send', async (req: Request, res: Response) => {
  ComplaintService.softwareGlitchComplaints(req, res);
})

export const complaintsRoutes = Router;
