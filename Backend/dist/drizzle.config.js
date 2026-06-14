"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// Define config
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: "./src/utils/config/schema.ts",
    out: "./src/utils/config/migrations",
    dbCredentials: {
        url: process.env.NEON_DATABASE_URL,
    },
    dialect: "postgresql",
    verbose: true,
    strict: true,
});
