/**
 * Test file demonstrating how to use the Prediction Debugger
 * Run this to see the debugger in action
 */

import predictionDebugger from '../utils/PredictionDebugger';
import matchupPredictor from '../utils/MatchupPredictor';

// Enable debugging
predictionDebugger.enable();

// Test the prediction debugger functionality
export const testPredictionDebugger = async () => {
  console.log('🧪 Testing Prediction Debugger Integration...');
  
  try {
    // Initialize predictor
    await matchupPredictor.initialize();
    
    // Run a test prediction to generate debug data
    console.log('🎯 Running test prediction to generate debug logs...');
    
    const prediction = await matchupPredictor.predictMatchup('Ohio State', 'Oregon', {
      week: 14,
      season: 2024,
      neutralSite: false
    });
    
    console.log('✅ Test prediction completed');
    
    // Print debug report
    console.log('📊 Printing debug report...');
    const report = matchupPredictor.printDebugReport();
    
    // Get debug info
    const debugInfo = matchupPredictor.getDebugInfo();
    console.log('🔍 Debug Summary:', {
      totalLogs: debugInfo.summary.totalLogs,
      totalErrors: debugInfo.summary.totalErrors,
      totalApiCalls: debugInfo.summary.totalApiCalls,
      successfulApiCalls: debugInfo.summary.successfulApiCalls,
      totalTime: debugInfo.summary.totalTime
    });
    
    return {
      success: true,
      prediction,
      debugReport: report
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Demonstrate different debugging features
export const demonstrateDebuggingFeatures = () => {
  console.log('🔍 Demonstrating Prediction Debugger Features:');
  
  console.log('\n1. Enable/Disable Debugging:');
  console.log('   predictionDebugger.enable()');
  console.log('   predictionDebugger.disable()');
  
  console.log('\n2. Access via MatchupPredictor:');
  console.log('   matchupPredictor.enableDebug()');
  console.log('   matchupPredictor.showDebugPanel()');
  console.log('   matchupPredictor.printDebugReport()');
  console.log('   matchupPredictor.exportDebugReport()');
  
  console.log('\n3. Direct Access via Window (Browser Console):');
  console.log('   window.predictionDebugger.printDebugReport()');
  console.log('   window.predictionDebugger.exportReport()');
  
  console.log('\n4. React Component Integration:');
  console.log('   - Debug controls appear in bottom-right corner');
  console.log('   - Toggle with 🔍 button');
  console.log('   - Real-time status monitoring');
  console.log('   - Export functionality');
  
  console.log('\n5. Features:');
  console.log('   ✅ Real-time API call tracking');
  console.log('   ✅ Error logging with context');
  console.log('   ✅ Data fetch monitoring');
  console.log('   ✅ Performance timing');
  console.log('   ✅ Visual debug panel');
  console.log('   ✅ JSON export for analysis');
  console.log('   ✅ Console styling for easy reading');
};

// Run demonstration
if (typeof window !== 'undefined') {
  // Make test functions available globally for easy access
  window.testPredictionDebugger = testPredictionDebugger;
  window.demonstrateDebuggingFeatures = demonstrateDebuggingFeatures;
  
  console.log('🎉 Prediction Debugger Test Functions Available!');
  console.log('Run: testPredictionDebugger() or demonstrateDebuggingFeatures()');
}
