import { supabase } from './supabaseClient';

// Default org and user IDs
const DEFAULT_ORG_ID = 'fb04f2f4-8cb8-4b3f-8041-133886194754';
const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const DEFAULT_LOCATION_ID = '550e8400-e29b-41d4-a716-446655440000';

// Audit type IDs mapped by audit type
const AUDIT_TYPE_MAP = {
  warehouse: '4c67665b-dd1f-43fa-87a5-a7d9477cf303',
  shopfloor: 'bf0e6a59-a9b3-47f6-b6d5-18f0df806d45',
  laboratory: 'e1d3647c-aa77-420b-b072-d131f7b1af6a',
  internal: '5846ef78-480d-499f-92b1-ffdcc158fe93'
};

// Save audit to Supabase
export const saveAudit = async (auditData) => {
  try {
    // Get the correct audit type ID based on audit type
    const auditTypeId = AUDIT_TYPE_MAP[auditData.auditType] || AUDIT_TYPE_MAP.warehouse;

    // Use gemba as the location (team_name in database)
    const location = auditData.gemba || auditData.areaAudited || auditData.location || 'Unknown';

    // Prepare the notes object with all data including sixSScores
    const notesData = {
      auditors: auditData.auditors,
      teamName: auditData.teamName,
      areaAudited: auditData.areaAudited,
      sections: auditData.sections,
      sixSScores: auditData.sixSScores || {}  // EXPLICITLY ADD 6S SCORES
    };

    // Prepare the audit record
    const auditRecord = {
      org_id: DEFAULT_ORG_ID,
      audit_type_id: auditTypeId,
      location_id: DEFAULT_LOCATION_ID,
      audit_date: auditData.auditDate || auditData.auditPeriodStart || new Date().toISOString().split('T')[0],
      auditor_id: DEFAULT_USER_ID,
      team_name: location,
      status: 'submitted',
      total_score: auditData.totalScore || 0,
      percentage_score: auditData.percentage || 0,
      notes: JSON.stringify(notesData),  // CLEAN JSON WITH sixSScores
      submitted_at: new Date().toISOString()
    };

    console.log('Saving audit record:', auditRecord);
    console.log('6S Scores being saved:', auditData.sixSScores);

    const { data, error } = await supabase
      .from('audits')
      .insert([auditRecord])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Failed to save audit');
    }

    console.log('Audit saved successfully:', data);
    return data;
  } catch (err) {
    console.error('Save audit error:', err);
    throw err;
  }
};

// Get all audits
export const getAudits = async () => {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .order('audit_date', { ascending: false });

    if (error) {
      console.error('Error fetching audits:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Get audits error:', err);
    return [];
  }
};

// Get audits by location (gemba)
export const getAuditsByLocation = async (location) => {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('team_name', location)
      .order('audit_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('Get audits by location error:', err);
    return [];
  }
};

// Get audits by audit type
export const getAuditsByType = async (auditType) => {
  try {
    const auditTypeId = AUDIT_TYPE_MAP[auditType];
    
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('audit_type_id', auditTypeId)
      .order('audit_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('Get audits by type error:', err);
    return [];
  }
};
