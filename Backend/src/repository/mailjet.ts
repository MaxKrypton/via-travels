// Backend/src/repository/mailjet.ts

import Mailjet from 'node-mailjet';

// Lazy initialization - only create client when needed
let mailjetClient: any = null;

const getMailjetClient = () => {
  if (!mailjetClient) {
    const publicKey = process.env.Node_MailJet_APIKEY_PUBLIC;
    const privateKey = process.env.Node_MailJet_APIKEY_PRIVATE;

    if (!publicKey || !privateKey) {
      throw new Error('Mailjet API keys are not configured. Please check your .env file.');
    }

    console.log('🔧 Initializing Mailjet client...');
    console.log(`   Public Key: ${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 4)}`);
    
    mailjetClient = Mailjet.apiConnect(publicKey, privateKey);
  }
  return mailjetClient;
};

export interface EmailData {
  to: string;
  toName?: string;
  subject: string;
  textPart?: string;
  htmlPart?: string;
  templateId?: number;
  variables?: Record<string, any>;
}

export const sendEmail = async (emailData: EmailData): Promise<any> => {
  // Validate FROM_EMAIL
  const fromEmail = process.env.FROM_EMAIL;
  if (!fromEmail) {
    console.error('❌ FROM_EMAIL is not configured');
    throw new Error('Sender email is not configured');
  }

  try {
    console.log('📧 ============ EMAIL SENDING START ============');
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${emailData.to}`);
    console.log(`   Subject: ${emailData.subject}`);

    const mailjet = getMailjetClient();

    const messagePayload = {
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: 'Nestly Hotel Booking',
          },
          To: [
            {
              Email: emailData.to,
              Name: emailData.toName || emailData.to,
            },
          ],
          Subject: emailData.subject,
          TextPart: emailData.textPart || 'Please view this email in an HTML-compatible email client.',
          HTMLPart: emailData.htmlPart,
          TemplateID: emailData.templateId,
          TemplateLanguage: emailData.templateId ? true : undefined,
          Variables: emailData.variables,
        },
      ],
    };

    console.log('📤 Sending request to Mailjet...');
    const request = mailjet.post('send', { version: 'v3.1' }).request(messagePayload);

    const result = await request;

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.body.Messages[0].To[0].MessageID}`);
    console.log(`   Status: ${result.body.Messages[0].Status}`);
    console.log('============ EMAIL SENDING END ============\n');

    return result.body;
  } catch (error: any) {
    console.error('❌ ============ EMAIL SENDING FAILED ============');
    console.error(`   Status Code: ${error.statusCode}`);
    console.error(`   Error Name: ${error.name}`);
    console.error(`   Message: ${error.message}`);

    if (error.response?.body) {
      console.error(`   Mailjet Error Response:`, JSON.stringify(error.response.body, null, 2));
    }

    // Check for specific errors
    if (error.statusCode === 401) {
      console.error('   ⚠️  API Keys are invalid or not properly configured');
    } else if (error.statusCode === 400) {
      console.error('   ⚠️  Invalid email format or sender email not verified with Mailjet');
    }

    console.error('============ EMAIL ERROR END ============\n');

    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
  }
};

export default getMailjetClient;