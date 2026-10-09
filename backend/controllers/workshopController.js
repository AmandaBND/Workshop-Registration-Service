const db = require('../config/db');

async function listWorkshops(req, res) {
  const result = await db.query('SELECT * FROM workshops ORDER BY starts_at ASC');
  res.json(result.rows);
}

function validWorkshop(data) {
  return typeof data.code === 'string' && data.code.trim() &&
    typeof data.title === 'string' && data.title.trim() &&
    typeof data.instructor === 'string' && data.instructor.trim() &&
    ['Colombo', 'Kandy', 'Galle'].includes(data.location) &&
    Number.isInteger(Number(data.capacity)) && Number(data.capacity) > 0 &&
    Number.isFinite(Date.parse(data.starts_at)) &&
    ['open', 'closed'].includes(data.status);
}

async function createWorkshop(req, res) {
  if (!validWorkshop(req.body)) return res.status(400).json({ error: 'Check workshop details' });
  const { code, title, instructor, location, starts_at, capacity, status } = req.body;
  const result = await db.query(
    `INSERT INTO workshops (code,title,instructor,location,starts_at,capacity,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [code.trim().toUpperCase(), title.trim(), instructor.trim(), location, starts_at, capacity, status]
  );
  res.status(201).json(result.rows[0]);
}

async function updateWorkshop(req, res) {
  if (!validWorkshop(req.body)) return res.status(400).json({ error: 'Check workshop details' });
  const { code, title, instructor, location, starts_at, capacity, status } = req.body;
  const result = await db.query(
    `UPDATE workshops SET code=$1,title=$2,instructor=$3,location=$4,starts_at=$5,capacity=$6,status=$7
     WHERE id=$8 AND reserved_seats <= $6 RETURNING *`,
    [code.trim().toUpperCase(), title.trim(), instructor.trim(), location, starts_at, capacity, status, req.params.id]
  );
  if (!result.rowCount) return res.status(409).json({ error: 'Not found or capacity is below booked seats' });
  res.json(result.rows[0]);
}

module.exports = { listWorkshops, createWorkshop, updateWorkshop };
