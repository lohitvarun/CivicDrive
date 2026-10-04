const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const certsRoutes = require('./routes/certificates');
const activitiesRoutes = require('./routes/activities');
const statsRoutes = require('./routes/stats');
const layersRoutes = require('./routes/layers');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Traffic Reporter Backend is active' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/certificates', certsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/layers', layersRoutes);
app.use('/api/chat', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Initialize MySQL and Start Server
initDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=================================================`);
      console.log(`🚀 Smart Traffic Backend running on port ${PORT}`);
      console.log(`📊 Connected to MySQL Database: ${process.env.DB_NAME || 'traffic_reporter'}`);
      console.log(`=================================================`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database server:', err);
  });
