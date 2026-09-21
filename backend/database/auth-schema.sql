-- ============================================
-- ADD AUTHENTICATION TO USERS TABLE
-- ============================================

-- Add password and gemba columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Create user_gembas table for auditor gemba assignments
CREATE TABLE IF NOT EXISTS user_gembas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  gemba_name VARCHAR(255) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, gemba_name)
);

-- Create indexes
CREATE INDEX idx_user_gembas_user_id ON user_gembas(user_id);
CREATE INDEX idx_user_gembas_gemba ON user_gembas(gemba_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
