#!/usr/bin/env node

// Ohio State 2024 ATS Analysis Script
// This demonstrates the betting lines data structure and calculates ATS performance

const ohioState2024Data = [
  {
    "id": 401628455,
    "season": 2024,
    "seasonType": "regular",
    "week": 1,
    "startDate": "2024-08-31T19:30:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 52,
    "awayTeam": "Akron",
    "awayScore": 6,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -48.5,
        "formattedSpread": "Ohio State -48.5",
        "overUnder": 55.5,
        "homeMoneyline": null,
        "awayMoneyline": null
      },
      {
        "provider": "DraftKings",
        "spread": -50.5,
        "formattedSpread": "Ohio State -50.5",
        "overUnder": 58.5,
        "homeMoneyline": null,
        "awayMoneyline": null
      },
      {
        "provider": "Bovada",
        "spread": -49.5,
        "formattedSpread": "Ohio State -49.5",
        "overUnder": 56,
        "homeMoneyline": null,
        "awayMoneyline": null
      }
    ]
  },
  {
    "id": 401628468,
    "season": 2024,
    "seasonType": "regular",
    "week": 2,
    "startDate": "2024-09-07T23:30:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 56,
    "awayTeam": "Western Michigan",
    "awayScore": 0,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -37.5,
        "formattedSpread": "Ohio State -37.5",
        "overUnder": 54.5,
        "homeMoneyline": null,
        "awayMoneyline": null
      }
    ]
  },
  {
    "id": 401628492,
    "season": 2024,
    "seasonType": "regular",
    "week": 4,
    "startDate": "2024-09-21T16:00:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 49,
    "awayTeam": "Marshall",
    "awayScore": 14,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -38.5,
        "formattedSpread": "Ohio State -38.5",
        "overUnder": 55.5,
        "homeMoneyline": null,
        "awayMoneyline": null
      }
    ]
  },
  {
    "id": 401628498,
    "season": 2024,
    "seasonType": "regular",
    "week": 5,
    "startDate": "2024-09-28T23:30:00.000Z",
    "homeTeam": "Michigan State",
    "homeScore": 7,
    "awayTeam": "Ohio State",
    "awayScore": 38,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": 23.5,
        "formattedSpread": "Ohio State -23.5",
        "overUnder": 47.5,
        "homeMoneyline": 1500,
        "awayMoneyline": -3500
      }
    ]
  },
  {
    "id": 401628504,
    "season": 2024,
    "seasonType": "regular",
    "week": 6,
    "startDate": "2024-10-05T19:30:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 35,
    "awayTeam": "Iowa",
    "awayScore": 7,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -17.5,
        "formattedSpread": "Ohio State -17.5",
        "overUnder": 45.5,
        "homeMoneyline": -1600,
        "awayMoneyline": 900
      }
    ]
  },
  {
    "id": 401628515,
    "season": 2024,
    "seasonType": "regular",
    "week": 7,
    "startDate": "2024-10-12T23:30:00.000Z",
    "homeTeam": "Oregon",
    "homeScore": 32,
    "awayTeam": "Ohio State",
    "awayScore": 31,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": 3.5,
        "formattedSpread": "Ohio State -3.5",
        "overUnder": 54.5,
        "homeMoneyline": 140,
        "awayMoneyline": -165
      }
    ]
  },
  {
    "id": 401628530,
    "season": 2024,
    "seasonType": "regular",
    "week": 9,
    "startDate": "2024-10-26T16:00:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 21,
    "awayTeam": "Nebraska",
    "awayScore": 17,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -25.5,
        "formattedSpread": "Ohio State -25.5",
        "overUnder": 48.5,
        "homeMoneyline": -6000,
        "awayMoneyline": 1800
      }
    ]
  },
  {
    "id": 401628539,
    "season": 2024,
    "seasonType": "regular",
    "week": 10,
    "startDate": "2024-11-02T16:00:00.000Z",
    "homeTeam": "Penn State",
    "homeScore": 13,
    "awayTeam": "Ohio State",
    "awayScore": 20,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": 3.5,
        "formattedSpread": "Ohio State -3.5",
        "overUnder": 47.5,
        "homeMoneyline": 140,
        "awayMoneyline": -165
      }
    ]
  },
  {
    "id": 401628545,
    "season": 2024,
    "seasonType": "regular",
    "week": 11,
    "startDate": "2024-11-09T17:00:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 45,
    "awayTeam": "Purdue",
    "awayScore": 0,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -37.5,
        "formattedSpread": "Ohio State -37.5",
        "overUnder": 55.5,
        "homeMoneyline": null,
        "awayMoneyline": null
      }
    ]
  },
  {
    "id": 401628550,
    "season": 2024,
    "seasonType": "regular",
    "week": 12,
    "startDate": "2024-11-16T17:00:00.000Z",
    "homeTeam": "Northwestern",
    "homeScore": 7,
    "awayTeam": "Ohio State",
    "awayScore": 31,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": 29.5,
        "formattedSpread": "Ohio State -29.5",
        "overUnder": 44.5,
        "homeMoneyline": 2000,
        "awayMoneyline": -7500
      }
    ]
  },
  {
    "id": 401628555,
    "season": 2024,
    "seasonType": "regular",
    "week": 13,
    "startDate": "2024-11-23T17:00:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 38,
    "awayTeam": "Indiana",
    "awayScore": 15,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -10.5,
        "formattedSpread": "Ohio State -10.5",
        "overUnder": 51.5,
        "homeMoneyline": -425,
        "awayMoneyline": 320
      }
    ]
  },
  {
    "id": 401628566,
    "season": 2024,
    "seasonType": "regular",
    "week": 14,
    "startDate": "2024-11-30T17:00:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 10,
    "awayTeam": "Michigan",
    "awayScore": 13,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -20.5,
        "formattedSpread": "Ohio State -20.5",
        "overUnder": 41.5,
        "homeMoneyline": -2000,
        "awayMoneyline": 1000
      }
    ]
  }
];

// Playoff Games
const playoffGames = [
  {
    "id": 401677177,
    "season": 2024,
    "seasonType": "postseason",
    "week": 1,
    "startDate": "2024-12-22T01:00:00.000Z",
    "homeTeam": "Ohio State",
    "homeScore": 42,
    "awayTeam": "Tennessee",
    "awayScore": 17,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": -7.5,
        "formattedSpread": "Ohio State -7.5",
        "overUnder": 46.5,
        "homeMoneyline": -300,
        "awayMoneyline": 250
      }
    ]
  },
  {
    "id": 401677183,
    "season": 2024,
    "seasonType": "postseason",
    "week": 1,
    "startDate": "2025-01-01T22:00:00.000Z",
    "homeTeam": "Oregon",
    "homeScore": 21,
    "awayTeam": "Ohio State",
    "awayScore": 41,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": 2.5,
        "formattedSpread": "Ohio State -2.5",
        "overUnder": 54.5,
        "homeMoneyline": 120,
        "awayMoneyline": -140
      }
    ]
  },
  {
    "id": 401677191,
    "season": 2024,
    "seasonType": "postseason",
    "week": 1,
    "startDate": "2025-01-11T00:30:00.000Z",
    "homeTeam": "Texas",
    "homeScore": 14,
    "awayTeam": "Ohio State",
    "awayScore": 28,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": 5.5,
        "formattedSpread": "Ohio State -5.5",
        "overUnder": 51.5,
        "homeMoneyline": 220,
        "awayMoneyline": -270
      }
    ]
  },
  {
    "id": 401677192,
    "season": 2024,
    "seasonType": "postseason",
    "week": 1,
    "startDate": "2025-01-21T00:30:00.000Z",
    "homeTeam": "Notre Dame",
    "homeScore": 23,
    "awayTeam": "Ohio State",
    "awayScore": 34,
    "lines": [
      {
        "provider": "ESPN Bet",
        "spread": 8.5,
        "formattedSpread": "Ohio State -8.5",
        "overUnder": 44.5,
        "homeMoneyline": 300,
        "awayMoneyline": -400
      }
    ]
  }
];

console.log('🏈 OHIO STATE 2024 BETTING LINES DATA STRUCTURE ANALYSIS\n');
console.log('==========================================\n');

// Analyze data structure
function analyzeDataStructure() {
  console.log('📊 DATA STRUCTURE BREAKDOWN:');
  console.log('------------------------------');
  
  const sampleGame = ohioState2024Data[0];
  console.log('Game Object Structure:');
  console.log(`  - id: ${sampleGame.id} (unique game identifier)`);
  console.log(`  - season: ${sampleGame.season}`);
  console.log(`  - seasonType: "${sampleGame.seasonType}" (regular/postseason)`);
  console.log(`  - week: ${sampleGame.week}`);
  console.log(`  - startDate: "${sampleGame.startDate}" (ISO 8601 format)`);
  console.log(`  - homeTeam: "${sampleGame.homeTeam}"`);
  console.log(`  - homeScore: ${sampleGame.homeScore}`);
  console.log(`  - awayTeam: "${sampleGame.awayTeam}"`);
  console.log(`  - awayScore: ${sampleGame.awayScore}`);
  console.log('  - lines: Array of betting lines from different providers');
  
  console.log('\nBetting Line Object Structure:');
  const sampleLine = sampleGame.lines[0];
  console.log(`  - provider: "${sampleLine.provider}" (sportsbook name)`);
  console.log(`  - spread: ${sampleLine.spread} (point spread, negative = favorite)`);
  console.log(`  - formattedSpread: "${sampleLine.formattedSpread}" (human readable)`);
  console.log(`  - overUnder: ${sampleLine.overUnder} (total points)`);
  console.log(`  - homeMoneyline: ${sampleLine.homeMoneyline} (American odds format)`);
  console.log(`  - awayMoneyline: ${sampleLine.awayMoneyline} (American odds format)`);
  
  console.log('\nAvailable Sportsbook Providers:');
  const providers = new Set();
  ohioState2024Data.forEach(game => {
    game.lines.forEach(line => providers.add(line.provider));
  });
  providers.forEach(provider => console.log(`  - ${provider}`));
  
  console.log('\n');
}

// Calculate ATS Performance
function calculateATSPerformance(games, gameType = 'Regular Season') {
  console.log(`🎯 ${gameType.toUpperCase()} ATS PERFORMANCE:`);
  console.log('=' + '='.repeat(gameType.length + 15));
  
  let wins = 0, losses = 0, pushes = 0;
  let totalROI = 0;
  const gameResults = [];
  
  games.forEach(game => {
    const isHome = game.homeTeam === 'Ohio State';
    const ohioStateScore = isHome ? game.homeScore : game.awayScore;
    const opponentScore = isHome ? game.awayScore : game.homeScore;
    const actualMargin = ohioStateScore - opponentScore;
    
    // Use consensus line (ESPN Bet as primary)
    const primaryLine = game.lines.find(line => line.provider === 'ESPN Bet') || game.lines[0];
    const spread = primaryLine.spread;
    
    // For away games, need to flip the spread since it's given from home team perspective
    const adjustedSpread = isHome ? spread : -spread;
    const atsMargin = actualMargin - adjustedSpread;
    
    let result = '';
    let roi = 0;
    
    if (Math.abs(atsMargin) < 0.5) {
      pushes++;
      result = 'PUSH';
      roi = 0;
    } else if (atsMargin > 0) {
      wins++;
      result = 'WIN';
      roi = 90.91; // Standard -110 payout
    } else {
      losses++;
      result = 'LOSS';
      roi = -100;
    }
    
    totalROI += roi;
    
    const opponent = isHome ? game.awayTeam : game.homeTeam;
    const location = isHome ? 'vs' : '@';
    
    gameResults.push({
      week: game.week,
      opponent: `${location} ${opponent}`,
      score: `${ohioStateScore}-${opponentScore}`,
      spread: adjustedSpread.toFixed(1),
      atsMargin: atsMargin.toFixed(1),
      result,
      roi: roi.toFixed(2)
    });
  });
  
  const totalGames = wins + losses + pushes;
  const atsGames = wins + losses;
  const winPct = atsGames > 0 ? (wins / atsGames * 100) : 0;
  const overallROI = totalGames > 0 ? (totalROI / (totalGames * 100) * 100) : 0;
  
  console.log(`Record: ${wins}-${losses}-${pushes} (${winPct.toFixed(1)}%)`);
  console.log(`ROI: ${overallROI > 0 ? '+' : ''}${overallROI.toFixed(1)}%`);
  console.log(`Total Profit/Loss: ${totalROI > 0 ? '+' : ''}$${totalROI.toFixed(2)} (betting $100 per game)\n`);
  
  console.log('Game-by-Game Results:');
  console.log('Week | Opponent          | Score  | Spread | ATS Margin | Result | ROI');
  console.log('-----|-------------------|--------|--------|------------|--------|--------');
  gameResults.forEach(game => {
    const week = game.week.toString().padStart(2);
    const opponent = game.opponent.padEnd(17);
    const score = game.score.padEnd(6);
    const spread = game.spread.padStart(6);
    const atsMargin = game.atsMargin.padStart(8);
    const result = game.result.padEnd(6);
    const roi = game.roi.padStart(7);
    console.log(`  ${week} | ${opponent} | ${score} | ${spread} | ${atsMargin} | ${result} | ${roi}`);
  });
  
  console.log('\n');
  
  return {
    wins,
    losses,
    pushes,
    winPct,
    overallROI,
    totalROI,
    gameResults
  };
}

// Situational Analysis
function situationalAnalysis(games) {
  console.log('📈 SITUATIONAL ATS ANALYSIS:');
  console.log('==============================');
  
  const situations = {
    home: { games: [], wins: 0, losses: 0, pushes: 0 },
    away: { games: [], wins: 0, losses: 0, pushes: 0 },
    favorite: { games: [], wins: 0, losses: 0, pushes: 0 },
    underdog: { games: [], wins: 0, losses: 0, pushes: 0 },
    smallSpread: { games: [], wins: 0, losses: 0, pushes: 0 }, // 0-7
    largeSpread: { games: [], wins: 0, losses: 0, pushes: 0 }  // 7+
  };
  
  games.forEach(game => {
    const isHome = game.homeTeam === 'Ohio State';
    const primaryLine = game.lines.find(line => line.provider === 'ESPN Bet') || game.lines[0];
    const spread = primaryLine.spread;
    const adjustedSpread = isHome ? spread : -spread;
    
    const ohioStateScore = isHome ? game.homeScore : game.awayScore;
    const opponentScore = isHome ? game.awayScore : game.homeScore;
    const actualMargin = ohioStateScore - opponentScore;
    const atsMargin = actualMargin - adjustedSpread;
    
    let atsResult = '';
    if (Math.abs(atsMargin) < 0.5) atsResult = 'push';
    else if (atsMargin > 0) atsResult = 'win';
    else atsResult = 'loss';
    
    // Home/Away
    const location = isHome ? 'home' : 'away';
    situations[location].games.push(game);
    situations[location][atsResult]++;
    
    // Favorite/Underdog
    const favStatus = adjustedSpread < 0 ? 'favorite' : 'underdog';
    situations[favStatus].games.push(game);
    situations[favStatus][atsResult]++;
    
    // Spread Size
    const spreadSize = Math.abs(adjustedSpread) <= 7 ? 'smallSpread' : 'largeSpread';
    situations[spreadSize].games.push(game);
    situations[spreadSize][atsResult]++;
  });
  
  Object.keys(situations).forEach(situation => {
    const data = situations[situation];
    const total = data.wins + data.losses + data.pushes;
    const atsGames = data.wins + data.losses;
    const winPct = atsGames > 0 ? (data.wins / atsGames * 100) : 0;
    
    const label = situation.charAt(0).toUpperCase() + situation.slice(1);
    console.log(`${label}: ${data.wins}-${data.losses}-${data.pushes} (${winPct.toFixed(1)}%) - ${total} games`);
  });
  
  console.log('\n');
}

// Run the analysis
analyzeDataStructure();

console.log('🏈 OHIO STATE 2024 ATS PERFORMANCE ANALYSIS\n');
console.log('============================================\n');

const regularSeasonResults = calculateATSPerformance(ohioState2024Data, 'Regular Season');
const playoffResults = calculateATSPerformance(playoffGames, 'Playoff');

// Combined analysis
const allGames = [...ohioState2024Data, ...playoffGames];
console.log('📊 COMBINED SEASON ATS PERFORMANCE:');
console.log('=====================================');
const totalWins = regularSeasonResults.wins + playoffResults.wins;
const totalLosses = regularSeasonResults.losses + playoffResults.losses;
const totalPushes = regularSeasonResults.pushes + playoffResults.pushes;
const totalAtsGames = totalWins + totalLosses;
const combinedWinPct = totalAtsGames > 0 ? (totalWins / totalAtsGames * 100) : 0;
const combinedROI = regularSeasonResults.totalROI + playoffResults.totalROI;

console.log(`Overall Record: ${totalWins}-${totalLosses}-${totalPushes} (${combinedWinPct.toFixed(1)}%)`);
console.log(`Overall ROI: ${combinedROI > 0 ? '+' : ''}${(combinedROI / (allGames.length * 100) * 100).toFixed(1)}%`);
console.log(`Total Profit/Loss: ${combinedROI > 0 ? '+' : ''}$${combinedROI.toFixed(2)}\n`);

situationalAnalysis(ohioState2024Data);

console.log('🎯 KEY INSIGHTS FOR ATS TAB IMPLEMENTATION:');
console.log('=============================================');
console.log('1. Data Structure: Each game has multiple sportsbook lines');
console.log('2. Spread Calculation: Must account for home/away perspective');
console.log('3. ATS Margin: Actual margin minus spread = ATS performance');
console.log('4. ROI Calculation: Standard -110 odds = 90.91% return on wins');
console.log('5. Push Handling: ATS margins within 0.5 points are pushes');
console.log('6. Provider Priority: ESPN Bet > DraftKings > Bovada for consensus');
console.log('7. Situational Splits: Home/Away, Favorite/Underdog, Spread Size categories');
console.log('\nThis structure perfectly matches what your ATSTab component expects! 🚀');
