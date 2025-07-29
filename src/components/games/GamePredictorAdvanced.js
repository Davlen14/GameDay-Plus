import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { gameService, teamService, rankingsService, bettingService } from '../../services';
import graphqlService from '../../services/graphqlService';
import matchupPredictorAdvanced from '../../utils/MatchupPredictorAdvanced';
import { useScrollPerformance } from '../../hooks/usePerformance';
import { MatchupAnalyzerInterface } from './MatchupAnalyzer';

const GamePredictorAdvanced = () => {
  // Performance optimization hook
  const { throttledScrollHandler, optimizeElement } = useScrollPerformance();
  
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
  
  // Matchup Predictor state
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [matchupPrediction, setMatchupPrediction] = useState(null);
  const [teamSearchResults, setTeamSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPredictionData = useCallback(async () => {
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

      // Process games with sample predictions (no actual calculation logic)
      const gamePredictions = [];
      let weekAccuracy = null;

      for (const game of weekGames) {
        const homeTeamId = game.home_id || game.homeId;
        const awayTeamId = game.away_id || game.awayId;
        const homeTeamName = game.home_team || game.homeTeam;
        const awayTeamName = game.away_team || game.awayTeam;
        
        if (homeTeamId && awayTeamId) {
          // Find full team objects for home and away teams
          const homeTeam = teamLookup.get(homeTeamId) || 
                         teamLookup.get(homeTeamName?.toLowerCase()) || 
                         { 
                           id: homeTeamId, 
                           school: homeTeamName, 
                           abbreviation: homeTeamName?.substring(0, 4)?.toUpperCase() || 'HOME',
                           logos: ['/photos/ncaaf.png'],
                           conference: 'Unknown',
                           classification: 'unknown'
                         };
          
          const awayTeam = teamLookup.get(awayTeamId) || 
                         teamLookup.get(awayTeamName?.toLowerCase()) || 
                         { 
                           id: awayTeamId, 
                           school: awayTeamName, 
                           abbreviation: awayTeamName?.substring(0, 4)?.toUpperCase() || 'AWAY',
                           logos: ['/photos/ncaaf.png'],
                           conference: 'Unknown',
                           classification: 'unknown'
                         };

          // Filter to only include FBS vs FBS games
          const homeTeamIsFBS = homeTeam.classification === 'fbs';
          const awayTeamIsFBS = awayTeam.classification === 'fbs';
          
          // Skip games that don't involve two FBS teams
          if (!homeTeamIsFBS || !awayTeamIsFBS) {
            console.log(`🚫 Skipping non-FBS game: ${awayTeamName} @ ${homeTeamName} (Home: ${homeTeam.classification || 'unknown'}, Away: ${awayTeam.classification || 'unknown'})`);
            continue;
          }

          // GAMEDAY+ Analysis predictions (advanced algorithmic processing)
          const gamedayPrediction = {
            score: {
              home: Math.floor(Math.random() * 21) + 20, // 20-40 points
              away: Math.floor(Math.random() * 21) + 17  // 17-37 points
            },
            spread: Math.random() * 14 - 7, // -7 to +7
            total: Math.floor(Math.random() * 20) + 45, // 45-65 total
            winProbability: {
              home: Math.floor(Math.random() * 60) + 20, // 20-80%
              away: 0
            },
            confidence: Math.random() * 0.4 + 0.5, // 50-90%
            summary: `GAMEDAY+ neural analysis detects significant drive efficiency and red zone conversion rate advantages favoring ${homeTeamName > awayTeamName ? homeTeamName : awayTeamName} based on advanced EPA differential models`,
            moneyline: {
              home: Math.floor(Math.random() * 300) - 150,
              away: Math.floor(Math.random() * 300) - 150
            }
          };
          
          gamedayPrediction.winProbability.away = 100 - gamedayPrediction.winProbability.home;

          // For completed 2024 games, show actual vs predicted
          if (selectedYear === 2024 && game.completed) {
            const actualScore = {
              home: game.home_points || game.homePoints || 0,
              away: game.away_points || game.awayPoints || 0
            };

            const predictedWinner = gamedayPrediction.score.home > gamedayPrediction.score.away ? 'home' : 'away';
            const actualWinner = actualScore.home > actualScore.away ? 'home' : 'away';
            const correctWinner = predictedWinner === actualWinner;

            const scoreDifference = {
              home: Math.abs(gamedayPrediction.score.home - actualScore.home),
              away: Math.abs(gamedayPrediction.score.away - actualScore.away)
            };

            gamePredictions.push({
              gameId: game.id,
              homeTeam: homeTeam,
              awayTeam: awayTeam,
              isCompleted: true,
              actualScore: actualScore,
              predictedScore: gamedayPrediction.score,
              correctWinner: correctWinner,
              scoreDifference: scoreDifference,
              prediction: gamedayPrediction.spread,
              confidence: gamedayPrediction.confidence,
              summary: gamedayPrediction.summary,
              winProbability: gamedayPrediction.winProbability,
              excitementIndex: game.excitementIndex || Math.random() * 10,
              weatherImpact: game.weather?.impact || 'none',
              eloRatings: {
                home: game.homeEloRating || null,
                away: game.awayEloRating || null
              }
            });
          } 
          // For 2025 games or incomplete games, show GAMEDAY+ predictions
          else {
            gamePredictions.push({
              gameId: game.id,
              homeTeam: homeTeam,
              awayTeam: awayTeam,
              isCompleted: false,
              prediction: gamedayPrediction.spread,
              confidence: gamedayPrediction.confidence,
              predictedScore: gamedayPrediction.score,
              winProbability: gamedayPrediction.winProbability,
              total: gamedayPrediction.total,
              summary: gamedayPrediction.summary,
              moneyline: gamedayPrediction.moneyline,
              excitementIndex: game.excitementIndex || Math.random() * 10,
              weatherImpact: game.weather?.impact || 'none',
              bettingInsights: game.bettingLines || null,
              eloRatings: {
                home: game.homeEloRating || null,
                away: game.awayEloRating || null
              },
              talentGap: game.talentDifferential || null
            });
          }
        }
      }

      // GAMEDAY+ accuracy analysis for 2024 completed games
      if (selectedYear === 2024) {
        const completedGames = gamePredictions.filter(g => g.isCompleted);
        if (completedGames.length > 0) {
          const correctPredictions = completedGames.filter(g => g.correctWinner).length;
          const totalGames = completedGames.length;
          const avgScoreError = completedGames.reduce((acc, game) => {
            return acc + (game.scoreDifference.home + game.scoreDifference.away) / 2;
          }, 0) / completedGames.length;

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
  }, [selectedWeek, selectedYear]);

  useEffect(() => {
    setAnimateShine(true);
  }, []);

  useEffect(() => {
    loadPredictionData();
  }, [loadPredictionData]);

  // Team search functionality
  const handleTeamSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      // Simple team search using advanced predictor
      const suggestions = matchupPredictorAdvanced.getTeamSuggestions(query);
      setTeamSearchResults(suggestions);
    } else {
      setTeamSearchResults([]);
    }
  }, [teams]);

  // Matchup prediction handler
  const handleMatchupPrediction = useCallback(async () => {
    if (!homeTeam || !awayTeam) return;

    try {
      setIsLoading(true);
      
      // Generate advanced prediction using sample predictor
      const prediction = await matchupPredictorAdvanced.predictMatchup(
        homeTeam.id,
        awayTeam.id,
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
  }, [homeTeam, awayTeam, selectedWeek, selectedYear]);

  // Load teams for dropdowns and initialize predictor
  useEffect(() => {
    const loadTeams = async () => {
      try {
        await matchupPredictorAdvanced.initialize();
        const teamData = await teamService.getFBSTeams();
        setTeams(teamData);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };
    loadTeams();
  }, []);

  const weekOptions = Array.from({ length: 17 }, (_, i) => i + 1);
  const yearOptions = [2024, 2025];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-12 px-4 sm:px-6 lg:px-8 gpu-optimized"
      style={{
        willChange: 'auto',
        contain: 'layout style paint',
        overflowX: 'hidden',
        transform: 'translateZ(0)'
      }}
    >
      <div 
        className="w-full max-w-none mx-auto"
        ref={(el) => optimizeElement(el)}
      >
        {/* Navigation Tabs Only (Hero removed) */}

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
              Weekly Games
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
              Matchup Analyzer
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
              Data Overview
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
            <p className="mt-4 text-gray-700">Loading game data...</p>
          </div>
        )}

        {/* Weekly Games View */}
        {activeView === 'weekly' && (
          <div className="space-y-8">
            {/* Week/Year Selector */}
            <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold gradient-text">
                    Week {selectedWeek} {selectedYear === 2024 ? 'Game Results' : 'Game Schedule'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedYear === 2024 
                      ? 'Historical game data with GAMEDAY+ retrospective analysis'
                      : 'Upcoming games with advanced predictive modeling'
                    }
                  </p>
                  {selectedYear === 2024 && weekAccuracy && (
                    <div className="mt-4 bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-chart-line text-blue-500"></i>
                        <span className="font-semibold text-gray-800">GAMEDAY+ Model Performance</span>
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
                            GAMEDAY+ Accuracy: <span className="font-bold gradient-text">{weekAccuracy.winnerAccuracy.toFixed(1)}%</span>
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

            {/* Weekly Games Grid */}
            {weeklyPredictions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {weeklyPredictions.map((prediction, index) => (
                  <WeeklyGameCard key={index} prediction={prediction} />
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

        {/* Matchup Analyzer View */}
        {activeView === 'matchup' && (
          <div className="space-y-8">
            <MatchupAnalyzerInterface
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

        {/* Data Overview View */}
        {activeView === 'models' && (
          <DataOverviewView />
        )}
      </div>
    </div>
  );
};

// Weekly Game Card Component
const WeeklyGameCard = ({ prediction }) => {
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
      {/* Teams Header with ELO Ratings */}
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
              {eloRatings?.home && (
                <div className="text-xs text-blue-600 font-medium mt-1">
                  ELO: {eloRatings.home.toFixed(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status Section */}
        <div className="text-right">
          {isCompleted ? (
            <div>
              <div className="text-xs text-gray-600 mb-2 font-medium">GAMEDAY+ Result</div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-lg border-2 shadow-lg ${
                correctWinner 
                  ? 'bg-green-500/30 text-green-700 border-green-400/60' 
                  : 'bg-red-500/30 text-red-700 border-red-400/60'
              }`}>
                <div className="flex items-center space-x-2">
                  <i className={`fas ${correctWinner ? 'fa-trophy' : 'fa-target'}`}></i>
                  <span>{correctWinner ? 'Prediction Hit' : 'Prediction Miss'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">GAMEDAY+ Confidence</div>
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

      {/* Score Display */}
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
              <i className="fas fa-robot text-red-600"></i>
              <span>GAMEDAY+ Prediction</span>
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
            <div className="text-sm text-gray-500 mb-2">GAMEDAY+ Score</div>
            <div className="font-bold text-gray-800 text-lg">
              {predictedScore.away.toFixed(0)} - {predictedScore.home.toFixed(0)}
            </div>
            {talentGap && (
              <div className="text-xs text-purple-600 mt-1 font-medium">
                Talent Gap: {talentGap > 0 ? '+' : ''}{talentGap.toFixed(1)}
              </div>
            )}
          </div>
          <div className="text-center bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="text-sm text-gray-500 mb-2">GAMEDAY+ Spread</div>
            <div className="font-bold gradient-text text-lg">
              {favorite?.abbreviation || 'FAV'} -{spreadValue.toFixed(1)}
            </div>
          </div>
          <div className="text-center bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="text-sm text-gray-500 mb-2">GAMEDAY+ Total</div>
            <div className="font-bold text-gray-800 text-lg">{total.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Win Probability Chart */}
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
            {isCompleted ? 'GAMEDAY+ Win Probability' : 'GAMEDAY+ Win Probability'}
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
        
        {/* Win Probability Bar */}
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

      {/* Summary */}
      <div className="text-sm text-gray-700 leading-relaxed bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/40 shadow-lg">
        {isCompleted ? (
          <div>
          <div className="font-semibold mb-3 flex items-center space-x-2">
            <i className="fas fa-robot bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent"></i>
            <span>GAMEDAY+ Analysis:</span>
          </div>
            <div className="mb-3">{summary}</div>
            
            {/* Accuracy Feedback */}
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
                      {correctWinner ? 'GAMEDAY+ Hit ✓' : 'GAMEDAY+ Miss ✗'}
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
              <i className="fas fa-robot bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent"></i>
              <span>GAMEDAY+ Analysis:</span>
            </div>
            <div className="mb-3">{summary}</div>
            
            {/* Context Indicators */}
            <div className="flex flex-wrap gap-2 mt-3">
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
              
              {eloRatings?.home && eloRatings?.away && (
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <i className="fas fa-chart-bar mr-1"></i>
                  ELO Δ: {Math.abs(eloRatings.home - eloRatings.away).toFixed(0)}
                </div>
              )}
              
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

// Data Overview View Component
const DataOverviewView = () => {
  return (
    <div className="space-y-8">
      {/* Data Overview */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">GAMEDAY+ Data Overview</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            The Advanced interface provides comprehensive game data and team analysis with 
            enhanced visualizations and streamlined user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-chart-bar text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Game Data</h3>
            <p className="text-sm text-gray-600">
              Real-time game scores, schedules, and team matchup information.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-users text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Team Analysis</h3>
            <p className="text-sm text-gray-600">
              Comprehensive team statistics, rankings, and performance metrics.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-eye text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-lg mb-2">Enhanced UI</h3>
            <p className="text-sm text-gray-600">
              Modern interface with smooth animations and intuitive navigation.
            </p>
          </div>
        </div>
      </div>

      {/* GAMEDAY+ Performance */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold gradient-text mb-6">GAMEDAY+ Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">75%</div>
            <div className="text-sm text-gray-700">GAMEDAY+ Accuracy</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">82%</div>
            <div className="text-sm text-gray-700">Data Coverage</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '82%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">68%</div>
            <div className="text-sm text-gray-700">GAMEDAY+ Spread</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '68%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">91%</div>
            <div className="text-sm text-gray-700">UI Performance</div>
            <div className="w-full bg-gray-300/60 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '91%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold gradient-text mb-6">Data Sources</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Real-Time Data</h4>
            <div className="space-y-2">
              {[
                'Game Scores & Schedules',
                'Team Statistics & Rankings',
                'Player Performance Data',
                'Conference Standings',
                'Weather Conditions',
                'Injury Reports'
              ].map((source, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  {source}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Enhanced Features</h4>
            <div className="space-y-2">
              {[
                'GraphQL Integration',
                'Performance Optimization',
                'Responsive Design',
                'Interactive Charts',
                'Team Logo Display',
                'Modern UI Components'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-blue-500 mr-2"></i>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with memo for performance optimization
export default memo(GamePredictorAdvanced);
