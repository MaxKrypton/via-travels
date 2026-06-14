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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
// Backend/src/routes/payment.routes.ts
const express_1 = require("express");
const FlutterwavePayment_1 = require("../repository/FlutterwavePayment");
const authMiddleware_1 = require("../middleware/authMiddleware");
const helpers_1 = require("../utils/helpers");
const crypto_1 = __importDefault(require("crypto"));
exports.PaymentRoutes = (0, express_1.Router)();
// Initiate payment (create payment link)
exports.PaymentRoutes.post('/initiate', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency, name, email, phone_number, customizationsTitle, customizationsDescription, subAccountId } = req.body;
        if (!amount || !email || !phone_number || !name) {
            return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Missing required fields: amount, email, phone_number, name'
            });
        }
        const userDetails = {
            amount,
            currency: currency || 'RWF',
            name,
            email,
            phone_number,
            customizationsTitle: customizationsTitle || 'Hotel Booking Payment',
            customizationsDescription: customizationsDescription || 'Complete your hotel booking'
        };
        const result = yield FlutterwavePayment_1.paymentRepository.Payment(userDetails, subAccountId);
        return res.status((result === null || result === void 0 ? void 0 : result.status) || helpers_1.HttpStatusCodes.OK).json(result);
    }
    catch (error) {
        console.error('Payment initiation error:', error);
        return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Payment initiation failed',
            error: error.message
        });
    }
}));
// Verify payment status
exports.PaymentRoutes.get('/verify/:tx_ref', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tx_ref } = req.params;
        if (!tx_ref) {
            return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Transaction reference is required'
            });
        }
        const result = yield FlutterwavePayment_1.paymentRepository.verifyPayment(tx_ref);
        return res.status((result === null || result === void 0 ? void 0 : result.status) || helpers_1.HttpStatusCodes.OK).json(result);
    }
    catch (error) {
        console.error('Payment verification error:', error);
        return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Payment verification failed',
            error: error.message
        });
    }
}));
// Webhook endpoint for Flutterwave callbacks
exports.PaymentRoutes.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signature = req.headers['verif-hash'];
        const payload = JSON.stringify(req.body);
        // Verify webhook signature
        const hash = crypto_1.default
            .createHmac('sha256', process.env.FLW_SECRET_HASH || '')
            .update(payload, 'utf8')
            .digest('hex');
        if (hash !== signature) {
            console.log('Invalid webhook signature');
            return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Invalid webhook signature'
            });
        }
        const { event, data } = req.body;
        console.log('Webhook received:', { event, tx_ref: data === null || data === void 0 ? void 0 : data.tx_ref, status: data === null || data === void 0 ? void 0 : data.status });
        // Handle different webhook events
        switch (event) {
            case 'charge.completed':
                if (data.status === 'successful' && data.currency === 'RWF') {
                    console.log('Payment successful:', {
                        tx_ref: data.tx_ref,
                        amount: data.amount,
                        customer: data.customer.email
                    });
                    // Booking status will be updated when user verifies payment
                }
                break;
            case 'charge.failed':
                console.log('Payment failed:', {
                    tx_ref: data.tx_ref,
                    reason: data.processor_response
                });
                break;
            default:
                console.log('Unhandled webhook event:', event);
        }
        return res.status(helpers_1.HttpStatusCodes.OK).json({
            status: 'success',
            message: 'Webhook processed'
        });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Webhook processing failed'
        });
    }
}));
// Calculate payment fees
exports.PaymentRoutes.get('/fees', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, payment_type } = req.query;
        if (!amount) {
            return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: 'Amount is required'
            });
        }
        const amountNum = parseFloat(amount);
        let fee = 0;
        if (payment_type === 'card') {
            fee = Math.max(amountNum * 0.035, 100); // 3.5% or min 100 RWF
        }
        else {
            fee = Math.max(amountNum * 0.02, 50); // 2% or min 50 RWF
        }
        return res.status(helpers_1.HttpStatusCodes.OK).json({
            status: 'success',
            data: {
                amount: amountNum,
                currency: 'RWF',
                fee: Math.round(fee),
                total: Math.round(amountNum + fee)
            }
        });
    }
    catch (error) {
        console.error('Fee calculation error:', error);
        return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Fee calculation failed'
        });
    }
}));
