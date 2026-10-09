const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function listUsers(req, res) {
  const result = await db.query('SELECT id, name, email, role FROM app_users ORDER BY name');
  res.json(result.rows);
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') ||
      typeof password !== 'string' || password.length < 8 || !['admin', 'manager', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'Enter a name, valid email, password (8+ chars), and role' });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await db.query(
    'INSERT INTO app_users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role',
    [name.trim(), email.trim().toLowerCase(), hash, role]
  );
  res.status(201).json(result.rows[0]);
}

module.exports = { listUsers, createUser };
