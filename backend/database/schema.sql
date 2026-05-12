-- CAPWELL 6S AUDIT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Created: 2026-04-09
-- Version: 1.0

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  org_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name VARCHAR(255) NOT NULL UNIQUE,
  org_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  location_name VARCHAR(255) NOT NULL,
  location_type VARCHAR(50) NOT NULL, -- 'warehouse', 'shopfloor', 'laboratory', 'other'
  plant_name VARCHAR(255),
  address TEXT,
  manager_name VARCHAR(255),
  manager_email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, location_name)
);

-- ============================================
-- 3. AUDIT TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_types (
  audit_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  audit_type_name VARCHAR(255) NOT NULL,
  audit_code VARCHAR(50) NOT NULL,
  max_score DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, audit_code)
);

-- ============================================
-- 4. AUDIT SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_sections (
  section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type_id UUID NOT NULL REFERENCES audit_types(audit_type_id) ON DELETE CASCADE,
  section_name VARCHAR(255) NOT NULL,
  section_code VARCHAR(10) NOT NULL, -- '1S', '2S', '3S', '4S', '5S', '6S'
  section_name_swahili VARCHAR(255),
  max_points DECIMAL(10, 2) NOT NULL,
  description TEXT,
  order_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_type_id, section_code)
);

-- ============================================
-- 5. AUDIT CHECKPOINTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_checkpoints (
  checkpoint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES audit_sections(section_id) ON DELETE CASCADE,
  checkpoint_name VARCHAR(255) NOT NULL,
  checkpoint_description TEXT,
  scoring_type VARCHAR(50) NOT NULL, -- 'abnormality_based', 'weekly_tracking', 'custom'
  scoring_criteria JSONB, -- Stores scoring rules as JSON
  evidence_required BOOLEAN DEFAULT FALSE,
  order_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section_id, order_number)
);

-- ============================================
-- 6. TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
  team_name VARCHAR(255) NOT NULL,
  team_lead_name VARCHAR(255),
  team_lead_email VARCHAR(255),
  members JSONB, -- Array of team member objects
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location_id, team_name)
);

-- ============================================
-- 7. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'auditor', 'team_lead', 'manager', 'admin'
  location_id UUID REFERENCES locations(location_id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(team_id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. AUDITS TABLE (Main Audit Records)
-- ============================================
CREATE TABLE IF NOT EXISTS audits (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  audit_type_id UUID NOT NULL REFERENCES audit_types(audit_type_id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(team_id) ON DELETE SET NULL,
  audit_date DATE NOT NULL,
  auditor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  team_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'archived'
  total_score DECIMAL(10, 2),
  percentage_score DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================
-- 9. AUDIT RESPONSES TABLE (Checkpoint Scores)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES audit_checkpoints(checkpoint_id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES audit_sections(section_id) ON DELETE CASCADE,
  abnormalities_found INT, -- 0, 1, 2, 3+
  points_awarded DECIMAL(10, 2),
  comments TEXT,
  evidence_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id, checkpoint_id)
);

-- ============================================
-- 10. AUDIT CALCULATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_calculations (
  calculation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES audit_sections(section_id) ON DELETE CASCADE,
  section_score DECIMAL(10, 2),
  section_percentage DECIMAL(5, 2),
  penalties_applied JSONB, -- JSON object with penalty details
  final_section_score DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id, section_id)
);

-- ============================================
-- 11. AUDIT TRENDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_trends (
  trend_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
  audit_type_id UUID NOT NULL REFERENCES audit_types(audit_type_id) ON DELETE CASCADE,
  audit_date DATE NOT NULL,
  week_number INT,
  month_number INT,
  year_number INT,
  section_scores JSONB, -- JSON object with all 6 section scores
  total_score DECIMAL(10, 2),
  percentage_score DECIMAL(5, 2),
  trend_direction VARCHAR(20), -- 'up', 'down', 'stable'
  trend_velocity DECIMAL(5, 2), -- Rate of change
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location_id, audit_type_id, audit_date)
);

-- ============================================
-- 12. PENALTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS penalties (
  penalty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  section_id UUID REFERENCES audit_sections(section_id) ON DELETE SET NULL,
  penalty_type VARCHAR(50) NOT NULL, -- 'decline_scoring', 'lti', 'innovation', 'custom'
  penalty_description TEXT,
  points_deducted DECIMAL(10, 2),
  points_awarded DECIMAL(10, 2),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. ACTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS action_items (
  action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  section_id UUID REFERENCES audit_sections(section_id) ON DELETE SET NULL,
  action_description TEXT NOT NULL,
  assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
  assigned_to_name VARCHAR(255),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'overdue', 'cancelled'
  completion_date DATE,
  completion_notes TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 14. EVIDENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS evidence (
  evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES audit_checkpoints(checkpoint_id) ON DELETE SET NULL,
  evidence_type VARCHAR(50) NOT NULL, -- 'photo', 'document', 'attendance_register', 'training_record', 'other'
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  uploaded_by UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- ============================================
-- 15. AUDIT HISTORY TABLE (For tracking changes)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'submitted', 'approved', 'archived'
  changed_by UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  changes JSONB, -- JSON object showing what changed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Audit queries
CREATE INDEX idx_audits_location_date ON audits(location_id, audit_date DESC);
CREATE INDEX idx_audits_team_date ON audits(team_id, audit_date DESC);
CREATE INDEX idx_audits_auditor_date ON audits(auditor_id, audit_date DESC);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_audit_type ON audits(audit_type_id);

-- Audit responses
CREATE INDEX idx_audit_responses_audit ON audit_responses(audit_id);
CREATE INDEX idx_audit_responses_checkpoint ON audit_responses(checkpoint_id);
CREATE INDEX idx_audit_responses_section ON audit_responses(section_id);

-- Trends
CREATE INDEX idx_trends_location_date ON audit_trends(location_id, audit_date DESC);
CREATE INDEX idx_trends_audit_type_date ON audit_trends(audit_type_id, audit_date DESC);

-- Action items
CREATE INDEX idx_action_items_status ON action_items(status, due_date);
CREATE INDEX idx_action_items_assigned ON action_items(assigned_to);
CREATE INDEX idx_action_items_audit ON action_items(audit_id);

-- Users and teams
CREATE INDEX idx_users_org_role ON users(org_id, role);
CREATE INDEX idx_teams_location ON teams(location_id);

-- Evidence
CREATE INDEX idx_evidence_audit ON evidence(audit_id);
CREATE INDEX idx_evidence_checkpoint ON evidence(checkpoint_id);

-- ============================================
-- SAMPLE DATA - CAPWELL INDUSTRIES
-- ============================================

-- Insert Organization
INSERT INTO organizations (org_name, org_code, description)
VALUES ('Capwell Industries Limited', 'CIL', 'Leading diversified food processor in Kenya')
ON CONFLICT (org_code) DO NOTHING;

-- Get org_id for subsequent inserts
-- Note: In production, you'll use the returned org_id from the insert above
