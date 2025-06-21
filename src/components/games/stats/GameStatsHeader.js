import React from 'react';

const GameStatsHeader = ({ 
  game, 
  awayTeam, 
  homeTeam, 
  awayColor, 
  homeColor, 
  animateCards 
}) => {
  const getScore = (isHome) => {
    return isHome ? (game.home_points || 0) : (game.away_points || 0);
  };

  const getTeamName = (isHome) => {
    return isHome ? (game.home_team || 'Home') : (game.away_team || 'Away');
  };

  const getTeamLogo = (teamId) => {
    // Use team_logos directory structure
    return `/team_logos/${teamId}.png`;
  };

  const gameStatus = () => {
    if (game.completed) return 'FINAL';
    if (game.start_time_tbd) return 'TBD';
    return 'SCHEDULED';
  };

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
        transition-all duration-700 ease-out
        ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Game Status Banner */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Game Analysis</h2>
            <p className="text-gray-300 text-sm">
              Week {game.week} • {game.season || new Date().getFullYear()}
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">{gameStatus()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Header */}
      <div className="p-8">
        <div className="flex items-center justify-between">
          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              <img
                src={getTeamLogo(game.away_id)}
                alt={getTeamName(false)}
                className="w-20 h-20 mx-auto object-contain"
                onError={(e) => {
                  e.target.src = '/photos/ncaaf.png';
                }}
              />
            </div>
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ color: awayColor }}
            >
              {getTeamName(false)}
            </h3>
            <div className="text-4xl font-bold text-gray-900">
              {getScore(false)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {game.away_conference || 'FBS'}
            </p>
          </div>

          {/* VS Indicator */}
          <div className="px-8 text-center">
            <div className="text-3xl font-bold text-gray-400 mb-2">VS</div>
            <div className="text-sm text-gray-500">
              {game.neutral_site ? 'Neutral Site' : 
               game.conference_game ? 'Conference' : 'Non-Conference'}
            </div>
            {game.venue && (
              <div className="text-xs text-gray-400 mt-1">
                {game.venue}
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              <img
                src={getTeamLogo(game.home_id)}
                alt={getTeamName(true)}
                className="w-20 h-20 mx-auto object-contain"
                onError={(e) => {
                  e.target.src = '/photos/ncaaf.png';
                }}
              />
            </div>
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ color: homeColor }}
            >
              {getTeamName(true)}
            </h3>
            <div className="text-4xl font-bold text-gray-900">
              {getScore(true)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {game.home_conference || 'FBS'}
            </p>
          </div>
        </div>

        {/* Game Details */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {game.start_date && (
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(game.start_date).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {game.attendance && (
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="font-medium">
                  {game.attendance.toLocaleString()}
                </p>
              </div>
            )}

            {game.excitement_index && (
              <div>
                <p className="text-sm text-gray-500">Excitement</p>
                <p className="font-medium">
                  {(game.excitement_index * 10).toFixed(1)}/10
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Season Type</p>
              <p className="font-medium capitalize">
                {game.season_type || 'Regular'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatsHeader;
