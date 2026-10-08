import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import {
  PrismaPg,
} from '@prisma/adapter-pg';

import {
  PrismaClient,
} from '../src/generated/prisma/client.js';

const adapter =
  new PrismaPg({
    connectionString:
      process.env
        .DATABASE_URL as string,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

async function main() {
  const email =
    (
      process.env
        .SUPER_ADMIN_EMAIL ||
      'admin@prorabotka.local'
    )
      .trim()
      .toLowerCase();

  const passwordHash =
    await bcrypt.hash(
      'Admin123!',
      12,
    );

  await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      approvalStatus:
        'APPROVED',

      isActive: true,

      role: 'Director',

      position:
        'Director',
    },

    create: {
      name:
        'ProRabotka Admin',

      surname:
        'Admin',

      email,

      password:
        passwordHash,

      role: 'Director',

      position:
        'Director',

      approvalStatus:
        'APPROVED',

      isActive: true,
    },
  });

  console.log(
    `Super admin ready: ${email}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });