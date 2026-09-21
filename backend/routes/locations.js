/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Locations Management Routes
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ==================== MIDDLEWARE ====================

function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ==================== GET ALL LOCATIONS ====================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        location_id,
        location_name,
        location_type,
        plant_name,
        address,
        manager_name,
        manager_email,
        is_active,
        created_at
      FROM locations 
      WHERE org_id = $1
      ORDER BY location_name ASC`,
      [req.user.org_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== GET SINGLE LOCATION ====================
router.get('/:locationId', authMiddleware, async (req, res) => {
  try {
    const { locationId } = req.params;

    const result = await pool.query(
      `SELECT 
        location_id,
        location_name,
        location_type,
        plant_name,
        address,
        manager_name,
        manager_email,
        is_active
      FROM locations 
      WHERE location_id = $1 AND org_id = $2`,
      [locationId, req.user.org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CREATE LOCATION ====================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { location_name, location_type, plant_name, address, manager_name, manager_email } = req.body;

    if (!location_name || !location_type) {
      return res.status(400).json({ message: 'Location name and type are required' });
    }

    const result = await pool.query(
      `INSERT INTO locations 
       (org_id, location_name, location_type, plant_name, address, manager_name, manager_email, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING location_id, location_name, location_type, plant_name, address, manager_name, manager_email`,
      [req.user.org_id, location_name, location_type, plant_name || null, address || null, manager_name || null, manager_email || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== UPDATE LOCATION ====================
router.put('/:locationId', authMiddleware, async (req, res) => {
  try {
    const { locationId } = req.params;
    const { location_name, location_type, plant_name, address, manager_name, manager_email, is_active } = req.body;

    const result = await pool.query(
      `UPDATE locations 
       SET location_name = $1, location_type = $2, plant_name = $3, address = $4, 
           manager_name = $5, manager_email = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE location_id = $8 AND org_id = $9
       RETURNING location_id, location_name, location_type, plant_name, address, manager_name, manager_email`,
      [location_name, location_type, plant_name || null, address || null, manager_name || null, manager_email || null, is_active !== false, locationId, req.user.org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== DELETE LOCATION ====================
router.delete('/:locationId', authMiddleware, async (req, res) => {
  try {
    const { locationId } = req.params;

    const result = await pool.query(
      'DELETE FROM locations WHERE location_id = $1 AND org_id = $2 RETURNING location_id',
      [locationId, req.user.org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
