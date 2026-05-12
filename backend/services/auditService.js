/**
 * CAPWELL 6S AUDIT MANAGEMENT SYSTEM
 * Audit Service - Database Operations
 */

const supabase = require('../config/supabase');

// ============================================
// 1. CREATE AUDIT
// ============================================
async function createAudit(auditData) {
  try {
    const { data, error } = await supabase
      .from('audits')
      .insert([{
        org_id: auditData.orgId,
        audit_type_id: auditData.auditTypeId,
        location_id: auditData.locationId,
        team_id: auditData.teamId || null,
        audit_date: auditData.auditDate,
        auditor_id: auditData.auditorId,
        team_name: auditData.teamName,
        status: 'draft',
        notes: auditData.notes || null
      }])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 2. GET AUDIT BY ID
// ============================================
async function getAuditById(auditId) {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('audit_id', auditId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 3. GET ALL AUDITS WITH FILTERS
// ============================================
async function getAudits(filters = {}) {
  try {
    let query = supabase.from('audits').select('*');

    if (filters.locationId) {
      query = query.eq('location_id', filters.locationId);
    }
    if (filters.auditTypeId) {
      query = query.eq('audit_type_id', filters.auditTypeId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.teamId) {
      query = query.eq('team_id', filters.teamId);
    }

    // Order by date descending
    query = query.order('audit_date', { ascending: false });

    // Pagination
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { success: true, data, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 4. INSERT AUDIT RESPONSES
// ============================================
async function insertAuditResponses(auditId, responses) {
  try {
    const responsesToInsert = responses.map(response => ({
      audit_id: auditId,
      checkpoint_id: response.checkpointId,
      section_id: response.sectionId,
      abnormalities_found: response.abnormalities,
      points_awarded: response.points,
      comments: response.comments || null,
      evidence_url: response.evidenceUrl || null
    }));

    const { data, error } = await supabase
      .from('audit_responses')
      .insert(responsesToInsert)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 5. SAVE AUDIT CALCULATIONS
// ============================================
async function saveAuditCalculations(auditId, calculations) {
  try {
    const calculationsToInsert = calculations.sectionBreakdowns.map(section => ({
      audit_id: auditId,
      section_id: section.sectionId,
      section_score: section.baseScore,
      section_percentage: (section.baseScore / section.maxPoints) * 100,
      penalties_applied: JSON.stringify(section.penalties),
      final_section_score: section.finalScore
    }));

    const { data, error } = await supabase
      .from('audit_calculations')
      .insert(calculationsToInsert)
      .select();

    if (error) throw error;

    // Update audit with total score
    const updateResult = await updateAuditScore(auditId, calculations.totalScore, calculations.percentageScore);

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 6. UPDATE AUDIT SCORE
// ============================================
async function updateAuditScore(auditId, totalScore, percentageScore) {
  try {
    const { data, error } = await supabase
      .from('audits')
      .update({
        total_score: totalScore,
        percentage_score: percentageScore,
        updated_at: new Date()
      })
      .eq('audit_id', auditId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 7. SUBMIT AUDIT
// ============================================
async function submitAudit(auditId, userId) {
  try {
    const { data, error } = await supabase
      .from('audits')
      .update({
        status: 'submitted',
        submitted_at: new Date(),
        updated_at: new Date()
      })
      .eq('audit_id', auditId)
      .select();

    if (error) throw error;

    // Log to audit history
    await supabase.from('audit_history').insert([{
      audit_id: auditId,
      action: 'submitted',
      changed_by: userId,
      changes: JSON.stringify({ status: 'submitted' })
    }]);

    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 8. GET AUDIT TRENDS
// ============================================
async function getAuditTrends(locationId, auditTypeId, weeks = 12) {
  try {
    const { data, error } = await supabase
      .from('audit_trends')
      .select('*')
      .eq('location_id', locationId)
      .eq('audit_type_id', auditTypeId)
      .order('audit_date', { ascending: false })
      .limit(weeks);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 9. GET AUDIT SECTIONS
// ============================================
async function getAuditSections(auditTypeId) {
  try {
    const { data, error } = await supabase
      .from('audit_sections')
      .select('*')
      .eq('audit_type_id', auditTypeId)
      .order('order_number', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 10. GET CHECKPOINTS FOR SECTION
// ============================================
async function getCheckpointsForSection(sectionId) {
  try {
    const { data, error } = await supabase
      .from('audit_checkpoints')
      .select('*')
      .eq('section_id', sectionId)
      .order('order_number', { ascending: true });

    if (error) throw error;
    return { success: true, data };
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
