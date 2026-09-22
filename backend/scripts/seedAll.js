const pool = require('../config/database');

async function seedAll() {
  try {
    console.log('🌱 Starting complete data seeding...');

    // Get org_id
    const orgResult = await pool.query('SELECT org_id FROM organizations LIMIT 1');
    if (orgResult.rows.length === 0) {
      console.error('❌ No organization found.');
      process.exit(1);
    }
    const orgId = orgResult.rows[0].org_id;
    console.log(`✅ Using org_id: ${orgId}`);

    // ==================== CREATE LOCATIONS ====================
    console.log('\n📍 Creating locations...');
    
    const locationNames = [
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

    const locationMap = {};
    for (const locName of locationNames) {
      // Determine location type
      let locType = 'shopfloor';
      if (locName.includes('Warehouse') || locName.includes('Stores') || locName.includes('Returns')) {
        locType = 'warehouse';
      }
      if (locName.includes('Lab') || locName.includes('RnD')) {
        locType = 'laboratory';
      }

      const result = await pool.query(
        'INSERT INTO locations (org_id, location_name, location_type, created_at) VALUES ($1, $2, $3, NOW()) RETURNING location_id',
        [orgId, locName, locType]
      );
      locationMap[locName] = result.rows[0].location_id;
      console.log(`  ✅ Created: ${locName} (${locType})`);
    }

    // ==================== CREATE TEAM ====================
    console.log('\n👥 Creating team...');
    
    // Get first location for team
    const firstLocResult = await pool.query('SELECT location_id FROM locations LIMIT 1');
    const firstLocationId = firstLocResult.rows[0].location_id;

    const teamResult = await pool.query(
      'INSERT INTO teams (org_id, location_id, team_name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING team_id',
      [orgId, firstLocationId, 'Kaizen Audit Team']
    );
    const teamId = teamResult.rows[0].team_id;
    console.log(`  ✅ Created team: Kaizen Audit Team (ID: ${teamId})`);

    // ==================== GET AUDIT TYPES ====================
    const auditTypesResult = await pool.query('SELECT audit_type_id, audit_type_name FROM audit_types');
    const auditTypeMap = {};
    auditTypesResult.rows.forEach(row => {
      auditTypeMap[row.audit_type_name.toLowerCase()] = row.audit_type_id;
    });
    console.log(`\n✅ Found ${auditTypesResult.rows.length} audit types`);
    console.log('Audit types available:', Object.keys(auditTypeMap));

    // ==================== GET AUDITOR ====================
    const auditorResult = await pool.query('SELECT user_id FROM users WHERE role = $1 LIMIT 1', ['auditor']);
    if (auditorResult.rows.length === 0) {
      console.error('❌ No auditor user found.');
      process.exit(1);
    }
    const auditorId = auditorResult.rows[0].user_id;
    console.log(`✅ Using auditor_id: ${auditorId}`);

    // ==================== GENERATE AUDITS ====================
    console.log('\n📊 Generating 12 months of audit data...\n');

    const generateScore = () => Math.floor(Math.random() * (95 - 50 + 1)) + 50;

    const startDate = new Date('2025-09-01');
    let auditCount = 0;

    for (let month = 0; month < 12; month++) {
      const auditDate = new Date(startDate);
      auditDate.setMonth(auditDate.getMonth() + month);
      const dateStr = auditDate.toISOString().split('T')[0];

      for (const [locName, locationId] of Object.entries(locationMap)) {
        // Determine audit type based on location name
        let auditTypeId = auditTypeMap['warehouse 6s audit'];
        
        if (locName.includes('Lab') || locName.includes('RnD')) {
          auditTypeId = auditTypeMap['laboratory 6s audit'];
        } else if (!locName.includes('Warehouse') && !locName.includes('Stores') && !locName.includes('Returns')) {
          auditTypeId = auditTypeMap['shopfloor 6s audit'];
        }

        // Verify audit type was found
        if (!auditTypeId) {
          console.error(`❌ Could not find audit type for location: ${locName}`);
          continue;
        }

        const score = generateScore();
        const percentage = score;

        const query = `
          INSERT INTO audits (
            org_id,
            audit_type_id,
            location_id,
            team_id,
            audit_date,
            auditor_id,
            team_name,
            total_score,
            percentage_score,
            status,
            notes,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        `;

        const values = [
          orgId,
          auditTypeId,
          locationId,
          teamId,
          dateStr,
          auditorId,
          'Kaizen Audit Team',
          score,
          percentage,
          'submitted',
          `Test audit for ${locName}`
        ];

        await pool.query(query, values);
        auditCount++;
        console.log(`  ✅ Audit ${auditCount}: ${locName} - ${dateStr} (Score: ${score}%)`);
      }
    }

    console.log(`\n🎉 Successfully created ${auditCount} test audits!`);
    console.log(`📊 Data spans 12 months across ${locationNames.length} locations`);
    console.log(`📈 Ready for dashboard testing!\n`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

seedAll();
