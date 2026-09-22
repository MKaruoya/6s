const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


// Routes
const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audits');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const locationRoutes = require('./routes/locations');
const actionItemRoutes = require('./routes/actionItems');

// Auth Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/audits', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/action-items', actionItemRoutes);

// ==================== SERVE FRONTEND ====================

// Serve static files from frontend build
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// Catch-all for React Router - must be AFTER all API routes
app.use((req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Serve index.html for all other routes (React Router)
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ error: 'Could not serve application' });
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Access from phone: http://YOUR_IP:${PORT}`);
  console.log(`💻 Local access: http://localhost:${PORT}`);
  console.log('');
  console.log('API Endpoints:');
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Audits API: http://localhost:${PORT}/api/audits`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🔐 Roles API: http://localhost:${PORT}/api/roles`);
  console.log(`📍 Locations API: http://localhost:${PORT}/api/locations`);
  console.log(`✓ Action Items API: http://localhost:${PORT}/api/action-items`);
});
