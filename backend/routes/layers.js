const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/layers/map-data — All GIS layer data in one call
router.get('/map-data', async (req, res) => {
  try {
    const pool = getPool();

    const [hotspots] = await pool.query(
      `SELECT id, report_code, violation_type, vehicle_number, location,
              latitude, longitude, severity_level, fine_amount, status, violation_time
       FROM reports ORDER BY created_at DESC`
    );

    const [cameras] = await pool.query('SELECT * FROM camera_nodes');
    const [patrols] = await pool.query('SELECT * FROM patrol_zones');
    const [alerts] = await pool.query('SELECT * FROM emergency_alerts ORDER BY created_at DESC');
    const [blacklist] = await pool.query('SELECT * FROM blacklist ORDER BY total_violations DESC');
    const [roadConditions] = await pool.query('SELECT * FROM road_conditions WHERE is_resolved = 0');
    const [challans] = await pool.query(
      `SELECT challan_number, vehicle_number, violation_type, fine_amount, payment_status, due_date
       FROM challans ORDER BY created_at DESC LIMIT 20`
    );
    const [petrolStations] = await pool.query('SELECT * FROM petrol_stations');

    const trafficFlow = [
      { id: 'SIG-01', location: 'Central Circle', status: 'GREEN',  flow_rate: 'Heavy',     speed_avg: '38 km/h', lat: 18.5204, lng: 73.8567 },
      { id: 'SIG-02', location: 'Market Chowk',   status: 'RED',    flow_rate: 'Congested',  speed_avg: '12 km/h', lat: 18.5120, lng: 73.8420 },
      { id: 'SIG-03', location: 'Highway Bypass',  status: 'GREEN',  flow_rate: 'Clear',      speed_avg: '72 km/h', lat: 18.5350, lng: 73.8680 },
      { id: 'SIG-04', location: 'University Road', status: 'YELLOW', flow_rate: 'Moderate',   speed_avg: '45 km/h', lat: 18.5480, lng: 73.8290 }
    ];

    res.json({
      layer_hotspots:      hotspots,
      layer_cameras:       cameras,
      layer_patrols:       patrols,
      layer_traffic_flow:  trafficFlow,
      layer_alerts:        alerts,
      layer_blacklist:     blacklist,
      layer_road_conditions: roadConditions,
      layer_challans:      challans,
      layer_petrol_stations: petrolStations
    });
  } catch (err) {
    console.error('Fetch map layers error:', err);
    res.status(500).json({ error: 'Failed to fetch traffic map layers' });
  }
});

// GET /api/layers/challans — Fine management list
router.get('/challans', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM challans ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch challans' });
  }
});

// PATCH /api/layers/challans/:id/pay — Mark challan paid
router.patch('/challans/:id/pay', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query(
      "UPDATE challans SET payment_status='PAID', paid_at=NOW() WHERE id=?",
      [req.params.id]
    );
    res.json({ message: 'Challan marked as PAID' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update challan' });
  }
});

// GET /api/layers/alerts — Emergency alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM emergency_alerts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/layers/alerts — Raise a new emergency alert
router.post('/alerts', authenticateToken, async (req, res) => {
  try {
    const { alert_type, description, location, latitude, longitude, severity } = req.body;
    if (!alert_type || !location) return res.status(400).json({ error: 'alert_type and location are required' });
    const pool = getPool();
    const alertCode = 'ALRT-' + Date.now().toString(36).toUpperCase();
    await pool.query(
      `INSERT INTO emergency_alerts (alert_code, alert_type, description, location, latitude, longitude, severity, raised_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [alertCode, alert_type, description || '', location, latitude || 18.5204, longitude || 73.8567, severity || 'WARNING', req.user.id]
    );
    res.status(201).json({ message: 'Emergency alert raised', alert_code: alertCode });
  } catch (err) {
    res.status(500).json({ error: 'Failed to raise alert' });
  }
});

// GET /api/layers/blacklist — Repeat offender lookup
router.get('/blacklist', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM blacklist ORDER BY total_violations DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blacklist' });
  }
});

// GET /api/layers/road-conditions — Road hazard conditions
router.get('/road-conditions', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM road_conditions ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch road conditions' });
  }
});

module.exports = router;
