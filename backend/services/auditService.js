/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Audit Service - PostgreSQL Operations
 */

const pool = require('../config/database');

// ============================================
// 1. CREATE AUDIT
// ============================================
async function createAudit(auditData) {
  try {
    const query = `
      INSERT INTO audits (org_id, audit_type_id, location_id, team_id, audit_date, auditor_id, team_name, status, notes, total_score, percentage_score, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    
    const values = [
      auditData.org_id,           // Changed from orgId
      auditData.audit_type_id,    // Changed from auditTypeId
      auditData.location_id,      // Changed from locationId
      auditData.team_id || null,  // Changed from teamId
      auditData.audit_date,       // Changed from auditDate
      auditData.auditor_id,       // Changed from auditorId
      auditData.team_name,        // Changed from teamName
      auditData.status || 'draft',
      auditData.notes || null,
      auditData.total_score || 0,
      auditData.percentage_score || 0,
      auditData.submitted_at || new Date().toISOString()
    ];

    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Create audit error:', error);
    return { success: false, error: error.message };
  }
}


// ============================================
// 2. GET AUDIT BY ID
// ============================================
async function getAuditById(auditId) {
  try {
    const query = 'SELECT * FROM audits WHERE audit_id = $1;';
    const result = await pool.query(query, [auditId]);
    
    if (result.rows.length === 0) {
      return { success: false, error: 'Audit not found' };
    }
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 3. GET ALL AUDITS WITH FILTERS
// ============================================
async function getAudits(filters = {}) {
  try {
    let query = 'SELECT * FROM audits WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.locationId) {
      query += ` AND location_id = $${paramCount}`;
      values.push(filters.locationId);
      paramCount++;
    }

    if (filters.auditTypeId) {
      query += ` AND audit_type_id = $${paramCount}`;
      values.push(filters.auditTypeId);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.teamId) {
      query += ` AND team_id = $${paramCount}`;
      values.push(filters.teamId);
      paramCount++;
    }

    query += ' ORDER BY audit_date DESC';

    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM audits WHERE 1=1';
    const countValues = [];
    let countParamCount = 1;

    if (filters.locationId) {
      countQuery += ` AND location_id = $${countParamCount}`;
      countValues.push(filters.locationId);
      countParamCount++;
    }

    if (filters.auditTypeId) {
      countQuery += ` AND audit_type_id = $${countParamCount}`;
      countValues.push(filters.auditTypeId);
      countParamCount++;
    }

    if (filters.status) {
      countQuery += ` AND status = $${countParamCount}`;
      countValues.push(filters.status);
      countParamCount++;
    }

    if (filters.teamId) {
      countQuery += ` AND team_id = $${countParamCount}`;
      countValues.push(filters.teamId);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countValues);
    const count = parseInt(countResult.rows[0].count);

    return { success: true, data: result.rows, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 4. INSERT AUDIT RESPONSES
// ============================================
async function insertAuditResponses(auditId, responses) {
  try {
    const query = `
      INSERT INTO audit_responses (audit_id, checkpoint_id, section_id, abnormalities_found, points_awarded, comments, evidence_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const results = [];
    for (const response of responses) {
      const values = [
        auditId,
        response.checkpointId,
        response.sectionId,
        response.abnormalities,
        response.points,
        response.comments || null,
        response.evidenceUrl || null
      ];
      const result = await pool.query(query, values);
      results.push(result.rows[0]);
    }

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 5. SAVE AUDIT CALCULATIONS
// ============================================
async function saveAuditCalculations(auditId, calculations) {
  try {
    const query = `
      INSERT INTO audit_calculations (audit_id, section_id, section_score, section_percentage, penalties_applied, final_section_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const results = [];
    for (const section of calculations.sectionBreakdowns) {
      const values = [
        auditId,
        section.sectionId,
        section.baseScore,
        (section.baseScore / section.maxPoints) * 100,
        JSON.stringify(section.penalties),
        section.finalScore
      ];
      const result = await pool.query(query, values);
      results.push(result.rows[0]);
    }

    // Update audit with total score
    await updateAuditScore(auditId, calculations.totalScore, calculations.percentageScore);

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 6. UPDATE AUDIT SCORE
// ============================================
async function updateAuditScore(auditId, totalScore, percentageScore) {
  try {
    const query = `
      UPDATE audits 
      SET total_score = $1, percentage_score = $2, updated_at = NOW()
      WHERE audit_id = $3
      RETURNING *;
    `;
    
    const result = await pool.query(query, [totalScore, percentageScore, auditId]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 7. SUBMIT AUDIT
// ============================================
async function submitAudit(auditId, userId) {
  try {
    const query = `
      UPDATE audits 
      SET status = 'submitted', submitted_at = NOW(), updated_at = NOW()
      WHERE audit_id = $1
      RETURNING *;
    `;
    
    const result = await pool.query(query, [auditId]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 8. GET AUDIT TRENDS
// ============================================
async function getAuditTrends(locationId, auditTypeId, weeks = 12) {
  try {
    const query = `
      SELECT * FROM audit_trends 
      WHERE location_id = $1 AND audit_type_id = $2
      ORDER BY audit_date DESC
      LIMIT $3;
    `;
    
    const result = await pool.query(query, [locationId, auditTypeId, weeks]);
    return { success: true, data: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 9. GET AUDIT SECTIONS
// ============================================
async function getAuditSections(auditTypeId) {
  try {
    const query = `
      SELECT * FROM audit_sections 
      WHERE audit_type_id = $1
      ORDER BY order_number ASC;
    `;
    
    const result = await pool.query(query, [auditTypeId]);
    return { success: true, data: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 10. GET CHECKPOINTS FOR SECTION
// ============================================
async function getCheckpointsForSection(sectionId) {
  try {
    const query = `
      SELECT * FROM audit_checkpoints 
      WHERE section_id = $1
      ORDER BY order_number ASC;
    `;
    
    const result = await pool.query(query, [sectionId]);
    return { success: true, data: result.rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  createAudit,
  getAuditById,
  getAudits,
  insertAuditResponses,
  saveAuditCalculations,
  updateAuditScore,
  submitAudit,
  getAuditTrends,
  getAuditSections,
  getCheckpointsForSection
};
