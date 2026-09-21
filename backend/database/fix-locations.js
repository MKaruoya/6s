require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../config/database');

const locationsList = [
  'Mill 2 Packing',
  'Wheat Packing',
  'Mill 2',
  'Rice Mill',
  'Main Lab',
  'Rice Dryer',
  'FG Warehouse',
  'Mill 1 Packing',
  'Wheat Lab/RnD Lab',
  'Pulses & Poridge Plants',
  'Wheat Mill',
  'Wheat Silo',
  'Workshop',
  'Mill 2 Lab',
  'Mill 1',
  'Central Stores',
  'Biscuit & Chapati Plants',
  'Mill 2 Silo',
  'Mill 1 Silo',
  'Bev & RTE Plants',
  'Market Returns'
];

async function fixLocations() {
  try {
    console.log('Starting...');

    // Get org_id
    const orgResult = await pool.query(
      "SELECT org_id FROM organizations WHERE org_code = 'CIL'"
    );

    console.log('Org result:', orgResult.rows);

    if (orgResult.rows.length === 0) {
      console.log('No org found, creating one...');
      const createOrg = await pool.query(
        "INSERT INTO organizations (org_name, org_code) VALUES ('Capwell Industries Limited', 'CIL') RETURNING org_id"
      );
      orgId = createOrg.rows[0].org_id;
    } else {
      orgId = orgResult.rows[0].org_id;
    }

    console.log('Using org_id:', orgId);

    // Delete old locations
    console.log('Deleting old locations...');
    const deleteResult = await pool.query('DELETE FROM locations WHERE org_id = $1', [orgId]);
    console.log('Deleted:', deleteResult.rowCount, 'locations');

    // Insert new locations
    console.log('Inserting new locations...');
    for (const locationName of locationsList) {
      const locationType = locationName.includes('Lab') || locationName.includes('RnD') ? 'laboratory' : 
                          locationName.includes('Warehouse') || locationName.includes('Stores') ? 'warehouse' : 
                          'shopfloor';
      
      await pool.query(
        `INSERT INTO locations (org_id, location_name, location_type, is_active)
         VALUES ($1, $2, $3, TRUE)`,
        [orgId, locationName, locationType]
      );
    }

    console.log('✅ Done! Inserted', locationsList.length, 'locations');

    // Verify
    const verify = await pool.query('SELECT location_name FROM locations WHERE org_id = $1 ORDER BY location_name', [orgId]);
    console.log('\nLocations now in database:');
    verify.rows.forEach(r => console.log('  -', r.location_name));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixLocations();
