import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { gameService } from '../../services';
import VirtualScrollList from '../UI/VirtualScrollList';
import OptimizedGameCard from '../UI/OptimizedGameCard';
import LazyImage from '../UI/LazyImage';

const OptimizedSchedule = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isPostseason, setIsPostseason] = useState(false);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize week options to prevent re-renders
  const weekOptions = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => i + 1);
  }, []);

  // Optimized game loading with caching
  const loadGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cacheKey = `games-${selectedYear}-${selectedWeek}-${isPostseason}`;
      
      // Check for cached data first
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        setGames(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }

      let loadedGames = [];
      if (isPostseason) {
        loadedGames = await gameService.getPostseasonGames(selectedYear, false);
      } else {
        loadedGames = await gameService.getGamesByWeek(selectedYear, selectedWeek, 'regular', false);
      }
      
      // Cache the data
      sessionStorage.setItem(cacheKey, JSON.stringify(loadedGames || []));
      setGames(loadedGames || []);
    } catch (err) {
      console.error('Error loading games:', err);
      setError('Failed to load games. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedWeek, isPostseason]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Optimized game card renderer for virtual scrolling
  const renderGameCard = useCallback((game, index) => (
    <OptimizedGameCard
      key={game.id || index}
      game={game}
      onClick={(game) => {
        window.location.hash = `#game-detail-${game.id}`;
      }}
      className="mx-4 mb-4"
    />
  ), []);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4 px-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 gpu-optimized">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              {selectedYear} Schedule
            </h1>
            <p className="text-gray-600">
              {isPostseason ? 'Bowl Games & Playoffs' : `Week ${selectedWeek} Games`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>

            {/* Week/Postseason Toggle */}
            <button
              onClick={() => setIsPostseason(!isPostseason)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isPostseason
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isPostseason ? 'Bowl Games' : 'Regular Season'}
            </button>

            {/* Week Selector (only for regular season) */}
            {!isPostseason && (
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {weekOptions.map(week => (
                  <option key={week} value={week}>Week {week}</option>
                ))}
              </select>
            )}

            {/* Refresh Button */}
            <button
              onClick={loadGames}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-sync-alt"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton />
        ) : games.length === 0 ? (
          <div className="text-center py-20">
            <i className="fas fa-calendar-times text-6xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Games Found</h3>
            <p className="text-gray-600">
              {isPostseason 
                ? 'No bowl games or playoff games found for this year.'
                : `No games found for Week ${selectedWeek} of ${selectedYear}.`
              }
            </p>
          </div>
        ) : (
          // Use virtual scrolling for large lists
          games.length > 20 ? (
            <VirtualScrollList
              items={games}
              renderItem={renderGameCard}
              itemHeight={180}
              containerHeight={800}
              className="bg-transparent"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game, index) => renderGameCard(game, index))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OptimizedSchedule;
