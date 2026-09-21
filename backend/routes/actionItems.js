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

// ==================== GET ALL ACTION ITEMS ====================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, assigned_to, audit_id, location } = req.query;

    let query = 'SELECT * FROM action_items WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    if (assigned_to) {
      query += ' AND assigned_to = $' + (params.length + 1);
      params.push(assigned_to);
    }

    if (audit_id) {
      query += ' AND audit_id = $' + (params.length + 1);
      params.push(audit_id);
    }

    if (location) {
      query += ' AND location = $' + (params.length + 1);
      params.push(location);
    }

    query += ' ORDER BY due_date ASC';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching action items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== GET SINGLE ACTION ITEM ====================
router.get('/:actionId', authMiddleware, async (req, res) => {
  try {
    const { actionId } = req.params;

    const result = await pool.query(
      'SELECT * FROM action_items WHERE action_id = $1',
      [actionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching action item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CREATE ACTION ITEM ====================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { audit_id, section_id, description, assigned_to, location, due_date, priority, status } = req.body;

    if (!description || !assigned_to || !due_date || !location) {
      return res.status(400).json({ message: 'Missing required fields (description, assigned_to, location, due_date)' });
    }

    const result = await pool.query(
      `INSERT INTO action_items 
       (audit_id, section_id, description, assigned_to, location, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [audit_id || null, section_id || null, description, assigned_to, location, due_date, priority || 'medium', status || 'open']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating action item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== UPDATE ACTION ITEM ====================
router.put('/:actionId', authMiddleware, async (req, res) => {
  try {
    const { actionId } = req.params;
    const { description, assigned_to, location, due_date, priority, status } = req.body;

    const result = await pool.query(
      `UPDATE action_items 
       SET description = COALESCE($1, description),
           assigned_to = COALESCE($2, assigned_to),
           location = COALESCE($3, location),
           due_date = COALESCE($4, due_date),
           priority = COALESCE($5, priority),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE action_id = $7
       RETURNING *`,
      [description, assigned_to, location, due_date, priority, status, actionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating action item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== DELETE ACTION ITEM ====================
router.delete('/:actionId', authMiddleware, async (req, res) => {
  try {
    const { actionId } = req.params;

    const result = await pool.query(
      'DELETE FROM action_items WHERE action_id = $1 RETURNING action_id',
      [actionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    res.json({ message: 'Action item deleted successfully' });
  } catch (error) {
    console.error('Error deleting action item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET ACTION ITEMS SUMMARY ====================
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status != 'completed' AND due_date < CURRENT_DATE THEN 1 ELSE 0 END) as overdue
       FROM action_items`
    );

    const data = result.rows[0];
    const closureRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

    res.json({
      ...data,
      closure_rate: closureRate
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
