import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// AUDIT ENDPOINTS
// ============================================

export const auditAPI = {
  // Create new audit
  createAudit: (auditData) => 
    api.post('/audits', auditData),

  // Get all audits
  getAudits: (filters = {}) => 
    api.get('/audits', { params: filters }),

  // Get single audit
  getAuditById: (auditId) => 
    api.get(`/audits/${auditId}`),

  // Submit audit responses
  submitResponses: (auditId, responses) => 
    api.post(`/audits/${auditId}/responses`, { responses }),

  // Calculate audit score
  calculateScore: (auditId, auditData) => 
    api.post(`/audits/${auditId}/calculate`, auditData),

  // Submit audit
  submitAudit: (auditId, userId) => 
    api.post(`/audits/${auditId}/submit`, { userId }),

  // Get trends
  getTrends: (locationId, auditTypeId, weeks = 12) => 
    api.get(`/audits/trends/${locationId}`, { 
      params: { auditTypeId, weeks } 
    })
};

export default api;
