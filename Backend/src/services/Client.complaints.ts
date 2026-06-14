import { Request, Response } from 'express';
import { HttpStatusCodes } from '../utils/helpers';
import { sendComplainsEmail } from '../repository/sendEmails';
import { complaintsDataType } from '../utils/types';
import { emailingOptions } from '../utils/EmailingTemplates';
import { softwareGlitchEmail } from '../repository/sendEmails';

export interface softwareGlitchComplaints {
  name?: string,
  email?: string,
  userRole?: string,
  issueDescription?: string,
  severity?: 'Low' | 'Medium' | 'High' | 'Critical'
}

export class Complaints {
  async sendComplaints(req: Request, res: Response) {
    try {
      const userData = {
        email: req.user?.email as string,
        username: req.user?.username as string,
      }
      const { hotelName, subject, message }: complaintsDataType = req.body;

      await sendComplainsEmail({
        firstname: userData.username,
        complainerEmail: userData.email,
        hotelName,
        subject,
        message
      });
      return res.status(HttpStatusCodes.OK).json({ message: "Complaint sent successfully." });

    } catch (error) {
      console.error("Error sending complaint email:", error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to send complaint." });
    }
  }

  async softwareGlitchComplaints(req: Request, res: Response) {
    try {
      const data = {
        email: req.user?.email as string,
        username: req.user?.username as string,
        role: req.user?.role as string
      }

      const severity = req.body.severity;
      const issueDescription = req.body.issueDescription;

      const glitchEmail = emailingOptions.softwareGlitchReport(data.username, data.email, data.role, issueDescription, severity);

      await softwareGlitchEmail({
        username: data.username as string,
        emailTemplate: glitchEmail
      });
      return res.status(HttpStatusCodes.OK).json({ message: "Software Glitch sent successfully." });
    } catch (error) {
      console.error("Error sending glitch report:", error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to send complaint." });
    }
  }
}

export const ComplaintService = new Complaints();
