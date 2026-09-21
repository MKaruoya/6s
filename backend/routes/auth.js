/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Validate email is @capwell.co.ke
    if (!email.endsWith('@capwell.co.ke')) {
      return res.status(400).json({ message: 'Only @capwell.co.ke emails allowed' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(401).json({ message: 'Account is locked. Try again later.' });
    }

    // Check password
    const validPassword = user.password ? await bcrypt.compare(password, user.password) : false;
    
    if (!validPassword) {
      // Increment login attempts
      const attempts = (user.login_attempts || 0) + 1;
      let lockedUntil = null;

      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }

      await pool.query(
        'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE user_id = $3',
        [attempts, lockedUntil, user.user_id]
      );

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user's assigned gembas (if auditor)
    let gembas = [];
    if (user.role === 'auditor') {
      const gembaResult = await pool.query(
        'SELECT gemba_name FROM user_gembas WHERE user_id = $1',
        [user.user_id]
      );
      gembas = gembaResult.rows.map(row => row.gemba_name);
    }

    // Reset login attempts
    await pool.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.role,
        gembas: gembas,
        org_id: user.org_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        gembas: gembas,
        location_id: user.location_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== REGISTER (Coordinator only) ====================
router.post('/register', authMiddleware, roleMiddleware(['admin', 'coordinator']), async (req, res) => {
  try {
    const { email, password, name, role, location_id, gembas } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate email
    if (!email.endsWith('@capwell.co.ke')) {
      return res.status(400).json({ message: 'Only @capwell.co.ke emails allowed' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (org_id, email, password, name, role, location_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, TRUE) 
       RETURNING user_id, email, name, role`,
      [req.user.org_id, email, hashedPassword, name, role, location_id]
    );

    const newUser = result.rows[0];

    // Assign gembas if auditor
    if (role === 'auditor' && gembas && gembas.length > 0) {
      for (const gemba of gembas) {
        await pool.query(
          'INSERT INTO user_gembas (user_id, gemba_name) VALUES ($1, $2)',
          [newUser.user_id, gemba]
        );
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET CURRENT USER ====================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, email, name, role, location_id FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Export middleware for use in other routes
router.authMiddleware = authMiddleware;
router.roleMiddleware = roleMiddleware;

module.exports = router;
// Export middleware for use in other routes
module.exports = router;
module.exports.authMiddleware = authMiddleware;
module.exports.roleMiddleware = roleMiddleware;
