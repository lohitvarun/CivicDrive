const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/stats - Dashboard summary metrics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    const isOfficer = req.user.role === 'officer';

    let totalQuery = isOfficer ? 'SELECT COUNT(*) as count FROM reports' : 'SELECT COUNT(*) as count FROM reports WHERE user_id = ?';
    let pendingQuery = isOfficer ? 'SELECT COUNT(*) as count FROM reports WHERE status IN ("pending", "review")' : 'SELECT COUNT(*) as count FROM reports WHERE user_id = ? AND status IN ("pending", "review")';
    let approvedQuery = isOfficer ? 'SELECT COUNT(*) as count FROM reports WHERE status = "approved"' : 'SELECT COUNT(*) as count FROM reports WHERE user_id = ? AND status = "approved"';
    let certsQuery = isOfficer ? 'SELECT COUNT(*) as count FROM certificates' : 'SELECT COUNT(*) as count FROM certificates WHERE user_id = ?';

    const params = isOfficer ? [] : [userId];

    const [[{ count: total }]] = await pool.query(totalQuery, params);
    const [[{ count: pending }]] = await pool.query(pendingQuery, params);
    const [[{ count: approved }]] = await pool.query(approvedQuery, params);
    const [[{ count: certs }]] = await pool.query(certsQuery, params);

    // Also get violation category breakdown for charts
    const [breakdown] = await pool.query(
      `SELECT violation_type, COUNT(*) as count 
       FROM reports ${isOfficer ? '' : 'WHERE user_id = ?'} 
       GROUP BY violation_type ORDER BY count DESC`,
      params
    );

    res.json({
      total,
      pending,
      approved,
      certs,
      breakdown
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
