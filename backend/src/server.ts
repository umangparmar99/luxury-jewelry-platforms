import app from './app';
import { prisma } from './config/database';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`[Server] running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  
  try {
    await prisma.$connect();
    console.log('[Database] PostgreSQL connected successfully via Prisma');
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    process.exit(1);
  }
});

// Handling termination and unhandled rejections cleanly
const gracefulShutdown = async () => {
  console.log('[Server] Gracefully shutting down...');
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    await prisma.$disconnect();
    console.log('[Database] Prisma disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});
