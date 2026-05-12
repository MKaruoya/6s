/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Clear Database Script
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const supabase = require('../config/supabase');

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing database...\n');

    // Delete in reverse order of dependencies
    const tables = [
      'audit_history',
      'evidence',
      'action_items',
      'penalties',
      'audit_trends',
      'audit_calculations',
      'audit_responses',
      'audits',
      'audit_checkpoints',
      'audit_sections',
      'audit_types',
      'users',
      'teams',
      'locations',
      'organizations'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`✅ Cleared ${table}`);
      }
    }

    console.log('\n✅ Database cleared successfully!\n');
  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    process.exit(1);
  }
}

clearDatabase();
