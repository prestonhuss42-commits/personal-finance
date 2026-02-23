const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main(){
  const prisma = new PrismaClient();
  const password = await bcrypt.hash('demo',10);
  let user = await prisma.user.findUnique({ where: { email: 'demo@example.com' } });
  if (!user) {
    user = await prisma.user.create({ data: { email: 'demo@example.com', password, name: 'Demo User' } });
  }
  const now = new Date();
  const existing = await prisma.expense.findMany({ where: { userId: user.id } });
  if (existing.length === 0) {
    await prisma.expense.createMany({ data: [
      { userId: user.id, amount: 12.34, description: 'Lunch', category: 'food', createdAt: new Date(now.getTime() - 5*24*60*60*1000) },
      { userId: user.id, amount: 45.00, description: 'Taxi', category: 'transport', createdAt: new Date(now.getTime() - 3*24*60*60*1000) },
      { userId: user.id, amount: 120.99, description: 'Electric bill', category: 'utilities', createdAt: new Date(now.getTime() - 2*24*60*60*1000) },
      { userId: user.id, amount: 9.99, description: 'Coffee', category: 'food', createdAt: new Date(now.getTime() - 1*24*60*60*1000) }
    ]});
  }
  console.log('Seed complete, login with demo@example.com / demo');
}

main().catch(e=>{ console.error(e); process.exit(1); });
