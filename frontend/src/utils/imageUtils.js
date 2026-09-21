/**
 * Compress and convert image to base64 (simplified)
 * @param {File} file - Image file
 * @param {number} maxSizeMB - Max file size in MB (default 0.5MB = 500KB)
 * @returns {Promise<string>} - Base64 string
 */
export const compressAndConvertToBase64 = async (file, maxSizeMB = 0.5) => {
  try {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check initial file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes * 2) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    // Simple compression using canvas
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large
          const maxDimension = 1024;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * Validate image
 * @param {File} file - Image file
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  const maxSizeBytes = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'File size exceeds 2MB limit' };
  }

  return { valid: true, error: null };
};
