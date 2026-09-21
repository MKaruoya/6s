import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { locationsList } from '../data/locations';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form data
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'auditor',
    location_id: '',
    gembas: []
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5001/api';

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersResponse = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(usersResponse.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // User handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'auditor',
      location_id: '',
      gembas: []
    });
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      location_id: user.location_id || '',
      gembas: user.gembas || []
    });
    setShowUserForm(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!userFormData.name || !userFormData.email || !userFormData.role) {
        setError('Please fill in all required fields');
        return;
      }

      if (!editingUser && !userFormData.password) {
        setError('Password is required for new users');
        return;
      }

      const payload = {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        location_id: userFormData.location_id || null,
        gembas: userFormData.gembas
      };

      if (userFormData.password) {
        payload.password = userFormData.password;
      }

      if (editingUser) {
        await axios.put(`${API_URL}/users/${editingUser.user_id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('User updated successfully');
      } else {
        await axios.post(`${API_URL}/auth/register`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('User created successfully');
      }

      setShowUserForm(false);
      await loadData();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('User deleted successfully');
        await loadData();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleGembaChange = (gemba) => {
    setUserFormData(prev => ({
      ...prev,
      gembas: prev.gembas.includes(gemba)
        ? prev.gembas.filter(g => g !== gemba)
        : [...prev.gembas, gemba]
    }));
  };

  // ==================== STYLES ====================

  const containerStyle = {
    padding: '24px',
    background: '#F5F7FA',
    minHeight: '100vh'
  };

  const headerStyle = {
    marginBottom: '24px'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const subtitleStyle = {
    color: '#999',
    fontSize: '13px',
    fontWeight: '500'
  };

  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    marginBottom: '24px',
    border: '1px solid #E8EAED'
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: '#2C3E50',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#E8EAED',
    color: '#2C3E50'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: '#E74C3C',
    color: 'white',
    padding: '4px 10px',
    fontSize: '11px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px'
  };

  const theadStyle = {
    background: '#F5F7FA',
    borderBottom: '2px solid #E8EAED'
  };

  const thStyle = {
    padding: '12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#2C3E50'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #E8EAED',
    fontSize: '13px',
    color: '#2C3E50'
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    background: status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
    color: status === 'active' ? '#27AE60' : '#E74C3C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  });

  const roleBadgeStyle = (role) => {
    const colors = {
      admin: { bg: 'rgba(44, 62, 80, 0.1)', color: '#2C3E50' },
      coordinator: { bg: 'rgba(255, 213, 79, 0.1)', color: '#F39C12' },
      manager: { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498DB' },
      auditor: { bg: 'rgba(155, 89, 182, 0.1)', color: '#9B59B6' }
    };

    const style = colors[role] || colors.auditor;

    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: '700',
      background: style.bg,
      color: style.color,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    };
  };

  const formGroupStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E8EAED',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    color: '#2C3E50',
    transition: 'all 0.3s ease'
  };

  const selectStyle = {
    ...inputStyle
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #E8EAED'
  };

  const modalHeaderStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const modalButtonGroupStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    justifyContent: 'flex-end'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#999',
    fontWeight: '600'
  };

  const alertStyle = (type) => ({
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    background: type === 'error' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)',
    color: type === 'error' ? '#E74C3C' : '#27AE60',
    borderLeft: `3px solid ${type === 'error' ? '#E74C3C' : '#27AE60'}`,
    fontWeight: '600',
    fontSize: '13px'
  });

  const gembaContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '8px',
    marginTop: '8px'
  };

  const checkboxLabelStyle = {
    fontSize: '12px',
    color: '#2C3E50',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  };

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading admin panel...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Admin Panel</h1>
        <p style={subtitleStyle}>Manage users</p>
      </div>

      {/* ALERTS */}
      {error && <div style={alertStyle('error')}>{error}</div>}
      {success && <div style={alertStyle('success')}>{success}</div>}

      {/* USER MANAGEMENT */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={sectionTitleStyle}>User Management</h2>
          <button
            onClick={handleAddUser}
            style={primaryButtonStyle}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Add User
          </button>
        </div>

        {users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '30px', fontSize: '13px' }}>No users found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Gembas</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user.user_id}>
                    <td style={tdStyle}>{user.name}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>
                      <span style={roleBadgeStyle(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {user.gembas && user.gembas.length > 0 ? user.gembas.join(', ') : '-'}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(user.is_active ? 'active' : 'inactive')}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleEditUser(user)}
                        style={{ ...buttonStyle, background: '#3498DB', color: 'white', marginRight: '4px', padding: '4px 10px', fontSize: '11px' }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        style={dangerButtonStyle}
                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER FORM MODAL */}
      {showUserForm && (
        <div style={modalOverlayStyle} onClick={() => setShowUserForm(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                style={inputStyle}
                placeholder="Full name"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                style={inputStyle}
                placeholder="user@capwell.co.ke"
                disabled={!!editingUser}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Password {editingUser && '(optional)'}</label>
              <input
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                style={inputStyle}
                placeholder="Enter password"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Role</label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                style={selectStyle}
              >
                <option value="auditor">Auditor</option>
                <option value="manager">Manager</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {userFormData.role === 'auditor' && (
              <div style={formGroupStyle}>
                <label style={labelStyle}>Assign Gembas</label>
                <div style={gembaContainerStyle}>
                  {locationsList.map(gemba => (
                    <label key={gemba} style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={userFormData.gembas.includes(gemba)}
                        onChange={() => handleGembaChange(gemba)}
                        style={{ marginRight: '6px', cursor: 'pointer' }}
                      />
                      {gemba}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={modalButtonGroupStyle}>
              <button
                onClick={() => setShowUserForm(false)}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveUser}
                style={primaryButtonStyle}
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
