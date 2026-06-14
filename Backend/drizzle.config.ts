import { defineConfig } from "drizzle-kit";
import { config } from 'dotenv';

config();
// Define config
export default defineConfig({
  schema: "./src/utils/config/schema.ts",
  out: "./src/utils/config/migrations",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
  dialect: "postgresql",
  verbose: true,
  strict: true,
});
