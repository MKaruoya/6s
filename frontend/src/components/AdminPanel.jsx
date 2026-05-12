import React, { useState, useEffect } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from '../services/adminService';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  // Form data
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role_id: '',
    location_id: '',
    is_active: true
  });

  const [locationFormData, setLocationFormData] = useState({
    location_name: '',
    location_type: 'warehouse'
  });

  const DEFAULT_ORG_ID = 'fb04f2f4-8cb8-4b3f-8041-133886194754';

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, rolesData, locationsData] = await Promise.all([
        getUsers(),
        getRoles(),
        getLocations()
      ]);

      setUsers(usersData);
      setRoles(rolesData);
      setLocations(locationsData);
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
      role_id: '',
      location_id: '',
      is_active: true
    });
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      location_id: user.location_id,
      is_active: user.is_active
    });
    setShowUserForm(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!userFormData.name || !userFormData.email || !userFormData.role_id) {
        setError('Please fill in all required fields');
        return;
      }

      const payload = {
        ...userFormData,
        org_id: DEFAULT_ORG_ID
      };

      if (editingUser) {
        await updateUser(editingUser.user_id, payload);
        setSuccess('User updated successfully');
      } else {
        await createUser(payload);
        setSuccess('User created successfully');
      }

      setShowUserForm(false);
      await loadData();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setSuccess('User deleted successfully');
        await loadData();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      await updateUser(user.user_id, {
        ...user,
        is_active: !user.is_active
      });
      setSuccess(`User ${!user.is_active ? 'enabled' : 'disabled'} successfully`);
      await loadData();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.response?.data?.error || 'Failed to update user status');
    }
  };

  // Location handlers
  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationFormData({
      location_name: '',
      location_type: 'warehouse'
    });
    setShowLocationForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setLocationFormData({
      location_name: location.location_name,
      location_type: location.location_type
    });
    setShowLocationForm(true);
  };

  const handleSaveLocation = async () => {
    try {
      if (!locationFormData.location_name) {
        setError('Please fill in all required fields');
        return;
      }

      const payload = {
        ...locationFormData,
        org_id: DEFAULT_ORG_ID
      };

      if (editingLocation) {
        await updateLocation(editingLocation.location_id, payload);
        setSuccess('Location updated successfully');
      } else {
        await createLocation(payload);
        setSuccess('Location created successfully');
      }

      setShowLocationForm(false);
      await loadData();
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err.response?.data?.error || 'Failed to save location');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(locationId);
        setSuccess('Location deleted successfully');
        await loadData();
      } catch (err) {
        console.error('Error deleting location:', err);
        setError(err.response?.data?.error || 'Failed to delete location');
      }
    }
  };

  // Styles
  const containerStyle = {
    padding: '30px',
    background: '#f5f5f5',
    minHeight: '100vh'
  };

  const headerStyle = {
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '10px'
  };

  const tabsStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e5e7eb'
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: isActive ? '#1E40AF' : '#666',
    borderBottom: isActive ? '3px solid #1E40AF' : 'none',
    transition: 'all 0.3s'
  });

  const cardStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px'
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e5e7eb'
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: '#1E40AF',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#6b7280',
    color: 'white'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: '#EF4444',
    color: 'white',
    padding: '6px 12px',
    fontSize: '12px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  };

  const theadStyle = {
    background: '#1E40AF',
    color: 'white'
  };

  const thStyle = {
    padding: '12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '13px'
  };

  const statusBadgeStyle = (isActive) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: isActive ? '#D1FAE5' : '#FEE2E2',
    color: isActive ? '#065F46' : '#991B1B'
  });

  const roleBadgeStyle = (role) => {
    const colors = {
      admin: { bg: '#DBEAFE', color: '#1E40AF' },
      manager: { bg: '#FEF3C7', color: '#92400E' },
      auditor: { bg: '#E0E7FF', color: '#3730A3' }
    };
    const style = colors[role] || colors.auditor;
    return {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: style.bg,
      color: style.color
    };
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
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
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
  };

  const modalHeaderStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: '20px'
  };

  const modalButtonGroupStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    justifyContent: 'flex-end'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  };

  const alertStyle = (type) => ({
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    background: type === 'error' ? '#FEE2E2' : '#D1FAE5',
    color: type === 'error' ? '#991B1B' : '#065F46'
  });

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading admin panel...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Admin Panel</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>Manage users, locations, and system settings</p>
      </div>

      {/* ALERTS */}
      {error && <div style={alertStyle('error')}>{error}</div>}
      {success && <div style={alertStyle('success')}>{success}</div>}

      {/* TABS */}
      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'users')}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          style={tabStyle(activeTab === 'locations')}
          onClick={() => setActiveTab('locations')}
        >
          📍 Locations
        </button>
        <button
          style={tabStyle(activeTab === 'settings')}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={sectionTitleStyle}>User Management</h2>
            <button
              onClick={handleAddUser}
              style={primaryButtonStyle}
              onMouseEnter={(e) => e.target.style.background = '#1e3a8a'}
              onMouseLeave={(e) => e.target.style.background = '#1E40AF'}
            >
              + Add User
            </button>
          </div>

          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const userRole = roles.find(r => r.role_id === user.role_id);
                const userLocation = locations.find(l => l.location_id === user.location_id);
                
                return (
                  <tr key={user.user_id}>
                    <td style={tdStyle}>{user.name}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>
                      <span style={roleBadgeStyle(userRole?.role_name || 'auditor')}>
                        {userRole?.role_name?.charAt(0).toUpperCase() + userRole?.role_name?.slice(1) || 'Auditor'}
                      </span>
                    </td>
                    <td style={tdStyle}>{userLocation?.location_name || 'All'}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(user.is_active)}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleEditUser(user)}
                        style={{ ...buttonStyle, background: '#3B82F6', color: 'white', marginRight: '5px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        style={{ ...buttonStyle, background: '#F59E0B', color: 'white', marginRight: '5px' }}
                      >
                        {user.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        style={dangerButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* LOCATIONS TAB */}
      {activeTab === 'locations' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={sectionTitleStyle}>Location Management</h2>
            <button
              onClick={handleAddLocation}
              style={primaryButtonStyle}
              onMouseEnter={(e) => e.target.style.background = '#1e3a8a'}
              onMouseLeave={(e) => e.target.style.background = '#1E40AF'}
            >
              + Add Location
            </button>
          </div>

          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Location Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(location => (
                <tr key={location.location_id}>
                  <td style={tdStyle}>{location.location_name}</td>
                  <td style={tdStyle}>
                    {location.location_type?.charAt(0).toUpperCase() + location.location_type?.slice(1)}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleEditLocation(location)}
                      style={{ ...buttonStyle, background: '#3B82F6', color: 'white', marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.location_id)}
                      style={dangerButtonStyle}
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

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>System Settings</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Settings coming soon...
          </p>
        </div>
      )}

      {/* USER FORM MODAL */}
      {showUserForm && (
        <div style={modalOverlayStyle} onClick={() => setShowUserForm(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                style={inputStyle}
                placeholder="Full name"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                style={inputStyle}
                placeholder="Email address"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Role *</label>
              <select
                value={userFormData.role_id}
                onChange={(e) => setUserFormData({ ...userFormData, role_id: e.target.value })}
                style={selectStyle}
              >
                <option value="">-- Select role --</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Location</label>
              <select
                value={userFormData.location_id || ''}
                onChange={(e) => setUserFormData({ ...userFormData, location_id: e.target.value || null })}
                style={selectStyle}
              >
                <option value="">-- Select location --</option>
                {locations.map(loc => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            </div>

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

      {/* LOCATION FORM MODAL */}
      {showLocationForm && (
        <div style={modalOverlayStyle} onClick={() => setShowLocationForm(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Location Name *</label>
              <input
                type="text"
                value={locationFormData.location_name}
                onChange={(e) => setLocationFormData({ ...locationFormData, location_name: e.target.value })}
                style={inputStyle}
                placeholder="Location name"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Type *</label>
              <select
                value={locationFormData.location_type}
                onChange={(e) => setLocationFormData({ ...locationFormData, location_type: e.target.value })}
                style={selectStyle}
              >
                <option value="warehouse">Warehouse</option>
                <option value="shopfloor">Shopfloor</option>
                <option value="laboratory">Laboratory</option>
              </select>
            </div>

            <div style={modalButtonGroupStyle}>
              <button
                onClick={() => setShowLocationForm(false)}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocation}
                style={primaryButtonStyle}
              >
                {editingLocation ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

