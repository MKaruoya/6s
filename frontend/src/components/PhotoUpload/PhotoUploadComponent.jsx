import React from 'react';
import { compressAndConvertToBase64, validateImage } from '../../utils/imageUtils';

const PhotoUploadComponent = ({ 
  sectionCode, 
  checkpointIndex, 
  onPhotoUpload, 
  onPhotoRemove, 
  photoData,
  photoLoading,
  setPhotoError,
  setPhotoLoading
}) => {
  const handlePhotoUpload = async (file) => {
    if (!file) return;

    try {
      setPhotoError(null);
      setPhotoLoading(true);

      // Validate image
      const validation = validateImage(file);
      if (!validation.valid) {
        setPhotoError(validation.error);
        setPhotoLoading(false);
        return;
      }

      // Compress and convert to base64
      const base64 = await compressAndConvertToBase64(file, 0.5);

      // Call parent handler
      onPhotoUpload(sectionCode, checkpointIndex, base64);
      setPhotoLoading(false);

    } catch (error) {
      console.error('Error uploading photo:', error);
      setPhotoError(error.message || 'Failed to upload photo');
      setPhotoLoading(false);
    }
  };

  return (
    <div className="checkpoint-photo">
      <div className="photo-buttons">
        <label 
          htmlFor={`photo-upload-${sectionCode}-${checkpointIndex}`} 
          className="photo-label"
          style={{ 
            opacity: photoLoading ? 0.6 : 1, 
            cursor: photoLoading ? 'not-allowed' : 'pointer' 
          }}
          title="Upload photo from device"
        >
          {photoLoading ? '⏳ Uploading...' : '📁 Upload'}
        </label>

        <label 
          htmlFor={`photo-camera-${sectionCode}-${checkpointIndex}`} 
          className="photo-label camera-label"
          style={{ 
            opacity: photoLoading ? 0.6 : 1, 
            cursor: photoLoading ? 'not-allowed' : 'pointer' 
          }}
          title="Take photo with camera"
        >
          {photoLoading ? '⏳ Uploading...' : '📷 Camera'}
        </label>
      </div>

      <input
        id={`photo-upload-${sectionCode}-${checkpointIndex}`}
        type="file"
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e.target.files[0])}
        disabled={photoLoading}
        style={{ display: 'none' }}
      />

      <input
        id={`photo-camera-${sectionCode}-${checkpointIndex}`}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handlePhotoUpload(e.target.files[0])}
        disabled={photoLoading}
        style={{ display: 'none' }}
      />

      {photoData && (
        <div className="photo-preview">
          <img 
            src={photoData} 
            alt="checkpoint"
            style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '4px' }}
          />
          <button
            type="button"
            onClick={() => onPhotoRemove(sectionCode, checkpointIndex)}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#E74C3C',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadComponent;
