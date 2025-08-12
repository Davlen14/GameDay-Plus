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
  uploadBytes, 
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
    setAuthError(null);
    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (additionalData.displayName) {
        await updateProfile(user, {
          displayName: additionalData.displayName
        });
      }

      await createUserDocument(user, additionalData);
      showToast.success('Account created successfully!');
      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError(error.message);
      
      // User-friendly error messages
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      
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

  // Upload Profile Photo
  const uploadProfilePhoto = async (file, userId, onProgress) => {
    if (!file || !userId) throw new Error('File and userId are required');

    try {
      const fileRef = ref(storage, `profile-photos/${userId}/${file.name}`);
      
      // Upload file with progress tracking
      const uploadTask = uploadBytes(fileRef, file);
      
      if (onProgress) {
        // Simulate progress for now - Firebase v9 doesn't have progress callbacks in uploadBytes
        const interval = setInterval(() => {
          onProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + 10;
          });
        }, 100);
        
        await uploadTask;
        clearInterval(interval);
        onProgress(100);
      } else {
        await uploadTask;
      }

      // Get download URL
      const downloadURL = await getDownloadURL(fileRef);

      // Update user profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      // Update Firestore document
      await updateDoc(doc(db, 'users', userId), {
        photoURL: downloadURL
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        photoURL: downloadURL
      }));

      showToast.success('Profile photo updated!');
      return downloadURL;
    } catch (error) {
      console.error('Photo upload error:', error);
      showToast.error('Failed to upload photo');
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    try {
      // Update Firebase Auth profile if needed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        ...updates
      }));

      showToast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      showToast.error('Failed to update profile');
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
