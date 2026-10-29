require('dotenv').config();

const { Pool } = require('pg');
const { createApp } = require('./app');

const port = Number(process.env.PORT || 3000);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
  max: 10
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

const app = createApp(pool);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API server listening on port ${port}`);
});

function shutdown() {
  server.close(async () => {
    try {
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.error('Shutdown failed:', error.message);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
