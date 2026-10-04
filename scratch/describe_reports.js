const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Vallurishiva1188',
    database: process.env.DB_NAME || 'traffic_reporter'
  });
  const [rows] = await connection.query('DESCRIBE reports');
  console.log('--- reports table schema ---');
  console.table(rows);
  await connection.end();
})();
