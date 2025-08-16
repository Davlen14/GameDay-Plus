import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable,
  getDownloadURL 
} from 'firebase/storage';
import { 
  auth, 
  db, 
  storage, 
  googleProvider, 
  facebookProvider, 
  appleProvider 
} from '../services/firebase';
import { showToast } from '../components/common/Toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Load user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date().toISOString();

      try {
        await setDoc(userRef, {
          displayName: displayName || '',
          email,
          photoURL: photoURL || '',
          createdAt,
          lastLoginAt: createdAt,
          ...additionalData
        });

        const newUserData = {
          displayName: displayName || '',
          email,
          photoURL: photoURL || '',
          createdAt,
          lastLoginAt: createdAt,
          ...additionalData
        };
        
        setUserData(newUserData);
        return newUserData;
      } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
      }
    } else {
      // Update last login time
      await updateDoc(userRef, {
        lastLoginAt: new Date().toISOString()
      });
      
      const existingData = userDoc.data();
      setUserData(existingData);
      return existingData;
    }
  };

  // Email/Password Sign Up
  const signUp = async (email, password, additionalData = {}) => {
    console.log('🔥 AuthContext signUp called with:', { email, hasPassword: !!password, additionalData });
    setAuthError(null);
    setLoading(true);

    try {
      console.log('🔥 Attempting createUserWithEmailAndPassword...');
      console.log('🔥 Auth instance:', auth);
      console.log('🔥 Firebase config check:', {
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain,
        hasApiKey: !!auth.app.options.apiKey
      });
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase user created successfully:', user);
      
      // Update display name if provided
      if (additionalData.displayName) {
        console.log('🔥 Updating user profile with displayName:', additionalData.displayName);
        await updateProfile(user, {
          displayName: additionalData.displayName
        });
      }

      console.log('🔥 Creating user document in Firestore...');
      await createUserDocument(user, additionalData);
      console.log('✅ User document created successfully');
      
      showToast.success('Account created successfully!');
      return user;
    } catch (error) {
      console.error('❌ Sign up error details:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error object:', error);
      
      setAuthError(error.message);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      console.log('🔥 Showing error toast:', errorMessage);
      showToast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign In
  const signIn = async (email, password) => {
    setAuthError(null);
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(user);
      showToast.success('Welcome back!');
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError(error.message);
      
      // User-friendly error messages
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      }
      
      showToast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);

    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await createUserDocument(user);
      showToast.success(`Welcome ${user.displayName}!`);
      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      setAuthError(error.message);
      
      let errorMessage = 'Failed to sign in with Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again';
      }
      
      showToast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Facebook Sign In
  const signInWithFacebook = async () => {
    setAuthError(null);
    setLoading(true);

    try {
      const { user } = await signInWithPopup(auth, facebookProvider);
      await createUserDocument(user);
      showToast.success(`Welcome ${user.displayName}!`);
      return user;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      setAuthError(error.message);
      
      let errorMessage = 'Failed to sign in with Facebook';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email';
      }
      
      showToast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign In
  const signInWithApple = async () => {
    setAuthError(null);
    setLoading(true);

    try {
      const { user } = await signInWithPopup(auth, appleProvider);
      await createUserDocument(user);
      showToast.success(`Welcome!`);
      return user;
    } catch (error) {
      console.error('Apple sign in error:', error);
      setAuthError(error.message);
      
      let errorMessage = 'Failed to sign in with Apple';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      }
      
      showToast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      showToast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast.error('Failed to sign out');
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    setAuthError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      showToast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(error.message);
      
      let errorMessage = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      
      showToast.error(errorMessage);
      throw error;
    }
  };

  // Image compression utility
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Network performance monitoring
  const monitorNetworkSpeed = () => {
    if (navigator.connection) {
      const connection = navigator.connection;
      console.log('Network info:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
      
      // Adjust timeout based on network speed
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 300000; // 5 minutes for slow connections
      } else if (connection.effectiveType === '3g') {
        return 180000; // 3 minutes for 3G
      }
    }
    return 120000; // 2 minutes default
  };

  // Upload Profile Photo - Optimized Version
  const uploadProfilePhoto = async (file, userId, onProgress = () => {}) => {
    try {
      // Validate user authentication
      if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error('User authentication required');
      }

      // Compress image before upload
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      const compressedFile = await compressImage(file);
      console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = compressedFile.type.split('/')[1] || 'jpg';
      const fileName = `profile_${timestamp}_${randomId}.${fileExtension}`;
      
      // Create storage reference
      const storageRef = ref(storage, `profile-photos/${userId}/${fileName}`);
      
      // Configure upload with metadata
      const metadata = {
        contentType: compressedFile.type,
        customMetadata: {
          'uploaded-by': userId,
          'upload-timestamp': timestamp.toString(),
          'original-name': file.name
        }
      };

      // Start resumable upload with increased timeout handling
      const uploadTask = uploadBytesResumable(storageRef, compressedFile, metadata);
      
      return new Promise((resolve, reject) => {
        // Set up dynamic timeout based on network
        const dynamicTimeout = monitorNetworkSpeed();
        const timeoutId = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error(`Upload timed out after ${dynamicTimeout/1000} seconds`));
        }, dynamicTimeout);

        // Track upload progress
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
            onProgress(progress);
            
            // Log detailed state for debugging
            console.log('Upload state:', snapshot.state);
            console.log(`${snapshot.bytesTransferred} of ${snapshot.totalBytes} bytes`);
          },
          (error) => {
            clearTimeout(timeoutId);
            console.error('Upload error details:', error);
            
            // Enhanced error handling
            switch (error.code) {
              case 'storage/unauthorized':
                reject(new Error('Upload unauthorized. Please check your permissions and try again.'));
                break;
              case 'storage/canceled':
                reject(new Error('Upload was canceled'));
                break;
              case 'storage/quota-exceeded':
                reject(new Error('Storage quota exceeded'));
                break;
              case 'storage/invalid-format':
                reject(new Error('Invalid file format'));
                break;
              case 'storage/invalid-argument':
                reject(new Error('Invalid upload parameters'));
                break;
              default:
                reject(new Error(`Upload failed: ${error.message}`));
            }
          },
          async () => {
            try {
              clearTimeout(timeoutId);
              
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              console.log('Upload successful:', downloadURL);
              resolve({
                downloadURL,
                fileName,
                size: compressedFile.size,
                path: `profile-photos/${userId}/${fileName}`
              });
              
            } catch (urlError) {
              reject(new Error(`Failed to get download URL: ${urlError.message}`));
            }
          }
        );
      });

    } catch (error) {
      console.error('Upload preparation error:', error);
      throw new Error(`Photo upload preparation failed: ${error.message}`);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    console.log('Starting profile update...', updates);

    try {
      // Create a comprehensive timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile update timed out after 45 seconds')), 45000);
      });

      const updatePromise = async () => {
        const updateOperations = [];

        // Update Firebase Auth profile if needed
        if (updates.displayName !== undefined || updates.photoURL !== undefined) {
          console.log('Updating Firebase Auth profile...', {
            displayName: updates.displayName,
            photoURL: updates.photoURL
          });
          
          const authProfileUpdate = updateProfile(user, {
            displayName: updates.displayName || user.displayName || '',
            photoURL: updates.photoURL || user.photoURL || ''
          });
          
          updateOperations.push(authProfileUpdate);
        }

        // Update Firestore document
        console.log('Updating Firestore document...');
        const firestoreUpdate = updateDoc(doc(db, 'users', user.uid), {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        
        updateOperations.push(firestoreUpdate);

        // Execute all updates concurrently
        await Promise.all(updateOperations);
        console.log('All profile updates completed successfully');

        // Update local state - ensure we merge properly
        setUserData(prev => {
          const updated = {
            ...prev,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          console.log('Updated local user data:', updated);
          return updated;
        });

        return true;
      };

      // Race between update operations and timeout
      await Promise.race([updatePromise(), timeoutPromise]);
      
      console.log('Profile update completed successfully');
      showToast.success('Profile updated successfully!');

    } catch (error) {
      console.error('Profile update error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to update profile';
      let shouldShowError = true;
      
      if (error.message.includes('timed out')) {
        errorMessage = 'Profile update timed out. Please check your connection and try again.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please log out and log back in.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('invalid-profile-attribute') || error.message.includes('URL too long')) {
        // Don't show error for Firebase Storage URL issues - they're handled by fallback
        shouldShowError = false;
        console.log('Firebase Storage URL issue detected, fallback should handle this');
      } else {
        errorMessage = `Failed to update profile: ${error.message}`;
      }
      
      if (shouldShowError) {
        showToast.error(errorMessage);
      }
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    authError,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    logout,
    resetPassword,
    uploadProfilePhoto,
    updateUserProfile,
    createUserDocument
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
