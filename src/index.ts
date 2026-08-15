import app from './app.js';
import { env } from './config/index.js';
import prisma from './db/index.js';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📚 API: http://localhost:${env.PORT}/api`);
      console.log(`💚 Health: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
