import * as dotenv from 'dotenv';
dotenv.config();

// Helper to ensure required env vars are present
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};

export const ENV = {
  // Application
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),

  // Database
  DB_HOST: getEnvVar('DB_HOST', 'localhost'),
  DB_PORT: parseInt(getEnvVar('DB_PORT', '5432'), 10),
  DB_USERNAME: getEnvVar('DB_USERNAME', 'postgres'),
  DB_PASSWORD: getEnvVar('DB_PASSWORD', 'postgres'),
  DB_DATABASE: getEnvVar('DB_DATABASE', 'order_management_db'),
  DB_SYNCHRONIZE: getEnvVar('DB_SYNCHRONIZE', 'true') === 'true',
  DB_LOGGING: getEnvVar('DB_LOGGING', 'true') === 'true',

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET', 'super-secret-key-change-in-production'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '1d'),

  // Stripe
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET', ''),

  // Frontend URLs
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),

  // Helpers
  isProduction: (): boolean => ENV.NODE_ENV === 'production',
  isDevelopment: (): boolean => ENV.NODE_ENV === 'development',
  isTest: (): boolean => ENV.NODE_ENV === 'test',
};
