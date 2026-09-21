-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(audit_id) ON DELETE SET NULL,
  section_id VARCHAR(10),
  description TEXT NOT NULL,
  assigned_to VARCHAR(255),
  due_date DATE NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_action_items_audit_id ON action_items(audit_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_assigned_to ON action_items(assigned_to);
CREATE INDEX idx_action_items_due_date ON action_items(due_date);
