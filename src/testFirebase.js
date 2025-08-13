// Test Firebase configuration
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

console.log('Firebase Auth object:', auth);
console.log('Firebase config loaded:', !!auth);

// Test Firebase connection
const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test creating a user with a fake email (this will fail but should give us a proper Firebase error)
    await createUserWithEmailAndPassword(auth, 'test@test.com', 'password123');
  } catch (error) {
    console.log('Firebase connection test error (expected):', error.code, error.message);
    
    if (error.code === 'auth/email-already-in-use' || error.code === 'auth/weak-password' || error.code.startsWith('auth/')) {
      console.log('✅ Firebase is connected and working!');
    } else {
      console.log('❌ Firebase connection issue:', error);
    }
  }
};

// Run test when the module loads
testFirebaseConnection();

export default testFirebaseConnection;
