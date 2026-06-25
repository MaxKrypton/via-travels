"use strict";
// Backend/src/services/authService.ts
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
exports.AuthenticationService = void 0;
const helpers_1 = require("../utils/helpers");
const User_1 = require("../repository/User");
const sendEmails_1 = require("../repository/sendEmails");
class AuthenticationService {
    constructor() {
        this.repository = new User_1.AuthenticationRepository;
    }
    wantsHtml(req) {
        return req.method === 'GET' || req.accepts(['html', 'json']) === 'html';
    }
    verificationHtml(title, message, type) {
        const accent = type === 'success' ? '#1995AD' : '#D64545';
        const icon = type === 'success' ? '✓' : '!';
        return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #F6F9FA;
              color: #182527;
              font-family: Arial, sans-serif;
            }
            .card {
              width: min(90vw, 460px);
              background: #FFFFFF;
              border: 1px solid #E8EEF0;
              border-radius: 12px;
              padding: 32px 24px;
              text-align: center;
              box-shadow: 0 12px 30px rgba(16, 42, 48, 0.08);
            }
            .icon {
              width: 56px;
              height: 56px;
              border-radius: 28px;
              margin: 0 auto 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: ${accent};
              color: #FFFFFF;
              font-size: 30px;
              font-weight: 800;
            }
            h1 {
              margin: 0;
              font-size: 24px;
            }
            p {
              margin: 12px 0 0;
              color: #5D6D72;
              line-height: 1.55;
              font-size: 15px;
            }
          </style>
        </head>
        <body>
          <main class="card">
            <div class="icon">${icon}</div>
            <h1>${title}</h1>
            <p>${message}</p>
          </main>
        </body>
      </html>
    `;
    }
    // Register Service
    register(roles, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = req.body;
            try {
                // Validate the validity of the email (format)
                const { message, status } = yield this.repository.validateUserData(userData);
                if (status !== helpers_1.HttpStatusCodes.OK) {
                    return res.status(status).json({
                        success: false,
                        status: status,
                        message: message
                    });
                }
                // Check if user exists in the database
                const { emailValidationMessage, emailValidationStatus } = yield this.repository.checkExistingUser(userData.email);
                // User exists in the database
                if (emailValidationStatus !== helpers_1.HttpStatusCodes.OK) {
                    return res.status(emailValidationStatus).json({
                        success: false,
                        status: emailValidationStatus,
                        message: emailValidationMessage
                    });
                }
                // Register user because the user doesn't exist in the database
                const hashedPassword = yield this.repository.hashPassword(userData.password);
                const newUser = yield this.repository.createUser({
                    username: userData.username,
                    email: userData.email,
                    password: hashedPassword,
                    email_verified: false
                });
                const user = newUser;
                const { email, id } = user;
                yield this.repository.createUserRole(roles, id);
                // Create verification token
                const verificationToken = yield this.repository.generateToken(email);
                const verificationLink = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
                // ✅ ✅ ✅ SEND VERIFICATION EMAIL ✅ ✅ ✅
                try {
                    yield (0, sendEmails_1.sendVerificationEmail)({
                        firstname: user.username,
                        email: user.email,
                        verificationLink: verificationLink
                    });
                    console.log('✅ Verification email sent to:', user.email);
                    return res.status(helpers_1.HttpStatusCodes.CREATED).json({
                        success: true,
                        status: helpers_1.HttpStatusCodes.CREATED,
                        message: "User registered successfully. Please check your email to verify your account.",
                        data: {
                            user: {
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                email_verified: user.email_verified
                            }
                        }
                    });
                }
                catch (emailError) {
                    // Even if email fails, user is registered
                    console.error('❌ Failed to send verification email:', emailError);
                    return res.status(helpers_1.HttpStatusCodes.CREATED).json({
                        success: true,
                        status: helpers_1.HttpStatusCodes.CREATED,
                        message: "User registered successfully. However, we couldn't send the verification email. Please contact support.",
                        data: {
                            user: {
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                email_verified: user.email_verified
                            }
                        }
                    });
                }
            }
            catch (error) {
                // Log the actual error for debugging
                console.error('Registration error:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: "An internal server error occurred during registration",
                });
            }
        });
    }
    // Login Service - FIXED VERSION
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const loginData = req.body;
            try {
                const user = yield this.repository.findUserByEmail(loginData.email);
                if (!user) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        status: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                        message: 'Invalid email or password',
                    });
                }
                const isPasswordValid = yield this.repository.comparePasswords(loginData.password, user.password);
                if (!isPasswordValid) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        status: helpers_1.HttpStatusCodes.UNAUTHORIZED,
                        message: 'Invalid email or password',
                    });
                }
                // ✅ CHECK IF EMAIL IS VERIFIED
                if (!user.email_verified) {
                    return res.status(helpers_1.HttpStatusCodes.FORBIDDEN).json({
                        success: false,
                        status: helpers_1.HttpStatusCodes.FORBIDDEN,
                        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
                    });
                }
                // Generate token
                const token = yield this.repository.generateToken(loginData.email);
                yield res.cookie("access_token", token, {
                    httpOnly: true,
                    maxAge: 3600000 * 24 * 7
                });
                // ✅ RETURN CONSISTENT RESPONSE STRUCTURE
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: 'Login successful',
                    data: {
                        token: token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            email_verified: user.email_verified,
                            auth_provider: user.auth_provider
                        }
                    }
                });
            }
            catch (error) {
                console.error('Login error:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'An error occurred during login'
                });
            }
        });
    }
    // Forgot password
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const user = yield this.repository.findUserByEmail(email);
                if (!user) {
                    return res.status(helpers_1.HttpStatusCodes.NOT_FOUND).json({
                        message: 'No account found with this email address.',
                    });
                }
                const resetToken = yield this.repository.generateResetToken(email);
                const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    message: 'Password reset link has been sent to your email.',
                    resetLink
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
            }
        });
    }
    // Reset Password
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { resetToken } = req.params;
            const { password, confirmPassword } = req.body;
            try {
                if (password !== confirmPassword) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: 'Passwords do not match',
                    });
                }
                const tokenPayload = yield this.repository.verifyResetToken(resetToken);
                if (!tokenPayload) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: 'Invalid or expired reset token',
                    });
                }
                const hashedPassword = yield this.repository.hashPassword(password);
                yield this.repository.updateUserPassword(tokenPayload.email, hashedPassword);
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    message: 'Password has been reset successfully',
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
            }
        });
    }
    // Update Password
    updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            // Check if the user exists
            const userExists = yield this.repository.checkExistingUser(data.email);
            if (userExists.emailValidationStatus !== helpers_1.HttpStatusCodes.UNAUTHORIZED) {
                // user doesn't exist, so we tell the user to register their profile first
                return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                    message: "User doesn't exist, register first"
                });
            }
            const { newPassword, confirmPassword } = req.body;
            try {
                if (newPassword !== confirmPassword) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: 'Passwords do not match',
                    });
                }
                const hashedPassword = yield this.repository.hashPassword(newPassword);
                yield this.repository.updateUserPassword(data.email, hashedPassword);
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    message: 'Password has been reset successfully',
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
            }
        });
    }
    // Verify Email
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { verifyToken } = req.params;
            try {
                const payload = yield this.repository.verifyEmailToken(verifyToken);
                if (!payload) {
                    if (this.wantsHtml(req)) {
                        return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).send(this.verificationHtml('Verification Link Expired', 'This email verification link is invalid or has expired. Please register again or contact support for a new link.', 'error'));
                    }
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: 'Invalid or expired verification token.',
                    });
                }
                const user = yield this.repository.findUserByEmail(payload.email);
                if (!user) {
                    if (this.wantsHtml(req)) {
                        return res.status(helpers_1.HttpStatusCodes.NOT_FOUND).send(this.verificationHtml('Account Not Found', 'We could not find an account for this verification link.', 'error'));
                    }
                    return res.status(helpers_1.HttpStatusCodes.NOT_FOUND).json({
                        message: 'User not found.',
                    });
                }
                if (user.email_verified) {
                    if (this.wantsHtml(req)) {
                        return res.status(helpers_1.HttpStatusCodes.OK).send(this.verificationHtml('Email Already Verified', 'Your email address is already verified. You can return to the app and log in.', 'success'));
                    }
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: 'This email is already verified.',
                    });
                }
                yield this.repository.markEmailAsVerified(payload.email);
                if (this.wantsHtml(req)) {
                    return res.status(helpers_1.HttpStatusCodes.OK).send(this.verificationHtml('Email Verified', 'Your email address has been verified successfully. You can now return to the app and log in.', 'success'));
                }
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    message: 'Email verified successfully. You can now log in.',
                });
            }
            catch (error) {
                if (this.wantsHtml(req)) {
                    return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).send(this.verificationHtml('Verification Failed', 'Something went wrong while verifying your email. Please try again later.', 'error'));
                }
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error);
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie('access_token', {
                httpOnly: true,
            });
            // Send a response indicating successful logout
            return res.status(helpers_1.HttpStatusCodes.OK).json({ message: 'Successfully logged out' });
        });
    }
}
exports.AuthenticationService = AuthenticationService;
