import React, { useState, useEffect } from 'react';
import { getActionItems } from '../../services/actionItemService';

const ActionItemsWidget = () => {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActionItems();
  }, []);

  const loadActionItems = async () => {
    try {
      const data = await getActionItems();
      setActionItems(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading action items:', err);
      setLoading(false);
    }
  };

  // Calculate metrics
  const metrics = {
    total: actionItems.length,
    open: actionItems.filter(i => i.status === 'open').length,
    inProgress: actionItems.filter(i => i.status === 'in_progress').length,
    completed: actionItems.filter(i => i.status === 'completed').length,
    overdue: actionItems.filter(i => {
      if (i.status === 'completed') return false;
      return new Date(i.due_date) < new Date();
    }).length,
    closureRate: actionItems.length > 0 
      ? Math.round((actionItems.filter(i => i.status === 'completed').length / actionItems.length) * 100)
      : 0
  };

  // ==================== STYLES ====================

  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E8EAED',
    marginBottom: '24px'
  };

  const titleStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  };

  const metricItemStyle = (color) => ({
    background: '#F5F7FA',
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center',
    border: `2px solid ${color}`,
    borderTop: `3px solid ${color}`
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

  const recentListStyle = {
    marginTop: '12px'
  };

  const recentItemStyle = {
    padding: '10px',
    background: '#F5F7FA',
    borderRadius: '6px',
    marginBottom: '8px',
    borderLeft: '3px solid #FFD54F'
  };

  const recentTitleStyle = {
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '4px',
    fontSize: '12px'
  };

  const recentDateStyle = {
    fontSize: '11px',
    color: '#999'
  };

  const recentStatusStyle = {
    fontSize: '10px',
    fontWeight: '700',
    color: '#F39C12',
    marginTop: '4px',
    textTransform: 'uppercase'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '20px',
    color: '#999',
    fontSize: '13px'
  };

  const emptyStyle = {
    textAlign: 'center',
    padding: '20px',
    color: '#999',
    fontSize: '13px'
  };

  if (loading) {
    return <div style={cardStyle}><div style={loadingStyle}>Loading...</div></div>;
  }

  // Get recent items (not completed, sorted by due date)
  const recentItems = actionItems
    .filter(i => i.status !== 'completed')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 4);

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Action Items Summary</div>

      {/* Metrics Grid */}
      <div style={metricsGridStyle}>
        <div style={metricItemStyle('#3498DB')}>
          <div style={metricValueStyle('#3498DB')}>{metrics.total}</div>
          <div style={metricLabelStyle}>Total</div>
        </div>

        <div style={metricItemStyle('#F39C12')}>
          <div style={metricValueStyle('#F39C12')}>{metrics.open}</div>
          <div style={metricLabelStyle}>Open</div>
        </div>

        <div style={metricItemStyle('#FFD54F')}>
          <div style={metricValueStyle('#FFD54F')}>{metrics.inProgress}</div>
          <div style={metricLabelStyle}>In Progress</div>
        </div>

        <div style={metricItemStyle('#27AE60')}>
          <div style={metricValueStyle('#27AE60')}>{metrics.completed}</div>
          <div style={metricLabelStyle}>Completed</div>
        </div>

        <div style={metricItemStyle('#E74C3C')}>
          <div style={metricValueStyle('#E74C3C')}>{metrics.overdue}</div>
          <div style={metricLabelStyle}>Overdue</div>
        </div>

        <div style={metricItemStyle('#2C3E50')}>
          <div style={metricValueStyle('#2C3E50')}>{metrics.closureRate}%</div>
          <div style={metricLabelStyle}>Closure</div>
        </div>
      </div>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <div style={recentListStyle}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#2C3E50', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Upcoming Actions:
          </div>
          {recentItems.map(item => (
            <div key={item.action_id} style={recentItemStyle}>
              <div style={recentTitleStyle}>
                {item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}
              </div>
              <div style={recentDateStyle}>
                Due: {new Date(item.due_date).toLocaleDateString()}
              </div>
              <div style={recentStatusStyle}>
                {item.status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {recentItems.length === 0 && (
        <div style={emptyStyle}>
          No pending action items
        </div>
      )}
    </div>
  );
};

export default ActionItemsWidget;
