import { sendEmail } from '../repository/mailjet';
import { sendEmailViaNodemailer } from '../repository/nodemailer';
import { emailingOptions } from '../utils/EmailingTemplates';
import { SECRETS } from "../utils/helpers";

// Unified sender: tries Gmail (nodemailer) first, falls back to Mailjet
async function sendEmailWithFallback(data: {
  to: string;
  toName?: string;
  subject: string;
  htmlPart: string;
  textPart?: string;
}): Promise<void> {
  try {
    await sendEmailViaNodemailer(data);
  } catch (nodemailerErr) {
    console.warn('⚠️  Gmail/Nodemailer failed, trying Mailjet fallback...', nodemailerErr);
    await sendEmail(data);
  }
}

type EmailFormat = {
  complainerEmail?: string,
  email?: string,
  firstname?: string,
  username?: string,
  managerEmail?: string,
  password?: string
  subject?: string,
  hotelName?: string,
  message?: string,
  inviteeUsername?: string,
  inviteeEmail?: string,
  emailTemplate?: string
}

export async function sendComplainsEmail({
  firstname,
  complainerEmail,
  hotelName,
  subject,
  message
}: EmailFormat): Promise<void> {
  // Get the complaint email template
  const complainsEmails = emailingOptions.clientComplains(
    firstname as string,
    complainerEmail as string,
    hotelName as string,
    subject as string,
    message as string
  );

  const viaEmail = "atnestly@gmail.com"

  try {
    await sendEmailWithFallback({
      to: viaEmail,
      toName: "Hotel Complaints Team",
      subject: subject as string,
      htmlPart: complainsEmails,
    });
  } catch (error) {
    console.error('Error sending complaint email:', error);
    throw new Error('Failed to send complaint email');
  }
}

export async function sendHotelManagementCredentials({
  username,
  password,
  managerEmail,
  subject
}: EmailFormat): Promise<void> {
  // Get the credentials email template
  const emailTemplateFormat = emailingOptions.temporaryHotelAdminLoginPassword(
    username as string,
    password as string
  );

  try {
    await sendEmailWithFallback({
      to: managerEmail as string,
      toName: "Hotel Manager",
      subject: subject || 'Hotel Management Credentials',
      htmlPart: emailTemplateFormat,
    });
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw new Error('Failed to send credentials email');
  }
}

export async function sendForgotPasswordEmail({
  firstname,
  password,
  email
}: EmailFormat): Promise<void> {
  const emailTemplate = emailingOptions.forgotPassword(
    firstname as string,
    password as string
  );

  try {
    await sendEmailWithFallback({
      to: email as string,
      toName: firstname || "User",
      subject: 'Via Password Reset',
      htmlPart: emailTemplate,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendPasswordUpdateEmail({
  firstname,
  password,
  email
}: EmailFormat): Promise<void> {
  const emailTemplate = emailingOptions.updatePassword(
    firstname as string,
    password as string
  );

  try {
    await sendEmailWithFallback({
      to: email as string,
      toName: firstname || "User",
      subject: 'Via Password Updated',
      htmlPart: emailTemplate,
    });
  } catch (error) {
    console.error('Error sending password update email:', error);
    throw new Error('Failed to send password update email');
  }
}

export async function inviteViaAdmin({
  inviteeUsername,
  inviteeEmail,
  emailTemplate
}: EmailFormat): Promise<void> {
  // Get the credentials email template

  try {
    await sendEmailWithFallback({
      to: inviteeEmail as string,
      toName: inviteeUsername as string,
      subject: 'Via Admin Credentials',
      htmlPart: emailTemplate as string,
    });
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw new Error('Failed to send credentials email');
  }
}

export async function inviteHotelManager({
  inviteeUsername,
  inviteeEmail,
  emailTemplate
}: EmailFormat): Promise<void> {
  // Get the credentials email template

  try {
    await sendEmailWithFallback({
      to: inviteeEmail as string,
      toName: inviteeUsername as string,
      subject: 'Hotel Management Credentials',
      htmlPart: emailTemplate as string,
    });
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw new Error('Failed to send credentials email');
  }
}

export async function inviteCustomer({
  inviteeUsername,
  inviteeEmail,
  emailTemplate
}: EmailFormat): Promise<void> {
  // Get the credentials email template

  try {
    await sendEmailWithFallback({
      to: inviteeEmail as string,
      toName: inviteeUsername as string,
      subject: 'Customer Login Credentials',
      htmlPart: emailTemplate as string,
    });
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw new Error('Failed to send credentials email');
  }
}

export async function softwareGlitchEmail({
  username,
  emailTemplate
}: EmailFormat): Promise<void> {
  // Get the credentials email template

  try {
    await sendEmailWithFallback({
      to: "ialainquentin@gmail.com",
      toName: username as string,
      subject: '[Action Needed]: Software Glitch Reported',
      htmlPart: emailTemplate as string,
    });
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw new Error('Failed to send credentials email');
  }
}
export async function sendVerificationEmail({
  firstname,
  email,
  verificationLink
}: {
  firstname: string;
  email: string;
  verificationLink: string;
}): Promise<void> {
  // Create beautiful HTML email template
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1995AD 0%, #13677c 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
          background-color: #f9f9f9;
          border-left: 3px solid #1995AD;
          border-right: 3px solid #1995AD;
        }
        .button {
          display: inline-block;
          padding: 15px 40px;
          background-color: #1995AD;
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .footer {
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
          background-color: #f0f0f0;
          border-radius: 0 0 10px 10px;
        }
        .link-text {
          word-break: break-all;
          color: #1995AD;
          font-size: 12px;
          background-color: #e8f4f8;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 15px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Welcome to Nestly!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstname},</h2>
          <p>Thank you for registering with <strong>Nestly</strong> - Your trusted hotel booking platform!</p>
          <p>Please verify your email address by clicking the button below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" class="button">✅ Verify Email Address</a>
          </div>

          <p style="text-align: center; color: #666; font-size: 14px;">Or copy and paste this link:</p>
          <div class="link-text">${verificationLink}</div>

          <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in <strong>24 hours</strong>.
          </div>

          <p style="margin-top: 30px;">If you didn't create a Nestly account, please ignore this email.</p>

          <p>Best regards,<br><strong>The Nestly Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nestly. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send via Gmail first, fall back to Mailjet
  try {
    await sendEmailWithFallback({
      to: email,
      toName: firstname,
      subject: '✉️ Verify Your Nestly Email Address',
      htmlPart: emailTemplate,
    });
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}