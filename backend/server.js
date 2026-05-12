const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const auditRoutes = require('./routes/audits');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const locationRoutes = require('./routes/locations');

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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Audits API: http://localhost:${PORT}/api/audits`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🔐 Roles API: http://localhost:${PORT}/api/roles`);
  console.log(`📍 Locations API: http://localhost:${PORT}/api/locations`);
});
