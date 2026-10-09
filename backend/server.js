require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error('Add DATABASE_URL and JWT_SECRET to backend/.env');
  process.exit(1);
}

const app = express();

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '15kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', async (req, res) => {
  await db.query('SELECT 1');
  res.json({ ok: true });
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }), require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/workshops', require('./routes/workshopRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.code === '23505') return res.status(409).json({ error: 'This entry already exists' });
  if (err.code === '22P02' || err.code === '23514') return res.status(400).json({ error: 'Invalid data' });
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(process.env.PORT || 5000, () => console.log('API running on port ' + (process.env.PORT || 5000)));
