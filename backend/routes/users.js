/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * User Management Routes
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

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// ==================== GET ALL USERS ====================
router.get('/', authMiddleware, roleMiddleware(['admin', 'coordinator']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        user_id, 
        email, 
        name, 
        role, 
        location_id, 
        is_active,
        created_at
      FROM users 
      WHERE org_id = $1
      ORDER BY created_at DESC`,
      [req.user.org_id]
    );

    // Get gembas for each user
    const users = await Promise.all(
      result.rows.map(async (user) => {
        const gembaResult = await pool.query(
          'SELECT gemba_name FROM user_gembas WHERE user_id = $1',
          [user.user_id]
        );
        return {
          ...user,
          gembas: gembaResult.rows.map(row => row.gemba_name)
        };
      })
    );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET SINGLE USER ====================
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT user_id, email, name, role, location_id, is_active FROM users WHERE user_id = $1 AND org_id = $2',
      [userId, req.user.org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Get gembas
    const gembaResult = await pool.query(
      'SELECT gemba_name FROM user_gembas WHERE user_id = $1',
      [userId]
    );

    res.json({
      ...user,
      gembas: gembaResult.rows.map(row => row.gemba_name)
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== UPDATE USER ====================
router.put('/:userId', authMiddleware, roleMiddleware(['admin', 'coordinator']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, role, location_id, gembas } = req.body;

    // Update user
    await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, location_id = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $4 AND org_id = $5`,
      [name, role, location_id || null, userId, req.user.org_id]
    );

    // Update gembas if provided
    if (gembas && Array.isArray(gembas)) {
      // Delete existing gembas
      await pool.query('DELETE FROM user_gembas WHERE user_id = $1', [userId]);

      // Add new gembas
      for (const gemba of gembas) {
        await pool.query(
          'INSERT INTO user_gembas (user_id, gemba_name) VALUES ($1, $2)',
          [userId, gemba]
        );
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== DELETE USER ====================
router.delete('/:userId', authMiddleware, roleMiddleware(['admin', 'coordinator']), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const result = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1 AND org_id = $2',
      [userId, req.user.org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user (cascades to user_gembas)
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
