const pg = require('pg-promise')();

// database configuration
const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'demo_io_db',
    user: 'postgres',
    password: 'password',
    ssl: true
};

const db = pg({
    connectionString: process.env.DATABASE_URL, 
    ssl: {rejectUnauthorized: false}});
module.exports = db;