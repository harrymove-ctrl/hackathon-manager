import app from './app.js';
import { env } from './config/index.js';
import prisma from './db/index.js';

async function main() {
  try {
    // Attempt database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');
  } catch (error) {
    console.warn('⚠️  Could not connect to PostgreSQL directly from localhost. Server will run with live cloud fallback.');
  }

  // Start server
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
    console.log(`📚 API: http://localhost:${env.PORT}/api`);
    console.log(`💚 Health: http://localhost:${env.PORT}/health`);
  });
}

main();
