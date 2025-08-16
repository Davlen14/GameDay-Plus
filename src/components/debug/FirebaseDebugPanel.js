import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { testFirebaseConnection, testProfilePhotoUpload, debugUserState } from '../../services/firebaseDebug';
import { showToast } from '../common/Toast';

const FirebaseDebugPanel = () => {
  const { user, userData } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const runConnectionTest = async () => {
    setIsRunningTest(true);
    try {
      const results = await testFirebaseConnection();
      setTestResults(results);
      console.log('Firebase connection test results:', results);
      
      if (results.auth && results.storage && results.firestore) {
        showToast.success('All Firebase services are working correctly!');
      } else {
        showToast.warning('Some Firebase services have issues. Check console for details.');
      }
    } catch (error) {
      console.error('Test failed:', error);
      showToast.error('Firebase connection test failed');
    } finally {
      setIsRunningTest(false);
    }
  };

  const runPhotoUploadTest = async () => {
    setIsRunningTest(true);
    try {
      const result = await testProfilePhotoUpload();
      console.log('Photo upload test result:', result);
      showToast.success('Photo upload test successful!');
    } catch (error) {
      console.error('Photo upload test failed:', error);
      showToast.error(`Photo upload test failed: ${error.message}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const runUserDebug = () => {
    debugUserState();
    showToast.info('User debug info logged to console');
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to use Firebase debug tools</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg border max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Firebase Debug Panel</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={runConnectionTest}
            disabled={isRunningTest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunningTest ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={runPhotoUploadTest}
            disabled={isRunningTest}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isRunningTest ? 'Testing...' : 'Test Photo Upload'}
          </button>
          
          <button
            onClick={runUserDebug}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Debug User State
          </button>
        </div>

        {/* Current User Info */}
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Current User Info:</h3>
          <div className="text-sm space-y-1">
            <p><strong>UID:</strong> {user?.uid}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Display Name:</strong> {user?.displayName || 'Not set'}</p>
            <p><strong>Photo URL:</strong> {user?.photoURL ? 'Set' : 'Not set'}</p>
            <p><strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* User Data from Firestore */}
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Firestore User Data:</h3>
          <div className="text-sm">
            {userData ? (
              <pre className="bg-white p-2 rounded border overflow-auto text-xs">
                {JSON.stringify(userData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600">No user data loaded</p>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="text-sm">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className={`p-2 rounded text-center ${testResults.auth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Auth: {testResults.auth ? '✅' : '❌'}
                </div>
                <div className={`p-2 rounded text-center ${testResults.storage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Storage: {testResults.storage ? '✅' : '❌'}
                </div>
                <div className={`p-2 rounded text-center ${testResults.firestore ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Firestore: {testResults.firestore ? '✅' : '❌'}
                </div>
              </div>
              <pre className="bg-white p-2 rounded border overflow-auto text-xs">
                {JSON.stringify(testResults.details, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Tip:</strong> Open your browser's developer console to see detailed logs.</p>
          <p><strong>Debug in Console:</strong> Use <code>window.debugFirebase</code> for manual testing.</p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebugPanel;
