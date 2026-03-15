const mysql = require('mysql2/promise');

// Lazy-initialized pool so the server can start even if the DB is down.
let pool;

const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'homebase_app',
  password: process.env.DB_PASSWORD || 'homebase_app_pw',
  database: process.env.DB_NAME || 'homebase',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 5),
  queueLimit: 0,
};

function getPool() {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
  }
  return pool;
}

async function ping() {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.query('SELECT 1 AS ok');
    return rows?.[0]?.ok === 1;
  } finally {
    connection.release();
  }
}

module.exports = {
  getPool,
  ping,
};
