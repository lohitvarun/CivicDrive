const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

async function logActivity(userId, email, action) {
  try {
    const pool = getPool();
    await pool.query(
      'INSERT INTO activity_logs (user_id, email, action) VALUES (?, ?, ?)',
      [userId || null, email, action]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// POST /api/reports - Create new report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { violation_type, vehicle_number, location, violation_time, photo_url, description } = req.body;

    if (!violation_type || !vehicle_number || !location || !violation_time) {
      return res.status(400).json({ error: 'Violation type, vehicle number, location, and date/time are required' });
    }

    const pool = getPool();
    const reportCode = 'RPT-' + Date.now().toString(36).toUpperCase();

    const [result] = await pool.query(
      `INSERT INTO reports 
       (report_code, user_id, violation_type, vehicle_number, location, violation_time, photo_url, description, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        reportCode,
        req.user.id,
        violation_type,
        vehicle_number.toUpperCase(),
        location,
        new Date(violation_time),
        photo_url || null,
        description || ''
      ]
    );

    await logActivity(req.user.id, req.user.email, `Submitted report ${reportCode} (${violation_type})`);

    res.status(201).json({
      message: 'Report submitted successfully!',
      report: {
        id: result.insertId,
        report_code: reportCode,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/reports - Fetch reports (All for officer, User's for citizen)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    let query, params;

    if (req.user.role === 'officer') {
      query = `
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reports r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reports r
        JOIN users u ON r.user_id = u.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `;
      params = [req.user.id];
    }

    const [reports] = await pool.query(query, params);
    res.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PATCH /api/reports/:id/status - Update report status (Officer or owner)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const reportId = req.params.id;

    if (!['pending', 'review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = existing[0];
    const oldStatus = report.status;

    await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, reportId]);
    await logActivity(req.user.id, req.user.email, `Changed ${report.report_code}: ${oldStatus.toUpperCase()} → ${status.toUpperCase()}`);

    // If status became APPROVED, generate certificate if not already issued
    if (status === 'approved') {
      const [certCheck] = await pool.query('SELECT id FROM certificates WHERE report_id = ?', [reportId]);
      if (certCheck.length === 0) {
        const certNumber = 'RSV-' + (1000 + parseInt(reportId));
        await pool.query(
          'INSERT INTO certificates (cert_number, report_id, user_id) VALUES (?, ?, ?)',
          [certNumber, reportId, report.user_id]
        );
        await logActivity(report.user_id, req.user.email, `Issued certificate ${certNumber} for report ${report.report_code}`);
      }
    }

    res.json({ message: `Report status updated to ${status.toUpperCase()}`, status });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

module.exports = router;
