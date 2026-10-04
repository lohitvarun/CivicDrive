const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/certificates - Fetch earned certificates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    let query, params;

    if (req.user.role === 'officer') {
      query = `
        SELECT c.*, r.report_code, r.violation_type, r.vehicle_number, r.location, u.name as user_name, u.email as user_email
        FROM certificates c
        JOIN reports r ON c.report_id = r.id
        JOIN users u ON c.user_id = u.id
        ORDER BY c.issued_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT c.*, r.report_code, r.violation_type, r.vehicle_number, r.location, u.name as user_name, u.email as user_email
        FROM certificates c
        JOIN reports r ON c.report_id = r.id
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id = ?
        ORDER BY c.issued_at DESC
      `;
      params = [req.user.id];
    }

    const [certs] = await pool.query(query, params);
    res.json(certs);
  } catch (error) {
    console.error('Fetch certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

module.exports = router;
