import React, { useState } from 'react';
import { createActionItem } from '../../services/actionItemService';
import { locationsList } from '../../data/locations';
import { compressAndConvertToBase64, validateImage } from '../../utils/imageUtils';

const CreateActionItemsFromAudit = ({ auditId, auditLocation, onClose, onSuccess }) => {
  const [actionItems, setActionItems] = useState([
    { description: '', assigned_to: '', location: auditLocation, due_date: '', section_id: '', priority: 'medium', photo: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState(null);

  const sections = [
    { id: '1S', name: 'Sort (Kuchagua)' },
    { id: '2S', name: 'Set in Order (Kupanga)' },
    { id: '3S', name: 'Shine (Kusafisha)' },
    { id: '4S', name: 'Standardize (Kusanifisha)' },
    { id: '5S', name: 'Sustain (Kudumisha)' },
    { id: '6S', name: 'Safety (Kusitirisha)' }
  ];

  const handleAddItem = () => {
    setActionItems([
      ...actionItems,
      { description: '', assigned_to: '', location: auditLocation, due_date: '', section_id: '', priority: 'medium', photo: null }
    ]);
  };

  const handleRemoveItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...actionItems];
    updated[index][field] = value;
    setActionItems(updated);
  };

  const handlePhotoUpload = async (index, file) => {
    if (!file) return;

    try {
      setPhotoLoading(true);

      // Validate image
      const validation = validateImage(file);
      if (!validation.valid) {
        setError(validation.error);
        setPhotoLoading(false);
        return;
      }

      // Compress and convert to base64
      const base64 = await compressAndConvertToBase64(file, 0.5);

      // Update action item with photo
      const updated = [...actionItems];
      updated[index].photo = base64;
      setActionItems(updated);
      setPhotoLoading(false);

    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err.message || 'Failed to upload photo');
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = (index) => {
    const updated = [...actionItems];
    updated[index].photo = null;
    setActionItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validItems = actionItems.filter(item => item.description && item.assigned_to && item.due_date && item.location);
    
    if (validItems.length === 0) {
      setError('Please fill in at least one action item (description, assigned to, location, and due date)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create all action items
      for (const item of validItems) {
        await createActionItem({
          audit_id: auditId,
          section_id: item.section_id || null,
          description: item.description,
          assigned_to: item.assigned_to,
          location: item.location,
          due_date: item.due_date,
          priority: item.priority,
          status: 'open',
          photo: item.photo || null
        });
      }

      onSuccess();

    } catch (err) {
      console.error('Error creating action items:', err);
      setError(err.response?.data?.message || 'Failed to create action items');

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

  const infoBoxStyle = {
    background: 'rgba(52, 152, 219, 0.1)',
    color: '#3498DB',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '12px',
    borderLeft: '3px solid #3498DB',
    fontWeight: '600'
  };

  const itemContainerStyle = {
    background: '#F5F7FA',
    padding: '16px',
    borderRadius: '6px',
    marginBottom: '12px',
    border: '1px solid #E8EAED'
  };

  const itemHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8EAED'
  };

  const itemNumberStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'uppercase'
  };

  const removeButtonStyle = {
    padding: '4px 10px',
    border: 'none',
    borderRadius: '4px',
    background: '#E74C3C',
    color: 'white',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
    transition: 'all 0.3s'
  };

  const formGroupStyle = {
    marginBottom: '12px'
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
    minHeight: '60px',
    resize: 'vertical'
  };

  const selectStyle = {
    ...inputStyle
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  };

  const photoButtonsStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px'
  };

  const photoLabelStyle = {
    padding: '8px 12px',
    border: '1px solid #3498DB',
    borderRadius: '6px',
    background: '#E3F2FD',
    color: '#3498DB',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.3s',
    textAlign: 'center',
    flex: 1
  };

  const photoPreviewStyle = {
    position: 'relative',
    display: 'inline-block',
    marginTop: '8px'
  };

  const photoImageStyle = {
    maxWidth: '100px',
    maxHeight: '100px',
    borderRadius: '6px',
    border: '1px solid #E8EAED'
  };

  const photoRemoveButtonStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#E74C3C',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

  const addButtonStyle = {
    ...buttonStyle,
    background: '#3498DB',
    color: 'white',
    marginTop: '12px'
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
      <div style={headerStyle}>Create Action Items from Audit</div>
      <div style={infoBoxStyle}>
        📍 Audit Location: <strong>{auditLocation}</strong> | Audit ID: <strong>{auditId}</strong>
      </div>
      {error && <div style={alertStyle}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {actionItems.map((item, index) => (
          <div key={index} style={itemContainerStyle}>
            <div style={itemHeaderStyle}>
              <div style={itemNumberStyle}>Action Item {index + 1}</div>
              {actionItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  style={removeButtonStyle}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Description <span style={requiredStyle}>*</span>
              </label>
              <textarea
                value={item.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                placeholder="What action needs to be taken?"
                style={textareaStyle}
              />
            </div>

            <div style={gridStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Assigned To <span style={requiredStyle}>*</span>
                </label>
                <input
                  type="text"
                  value={item.assigned_to}
                  onChange={(e) => handleChange(index, 'assigned_to', e.target.value)}
                  placeholder="Name"
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Location <span style={requiredStyle}>*</span>
                </label>
                <select
                  value={item.location}
                  onChange={(e) => handleChange(index, 'location', e.target.value)}
                  style={selectStyle}
                >
                  <option value="">-- Select Location --</option>
                  {locationsList.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Due Date <span style={requiredStyle}>*</span>
                </label>
                <input
                  type="date"
                  value={item.due_date}
                  onChange={(e) => handleChange(index, 'due_date', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={gridStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>6S Section</label>
                <select
                  value={item.section_id}
                  onChange={(e) => handleChange(index, 'section_id', e.target.value)}
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
                  value={item.priority}
                  onChange={(e) => handleChange(index, 'priority', e.target.value)}
                  style={selectStyle}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* PHOTO UPLOAD */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Evidence Photo (Optional)</label>
              <div style={photoButtonsStyle}>
                <label 
                  htmlFor={`photo-upload-${index}`}
                  style={{
                    ...photoLabelStyle,
                    opacity: photoLoading ? 0.6 : 1,
                    cursor: photoLoading ? 'not-allowed' : 'pointer'
                  }}
                  title="Upload photo from device"
                >
                  {photoLoading ? '⏳ Uploading...' : '📁 Upload'}
                </label>

                <label 
                  htmlFor={`photo-camera-${index}`}
                  style={{
                    ...photoLabelStyle,
                    opacity: photoLoading ? 0.6 : 1,
                    cursor: photoLoading ? 'not-allowed' : 'pointer'
                  }}
                  title="Take photo with camera"
                >
                  {photoLoading ? '⏳ Uploading...' : '📷 Camera'}
                </label>
              </div>

              <input
                id={`photo-upload-${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(index, e.target.files[0])}
                disabled={photoLoading}
                style={{ display: 'none' }}
              />

              <input
                id={`photo-camera-${index}`}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload(index, e.target.files[0])}
                disabled={photoLoading}
                style={{ display: 'none' }}
              />

              {item.photo && (
                <div style={photoPreviewStyle}>
                  <img 
                    src={item.photo} 
                    alt="action item evidence"
                    style={photoImageStyle}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    style={photoRemoveButtonStyle}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddItem}
          style={addButtonStyle}
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          + Add Another Item
        </button>

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
            {loading ? 'Creating...' : 'Create Action Items'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateActionItemsFromAudit;
