const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/petrol-stations – list all petrol stations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM petrol_stations');
    res.json(rows);
  } catch (err) {
    console.error('Fetch petrol stations error:', err);
    res.status(500).json({ error: 'Failed to fetch petrol stations' });
  }
});

module.exports = router;
