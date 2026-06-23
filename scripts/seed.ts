import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Pass@121..#', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'ateeq@admin.com' },
    update: {},
    create: {
      email: 'ateeq@admin.com',
      passwordHash: hash,
      name: 'Muhammad Atiq',
      role: 'PM'
    }
  });

  console.log('Seeded PM user:', user.email);

  const space = await prisma.space.create({
    data: {
      name: 'General Space',
      description: 'The default space for tasks',
    }
  });

  console.log('Seeded Space:', space.name);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
