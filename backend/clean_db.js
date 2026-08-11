import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.modelDetection.deleteMany({});
  console.log("Database cleaned.");
}
main().finally(() => prisma.$disconnect());
