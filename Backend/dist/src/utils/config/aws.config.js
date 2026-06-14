"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const helpers_1 = require("../helpers");
exports.s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: helpers_1.SECRETS.AWS_ACCESS_KEY_ID,
        secretAccessKey: helpers_1.SECRETS.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION
});
