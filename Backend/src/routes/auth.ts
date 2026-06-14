import express from 'express';
import { Request, Response } from 'express';
import { AuthenticationService } from '../services/authService';
import { authMiddleware } from '../middleware/authMiddleware';
// Create Express router
const Router = express.Router();

// create authService instance
const authService = new AuthenticationService();

Router.post('/register', async (req: Request, res: Response) => {
  authService.register("customer", req, res);
});

Router.post('/register/via-admin', async (req: Request, res: Response) => {
  authService.register("via-admin", req, res);
});

Router.post('/login', async (req: Request, res: Response) => {
  authService.login(req, res);
});

Router.post('/forgot-password', async (req: Request, res: Response) => {
  authService.forgotPassword(req, res);
});

Router.post('/reset-password/:resetToken', async (req: Request, res: Response) => {
  authService.resetPassword(req, res);
});

Router.post('/verify-email/:verifyToken', async (req: Request, res: Response) => {
  authService.verifyEmail(req, res);
});

Router.patch('/update-password', async (req: Request, res: Response) => {
  authService.updatePassword(req, res);
});

Router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  authService.logout(req, res);
});

// Test endpoint to verify email configuration
Router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const { sendEmail } = await import('../repository/mailjet');

    await sendEmail({
      to: email,
      toName: 'Test User',
      subject: '🧪 Nestly Email Test',
      htmlPart: `
        <h2>Email Configuration Test</h2>
        <p>If you receive this email, your Mailjet configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully! Check your inbox.'
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Debug endpoint - Check Mailjet configuration
Router.get('/email-debug', async (req: Request, res: Response) => {
  try {
    const publicKey = process.env.Node_MailJet_APIKEY_PUBLIC;
    const privateKey = process.env.Node_MailJet_APIKEY_PRIVATE;
    const fromEmail = process.env.FROM_EMAIL;

    const status = {
      publicKey: publicKey ? `${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 4)}` : '❌ NOT SET',
      privateKey: privateKey ? `${privateKey.substring(0, 8)}...${privateKey.substring(privateKey.length - 4)}` : '❌ NOT SET',
      fromEmail: fromEmail || '❌ NOT SET',
      allConfigured: !!(publicKey && privateKey && fromEmail)
    };

    return res.status(200).json({
      success: true,
      message: 'Mailjet configuration status',
      config: status,
      instructions: {
        senderVerification: 'Visit https://app.mailjet.com/account/sender to verify sender email',
        apiKeys: 'Check https://app.mailjet.com/account/apikeys for your API keys'
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error checking configuration',
      error: error.message
    });
  }
});


export const authRoutes = Router;
