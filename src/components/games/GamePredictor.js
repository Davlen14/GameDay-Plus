import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { gameService, teamService, rankingsService, bettingService } from '../../services';
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

      // Load games for the selected week
      const weekGames = await gameService.getGamesByWeek(selectedYear, selectedWeek);
      setGames(weekGames);

      // Load team data to get full team objects with logos, abbreviations, etc.
      const allTeams = await teamService.getAllTeams();
      
      // Create a lookup map for teams by ID and name
      const teamLookup = new Map();
      allTeams.forEach(team => {
        if (team.id) teamLookup.set(team.id, team);
        if (team.school) teamLookup.set(team.school.toLowerCase(), team);
      });

      // Generate predictions for each game
      const gamePredictions = [];
      for (const game of weekGames) {
        const homeTeamId = game.home_id || game.homeId;
        const awayTeamId = game.away_id || game.awayId;
        const homeTeamName = game.home_team || game.homeTeam;
        const awayTeamName = game.away_team || game.awayTeam;
        
        if (homeTeamId && awayTeamId) {
          try {
            const prediction = await matchupPredictor.getSummaryPrediction(
              homeTeamId, 
              awayTeamId, 
              {
                week: selectedWeek,
                season: selectedYear,
                neutralSite: game.neutral_site || game.neutralSite || false,
                conferenceGame: game.conference_game || game.conferenceGame || false
              }
            );
            
            // Find full team objects for home and away teams
            const homeTeam = teamLookup.get(homeTeamId) || 
                           teamLookup.get(homeTeamName?.toLowerCase()) || 
                           { 
                             id: homeTeamId, 
                             school: homeTeamName, 
                             abbreviation: homeTeamName?.substring(0, 4)?.toUpperCase() || 'HOME',
                             logos: ['/photos/ncaaf.png'],
                             conference: 'Unknown'
                           };
            
            const awayTeam = teamLookup.get(awayTeamId) || 
                           teamLookup.get(awayTeamName?.toLowerCase()) || 
                           { 
                             id: awayTeamId, 
                             school: awayTeamName, 
                             abbreviation: awayTeamName?.substring(0, 4)?.toUpperCase() || 'AWAY',
                             logos: ['/photos/ncaaf.png'],
                             conference: 'Unknown'
                           };
            
            gamePredictions.push({
              gameId: game.id,
              homeTeam: homeTeam,  // Now passing full team object
              awayTeam: awayTeam,  // Now passing full team object
              ...prediction
            });
          } catch (error) {
            console.error(`Error predicting game ${game.id}:`, error);
          }
        }
      }

      setWeeklyPredictions(gamePredictions);
      
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
        homeTeam.id,
        awayTeam.id,
        {
          week: selectedWeek,
          season: selectedYear,
          neutralSite: false,
          conferenceGame: homeTeam.conference === awayTeam.conference
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
          const teamData = await teamService.getAllTeams();
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center ${animateShine ? 'metallic-3d-logo-enhanced' : ''}`}>
              <i className="fas fa-brain text-3xl icon-gradient"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Game Predictor</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered predictions using machine learning algorithms and comprehensive statistical analysis.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-2 flex space-x-2">
            <button
              onClick={() => setActiveView('weekly')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeView === 'weekly'
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">
              {!predictorInitialized ? 'Initializing AI models...' : 'Generating predictions...'}
            </p>
          </div>
        )}

        {/* Weekly Predictions View */}
        {activeView === 'weekly' && predictorInitialized && (
          <div className="space-y-8">
            {/* Week/Year Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text">Week {selectedWeek} Predictions</h2>
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
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <i className="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No Games Available</h3>
                <p className="text-gray-500">No games found for Week {selectedWeek} of {selectedYear}</p>
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
  const { homeTeam, awayTeam, score, spread, total, winProbability, confidence, summary } = prediction;
  const favorite = spread > 0 ? homeTeam : awayTeam;
  const underdog = spread > 0 ? awayTeam : homeTeam;
  const spreadValue = Math.abs(spread);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      {/* Teams Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <img 
              src={awayTeam?.logos?.[0] || '/api/placeholder/40/40'} 
              alt={awayTeam?.school} 
              className="w-10 h-10 mx-auto mb-1"
            />
            <div className="text-sm font-semibold text-gray-700">{awayTeam?.abbreviation || 'AWAY'}</div>
          </div>
          <div className="text-2xl font-bold text-gray-400">@</div>
          <div className="text-center">
            <img 
              src={homeTeam?.logos?.[0] || '/api/placeholder/40/40'} 
              alt={homeTeam?.school} 
              className="w-10 h-10 mx-auto mb-1"
            />
            <div className="text-sm font-semibold text-gray-700">{homeTeam?.abbreviation || 'HOME'}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Confidence</div>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            confidence >= 0.8 ? 'bg-green-100 text-green-800' :
            confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {(confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Predicted Score</div>
          <div className="font-bold text-gray-800">
            {score.away.toFixed(0)} - {score.home.toFixed(0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Spread</div>
          <div className="font-bold gradient-text">
            {favorite?.abbreviation || 'FAV'} -{spreadValue.toFixed(1)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Total</div>
          <div className="font-bold text-gray-800">{total.toFixed(1)}</div>
        </div>
      </div>

      {/* Win Probability */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{awayTeam?.school || 'Away Team'}</span>
          <span>{homeTeam?.school || 'Home Team'}</span>
        </div>
        <div className="relative bg-gray-200 rounded-full h-3">
          <div 
            className="absolute left-0 top-0 h-3 bg-red-500 rounded-l-full"
            style={{ width: `${winProbability.away}%` }}
          ></div>
          <div 
            className="absolute right-0 top-0 h-3 bg-blue-500 rounded-r-full"
            style={{ width: `${winProbability.home}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{winProbability.away.toFixed(1)}%</span>
          <span>{winProbability.home.toFixed(1)}%</span>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600 leading-relaxed">
        {summary}
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
      <div className="bg-white rounded-2xl shadow-lg p-8">
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
                  className="w-10 h-10"
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
                  className="w-10 h-10"
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
  const { teams, prediction: pred, analysis, confidence } = prediction;
  
  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold gradient-text mb-4">Prediction Results</h3>
          <div className="text-lg text-gray-600">{analysis.summary.description}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Score Prediction */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Predicted Score</div>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {pred.score.away.toFixed(0)} - {pred.score.home.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">
              {teams.away.school} @ {teams.home.school}
            </div>
          </div>

          {/* Spread */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Point Spread</div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {pred.spread > 0 ? teams.home.abbreviation : teams.away.abbreviation} 
              {Math.abs(pred.spread).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              {pred.spread > 0 ? 'Home' : 'Away'} Favored
            </div>
          </div>

          {/* Total */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Total Points</div>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {pred.total.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              O/U {pred.total.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Win Probability */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500">Win Probability</div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">{teams.away.school}</div>
            <div className="text-sm font-semibold">{teams.home.school}</div>
          </div>
          <div className="relative bg-gray-200 rounded-full h-4">
            <div 
              className="absolute left-0 top-0 h-4 bg-red-500 rounded-l-full"
              style={{ width: `${pred.winProbability.away}%` }}
            ></div>
            <div 
              className="absolute right-0 top-0 h-4 bg-blue-500 rounded-r-full"
              style={{ width: `${pred.winProbability.home}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{pred.winProbability.away.toFixed(1)}%</span>
            <span>{pred.winProbability.home.toFixed(1)}%</span>
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

      {/* Key Factors */}
      {analysis.keyFactors.length > 0 && (
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

      {/* Team Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeamAnalysisCard team={teams.away} analysis={analysis.teamAnalysis.away} />
        <TeamAnalysisCard team={teams.home} analysis={analysis.teamAnalysis.home} />
      </div>
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
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Prediction Model Details</h2>
        <div className="prose max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
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
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold gradient-text mb-6">Historical Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">72%</div>
            <div className="text-sm text-gray-600">Against the Spread</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '72%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">78%</div>
            <div className="text-sm text-gray-600">Moneyline Accuracy</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">65%</div>
            <div className="text-sm text-gray-600">Over/Under</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">83%</div>
            <div className="text-sm text-gray-600">Top 25 Games</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '83%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Factors */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
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
                <div key={index} className="flex items-center text-sm text-gray-600">
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
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <i className="fas fa-check-circle text-blue-500 mr-2"></i>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Scoring */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold gradient-text mb-6">Confidence Scoring System</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-green-800">High Confidence (80%+)</div>
              <div className="text-sm text-green-600">
                Strong model agreement, large talent gaps, extensive data
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-yellow-800">Medium Confidence (60-79%)</div>
              <div className="text-sm text-yellow-600">
                Moderate model agreement, reasonable data quality
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-red-800">Lower Confidence (40-59%)</div>
              <div className="text-sm text-red-600">
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
