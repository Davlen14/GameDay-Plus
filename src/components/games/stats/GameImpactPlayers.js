import React, { useState, useEffect } from 'react';
import gameStatsService from '../../../services/gameStatsService';

const GameImpactPlayers = ({ 
  game, 
  playerGameStats, 
  awayColor, 
  homeColor,
  awayColorRgb,
  homeColorRgb,
  animateCards 
}) => {
  const [showOffense, setShowOffense] = useState(true);
  const [animateHype, setAnimateHype] = useState(false);

  // Categories for each side
  const offenseCategories = ['passing', 'rushing', 'receiving'];
  const defenseCategories = ['defensive'];

  useEffect(() => {
    if (animateCards) {
      setAnimateHype(true);
    }
  }, [animateCards]);

  // Helper functions
  const getImpactStars = (isHome, category) => {
    const teamName = isHome ? game.home_team : game.away_team;
    
    const teamPlayers = playerGameStats.filter(player => 
      player.team === teamName && player.category === category
    );

    if (teamPlayers.length === 0) return null;

    // Sort by numeric value descending
    return teamPlayers.sort((a, b) => (b.stat || 0) - (a.stat || 0));
  };

  const formatPlayerName = (name) => {
    if (!name) return 'Unknown Player';
    if (name.includes(',')) {
      const parts = name.split(',').map(part => part.trim());
      return parts.length >= 2 ? `${parts[1]} ${parts[0]}` : name;
    }
    return name;
  };

  const getStatUnit = (category) => {
    switch (category) {
      case 'passing':
      case 'rushing': 
      case 'receiving':
        return 'YDS';
      case 'defensive':
        return 'TCKL';
      default:
        return 'STAT';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'passing':
        return 'football';
      case 'rushing':
        return 'running';
      case 'receiving':
        return 'hands-catching';
      case 'defensive':
        return 'shield-alt';
      default:
        return 'user';
    }
  };

  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const PlayerStarCard = ({ player, teamColor, alignment = 'left' }) => {
    if (!player) {
      return (
        <div className="text-center py-8 px-4">
          <i className="fas fa-user-slash text-2xl text-gray-300 mb-2"></i>
          <p className="text-sm text-gray-500">No player data</p>
        </div>
      );
    }

    const isExceptional = (stat, category) => {
      const value = stat || 0;
      switch (category) {
        case 'passing': return value > 250;
        case 'rushing': return value > 100;
        case 'receiving': return value > 100;
        case 'defensive': return value > 8;
        default: return false;
      }
    };

    const exceptional = isExceptional(player.stat, player.category);

    return (
      <div 
        className={`
          bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300
          ${exceptional ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-white' : ''}
        `}
      >
        <div className={`text-${alignment}`}>
          {/* Player Name */}
          <h4 className="font-bold text-lg text-gray-900 mb-1">
            {formatPlayerName(player.name)}
          </h4>
          
          {/* Position */}
          <div className="mb-3">
            <span 
              className="inline-block px-2 py-1 text-xs font-medium rounded"
              style={{ 
                backgroundColor: `${teamColor}20`,
                color: teamColor 
              }}
            >
              {player.position || 'N/A'}
            </span>
          </div>

          {/* Main Stat */}
          <div className="flex items-baseline space-x-1 mb-2">
            <span 
              className="text-3xl font-bold"
              style={{ color: teamColor }}
            >
              {player.stat || 0}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {getStatUnit(player.category)}
            </span>
          </div>

          {/* Additional Stats */}
          <div className="flex flex-wrap gap-1">
            {/* Find related stats for this player */}
            {playerGameStats
              .filter(stat => 
                stat.name === player.name && 
                stat.team === player.team &&
                stat.category === player.category &&
                stat.stat_type !== player.stat_type
              )
              .slice(0, 3)
              .map((additionalStat, index) => (
                <div 
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded text-xs"
                >
                  <span className="font-medium">{additionalStat.stat || 0}</span>
                  <span className="text-gray-600 ml-1">
                    {additionalStat.stat_type?.toUpperCase() || 'STAT'}
                  </span>
                </div>
              ))
            }
          </div>

          {/* Exceptional indicator */}
          {exceptional && (
            <div className="mt-2 flex items-center text-yellow-600">
              <i className="fas fa-star text-xs mr-1"></i>
              <span className="text-xs font-medium">Elite Performance</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CategorySection = ({ category }) => {
    const homeStars = getImpactStars(true, category);
    const awayStars = getImpactStars(false, category);
    
    // Show section even if one team has no data
    const hasData = (homeStars && homeStars.length > 0) || (awayStars && awayStars.length > 0);
    
    if (!hasData) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${awayColor}20, ${homeColor}20)`
              }}
            >
              <i className={`fas fa-${getCategoryIcon(category)} text-gray-700`}></i>
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              {formatCategory(category)}
            </h4>
          </div>
        </div>

        {/* Team Matchup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Away Team */}
          <div>
            <div className="flex items-center mb-4">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: awayColor }}
              ></div>
              <span className="font-semibold text-gray-900">
                {game.away_team}
              </span>
            </div>
            <PlayerStarCard 
              player={awayStars?.[0]} 
              teamColor={awayColor}
              alignment="left"
            />
          </div>

          {/* Home Team */}
          <div>
            <div className="flex items-center mb-4">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: homeColor }}
              ></div>
              <span className="font-semibold text-gray-900">
                {game.home_team}
              </span>
            </div>
            <PlayerStarCard 
              player={homeStars?.[0]} 
              teamColor={homeColor}
              alignment="left"
            />
          </div>
        </div>
      </div>
    );
  };

  if (!playerGameStats || playerGameStats.length === 0) {
    return (
      <div 
        className={`
          bg-white rounded-2xl shadow-lg border border-gray-100 p-8
          transition-all duration-700 ease-out delay-300
          ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        <div className="text-center">
          <i className="fas fa-user-friends text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Impact Players Unavailable
          </h3>
          <p className="text-gray-500">
            Player performance data not found for this game.
          </p>
        </div>
      </div>
    );
  }

  const categories = showOffense ? offenseCategories : defenseCategories;

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
        transition-all duration-700 ease-out delay-300
        ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Animated Icon */}
            <div 
              className="w-12 h-12 rounded-xl shadow-lg flex items-center justify-center transform transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, ${awayColor}, ${homeColor})`,
                transform: animateHype ? 'rotate(10deg)' : 'rotate(-10deg)'
              }}
            >
              <i className="fas fa-football-ball text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Impact Players</h3>
              <p className="text-sm text-gray-600">Game Changers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offense/Defense Toggle */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowOffense(true)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${showOffense 
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <i className="fas fa-play mr-2"></i>
            Offense
          </button>
          <button
            onClick={() => setShowOffense(false)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${!showOffense 
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <i className="fas fa-shield-alt mr-2"></i>
            Defense
          </button>
        </div>
      </div>

      {/* Categories Content */}
      <div className="p-6">
        <div className="space-y-6">
          {categories.map(category => (
            <CategorySection key={category} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameImpactPlayers;
