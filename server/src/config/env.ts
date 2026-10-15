import dotenv from 'dotenv';
dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me-32chars-minimum-length',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me-32chars-min',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  STORAGE_BUCKET: process.env.STORAGE_BUCKET || 'nextify-audio',
  STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT || '',
  STORAGE_ACCESS_KEY: process.env.STORAGE_ACCESS_KEY || '',
  STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY || '',
  STORAGE_REGION: process.env.STORAGE_REGION || 'us-east-1',
};

if (env.NODE_ENV === 'production') {
  if (env.JWT_SECRET.includes('change-me') || env.JWT_REFRESH_SECRET.includes('change-me')) {
    console.warn('WARNING: Using default JWT secrets in production!');
  }
}
