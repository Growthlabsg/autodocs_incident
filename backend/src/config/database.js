// src/config/database.js
// PostgreSQL Database Configuration and Connection Pool

const { Pool } = require('pg');

// Database configuration
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'autodocs_autoincident',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(config);

// Pool event handlers
pool.on('connect', () => {
    console.log('📊 New database connection established');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connection test successful:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        throw error;
    }
};

// Query helper function
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Query executed:', { text, duration: `${duration}ms`, rows: result.rowCount });
        }
        
        return result;
    } catch (error) {
        console.error('❌ Query error:', error);
        throw error;
    }
};

// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Parameterized query builder helper
const buildWhereClause = (filters) => {
    const conditions = [];
    const values = [];
    let paramCount = 1;

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            conditions.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }
    });

    return {
        whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
        values
    };
};

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
    buildWhereClause
};
