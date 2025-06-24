import React, { useState } from 'react';
import { runAllTests, testEnhancedPredictionSystem, testServiceIntegration } from '../tests/enhancedPredictionTests';

/**
 * Test component for Enhanced Prediction System
 */
const EnhancedPredictionTester = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  // Capture console logs
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const captureLog = (type, ...args) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, timestamp, message: args.join(' ') }]);
    
    if (type === 'log') originalLog(...args);
    else if (type === 'error') originalError(...args);
    else if (type === 'warn') originalWarn(...args);
  };

  const runTests = async () => {
    setIsRunning(true);
    setLogs([]);
    
    // Override console methods to capture logs
    console.log = (...args) => captureLog('log', ...args);
    console.error = (...args) => captureLog('error', ...args);
    console.warn = (...args) => captureLog('warn', ...args);
    
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
      setTestResults(false);
    } finally {
      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setIsRunning(false);
    }
  };

  const runServiceTest = async () => {
    setIsRunning(true);
    setLogs([]);
    
    console.log = (...args) => captureLog('log', ...args);
    console.error = (...args) => captureLog('error', ...args);
    console.warn = (...args) => captureLog('warn', ...args);
    
    try {
      const result = await testServiceIntegration();
      setTestResults(result);
    } catch (error) {
      console.error('Service test failed:', error);
      setTestResults(false);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setIsRunning(false);
    }
  };

  const runPredictionTest = async () => {
    setIsRunning(true);
    setLogs([]);
    
    console.log = (...args) => captureLog('log', ...args);
    console.error = (...args) => captureLog('error', ...args);
    console.warn = (...args) => captureLog('warn', ...args);
    
    try {
      const result = await testEnhancedPredictionSystem();
      setTestResults(result);
    } catch (error) {
      console.error('Prediction test failed:', error);
      setTestResults(false);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Enhanced Prediction System Tester</h2>
      <p>Test the implementation of the enhanced prediction system with advanced metrics.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runTests} 
          disabled={isRunning}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '🔄 Running All Tests...' : '🚀 Run All Tests'}
        </button>
        
        <button 
          onClick={runServiceTest} 
          disabled={isRunning}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '🔄 Testing...' : '🔧 Test Services Only'}
        </button>
        
        <button 
          onClick={runPredictionTest} 
          disabled={isRunning}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '🔄 Testing...' : '🎯 Test Prediction Only'}
        </button>
      </div>

      {testResults !== null && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '5px', 
          backgroundColor: testResults ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResults ? '#c3e6cb' : '#f5c6cb'}`,
          marginBottom: '20px'
        }}>
          <h3>{testResults ? '✅ Tests Passed!' : '❌ Tests Failed!'}</h3>
          {testResults ? (
            <p>Enhanced prediction system is working correctly with all advanced metrics.</p>
          ) : (
            <p>Some components failed. Check the logs below for details.</p>
          )}
        </div>
      )}

      <div style={{ 
        maxHeight: '400px', 
        overflow: 'auto', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px',
        padding: '10px'
      }}>
        <h4>📋 Test Logs:</h4>
        {logs.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No logs yet. Run a test to see results.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              color: log.type === 'error' ? '#dc3545' : log.type === 'warn' ? '#ffc107' : '#28a745'
            }}>
              <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        <h4>What this tests:</h4>
        <ul>
          <li>✅ Enhanced service methods (PPA, Success Rate, Advanced Stats, ELO, SP+, Talent)</li>
          <li>✅ Comprehensive metrics aggregation</li>
          <li>✅ Enhanced prediction calculation</li>
          <li>✅ Multi-factor scoring system</li>
          <li>✅ Market disagreement analysis</li>
          <li>✅ Betting lines integration</li>
          <li>✅ Drive efficiency analysis</li>
          <li>✅ Red zone performance metrics</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedPredictionTester;
