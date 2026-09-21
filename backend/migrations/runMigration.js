const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'capwell_6s'
});

const createActionItemsTable = async () => {
  try {
    console.log('🔄 Dropping old table if exists...');

    await pool.query(`DROP TABLE IF EXISTS action_items CASCADE;`);

    console.log('🔄 Creating action_items table...');

    await pool.query(`
      CREATE TABLE action_items (
        action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        audit_id UUID REFERENCES audits(audit_id) ON DELETE SET NULL,
        section_id VARCHAR(10),
        description TEXT NOT NULL,
        assigned_to VARCHAR(255),
        location VARCHAR(255),
        due_date DATE NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('🔄 Creating indexes...');

    await pool.query(`
      CREATE INDEX idx_action_items_audit_id ON action_items(audit_id);
    `);

    await pool.query(`
      CREATE INDEX idx_action_items_status ON action_items(status);
    `);

    await pool.query(`
      CREATE INDEX idx_action_items_assigned_to ON action_items(assigned_to);
    `);

    await pool.query(`
      CREATE INDEX idx_action_items_location ON action_items(location);
    `);

    await pool.query(`
      CREATE INDEX idx_action_items_due_date ON action_items(due_date);
    `);

    console.log('✅ Table and indexes created successfully!');

    await pool.end();

    process.exit(0);

  } catch (error) {

    console.error('❌ Error:', error.message);

    await pool.end();

    process.exit(1);

  }

};

createActionItemsTable();
