import API_URL from '../config/api';

// Default org and user IDs
const DEFAULT_ORG_ID = '6a7d9fcb-d111-4e5b-a437-0a5f17aae6c7';
const DEFAULT_USER_ID = '0463b4f0-a094-4cff-9208-96d7645ed386'; // Mercy Karuoya

// Audit type IDs mapped by audit type
const AUDIT_TYPE_MAP = {
  warehouse: 'bc2e176a-87b1-476a-babe-4ed1175156ec',
  shopfloor: 'a3295ef5-082f-438a-8c2a-4c2eb4eb4a5f',
  laboratory: '96f8d592-5130-4277-beb3-66a4ef110064',
  internal: '537051a8-32b7-48ec-a685-6966808f426a'
};

// Save audit to backend
export const saveAudit = async (auditData) => {
  try {
    // Get the correct audit type ID based on audit type
    const auditTypeId = AUDIT_TYPE_MAP[auditData.auditType] || AUDIT_TYPE_MAP.warehouse;

    // Use gemba as the location (team_name in database)
    // IMPORTANT: gemba MUST be set from the form
    const location = auditData.gemba?.trim();
    
    if (!location) {
      throw new Error('Location (GEMBA) is required');
    }

    console.log('📍 Location being sent:', location);

    // Prepare the notes object with all data including sixSScores
    const notesData = {
      auditors: auditData.auditors,
      teamName: auditData.teamName,
      areaAudited: auditData.areaAudited,
      sections: auditData.sections,
      sixSScores: auditData.sixSScores || {}
    };

    // Prepare the audit record
    // DO NOT include location_id - let backend look it up from team_name
    const auditRecord = {
      org_id: DEFAULT_ORG_ID,
      audit_type_id: auditTypeId,
      team_name: location,  // Backend will look up location_id from this
      audit_date: auditData.auditDate || auditData.auditPeriodStart || new Date().toISOString().split('T')[0],
      auditor_id: DEFAULT_USER_ID,
      status: 'submitted',
      total_score: auditData.totalScore || 0,
      percentage_score: auditData.percentage || 0,
      notes: JSON.stringify(notesData),
      submitted_at: new Date().toISOString()
    };

    console.log('📝 Saving audit record:', auditRecord);
    console.log('6S Scores being saved:', auditData.sixSScores);

    // Call backend API using API_URL config
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/audits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(auditRecord)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save audit');
    }

    const data = await response.json();
    console.log('✅ Audit saved successfully:', data);

    return data;

  } catch (err) {
    console.error('❌ Save audit error:', err);
    console.error('Error message:', err.message);
    throw err;
  }
};

// Get all audits
export const getAudits = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/audits`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audits');
    }

    const data = await response.json();
    return data.data || data || [];

  } catch (err) {
    console.error('Get audits error:', err);
    return [];
  }
};

// Get audits by location (gemba)
export const getAuditsByLocation = async (location) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/audits?teamName=${encodeURIComponent(location)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audits by location');
    }

    const data = await response.json();
    return data.data || data || [];

  } catch (err) {
    console.error('Get audits by location error:', err);
    return [];
  }
};

// Get audits by audit type
export const getAuditsByType = async (auditType) => {
  try {
    const auditTypeId = AUDIT_TYPE_MAP[auditType];
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/audits?auditTypeId=${auditTypeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audits by type');
    }

    const data = await response.json();
    return data.data || data || [];

  } catch (err) {
    console.error('Get audits by type error:', err);
    return [];
  }
};

// Get single audit
export const getAuditById = async (auditId) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/audits/${auditId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit');
    }

    return await response.json();

  } catch (err) {
    console.error('Get audit by ID error:', err);
    throw err;
  }
};
