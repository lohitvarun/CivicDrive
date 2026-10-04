const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

let pool;

async function initDB() {
  try {
    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !process.env.DB_NAME) {
      throw new Error('Missing required database environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    }

    // Production-safe: connect directly to the database created by your DB provider.
    // Do NOT drop/recreate the database on every server restart or deployment.
    pool = mysql.createPool({
      ...dbConfig,
      database: process.env.DB_NAME || 'traffic_reporter',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // ── LAYER 0: Users ───────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('citizen','officer') DEFAULT 'citizen',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── LAYER 1: Core Violation Reports ──────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_code VARCHAR(30) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        violation_type VARCHAR(100) NOT NULL,
        vehicle_number VARCHAR(30) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10,8) DEFAULT 18.5204,
        longitude DECIMAL(11,8) DEFAULT 73.8567,
        severity_level ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
        fine_amount INT DEFAULT 1000,
        violation_time DATETIME NOT NULL,
        photo_url LONGTEXT,
        description TEXT,
        status ENUM('pending','review','approved','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ── LAYER 2: Certificates ─────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cert_number VARCHAR(50) UNIQUE NOT NULL,
        report_id INT NOT NULL,
        user_id INT NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ── LAYER 3: Activity / Audit Logs ────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(100) NOT NULL,
        action VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── MAP LAYER 4: AI Surveillance Camera Nodes ─────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS camera_nodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        camera_code VARCHAR(50) UNIQUE NOT NULL,
        location_name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        status ENUM('ACTIVE','MAINTENANCE','OFFLINE') DEFAULT 'ACTIVE',
        speed_limit INT DEFAULT 60,
        type ENUM('ANPR','SPEED_RADAR','RED_LIGHT','PTZ_DOME') DEFAULT 'ANPR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── MAP LAYER 5: Police Patrol Precincts ──────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patrol_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        zone_name VARCHAR(100) NOT NULL,
        precinct_code VARCHAR(50) UNIQUE NOT NULL,
        risk_level ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'HIGH',
        active_units INT DEFAULT 4,
        contact_phone VARCHAR(20) DEFAULT '+91-112',
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL
      );
    `);

    // ── LAYER 6: Challan / E-Fine Management ─────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS challans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        challan_number VARCHAR(40) UNIQUE NOT NULL,
        report_id INT NOT NULL,
        vehicle_number VARCHAR(30) NOT NULL,
        violation_type VARCHAR(100) NOT NULL,
        fine_amount INT NOT NULL,
        due_date DATE NOT NULL,
        payment_status ENUM('UNPAID','PAID','DISPUTED','WAIVED') DEFAULT 'UNPAID',
        paid_at TIMESTAMP NULL,
        issued_by_officer_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
      );
    `);

    // ── LAYER 7: Emergency Incident Alerts ───────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emergency_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_code VARCHAR(40) UNIQUE NOT NULL,
        alert_type ENUM('ACCIDENT','ROAD_BLOCK','FLOOD','FIRE','PROTEST','VIP_MOVEMENT','OTHER') NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10,8) DEFAULT 18.5204,
        longitude DECIMAL(11,8) DEFAULT 73.8567,
        severity ENUM('INFO','WARNING','CRITICAL') DEFAULT 'WARNING',
        is_active TINYINT(1) DEFAULT 1,
        raised_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL
      );
    `);

    // ── LAYER 8: Repeat Offender / Vehicle Blacklist ──────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blacklist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(30) UNIQUE NOT NULL,
        owner_name VARCHAR(100),
        total_violations INT DEFAULT 0,
        unpaid_fines INT DEFAULT 0,
        blacklist_reason TEXT,
        risk_tag ENUM('WATCH','HIGH_RISK','BANNED') DEFAULT 'WATCH',
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_offense_at TIMESTAMP NULL
      );
    `);

    // ── LAYER 9: Road Condition / Weather Impact Reports ─────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS road_conditions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        condition_type ENUM('POTHOLE','WATERLOGGING','CONSTRUCTION','FOG','ICE','DEBRIS','SIGNAL_FAULT') NOT NULL,
        severity ENUM('MINOR','MODERATE','SEVERE') DEFAULT 'MODERATE',
        latitude DECIMAL(10,8) DEFAULT 18.5204,
        longitude DECIMAL(11,8) DEFAULT 73.8567,
        reported_by INT,
        is_resolved TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL
      );
    `);

    // ── LAYER 10: Petrol Stations (new) ─────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS petrol_stations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_name VARCHAR(150) NOT NULL,
        brand VARCHAR(100),
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        price_per_liter DECIMAL(5,2) DEFAULT 0,
        fuel_type ENUM('PETROL','DIESEL','CNG','ELECTRIC') DEFAULT 'PETROL',
        operating_hours VARCHAR(100) DEFAULT '24/7',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS road_conditions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        condition_type ENUM('POTHOLE','WATERLOGGING','CONSTRUCTION','FOG','ICE','DEBRIS','SIGNAL_FAULT') NOT NULL,
        severity ENUM('MINOR','MODERATE','SEVERE') DEFAULT 'MODERATE',
        latitude DECIMAL(10,8) DEFAULT 18.5204,
        longitude DECIMAL(11,8) DEFAULT 73.8567,
        reported_by INT,
        is_resolved TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL
      );
    `);

    console.log('✅ All 9 MySQL Layers created/verified successfully.');

    // ─────── SEEDS ────────────────────────────────────────────────
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      const hashedOfficer = await bcrypt.hash('admin123', 10);
      const hashedCitizen = await bcrypt.hash('user123', 10);
      await pool.query('INSERT INTO users (name,email,phone,password,role) VALUES (?,?,?,?,?)',
        ['Traffic Officer Admin','officer@traffic.gov.in','+919876543210',hashedOfficer,'officer']);
      await pool.query('INSERT INTO users (name,email,phone,password,role) VALUES (?,?,?,?,?)',
        ['John Doe','user@example.com','+919123456789',hashedCitizen,'citizen']);
      console.log('   Users seeded.');
    }

    const [camRows] = await pool.query('SELECT COUNT(*) as count FROM camera_nodes');
    if (camRows[0].count === 0) {
      await pool.query(`INSERT INTO camera_nodes (camera_code,location_name,latitude,longitude,status,speed_limit,type) VALUES
        ('CAM-CENTRAL-01','Central Express Junction',18.5204,73.8567,'ACTIVE',60,'ANPR'),
        ('CAM-NORTH-04','Highway Flyover Entry',18.5350,73.8680,'ACTIVE',80,'SPEED_RADAR'),
        ('CAM-WEST-09','Market Signal Intersection',18.5120,73.8420,'ACTIVE',40,'RED_LIGHT'),
        ('CAM-SOUTH-12','Tech Park Circle',18.4980,73.8710,'ACTIVE',50,'PTZ_DOME'),
        ('CAM-EAST-15','Airport Expressway Ramp',18.5600,73.9100,'ACTIVE',70,'SPEED_RADAR')`);
      console.log('   Camera nodes seeded.');
    }

    const [patrolRows] = await pool.query('SELECT COUNT(*) as count FROM patrol_zones');
    if (patrolRows[0].count === 0) {
      await pool.query(`INSERT INTO patrol_zones (zone_name,precinct_code,risk_level,active_units,contact_phone,latitude,longitude) VALUES
        ('Downtown Control Precinct','PCT-DOWNTOWN','CRITICAL',8,'+91-100-01',18.5210,73.8550),
        ('Highway Enforcement Sector A','PCT-HWY-A','HIGH',5,'+91-100-02',18.5400,73.8750),
        ('West Ring Patrol Station','PCT-WEST','MEDIUM',3,'+91-100-03',18.5080,73.8390)`);
      console.log('   Patrol zones seeded.');
    }

    const [alertRows] = await pool.query('SELECT COUNT(*) as count FROM emergency_alerts');
    if (alertRows[0].count === 0) {
      await pool.query(`INSERT INTO emergency_alerts (alert_code,alert_type,description,location,latitude,longitude,severity,is_active) VALUES
        ('ALRT-001','ACCIDENT','Multi-vehicle pile-up near flyover ramp','National Highway 48 Flyover',18.5350,73.8680,'CRITICAL',1),
        ('ALRT-002','ROAD_BLOCK','Street blocked for maintenance work','Market Chowk MG Road',18.5120,73.8420,'WARNING',1),
        ('ALRT-003','FLOOD','Waterlogging due to heavy rainfall','Ring Road underpass',18.5050,73.8300,'CRITICAL',0)`);
      console.log('   Emergency alerts seeded.');
    }

    const [blRows] = await pool.query('SELECT COUNT(*) as count FROM blacklist');
    if (blRows[0].count === 0) {
      await pool.query(`INSERT INTO blacklist (vehicle_number,owner_name,total_violations,unpaid_fines,blacklist_reason,risk_tag) VALUES
        ('MH12AB9999','Unknown Owner',12,9800,'Repeat speeding & red-light violations','BANNED'),
        ('DL01CD5678','Ravi Sharma',4,2500,'Illegal parking & no-helmet offenses','HIGH_RISK'),
        ('TN07EF3344','Priya Kumar',2,800,'Minor violations under review','WATCH')`);
      console.log('   Blacklist seeded.');
    }

    const [rcRows] = await pool.query('SELECT COUNT(*) as count FROM road_conditions');
    if (rcRows[0].count === 0) {
      await pool.query(`INSERT INTO road_conditions (location,condition_type,severity,latitude,longitude,is_resolved) VALUES
        ('MG Road near Bus Stand','POTHOLE','SEVERE',18.5200,73.8530,0),
        ('Expressway Entry Gate','WATERLOGGING','MODERATE',18.5400,73.8680,0),
        ('City Center Flyover','SIGNAL_FAULT','SEVERE',18.5210,73.8560,0),
        ('Tech Park Road','CONSTRUCTION','MINOR',18.4980,73.8710,0)`);
      console.log('   Road conditions seeded.');

      //   Petrol stations seeded.
      const [petrolRows] = await pool.query('SELECT COUNT(*) as count FROM petrol_stations');
      if (petrolRows[0].count === 0) {
        await pool.query(`INSERT INTO petrol_stations (station_name,brand,latitude,longitude,price_per_liter,fuel_type,operating_hours) VALUES
          ('FuelHub Central','FuelHub',18.5204,73.8567,102.50,'PETROL','24/7'),
          ('Diesel Depot','DieselCo',18.5350,73.8680,95.30,'DIESEL','06:00-22:00'),
          ('EcoCharge Station','EcoCharge',18.5120,73.8420,0.00,'ELECTRIC','24/7')`);
        console.log('   Petrol stations seeded.');
      }
    }

  } catch (error) {
    console.error('MySQL initialization error:', error.message);
    throw error;
  }
}

function getPool() {
  if (!pool) throw new Error('Database pool not initialized. Call initDB first.');
  return pool;
}

module.exports = { initDB, getPool };
