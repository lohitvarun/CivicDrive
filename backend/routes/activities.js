const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/activities - Fetch activity logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    let query, params;

    if (req.user.role === 'officer') {
      query = 'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100';
      params = [];
    } else {
      query = 'SELECT * FROM activity_logs WHERE email = ? ORDER BY created_at DESC LIMIT 50';
      params = [req.user.email];
    }

    const [activities] = await pool.query(query, params);
    res.json(activities);
  } catch (error) {
    console.error('Fetch activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
