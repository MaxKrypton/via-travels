import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from 'dotenv';
config();

const sql = neon(process.env.NEON_DATABASE_URL as string);
export const database = drizzle(sql);


