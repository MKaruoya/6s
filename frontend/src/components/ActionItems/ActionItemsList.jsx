import React, { useState, useEffect, useMemo } from 'react';
import { getActionItems, updateActionItem, deleteActionItem } from '../../services/actionItemService';
import CreateActionItem from './CreateActionItem';

const ActionItemsList = () => {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssigned, setFilterAssigned] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load action items
  useEffect(() => {
    loadActionItems();
  }, []);

  const loadActionItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActionItems();
      setActionItems(data);
    } catch (err) {
      console.error('Error loading action items:', err);
      setError('Failed to load action items');
    } finally {
      setLoading(false);
    }
  };

  // Filter action items
  const filteredItems = useMemo(() => {
    return actionItems.filter(item => {
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const assignedMatch = filterAssigned === 'all' || item.assigned_to === filterAssigned;
      const searchMatch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && assignedMatch && searchMatch;
    });
  }, [actionItems, filterStatus, filterAssigned, searchTerm]);

  // Get unique assignees
  const assignees = useMemo(() => {
    return [...new Set(actionItems.map(item => item.assigned_to))].filter(Boolean);
  }, [actionItems]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = actionItems.length;
    const open = actionItems.filter(i => i.status === 'open').length;
    const inProgress = actionItems.filter(i => i.status === 'in_progress').length;
    const completed = actionItems.filter(i => i.status === 'completed').length;
    const overdue = actionItems.filter(i => {
      if (i.status === 'completed') return false;
      return new Date(i.due_date) < new Date();
    }).length;

    const closureRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, open, inProgress, completed, overdue, closureRate };
  }, [actionItems]);

  // Handle status update
  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      await updateActionItem(itemId, { status: newStatus });
      setSuccess('Action item updated successfully');
      await loadActionItems();
      setShowDetail(false);
    } catch (err) {
      setError('Failed to update action item');
    }
  };

  // Handle delete
  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this action item?')) {
      try {
        await deleteActionItem(itemId);
        setSuccess('Action item deleted successfully');
        await loadActionItems();
      } catch (err) {
        setError('Failed to delete action item');
      }
    }
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

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  };

  const metricCardStyle = (color) => ({
    background: 'white',
    padding: '12px',
    borderRadius: '6px',
    border: `1px solid #E8EAED`,
    borderTop: `3px solid ${color}`,
    textAlign: 'center'
  });

  const metricValueStyle = (color) => ({
    fontSize: '20px',
    fontWeight: '800',
    color: color,
    marginBottom: '4px'
  });

  const metricLabelStyle = {
    fontSize: '10px',
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const filterContainerStyle = {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #E8EAED',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  };

  const filterRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '12px'
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #E8EAED',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: '#2C3E50'
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

  const statusBadgeStyle = (status) => {
    const colors = {
      open: { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498DB' },
      in_progress: { bg: 'rgba(255, 213, 79, 0.1)', color: '#F39C12' },
      completed: { bg: 'rgba(39, 174, 96, 0.1)', color: '#27AE60' },
      overdue: { bg: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C' }
    };

    const style = colors[status] || colors.open;

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

  const actionButtonStyle = {
    padding: '4px 10px',
    margin: '0 3px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
    transition: 'all 0.3s'
  };

  const viewButtonStyle = {
    ...actionButtonStyle,
    background: '#3498DB',
    color: 'white'
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    background: '#E74C3C',
    color: 'white'
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

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#999',
    fontWeight: '600'
  };

  const emptyStyle = {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontSize: '13px'
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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

  const detailItemStyle = {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED'
  };

  const detailLabelStyle = {
    fontSize: '11px',
    color: '#999',
    fontWeight: '700',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const detailValueStyle = {
    fontSize: '14px',
    color: '#2C3E50',
    fontWeight: '600'
  };

  const modalButtonGroupStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    justifyContent: 'flex-end'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#E8EAED',
    color: '#2C3E50'
  };

  if (loading) {
    return <div style={containerStyle}><div style={loadingStyle}>Loading action items...</div></div>;
  }

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Action Items</h1>
        <p style={subtitleStyle}>Track and manage 6S improvement actions</p>
      </div>

      {/* ALERTS */}
      {error && <div style={alertStyle('error')}>{error}</div>}
      {success && <div style={alertStyle('success')}>{success}</div>}

      {/* METRICS */}
      <div style={metricsGridStyle}>
        <div style={metricCardStyle('#3498DB')}>
          <div style={metricValueStyle('#3498DB')}>{metrics.total}</div>
          <div style={metricLabelStyle}>Total</div>
        </div>

        <div style={metricCardStyle('#F39C12')}>
          <div style={metricValueStyle('#F39C12')}>{metrics.open}</div>
          <div style={metricLabelStyle}>Open</div>
        </div>

        <div style={metricCardStyle('#FFD54F')}>
          <div style={metricValueStyle('#FFD54F')}>{metrics.inProgress}</div>
          <div style={metricLabelStyle}>In Progress</div>
        </div>

        <div style={metricCardStyle('#27AE60')}>
          <div style={metricValueStyle('#27AE60')}>{metrics.completed}</div>
          <div style={metricLabelStyle}>Completed</div>
        </div>

        <div style={metricCardStyle('#E74C3C')}>
          <div style={metricValueStyle('#E74C3C')}>{metrics.overdue}</div>
          <div style={metricLabelStyle}>Overdue</div>
        </div>

        <div style={metricCardStyle('#2C3E50')}>
          <div style={metricValueStyle('#2C3E50')}>{metrics.closureRate}%</div>
          <div style={metricLabelStyle}>Closure Rate</div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={filterContainerStyle}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#2C3E50', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Filters
        </h3>

        <div style={filterRowStyle}>
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label style={labelStyle}>Assigned To</label>
            <select
              value={filterAssigned}
              onChange={(e) => setFilterAssigned(e.target.value)}
              style={inputStyle}
            >
              <option value="all">All</option>
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          style={primaryButtonStyle}
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Create Action Item
        </button>
      </div>

      {/* ACTION ITEMS TABLE */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Action Items ({filteredItems.length})</h2>

        {filteredItems.length === 0 ? (
          <div style={emptyStyle}>No action items found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Assigned To</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.action_id}>
                    <td style={tdStyle}>{item.description}</td>
                    <td style={tdStyle}>{item.location || '-'}</td>
                    <td style={tdStyle}>{item.assigned_to || '-'}</td>
                    <td style={tdStyle}>{new Date(item.due_date).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(item.status)}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetail(true);
                        }}
                        style={viewButtonStyle}
                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(item.action_id)}
                        style={deleteButtonStyle}
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

      {/* CREATE ACTION ITEM MODAL */}
      {showCreateForm && (
        <div style={modalOverlayStyle} onClick={() => setShowCreateForm(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <CreateActionItem
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => {
                setShowCreateForm(false);
                loadActionItems();
                setSuccess('Action item created successfully');
              }}
            />
          </div>
        </div>
      )}

      {/* ACTION ITEM DETAIL MODAL */}
      {showDetail && selectedItem && (
        <div style={modalOverlayStyle} onClick={() => setShowDetail(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>Action Item Details</div>

            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Description</div>
              <div style={detailValueStyle}>{selectedItem.description}</div>
            </div>

            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Location</div>
              <div style={detailValueStyle}>{selectedItem.location || '-'}</div>
            </div>

            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Assigned To</div>
              <div style={detailValueStyle}>{selectedItem.assigned_to || '-'}</div>
            </div>

            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Due Date</div>
              <div style={detailValueStyle}>{new Date(selectedItem.due_date).toLocaleDateString()}</div>
            </div>

            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Status</div>
              <select
                value={selectedItem.status}
                onChange={(e) => handleStatusUpdate(selectedItem.action_id, e.target.value)}
                style={inputStyle}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Created</div>
              <div style={detailValueStyle}>{new Date(selectedItem.created_at).toLocaleDateString()}</div>
            </div>

            <div style={modalButtonGroupStyle}>
              <button
                onClick={() => setShowDetail(false)}
                style={secondaryButtonStyle}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionItemsList;
