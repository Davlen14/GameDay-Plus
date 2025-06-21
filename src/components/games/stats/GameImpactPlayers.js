import React, { useState, useEffect } from 'react';

const GameImpactPlayers = ({ 
  game, 
  playerGameStats, 
  awayTeam,
  homeTeam,
  awayColor, 
  homeColor, 
  getTeamLogo,
  getTeamColor,
  animateCards 
}) => {
  const [showOffense, setShowOffense] = useState(true);
  const [animateHype, setAnimateHype] = useState(false);

  // Categories for each side
  const offenseCategories = ['passing', 'rushing', 'receiving'];
  const defenseCategories = ['defensive'];

  // Custom gradient like Swift
  const statsGradient = 'linear-gradient(135deg, #CC0011, #A0000D, #730009, #A0000D, #CC0011)';

  useEffect(() => {
    if (animateCards) {
      setAnimateHype(true);
    }
  }, [animateCards]);

  // Debug logging
  useEffect(() => {
    console.log('🏈 GameImpactPlayers Debug:', {
      playerGameStats: playerGameStats?.slice(0, 3),
      game,
      awayTeam: awayTeam?.school,
      homeTeam: homeTeam?.school
    });
  }, [playerGameStats, game, awayTeam, homeTeam]);

  // Helper functions
  const getTeamLogoUrl = (isHome) => {
    const teamId = isHome ? (game?.home_id || game?.homeId) : (game?.away_id || game?.awayId);
    
    if (getTeamLogo && teamId) {
      return getTeamLogo(teamId);
    }
    
    const team = isHome ? homeTeam : awayTeam;
    if (team?.logos?.[0]) {
      return team.logos[0];
    }
    
    return '/photos/ncaaf.png';
  };

  // Get yards value for a player
  const getYardsValue = (player, category) => {
    // Find the yards stat for this player
    const yardsStats = playerGameStats.filter(stat => 
      stat.player_id === player.player_id &&
      stat.category === category &&
      stat.stat_type === 'YDS'
    );
    
    return yardsStats[0]?.stat || '0';
  };

  // Get numeric yards value
  const getNumericYardsValue = (player, category) => {
    const yardsValue = getYardsValue(player, category);
    return parseFloat(yardsValue) || 0;
  };

  // Get additional stats for a player
  const getAdditionalStats = (player, category) => {
    const additionalStats = playerGameStats.filter(stat => 
      stat.player_id === player.player_id &&
      stat.category === category &&
      stat.stat_type !== 'YDS' &&
      ['TD', 'CAR', 'REC', 'C/ATT', 'SACKS', 'TFL', 'PD'].includes(stat.stat_type)
    );
    
    return additionalStats.sort((a, b) => {
      if (a.stat_type === 'TD') return -1;
      if (b.stat_type === 'TD') return 1;
      return 0;
    });
  };

  // Fixed function to match API data structure
  const getImpactStars = (isHome, category) => {
    // Get team name from game object
    const teamName = isHome ? 
      (homeTeam?.school || game?.home_team) : 
      (awayTeam?.school || game?.away_team);
    
    console.log(`🔍 Looking for ${isHome ? 'home' : 'away'} ${category} players for ${teamName}`);
    
    // Filter by team name and category
    const teamPlayers = playerGameStats.filter(player => {
      // Check multiple possible team field names
      const playerTeam = player.team || player.school;
      const matchesTeam = playerTeam === teamName;
      const matchesCategory = player.category === category;
      
      return matchesTeam && matchesCategory;
    });

    console.log(`✅ Found ${teamPlayers.length} ${category} players for ${teamName}`);

    if (teamPlayers.length === 0) return null;

    // Group by player and get max stat
    const playerMap = new Map();
    teamPlayers.forEach(stat => {
      const key = stat.player || stat.name;
      if (!playerMap.has(key) || (stat.stat > playerMap.get(key).stat)) {
        playerMap.set(key, stat);
      }
    });

    // Convert to array and sort by stat value
    const uniquePlayers = Array.from(playerMap.values());
    return uniquePlayers.sort((a, b) => (b.stat || 0) - (a.stat || 0));
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
        return '';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'passing':
        return 'football-ball';
      case 'rushing':
        return 'running';
      case 'receiving':
        return 'hands';
      case 'defensive':
        return 'shield-alt';
      default:
        return 'user';
    }
  };

  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPositionForCategory = (category) => {
    switch (category) {
      case 'passing':
        return 'QUARTERBACK';
      case 'rushing':
        return 'RUNNING BACK';
      case 'receiving':
        return 'RECEIVER';
      case 'defensive':
        return 'DEFENDER';
      default:
        return 'PLAYER';
    }
  };

  const isExceptionalStat = (stat, category) => {
    const value = parseFloat(stat) || 0;
    switch (category) {
      case 'passing':
        return value > 250;
      case 'rushing':
        return value > 100;
      case 'receiving':
        return value > 100;
      case 'defensive':
        return value > 8;
      default:
        return false;
    }
  };

  // Player Star Card Component
  const PlayerStarCard = ({ player, teamColor, teamId, alignment, category }) => {
    if (!player) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <img
            src={getTeamLogoUrl(teamId === game?.home_id || teamId === game?.homeId)}
            alt="Team Logo"
            className="w-7 h-7 object-contain opacity-50 mb-2"
            onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
          />
          <p className="text-xs text-gray-500 text-center">
            No {formatCategory(category).toLowerCase()} star
          </p>
        </div>
      );
    }

    const exceptional = isExceptionalStat(player.stat, category);
    const alignClass = alignment === 'trailing' ? 'items-end text-right' : 'items-start text-left';

    return (
      <div className={`flex flex-col ${alignClass} px-4 py-3 flex-1`}>
        {/* Team Logo */}
        <div className={`flex ${alignment === 'trailing' ? 'justify-end' : 'justify-start'} w-full mb-2`}>
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${teamColor}15` }}
          >
            <img
              src={getTeamLogoUrl(teamId === game?.home_id || teamId === game?.homeId)}
              alt="Team Logo"
              className="w-7 h-7 object-contain"
              onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
            />
          </div>
        </div>

        {/* Player Name */}
        <div className={`flex flex-col ${alignClass} mb-2`}>
          <h4 
            className="font-bold text-sm leading-tight mb-1"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {formatPlayerName(player.player || player.name)}
          </h4>
          <span 
            className="text-[10px] font-bold opacity-80"
            style={{ color: teamColor, fontFamily: 'Orbitron, sans-serif' }}
          >
            {getPositionForCategory(category)}
          </span>
        </div>

        {/* Main Stat */}
        <div className={`flex items-baseline space-x-1 mb-2 ${alignment === 'trailing' ? 'justify-end' : 'justify-start'}`}>
          <span 
            className="text-2xl font-black"
            style={{ color: teamColor, fontFamily: 'Orbitron, sans-serif' }}
          >
            {player.stat || 0}
          </span>
          <span 
            className="text-[10px] font-bold text-gray-500"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {getStatUnit(category)}
          </span>
        </div>

        {/* Additional Stats Pills */}
        <div className={`flex ${alignment === 'trailing' ? 'justify-end' : 'justify-start'} flex-wrap gap-1 mb-2`}>
          {getAdditionalStats(player, category).slice(0, 2).map((stat, idx) => (
            <div 
              key={idx}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${
                stat.stat_type === 'TD' && parseFloat(stat.stat) > 0 
                  ? 'bg-yellow-100' 
                  : 'bg-gray-100'
              }`}
            >
              <span 
                className={`text-[10px] font-bold ${
                  stat.stat_type === 'TD' && parseFloat(stat.stat) > 0 
                    ? 'text-yellow-700' 
                    : 'text-gray-900'
                }`}
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {stat.stat}
              </span>
              <span 
                className={`text-[8px] font-medium ${
                  stat.stat_type === 'TD' && parseFloat(stat.stat) > 0 
                    ? 'text-yellow-600' 
                    : 'text-gray-600'
                }`}
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {stat.stat_type}
              </span>
            </div>
          ))}
        </div>

        {/* Top Performer Badge */}
        {exceptional && (
          <div className={`flex ${alignment === 'trailing' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full border border-yellow-400 bg-yellow-50">
              <i className="fas fa-star text-[8px] text-yellow-500"></i>
              <span 
                className="text-[8px] font-bold text-yellow-600"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                TOP PERFORMER
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Modern Comparison Chart
  const ModernStatComparisonChart = ({ homePlayer, awayPlayer, homeColor, awayColor, category, containerWidth }) => {
    const awayValue = parseFloat(awayPlayer?.stat || 0);
    const homeValue = parseFloat(homePlayer?.stat || 0);
    const total = Math.max(0.1, homeValue + awayValue);
    const awayPct = awayValue / total;
    const homePct = homeValue / total;

    return (
      <div className="w-full mt-4 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p 
            className="text-[11px] font-bold text-gray-500 text-center mb-3"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {formatCategory(category).toUpperCase()} COMPARISON
          </p>

          {/* Values with logos */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <img
                src={getTeamLogoUrl(false)}
                alt="Away Team"
                className="w-5 h-5 object-contain"
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
              {awayValue > homeValue && (
                <i className="fas fa-check-circle text-xs text-green-500"></i>
              )}
              <span 
                className="text-base font-bold"
                style={{ color: awayColor, fontFamily: 'Orbitron, sans-serif' }}
              >
                {Math.round(awayValue)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span 
                className="text-base font-bold"
                style={{ color: homeColor, fontFamily: 'Orbitron, sans-serif' }}
              >
                {Math.round(homeValue)}
              </span>
              {homeValue > awayValue && (
                <i className="fas fa-check-circle text-xs text-green-500"></i>
              )}
              <img
                src={getTeamLogoUrl(true)}
                alt="Home Team"
                className="w-5 h-5 object-contain"
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-6 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
            <div className="absolute inset-0 flex">
              {/* Away section */}
              <div
                className="h-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{
                  width: `${awayPct * 100}%`,
                  background: `linear-gradient(90deg, ${awayColor}, ${awayColor}CC)`
                }}
              >
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
                  }}
                />
              </div>

              {/* Center divider */}
              <div className="w-0.5 h-full bg-white shadow-sm relative z-10" />

              {/* Home section */}
              <div
                className="h-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{
                  width: `${homePct * 100}%`,
                  background: `linear-gradient(90deg, ${homeColor}CC, ${homeColor})`
                }}
              >
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
                  }}
                />
              </div>
            </div>

            {/* Values inside bar */}
            <div className="absolute inset-0 flex justify-between items-center px-2">
              <span 
                className="text-[10px] font-bold text-white drop-shadow-md"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {Math.round(awayValue)}
              </span>
              <span 
                className="text-[10px] font-bold text-white drop-shadow-md"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {Math.round(homeValue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Category Section Component
  const CategorySection = ({ category }) => {
    const homeStars = getImpactStars(true, category);
    const awayStars = getImpactStars(false, category);
    
    if (!homeStars && !awayStars) {
      return (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-2xl">
          <i className={`fas fa-${getCategoryIcon(category)} text-2xl text-gray-300 mb-3`}></i>
          <p className="text-sm text-gray-500">
            No {formatCategory(category).toLowerCase()} stars available
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Category Header */}
        <div className="flex items-center space-x-2 px-2">
          <i 
            className={`fas fa-${getCategoryIcon(category)} text-base font-bold`}
            style={{ color: '#CC0011' }}
          ></i>
          <h4 
            className="text-base font-bold text-gray-900"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {formatCategory(category)}
          </h4>
        </div>

        {/* Team Matchup Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-stretch">
            {/* Away Player */}
            <PlayerStarCard 
              player={awayStars?.[0]} 
              teamColor={awayColor}
              teamId={game?.away_id || game?.awayId}
              alignment="leading"
              category={category}
            />

            {/* VS Divider */}
            <div className="flex flex-col items-center justify-center px-3 py-8">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                style={{ background: statsGradient }}
              >
                <i className="fas fa-football-ball text-white text-sm"></i>
              </div>
            </div>

            {/* Home Player */}
            <PlayerStarCard 
              player={homeStars?.[0]} 
              teamColor={homeColor}
              teamId={game?.home_id || game?.homeId}
              alignment="trailing"
              category={category}
            />
          </div>

          {/* Comparison Chart */}
          {homeStars?.[0] && awayStars?.[0] && (
            <ModernStatComparisonChart
              homePlayer={homeStars[0]}
              awayPlayer={awayStars[0]}
              homeColor={homeColor}
              awayColor={awayColor}
              category={category}
              containerWidth="100%"
            />
          )}
        </div>
      </div>
    );
  };

  if (!playerGameStats || playerGameStats.length === 0) {
    return (
      <div 
        className={`
          bg-gray-50 rounded-3xl shadow-lg p-8
          transition-all duration-700 ease-out delay-300
          ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        <div className="text-center">
          <i className="fas fa-user-friends text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-bold text-gray-600 mb-2">
            Impact Players Unavailable
          </h3>
          <p className="text-gray-500 text-sm">
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
        bg-gray-50 rounded-3xl shadow-lg overflow-hidden
        transition-all duration-700 ease-out delay-300
        ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{ fontFamily: 'Orbitron, sans-serif' }}
    >
      {/* Header */}
      <div className="px-6 py-5">
        <div className="flex items-center space-x-4">
          {/* Animated Icon */}
          <div 
            className="w-11 h-11 rounded-2xl shadow-md flex items-center justify-center relative overflow-hidden"
            style={{ background: statsGradient }}
          >
            <i 
              className="fas fa-football-ball text-white text-xl relative z-10"
              style={{
                transform: `rotate(${animateHype ? '10deg' : '-10deg'})`,
                transition: 'transform 1.5s ease-in-out'
              }}
            ></i>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">Impact Players</h3>
            <p className="text-[11px] font-medium text-gray-600">Game Changers</p>
          </div>
        </div>
      </div>

      {/* Offense/Defense Toggle */}
      <div className="px-6 pb-4">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowOffense(true)}
            className={`
              flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs transition-all duration-200
              ${showOffense 
                ? 'text-white shadow-md' 
                : 'text-gray-600 bg-gray-200'
              }
            `}
            style={showOffense ? { background: statsGradient } : {}}
          >
            <i className="fas fa-football-ball text-sm"></i>
            <span>OFFENSE</span>
          </button>
          <button
            onClick={() => setShowOffense(false)}
            className={`
              flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs transition-all duration-200
              ${!showOffense 
                ? 'text-white shadow-md' 
                : 'text-gray-600 bg-gray-200'
              }
            `}
            style={!showOffense ? { background: statsGradient } : {}}
          >
            <i className="fas fa-shield-alt text-sm"></i>
            <span>DEFENSE</span>
          </button>
        </div>
      </div>

      {/* Categories Content */}
      <div className="px-4 pb-6">
        <div className="space-y-5">
          {categories.map(category => (
            <CategorySection key={category} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameImpactPlayers;