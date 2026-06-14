"use strict";
// Backend/src/repository/nodemailer.ts
// Alternative email service using Nodemailer (Gmail SMTP)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailViaNodemailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create transporter using Gmail SMTP
const createTransporter = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    if (!emailUser || !emailPassword) {
        throw new Error('Gmail SMTP credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    }
    console.log('🔧 Initializing Nodemailer with Gmail SMTP...');
    console.log(`   Email: ${emailUser}`);
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPassword,
        },
    });
};
const sendEmailViaNodemailer = (emailData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📧 ============ NODEMAILER EMAIL START ============');
        console.log(`   From: ${process.env.EMAIL_USER}`);
        console.log(`   To: ${emailData.to}`);
        console.log(`   Subject: ${emailData.subject}`);
        const transporter = createTransporter();
        const mailOptions = {
            from: {
                name: 'Nestly Hotel Booking',
                address: process.env.EMAIL_USER,
            },
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.textPart || 'Please view this email in an HTML-compatible email client.',
            html: emailData.htmlPart,
        };
        console.log('📤 Sending via Gmail SMTP...');
        const info = yield transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully via Nodemailer!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        console.log('============ NODEMAILER EMAIL END ============\n');
        return info;
    }
    catch (error) {
        console.error('❌ ============ NODEMAILER ERROR ============');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        if (error.code === 'EAUTH') {
            console.error('   ⚠️  Gmail authentication failed!');
            console.error('   Check EMAIL_USER and EMAIL_PASSWORD in .env');
            console.error('   Make sure you are using an App Password (not your regular Gmail password)');
        }
        console.error('============ NODEMAILER ERROR END ============\n');
        throw new Error(`Failed to send email via Nodemailer: ${error.message}`);
    }
});
exports.sendEmailViaNodemailer = sendEmailViaNodemailer;
exports.default = exports.sendEmailViaNodemailer;
