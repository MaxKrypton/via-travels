const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const fs = require('fs');
const { Client } = require('pg');

(async () => {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error('NEON_DATABASE_URL is missing. Check Backend/.env.');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, 'hotels-seed.sql'), 'utf8');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const res = await client.query(sql);
    const inserted = Array.isArray(res) ? res.reduce((a, r) => a + (r.rowCount || 0), 0) : res.rowCount;
    console.log(`✅ Inserted ${inserted} hotels.`);
  } catch (err) {
    console.error('❌ Insert failed:', err.message || err);
  } finally {
    await client.end();
  }
})();
