
import knex from 'knex';

const db = knex({
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
    max: 4,          
    idleTimeoutMillis: 30000, 
    acquireTimeoutMillis: 30000 
  },
  debug: process.env.NODE_ENV !== 'production'
});



export default db;