import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing MongoDB connection...\n');

  await prisma.$runCommandRaw({ ping: 1 });
  console.log('✅ MongoDB ping successful');

  const [categories, products, reviews, siteContent] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.review.count(),
    prisma.siteContent.findUnique({ where: { id: 'main' } }),
  ]);

  console.log(`\n📊 Database stats:`);
  console.log(`   Categories: ${categories}`);
  console.log(`   Products:   ${products}`);
  console.log(`   Reviews:    ${reviews}`);
  console.log(`   SiteContent: ${siteContent ? 'configured' : 'missing (run npm run db:seed)'}`);

  console.log('\n🎉 MongoDB + Prisma connection test passed!');
}

main()
  .catch((err) => {
    console.error('\n❌ Connection failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
