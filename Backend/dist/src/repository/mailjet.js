"use strict";
// Backend/src/repository/mailjet.ts
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
exports.sendEmail = void 0;
const node_mailjet_1 = __importDefault(require("node-mailjet"));
// Lazy initialization - only create client when needed
let mailjetClient = null;
const getMailjetClient = () => {
    if (!mailjetClient) {
        const publicKey = process.env.Node_MailJet_APIKEY_PUBLIC;
        const privateKey = process.env.Node_MailJet_APIKEY_PRIVATE;
        if (!publicKey || !privateKey) {
            throw new Error('Mailjet API keys are not configured. Please check your .env file.');
        }
        console.log('🔧 Initializing Mailjet client...');
        console.log(`   Public Key: ${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 4)}`);
        mailjetClient = node_mailjet_1.default.apiConnect(publicKey, privateKey);
    }
    return mailjetClient;
};
const sendEmail = (emailData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const result = yield request;
        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${result.body.Messages[0].To[0].MessageID}`);
        console.log(`   Status: ${result.body.Messages[0].Status}`);
        console.log('============ EMAIL SENDING END ============\n');
        return result.body;
    }
    catch (error) {
        console.error('❌ ============ EMAIL SENDING FAILED ============');
        console.error(`   Status Code: ${error.statusCode}`);
        console.error(`   Error Name: ${error.name}`);
        console.error(`   Message: ${error.message}`);
        if ((_a = error.response) === null || _a === void 0 ? void 0 : _a.body) {
            console.error(`   Mailjet Error Response:`, JSON.stringify(error.response.body, null, 2));
        }
        // Check for specific errors
        if (error.statusCode === 401) {
            console.error('   ⚠️  API Keys are invalid or not properly configured');
        }
        else if (error.statusCode === 400) {
            console.error('   ⚠️  Invalid email format or sender email not verified with Mailjet');
        }
        console.error('============ EMAIL ERROR END ============\n');
        throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
});
exports.sendEmail = sendEmail;
exports.default = getMailjetClient;
