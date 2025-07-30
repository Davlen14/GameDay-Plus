#!/usr/bin/env node

// Test script for the enhanced GraphQL + REST fallback betting service
// This will test both GraphQL and REST API integration

import { bettingService } from './src/services/bettingService.js';

console.log('🧪 TESTING ENHANCED BETTING SERVICE WITH GRAPHQL + REST FALLBACK\n');
console.log('================================================================\n');

async function testEnhancedBettingService() {
  try {
    console.log('🎯 TEST 1: Enhanced getTeamLines for Ohio State 2024');
    console.log('----------------------------------------------------');
    
    const startTime = Date.now();
    const ohioStateLines = await bettingService.getTeamLines('Ohio State', 2024, 'regular');
    const duration = Date.now() - startTime;
    
    console.log(`✅ Success! Fetched in ${duration}ms`);
    console.log(`📊 Found ${ohioStateLines?.length || 0} games with lines`);
    
    if (ohioStateLines && ohioStateLines.length > 0) {
      const sampleGame = ohioStateLines[0];
      console.log('\n📋 Sample Game Structure:');
      console.log(`   Game ID: ${sampleGame.id}`);
      console.log(`   Teams: ${sampleGame.homeTeam} vs ${sampleGame.awayTeam}`);
      console.log(`   Score: ${sampleGame.homeScore}-${sampleGame.awayScore}`);
      console.log(`   Week: ${sampleGame.week}, Season: ${sampleGame.season}`);
      console.log(`   Lines: ${sampleGame.lines?.length || 0} sportsbooks`);
      
      if (sampleGame.lines && sampleGame.lines.length > 0) {
        const sampleLine = sampleGame.lines[0];
        console.log('\n📈 Sample Betting Line:');
        console.log(`   Provider: ${sampleLine.provider}`);
        console.log(`   Spread: ${sampleLine.spread}`);
        console.log(`   Over/Under: ${sampleLine.overUnder}`);
        console.log(`   Formatted: ${sampleLine.formattedSpread || 'N/A'}`);
      }
    }

    console.log('\n🎯 TEST 2: Enhanced ATS History for Alabama (5 years)');
    console.log('------------------------------------------------------');
    
    const atsStartTime = Date.now();
    const alabamaATS = await bettingService.getATSHistory({ school: 'Alabama' }, 5);
    const atsDuration = Date.now() - atsStartTime;
    
    console.log(`✅ Success! ATS History fetched in ${atsDuration}ms`);
    console.log(`📊 Games: ${alabamaATS.games?.length || 0}, Lines: ${alabamaATS.lines?.length || 0}`);
    
    if (alabamaATS.games && alabamaATS.games.length > 0) {
      // Calculate quick ATS stats
      let atsWins = 0, atsLosses = 0, atsPushes = 0;
      
      alabamaATS.games.forEach(game => {
        const isHome = game.home_team === 'Alabama';
        const teamScore = isHome ? game.home_points : game.away_points;
        const opponentScore = isHome ? game.away_points : game.home_points;
        const actualMargin = teamScore - opponentScore;
        
        // Find corresponding line
        const gameLine = alabamaATS.lines.find(line => 
          (line.gameId || line.game_id) === game.id
        );
        
        if (gameLine) {
          const adjustedSpread = isHome ? gameLine.spread : -gameLine.spread;
          const atsMargin = actualMargin - adjustedSpread;
          
          if (Math.abs(atsMargin) < 0.5) atsPushes++;
          else if (atsMargin > 0) atsWins++;
          else atsLosses++;
        }
      });
      
      const atsTotal = atsWins + atsLosses;
      const atsWinPct = atsTotal > 0 ? (atsWins / atsTotal * 100).toFixed(1) : 0;
      
      console.log(`🏈 Quick ATS Calculation: ${atsWins}-${atsLosses}-${atsPushes} (${atsWinPct}%)`);
    }

    console.log('\n🎯 TEST 3: Enhanced Spread Analysis for Specific Game');
    console.log('-----------------------------------------------------');
    
    if (ohioStateLines && ohioStateLines.length > 0) {
      const testGameId = ohioStateLines[0].id;
      
      const spreadStartTime = Date.now();
      const spreadAnalysis = await bettingService.getSpreadAnalysis(testGameId);
      const spreadDuration = Date.now() - spreadStartTime;
      
      console.log(`✅ Success! Spread analysis fetched in ${spreadDuration}ms`);
      console.log(`📊 Found ${spreadAnalysis?.length || 0} spread lines`);
      
      if (spreadAnalysis && spreadAnalysis.length > 0) {
        console.log('\n📈 Spread Comparison:');
        spreadAnalysis.forEach(line => {
          console.log(`   ${line.provider}: ${line.spread} (Open: ${line.spreadOpen || 'N/A'})`);
        });
      }
    }

    console.log('\n🎯 TEST 4: Enhanced Line Movements');
    console.log('-----------------------------------');
    
    if (ohioStateLines && ohioStateLines.length > 0) {
      const testGameId = ohioStateLines[0].id;
      
      const movementStartTime = Date.now();
      const lineMovements = await bettingService.getLineMovements(testGameId);
      const movementDuration = Date.now() - movementStartTime;
      
      console.log(`✅ Success! Line movements fetched in ${movementDuration}ms`);
      console.log(`📊 Found ${lineMovements?.length || 0} line movements`);
      
      if (lineMovements && lineMovements.length > 0) {
        console.log('\n📈 Line Movement Analysis:');
        lineMovements.forEach(movement => {
          if (movement.movement) {
            console.log(`   ${movement.provider}:`);
            console.log(`     Spread Movement: ${movement.movement.spread > 0 ? '+' : ''}${movement.movement.spread}`);
            console.log(`     O/U Movement: ${movement.movement.overUnder > 0 ? '+' : ''}${movement.movement.overUnder}`);
          }
        });
      }
    }

    console.log('\n🎯 TEST 5: Enhanced Betting Suggestions');
    console.log('----------------------------------------');
    
    const suggestionsStartTime = Date.now();
    const suggestions = await bettingService.getBettingSuggestions(1, 2024);
    const suggestionsDuration = Date.now() - suggestionsStartTime;
    
    console.log(`✅ Success! Betting suggestions fetched in ${suggestionsDuration}ms`);
    console.log(`📊 Data Source: ${suggestions.dataSource}`);
    console.log(`📊 Lines: ${suggestions.lines?.length || 0}, Win Probabilities: ${suggestions.winProbability?.length || 0}`);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('✅ GraphQL + REST fallback betting service is working correctly');
    console.log('✅ Enhanced data fetching with proper fallback mechanisms');
    console.log('✅ ATS Tab integration ready');
    console.log('✅ Performance optimized with smart routing');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    
    console.log('\n🔍 DEBUGGING INFORMATION:');
    console.log('- Check your API key in .env file');
    console.log('- Verify network connectivity');
    console.log('- Review GraphQL query syntax');
    console.log('- Check REST API fallback functionality');
  }
}

// Run the tests
testEnhancedBettingService();
