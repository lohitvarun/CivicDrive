const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Vallurishiva1188',
    database: process.env.DB_NAME || 'traffic_reporter'
  });
  try {
    await connection.query(`ALTER TABLE reports ADD COLUMN latitude DECIMAL(10,8) DEFAULT 18.5204, ADD COLUMN longitude DECIMAL(11,8) DEFAULT 73.8567;`);
    console.log('Added latitude and longitude columns to reports table.');
  } catch (err) {
    console.error('Error altering reports table:', err);
  }
  await connection.end();
})();
