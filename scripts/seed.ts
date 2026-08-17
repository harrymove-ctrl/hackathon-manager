import { seedBnbChainData } from '../src/db/seedData.js';
import prisma from '../src/db/index.js';

seedBnbChainData()
  .then(() => {
    console.log('🎉 Seed completed successfully!');
  })
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
