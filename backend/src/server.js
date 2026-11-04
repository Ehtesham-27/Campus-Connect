import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

async function startServer() {
  // Attempt database connection
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`===============================================`);
    console.log(` Campus Connect API Server`);
    console.log(` Environment : ${ENV.NODE_ENV}`);
    console.log(` Port        : ${ENV.PORT}`);
    console.log(` Health check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(` CORS Origin : ${ENV.FRONTEND_URL}`);
    console.log(`===============================================`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    await disconnectDB().catch(() => {});
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.once('SIGUSR2', async () => {
    await disconnectDB().catch(() => {});
    process.kill(process.pid, 'SIGUSR2');
  });
}

startServer().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});

