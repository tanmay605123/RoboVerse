import dotenv from 'dotenv';
import path from 'path';

// Load .env from API directory or monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CLIENT_WEB_URL: process.env.CLIENT_WEB_URL || 'http://localhost:3000',
  CLIENT_MOBILE_URL: process.env.CLIENT_MOBILE_URL || 'http://localhost:8081',
  
  // Database & Redis
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://roboverse:roboverse_pass@localhost:5432/roboverse_db?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT Secrets
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'roboverse_super_secret_access_jwt_key_2026_xyz',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'roboverse_super_secret_refresh_jwt_key_2026_abc',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_RoboVerseMockKey2026',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret_key_998877',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_razorpay_webhook_secret_112233',
  
  // Anthropic Claude for Rituu (server-side only)
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'mock_claude_api_key_for_testing',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'mock_google_client_id.apps.googleusercontent.com',

  // Business / GST Information
  ROBOVERSE_GSTIN: process.env.ROBOVERSE_GSTIN || '07AABCR9920A1Z2',
  ROBOVERSE_COMPANY_NAME: process.env.ROBOVERSE_COMPANY_NAME || 'RoboVerse Technologies Pvt Ltd',
  ROBOVERSE_COMPANY_ADDRESS: process.env.ROBOVERSE_COMPANY_ADDRESS || 'Tech Tower 4, Cyber City, Gurugram, Haryana - 122002',
  ROBOVERSE_HSN_CODE: process.env.ROBOVERSE_HSN_CODE || '999293',
};
