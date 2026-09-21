import React, { useState } from 'react';
import { createActionItem } from '../../services/actionItemService';

const CreateActionItem = ({ onClose, onSuccess, auditId = null }) => {
  const [formData, setFormData] = useState({
    audit_id: auditId || '',
    section_id: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sections = [
    { id: '1S', name: 'Sort (Kuchagua)' },
    { id: '2S', name: 'Set in Order (Kupanga)' },
    { id: '3S', name: 'Shine (Kusafisha)' },
    { id: '4S', name: 'Standardize (Kusanifisha)' },
    { id: '5S', name: 'Sustain (Kudumisha)' },
    { id: '6S', name: 'Safety (Kusitirisha)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.assigned_to || !formData.due_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createActionItem({
        audit_id: formData.audit_id || null,
        section_id: formData.section_id || null,
        description: formData.description,
        assigned_to: formData.assigned_to,
        due_date: formData.due_date,
        priority: formData.priority,
        status: 'open'
      });

      onSuccess();
    } catch (err) {
      console.error('Error creating action item:', err);
      setError(err.response?.data?.message || 'Failed to create action item');
    } finally {
      setLoading(false);
    }
  };

  // ==================== STYLES ====================

  const headerStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
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

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical'
  };

  const selectStyle = {
    ...inputStyle
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '20px',
    justifyContent: 'flex-end'
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

  const alertStyle = {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#E74C3C',
    borderLeft: '3px solid #E74C3C',
    fontWeight: '600',
    fontSize: '13px'
  };

  const requiredStyle = {
    color: '#E74C3C',
    fontWeight: '700'
  };

  return (
    <div>
      <div style={headerStyle}>Create Action Item</div>

      {error && <div style={alertStyle}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Description <span style={requiredStyle}>*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the action to be taken..."
            style={textareaStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Assigned To <span style={requiredStyle}>*</span>
          </label>
          <input
            type="text"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            placeholder="Name of person responsible"
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Due Date <span style={requiredStyle}>*</span>
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>6S Section</label>
          <select
            name="section_id"
            value={formData.section_id}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="">-- Select Section --</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.id} - {section.name}
              </option>
            ))}
          </select>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div style={buttonGroupStyle}>
          <button
            type="button"
            onClick={onClose}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateActionItem;
