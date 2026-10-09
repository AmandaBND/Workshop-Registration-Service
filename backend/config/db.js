const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5
});

module.exports = db;
