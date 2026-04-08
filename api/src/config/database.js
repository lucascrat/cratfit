const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
});

pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
});

// All queries default to fttcrat schema
const query = async (text, params) => {
    const client = await pool.connect();
    try {
        await client.query('SET search_path TO fttcrat');
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
};

module.exports = { pool, query };
