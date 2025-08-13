// Firebase Test - Run in browser console
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './src/firebase';

// Test Firebase connection
console.log('🔥 Testing Firebase connection...');
console.log('Auth instance:', auth);
console.log('Firebase app name:', auth.app.name);
console.log('Firebase project ID:', auth.app.options.projectId);
console.log('Firebase auth domain:', auth.app.options.authDomain);
console.log('Firebase config loaded:', !!auth.app.options.apiKey);

// Check environment variables
console.log('Environment check:');
console.log('- API Key exists:', !!process.env.REACT_APP_FIREBASE_API_KEY);
console.log('- Auth Domain exists:', !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
console.log('- Project ID exists:', !!process.env.REACT_APP_FIREBASE_PROJECT_ID);

// Test user creation with detailed error handling
window.testFirebaseSignup = async (email = 'test@example.com', password = 'password123') => {
  try {
    console.log('🚀 Testing Firebase signup...');
    console.log(`Email: ${email}, Password: ${password}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Firebase working! User created:', userCredential.user);
    console.log('User UID:', userCredential.user.uid);
    console.log('User Email:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error('❌ Firebase error details:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Provide helpful error explanations
    switch (error.code) {
      case 'auth/email-already-in-use':
        console.log('💡 This email is already registered. Try a different email or sign in instead.');
        break;
      case 'auth/weak-password':
        console.log('💡 Password is too weak. Use at least 6 characters.');
        break;
      case 'auth/invalid-email':
        console.log('💡 Email format is invalid.');
        break;
      case 'auth/operation-not-allowed':
        console.log('💡 Email/password authentication is not enabled in Firebase Console.');
        break;
      case 'auth/network-request-failed':
        console.log('💡 Network error. Check your internet connection.');
        break;
      default:
        console.log('💡 Unexpected error. Check Firebase configuration.');
    }
    return error;
  }
};

console.log('🔧 Run window.testFirebaseSignup() to test Firebase signup');
console.log('🔧 Or use window.testFirebaseSignup("custom@email.com", "custompassword") for custom credentials');
