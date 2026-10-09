require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  const email = process.env.ADMIN_EMAIL || 'admin@workshoply.test';
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) throw new Error('Set ADMIN_PASSWORD in .env');

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO app_users (name,email,password_hash,role)
     VALUES ($1,$2,$3,'admin') ON CONFLICT (email) DO NOTHING`,
    ['Workshoply Admin', email, hash]
  );

  const samples = [
    ['POT-101', 'Pottery for Beginners', 'Maya Fernando', 'Colombo', 5, 16],
    ['COD-201', 'Weekend Web Coding', 'Nimal Perera', 'Kandy', 7, 20],
    ['FIT-105', 'Mindful Movement', 'Sarah Silva', 'Galle', 10, 12],
    ['ART-120', 'Watercolour Basics', 'Akila Jayasuriya', 'Colombo', 14, 18]
  ];
  for (const [code, title, instructor, location, days, capacity] of samples) {
    await db.query(
      `INSERT INTO workshops (code,title,instructor,location,starts_at,capacity)
       VALUES ($1,$2,$3,$4,NOW() + ($5 * INTERVAL '1 day'),$6)
       ON CONFLICT (code) DO NOTHING`,
      [code, title, instructor, location, days, capacity]
    );
  }
  console.log('Admin and demo workshops ready');
}

seed().catch(console.error).finally(() => db.end());
