import { env } from './config/env';
import app from './app';
import { prisma } from './config/prisma';

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Nextify server running on http://localhost:${env.PORT}`);
      console.log(`📡 API available at http://localhost:${env.PORT}/api`);
      console.log(`🏥 Health check at http://localhost:${env.PORT}/health`);
      console.log(`🌍 CORS origin: ${env.CORS_ORIGIN}`);
      console.log(`🔧 Environment: ${env.NODE_ENV}`);
    });

    const gracefulShutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
