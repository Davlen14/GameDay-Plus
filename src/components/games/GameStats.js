import React, { useState, useEffect, useCallback, useMemo } from 'react';
import gameStatsService from '../../services/gameStatsService';
import GameStatsHeader from './stats/GameStatsHeader';
import GameSummarySection from './stats/GameSummarySection';
import KeyTeamStats from './stats/KeyTeamStats';
import GameImpactPlayers from './stats/GameImpactPlayers';
import GameStatsPPA from './stats/GameStatsPPA';
import LoadingSpinner from '../UI/LoadingSpinner';

const GameStats = ({ game, awayTeam, homeTeam, getTeamColor }) => {
  // State management
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedPPASection, setSelectedPPASection] = useState('overall');
  const [animateCards, setAnimateCards] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Team colors with fallback
  const awayColor = useMemo(() => {
    return getTeamColor ? getTeamColor(game?.away_id) || '#3B82F6' : '#3B82F6';
  }, [getTeamColor, game?.away_id]);

  const homeColor = useMemo(() => {
    return getTeamColor ? getTeamColor(game?.home_id) || '#EF4444' : '#EF4444';
  }, [getTeamColor, game?.home_id]);

  // Fetch game statistics
  const fetchGameStats = useCallback(async () => {
    if (!game?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const stats = await gameStatsService.getGameStats(game.id, {
        useCache: retryCount === 0,
        retryCount: 0
      });
      
      setGameStats(stats);
      
      // Trigger card animations after data loads
      setTimeout(() => setAnimateCards(true), 100);
      
    } catch (err) {
      console.error('Failed to fetch game stats:', err);
      setError(err.message || 'Failed to load game statistics');
    } finally {
      setLoading(false);
    }
  }, [game?.id, retryCount]);

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
      {/* Game Header */}
      <GameStatsHeader 
        game={game}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        awayColor={awayColor}
        homeColor={homeColor}
        animateCards={animateCards}
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
            animateCards={animateCards}
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
            animateCards={animateCards}
          />
        )}

        {/* Impact Players */}
        {gameStats?.playerStats && (
          <GameImpactPlayers
            game={game}
            playerGameStats={gameStats.playerStats}
            awayColor={awayColor}
            homeColor={homeColor}
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
