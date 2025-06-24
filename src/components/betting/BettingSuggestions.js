import React, { useState, useEffect, useMemo } from 'react';
import { bettingService, gameService, teamService } from '../../services';
import { MatchupPredictor } from '../../utils/MatchupPredictor';
import { BettingCalculations } from '../../utils';

const BettingSuggestions = () => {
  // State management
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matchupPredictor] = useState(() => new MatchupPredictor());
  const [predictorInitialized, setPredictorInitialized] = useState(false);

  // Theme colors using the red gradient
  const gradientStart = 'rgb(204,0,28)';
  const gradientEnd = 'rgb(115,0,13)';
  const accentColor = 'rgb(204,0,28)';

  // Metallic gradient CSS
  const metallicGradient = `linear-gradient(135deg, 
    rgb(255, 46, 74), 
    rgb(204, 0, 28), 
    rgb(161, 0, 20), 
    rgb(204, 0, 28), 
    rgb(255, 46, 74)
  )`;

  // Initialize predictor
  useEffect(() => {
    const initPredictor = async () => {
      try {
        console.log('🚀 Initializing MatchupPredictor for betting suggestions...');
        await matchupPredictor.initialize();
        setPredictorInitialized(true);
        console.log('✅ MatchupPredictor initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing MatchupPredictor:', error);
        setErrorMessage('Failed to initialize prediction engine');
      }
    };

    initPredictor();
  }, [matchupPredictor]);

  // Helper function to generate betting lines if none exist (for 2025)
  const generateGameDayPlusLines = (prediction, confidence) => {
    if (!prediction) return null;

    const spread = prediction.spread || 0;
    const total = prediction.total || 45;
    const homeWinProb = prediction.winProbability?.home || 50;
    const awayWinProb = prediction.winProbability?.away || 50;

    // Generate GameDay+ lines based on our prediction model
    const homeSpreadOdds = -110 + (Math.random() * 20 - 10); // ±10 variation
    const awaySpreadOdds = -110 + (Math.random() * 20 - 10);
    const overOdds = -110 + (Math.random() * 20 - 10);
    const underOdds = -110 + (Math.random() * 20 - 10);

    // Generate moneyline based on win probability
    const homeML = homeWinProb > 50 ? 
      -Math.round((homeWinProb / (100 - homeWinProb)) * 100) :
      Math.round(((100 - homeWinProb) / homeWinProb) * 100);
    
    const awayML = awayWinProb > 50 ? 
      -Math.round((awayWinProb / (100 - awayWinProb)) * 100) :
      Math.round(((100 - awayWinProb) / awayWinProb) * 100);

    return {
      provider: 'GameDay+',
      spread: Math.abs(spread),
      homeSpread: spread > 0 ? spread : -Math.abs(spread),
      awaySpread: spread > 0 ? -spread : Math.abs(spread),
      overUnder: total,
      homeMoneyline: homeML,
      awayMoneyline: awayML,
      homeSpreadOdds: Math.round(homeSpreadOdds),
      awaySpreadOdds: Math.round(awaySpreadOdds),
      overOdds: Math.round(overOdds),
      underOdds: Math.round(underOdds),
      isGameDayPlus: true
    };
  };

  // Generate betting suggestions based on predictions vs actual lines
  const generateBettingSuggestions = (game, prediction, actualLines = []) => {
    const suggestions = [];
    
    if (!prediction) return suggestions;

    const confidence = prediction.confidence || 0.7;
    const predictedSpread = prediction.spread || 0;
    const predictedTotal = prediction.total || 45;
    const predictedHomeWinProb = prediction.winProbability?.home || 50;

    // If no actual lines exist, use our GameDay+ generated lines
    const lines = actualLines.length > 0 ? actualLines : [generateGameDayPlusLines(prediction, confidence)];

    lines.forEach(line => {
      if (!line) return;

      // Spread analysis
      if (line.spread !== undefined && line.spread !== null) {
        const lineDiff = Math.abs(predictedSpread - Math.abs(line.spread));
        if (lineDiff >= 2.5) { // Significant difference
          const side = predictedSpread > Math.abs(line.spread) ? 'favorite' : 'underdog';
          const team = side === 'favorite' ? 
            (predictedSpread > 0 ? game.homeTeam : game.awayTeam) :
            (predictedSpread > 0 ? game.awayTeam : game.homeTeam);
          
          suggestions.push({
            type: 'spread',
            bet: `${team} ${side === 'favorite' ? line.homeSpread || -line.spread : line.awaySpread || line.spread}`,
            odds: side === 'favorite' ? line.homeSpreadOdds || -110 : line.awaySpreadOdds || -110,
            confidence: Math.min(95, confidence * 100 + (lineDiff * 5)),
            reasoning: `Our model predicts a ${Math.abs(predictedSpread).toFixed(1)} point spread, market has ${Math.abs(line.spread).toFixed(1)}`,
            expectedValue: lineDiff * 2,
            provider: line.provider,
            recommendation: side === 'favorite' ? 'Take the Favorite' : 'Take the Underdog',
            isGameDayPlus: line.isGameDayPlus
          });
        }
      }

      // Total analysis
      if (line.overUnder !== undefined && line.overUnder !== null) {
        const totalDiff = Math.abs(predictedTotal - line.overUnder);
        if (totalDiff >= 3) {
          const direction = predictedTotal > line.overUnder ? 'over' : 'under';
          
          suggestions.push({
            type: 'total',
            bet: `${direction.toUpperCase()} ${line.overUnder}`,
            odds: direction === 'over' ? line.overOdds || -110 : line.underOdds || -110,
            confidence: Math.min(95, confidence * 100 + (totalDiff * 3)),
            reasoning: `Our model projects ${predictedTotal.toFixed(1)} total points, market set at ${line.overUnder}`,
            expectedValue: totalDiff * 1.5,
            provider: line.provider,
            recommendation: `Take the ${direction.toUpperCase()}`,
            isGameDayPlus: line.isGameDayPlus
          });
        }
      }

      // Moneyline analysis
      if (line.homeMoneyline && line.awayMoneyline) {
        const homeImpliedProb = BettingCalculations.americanToImpliedProbability(line.homeMoneyline);
        const awayImpliedProb = BettingCalculations.americanToImpliedProbability(line.awayMoneyline);
        
        const homeProbDiff = Math.abs(predictedHomeWinProb - homeImpliedProb);
        const awayProbDiff = Math.abs((100 - predictedHomeWinProb) - awayImpliedProb);

        if (homeProbDiff >= 8) {
          const edge = predictedHomeWinProb > homeImpliedProb ? 'take' : 'avoid';
          if (edge === 'take') {
            suggestions.push({
              type: 'moneyline',
              bet: `${game.homeTeam} ML`,
              odds: line.homeMoneyline,
              confidence: Math.min(95, confidence * 100 + homeProbDiff),
              reasoning: `Model gives ${game.homeTeam} ${predictedHomeWinProb.toFixed(1)}% chance, market implies ${homeImpliedProb.toFixed(1)}%`,
              expectedValue: homeProbDiff * 0.8,
              provider: line.provider,
              recommendation: 'Take the Home Team',
              isGameDayPlus: line.isGameDayPlus
            });
          }
        }

        if (awayProbDiff >= 8) {
          const edge = (100 - predictedHomeWinProb) > awayImpliedProb ? 'take' : 'avoid';
          if (edge === 'take') {
            suggestions.push({
              type: 'moneyline',
              bet: `${game.awayTeam} ML`,
              odds: line.awayMoneyline,
              confidence: Math.min(95, confidence * 100 + awayProbDiff),
              reasoning: `Model gives ${game.awayTeam} ${(100 - predictedHomeWinProb).toFixed(1)}% chance, market implies ${awayImpliedProb.toFixed(1)}%`,
              expectedValue: awayProbDiff * 0.8,
              provider: line.provider,
              recommendation: 'Take the Away Team',
              isGameDayPlus: line.isGameDayPlus
            });
          }
        }
      }
    });

    // Sort by expected value descending
    return suggestions.sort((a, b) => b.expectedValue - a.expectedValue);
  };

  // Fetch predictions and betting lines
  const fetchBettingSuggestions = async () => {
    if (!predictorInitialized) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Load teams if needed
      if (teams.length === 0) {
        const fbsTeams = await teamService.getAllTeams();
        setTeams(fbsTeams || []);
      }

      // Get games for the selected week/year
      const games = await gameService.getWeeklyGames(selectedYear, selectedWeek, 'regular');
      console.log(`📅 Loaded ${games?.length || 0} games for ${selectedYear} Week ${selectedWeek}`);

      if (!games || games.length === 0) {
        setErrorMessage(`No games found for ${selectedYear} Week ${selectedWeek}`);
        setIsLoading(false);
        return;
      }

      // Get betting lines if available (mainly for 2024)
      let bettingLines = [];
      if (selectedYear === 2024) {
        try {
          bettingLines = await bettingService.getBettingLines(null, selectedYear, selectedWeek, 'regular');
          console.log(`💰 Loaded ${bettingLines?.length || 0} betting lines for 2024`);
        } catch (error) {
          console.warn('❌ Could not load betting lines:', error);
        }
      }

      // Create betting lines map
      const linesMap = new Map();
      bettingLines.forEach(line => {
        const gameKey = `${line.homeTeam}-${line.awayTeam}`;
        if (!linesMap.has(gameKey)) {
          linesMap.set(gameKey, []);
        }
        linesMap.get(gameKey).push(line);
      });

      const predictionPromises = games.slice(0, 15).map(async (game) => {
        try {
          // Find team IDs
          const homeTeam = teams.find(t => 
            t.school?.toLowerCase() === game.homeTeam?.toLowerCase() ||
            t.school?.toLowerCase() === game.home_team?.toLowerCase()
          );
          const awayTeam = teams.find(t => 
            t.school?.toLowerCase() === game.awayTeam?.toLowerCase() ||
            t.school?.toLowerCase() === game.away_team?.toLowerCase()
          );

          if (!homeTeam || !awayTeam) {
            console.warn(`❌ Could not find team data for ${game.homeTeam || game.home_team} vs ${game.awayTeam || game.away_team}`);
            return null;
          }

          // Generate prediction
          const prediction = await matchupPredictor.getSummaryPrediction(
            homeTeam.id,
            awayTeam.id,
            {
              neutralSite: game.neutralSite || false,
              week: selectedWeek,
              season: selectedYear,
              conferenceGame: homeTeam.conference === awayTeam.conference
            }
          );

          const gameKey = `${homeTeam.school}-${awayTeam.school}`;
          const actualLines = linesMap.get(gameKey) || [];

          // Generate suggestions
          const suggestions = generateBettingSuggestions(
            {
              id: game.id,
              homeTeam: homeTeam.school,
              awayTeam: awayTeam.school,
              homeTeamLogo: homeTeam.logos?.[0],
              awayTeamLogo: awayTeam.logos?.[0]
            },
            prediction,
            actualLines
          );

          return {
            game: {
              id: game.id,
              homeTeam: homeTeam.school,
              awayTeam: awayTeam.school,
              homeTeamLogo: homeTeam.logos?.[0],
              awayTeamLogo: awayTeam.logos?.[0],
              startDate: game.start_date || game.startDate,
              venue: game.venue
            },
            prediction,
            actualScore: selectedYear === 2024 && game.completed ? {
              home: game.home_points || game.homePoints || 0,
              away: game.away_points || game.awayPoints || 0
            } : null,
            suggestions,
            hasActualLines: actualLines.length > 0,
            isCompleted: selectedYear === 2024 && game.completed
          };
        } catch (error) {
          console.error(`❌ Error processing game:`, error);
          return null;
        }
      });

      const results = await Promise.all(predictionPromises);
      const validResults = results.filter(Boolean);

      console.log(`✅ Generated predictions for ${validResults.length} games`);
      setPredictions(validResults);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Error fetching betting suggestions:', error);
      setErrorMessage(`Failed to generate betting suggestions: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Load data when year/week changes
  useEffect(() => {
    if (predictorInitialized) {
      fetchBettingSuggestions();
    }
  }, [selectedYear, selectedWeek, predictorInitialized]);

  // Calculate accuracy for 2024 completed games
  const accuracy2024 = useMemo(() => {
    if (selectedYear !== 2024) return null;

    const completedGames = predictions.filter(p => p.isCompleted && p.actualScore);
    if (completedGames.length === 0) return null;

    let correctSpreads = 0;
    let correctTotals = 0;
    let correctWinners = 0;

    completedGames.forEach(p => {
      const actualSpread = p.actualScore.home - p.actualScore.away;
      const predictedSpread = p.prediction.spread || 0;
      const actualTotal = p.actualScore.home + p.actualScore.away;
      const predictedTotal = p.prediction.total || 45;

      // Check winner prediction
      const predictedWinner = predictedSpread > 0 ? 'home' : 'away';
      const actualWinner = actualSpread > 0 ? 'home' : 'away';
      if (predictedWinner === actualWinner) correctWinners++;

      // Check spread (within 7 points is considered correct)
      if (Math.abs(actualSpread - predictedSpread) <= 7) correctSpreads++;

      // Check total (within 7 points is considered correct)
      if (Math.abs(actualTotal - predictedTotal) <= 7) correctTotals++;
    });

    return {
      games: completedGames.length,
      winnerAccuracy: (correctWinners / completedGames.length) * 100,
      spreadAccuracy: (correctSpreads / completedGames.length) * 100,
      totalAccuracy: (correctTotals / completedGames.length) * 100
    };
  }, [predictions, selectedYear]);

  // Get team logo
  const getTeamLogo = (teamName) => {
    const team = teams.find(t => t.school?.toLowerCase() === teamName?.toLowerCase());
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const formatOdds = (odds) => odds > 0 ? `+${odds}` : `${odds}`;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 65) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 80) return 'HIGH';
    if (confidence >= 65) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .gameday-plus-badge {
          background: ${metallicGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
          font-weight: bold;
        }
      `}</style>

      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-8" style={{ width: '96%', maxWidth: 'none' }}>
        <h1 className="text-5xl font-bold gradient-text mb-4">BETTING SUGGESTIONS</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          AI-powered betting recommendations using advanced prediction models and market analysis
        </p>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 mb-8" style={{ width: '96%', maxWidth: 'none' }}>
        <div className="flex justify-center gap-4 mb-6">
          {/* Year Selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-white/80 backdrop-blur-md border border-white/30 rounded-lg hover:bg-white/90 transition-all shadow-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={2024}>2024 Season (Completed)</option>
              <option value={2025}>2025 Season (Predictions)</option>
            </select>
          </div>

          {/* Week Selector */}
          <div className="relative">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="px-4 py-2 bg-white/80 backdrop-blur-md border border-white/30 rounded-lg hover:bg-white/90 transition-all shadow-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2024 Accuracy Display */}
        {accuracy2024 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold gradient-text mb-4 text-center">
                🎯 2024 Model Accuracy
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{accuracy2024.games}</div>
                  <div className="text-sm text-gray-600">Games Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{accuracy2024.winnerAccuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Winner Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{accuracy2024.spreadAccuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Spread Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{accuracy2024.totalAccuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Total Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4" style={{ width: '96%', maxWidth: 'none' }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
            <p className="mt-4 text-gray-600">Generating betting suggestions...</p>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-20">
            <i className="fas fa-exclamation-triangle text-5xl text-orange-500 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={fetchBettingSuggestions}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
            >
              Retry
            </button>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-20">
            <i className="fas fa-chart-line text-5xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">No Predictions Available</h3>
            <p className="text-gray-600 mb-6">Try selecting a different week or check back later</p>
          </div>
        ) : (
          <div className="space-y-6">
            {predictions.map((predictionData, index) => (
              <GamePredictionCard 
                key={predictionData.game.id || index} 
                data={predictionData} 
                selectedYear={selectedYear}
                getTeamLogo={getTeamLogo}
                formatOdds={formatOdds}
                getConfidenceColor={getConfidenceColor}
                getConfidenceBadge={getConfidenceBadge}
                metallicGradient={metallicGradient}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Game Prediction Card Component
const GamePredictionCard = ({ 
  data, 
  selectedYear, 
  getTeamLogo, 
  formatOdds, 
  getConfidenceColor, 
  getConfidenceBadge,
  metallicGradient 
}) => {
  const { game, prediction, actualScore, suggestions, hasActualLines, isCompleted } = data;
  
  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Team logos and matchup */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src={getTeamLogo(game.awayTeam)}
                  alt={game.awayTeam}
                  className="w-8 h-8 object-contain"
                  onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                />
              </div>
              <span className="text-gray-400 font-medium">@</span>
              <div className="w-10 h-10 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src={getTeamLogo(game.homeTeam)}
                  alt={game.homeTeam}
                  className="w-8 h-8 object-contain"
                  onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {game.awayTeam} @ {game.homeTeam}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedYear} • Week {data.game.week || 'TBD'}
              </p>
            </div>
          </div>

          {/* Data Source Badge */}
          <div className="flex items-center space-x-2">
            {hasActualLines ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                <i className="fas fa-check-circle mr-1"></i>
                REAL ODDS
              </span>
            ) : (
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full">
                <span className="gameday-plus-badge">GAMEDAY+ LINES</span>
              </span>
            )}
          </div>
        </div>

        {/* Prediction Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Predicted Score</div>
            <div className="text-lg font-bold text-gray-800">
              {prediction?.score?.away || 0} - {prediction?.score?.home || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Spread</div>
            <div className="text-lg font-bold" style={{ color: 'rgb(204,0,28)' }}>
              {Math.abs(prediction?.spread || 0).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total</div>
            <div className="text-lg font-bold text-gray-800">
              {prediction?.total?.toFixed(1) || '0.0'}
            </div>
          </div>
        </div>

        {/* 2024 Actual Results */}
        {isCompleted && actualScore && (
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-1">Actual Score</div>
              <div className="text-lg font-bold text-blue-800">
                {actualScore.away} - {actualScore.home}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-1">Actual Spread</div>
              <div className="text-lg font-bold text-blue-800">
                {Math.abs(actualScore.home - actualScore.away).toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-1">Actual Total</div>
              <div className="text-lg font-bold text-blue-800">
                {(actualScore.home + actualScore.away).toFixed(1)}
              </div>
            </div>
          </div>
        )}

        {/* Betting Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <i className="fas fa-lightbulb mr-2" style={{ color: 'rgb(204,0,28)' }}></i>
              Betting Suggestions
            </h4>
            
            <div className="space-y-3">
              {suggestions.slice(0, 3).map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          suggestion.type === 'spread' ? 'bg-blue-100 text-blue-700' :
                          suggestion.type === 'total' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {suggestion.type.toUpperCase()}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          suggestion.confidence >= 80 ? 'bg-green-100 text-green-700' :
                          suggestion.confidence >= 65 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {getConfidenceBadge(suggestion.confidence)} CONFIDENCE
                        </span>

                        {suggestion.isGameDayPlus && (
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-bold text-white"
                            style={{ background: metallicGradient }}
                          >
                            <span style={{ fontStyle: 'italic' }}>GAMEDAY+ LINES</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="font-semibold text-gray-800 mb-1">
                        {suggestion.bet} ({formatOdds(suggestion.odds)})
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {suggestion.reasoning}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <strong>Recommendation:</strong> {suggestion.recommendation}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getConfidenceColor(suggestion.confidence)}`}>
                        {suggestion.confidence.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        +{suggestion.expectedValue.toFixed(1)} EV
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {suggestions.length > 3 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
                  <i className="fas fa-plus-circle mr-1"></i>
                  {suggestions.length - 3} more suggestions available
                </span>
              </div>
            )}
          </div>
        )}

        {suggestions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <i className="fas fa-info-circle text-2xl mb-2"></i>
            <p>No significant value found in current market lines</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingSuggestions;
