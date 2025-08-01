import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamService } from '../../../../services';

const GameDetailsModal = ({ 
  isOpen, 
  onClose, 
  games, 
  team, 
  title, 
  filterType,
  year 
}) => {
  const [teams, setTeams] = useState([]);

  // Load teams data for logos
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await teamService.getFBSTeams(true);
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };

    if (isOpen && teams.length === 0) {
      loadTeams();
    }
  }, [isOpen, teams.length]);
  if (!isOpen || !games || games.length === 0) return null;

  // Filter games based on the type
  const filteredGames = games.filter(game => {
    switch (filterType) {
      case 'year':
        return game.year === year || game.season === year;
      case 'home':
        return game.home_team === team.school || game.homeTeam === team.school;
      case 'away':
        return game.away_team === team.school || game.awayTeam === team.school;
      case 'large-spreads':
        return Math.abs(game.adjustedSpread || 0) > 7;
      case 'small-spreads':
        return Math.abs(game.adjustedSpread || 0) <= 3.5;
      case 'favorite':
        return (game.adjustedSpread || 0) < 0;
      case 'underdog':
        return (game.adjustedSpread || 0) > 0;
      default:
        return true;
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getATSResult = (game, team) => {
    const isHome = game.home_team === team.school || game.homeTeam === team.school;
    const teamScore = isHome ? 
      (game.home_points !== undefined ? game.home_points : game.home_score) :
      (game.away_points !== undefined ? game.away_points : game.away_score);
    const oppScore = isHome ? 
      (game.away_points !== undefined ? game.away_points : game.away_score) :
      (game.home_points !== undefined ? game.home_points : game.home_score);
    
    if (teamScore === null || oppScore === null) return { result: 'No Score', color: 'gray' };
    
    const actualMargin = teamScore - oppScore;
    const adjustedSpread = game.adjustedSpread || 0;
    const atsMargin = actualMargin - adjustedSpread;
    
    if (Math.abs(atsMargin) <= 0.5) {
      return { result: 'PUSH', color: 'yellow', margin: atsMargin };
    } else if (atsMargin > 0.5) {
      return { result: 'COVER', color: 'green', margin: atsMargin };
    } else {
      return { result: 'LOSS', color: 'red', margin: atsMargin };
    }
  };

  const getOpponent = (game, team) => {
    const isHome = game.home_team === team.school || game.homeTeam === team.school;
    return isHome ? 
      (game.away_team || game.awayTeam) : 
      (game.home_team || game.homeTeam);
  };

  const getOpponentId = (game, team) => {
    const isHome = game.home_team === team.school || game.homeTeam === team.school;
    return isHome ? 
      (game.awayId || game.away_id) : 
      (game.homeId || game.home_id);
  };

  const getOpponentLogo = (game, team) => {
    const opponentId = getOpponentId(game, team);
    const opponent = getOpponent(game, team);
    
    if (!teams.length) return null;
    
    // Try to find team by ID first
    if (opponentId) {
      const opponentTeam = teams.find(t => t.id === opponentId);
      if (opponentTeam?.logos?.[0]) return opponentTeam.logos[0];
    }
    
    // Fallback: try to find team by name
    if (opponent) {
      const opponentTeam = teams.find(t => 
        t.school === opponent || 
        t.displayName === opponent ||
        t.name === opponent
      );
      if (opponentTeam?.logos?.[0]) return opponentTeam.logos[0];
    }
    
    return null;
  };

  // Get sportsbook logo filename based on provider name
  const getSportsbookLogo = (provider) => {
    if (!provider || provider === 'Unknown') return null;
    
    const providerLower = provider.toLowerCase();
    
    // Map provider names to actual file names in SportsbookLogos folder
    const logoMap = {
      'bovada': 'Bovada-Casino-Logo.svg',
      'draftkings': 'Draftking.svg',
      'bet365': 'bet365.svg',
      'betmgm': 'betgmg.svg',
      'caesars': 'caesar.svg',
      'espnbet': 'espnbet.svg',
      'espn bet': 'espnbet.svg',
      'underdog': 'underdog.svg'
    };
    
    return logoMap[providerLower] || null;
  };
  const getGameProvider = (game) => {
    // Check if game has lines data with provider
    if (game.lines && Array.isArray(game.lines) && game.lines.length > 0) {
      return game.lines[0].provider; // Use first provider
    }
    
    // Fallback to other provider fields
    return game.provider || game.data_provider || game.source || game.spreadSource || 'Unknown';
  };

  const getGameScore = (game, team) => {
    const isHome = game.home_team === team.school || game.homeTeam === team.school;
    const teamScore = isHome ? 
      (game.home_points !== undefined ? game.home_points : game.home_score) :
      (game.away_points !== undefined ? game.away_points : game.away_score);
    const oppScore = isHome ? 
      (game.away_points !== undefined ? game.away_points : game.away_score) :
      (game.home_points !== undefined ? game.home_points : game.home_score);
    
    if (teamScore === null || oppScore === null) return 'No Score';
    return `${teamScore}-${oppScore}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200/30 max-w-6xl w-full h-[1050px] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="relative text-white p-6 flex-shrink-0 overflow-hidden"
            style={{
              background: team.color ? 
                `linear-gradient(135deg, ${team.color} 0%, ${team.alt_color || '#1a1a1a'} 50%, ${team.color} 100%), 
                 linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)` :
                'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%), linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Metallic overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)'
            }}></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {team.logos && team.logos[0] && (
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl p-2 flex items-center justify-center border border-white/40 shadow-lg">
                    <img 
                      src={team.logos[0]} 
                      alt={`${team.school} logo`}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h2>
                  <p className="text-white/95 mt-1 text-sm font-medium drop-shadow-md">
                    {team.school} • {filteredGames.length} games
                    {year && ` • ${year} Season`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white transition-all duration-200 p-3 rounded-full hover:bg-white/25 backdrop-blur-sm border border-white/30"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50"
               style={{ maxHeight: '850px' }}>
            {filteredGames.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No games found for this filter</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGames.map((game, index) => {
                  const atsResult = getATSResult(game, team);
                  const opponent = getOpponent(game, team);
                  const opponentLogo = getOpponentLogo(game, team);
                  const isHome = game.home_team === team.school || game.homeTeam === team.school;
                  const gameScore = getGameScore(game, team);
                  const spread = game.adjustedSpread || 0;
                                  const spreadSource = game.spreadSource || game.source || 'Unknown';
                                  const provider = getGameProvider(game);
                                  const sportsbookLogo = getSportsbookLogo(provider);                  return (
                    <motion.div
                      key={game.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
                      className={`
                        border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer
                        ${atsResult.color === 'green' ? 'border-green-200 bg-green-50/30 hover:bg-green-100/40' : ''}
                        ${atsResult.color === 'red' ? 'border-red-200 bg-red-50/30 hover:bg-red-100/40' : ''}
                        ${atsResult.color === 'yellow' ? 'border-yellow-200 bg-yellow-50/30 hover:bg-yellow-100/40' : ''}
                        ${atsResult.color === 'gray' ? 'border-gray-200 bg-gray-50/30 hover:bg-gray-100/40' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-6">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-white/80 rounded-lg p-1 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                    {opponentLogo ? (
                                      <img 
                                        src={opponentLogo} 
                                        alt={`${opponent} logo`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    {!opponentLogo && (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                        {opponent?.charAt(0) || '?'}
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-bold text-gray-900 text-lg">
                                    {isHome ? 'vs' : '@'} {opponent}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                                  {formatDate(game.start_date || game.date)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-2xl font-black text-gray-900">
                                  {gameScore}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-700 bg-white/70 px-3 py-1 rounded-full">
                                    Spread: {spread > 0 ? '+' : ''}{spread.toFixed(1)}
                                  </span>
                                  {provider && provider !== 'Unknown' && (
                                    <span className="text-xs text-gray-800 bg-gray-100/70 px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                                      {sportsbookLogo && (
                                        <img 
                                          src={`/SportsbookLogos/${sportsbookLogo}`}
                                          alt={`${provider} logo`}
                                          className="w-4 h-4 object-contain"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <span>{provider}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`
                                inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg
                                ${atsResult.color === 'green' ? 'bg-green-500 text-white' : ''}
                                ${atsResult.color === 'red' ? 'bg-red-500 text-white' : ''}
                                ${atsResult.color === 'yellow' ? 'bg-yellow-500 text-white' : ''}
                                ${atsResult.color === 'gray' ? 'bg-gray-500 text-white' : ''}
                              `}>
                                {atsResult.result}
                              </div>
                              {atsResult.margin !== undefined && (
                                <div className="text-xs text-gray-600 mt-2 font-medium bg-white/70 px-2 py-1 rounded-full inline-block">
                                  ATS: {atsResult.margin > 0 ? '+' : ''}{atsResult.margin.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional game details */}
                      <div className="mt-4 pt-4 border-t border-gray-200/60">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/70 p-3 rounded-xl">
                            <span className="text-gray-500 text-xs font-medium block">Week</span>
                            <span className="font-bold text-gray-900">{game.week || 'N/A'}</span>
                          </div>
                          <div className="bg-white/70 p-3 rounded-xl">
                            <span className="text-gray-500 text-xs font-medium block">Location</span>
                            <span className="font-bold text-gray-900">{isHome ? 'Home' : 'Away'}</span>
                          </div>
                          <div className="bg-white/70 p-3 rounded-xl">
                            <span className="text-gray-500 text-xs font-medium block">Season Type</span>
                            <span className="font-bold text-gray-900">{game.seasonType || game.season_type || 'Regular'}</span>
                          </div>
                          <div className="bg-white/70 p-3 rounded-xl">
                            <span className="text-gray-500 text-xs font-medium block">Game ID</span>
                            <span className="font-mono text-xs text-gray-700">{game.id || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          <div className="bg-white px-6 py-5 border-t border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-3xl font-black text-green-600 mb-1">
                  {filteredGames.filter(game => getATSResult(game, team).result === 'COVER').length}
                </div>
                <div className="text-green-700 font-semibold text-sm">Covers</div>
              </div>
              <div className="text-center bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-3xl font-black text-red-600 mb-1">
                  {filteredGames.filter(game => getATSResult(game, team).result === 'LOSS').length}
                </div>
                <div className="text-red-700 font-semibold text-sm">Losses</div>
              </div>
              <div className="text-center bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-3xl font-black text-yellow-600 mb-1">
                  {filteredGames.filter(game => getATSResult(game, team).result === 'PUSH').length}
                </div>
                <div className="text-yellow-700 font-semibold text-sm">Pushes</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameDetailsModal;
