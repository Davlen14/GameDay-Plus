// Test file for enhanced prediction system
import matchupPredictor from '../utils/MatchupPredictor.js';

/**
 * Test function to verify enhanced prediction implementation
 */
export const testEnhancedPredictionSystem = async () => {
  console.log('🧪 Testing Enhanced Prediction System Implementation...');
  
  try {
    // Initialize the predictor
    console.log('🚀 Initializing predictor...');
    await matchupPredictor.initialize();
    
    // Test the enhanced prediction with Ohio State vs Oregon
    console.log('🎯 Testing enhanced prediction: Ohio State vs Oregon');
    const prediction = await matchupPredictor.testEnhancedPrediction("Ohio State", "Oregon");
    
    if (prediction) {
      console.log('✅ Enhanced prediction test PASSED!');
      console.log('📊 Prediction Results:', {
        homeScore: prediction.prediction.score.home,
        awayScore: prediction.prediction.score.away,
        spread: prediction.prediction.spread,
        total: prediction.prediction.total,
        confidence: (prediction.confidence * 100).toFixed(1) + '%'
      });
      
      // Test multi-factor scoring if metrics are available
      if (prediction.homeMetrics && prediction.awayMetrics) {
        console.log('🔍 Testing multi-factor scoring...');
        const multiFactorScore = matchupPredictor.calculateMultiFactorScore(
          prediction.homeMetrics, 
          prediction.awayMetrics
        );
        console.log('✅ Multi-factor score calculated:', multiFactorScore);
      }
      
      return true;
    } else {
      console.error('❌ Enhanced prediction test FAILED - no prediction returned');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Enhanced prediction test FAILED with error:', error);
    return false;
  }
};

/**
 * Test individual service functions
 */
export const testServiceIntegration = async () => {
  console.log('🔧 Testing service integration...');
  
  try {
    const { teamService, advancedDataService, bettingService, driveService } = await import('../services');
    
    // Test teamService enhanced methods
    console.log('📊 Testing teamService enhanced methods...');
    const ppaData = await teamService.getTeamPPA(2024, "Ohio State");
    const spRatings = await teamService.getSPRatings(2024, "Ohio State");
    const eloRatings = await teamService.getEloRatings(2024, null, "Ohio State");
    const talentRatings = await teamService.getTalentRatings(2024);
    
    console.log('✅ TeamService enhanced methods working:', {
      ppaData: ppaData.length > 0,
      spRatings: spRatings.length > 0,
      eloRatings: eloRatings.length > 0,
      talentRatings: talentRatings.length > 0
    });
    
    // Test advancedDataService comprehensive metrics
    console.log('🚀 Testing advancedDataService comprehensive metrics...');
    const comprehensiveMetrics = await advancedDataService.getComprehensiveMetrics("Ohio State", 2024);
    
    console.log('✅ AdvancedDataService comprehensive metrics:', {
      hasMetrics: !!comprehensiveMetrics,
      hasPPA: !!comprehensiveMetrics?.ppa,
      hasSuccessRate: !!comprehensiveMetrics?.successRate,
      hasAdvanced: !!comprehensiveMetrics?.advanced,
      hasBetting: !!comprehensiveMetrics?.betting,
      hasDrives: !!comprehensiveMetrics?.drives,
      hasRedZone: !!comprehensiveMetrics?.redZone,
      hasRatings: !!comprehensiveMetrics?.ratings
    });
    
    // Test bettingService
    console.log('💰 Testing bettingService...');
    const bettingLines = await bettingService.getBettingLines(null, 2024, 1, 'regular', "Ohio State");
    console.log('✅ BettingService working:', { hasLines: bettingLines.length > 0 });
    
    // Test driveService
    console.log('🚗 Testing driveService...');
    const drives = await driveService.getDrives(2024, 'regular', 1, "Ohio State");
    console.log('✅ DriveService working:', { hasDrives: drives.length > 0 });
    
    return true;
    
  } catch (error) {
    console.error('❌ Service integration test FAILED:', error);
    return false;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🎯 Running Enhanced Prediction System Tests...');
  console.log('=' * 50);
  
  const serviceTest = await testServiceIntegration();
  const predictionTest = await testEnhancedPredictionSystem();
  
  console.log('=' * 50);
  console.log('📊 Test Results Summary:');
  console.log(`Service Integration: ${serviceTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Enhanced Prediction: ${predictionTest ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (serviceTest && predictionTest) {
    console.log('🎉 ALL TESTS PASSED! Enhanced prediction system is ready!');
    return true;
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
    return false;
  }
};

export default {
  testEnhancedPredictionSystem,
  testServiceIntegration,
  runAllTests
};
