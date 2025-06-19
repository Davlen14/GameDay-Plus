import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { gameService, teamService, rankingsService, bettingService } from '../../services';
import graphqlService from '../../services/graphqlService';
import matchupPredictor from '../../utils/MatchupPredictor';

const GamePredictor = () => {
  const [animateShine, setAnimateShine] = useState(false);
  
  // Core state management
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeView, setActiveView] = useState('weekly'); // 'weekly', 'matchup', 'models'
  
  // Data state
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [predictions, setPredictions] = useState(new Map());
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const [weekAccuracy, setWeekAccuracy] = useState(null);
  const [predictorInitialized, setPredictorInitialized] = useState(false);
  
  // Matchup Predictor state
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [matchupPrediction, setMatchupPrediction] = useState(null);
  const [teamSearchResults, setTeamSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const initializePredictor = useCallback(async () => {
    try {
      setIsLoading(true);
      await matchupPredictor.initialize();
      setPredictorInitialized(true);
      console.log('MatchupPredictor initialized successfully');
    } catch (error) {
      console.error('Error initializing predictor:', error);
      setErrorMessage('Failed to initialize prediction engine');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPredictionData = useCallback(async () => {
    if (!predictorInitialized) return;
    
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Try to load games using enhanced GraphQL query first
      let weekGames = [];
      let allTeams = [];
      
      try {
        console.log('🚀 Loading prediction data via GraphQL...');
        
        // Check GraphQL availability first
        const isGraphQLAvailable = await graphqlService.utils.isAvailable();
        if (!isGraphQLAvailable) {
          throw new Error('GraphQL service not available');
        }
        
        const graphqlData = await graphqlService.getWeeklyGamesForPrediction(selectedWeek, selectedYear);
        
        if (graphqlData && graphqlData.games) {
          weekGames = graphqlData.games;
          allTeams = graphqlData.teams || await teamService.getFBSTeams(false); // Use REST fallback
          console.log('✓ Successfully loaded data via GraphQL');
        } else {
          throw new Error('GraphQL returned empty data');
        }
      } catch (graphqlError) {
        console.warn('⚠️ GraphQL loading failed, falling back to REST API:', graphqlError.message);
        try {
          weekGames = await gameService.getGames(selectedYear, selectedWeek, 'regular', null, null, null, null, 'fbs', null, false);
          allTeams = await teamService.getFBSTeams(false); // Force REST API
        } catch (restError) {
          console.error('❌ REST API fallback also failed:', restError.message);
          setErrorMessage('Failed to load game data from both GraphQL and REST APIs');
          setIsLoading(false);
          return;
        }
      }

      setGames(weekGames);

      // Create a lookup map for teams by ID and name
      const teamLookup = new Map();
      allTeams.forEach(team => {
        if (team.id) teamLookup.set(team.id, team);
        if (team.school) teamLookup.set(team.school.toLowerCase(), team);
      });

      // Process games with enhanced predictions
      const gamePredictions = [];
      let weekAccuracy = null;

      for (const game of weekGames) {
        const homeTeamId = game.home_id || game.homeId;
        const awayTeamId = game.away_id || game.awayId;
        const homeTeamName = game.home_team || game.homeTeam;
        const awayTeamName = game.away_team || game.awayTeam;
        
        if (homeTeamId && awayTeamId) {
          try {
            // Find full team objects for home and away teams
            const homeTeam = teamLookup.get(homeTeamId) || 
                           teamLookup.get(homeTeamName?.toLowerCase()) || 
                           { 
                             id: homeTeamId, 
                             school: homeTeamName, 
                             abbreviation: homeTeamName?.substring(0, 4)?.toUpperCase() || 'HOME',
                             logos: ['/photos/ncaaf.png'],
                             conference: 'Unknown',
                             classification: 'unknown' // Mark unknown teams as non-FBS
                           };
            
            const awayTeam = teamLookup.get(awayTeamId) || 
                           teamLookup.get(awayTeamName?.toLowerCase()) || 
                           { 
                             id: awayTeamId, 
                             school: awayTeamName, 
                             abbreviation: awayTeamName?.substring(0, 4)?.toUpperCase() || 'AWAY',
                             logos: ['/photos/ncaaf.png'],
                             conference: 'Unknown',
                             classification: 'unknown' // Mark unknown teams as non-FBS
                           };

            // Filter to only include FBS vs FBS games
            const homeTeamIsFBS = homeTeam.classification === 'fbs';
            const awayTeamIsFBS = awayTeam.classification === 'fbs';
            
            // Skip games that don't involve two FBS teams
            if (!homeTeamIsFBS || !awayTeamIsFBS) {
              console.log(`🚫 Skipping non-FBS game: ${awayTeamName} @ ${homeTeamName} (Home: ${homeTeam.classification || 'unknown'}, Away: ${awayTeam.classification || 'unknown'})`);
              continue;
            }

            // Enhanced prediction options with GraphQL data
            const predictionOptions = {
              week: selectedWeek,
              season: selectedYear,
              conferenceGame: homeTeam.conference === awayTeam.conference,
              weatherConditions: game.weather || null,
              // Add enhanced context from GraphQL
              excitementIndex: game.excitementIndex || null,
              bettingData: game.bettingLines || null
            };

            // For completed 2024 games, show actual vs predicted with enhanced analysis
            if (selectedYear === 2024 && game.completed) {
              const prediction = await matchupPredictor.getSummaryPrediction(
                homeTeamId, 
                awayTeamId, 
                predictionOptions
              );

              const actualScore = {
                home: game.home_points || game.homePoints || 0,
                away: game.away_points || game.awayPoints || 0
              };

              // Enhanced accuracy calculation
              const predictedWinner = prediction.score.home > prediction.score.away ? 'home' : 'away';
              const actualWinner = actualScore.home > actualScore.away ? 'home' : 'away';
              const correctWinner = predictedWinner === actualWinner;

              const scoreDifference = {
                home: Math.abs(prediction.score.home - actualScore.home),
                away: Math.abs(prediction.score.away - actualScore.away)
              };

              gamePredictions.push({
                gameId: game.id,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                isCompleted: true,
                actualScore: actualScore,
                predictedScore: prediction.score,
                correctWinner: correctWinner,
                scoreDifference: scoreDifference,
                prediction: prediction.spread,
                confidence: prediction.confidence,
                summary: prediction.summary,
                winProbability: prediction.winProbability,
                // Enhanced fields from GraphQL
                excitementIndex: game.excitementIndex || 0,
                weatherImpact: game.weather?.impact || 'none',
                eloRatings: {
                  home: game.homeEloRating || null,
                  away: game.awayEloRating || null
                }
              });
            } 
            // For 2025 games or incomplete games, show enhanced predictions
            else {
              const prediction = await matchupPredictor.getSummaryPrediction(
                homeTeamId, 
                awayTeamId, 
                predictionOptions
              );

              gamePredictions.push({
                gameId: game.id,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                isCompleted: false,
                prediction: prediction.spread,
                confidence: prediction.confidence,
                predictedScore: prediction.score,
                winProbability: prediction.winProbability,
                total: prediction.total,
                summary: prediction.summary,
                moneyline: prediction.moneyline,
                // Enhanced fields from GraphQL
                excitementIndex: game.excitementIndex || 0,
                weatherImpact: game.weather?.impact || 'none',
                bettingInsights: game.bettingLines || null,
                eloRatings: {
                  home: game.homeEloRating || null,
                  away: game.awayEloRating || null
                },
                talentGap: game.talentDifferential || null
              });
            }
          } catch (error) {
            console.error(`Error predicting game ${game.id}:`, error);
          }
        }
      }

      // Enhanced week accuracy calculation for 2024 completed games
      if (selectedYear === 2024) {
        const completedGames = gamePredictions.filter(g => g.isCompleted);
        if (completedGames.length > 0) {
          const correctPredictions = completedGames.filter(g => g.correctWinner).length;
          const totalGames = completedGames.length;
          const avgScoreError = completedGames.reduce((acc, game) => {
            return acc + (game.scoreDifference.home + game.scoreDifference.away) / 2;
          }, 0) / completedGames.length;

          // Enhanced accuracy metrics
          const highConfidenceGames = completedGames.filter(g => g.confidence >= 0.8);
          const highConfidenceAccuracy = highConfidenceGames.length > 0 ?
            (highConfidenceGames.filter(g => g.correctWinner).length / highConfidenceGames.length) * 100 : 0;

          weekAccuracy = {
            winnerAccuracy: (correctPredictions / totalGames) * 100,
            averageScoreError: avgScoreError,
            totalGames: totalGames,
            correctPredictions: correctPredictions,
            highConfidenceAccuracy: highConfidenceAccuracy,
            highConfidenceGames: highConfidenceGames.length
          };
        }
      }

      setWeeklyPredictions(gamePredictions);
      setWeekAccuracy(weekAccuracy);
      
    } catch (error) {
      console.error('Error loading prediction data:', error);
      setErrorMessage('Failed to load game predictions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeek, selectedYear, predictorInitialized]);

  useEffect(() => {
    setAnimateShine(true);
    initializePredictor();
  }, [initializePredictor]);

  useEffect(() => {
    loadPredictionData();
  }, [loadPredictionData]);

  // Team search functionality
  const handleTeamSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.length >= 2 && predictorInitialized) {
      const suggestions = matchupPredictor.getTeamSuggestions(query);
      setTeamSearchResults(suggestions);
    } else {
      setTeamSearchResults([]);
    }
  }, [predictorInitialized]);

  // Matchup prediction handler
  const handleMatchupPrediction = useCallback(async () => {
    if (!homeTeam || !awayTeam || !predictorInitialized) return;

    try {
      setIsLoading(true);
      const prediction = await matchupPredictor.predictMatchup(
        homeTeam.id,  // Use team ID
        awayTeam.id,  // Use team ID
        {
          week: selectedWeek,
          season: selectedYear
        }
      );
      
      setMatchupPrediction(prediction);
    } catch (error) {
      console.error('Error generating matchup prediction:', error);
      setErrorMessage('Failed to generate matchup prediction');
    } finally {
      setIsLoading(false);
    }
  }, [homeTeam, awayTeam, selectedWeek, selectedYear, predictorInitialized]);

  // Load teams for dropdowns when predictor is ready
  useEffect(() => {
    const loadTeams = async () => {
      if (predictorInitialized) {
        try {
          // Load only FBS teams
          const teamData = await teamService.getFBSTeams();
          setTeams(teamData);
        } catch (error) {
          console.error('Error loading teams:', error);
        }
      }
    };
    loadTeams();
  }, [predictorInitialized]);

  const weekOptions = Array.from({ length: 17 }, (_, i) => i + 1);
  const yearOptions = [2024, 2025];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-none mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 bg-white/30 backdrop-blur-lg rounded-full shadow-lg flex items-center justify-center border border-white/40 ${animateShine ? 'metallic-3d-logo-enhanced' : ''}`}>
              <i className="fas fa-brain text-3xl text-gray-700"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Game Predictor</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Advanced AI-powered predictions using machine learning algorithms and comprehensive statistical analysis.
            <span className="block mt-2 text-lg text-gray-600">
              <i className="fas fa-microscope mr-2 text-blue-600"></i>
              Validate our AI model accuracy by comparing 2024 predictions vs actual game results, or explore 2025 predictions.
            </span>
            <span className="block mt-2 text-sm text-purple-600 font-medium">
              <i className="fas fa-rocket mr-2"></i>
              Enhanced with GraphQL integration for comprehensive data analysis including ELO ratings, weather impact, and betting insights.
            </span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-2 flex space-x-2">
            <button
              onClick={() => setActiveView('weekly')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'weekly'
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-700 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <i className="fas fa-calendar-week mr-2"></i>
              Weekly Predictions
            </button>
            <button
              onClick={() => setActiveView('matchup')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'matchup'
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-700 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <i className="fas fa-vs mr-2"></i>
              Matchup Predictor
            </button>
            <button
              onClick={() => setActiveView('models')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'models'
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-700 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <i className="fas fa-cogs mr-2"></i>
              Model Details
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
            <p className="mt-4 text-gray-700">
              {!predictorInitialized ? 'Initializing AI models...' : 'Generating predictions...'}
            </p>
          </div>
        )}

        {/* Weekly Predictions View */}
        {activeView === 'weekly' && predictorInitialized && (
          <div className="space-y-8">
            {/* Week/Year Selector */}
            <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold gradient-text">
                    Week {selectedWeek} {selectedYear === 2024 ? 'AI Model Validation' : 'Game Predictions'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedYear === 2024 
                      ? 'Actual game results vs our AI predictions - validating model accuracy'
                      : 'Advanced machine learning predictions for upcoming games'
                    }
                  </p>
                  {selectedYear === 2024 && weekAccuracy && (
                    <div className="mt-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-chart-line text-blue-500"></i>
                        <span className="font-semibold text-gray-800">Enhanced AI Model Performance</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            weekAccuracy.winnerAccuracy >= 70 ? 'bg-green-500' : 
                            weekAccuracy.winnerAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            <i className={`fas ${weekAccuracy.winnerAccuracy >= 70 ? 'fa-check' : weekAccuracy.winnerAccuracy >= 60 ? 'fa-minus' : 'fa-times'} text-white text-xs`}></i>
                          </div>
                          <span className="text-gray-700 font-medium">
                            Overall Accuracy: <span className="font-bold gradient-text">{weekAccuracy.winnerAccuracy.toFixed(1)}%</span>
                            <span className="text-xs text-gray-500 ml-1">({weekAccuracy.correctPredictions}/{weekAccuracy.totalGames})</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            weekAccuracy.averageScoreError <= 10 ? 'bg-green-500' : 
                            weekAccuracy.averageScoreError <= 15 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            <i className="fas fa-target text-white text-xs"></i>
                          </div>
                          <span className="text-gray-700 font-medium">
                            Avg Score Error: <span className="font-bold gradient-text">{weekAccuracy.averageScoreError.toFixed(1)} pts</span>
                          </span>
                        </div>
                        {weekAccuracy.highConfidenceGames > 0 && (
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              weekAccuracy.highConfidenceAccuracy >= 80 ? 'bg-green-500' : 
                              weekAccuracy.highConfidenceAccuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              <i className="fas fa-star text-white text-xs"></i>
                            </div>
                            <span className="text-gray-700 font-medium">
                              High Confidence: <span className="font-bold gradient-text">{weekAccuracy.highConfidenceAccuracy.toFixed(1)}%</span>
                              <span className="text-xs text-gray-500 ml-1">({weekAccuracy.highConfidenceGames} games)</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {weekOptions.map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Weekly Predictions Grid */}
            {weeklyPredictions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {weeklyPredictions.map((prediction, index) => (
                  <WeeklyPredictionCard key={index} prediction={prediction} />
                ))}
              </div>
            ) : !isLoading ? (
              <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-12 text-center">
                <i className="fas fa-calendar-times text-6xl text-gray-400 mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Games Available</h3>
                <p className="text-gray-600">
                  No games found for Week {selectedWeek} of {selectedYear}
                  {selectedYear === 2025 && (
                    <span className="block mt-2 text-sm">
                      <i className="fas fa-info-circle mr-1"></i>
                      2025 schedule may not be fully released yet
                    </span>
                  )}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Matchup Predictor View */}
        {activeView === 'matchup' && predictorInitialized && (
          <div className="space-y-8">
            <MatchupPredictorInterface
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              setHomeTeam={setHomeTeam}
              setAwayTeam={setAwayTeam}
              teams={teams}
              onPredict={handleMatchupPrediction}
              prediction={matchupPrediction}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Model Details View */}
        {activeView === 'models' && (
          <ModelDetailsView />
        )}
      </div>
    </div>
  );
};

// Weekly Prediction Card Component
const WeeklyPredictionCard = ({ prediction }) => {
  const { 
    homeTeam, awayTeam, predictedScore, prediction: spread, total, winProbability, 
    confidence, summary, isCompleted, actualScore, correctWinner, scoreDifference,
    excitementIndex, weatherImpact, eloRatings, talentGap, bettingInsights 
  } = prediction;
  
  const favorite = spread > 0 ? homeTeam : awayTeam;
  const underdog = spread > 0 ? awayTeam : homeTeam;
  const spreadValue = Math.abs(spread);

  // Get team colors (fallback to default colors if not available)
  const awayTeamColor = awayTeam?.color || '#dc2626'; // red
  const homeTeamColor = homeTeam?.color || '#2563eb'; // blue

  return (
    <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-2xl p-8 hover:shadow-3xl hover:bg-white/40 transition-all duration-300 transform hover:-translate-y-2">
      {/* Enhanced Teams Header with ELO Ratings */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="relative group">
              <img 
                src={awayTeam?.logos?.[0] || '/photos/ncaaf.png'} 
                alt={awayTeam?.school} 
                className="w-24 h-24 mx-auto mb-2 metallic-3d-logo-enhanced object-contain transform group-hover:scale-110 transition-all duration-500"
              />
              <div className="text-sm font-bold text-gray-800 bg-white/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/40">
                {awayTeam?.abbreviation || 'AWAY'}
              </div>
              {/* ELO Rating Display */}
              {eloRatings?.away && (
                <div className="text-xs text-blue-600 font-medium mt-1">
                  ELO: {eloRatings.away.toFixed(0)}
                </div>
              )}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-600">@</div>
          <div className="text-center">
            <div className="relative group">
              <img 
                src={homeTeam?.logos?.[0] || '/photos/ncaaf.png'} 
                alt={homeTeam?.school} 
                className="w-24 h-24 mx-auto mb-2 metallic-3d-logo-enhanced object-contain transform group-hover:scale-110 transition-all duration-500"
              />
              <div className="text-sm font-bold text-gray-800 bg-white/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/40">
                {homeTeam?.abbreviation || 'HOME'}
              </div>
              {/* ELO Rating Display */}
              {eloRatings?.home && (
                <div className="text-xs text-blue-600 font-medium mt-1">
                  ELO: {eloRatings.home.toFixed(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Status Section */}
        <div className="text-right">
          {isCompleted ? (
            <div>
              <div className="text-xs text-gray-600 mb-2 font-medium">AI Model Result</div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-lg border-2 shadow-lg ${
                correctWinner 
                  ? 'bg-green-500/30 text-green-700 border-green-400/60' 
                  : 'bg-red-500/30 text-red-700 border-red-400/60'
              }`}>
                <div className="flex items-center space-x-2">
                  <i className={`fas ${correctWinner ? 'fa-trophy' : 'fa-target'}`}></i>
                  <span>{correctWinner ? 'Accurate' : 'Missed'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">Prediction Confidence</div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold backdrop-blur-lg border-2 shadow-lg ${
                  confidence >= 0.8 ? 'bg-green-500/30 text-green-700 border-green-400/60' :
                  confidence >= 0.6 ? 'bg-yellow-500/30 text-yellow-700 border-yellow-400/60' :
                  'bg-red-500/30 text-red-700 border-red-400/60'
                }`}>
                  <div className="flex items-center space-x-1">
                    <i className={`fas ${confidence >= 0.8 ? 'fa-star' : confidence >= 0.6 ? 'fa-star-half-alt' : 'fa-question'}`}></i>
                    <span>{(confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Excitement Index */}
              {excitementIndex > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1 font-medium">Game Excitement</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-lg border shadow-lg ${
                    excitementIndex >= 8 ? 'bg-purple-500/30 text-purple-700 border-purple-400/60' :
                    excitementIndex >= 6 ? 'bg-orange-500/30 text-orange-700 border-orange-400/60' :
                    'bg-gray-500/30 text-gray-700 border-gray-400/60'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <i className="fas fa-fire"></i>
                      <span>{excitementIndex.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Score Display with Talent Gap */}
      {isCompleted ? (
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="text-xs text-gray-600 mb-2 font-medium flex items-center justify-center space-x-1">
              <i className="fas fa-trophy text-green-600"></i>
              <span>Actual Final Score</span>
            </div>
            <div className="font-bold text-gray-800 text-xl">
              {actualScore.away} - {actualScore.home}
            </div>
            <div className="text-xs text-green-600 mt-1 font-medium">Official Result</div>
          </div>
          <div className="text-center bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="text-xs text-gray-600 mb-2 font-medium flex items-center justify-center space-x-1">
              <i className="fas fa-brain text-blue-600"></i>
              <span>AI Prediction</span>
            </div>
            <div className="font-bold text-gray-800 text-xl">
              {predictedScore.away.toFixed(0)} - {predictedScore.home.toFixed(0)}
            </div>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              ±{scoreDifference.away.toFixed(0)}-{scoreDifference.home.toFixed(0)} pts error
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="text-xs text-gray-600 mb-2 font-medium flex items-center justify-center space-x-1">
              <i className="fas fa-calculator text-purple-600"></i>
              <span>Predicted Score</span>
            </div>
            <div className="font-bold text-gray-800 text-lg">
              {predictedScore.away.toFixed(0)} - {predictedScore.home.toFixed(0)}
            </div>
            {/* Talent Gap Indicator */}
            {talentGap && (
              <div className="text-xs text-purple-600 mt-1 font-medium">
                Talent Gap: {talentGap > 0 ? '+' : ''}{talentGap.toFixed(1)}
              </div>
            )}
          </div>
          <div className="text-center bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="text-xs text-gray-600 mb-2 font-medium flex items-center justify-center space-x-1">
              <i className="fas fa-chart-line text-orange-600"></i>
              <span>Spread</span>
            </div>
            <div className="font-bold gradient-text text-lg">
              {favorite?.abbreviation || 'FAV'} -{spreadValue.toFixed(1)}
            </div>
          </div>
          <div className="text-center bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="text-xs text-gray-600 mb-2 font-medium flex items-center justify-center space-x-1">
              <i className="fas fa-plus text-green-600"></i>
              <span>Total</span>
            </div>
            <div className="font-bold text-gray-800 text-lg">{total.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Modern Win Probability Chart */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm text-gray-800 mb-4">
          <div className="flex items-center space-x-2">
            <img 
              src={awayTeam?.logos?.[0] || '/photos/ncaaf.png'} 
              alt={awayTeam?.school} 
              className="w-8 h-8 metallic-3d-logo object-contain"
            />
            <span className="font-medium">{awayTeam?.school || 'Away Team'}</span>
          </div>
          <div className="text-xs text-gray-600 font-medium">
            {isCompleted ? 'Pre-Game Win Probability (AI Model)' : 'Win Probability'}
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{homeTeam?.school || 'Home Team'}</span>
            <img 
              src={homeTeam?.logos?.[0] || '/photos/ncaaf.png'} 
              alt={homeTeam?.school} 
              className="w-8 h-8 metallic-3d-logo object-contain"
            />
          </div>
        </div>
        
        {/* Enhanced Win Probability Bar */}
        <div className="relative bg-gray-300/60 backdrop-blur-sm rounded-full h-6 border border-white/40 overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-6 rounded-l-full transition-all duration-700 ease-out"
            style={{ 
              width: `${winProbability.away}%`,
              background: `linear-gradient(90deg, ${awayTeamColor}, ${awayTeamColor}dd)`,
              boxShadow: `inset 0 1px 3px rgba(255,255,255,0.2), 0 0 10px ${awayTeamColor}40`
            }}
          ></div>
          <div 
            className="absolute right-0 top-0 h-6 rounded-r-full transition-all duration-700 ease-out"
            style={{ 
              width: `${winProbability.home}%`,
              background: `linear-gradient(90deg, ${homeTeamColor}dd, ${homeTeamColor})`,
              boxShadow: `inset 0 1px 3px rgba(255,255,255,0.2), 0 0 10px ${homeTeamColor}40`
            }}
          ></div>
          
          {/* Center divider */}
          <div className="absolute left-1/2 top-0 w-0.5 h-6 bg-white/30 transform -translate-x-0.5"></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-800 mt-3 font-medium">
          <span>{winProbability.away.toFixed(1)}%</span>
          <span>{winProbability.home.toFixed(1)}%</span>
        </div>
      </div>

      {/* Enhanced Summary with Weather and Additional Context */}
      <div className="text-sm text-gray-700 leading-relaxed bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
        {isCompleted ? (
          <div>
            <div className="font-semibold mb-3 flex items-center space-x-2">
              <i className="fas fa-microscope text-blue-600"></i>
              <span>AI Model Validation Analysis:</span>
            </div>
            <div className="mb-3">{summary}</div>
            
            {/* Enhanced Accuracy Feedback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className={`p-3 rounded-lg border-2 ${
                correctWinner 
                  ? 'bg-green-50/80 border-green-200 text-green-800' 
                  : 'bg-red-50/80 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <i className={`fas ${correctWinner ? 'fa-check-circle' : 'fa-times-circle'} text-lg`}></i>
                  <div>
                    <div className="font-semibold text-xs">Winner Prediction</div>
                    <div className="text-sm">
                      {correctWinner ? 'Correct! ✓' : 'Incorrect ✗'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border-2 ${
                (scoreDifference.home + scoreDifference.away) / 2 <= 10
                  ? 'bg-green-50/80 border-green-200 text-green-800'
                  : (scoreDifference.home + scoreDifference.away) / 2 <= 15
                  ? 'bg-yellow-50/80 border-yellow-200 text-yellow-800'
                  : 'bg-red-50/80 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-bullseye text-lg"></i>
                  <div>
                    <div className="font-semibold text-xs">Score Accuracy</div>
                    <div className="text-sm">
                      {((scoreDifference.home + scoreDifference.away) / 2).toFixed(1)} pts avg error
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="font-semibold mb-2 flex items-center space-x-2">
              <i className="fas fa-robot text-purple-600"></i>
              <span>Enhanced AI Prediction Analysis:</span>
            </div>
            <div className="mb-3">{summary}</div>
            
            {/* Enhanced Context Indicators */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Weather Impact */}
              {weatherImpact && weatherImpact !== 'none' && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  weatherImpact === 'high' ? 'bg-red-100 text-red-700' :
                  weatherImpact === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  <i className="fas fa-cloud mr-1"></i>
                  Weather: {weatherImpact}
                </div>
              )}
              
              {/* ELO Rating Difference */}
              {eloRatings?.home && eloRatings?.away && (
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <i className="fas fa-chart-bar mr-1"></i>
                  ELO Δ: {Math.abs(eloRatings.home - eloRatings.away).toFixed(0)}
                </div>
              )}
              
              {/* High Excitement Game */}
              {excitementIndex >= 7 && (
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <i className="fas fa-fire mr-1"></i>
                  High Stakes
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Matchup Predictor Interface Component
const MatchupPredictorInterface = ({ 
  homeTeam, 
  awayTeam, 
  setHomeTeam, 
  setAwayTeam, 
  teams, 
  onPredict, 
  prediction, 
  isLoading 
}) => {
  return (
    <div className="space-y-8">
      {/* Team Selection */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6 text-center">Select Teams to Compare</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Away Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Away Team</label>
            <select
              value={awayTeam?.id || ''}
              onChange={(e) => {
                const team = teams.find(t => t.id === parseInt(e.target.value));
                setAwayTeam(team);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select away team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.school} ({team.abbreviation})
                </option>
              ))}
            </select>
            {awayTeam && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                <img 
                  src={awayTeam.logos?.[0] || '/api/placeholder/40/40'} 
                  alt={awayTeam.school} 
                  className="w-12 h-12 metallic-3d-logo object-contain"
                />
                <div>
                  <div className="font-semibold">{awayTeam.school}</div>
                  <div className="text-sm text-gray-600">{awayTeam.conference}</div>
                </div>
              </div>
            )}
          </div>

          {/* Home Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Team</label>
            <select
              value={homeTeam?.id || ''}
              onChange={(e) => {
                const team = teams.find(t => t.id === parseInt(e.target.value));
                setHomeTeam(team);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select home team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.school} ({team.abbreviation})
                </option>
              ))}
            </select>
            {homeTeam && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                <img 
                  src={homeTeam.logos?.[0] || '/api/placeholder/40/40'} 
                  alt={homeTeam.school} 
                  className="w-12 h-12 metallic-3d-logo object-contain"
                />
                <div>
                  <div className="font-semibold">{homeTeam.school}</div>
                  <div className="text-sm text-gray-600">{homeTeam.conference}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onPredict}
            disabled={!homeTeam || !awayTeam || isLoading}
            className="gradient-bg text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Generating Prediction...
              </>
            ) : (
              <>
                <i className="fas fa-brain mr-2"></i>
                Generate Prediction
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <MatchupPredictionResults prediction={prediction} />
      )}
    </div>
  );
};

// Matchup Prediction Results Component
const MatchupPredictionResults = ({ prediction }) => {
  if (!prediction) return null;

  // Debug logs for data flow
  console.log('MatchupPredictionResults props:', prediction);

  // Handle original MatchupPredictor format
  const pred = prediction.prediction || prediction;
  const teams = prediction.teams || { home: {}, away: {} };
  const analysis = prediction.analysis || {};
  const headToHead = prediction.headToHead || [];
  const confidence = prediction.confidence || 0.7;

  // Debug team analyses
  console.log('Team Analyses:', analysis.teamAnalysis);

  return (
    <div className="space-y-6">
      {/* Head-to-Head History */}
      {headToHead.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-xl font-bold gradient-text mb-4">Head-to-Head History</h4>
          <ul className="space-y-2">
            {headToHead.map((game, idx) => (
              <li key={idx} className="flex justify-between text-sm text-gray-700">
                <span>{new Date(game.date).toLocaleDateString()}</span>
                <span>{game.homeTeam} {game.homeScore} - {game.awayScore} {game.awayTeam}</span>
                <span className={`font-semibold ${game.winner === 'home' ? 'text-blue-600' : 'text-red-600'}`}>
                  {game.winner === 'home' ? 'Home Win' : 'Away Win'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Prediction Card */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold gradient-text mb-4">Prediction Results</h3>
          <div className="text-lg text-gray-700">{analysis.summary?.description || 'Prediction complete'}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Score Prediction */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Predicted Score</div>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {pred.score?.away?.toFixed(0) || '0'} - {pred.score?.home?.toFixed(0) || '0'}
            </div>
            <div className="text-sm text-gray-600">
              {teams.away?.school || 'Away'} @ {teams.home?.school || 'Home'}
            </div>
          </div>

          {/* Spread */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Point Spread</div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {pred.spread > 0 ? (teams.home?.abbreviation || 'HOME') : (teams.away?.abbreviation || 'AWAY')} 
              {Math.abs(pred.spread || 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              {pred.spread > 0 ? 'Home' : 'Away'} Favored
            </div>
          </div>

          {/* Total */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Total Points</div>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {pred.total?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-600">
              O/U {pred.total?.toFixed(1) || '0.0'}
            </div>
          </div>
        </div>

        {/* Win Probability */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500">Win Probability</div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">{teams.away?.school || 'Away Team'}</div>
            <div className="text-sm font-semibold">{teams.home?.school || 'Home Team'}</div>
          </div>
          <div className="relative bg-gray-200 rounded-full h-4">
            <div 
              className="absolute left-0 top-0 h-4 bg-red-500 rounded-l-full"
              style={{ width: `${pred.winProbability?.away || 50}%` }}
            ></div>
            <div 
              className="absolute right-0 top-0 h-4 bg-blue-500 rounded-r-full"
              style={{ width: `${pred.winProbability?.home || 50}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{(pred.winProbability?.away || 50).toFixed(1)}%</span>
            <span>{(pred.winProbability?.home || 50).toFixed(1)}%</span>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500 mb-2">Prediction Confidence</div>
          <div className={`inline-block px-4 py-2 rounded-full font-bold ${
            confidence >= 0.8 ? 'bg-green-100 text-green-800' :
            confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {(confidence * 100).toFixed(0)}% Confident
          </div>
        </div>
      </div>

      {/* Key Factors - only show if available */}
      {analysis.keyFactors?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h4 className="text-xl font-bold gradient-text mb-6">Key Factors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.keyFactors.map((factor, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800">{factor.factor}</div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    factor.impact.includes('Home') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {factor.impact}
                  </div>
                </div>
                <div className="text-sm text-gray-600">{factor.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Analysis - only show if available */}
      {analysis.teamAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamAnalysisCard team={teams.away} analysis={analysis.teamAnalysis.away} />
          <TeamAnalysisCard team={teams.home} analysis={analysis.teamAnalysis.home} />
        </div>
      )}
    </div>
  );
};

// Team Analysis Card Component
const TeamAnalysisCard = ({ team, analysis }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <img 
          src={team.logos?.[0] || '/api/placeholder/40/40'} 
          alt={team.school} 
          className="w-12 h-12"
        />
        <div>
          <div className="font-bold text-lg">{team.school}</div>
          <div className="text-sm text-gray-600">{team.conference}</div>
        </div>
        <div className="ml-auto">
          <div className={`text-2xl font-bold ${
            analysis.overall === 'A' ? 'text-green-600' :
            analysis.overall === 'B+' || analysis.overall === 'B' ? 'text-blue-600' :
            analysis.overall === 'C+' || analysis.overall === 'C' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {analysis.overall}
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {analysis.keyStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="font-bold text-lg">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.rank}</div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="mb-6">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Additional Metrics</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Recruiting Rank</div>
            <div className="font-bold">
              {team.metrics?.recruitingRank ?? 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Recruiting Points</div>
            <div className="font-bold">
              {team.metrics?.recruitingPoints ?? 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">ELO Rating</div>
            <div className="font-bold">
              {team.metrics?.eloRating?.toFixed(1) ?? 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Strength of Schedule</div>
            <div className="font-bold">
              {team.metrics?.strengthOfSchedule?.toFixed(1) ?? 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-semibold text-green-700 mb-2">Strengths</div>
          <div className="space-y-1">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="text-xs text-green-600 flex items-center">
                <i className="fas fa-check-circle mr-1"></i>
                {strength}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-red-700 mb-2">Weaknesses</div>
          <div className="space-y-1">
            {analysis.weaknesses.map((weakness, index) => (
              <div key={index} className="text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {weakness}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="mt-4 text-center">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          analysis.trend === 'Trending Up' ? 'bg-green-100 text-green-800' :
          analysis.trend === 'Trending Down' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {analysis.trend}
        </div>
      </div>
    </div>
  );
};

// Model Details View Component
const ModelDetailsView = () => {
  return (
    <div className="space-y-8">
      {/* Model Overview */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Prediction Model Details</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            Our AI-powered prediction system combines multiple sophisticated models to generate 
            accurate game predictions. Each model contributes unique insights based on different 
            aspects of team performance and game dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-chart-bar text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Statistical Model</h3>
            <p className="text-sm text-gray-600">
              Analyzes team performance metrics, efficiency ratings, and historical data patterns.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-brain text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Machine Learning</h3>
            <p className="text-sm text-gray-600">
              Neural networks trained on thousands of games to identify complex patterns and relationships.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-cogs text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Ensemble Method</h3>
            <p className="text-sm text-gray-600">
              Combines predictions from multiple models to improve accuracy and reduce bias.
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold gradient-text mb-6">Historical Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">72%</div>
            <div className="text-sm text-gray-700">Against the Spread</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '72%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">78%</div>
            <div className="text-sm text-gray-700">Moneyline Accuracy</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">65%</div>
            <div className="text-sm text-gray-700">Over/Under</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">83%</div>
            <div className="text-sm text-gray-700">Top 25 Games</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '83%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Factors */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold gradient-text mb-6">Key Input Factors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Team Performance Metrics</h4>
            <div className="space-y-2">
              {[
                'SP+ Offensive & Defensive Ratings',
                'Points Per Game & Points Allowed',
                'Yards Per Play Efficiency',
                'Red Zone Conversion Rates',
                'Turnover Margin',
                'Third Down Conversion %'
              ].map((metric, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  {metric}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Situational Factors</h4>
            <div className="space-y-2">
              {[
                'Home Field Advantage',
                'Recent Form & Momentum',
                'Head-to-Head History',
                'Rest & Travel Factors',
                'Weather Conditions',
                'Conference Game Dynamics'
              ].map((factor, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-blue-500 mr-2"></i>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Scoring */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold gradient-text mb-6">Confidence Scoring System</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-100/70 backdrop-blur-sm rounded-lg border border-green-200/50">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-green-800">High Confidence (80%+)</div>
              <div className="text-sm text-green-700">
                Strong model agreement, large talent gaps, extensive data
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-yellow-100/70 backdrop-blur-sm rounded-lg border border-yellow-200/50">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-yellow-800">Medium Confidence (60-79%)</div>
              <div className="text-sm text-yellow-700">
                Moderate model agreement, reasonable data quality
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-red-100/70 backdrop-blur-sm rounded-lg border border-red-200/50">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-red-800">Lower Confidence (40-59%)</div>
              <div className="text-sm text-red-700">
                Mixed signals, limited data, high uncertainty
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePredictor;
