const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'spendwise_application',
  password: process.env.DB_PASSWORD || 'dhivya@2004',
  database: process.env.DB_NAME || 'spendwise_db'
});

module.exports = pool;