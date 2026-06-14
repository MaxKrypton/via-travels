// Backend/src/repository/nodemailer.ts
// Alternative email service using Nodemailer (Gmail SMTP)

import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  toName?: string;
  subject: string;
  htmlPart: string;
  textPart?: string;
}

// Create transporter using Gmail SMTP
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error('Gmail SMTP credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
  }

  console.log('🔧 Initializing Nodemailer with Gmail SMTP...');
  console.log(`   Email: ${emailUser}`);

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

export const sendEmailViaNodemailer = async (emailData: EmailData): Promise<any> => {
  try {
    console.log('📧 ============ NODEMAILER EMAIL START ============');
    console.log(`   From: ${process.env.EMAIL_USER}`);
    console.log(`   To: ${emailData.to}`);
    console.log(`   Subject: ${emailData.subject}`);

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Nestly Hotel Booking',
        address: process.env.EMAIL_USER as string,
      },
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.textPart || 'Please view this email in an HTML-compatible email client.',
      html: emailData.htmlPart,
    };

    console.log('📤 Sending via Gmail SMTP...');
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully via Nodemailer!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('============ NODEMAILER EMAIL END ============\n');

    return info;
  } catch (error: any) {
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
};

export default sendEmailViaNodemailer;
