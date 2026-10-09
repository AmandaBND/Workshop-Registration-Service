const db = require('../config/db');

async function listRegistrations(req, res) {
  const result = await db.query(
    `SELECT r.*, a.name AS registered_by, b.name AS cancelled_by_name
     FROM registrations r
     JOIN app_users a ON a.id = r.created_by
     LEFT JOIN app_users b ON b.id = r.cancelled_by
     WHERE r.workshop_id = $1 ORDER BY r.registered_at DESC`,
    [req.params.id]
  );
  res.json(result.rows);
}

async function register(req, res) {
  const { name, email, website } = req.body;
  if (website) return res.status(400).json({ error: 'Invalid request' });
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) {
    return res.status(400).json({ error: 'Valid name and email required' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
   
    const seat = await client.query(
      `UPDATE workshops SET reserved_seats = reserved_seats + 1
       WHERE id = $1 AND status = 'open' AND starts_at > NOW()
         AND reserved_seats < capacity RETURNING id`,
      [req.params.id]
    );
    if (!seat.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Workshop is full, closed, or unavailable' });
    }

    const result = await client.query(
      `INSERT INTO registrations (workshop_id,name,email,created_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, name.trim(), email.trim().toLowerCase(), req.user.id]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function cancel(req, res) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT workshop_id FROM registrations WHERE id=$1', [req.params.id]);
    if (!found.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    await client.query('SELECT id FROM workshops WHERE id=$1 FOR UPDATE', [found.rows[0].workshop_id]);
    const changed = await client.query(
      `UPDATE registrations SET status='cancelled', cancelled_at=NOW(), cancelled_by=$1
       WHERE id=$2 AND status='active' RETURNING workshop_id`,
      [req.user.id, req.params.id]
    );
    if (!changed.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Already cancelled' });
    }
    await client.query('UPDATE workshops SET reserved_seats=reserved_seats-1 WHERE id=$1', [changed.rows[0].workshop_id]);
    await client.query('COMMIT');
    res.json({ message: 'Registration cancelled. Seat is available again.' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { listRegistrations, register, cancel };
