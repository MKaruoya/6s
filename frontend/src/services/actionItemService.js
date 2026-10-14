import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('token');

const getAuthHeader = () => ({
  Authorization: `Bearer ${getToken()}`
});

// Get all action items
export const getActionItems = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters.audit_id) params.append('audit_id', filters.audit_id);

    const response = await axios.get(`${API_URL}/action-items?${params}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching action items:', error);
    throw error;
  }
};

// Get single action item
export const getActionItem = async (actionId) => {
  try {
    const response = await axios.get(`${API_URL}/action-items/${actionId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching action item:', error);
    throw error;
  }
};

// Create action item
export const createActionItem = async (data) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    console.log('📝 Creating action item with token:', token.substring(0, 20) + '...');
    console.log('📋 Action item data:', data);

    const response = await axios.post(`${API_URL}/action-items`, data, {
      headers: getAuthHeader()
    });

    console.log('✅ Action item created:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error creating action item:', error);
    
    if (error.response?.status === 401) {
      console.error('🔐 Unauthorized - Token may be expired');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw error;
  }
};


// Update action item
export const updateActionItem = async (actionId, data) => {
  try {
    const response = await axios.put(`${API_URL}/action-items/${actionId}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating action item:', error);
    throw error;
  }
};

// Delete action item
export const deleteActionItem = async (actionId) => {
  try {
    const response = await axios.delete(`${API_URL}/action-items/${actionId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting action item:', error);
    throw error;
  }
};

// Get action items summary
export const getActionItemsSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/action-items/summary`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};
