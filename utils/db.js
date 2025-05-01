// db.js
import knex from 'knex';
import mysql from 'mysql2/promise';

export const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  pool: {
    min: 0,
    max: 3
  },
  debug: false,
});

export const pool = mysql.createPool({ // ✅ export thêm raw pool
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  connectTimeout: 10000,      // Connection timeout in milliseconds
  acquireTimeout: 10000,      // Acquisition timeout
  idleTimeout: 60000 
});



export default db;
