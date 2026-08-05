const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'spendwise_application',
    password: 'dhivya@2004',
    database: 'spendwise_db'
});

module.exports = pool;