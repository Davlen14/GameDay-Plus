import React, { memo, useMemo } from 'react';
import LazyImage from '../UI/LazyImage';

const OptimizedGameCard = memo(({ game, onClick, className = '' }) => {
  // Memoize complex calculations
  const gameStatus = useMemo(() => {
    if (game.completed) return 'FINAL';
    if (game.start_date) {
      const now = new Date();
      const gameDate = new Date(game.start_date);
      return gameDate > now ? 'UPCOMING' : 'LIVE';
    }
    return 'TBD';
  }, [game.completed, game.start_date]);

  const teamLogos = useMemo(() => ({
    away: game.away_team_logo || '/photos/ncaaf.png',
    home: game.home_team_logo || '/photos/ncaaf.png'
  }), [game.away_team_logo, game.home_team_logo]);

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer gpu-optimized ${className}`}
      onClick={() => onClick?.(game)}
      style={{ 
        willChange: 'transform', 
        contain: 'layout style paint' 
      }}
    >
      {/* Game Status */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            gameStatus === 'LIVE' ? 'bg-red-100 text-red-800' :
            gameStatus === 'FINAL' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {gameStatus}
          </span>
          {game.week && (
            <span className="text-gray-500 text-sm">Week {game.week}</span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LazyImage
                src={teamLogos.away}
                alt={game.away_team}
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold text-gray-900">
                {game.away_team}
              </span>
            </div>
            {game.away_points !== undefined && (
              <span className="text-xl font-bold text-gray-900">
                {game.away_points}
              </span>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LazyImage
                src={teamLogos.home}
                alt={game.home_team}
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold text-gray-900">
                {game.home_team}
              </span>
            </div>
            {game.home_points !== undefined && (
              <span className="text-xl font-bold text-gray-900">
                {game.home_points}
              </span>
            )}
          </div>
        </div>

        {/* Game Details */}
        {(game.venue || game.start_date) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600 space-y-1">
              {game.venue && (
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2 w-3"></i>
                  {game.venue}
                </div>
              )}
              {game.start_date && (
                <div className="flex items-center">
                  <i className="fas fa-clock mr-2 w-3"></i>
                  {new Date(game.start_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedGameCard.displayName = 'OptimizedGameCard';

export default OptimizedGameCard;
