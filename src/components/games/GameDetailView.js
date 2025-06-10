import React, { useState, useEffect, useRef } from 'react';
import { gameService, teamService } from '../../services';

const GameDetailView = ({ gameId }) => {
  const scrollRef = useRef(null);
  
  // State management
  const [currentGame, setCurrentGame] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Tab configuration
  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'fas fa-file-alt' },
    { id: 'stats', title: 'Stats', icon: 'fas fa-chart-bar' },
    { id: 'playByPlay', title: 'Plays', icon: 'fas fa-play-circle' },
    { id: 'standings', title: 'Standings', icon: 'fas fa-list-ol' },
    { id: 'chat', title: 'Chat', icon: 'fas fa-comments' }
  ];

  // Load game and team data
  useEffect(() => {
    const loadGameData = async () => {
      if (!gameId) return;
      
      setIsLoading(true);
      try {
        // Load teams first
        const teamsData = await teamService.getFBSTeams(true);
        setTeams(teamsData);

        // Try to find the game in recent weeks (we'll check multiple weeks)
        let foundGame = null;
        const currentYear = 2024;
        
        // Check recent weeks for the game
        for (let week = 1; week <= 15; week++) {
          try {
            const weekGames = await gameService.getGamesByWeek(currentYear, week, 'regular', false);
            foundGame = weekGames?.find(game => game.id?.toString() === gameId);
            if (foundGame) {
              break;
            }
          } catch (error) {
            console.warn(`Error loading week ${week}:`, error);
          }
        }
        
        // If not found in regular season, check postseason
        if (!foundGame) {
          try {
            const postseasonGames = await gameService.getPostseasonGames(currentYear, false);
            foundGame = postseasonGames?.find(game => game.id?.toString() === gameId);
          } catch (error) {
            console.warn('Error loading postseason games:', error);
          }
        }
        
        if (foundGame) {
          console.log('🎯 Found game data:', foundGame);
          console.log('🏈 Score data:', {
            home_points: foundGame.home_points,
            away_points: foundGame.away_points,
            homePoints: foundGame.homePoints,
            awayPoints: foundGame.awayPoints,
            completed: foundGame.completed
          });
        }
        setCurrentGame(foundGame);
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [gameId]);

  // Get team data - with null checks
  const getTeam = (teamId) => teams.find(team => team.id === teamId) || {};
  const awayTeam = currentGame ? getTeam(currentGame.away_id || currentGame.awayId) : {};
  const homeTeam = currentGame ? getTeam(currentGame.home_id || currentGame.homeId) : {};

  // Get team colors (you can implement this based on your team data structure)
  const getTeamColor = (teamId) => {
    const team = getTeam(teamId);
    if (team.color) {
      return team.color;
    }
    return teamId === (currentGame?.away_id || currentGame?.awayId) ? '#3B82F6' : '#EF4444';
  };

  const awayColor = currentGame ? getTeamColor(currentGame.away_id || currentGame.awayId) : '#3B82F6';
  const homeColor = currentGame ? getTeamColor(currentGame.home_id || currentGame.homeId) : '#EF4444';

  // Convert hex to RGB for CSS
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };

  const awayRgb = hexToRgb(awayColor);
  const homeRgb = hexToRgb(homeColor);
  const awayColorRgb = `${awayRgb.r}, ${awayRgb.g}, ${awayRgb.b}`;
  const homeColorRgb = `${homeRgb.r}, ${homeRgb.g}, ${homeRgb.b}`;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'TBD') return 'TBD';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBD';
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'TBD';
    }
  };

  // Get team logo
  const getTeamLogo = (teamId) => {
    const team = getTeam(teamId);
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  // Game status
  const getGameStatus = () => {
    if (!currentGame) return 'UPCOMING';
    if (currentGame.completed) return 'FINAL';
    
    // Check for scores in any of the possible field names
    const homeScore = (currentGame.home_points !== null && currentGame.home_points !== undefined) 
      ? currentGame.home_points 
      : currentGame.homePoints;
    const awayScore = (currentGame.away_points !== null && currentGame.away_points !== undefined) 
      ? currentGame.away_points 
      : currentGame.awayPoints;
    
    if ((homeScore !== null && homeScore !== undefined) || (awayScore !== null && awayScore !== undefined)) {
      return 'LIVE';
    }
    return 'UPCOMING';
  };

  // Get team score with proper fallback
  const getTeamScore = (isHome) => {
    if (!currentGame) return null;
    
    // Check both possible field names and return the first valid score
    let homeScore = null;
    let awayScore = null;
    
    // Try home_points first, then homePoints
    if (currentGame.home_points !== null && currentGame.home_points !== undefined) {
      homeScore = currentGame.home_points;
    } else if (currentGame.homePoints !== null && currentGame.homePoints !== undefined) {
      homeScore = currentGame.homePoints;
    }
    
    // Try away_points first, then awayPoints
    if (currentGame.away_points !== null && currentGame.away_points !== undefined) {
      awayScore = currentGame.away_points;
    } else if (currentGame.awayPoints !== null && currentGame.awayPoints !== undefined) {
      awayScore = currentGame.awayPoints;
    }
    
    return isHome ? homeScore : awayScore;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent gradient-bg mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-300 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl gradient-text font-bold">Loading Game Details...</p>
            <p className="text-gray-600">Fetching game information</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - no game found
  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h3>
          <p className="text-gray-600 mb-8">
            We couldn't find the game you're looking for. It may have been moved or doesn't exist.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Height Game Header - Same size as TeamDetailView */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          height: '415px',
          background: `linear-gradient(135deg, 
            rgba(${awayColorRgb}, 0.95) 0%, 
            rgba(${awayColorRgb}, 1) 20%, 
            rgba(${homeColorRgb}, 0.85) 40%, 
            rgba(${homeColorRgb}, 1) 60%, 
            rgba(${awayColorRgb}, 0.9) 80%, 
            rgba(${homeColorRgb}, 0.95) 100%)`,
          filter: 'contrast(1.1) saturate(1.2) brightness(1.05)',
        }}
      >
        {/* Back Button */}
        <div className="absolute top-8 left-5 z-50">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white px-4 py-2.5 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-chevron-left text-sm font-semibold"></i>
            <span className="font-medium text-sm tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>Back</span>
          </button>
        </div>

        {/* Game Date */}
        {currentGame?.start_date && (
          <div className="absolute top-8 right-5 z-50">
            <div className="text-white px-4 py-2.5 bg-black/20 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
              <span className="font-medium text-sm tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {formatDate(currentGame.start_date)}
              </span>
            </div>
          </div>
        )}

        {/* Header Content - Game Scoreboard */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pt-6">
          {/* Game Status Badge */}
          <div className="mb-6">
            <div 
              className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold text-lg backdrop-blur-xl border shadow-lg ${
                currentGame?.completed 
                  ? 'bg-green-500/20 border-green-400/30 text-green-100 shadow-[0_8px_25px_rgba(34,197,94,0.2)]' 
                  : 'bg-white/20 border-white/30 text-white shadow-[0_8px_25px_rgba(255,255,255,0.3)]'
              }`}
            >
              <div className="relative z-10 flex items-center space-x-2">
                {currentGame?.completed ? (
                  <>
                    <i className="fas fa-check-circle"></i>
                    <span>FINAL</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>{getGameStatus()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-center space-x-12 mb-6">
            {/* Away Team */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4">
                <img
                  src={getTeamLogo(currentGame?.away_id || currentGame?.awayId)}
                  alt={awayTeam?.school || 'Away Team'}
                  className="w-full h-full object-contain drop-shadow-lg"
                  onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                />
              </div>
              <span className="text-white font-bold text-lg mb-2 text-center" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {currentGame?.away_team || awayTeam?.school || 'AWAY'}
              </span>
              {getTeamScore(false) !== null ? (
                <span className="text-white text-5xl font-black" style={{ textShadow: '0 3px 6px rgba(0,0,0,0.5)' }}>
                  {getTeamScore(false)}
                </span>
              ) : (
                <span className="text-white text-2xl font-bold opacity-60" style={{ textShadow: '0 3px 6px rgba(0,0,0,0.5)' }}>
                  VS
                </span>
              )}
            </div>
            
            {/* VS Separator */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center mb-2">
                <span className="text-white font-black text-2xl" style={{ fontFamily: 'Orbitron, sans-serif' }}>VS</span>
              </div>
              {currentGame?.venue && (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 bg-black/20 rounded-full px-3 py-1">
                    <i className="fas fa-map-marker-alt text-white text-xs"></i>
                    <span className="text-white text-xs font-medium">{currentGame.venue}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4">
                <img
                  src={getTeamLogo(currentGame?.home_id || currentGame?.homeId)}
                  alt={homeTeam?.school || 'Home Team'}
                  className="w-full h-full object-contain drop-shadow-lg"
                  onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                />
              </div>
              <span className="text-white font-bold text-lg mb-2 text-center" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {currentGame?.home_team || homeTeam?.school || 'HOME'}
              </span>
              {getTeamScore(true) !== null ? (
                <span className="text-white text-5xl font-black" style={{ textShadow: '0 3px 6px rgba(0,0,0,0.5)' }}>
                  {getTeamScore(true)}
                </span>
              ) : (
                <span className="text-white text-2xl font-bold opacity-60" style={{ textShadow: '0 3px 6px rgba(0,0,0,0.5)' }}>
                  VS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Team Color Shadow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-6"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(${awayColorRgb}, 0.2) 20%,
              rgba(${homeColorRgb}, 0.6) 50%, 
              rgba(${awayColorRgb}, 0.2) 80%,
              transparent 100%)`,
            filter: 'blur(8px) brightness(1.2)',
          }}
        />
      </div>

      {/* Tab Navigation - Sticky */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-lg backdrop-blur-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex justify-center items-center gap-2 px-4 py-3 min-w-max mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 min-w-16 ${
                  selectedTab === tab.id
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedTab === tab.id ? {
                  background: `linear-gradient(135deg, ${awayColor} 0%, ${homeColor} 100%)`,
                  boxShadow: `0 4px 15px ${awayColor}40`,
                  fontFamily: 'Orbitron, sans-serif',
                } : {
                  background: `linear-gradient(135deg, 
                    rgba(243,244,246,1) 0%, 
                    rgba(249,250,251,1) 50%, 
                    rgba(243,244,246,1) 100%)`,
                  border: '1px solid rgba(209,213,219,0.5)',
                  fontFamily: 'Orbitron, sans-serif',
                }}
              >
                <i className={`${tab.icon} text-sm mb-1`}></i>
                <span className="text-xs font-semibold">{tab.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <TabContent 
          selectedTab={selectedTab}
          game={currentGame}
          awayTeam={awayTeam}
          homeTeam={homeTeam}
        />
      </div>
    </div>
  );
};

// Tab Content
const TabContent = ({ selectedTab, game, awayTeam, homeTeam }) => {
  const ComingSoonContent = ({ title, description, icon }) => (
    <div className="text-center py-16">
      <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
        <i className={`${icon} text-3xl text-white`}></i>
      </div>
      <h3 className="text-2xl font-bold gradient-text mb-4">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto">{description}</p>
      <div className="mt-8">
        <div className="inline-flex items-center px-6 py-3 gradient-bg text-white rounded-full">
          <i className="fas fa-rocket mr-2"></i>
          Coming Soon
        </div>
      </div>
    </div>
  );

  switch (selectedTab) {
    case 'overview':
      return (
        <ComingSoonContent
          title="Game Overview"
          description="Comprehensive game details, key plays, and real-time updates will be available here."
          icon="fas fa-file-alt"
        />
      );
    case 'stats':
      return (
        <ComingSoonContent
          title="Live Statistics"
          description="In-depth team and player statistics, analytics, and performance metrics."
          icon="fas fa-chart-bar"
        />
      );
    case 'playByPlay':
      return (
        <ComingSoonContent
          title="Play-by-Play"
          description="Real-time play-by-play updates, drive charts, and momentum tracking."
          icon="fas fa-play-circle"
        />
      );
    case 'standings':
      return (
        <ComingSoonContent
          title="Conference Standings"
          description="Current conference standings, rankings, and playoff implications."
          icon="fas fa-list-ol"
        />
      );
    case 'chat':
      return (
        <ComingSoonContent
          title="Live Chat"
          description="Join the conversation with other fans during the game with real-time chat."
          icon="fas fa-comments"
        />
      );
    default:
      return (
        <ComingSoonContent
          title="Game Overview"
          description="Comprehensive game details, key plays, and real-time updates will be available here."
          icon="fas fa-file-alt"
        />
      );
  }
};

export default GameDetailView;
