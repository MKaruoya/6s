/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Authentication Schema Setup
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../config/database');

async function setupAuthSchema() {
  try {
    console.log('🔐 Setting up authentication schema...\n');

    // 1. Add password columns to users table
    console.log('📝 Adding authentication columns to users table...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255),
      ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
      ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
    `);
    console.log('✅ Users table updated\n');

    // 2. Create user_gembas table
    console.log('📝 Creating user_gembas table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_gembas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        gemba_name VARCHAR(255) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, gemba_name)
      );
    `);
    console.log('✅ user_gembas table created\n');

    // 3. Create indexes
    console.log('📝 Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_gembas_user_id ON user_gembas(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_gembas_gemba ON user_gembas(gemba_name);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    console.log('✅ Indexes created\n');

    console.log('✅ ✅ ✅ AUTHENTICATION SCHEMA SETUP COMPLETE! ✅ ✅ ✅\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up schema:', error.message);
    process.exit(1);
  }
}

setupAuthSchema();
