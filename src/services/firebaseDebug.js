// Firebase Debug Utilities
import { auth, storage, db } from './firebase';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';

// Test Firebase connection and permissions
export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase connection...');
  
  const results = {
    auth: false,
    storage: false,
    firestore: false,
    details: {}
  };

  try {
    // Test Auth
    console.log('📱 Testing Auth...');
    if (auth.currentUser) {
      results.auth = true;
      results.details.auth = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName
      };
      console.log('✅ Auth: Connected', results.details.auth);
    } else {
      console.log('❌ Auth: No user logged in');
      results.details.auth = 'No user logged in';
    }

    // Test Firestore (if user is logged in)
    if (auth.currentUser) {
      console.log('🗄️ Testing Firestore...');
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        results.firestore = true;
        results.details.firestore = {
          documentExists: userDoc.exists(),
          data: userDoc.exists() ? 'Document found' : 'Document not found'
        };
        console.log('✅ Firestore: Connected', results.details.firestore);
      } catch (firestoreError) {
        console.log('❌ Firestore Error:', firestoreError.message);
        results.details.firestore = firestoreError.message;
      }

      // Test Storage (try to upload a tiny test file)
      console.log('💾 Testing Storage...');
      try {
        const testBlob = new Blob(['test'], { type: 'text/plain' });
        const testRef = ref(storage, `test/${auth.currentUser.uid}/connection-test.txt`);
        await uploadBytes(testRef, testBlob);
        
        // Try to get the download URL
        const downloadURL = await getDownloadURL(testRef);
        
        results.storage = true;
        results.details.storage = {
          uploadSuccess: true,
          downloadURL: downloadURL.substring(0, 50) + '...'
        };
        console.log('✅ Storage: Connected and writable');
      } catch (storageError) {
        console.log('❌ Storage Error:', storageError);
        results.details.storage = {
          error: storageError.code || storageError.message,
          message: storageError.message
        };
      }
    }

  } catch (error) {
    console.error('🔥 Firebase connection test failed:', error);
    results.details.generalError = error.message;
  }

  return results;
};

// Test profile photo upload with a small test image
export const testProfilePhotoUpload = async () => {
  if (!auth.currentUser) {
    throw new Error('No user logged in');
  }

  console.log('📸 Testing profile photo upload...');

  // Create a small test image (1x1 pixel PNG)
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, 1, 1);

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      try {
        const testFile = new File([blob], 'test-profile.png', { type: 'image/png' });
        
        console.log('📸 Test file created:', {
          name: testFile.name,
          size: testFile.size,
          type: testFile.type
        });

        // Use your actual upload function
        const { uploadProfilePhoto } = require('../contexts/AuthContext');
        
        const downloadURL = await uploadProfilePhoto(
          testFile, 
          auth.currentUser.uid,
          (progress) => console.log(`📸 Upload progress: ${progress}%`)
        );

        console.log('✅ Test profile photo upload successful:', downloadURL);
        resolve({
          success: true,
          downloadURL,
          fileSize: testFile.size
        });

      } catch (error) {
        console.error('❌ Test profile photo upload failed:', error);
        reject(error);
      }
    }, 'image/png');
  });
};

// Debug current user state
export const debugUserState = () => {
  console.log('👤 Current User State Debug:');
  
  if (auth.currentUser) {
    const user = auth.currentUser;
    console.log('✅ User is logged in:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
      providerData: user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email
      }))
    });

    // Check if token is valid
    user.getIdToken(true)
      .then(token => {
        console.log('🔑 Auth token is valid (length):', token.length);
      })
      .catch(error => {
        console.error('❌ Auth token error:', error);
      });

  } else {
    console.log('❌ No user logged in');
  }
};

// Easy debug function to call from console
window.debugFirebase = {
  testConnection: testFirebaseConnection,
  testPhotoUpload: testProfilePhotoUpload,
  debugUser: debugUserState
};

console.log('🔧 Firebase debug utilities loaded. Use window.debugFirebase in console.');
