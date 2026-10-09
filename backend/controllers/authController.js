const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function login(req, res) {
  const { email, password, website } = req.body;
  
  if (website) return res.status(400).json({ error: 'Invalid request' });
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) return res.status(400).json({ error: 'Email and password required' });

  const result = await db.query('SELECT * FROM app_users WHERE email = $1', [email.trim().toLowerCase()]);
  const user = result.rows[0];
  const valid = user && await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Incorrect email or password' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '6h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

module.exports = { login };
