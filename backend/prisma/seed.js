require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.OFFICIAL_EMAIL || 'official@publiceye.ng').trim().toLowerCase();
  const password = process.env.OFFICIAL_PASSWORD || 'publiceye';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: process.env.OFFICIAL_NAME || 'PublicEye Official',
      passwordHash,
      role: 'GOVERNMENT_OFFICIAL',
      jurisdiction: process.env.OFFICIAL_JURISDICTION || 'Surulere',
    },
    create: {
      name: process.env.OFFICIAL_NAME || 'PublicEye Official',
      email,
      passwordHash,
      role: 'GOVERNMENT_OFFICIAL',
      jurisdiction: process.env.OFFICIAL_JURISDICTION || 'Surulere',
    },
  });

  console.log(`Seeded government official: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
