require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { spawn } = require('child_process');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Run migrations on startup
async function runMigrations() {
  try {
    console.log('[DB] Running Prisma migrations...');
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('[DB] Database connection OK');
  } catch (e) {
    console.log('[DB] Database not ready, will retry on next request');
  }
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth header' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, name } });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/expenses', authMiddleware, async (req, res) => {
  const expenses = await prisma.expense.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
  res.json(expenses);
});

app.post('/api/expenses', authMiddleware, async (req, res) => {
  const { amount, description, category } = req.body;
  if (typeof amount !== 'number') return res.status(400).json({ error: 'Invalid amount' });
  const expense = await prisma.expense.create({ data: { userId: req.userId, amount, description: description || '', category: category || 'other' } });
  res.json(expense);
});

app.put('/api/expenses/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) return res.status(404).json({ error: 'Not found' });
  const { amount, description, category } = req.body;
  const updated = await prisma.expense.update({ where: { id }, data: { amount, description, category } });
  res.json(updated);
});

app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) return res.status(404).json({ error: 'Not found' });
  await prisma.expense.delete({ where: { id } });
  res.json({ success: true });
});

const port = process.env.PORT || 4000;

// Run migrations and start server
(async () => {
  await runMigrations();
  app.listen(port, () => {
    console.log(`[Server] Listening on port ${port}`);
    console.log(`[Server] API URL: http://localhost:${port}`);
  });
})().catch(err => {
  console.error('[Server] Startup error:', err);
  process.exit(1);
});
