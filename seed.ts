import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "ateeq@admin.com";
  const password = "Pass@121..#";
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('User already exists. Skipping...');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Ateeq",
      role: "PM"
    }
  });
  console.log(`Created user: ${user.email} with PM role.`);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
