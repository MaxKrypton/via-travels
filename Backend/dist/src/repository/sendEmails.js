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
exports.sendComplainsEmail = sendComplainsEmail;
exports.sendHotelManagementCredentials = sendHotelManagementCredentials;
exports.sendForgotPasswordEmail = sendForgotPasswordEmail;
exports.sendPasswordUpdateEmail = sendPasswordUpdateEmail;
exports.inviteViaAdmin = inviteViaAdmin;
exports.inviteHotelManager = inviteHotelManager;
exports.inviteCustomer = inviteCustomer;
exports.softwareGlitchEmail = softwareGlitchEmail;
exports.sendVerificationEmail = sendVerificationEmail;
const mailjet_1 = require("../repository/mailjet");
const nodemailer_1 = require("../repository/nodemailer");
const EmailingTemplates_1 = require("../utils/EmailingTemplates");
// Unified sender: tries Gmail (nodemailer) first, falls back to Mailjet
function sendEmailWithFallback(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, nodemailer_1.sendEmailViaNodemailer)(data);
        }
        catch (nodemailerErr) {
            console.warn('⚠️  Gmail/Nodemailer failed, trying Mailjet fallback...', nodemailerErr);
            yield (0, mailjet_1.sendEmail)(data);
        }
    });
}
function sendComplainsEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ firstname, complainerEmail, hotelName, subject, message }) {
        // Get the complaint email template
        const complainsEmails = EmailingTemplates_1.emailingOptions.clientComplains(firstname, complainerEmail, hotelName, subject, message);
        const viaEmail = "atnestly@gmail.com";
        try {
            yield sendEmailWithFallback({
                to: viaEmail,
                toName: "Hotel Complaints Team",
                subject: subject,
                htmlPart: complainsEmails,
            });
        }
        catch (error) {
            console.error('Error sending complaint email:', error);
            throw new Error('Failed to send complaint email');
        }
    });
}
function sendHotelManagementCredentials(_a) {
    return __awaiter(this, arguments, void 0, function* ({ username, password, managerEmail, subject }) {
        // Get the credentials email template
        const emailTemplateFormat = EmailingTemplates_1.emailingOptions.temporaryHotelAdminLoginPassword(username, password);
        try {
            yield sendEmailWithFallback({
                to: managerEmail,
                toName: "Hotel Manager",
                subject: subject || 'Hotel Management Credentials',
                htmlPart: emailTemplateFormat,
            });
        }
        catch (error) {
            console.error('Error sending credentials email:', error);
            throw new Error('Failed to send credentials email');
        }
    });
}
function sendForgotPasswordEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ firstname, password, email }) {
        const emailTemplate = EmailingTemplates_1.emailingOptions.forgotPassword(firstname, password);
        try {
            yield sendEmailWithFallback({
                to: email,
                toName: firstname || "User",
                subject: 'Via Password Reset',
                htmlPart: emailTemplate,
            });
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    });
}
function sendPasswordUpdateEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ firstname, password, email }) {
        const emailTemplate = EmailingTemplates_1.emailingOptions.updatePassword(firstname, password);
        try {
            yield sendEmailWithFallback({
                to: email,
                toName: firstname || "User",
                subject: 'Via Password Updated',
                htmlPart: emailTemplate,
            });
        }
        catch (error) {
            console.error('Error sending password update email:', error);
            throw new Error('Failed to send password update email');
        }
    });
}
function inviteViaAdmin(_a) {
    return __awaiter(this, arguments, void 0, function* ({ inviteeUsername, inviteeEmail, emailTemplate }) {
        // Get the credentials email template
        try {
            yield sendEmailWithFallback({
                to: inviteeEmail,
                toName: inviteeUsername,
                subject: 'Via Admin Credentials',
                htmlPart: emailTemplate,
            });
        }
        catch (error) {
            console.error('Error sending credentials email:', error);
            throw new Error('Failed to send credentials email');
        }
    });
}
function inviteHotelManager(_a) {
    return __awaiter(this, arguments, void 0, function* ({ inviteeUsername, inviteeEmail, emailTemplate }) {
        // Get the credentials email template
        try {
            yield sendEmailWithFallback({
                to: inviteeEmail,
                toName: inviteeUsername,
                subject: 'Hotel Management Credentials',
                htmlPart: emailTemplate,
            });
        }
        catch (error) {
            console.error('Error sending credentials email:', error);
            throw new Error('Failed to send credentials email');
        }
    });
}
function inviteCustomer(_a) {
    return __awaiter(this, arguments, void 0, function* ({ inviteeUsername, inviteeEmail, emailTemplate }) {
        // Get the credentials email template
        try {
            yield sendEmailWithFallback({
                to: inviteeEmail,
                toName: inviteeUsername,
                subject: 'Customer Login Credentials',
                htmlPart: emailTemplate,
            });
        }
        catch (error) {
            console.error('Error sending credentials email:', error);
            throw new Error('Failed to send credentials email');
        }
    });
}
function softwareGlitchEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ username, emailTemplate }) {
        // Get the credentials email template
        try {
            yield sendEmailWithFallback({
                to: "ialainquentin@gmail.com",
                toName: username,
                subject: '[Action Needed]: Software Glitch Reported',
                htmlPart: emailTemplate,
            });
        }
        catch (error) {
            console.error('Error sending credentials email:', error);
            throw new Error('Failed to send credentials email');
        }
    });
}
function sendVerificationEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ firstname, email, verificationLink }) {
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
            yield sendEmailWithFallback({
                to: email,
                toName: firstname,
                subject: '✉️ Verify Your Nestly Email Address',
                htmlPart: emailTemplate,
            });
            console.log('✅ Verification email sent to:', email);
        }
        catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw new Error('Failed to send verification email');
        }
    });
}
