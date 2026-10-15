import { MockPrismaClient } from './prismaMock';

// Try to use real Prisma client if available and DATABASE_URL is postgres
// Fallback to mock for development without binary
let prisma: any;

const useMock = process.env.USE_MOCK_DB === 'true' || process.env.DATABASE_URL?.startsWith('file:') || !process.env.DATABASE_URL?.startsWith('postgresql://');

if (useMock) {
  console.log('📦 Using Mock Prisma Client (JSON file storage) - suitable for dev without native binaries');
  console.log('   For production, set DATABASE_URL to PostgreSQL and USE_MOCK_DB=false');
  prisma = new MockPrismaClient();
} else {
  try {
    // Dynamically import real PrismaClient
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    console.log('✅ Using Real Prisma Client (PostgreSQL)');
  } catch (e) {
    console.warn('⚠️ Failed to load real PrismaClient, falling back to mock:', (e as Error).message);
    prisma = new MockPrismaClient();
  }
}

export { prisma };
