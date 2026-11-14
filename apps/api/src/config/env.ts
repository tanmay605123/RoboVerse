import dotenv from 'dotenv';
import path from 'path';

// Load .env from API directory or monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const developmentFallback = (value: string) => (isProduction ? '' : value);

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CLIENT_WEB_URL: process.env.CLIENT_WEB_URL || 'http://localhost:3000',
  CLIENT_MOBILE_URL: process.env.CLIENT_MOBILE_URL || 'http://localhost:8081',
  
  // Supabase PostgreSQL & Redis
  DATABASE_URL: process.env.DATABASE_URL || '',
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  ALLOW_IN_MEMORY_AUTH: process.env.ALLOW_IN_MEMORY_AUTH === 'true',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT Secrets
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || developmentFallback('roboverse_super_secret_access_jwt_key_2026_xyz'),
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || developmentFallback('roboverse_super_secret_refresh_jwt_key_2026_abc'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || developmentFallback('rzp_test_RoboVerseMockKey2026'),
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || developmentFallback('mock_razorpay_secret_key_998877'),
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || developmentFallback('mock_razorpay_webhook_secret_112233'),
  
  // Google Gemini API for Rituu (server-side only)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || developmentFallback('mock_gemini_api_key_for_testing'),
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GEMINI_MODEL_PRO: process.env.GEMINI_MODEL_PRO || 'gemini-1.5-pro',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || developmentFallback('mock_claude_api_key_for_testing'),

  // Google Maps Platform Keys
  GOOGLE_MAPS_SERVER_KEY: process.env.GOOGLE_MAPS_SERVER_KEY || developmentFallback('mock_google_maps_server_key'),
  GOOGLE_MAPS_CLIENT_KEY: process.env.GOOGLE_MAPS_CLIENT_KEY || developmentFallback('mock_google_maps_client_key'),

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || developmentFallback('mock_google_client_id.apps.googleusercontent.com'),

  // Business / GST Information
  ROBOVERSE_GSTIN: process.env.ROBOVERSE_GSTIN || '07AABCR9920A1Z2',
  ROBOVERSE_COMPANY_NAME: process.env.ROBOVERSE_COMPANY_NAME || 'RoboVerse Technologies Pvt Ltd',
  ROBOVERSE_COMPANY_ADDRESS: process.env.ROBOVERSE_COMPANY_ADDRESS || 'Tech Tower 4, Cyber City, Gurugram, Haryana - 122002',
  ROBOVERSE_HSN_CODE: process.env.ROBOVERSE_HSN_CODE || '999293',
};

if (isProduction) {
  for (const name of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if (ENV[name].length < 32) {
      throw new Error(`${name} must be set to a unique secret of at least 32 characters in production.`);
    }
  }
}
