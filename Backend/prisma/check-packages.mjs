import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const count = await prisma.test.count({ where: { isPackage: true, isActive: true } });
const names = await prisma.test.findMany({
  where: { isPackage: true, isActive: true },
  select: { name: true, price: true },
  orderBy: { name: 'asc' },
});
console.log('Package count:', count);
names.forEach((n) => console.log('-', n.name, Number(n.price)));
await prisma.$disconnect();
