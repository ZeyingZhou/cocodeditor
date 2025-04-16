import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log the database URL (without password for security)
const dbUrl = process.env.DATABASE_URL;
console.log('Database URL:', dbUrl ? dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not found');

export const prisma = new PrismaClient();

