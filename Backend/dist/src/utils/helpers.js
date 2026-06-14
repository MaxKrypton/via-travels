"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRETS = exports.HttpStatusCodes = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var HttpStatusCodes;
(function (HttpStatusCodes) {
    // Success
    HttpStatusCodes[HttpStatusCodes["OK"] = 200] = "OK";
    // Created Resource
    HttpStatusCodes[HttpStatusCodes["CREATED"] = 201] = "CREATED";
    // Client Error
    HttpStatusCodes[HttpStatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    // Unauthorized
    HttpStatusCodes[HttpStatusCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    // Forbidden
    HttpStatusCodes[HttpStatusCodes["FORBIDDEN"] = 403] = "FORBIDDEN";
    // Not Found
    HttpStatusCodes[HttpStatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    // Server Error
    HttpStatusCodes[HttpStatusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    // Bad Gateway
    HttpStatusCodes[HttpStatusCodes["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    // Accepted
    HttpStatusCodes[HttpStatusCodes["ACCEPTED"] = 202] = "ACCEPTED";
})(HttpStatusCodes || (exports.HttpStatusCodes = HttpStatusCodes = {}));
exports.SECRETS = {
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    PORT: parseInt(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV,
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    // EMAIL_USER: process.env.EMAIL_USER as string,
    // EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
    COMPLAINTS_EMAIL: process.env.COMPLAINTS_EMAIL,
    FLW_SECRET_KEY: process.env.FLW_SECRET_KEY,
    FLW_PUBLIC_KEY: process.env.FLW_PUBLIC_KEY,
    FLW_ENCRYPTION_KEY: process.env.FLW_ENCRYPTION_KEY,
    FLUTTERWAVE_API_URL: process.env.FLUTTERWAVE_API_URL,
    FLUTTERWAVE_PAYMENT_VERIFICATION_URL: process.env.FLUTTERWAVE_PAYMENT_VERIFICATION_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    Node_MailJet_APIKEY_PUBLIC: process.env.Node_MailJet_APIKEY_PUBLIC,
    Node_MailJet_APIKEY_PRIVATE: process.env.Node_MailJet_APIKEY_PRIVATE
};
