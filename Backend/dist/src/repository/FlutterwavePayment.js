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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = void 0;
const helpers_1 = require("../utils/helpers");
const axios_1 = __importDefault(require("axios"));
// Flutterwave will be initialized lazily when needed
console.log('🔧 Flutterwave Configuration:');
console.log(`   Public Key: ${(_a = helpers_1.SECRETS.FLW_PUBLIC_KEY) === null || _a === void 0 ? void 0 : _a.substring(0, 15)}...`);
console.log(`   API URL: ${helpers_1.SECRETS.FLUTTERWAVE_API_URL}`);
const generateTxRef = () => {
    return `rwpay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
class FlutterWavePaymentRepository {
    Payment(userDetails, subAccountId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                const { amount, currency = 'RWF', email, phone_number, name, customizationsTitle, customizationsDescription, } = userDetails;
                // Validation
                if (!amount) {
                    return {
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                        message: 'Missing required field: amount',
                    };
                }
                if (!email || !name) {
                    return {
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                        message: 'Missing required fields: email and name',
                    };
                }
                const tx_ref = generateTxRef();
                // Build payload - only include subaccounts if subAccountId is provided
                const payload = {
                    tx_ref,
                    amount: parseFloat(String(amount)),
                    currency,
                    redirect_url: 'https://nestly.com/payment/callback',
                    customer: {
                        email,
                        phonenumber: phone_number || '250000000000',
                        name,
                    },
                    customizations: {
                        title: customizationsTitle || 'Nestly Hotel Booking',
                        description: customizationsDescription || 'Hotel room booking payment',
                        logo: 'https://nestly.com/logo.png'
                    },
                    configurations: {
                        session_duration: 30,
                        max_retry_attempt: 2,
                    },
                };
                // Only add subaccounts if provided
                if (subAccountId) {
                    payload.subaccounts = [
                        {
                            id: subAccountId,
                            transaction_charge_type: 'percentage',
                            transaction_charge: 0.05,
                        },
                    ];
                }
                console.log('💳 ============ PAYMENT INITIATION START ============');
                console.log(`   Transaction Ref: ${tx_ref}`);
                console.log(`   Amount: ${amount} ${currency}`);
                console.log(`   Customer: ${name} (${email})`);
                try {
                    const response = yield axios_1.default.post(`${helpers_1.SECRETS.FLUTTERWAVE_API_URL}`, payload, {
                        headers: {
                            Authorization: `Bearer ${helpers_1.SECRETS.FLW_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log('✅ Payment initiated successfully!');
                    console.log(`   Status: ${response.data.status}`);
                    const { status, data } = response.data;
                    const { link } = data;
                    if (status === 'success') {
                        console.log(`   Checkout Link: ${link}`);
                        console.log('============ PAYMENT INITIATION END ============\n');
                        return {
                            status: helpers_1.HttpStatusCodes.OK,
                            message: `Complete your payment within 30 minutes using the checkout link to secure your booking`,
                            data: {
                                checkout_link: link,
                                tx_ref,
                            },
                        };
                    }
                    else {
                        console.error('❌ Payment initiation returned non-success status');
                        console.error('============ PAYMENT INITIATION END ============\n');
                        return {
                            status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                            message: 'Payment processing failed',
                            data: response.data
                        };
                    }
                }
                catch (error) {
                    console.error('❌ ============ PAYMENT ERROR ============');
                    console.error(`   Status: ${(_a = error.response) === null || _a === void 0 ? void 0 : _a.status}`);
                    console.error(`   Message: ${error.message}`);
                    if ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) {
                        console.error(`   Flutterwave Error:`, JSON.stringify(error.response.data, null, 2));
                    }
                    console.error('============ PAYMENT ERROR END ============\n');
                    return {
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                        message: `Payment processing failed: ${((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || error.message}`,
                        data: (_e = error.response) === null || _e === void 0 ? void 0 : _e.data
                    };
                }
            }
            catch (error) {
                console.error('❌ Unexpected error in payment processing:', error);
                return {
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: `Card payment processing failed: ${(error === null || error === void 0 ? void 0 : error.message) || error}`,
                };
            }
        });
    }
    // Method to verify payment status
    verifyPayment(tx_ref) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!tx_ref) {
                return {
                    status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                    message: 'Transaction reference is required',
                };
            }
            console.log('🔍 ============ PAYMENT VERIFICATION START ============');
            console.log(`   Transaction Ref: ${tx_ref}`);
            try {
                const response = yield axios_1.default.get(`${helpers_1.SECRETS.FLUTTERWAVE_PAYMENT_VERIFICATION_URL}?tx_ref=${tx_ref}`, {
                    headers: {
                        Authorization: `Bearer ${helpers_1.SECRETS.FLW_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
                const { status, data } = response.data;
                console.log(`   Verification Status: ${status}`);
                if (status === 'success') {
                    console.log('✅ Payment verified successfully!');
                    console.log(`   Amount: ${data.amount} ${data.currency}`);
                    console.log(`   Payment Status: ${data.status}`);
                    console.log('============ PAYMENT VERIFICATION END ============\n');
                    return {
                        status: helpers_1.HttpStatusCodes.OK,
                        message: 'Payment was done successfully',
                        data: data
                    };
                }
                else {
                    console.error('❌ Payment verification failed');
                    console.error('============ PAYMENT VERIFICATION END ============\n');
                    return {
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                        message: 'Payment verification failed',
                        data: response.data
                    };
                }
            }
            catch (error) {
                console.error('❌ ============ VERIFICATION ERROR ============');
                console.error(`   Status: ${(_a = error.response) === null || _a === void 0 ? void 0 : _a.status}`);
                console.error(`   Message: ${error.message}`);
                if ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) {
                    console.error(`   Error Details:`, JSON.stringify(error.response.data, null, 2));
                }
                console.error('============ VERIFICATION ERROR END ============\n');
                return {
                    status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                    message: `Encountered an error while verifying payment: ${(error === null || error === void 0 ? void 0 : error.message) || error}`,
                    data: (_c = error.response) === null || _c === void 0 ? void 0 : _c.data
                };
            }
        });
    }
}
exports.paymentRepository = new FlutterWavePaymentRepository();
