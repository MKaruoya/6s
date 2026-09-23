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
    
    const teamResult = await pool.query(
      'INSERT INTO teams (org_id, team_name, created_at) VALUES ($1, $2, NOW()) RETURNING team_id',
      [orgId, 'Kaizen Audit Team']
    );
    const teamId = teamResult.rows[0].team_id;
    console.log(`  ✅ Created team: Kaizen Audit Team`);

    // ==================== GET AUDIT TYPES ====================
    const auditTypesResult = await pool.query('SELECT audit_type_id, audit_type_name FROM audit_types');
    const auditTypeMap = {};
    auditTypesResult.rows.forEach(row => {
      auditTypeMap[row.audit_type_name.toLowerCase()] = row.audit_type_id;
    });
    console.log(`\n✅ Found ${auditTypesResult.rows.length} audit types`);

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

    const generateSectionScores = () => {
      return {
        '1S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
        '2S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
        '3S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
        '4S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
        '5S': Math.floor(Math.random() * (100 - 40 + 1)) + 40,
        '6S': Math.floor(Math.random() * (100 - 40 + 1)) + 40
      };
    };

    const generateSections = () => {
      const sections = {};
      ['1S', '2S', '3S', '4S', '5S', '6S'].forEach(code => {
        sections[code] = {
          checkpoints: {
            0: Math.floor(Math.random() * 4),
            1: Math.floor(Math.random() * 4),
            2: Math.floor(Math.random() * 4),
            3: Math.floor(Math.random() * 4),
            4: Math.floor(Math.random() * 4)
          },
          comments: `Test audit for ${code}`
        };
      });
      return sections;
    };

    const startDate = new Date('2025-09-01');
    let auditCount = 0;

    for (let month = 0; month < 12; month++) {
      const auditDate = new Date(startDate);
      auditDate.setMonth(auditDate.getMonth() + month);
      const dateStr = auditDate.toISOString().split('T')[0];

      for (const [locName, locationId] of Object.entries(locationMap)) {
        // Determine audit type
        let auditTypeId = auditTypeMap['warehouse'];
        if (locName.includes('Lab') || locName.includes('RnD')) {
          auditTypeId = auditTypeMap['laboratory'];
        } else if (!locName.includes('Warehouse') && !locName.includes('Stores') && !locName.includes('Returns')) {
          auditTypeId = auditTypeMap['shopfloor'];
        }

        const score = generateScore();
        const percentage = score;
        const sixSScores = generateSectionScores();
        const sections = generateSections();

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
            sections,
            six_s_scores,
            status,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
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
          JSON.stringify(sections),
          JSON.stringify(sixSScores),
          'submitted'
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
    process.exit(1);
  }
}

seedAll();
