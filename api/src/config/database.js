const { Pool } = require('pg');

// Public VPS address — always stable regardless of Docker network changes
const PUBLIC_DB_URL = 'postgres://postgres:QgvpSkSX212FO6kvfgW5gxdFIm3EtW0BOgZ6Pzb0ObiXlttf06I8ksbfBWIS7rtA@187.77.230.251:5434/postgres';

// Use the configured URL, but fall back to public if it looks like an
// internal Coolify hostname (long alphanumeric, no dots) that may change
// whenever the DB container is recreated.
function resolveDbUrl() {
    const url = process.env.DATABASE_URL;
    if (!url) return PUBLIC_DB_URL;

    try {
        const { hostname } = new URL(url);
        // Internal Coolify hostnames are ~24-char alphanumeric strings with no dots
        const isInternal = /^[a-z0-9]{16,}$/.test(hostname);
        if (isInternal) {
            console.warn(`[DB] Internal hostname "${hostname}" detected — using public VPS URL as fallback`);
            return PUBLIC_DB_URL;
        }
    } catch (_) { /* ignore URL parse errors */ }

    return url;
}

const pool = new Pool({
    connectionString: resolveDbUrl(),
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
