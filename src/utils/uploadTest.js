// Firebase Upload Test Utility
// Add this to your AuthContext.js for testing

export const testUpload = async () => {
  try {
    console.log('Starting Firebase Storage upload test...');
    
    // Create a small test file
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        try {
          const testFile = new File([blob], 'test.jpg', { type: 'image/jpeg' });
          console.log('Test file created:', {
            name: testFile.name,
            size: testFile.size,
            type: testFile.type
          });
          
          const result = await uploadProfilePhoto(testFile, auth.currentUser.uid, (progress) => {
            console.log('Test upload progress:', progress);
          });
          
          console.log('✅ Test upload successful:', result);
          resolve(result);
        } catch (error) {
          console.error('❌ Test upload failed:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
};

// Network monitoring utility
export const logUploadMetrics = (fileSize, uploadTime, success) => {
  console.log('📊 Upload metrics:', {
    fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
    uploadTime: `${uploadTime}ms`,
    success,
    timestamp: new Date().toISOString(),
    network: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : 'unknown'
  });
};
