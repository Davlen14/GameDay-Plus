import React, { useState, useEffect, useCallback, useMemo } from 'react';
import gameStatsService from '../../services/gameStatsService';
import GameStatsHeader from './stats/GameStatsHeader';
import GameSummarySection from './stats/GameSummarySection';
import KeyTeamStats from './stats/KeyTeamStats';
import GameImpactPlayers from './stats/GameImpactPlayers';
import GameStatsPPA from './stats/GameStatsPPA';
import LoadingSpinner from '../UI/LoadingSpinner';

const GameStats = ({ game, awayTeam, homeTeam, getTeamColor, getTeamLogo }) => {
  // State management
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false to show debug panel
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedPPASection, setSelectedPPASection] = useState('overall');
  const [animateCards, setAnimateCards] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(true);
  const [testData, setTestData] = useState(null);

  // Extract team names from team objects
  const awayTeamName = useMemo(() => {
    return awayTeam?.school || awayTeam?.name || game?.away_team || 'Away Team';
  }, [awayTeam, game?.away_team]);

  const homeTeamName = useMemo(() => {
    return homeTeam?.school || homeTeam?.name || game?.home_team || 'Home Team';
  }, [homeTeam, game?.home_team]);

  // Team colors with fallback using team IDs (like GameDetailView)
  const awayColor = useMemo(() => {
    if (getTeamColor && game?.away_id) {
      return getTeamColor(game.away_id);
    }
    return '#3B82F6';
  }, [getTeamColor, game?.away_id]);

  const homeColor = useMemo(() => {
    if (getTeamColor && game?.home_id) {
      return getTeamColor(game.home_id);
    }
    return '#EF4444';
  }, [getTeamColor, game?.home_id]);

  // Fetch game statistics
  const fetchGameStats = useCallback(async () => {
    if (!game?.id) {
      setDebugInfo('❌ No game ID provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDebugInfo(`🔄 Fetching stats for game ID: ${game.id}`);
      
      const stats = await gameStatsService.getGameStats(game.id, {
        useCache: retryCount === 0,
        retryCount: 0
      });
      
      setGameStats(stats);
      setDebugInfo(`✅ Stats loaded: ${JSON.stringify(stats, null, 2)}`);
      
      // Trigger card animations after data loads
      setTimeout(() => setAnimateCards(true), 100);
      
    } catch (err) {
      console.error('Failed to fetch game stats:', err);
      setError(err.message || 'Failed to load game statistics');
      setDebugInfo(`❌ Error: ${err.message || 'Failed to load game statistics'}`);
    } finally {
      setLoading(false);
    }
  }, [game?.id, retryCount]);

  // Test function with mock data
  const testWithMockData = () => {
    setDebugInfo('🧪 Loading mock data...');
    const mockStats = {
      teamStats: [
        {
          school: homeTeamName,
          totalYards: 445,
          netPassingYards: 285,
          rushingYards: 160,
          firstDowns: 24,
          thirdDownEff: '8-15',
          possessionTime: '32:15',
          points: 28
        },
        {
          school: awayTeamName, 
          totalYards: 392,
          netPassingYards: 247,
          rushingYards: 145,
          firstDowns: 21,
          thirdDownEff: '6-14',
          possessionTime: '27:45',
          points: 21
        }
      ],
      playerStats: [
        {
          team: homeTeamName,
          player: 'Test QB',
          category: 'passing',
          stat: 285
        },
        {
          team: awayTeamName,
          player: 'Test QB2', 
          category: 'passing',
          stat: 247
        }
      ],
      gamePPA: null,
      playerPPA: []
    };
    setGameStats(mockStats);
    setTestData(mockStats);
    setAnimateCards(true);
    setDebugInfo(`✅ Mock data loaded: ${JSON.stringify(mockStats, null, 2)}`);
  };

  // Effect to fetch data
  useEffect(() => {
    fetchGameStats();
  }, [fetchGameStats]);

  // Retry function
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchGameStats();
  }, [fetchGameStats]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="large" />
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Game Statistics</h3>
          <p className="text-gray-600">Analyzing team performance and player stats...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !gameStats) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-exclamation-triangle text-3xl text-red-600"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Statistics</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <i className="fas fa-redo mr-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  // No game data
  if (!game) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-chart-bar text-3xl text-gray-400"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No Game Selected</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Select a game to view detailed statistics and analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-yellow-800">🔧 Debug Panel</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✖
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Game Data:</strong> {game ? `ID: ${game.id}, ${awayTeamName} @ ${homeTeamName}` : 'No game data'}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={fetchGameStats}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 Fetch Real Data
              </button>
              
              <button
                onClick={testWithMockData}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                🧪 Load Mock Data
              </button>
              
              <button
                onClick={() => setGameStats(null)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                🗑️ Clear Data
              </button>
            </div>
            
            <div className="text-sm">
              <strong>Stats Loaded:</strong> {gameStats ? '✅ Yes' : '❌ No'}
            </div>
            
            {gameStats && (
              <div className="text-sm">
                <strong>Team Stats:</strong> {gameStats.teamStats?.length || 0} teams, 
                <strong> Player Stats:</strong> {gameStats.playerStats?.length || 0} players
              </div>
            )}
            
            <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
              <strong>Debug Info:</strong><br />
              <pre>{debugInfo}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <GameStatsHeader 
        game={game}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayColor={awayColor}
        homeColor={homeColor}
        animateCards={animateCards}
        getTeamLogo={getTeamLogo}
      />

      {/* Statistics Content */}
      <div className="space-y-6 mt-8">
        {/* Key Stats Comparison */}
        {gameStats?.teamStats && (
          <KeyTeamStats
            game={game}
            teamStats={gameStats.teamStats}
            awayColor={awayColor}
            homeColor={homeColor}
            getTeamLogo={getTeamLogo}
            animateCards={animateCards}
            awayTeam={awayTeamName}
            homeTeam={homeTeamName}
          />
        )}

        {/* Game Summary Analysis */}
        {gameStats && (
          <GameSummarySection
            game={game}
            gameStats={gameStats}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            awayColor={awayColor}
            homeColor={homeColor}
            getTeamLogo={getTeamLogo}
            animateCards={animateCards}
          />
        )}

        {/* Impact Players */}
        {gameStats?.playerStats && (
          <GameImpactPlayers
            game={game}
            playerGameStats={gameStats.playerStats}
            awayTeam={awayTeam}
            homeTeam={homeTeam}
            awayColor={awayColor}
            homeColor={homeColor}
            getTeamLogo={getTeamLogo}
            animateCards={animateCards}
          />
        )}

        {/* Advanced PPA Analytics */}
        {gameStats?.gamePPA && (
          <GameStatsPPA
            game={game}
            gamePPA={gameStats.gamePPA}
            playerGamePPA={gameStats.playerPPA || []}
            selectedPPASection={selectedPPASection}
            setSelectedPPASection={setSelectedPPASection}
            awayColor={awayColor}
            homeColor={homeColor}
            getTeamLogo={getTeamLogo}
            animateCards={animateCards}
          />
        )}
      </div>

      {/* Error Messages for Partial Failures */}
      {gameStats?.errors && gameStats.errors.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3"></i>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Some statistics could not be loaded:
              </h4>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {gameStats.errors.map((err, index) => (
                  <li key={index}>{err.api}: {err.error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;
