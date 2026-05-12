/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Database Seeding Script
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });


const supabase = require('../config/supabase');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // ============================================
    // 1. SEED ORGANIZATION
    // ============================================
    console.log('📍 Seeding Organization...');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        org_name: 'Capwell Industries Limited',
        org_code: 'CIL',
        description: 'Leading diversified food processor in Kenya'
      }])
      .select();

    if (orgError) throw orgError;
    const orgId = orgData[0].org_id;
    console.log(`✅ Organization created: ${orgId}\n`);

    // ============================================
    // 2. SEED LOCATIONS
    // ============================================
    console.log('📍 Seeding Locations...');
    const locations = [
      { name: 'Raw Materials Warehouse', type: 'warehouse', plant: 'Central' },
      { name: 'Finished Goods Warehouse', type: 'warehouse', plant: 'Central' },
      { name: 'Beverage Plant', type: 'shopfloor', plant: 'Beverage' },
      { name: 'Maize Mills Plant', type: 'shopfloor', plant: 'Maize Mills' },
      { name: 'Quality Assurance Lab', type: 'laboratory', plant: 'Central' }
    ];

    const locationsData = locations.map(loc => ({
      org_id: orgId,
      location_name: loc.name,
      location_type: loc.type,
      plant_name: loc.plant,
      address: 'Thika, Kenya',
      manager_name: 'Manager Name',
      manager_email: 'manager@capwell.co.ke',
      is_active: true
    }));

    const { data: locData, error: locError } = await supabase
      .from('locations')
      .insert(locationsData)
      .select();

    if (locError) throw locError;
    console.log(`✅ ${locData.length} locations created\n`);

    // ============================================
    // 3. SEED AUDIT TYPES
    // ============================================
    console.log('📋 Seeding Audit Types...');
    const auditTypes = [
      {
        audit_type_name: 'Warehouse 6S Audit',
        audit_code: 'CIL/OPEX/6S/REC/004',
        max_score: 100,
        description: 'Audit for warehouse operations'
      },
      {
        audit_type_name: 'Plant/Shopfloor 6S Audit',
        audit_code: 'CIL/OPEX/6S/REC/002',
        max_score: 120,
        description: 'Audit for production processes and maintenance'
      },
      {
        audit_type_name: 'Laboratory 6S Audit',
        audit_code: 'CIL/OPEX/6S/REC/003',
        max_score: 100,
        description: 'Audit for laboratory operations'
      },
      {
        audit_type_name: '6S Internal Audit',
        audit_code: 'CIL/OPEX/KAIZEN/REC/001',
        max_score: 100,
        description: 'Weekly internal audit tracking'
      }
    ];

    const auditTypesWithOrg = auditTypes.map(at => ({
      ...at,
      org_id: orgId,
      is_active: true
    }));

    const { data: auditTypeData, error: auditTypeError } = await supabase
      .from('audit_types')
      .insert(auditTypesWithOrg)
      .select();

    if (auditTypeError) throw auditTypeError;
    console.log(`✅ ${auditTypeData.length} audit types created\n`);

    // ============================================
    // 4. SEED AUDIT SECTIONS
    // ============================================
    console.log('📊 Seeding Audit Sections...');
    const sections = [
      { code: '1S', name: 'Sort', swahili: 'Kuchagua', maxPoints: 10 },
      { code: '2S', name: 'Set in Order', swahili: 'Kupanga', maxPoints: 15 },
      { code: '3S', name: 'Shine', swahili: 'Kusafisha', maxPoints: 15 },
      { code: '4S', name: 'Standardize', swahili: 'Kusanifisha', maxPoints: 20 },
      { code: '5S', name: 'Sustain', swahili: 'Kudumisha', maxPoints: 20 },
      { code: '6S', name: 'Safety', swahili: 'Kusitirisha', maxPoints: 20 }
    ];

    const sectionsData = [];
    auditTypeData.forEach((auditType, idx) => {
      sections.forEach((section, sIdx) => {
        // Adjust max points for shopfloor (120 total)
        let maxPoints = section.maxPoints;
        if (auditType.audit_code === 'CIL/OPEX/6S/REC/002') {
          maxPoints = 20; // All sections 20 points for shopfloor
        }

        sectionsData.push({
          audit_type_id: auditType.audit_type_id,
          section_name: section.name,
          section_code: section.code,
          section_name_swahili: section.swahili,
          max_points: maxPoints,
          description: `${section.name} section for ${auditType.audit_type_name}`,
          order_number: sIdx + 1
        });
      });
    });

    const { data: sectionData, error: sectionError } = await supabase
      .from('audit_sections')
      .insert(sectionsData)
      .select();

    if (sectionError) throw sectionError;
    console.log(`✅ ${sectionData.length} sections created\n`);

    // ============================================
    // 5. SEED CHECKPOINTS
    // ============================================
    console.log('✓ Seeding Checkpoints...');
    const checkpointTemplates = [
      { name: 'Checkpoint 1', description: 'First checkpoint' },
      { name: 'Checkpoint 2', description: 'Second checkpoint' },
      { name: 'Checkpoint 3', description: 'Third checkpoint' },
      { name: 'Checkpoint 4', description: 'Fourth checkpoint' },
      { name: 'Checkpoint 5', description: 'Fifth checkpoint' }
    ];

    const checkpointsData = [];
    sectionData.forEach((section, idx) => {
      checkpointTemplates.forEach((checkpoint, cIdx) => {
        checkpointsData.push({
          section_id: section.section_id,
          checkpoint_name: checkpoint.name,
          checkpoint_description: checkpoint.description,
          scoring_type: 'abnormality_based',
          scoring_criteria: JSON.stringify({
            0: 'Full marks',
            '1-2': 'Half marks',
            '3+': 'Zero marks'
          }),
          evidence_required: false,
          order_number: cIdx + 1
        });
      });
    });

    const { data: checkpointData, error: checkpointError } = await supabase
      .from('audit_checkpoints')
      .insert(checkpointsData)
      .select();

    if (checkpointError) throw checkpointError;
    console.log(`✅ ${checkpointData.length} checkpoints created\n`);

    // ============================================
    // 6. SEED TEAMS
    // ============================================
    console.log('👥 Seeding Teams...');
    const teamsData = locData.map(loc => ({
      org_id: orgId,
      location_id: loc.location_id,
      team_name: `${loc.location_name} Team`,
      team_lead_name: 'Team Lead',
      team_lead_email: 'lead@capwell.co.ke',
      members: JSON.stringify([
        { name: 'Member 1', email: 'member1@capwell.co.ke' },
        { name: 'Member 2', email: 'member2@capwell.co.ke' }
      ]),
      is_active: true
    }));

    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert(teamsData)
      .select();

    if (teamError) throw teamError;
    console.log(`✅ ${teamData.length} teams created\n`);

    // ============================================
    // 7. SEED USERS
    // ============================================
    console.log('👤 Seeding Users...');
    const usersData = [
      {
        org_id: orgId,
        email: 'mercy@capwell.co.ke',
        name: 'Mercy Karuoya',
        role: 'admin',
        location_id: locData[0].location_id,
        team_id: teamData[0].team_id,
        is_active: true
      },
      {
        org_id: orgId,
        email: 'auditor1@capwell.co.ke',
        name: 'Auditor One',
        role: 'auditor',
        location_id: locData[0].location_id,
        team_id: teamData[0].team_id,
        is_active: true
      },
      {
        org_id: orgId,
        email: 'manager@capwell.co.ke',
        name: 'Manager',
        role: 'manager',
        location_id: locData[0].location_id,
        is_active: true
      }
    ];

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(usersData)
      .select();

    if (userError) throw userError;
    console.log(`✅ ${userData.length} users created\n`);

    // ============================================
    // 8. SEED SAMPLE AUDITS
    // ============================================
    console.log('📋 Seeding Sample Audits...');
    const auditsData = [
      {
        org_id: orgId,
        audit_type_id: auditTypeData[0].audit_type_id,
        location_id: locData[0].location_id,
        team_id: teamData[0].team_id,
        audit_date: '2026-04-08',
        auditor_id: userData[1].user_id,
        team_name: teamData[0].team_name,
        status: 'submitted',
        total_score: 85,
        percentage_score: 85,
        notes: 'Sample audit for testing'
      },
      {
        org_id: orgId,
        audit_type_id: auditTypeData[1].audit_type_id,
        location_id: locData[2].location_id,
        team_id: teamData[2].team_id,
        audit_date: '2026-04-07',
        auditor_id: userData[1].user_id,
        team_name: teamData[2].team_name,
        status: 'submitted',
        total_score: 92,
        percentage_score: 76.67,
        notes: 'Shopfloor audit'
      }
    ];

    const { data: auditData, error: auditError } = await supabase
      .from('audits')
      .insert(auditsData)
      .select();

    if (auditError) throw auditError;
    console.log(`✅ ${auditData.length} sample audits created\n`);

    console.log('✅ ✅ ✅ DATABASE SEEDING COMPLETE! ✅ ✅ ✅\n');
    console.log('Summary:');
    console.log(`  - Organization: 1`);
    console.log(`  - Locations: ${locData.length}`);
    console.log(`  - Audit Types: ${auditTypeData.length}`);
    console.log(`  - Sections: ${sectionData.length}`);
    console.log(`  - Checkpoints: ${checkpointData.length}`);
    console.log(`  - Teams: ${teamData.length}`);
    console.log(`  - Users: ${userData.length}`);
    console.log(`  - Sample Audits: ${auditData.length}\n`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
