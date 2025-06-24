import React from 'react';

const GameStatsHeader = ({ 
  game, 
  awayTeam, 
  homeTeam, 
  awayColor, 
  homeColor, 
  animateCards,
  getTeamLogo
}) => {
  const getScore = (isHome) => {
    if (!game) return 0;
    
    // Check multiple possible field names for scores
    if (isHome) {
      return game?.home_points ?? game?.homePoints ?? game?.home_score ?? 0;
    } else {
      return game?.away_points ?? game?.awayPoints ?? game?.away_score ?? 0;
    }
  };

  const getTeamName = (isHome) => {
    if (isHome) {
      return homeTeam?.school || homeTeam?.name || game?.home_team || 'Home Team';
    } else {
      return awayTeam?.school || awayTeam?.name || game?.away_team || 'Away Team';
    }
  };

  const getTeamLogoUrl = (isHome) => {
    const teamId = isHome ? game?.home_id : game?.away_id;
    const team = isHome ? homeTeam : awayTeam;
    const teamName = getTeamName(isHome);
    
    // Debug: log what we're trying to load
    console.log(`🖼️ Loading logo for ${isHome ? 'home' : 'away'} team:`, { teamId, team, teamName });
    
    // Use the passed getTeamLogo function if available (preferred)
    if (getTeamLogo && teamId) {
      const logoUrl = getTeamLogo(teamId);
      console.log(`✅ Using getTeamLogo function, got: ${logoUrl}`);
      return logoUrl;
    }
    
    // Fallback: try the team's logo property if it exists
    if (team?.logos?.[0]) {
      console.log(`✅ Using team.logos[0]: ${team.logos[0]}`);
      return team.logos[0];
    }
    
    // Fallback: try team logo property
    if (team?.logo) {
      console.log(`✅ Using team.logo: ${team.logo}`);
      return team.logo;
    }
    
    // Fallback to team name if available
    if (teamName && teamName !== 'Home Team' && teamName !== 'Away Team') {
      const nameUrl = `/team_logos/${teamName.replace(/\s+/g, '_')}.png`;
      console.log(`✅ Using team name fallback: ${nameUrl}`);
      return nameUrl;
    }
    
    // Default fallback
    console.log(`⚠️ Using default fallback logo`);
    return '/photos/ncaaf.png';
  };

  const gameStatus = () => {
    if (game?.completed) return 'FINAL';
    if (game?.start_time_tbd) return 'TBD';
    return 'SCHEDULED';
  };

  // Debug info
  console.log('🎮 GameStatsHeader render:', {
    game: game ? `${game.away_team} @ ${game.home_team}` : 'No game',
    awayTeam,
    homeTeam,
    awayColor,
    homeColor
  });

  return (
    <div 
      className={`
        transition-all duration-700 ease-out
        ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Modern Scorebug Design */}
      <div className="relative">
        {/* Background with Metallic Gradient */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-3xl shadow-2xl border border-gray-600 overflow-hidden">
          {/* Chrome/Metallic Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
          
          {/* Main Scorebug Content */}
          <div className="relative z-10 flex items-center justify-between px-8 py-6">
            {/* Away Team Section */}
            <div className="flex items-center space-x-6">
              {/* Away Team Logo */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-lg border border-gray-400 flex items-center justify-center overflow-hidden">
                  <img
                    src={getTeamLogoUrl(false)}
                    alt={getTeamName(false)}
                    className="w-12 h-12 object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      console.log(`❌ Logo failed for away team: ${getTeamName(false)}, trying fallback`);
                      e.target.src = '/photos/ncaaf.png';
                    }}
                    onLoad={() => {
                      console.log(`✅ Logo loaded for away team: ${getTeamName(false)}`);
                    }}
                  />
                </div>
                {/* Team Color Accent */}
                <div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-700"
                  style={{ backgroundColor: awayColor || '#dc2626' }}
                ></div>
              </div>
              
              {/* Away Team Info */}
              <div className="text-left">
                <div 
                  className="text-xl font-black tracking-tight leading-none mb-1"
                  style={{ 
                    color: awayColor || '#ffffff',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {getTeamName(false).toUpperCase()}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {awayTeam?.mascot || game?.away_conference || 'VISITORS'}
                </div>
              </div>
              
              {/* Away Score */}
              <div className="bg-gradient-to-b from-gray-600 to-gray-800 rounded-xl px-6 py-3 border border-gray-500 shadow-inner">
                <div className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'ui-monospace, monospace' }}>
                  {getScore(false)}
                </div>
              </div>
            </div>

            {/* Center Game Info */}
            <div className="flex flex-col items-center justify-center px-8">
              {/* Game Status */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 rounded-full shadow-lg border border-red-500 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm tracking-wide">{gameStatus()}</span>
                </div>
              </div>
              
              {/* Week & Season */}
              <div className="text-center">
                <div className="text-white font-bold text-lg mb-1">
                  WEEK {game?.week || 'N/A'}
                </div>
                <div className="text-gray-300 text-sm font-medium">
                  {game?.season || new Date().getFullYear()} SEASON
                </div>
              </div>
              
              {/* Game Type */}
              <div className="mt-3 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                <span className="text-xs text-gray-200 font-medium uppercase tracking-wider">
                  {game?.neutral_site ? 'Neutral Site' : 
                   game?.conference_game ? 'Conference Game' : 'Non-Conference'}
                </span>
              </div>
            </div>

            {/* Home Team Section */}
            <div className="flex items-center space-x-6 flex-row-reverse">
              {/* Home Team Logo */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-lg border border-gray-400 flex items-center justify-center overflow-hidden">
                  <img
                    src={getTeamLogoUrl(true)}
                    alt={getTeamName(true)}
                    className="w-12 h-12 object-contain filter drop-shadow-sm"
                    onError={(e) => {
                      console.log(`❌ Logo failed for home team: ${getTeamName(true)}, trying fallback`);
                      e.target.src = '/photos/ncaaf.png';
                    }}
                    onLoad={() => {
                      console.log(`✅ Logo loaded for home team: ${getTeamName(true)}`);
                    }}
                  />
                </div>
                {/* Team Color Accent */}
                <div 
                  className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-gray-700"
                  style={{ backgroundColor: homeColor || '#1e40af' }}
                ></div>
              </div>
              
              {/* Home Team Info */}
              <div className="text-right">
                <div 
                  className="text-xl font-black tracking-tight leading-none mb-1"
                  style={{ 
                    color: homeColor || '#ffffff',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {getTeamName(true).toUpperCase()}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {homeTeam?.mascot || game?.home_conference || 'HOME'}
                </div>
              </div>
              
              {/* Home Score */}
              <div className="bg-gradient-to-b from-gray-600 to-gray-800 rounded-xl px-6 py-3 border border-gray-500 shadow-inner">
                <div className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'ui-monospace, monospace' }}>
                  {getScore(true)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Accent Strip */}
          <div className="h-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 opacity-80"></div>
        </div>
      </div>

      {/* Additional Game Details Card */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Game Details</h3>
        </div>

        {/* Game Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {game.start_date && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 font-medium mb-1">Date</p>
                <p className="font-bold text-gray-800">
                  {new Date(game.start_date).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {game.venue && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-1">Venue</p>
                <p className="font-bold text-blue-800 text-sm">
                  {game.venue}
                </p>
              </div>
            )}

            {game.attendance && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-600 font-medium mb-1">Attendance</p>
                <p className="font-bold text-green-800">
                  {game.attendance.toLocaleString()}
                </p>
              </div>
            )}

            {game.excitement_index ? (
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-600 font-medium mb-1">Excitement</p>
                <p className="font-bold text-red-800">
                  {(game.excitement_index * 10).toFixed(1)}/10
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-purple-600 font-medium mb-1">Season Type</p>
                <p className="font-bold text-purple-800 capitalize">
                  {game.season_type || 'Regular'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatsHeader;
