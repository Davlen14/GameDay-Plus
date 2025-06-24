/**
 * Analytics Integration Test
 * Demonstrates that analyticsService and driveService are now integrated into predictions
 */

import { MatchupPredictor } from '../utils/MatchupPredictor';
import predictionDebugger from '../utils/PredictionDebugger';

async function testAnalyticsIntegration() {
  console.log('🧪 Testing Analytics and Drive Service Integration');
  console.log('==================================================');

  // Enable debugging for this test
  predictionDebugger.enable();
  predictionDebugger.setLogLevel('info');

  try {
    const predictor = new MatchupPredictor();
    
    // Initialize the predictor
    console.log('📊 Initializing predictor...');
    await predictor.initialize();
    
    // Test prediction with analytics integration
    console.log('\n🏈 Testing prediction with analytics integration...');
    console.log('Testing: Ohio State vs Oregon (example matchup)');
    
    const prediction = await predictor.generateMatchupPrediction(
      'Ohio State', // homeTeam
      'Oregon',     // awayTeam
      {
        neutralSite: false,
        week: 10,
        season: 2024,
        conferenceGame: false
      }
    );

    console.log('\n✅ Prediction Generated Successfully!');
    console.log('====================================');
    
    // Show that analytics data was used
    console.log('\n📈 Analytics Integration Results:');
    console.log('--------------------------------');
    
    const homeMetrics = prediction.teams.home.metrics;
    const awayMetrics = prediction.teams.away.metrics;
    
    console.log(`Home Team (${prediction.teams.home.school}) Enhanced Metrics:`);
    console.log(`  • PPA Offense: ${homeMetrics.ppaOffense || 'N/A'}`);
    console.log(`  • PPA Defense: ${homeMetrics.ppaDefense || 'N/A'}`);
    console.log(`  • SP Rating: ${homeMetrics.spRating || 'N/A'}`);
    console.log(`  • ELO Rating: ${homeMetrics.eloRating || 'N/A'}`);
    console.log(`  • Drive Efficiency: ${homeMetrics.driveEfficiency || 'N/A'}`);
    console.log(`  • Scoring Drive Rate: ${homeMetrics.scoringDriveRate || 'N/A'}`);
    console.log(`  • Red Zone Rate: ${homeMetrics.redZoneConversionRate || 'N/A'}`);
    
    console.log(`\nAway Team (${prediction.teams.away.school}) Enhanced Metrics:`);
    console.log(`  • PPA Offense: ${awayMetrics.ppaOffense || 'N/A'}`);
    console.log(`  • PPA Defense: ${awayMetrics.ppaDefense || 'N/A'}`);
    console.log(`  • SP Rating: ${awayMetrics.spRating || 'N/A'}`);
    console.log(`  • ELO Rating: ${awayMetrics.eloRating || 'N/A'}`);
    console.log(`  • Drive Efficiency: ${awayMetrics.driveEfficiency || 'N/A'}`);
    console.log(`  • Scoring Drive Rate: ${awayMetrics.scoringDriveRate || 'N/A'}`);
    console.log(`  • Red Zone Rate: ${awayMetrics.redZoneConversionRate || 'N/A'}`);

    console.log('\n🎯 Final Prediction:');
    console.log('-------------------');
    console.log(`Score: ${prediction.teams.home.school} ${prediction.prediction.score.home} - ${prediction.teams.away.school} ${prediction.prediction.score.away}`);
    console.log(`Spread: ${prediction.prediction.spread > 0 ? prediction.teams.home.school : prediction.teams.away.school} ${Math.abs(prediction.prediction.spread)}`);
    console.log(`Total: ${prediction.prediction.total}`);
    console.log(`Win Probability: ${prediction.teams.home.school} ${prediction.prediction.winProbability.home}%`);
    console.log(`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);

    // Show debug report with API calls
    console.log('\n🔍 API Calls Made (Debug Report):');
    console.log('----------------------------------');
    const debugReport = predictionDebugger.getDebugReport();
    
    // Show API calls to analyticsService and driveService
    const analyticsApiCalls = debugReport.apiCalls.filter(call => 
      call.service === 'analyticsService' || call.service === 'driveService'
    );
    
    if (analyticsApiCalls.length > 0) {
      console.log(`✅ Made ${analyticsApiCalls.length} calls to analytics/drive services:`);
      analyticsApiCalls.forEach(call => {
        console.log(`  • ${call.service}.${call.method}(${JSON.stringify(call.params)}) - ${call.success ? '✅ Success' : '❌ Failed'}`);
      });
    } else {
      console.log('⚠️ No analytics/drive service calls found - check service availability');
    }

    // Show enhanced factors in prediction
    console.log('\n🧮 Enhanced Prediction Factors:');
    console.log('------------------------------');
    const factors = prediction.prediction.factors;
    if (factors.eloRatingDiff !== null) {
      console.log(`  • ELO Rating Difference: ${factors.eloRatingDiff}`);
    }
    if (factors.talentDiff !== null) {
      console.log(`  • Talent Composite Difference: ${factors.talentDiff}`);
    }
    if (factors.transferImpact !== null) {
      console.log(`  • Transfer Portal Impact: ${factors.transferImpact}`);
    }
    
    console.log('\n🎉 Analytics Integration Test Complete!');
    console.log('======================================');
    
    return {
      success: true,
      analyticsUsed: analyticsApiCalls.length > 0,
      enhancedMetricsCount: Object.keys(homeMetrics).filter(key => 
        ['ppaOffense', 'ppaDefense', 'driveEfficiency', 'scoringDriveRate', 'eloRating'].includes(key) &&
        homeMetrics[key] !== null && homeMetrics[key] !== undefined
      ).length,
      prediction
    };

  } catch (error) {
    console.error('❌ Analytics Integration Test Failed:', error);
    
    // Show debug info even on failure
    const debugReport = predictionDebugger.getDebugReport();
    if (debugReport.errors.length > 0) {
      console.log('\n🚨 Errors During Test:');
      debugReport.errors.forEach(err => {
        console.log(`  • ${err.category}: ${err.message}`);
      });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in other tests or manual execution
export { testAnalyticsIntegration };

// Auto-run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testAnalyticsIntegration().then(result => {
    console.log('\n📊 Test Result:', result);
    process.exit(result.success ? 0 : 1);
  });
}
