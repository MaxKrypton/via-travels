"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
const authMiddleware_1 = require("../middleware/authMiddleware");
// Create Express router
const Router = express_1.default.Router();
// create authService instance
const authService = new authService_1.AuthenticationService();
Router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.register("customer", req, res);
}));
Router.post('/register/via-admin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.register("via-admin", req, res);
}));
Router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.login(req, res);
}));
Router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.forgotPassword(req, res);
}));
Router.post('/reset-password/:resetToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.resetPassword(req, res);
}));
Router.post('/verify-email/:verifyToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.verifyEmail(req, res);
}));
Router.patch('/update-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.updatePassword(req, res);
}));
Router.post('/logout', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    authService.logout(req, res);
}));
// Test endpoint to verify email configuration
Router.post('/test-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }
        const { sendEmail } = yield Promise.resolve().then(() => __importStar(require('../repository/mailjet')));
        yield sendEmail({
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
    }
    catch (error) {
        console.error('Test email error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
}));
// Debug endpoint - Check Mailjet configuration
Router.get('/email-debug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking configuration',
            error: error.message
        });
    }
}));
exports.authRoutes = Router;
