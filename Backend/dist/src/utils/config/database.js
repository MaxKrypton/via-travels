"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const serverless_1 = require("@neondatabase/serverless");
const neon_http_1 = require("drizzle-orm/neon-http");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const sql = (0, serverless_1.neon)(process.env.NEON_DATABASE_URL);
exports.database = (0, neon_http_1.drizzle)(sql);
