import React, { useState, useEffect, useRef } from 'react';
import { gameService, teamService } from '../../services';
import GameOverview from './GameOverview';
import GameStats from './GameStats';
import GamePlayByPlay from './GamePlayByPlay';
import GameStandings from './GameStandings';
import GameChat from './GameChat';

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
      {/* Fixed Height Game Header - Team Colors Meeting in Middle */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          height: '415px',
          background: `linear-gradient(to right, 
            rgba(${awayColorRgb}, 0.95) 0%, 
            rgba(${awayColorRgb}, 0.8) 25%, 
            rgba(${awayColorRgb}, 0.4) 45%, 
            rgba(${awayColorRgb}, 0.2) 48%, 
            rgba(${homeColorRgb}, 0.2) 52%, 
            rgba(${homeColorRgb}, 0.4) 55%, 
            rgba(${homeColorRgb}, 0.8) 75%, 
            rgba(${homeColorRgb}, 0.95) 100%)`,
        }}
      >
        {/* Dynamic Team Color Particles - Team Specific */}
        <div className="absolute inset-0">
          {/* Away Team Side - Left */}
          <div 
            className="absolute w-80 h-80 rounded-full opacity-40 blur-3xl"
            style={{
              background: `radial-gradient(circle, rgba(${awayColorRgb}, 0.8) 0%, transparent 70%)`,
              top: '10%',
              left: '5%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute w-64 h-64 rounded-full opacity-30 blur-2xl"
            style={{
              background: `radial-gradient(circle, rgba(${awayColorRgb}, 0.6) 0%, transparent 70%)`,
              top: '60%',
              left: '10%',
              animation: 'float 12s ease-in-out infinite reverse',
            }}
          />
          
          {/* Home Team Side - Right */}
          <div 
            className="absolute w-80 h-80 rounded-full opacity-40 blur-3xl"
            style={{
              background: `radial-gradient(circle, rgba(${homeColorRgb}, 0.8) 0%, transparent 70%)`,
              top: '10%',
              right: '5%',
              animation: 'float 10s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute w-64 h-64 rounded-full opacity-30 blur-2xl"
            style={{
              background: `radial-gradient(circle, rgba(${homeColorRgb}, 0.6) 0%, transparent 70%)`,
              bottom: '15%',
              right: '10%',
              animation: 'float 14s ease-in-out infinite reverse',
            }}
          />
          
          {/* Central Meeting Effect */}
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, 
                transparent 0%,
                rgba(${awayColorRgb}, 0.1) 30%,
                rgba(${homeColorRgb}, 0.1) 70%,
                transparent 100%)`,
              animation: 'pulse 6s ease-in-out infinite',
            }}
          />
          
          {/* Moving Energy Connection */}
          <div 
            className="absolute top-1/2 left-0 right-0 h-32 transform -translate-y-1/2"
            style={{
              background: `linear-gradient(90deg, 
                rgba(${awayColorRgb}, 0.3) 0%,
                rgba(${awayColorRgb}, 0.5) 25%,
                rgba(255,255,255, 0.2) 50%,
                rgba(${homeColorRgb}, 0.5) 75%,
                rgba(${homeColorRgb}, 0.3) 100%)`,
              filter: 'blur(20px)',
              animation: 'shimmer 4s ease-in-out infinite alternate',
            }}
          />
        </div>

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

        {/* Game Status - Top Right */}
        <div className="absolute top-8 right-5 z-50">
          <div 
            className={`inline-flex items-center px-4 py-2.5 rounded-lg font-bold text-sm backdrop-blur-xl border shadow-lg ${
              currentGame?.completed 
                ? 'text-green-100 shadow-[0_8px_32px_rgba(34,197,94,0.4)]' 
                : 'text-white shadow-[0_8px_32px_rgba(255,255,255,0.3)]'
            }`}
            style={{
              background: currentGame?.completed
                ? 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(22,163,74,0.4) 50%, rgba(34,197,94,0.3) 100%)'
                : `linear-gradient(135deg, 
                    rgba(${awayColorRgb}, 0.2) 0%, 
                    rgba(${homeColorRgb}, 0.3) 50%, 
                    rgba(${awayColorRgb}, 0.2) 100%)`,
              border: currentGame?.completed 
                ? '2px solid rgba(34,197,94,0.4)'
                : `2px solid rgba(255,255,255,0.3)`,
            }}
          >
            <div className="flex items-center space-x-2">
              {currentGame?.completed ? (
                <>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <span style={{ fontFamily: 'Orbitron, sans-serif' }}>FINAL</span>
                </>
              ) : (
                <>
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse shadow-lg"
                    style={{ 
                      background: `linear-gradient(45deg, ${awayColor}, ${homeColor})`,
                      boxShadow: `0 0 8px rgba(${awayColorRgb}, 0.6)`
                    }}
                  ></div>
                  <span style={{ fontFamily: 'Orbitron, sans-serif' }}>{getGameStatus()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Content - Game Scoreboard */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pt-6">
          {/* Teams and Score - Enhanced 3D Logos */}
          <div className="flex items-center justify-center space-x-16 mb-8">
            {/* Away Team - Ultra 3D Logo */}
            <div className="flex flex-col items-center group">
              {/* Ultra Enhanced 3D Team Logo */}
              <div className="relative mb-6">
                {/* 3D Shadow Layers */}
                <div 
                  className="absolute inset-0 w-32 h-32"
                  style={{
                    background: `radial-gradient(circle, rgba(${awayColorRgb}, 0.4) 0%, transparent 70%)`,
                    filter: 'blur(25px)',
                    transform: 'translateY(8px) scale(1.1)',
                  }}
                />
                <div 
                  className="absolute inset-0 w-32 h-32"
                  style={{
                    background: `radial-gradient(circle, rgba(${awayColorRgb}, 0.6) 0%, transparent 50%)`,
                    filter: 'blur(15px)',
                    transform: 'translateY(4px) scale(1.05)',
                  }}
                />
                <div 
                  className="absolute inset-0 w-32 h-32"
                  style={{
                    background: `radial-gradient(circle, rgba(0,0,0, 0.3) 0%, transparent 60%)`,
                    filter: 'blur(12px)',
                    transform: 'translateY(6px)',
                  }}
                />
                
                {/* Main Logo - Authentic Colors with 3D Effects */}
                <img
                  src={getTeamLogo(currentGame?.away_id || currentGame?.awayId)}
                  alt={awayTeam?.school || 'Away Team'}
                  className="w-32 h-32 object-contain relative z-10 group-hover:scale-110 transition-all duration-500"
                  style={{
                    filter: `
                      drop-shadow(0 0 15px rgba(${awayColorRgb}, 0.7))
                      drop-shadow(0 8px 25px rgba(0,0,0,0.4))
                      drop-shadow(0 15px 35px rgba(${awayColorRgb}, 0.3))
                      drop-shadow(0 0 8px rgba(255,255,255,0.2))
                    `,
                    transform: 'translateZ(20px)',
                  }}
                  onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                />
                
                {/* Glowing Ring Effect */}
                <div 
                  className="absolute inset-0 w-32 h-32 rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                  style={{
                    background: `conic-gradient(from 0deg, 
                      rgba(${awayColorRgb}, 0.8) 0deg,
                      transparent 60deg,
                      rgba(${awayColorRgb}, 0.4) 120deg,
                      transparent 180deg,
                      rgba(${awayColorRgb}, 0.6) 240deg,
                      transparent 300deg,
                      rgba(${awayColorRgb}, 0.8) 360deg)`,
                    filter: 'blur(8px)',
                    animation: 'spin 20s linear infinite',
                    transform: 'scale(1.3)',
                  }}
                />
              </div>
              
              {/* Team Name with Enhanced Styling */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {/* Team Ranking Badge if available */}
                  {awayTeam?.ranking && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{
                        background: `linear-gradient(135deg, rgba(${awayColorRgb}, 1) 0%, rgba(${awayColorRgb}, 0.8) 100%)`,
                        boxShadow: `0 2px 8px rgba(${awayColorRgb}, 0.4)`,
                      }}
                    >
                      #{awayTeam.ranking}
                    </div>
                  )}
                  
                  <span 
                    className="text-white font-black text-xl tracking-wide" 
                    style={{ 
                      fontFamily: 'Orbitron, sans-serif', 
                      textShadow: `0 2px 8px rgba(${awayColorRgb}, 0.6), 0 4px 12px rgba(0,0,0,0.4)`,
                    }}
                  >
                    {currentGame?.away_team || awayTeam?.school || 'AWAY'}
                  </span>
                </div>
                
                {/* Conference under team name */}
                {awayTeam?.conference && (
                  <div 
                    className="text-white/80 text-sm font-medium mb-1"
                    style={{ 
                      fontFamily: 'Orbitron, sans-serif',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {awayTeam.conference}
                  </div>
                )}
                
                {awayTeam?.mascot && (
                  <span 
                    className="text-white/70 text-xs font-medium"
                    style={{ 
                      fontFamily: 'Orbitron, sans-serif',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {awayTeam.mascot}
                  </span>
                )}
              </div>
              
              {/* Score Display */}
              {getTeamScore(false) !== null ? (
                <div 
                  className="text-white text-6xl font-black px-6 py-3 rounded-2xl"
                  style={{ 
                    textShadow: `0 4px 12px rgba(${awayColorRgb}, 0.8), 0 6px 16px rgba(0,0,0,0.5)`,
                    background: `linear-gradient(135deg, 
                      rgba(${awayColorRgb}, 0.2) 0%,
                      rgba(${awayColorRgb}, 0.1) 50%,
                      rgba(${awayColorRgb}, 0.2) 100%)`,
                    border: `1px solid rgba(${awayColorRgb}, 0.3)`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {getTeamScore(false)}
                </div>
              ) : (
                <div className="text-white/60 text-2xl font-bold" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                  --
                </div>
              )}
            </div>
            
            {/* Premium VS Separator */}
            <div className="flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255,255,255,0.2) 0%,
                    rgba(255,255,255,0.1) 50%,
                    rgba(255,255,255,0.2) 100%)`,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: `
                    0 8px 32px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.4),
                    inset 0 -1px 0 rgba(0,0,0,0.1)
                  `,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Animated ring */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, 
                      rgba(${awayColorRgb}, 0.3) 0deg,
                      transparent 90deg,
                      rgba(${homeColorRgb}, 0.3) 180deg,
                      transparent 270deg,
                      rgba(${awayColorRgb}, 0.3) 360deg)`,
                    animation: 'spin 15s linear infinite reverse',
                  }}
                />
                <span 
                  className="text-white font-black text-2xl relative z-10" 
                  style={{ 
                    fontFamily: 'Orbitron, sans-serif',
                    textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                  }}
                >
                  VS
                </span>
              </div>
              
              {/* Venue Info */}
              {currentGame?.venue && (
                <div 
                  className="text-center px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <i className="fas fa-map-marker-alt text-white/80 text-xs"></i>
                    <span 
                      className="text-white/90 text-xs font-medium"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {currentGame.venue}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Home Team - Ultra 3D Logo */}
            <div className="flex flex-col items-center group">
              {/* Ultra Enhanced 3D Team Logo */}
              <div className="relative mb-6">
                {/* 3D Shadow Layers */}
                <div 
                  className="absolute inset-0 w-32 h-32"
                  style={{
                    background: `radial-gradient(circle, rgba(${homeColorRgb}, 0.4) 0%, transparent 70%)`,
                    filter: 'blur(25px)',
                    transform: 'translateY(8px) scale(1.1)',
                  }}
                />
                <div 
                  className="absolute inset-0 w-32 h-32"
                  style={{
                    background: `radial-gradient(circle, rgba(${homeColorRgb}, 0.6) 0%, transparent 50%)`,
                    filter: 'blur(15px)',
                    transform: 'translateY(4px) scale(1.05)',
                  }}
                />
                <div 
                  className="absolute inset-0 w-32 h-32"
                  style={{
                    background: `radial-gradient(circle, rgba(0,0,0, 0.3) 0%, transparent 60%)`,
                    filter: 'blur(12px)',
                    transform: 'translateY(6px)',
                  }}
                />
                
                {/* Main Logo - Authentic Colors with 3D Effects */}
                <img
                  src={getTeamLogo(currentGame?.home_id || currentGame?.homeId)}
                  alt={homeTeam?.school || 'Home Team'}
                  className="w-32 h-32 object-contain relative z-10 group-hover:scale-110 transition-all duration-500"
                  style={{
                    filter: `
                      drop-shadow(0 0 15px rgba(${homeColorRgb}, 0.7))
                      drop-shadow(0 8px 25px rgba(0,0,0,0.4))
                      drop-shadow(0 15px 35px rgba(${homeColorRgb}, 0.3))
                      drop-shadow(0 0 8px rgba(255,255,255,0.2))
                    `,
                    transform: 'translateZ(20px)',
                  }}
                  onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                />
                
                {/* Glowing Ring Effect */}
                <div 
                  className="absolute inset-0 w-32 h-32 rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                  style={{
                    background: `conic-gradient(from 0deg, 
                      rgba(${homeColorRgb}, 0.8) 0deg,
                      transparent 60deg,
                      rgba(${homeColorRgb}, 0.4) 120deg,
                      transparent 180deg,
                      rgba(${homeColorRgb}, 0.6) 240deg,
                      transparent 300deg,
                      rgba(${homeColorRgb}, 0.8) 360deg)`,
                    filter: 'blur(8px)',
                    animation: 'spin 20s linear infinite reverse',
                    transform: 'scale(1.3)',
                  }}
                />
              </div>
              
              {/* Team Name with Enhanced Styling */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {/* Team Ranking Badge if available */}
                  {homeTeam?.ranking && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{
                        background: `linear-gradient(135deg, rgba(${homeColorRgb}, 1) 0%, rgba(${homeColorRgb}, 0.8) 100%)`,
                        boxShadow: `0 2px 8px rgba(${homeColorRgb}, 0.4)`,
                      }}
                    >
                      #{homeTeam.ranking}
                    </div>
                  )}
                  
                  <span 
                    className="text-white font-black text-xl tracking-wide" 
                    style={{ 
                      fontFamily: 'Orbitron, sans-serif', 
                      textShadow: `0 2px 8px rgba(${homeColorRgb}, 0.6), 0 4px 12px rgba(0,0,0,0.4)`,
                    }}
                  >
                    {currentGame?.home_team || homeTeam?.school || 'HOME'}
                  </span>
                </div>
                
                {/* Conference under team name */}
                {homeTeam?.conference && (
                  <div 
                    className="text-white/80 text-sm font-medium mb-1"
                    style={{ 
                      fontFamily: 'Orbitron, sans-serif',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {homeTeam.conference}
                  </div>
                )}
                
                {homeTeam?.mascot && (
                  <span 
                    className="text-white/70 text-xs font-medium"
                    style={{ 
                      fontFamily: 'Orbitron, sans-serif',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {homeTeam.mascot}
                  </span>
                )}
              </div>
              
              {/* Score Display */}
              {getTeamScore(true) !== null ? (
                <div 
                  className="text-white text-6xl font-black px-6 py-3 rounded-2xl"
                  style={{ 
                    textShadow: `0 4px 12px rgba(${homeColorRgb}, 0.8), 0 6px 16px rgba(0,0,0,0.5)`,
                    background: `linear-gradient(135deg, 
                      rgba(${homeColorRgb}, 0.2) 0%,
                      rgba(${homeColorRgb}, 0.1) 50%,
                      rgba(${homeColorRgb}, 0.2) 100%)`,
                    border: `1px solid rgba(${homeColorRgb}, 0.3)`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {getTeamScore(true)}
                </div>
              ) : (
                <div className="text-white/60 text-2xl font-bold" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                  --
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Team Color Shadow with Meeting Effect */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{
            background: `linear-gradient(90deg, 
              rgba(${awayColorRgb}, 0.8) 0%, 
              rgba(${awayColorRgb}, 0.6) 25%,
              rgba(${awayColorRgb}, 0.3) 45%,
              rgba(255,255,255, 0.2) 50%,
              rgba(${homeColorRgb}, 0.3) 55%,
              rgba(${homeColorRgb}, 0.6) 75%,
              rgba(${homeColorRgb}, 0.8) 100%)`,
            filter: 'blur(8px) brightness(1.2)',
            animation: 'shimmer 6s ease-in-out infinite alternate',
          }}
        />
        
        {/* Meeting Point Glow */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-2 w-32"
          style={{
            background: `radial-gradient(ellipse, 
              rgba(255,255,255, 0.6) 0%, 
              rgba(${awayColorRgb}, 0.4) 30%,
              rgba(${homeColorRgb}, 0.4) 70%,
              transparent 100%)`,
            boxShadow: `0 0 20px rgba(255,255,255, 0.4)`,
            animation: 'pulse 4s ease-in-out infinite',
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
        {selectedTab === 'overview' && (
          <GameOverview 
            game={currentGame}
            awayTeam={awayTeam}
            homeTeam={homeTeam}
          />
        )}
        {selectedTab === 'stats' && (
          <GameStats 
            game={currentGame}
            awayTeam={awayTeam}
            homeTeam={homeTeam}
          />
        )}
        {selectedTab === 'playByPlay' && (
          <GamePlayByPlay 
            game={currentGame}
            awayTeam={awayTeam}
            homeTeam={homeTeam}
          />
        )}
        {selectedTab === 'standings' && (
          <GameStandings 
            game={currentGame}
            awayTeam={awayTeam}
            homeTeam={homeTeam}
          />
        )}
        {selectedTab === 'chat' && (
          <GameChat 
            game={currentGame}
            awayTeam={awayTeam}
            homeTeam={homeTeam}
          />
        )}
      </div>
      
      {/* Additional CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-10px); opacity: 0.8; }
          100% { transform: translateX(10px); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default GameDetailView;