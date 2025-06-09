import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { teamService } from '../../services/teamService';
import { gameService } from '../../services/gameService';
import { rankingsService } from '../../services/rankingsService';

const ADVScheduleTab = ({ team, primaryTeamColor }) => {
  const [selectedScheduleTab, setSelectedScheduleTab] = useState(1); // Start with Completed like SwiftUI
  const [animateScheduleCards, setAnimateScheduleCards] = useState(false);
  const [animateShine, setAnimateShine] = useState(false);
  
  // Data states
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [completedGames, setCompletedGames] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Expanded game tracking
  const [expandedGameIds, setExpandedGameIds] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const scheduleTabTitles = ["UPCOMING", "COMPLETED", "ANALYSIS"];

  // Convert hex to RGB for CSS
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 220, g: 38, b: 38 };
  };

  const teamRgb = hexToRgb(primaryTeamColor);
  const teamColorRgb = `${teamRgb.r}, ${teamRgb.g}, ${teamRgb.b}`;

  // Confetti pieces for animation
  const confettiPieces = useMemo(() => 
    [...Array(100)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1000,
      duration: 2000 + Math.random() * 2000,
      color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 8)],
    })), []
  );

  // Load schedule data using your actual API services
  const loadScheduleData = useCallback(async () => {
    setIsLoadingSchedule(true);
    setErrorMessage(null);
    
    try {
      // Load all teams using your teamService
      const fbsTeams = await teamService.getFBSTeams(true);
      setAllTeams(fbsTeams);
      
      // Load rankings using your rankingsService
      let loadedRankings = [];
      try {
        // Try to get final 2024 AP Poll rankings
        const apPollData = await rankingsService.getAPPoll(2024);
        if (apPollData && apPollData.length > 0) {
          // Get the most recent AP poll
          const latestPoll = apPollData[apPollData.length - 1];
          loadedRankings = latestPoll.ranks || [];
        }
      } catch (rankingError) {
        console.warn('Error loading AP Poll:', rankingError);
        // Try alternative ranking method
        try {
          const historicalRankings = await rankingsService.getHistoricalRankings(2024, null, 'postseason');
          const apPoll = historicalRankings.find(poll => poll.poll === 'AP Top 25');
          loadedRankings = apPoll?.ranks || [];
        } catch (fallbackError) {
          console.warn('Error loading historical rankings:', fallbackError);
          loadedRankings = [];
        }
      }
      setRankings(loadedRankings);
      
      // Load 2024 completed games using your gameService
      let completed2024Games = [];
      
      // Load regular season games (weeks 1-15)
      for (let week = 1; week <= 15; week++) {
        try {
          const weekGames = await gameService.getGamesByWeek(2024, week, 'regular');
          if (weekGames && weekGames.length > 0) {
            completed2024Games.push(...weekGames);
          }
        } catch (weekError) {
          console.warn(`Could not load 2024 week ${week}:`, weekError);
          continue;
        }
      }
      
      // Load 2024 postseason games (similar to SwiftUI loadScheduleData)
      try {
        const postseasonGames = await gameService.getGames(2024, null, 'postseason');
        if (postseasonGames && postseasonGames.length > 0) {
          // Mark postseason games for special styling
          const markedPostseasonGames = postseasonGames.map(game => ({
            ...game,
            seasonType: 'postseason',
            isPostseason: true,
            isBowlGame: true
          }));
          completed2024Games.push(...markedPostseasonGames);
          console.log(`🏆 Loaded ${markedPostseasonGames.length} postseason games for 2024`);
        }
      } catch (postseasonError) {
        console.warn('Could not load 2024 postseason games:', postseasonError);
      }
      
      // Load 2025 upcoming games using your gameService
      let upcoming2025Games = [];
      
      // Try to load 2025 season games
      for (let week = 1; week <= 15; week++) {
        try {
          const weekGames = await gameService.getGamesByWeek(2025, week, 'regular');
          if (weekGames && weekGames.length > 0) {
            upcoming2025Games.push(...weekGames);
          }
        } catch (weekError) {
          // 2025 games might not be available yet
          continue;
        }
      }
      
      // Try to load 2025 postseason games
      try {
        const postseason2025Games = await gameService.getGames(2025, null, 'postseason');
        if (postseason2025Games && postseason2025Games.length > 0) {
          // Mark postseason games for special styling
          const markedPostseason2025Games = postseason2025Games.map(game => ({
            ...game,
            seasonType: 'postseason',
            isPostseason: true,
            isBowlGame: true
          }));
          upcoming2025Games.push(...markedPostseason2025Games);
          console.log(`🏆 Loaded ${markedPostseason2025Games.length} postseason games for 2025`);
        }
      } catch (postseasonError) {
        // 2025 postseason not available yet
      }
      
      console.log(`🔍 Total games loaded - 2024: ${completed2024Games.length}, 2025: ${upcoming2025Games.length}`);
      
      // Filter games for this team
      const filterTeamGames = (games) => {
        return games.filter(game => {
          // Normalize team names for comparison
          const teamName = team.school.toLowerCase().trim();
          const homeTeam = (game.home_team || game.homeTeam || '').toLowerCase().trim();
          const awayTeam = (game.away_team || game.awayTeam || '').toLowerCase().trim();
          
          // Check by name and ID
          const homeMatch = homeTeam === teamName;
          const awayMatch = awayTeam === teamName;
          const homeIdMatch = (game.home_id || game.homeId) === team.id;
          const awayIdMatch = (game.away_id || game.awayId) === team.id;
          
          return homeMatch || awayMatch || homeIdMatch || awayIdMatch;
        }).map(game => ({
          // Normalize the game object structure
          id: game.id,
          homeTeam: game.home_team || game.homeTeam,
          awayTeam: game.away_team || game.awayTeam,
          homeId: game.home_id || game.homeId,
          awayId: game.away_id || game.awayId,
          homePoints: game.home_points || game.homePoints,
          awayPoints: game.away_points || game.awayPoints,
          homeConference: game.home_conference || game.homeConference,
          awayConference: game.away_conference || game.awayConference,
          week: game.week,
          season: game.season,
          completed: game.completed,
          conferenceGame: game.conference_game || game.conferenceGame,
          neutralSite: game.neutral_site || game.neutralSite,
          seasonType: game.season_type || game.seasonType,
          startDate: game.start_date || game.startDate,
          venue: game.venue,
          notes: game.notes,
          // Preserve postseason properties for gold gradient styling
          isPostseason: game.isPostseason || game.seasonType === 'postseason',
          isBowlGame: game.isBowlGame || game.seasonType === 'postseason'
        }));
      };
      
      const team2024Games = filterTeamGames(completed2024Games);
      const team2025Games = filterTeamGames(upcoming2025Games);
      
      console.log(`🎯 Filtered games for ${team.school} - 2024: ${team2024Games.length}, 2025: ${team2025Games.length}`);
      
      // Debug: Print first few games
      if (team2024Games.length > 0) {
        console.log('📋 Sample 2024 games:');
        team2024Games.slice(0, 3).forEach(game => {
          console.log(`   - ${game.homeTeam} vs ${game.awayTeam} (Week ${game.week})`);
        });
      }
      
      if (team2025Games.length > 0) {
        console.log('📋 Sample 2025 games:');
        team2025Games.slice(0, 3).forEach(game => {
          console.log(`   - ${game.homeTeam} vs ${game.awayTeam} (Week ${game.week})`);
        });
      }
      
      // Set the filtered and sorted games
      setCompletedGames(team2024Games.sort((a, b) => (a.week || 0) - (b.week || 0)));
      setUpcomingGames(team2025Games.sort((a, b) => (a.week || 0) - (b.week || 0)));
      
      console.log('✅ Schedule loaded successfully for', team.school);
      
    } catch (error) {
      setErrorMessage(error.message);
      console.error('❌ Error loading schedule for', team.school, ':', error);
    } finally {
      setIsLoadingSchedule(false);
    }
  }, [team]);

  useEffect(() => {
    loadScheduleData();
    
    // Start animations
    const timer1 = setTimeout(() => setAnimateShine(true), 500);
    const timer2 = setTimeout(() => setAnimateScheduleCards(true), 100);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [loadScheduleData]);

  // Helper functions
  
  // Create gold metallic gradient (similar to SwiftUI goldMetallicGradient)
  const getGoldMetallicGradient = () => {
    return 'linear-gradient(135deg, #ffd700 0%, #ffb700 25%, #ffd700 50%, #ffb700 75%, #ffd700 100%)';
  };
  
  // Enhanced postseason detection
  const isPostseasonGame = (game) => {
    return game.seasonType === 'postseason' || game.isPostseason || game.isBowlGame;
  };

  const calculateRecord = () => {
    if (completedGames.length === 0) return "0-0";
    const wins = completedGames.filter(game => {
      const isHome = game.homeTeam?.toLowerCase() === team.school.toLowerCase();
      return isHome ? (game.homePoints > game.awayPoints) : (game.awayPoints > game.homePoints);
    }).length;
    return `${wins}-${completedGames.length - wins}`;
  };

  const calculateConferenceRecord = () => {
    const conferenceGames = completedGames.filter(game => game.conferenceGame);
    if (conferenceGames.length === 0) return "0-0";
    const wins = conferenceGames.filter(game => {
      const isHome = game.homeTeam?.toLowerCase() === team.school.toLowerCase();
      return isHome ? (game.homePoints > game.awayPoints) : (game.awayPoints > game.homePoints);
    }).length;
    return `${wins}-${conferenceGames.length - wins}`;
  };

  const calculateHomeRecord = () => {
    const homeGames = completedGames.filter(game => 
      game.homeTeam?.toLowerCase() === team.school.toLowerCase()
    );
    if (homeGames.length === 0) return "0-0";
    const wins = homeGames.filter(game => game.homePoints > game.awayPoints).length;
    return `${wins}-${homeGames.length - wins}`;
  };

  const toggleGameExpansion = (gameId) => {
    setExpandedGameIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
        // Check for championship game
        const game = [...completedGames, ...upcomingGames].find(g => g.id === gameId);
        if (game?.notes?.toLowerCase().includes('championship')) {
          triggerConfetti();
        }
      }
      return newSet;
    });
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const getTeamLogo = (teamName) => {
    const foundTeam = allTeams.find(t => t.school?.toLowerCase() === teamName?.toLowerCase());
    return foundTeam?.logos?.[0] || '/photos/ncaaf.png';
  };

  // Modern Section Header Component
  const ModernSectionHeader = ({ title, subtitle, icon }) => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div 
          className="text-2xl font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' }}
        >
          <i className={`fas ${icon}`}></i>
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {title}
          </h2>
          <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  // Season Overview Card Component
  const SeasonOverviewCard = () => (
    <div 
      className={`p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl border shadow-xl transition-all duration-700 ${
        animateScheduleCards ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
      style={{ 
        borderColor: `rgba(${teamColorRgb}, 0.2)`,
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="text-lg font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' }}
        >
          <i className="fas fa-trophy"></i>
        </div>
        <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          2024 Season Recap
        </h3>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {[
          { title: "Record", value: calculateRecord(), subtitle: "Overall" },
          { title: "Conference", value: calculateConferenceRecord(), subtitle: team.conference || "Conference" },
          { title: "Home", value: calculateHomeRecord(), subtitle: "Home Games" },
          { title: "Games", value: completedGames.length.toString(), subtitle: "Total" }
        ].map((stat, index) => (
          <div key={index} className="text-center py-3 bg-white rounded-lg">
            <div 
              className="text-lg font-black mb-1"
              style={{ fontFamily: 'Orbitron, sans-serif', color: primaryTeamColor }}
            >
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {stat.title}
            </div>
            <div className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {stat.subtitle}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Schedule Tab Selector Component
  const ScheduleTabSelector = () => (
    <div className="bg-gray-50 p-1 rounded-lg">
      <div className="flex gap-1">
        {scheduleTabTitles.map((title, index) => (
          <button
            key={index}
            onClick={() => setSelectedScheduleTab(index)}
            className={`flex-1 py-3 px-4 text-xs font-bold rounded-md transition-all duration-300 ${
              selectedScheduleTab === index
                ? 'text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 bg-gray-100'
            }`}
            style={selectedScheduleTab === index ? {
              background: primaryTeamColor,
              boxShadow: `0 2px 8px rgba(${teamColorRgb}, 0.3)`,
              fontFamily: 'Orbitron, sans-serif'
            } : { fontFamily: 'Orbitron, sans-serif' }}
          >
            {title}
          </button>
        ))}
      </div>
    </div>
  );

  // Game Card Component
  const GameCard = ({ game, isUpcoming }) => {
    const isHome = game.homeTeam?.toLowerCase() === team.school.toLowerCase();
    const opponent = isHome ? game.awayTeam : game.homeTeam;
    const opponentId = isHome ? game.awayId : game.homeId;
    const isExpanded = expandedGameIds.has(game.id);
    
    const getGameResult = () => {
      if (!game.homePoints || !game.awayPoints) return null;
      const userScore = isHome ? game.homePoints : game.awayPoints;
      const opponentScore = isHome ? game.awayPoints : game.homePoints;
      return {
        userScore,
        opponentScore,
        isWin: userScore > opponentScore
      };
    };

    const result = getGameResult();
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getLocationInfo = () => {
      if (game.neutralSite) return "Neutral Site";
      return isHome ? "Home" : "Away";
    };

    const getGameType = () => {
      if (game.seasonType === "postseason") {
        return game.notes || "Bowl Game";
      } else if (game.notes) {
        return game.notes;
      } else if (game.conferenceGame) {
        return "Conference Game";
      } else {
        return "Non-Conference";
      }
    };

    return (
      <div 
        className={`bg-gradient-to-br from-white to-blue-50 rounded-2xl border shadow-xl transition-all duration-500 overflow-hidden ${
          animateScheduleCards ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={{
          borderColor: isPostseasonGame(game)
            ? 'rgba(255, 215, 0, 0.6)' 
            : isUpcoming 
              ? `rgba(${teamColorRgb}, 0.3)` 
              : result?.isWin 
                ? 'rgba(34, 197, 94, 0.3)' 
                : 'rgba(239, 68, 68, 0.3)',
          background: isPostseasonGame(game) 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(219, 234, 254, 0.3) 100%)',
          boxShadow: isPostseasonGame(game)
            ? '0 8px 32px rgba(255, 215, 0, 0.25), 0 0 20px rgba(255, 215, 0, 0.1)'
            : '0 6px 20px rgba(0,0,0,0.08)'
        }}
      >
        {/* Main Game Info */}
        <div className="p-6">
          {/* Game Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {opponent}
                </h3>
                
                {/* Badges */}
                <div className="flex gap-2">
                  {game.conferenceGame && (
                    <span 
                      className="text-xs font-bold text-white px-2 py-1 rounded-sm"
                      style={{ backgroundColor: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}
                    >
                      CONF
                    </span>
                  )}
                  {isPostseasonGame(game) && (
                    <span 
                      className="text-xs font-bold text-white px-2 py-1 rounded-sm"
                      style={{ 
                        background: getGoldMetallicGradient(),
                        fontFamily: 'Orbitron, sans-serif',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        boxShadow: '0 2px 6px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      BOWL
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {getGameType()}
              </p>
            </div>
            
            <div className="text-right">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className={`w-2 h-2 rounded-full ${game.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                ></div>
                <span 
                  className="text-xs font-bold text-white px-3 py-2 rounded-lg"
                  style={{
                    background: isPostseasonGame(game)
                      ? getGoldMetallicGradient()
                      : game.completed
                        ? `linear-gradient(135deg, rgba(${teamColorRgb}, 1), rgba(${teamColorRgb}, 0.8))`
                        : `linear-gradient(135deg, rgba(${teamColorRgb}, 1), rgba(${teamColorRgb}, 0.8))`,
                    fontFamily: 'Orbitron, sans-serif',
                    textShadow: isPostseasonGame(game) ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    boxShadow: isPostseasonGame(game) 
                      ? '0 2px 8px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                      : 'none'
                  }}
                >
                  {game.completed ? "FINAL" : isPostseasonGame(game) ? "BOWL" : "UPCOMING"}
                </span>
              </div>
              
              {/* Team Logo */}
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={getTeamLogo(opponent)}
                  alt={opponent}
                  className="w-full h-full object-contain metallic-3d-logo-enhanced"
                  onError={(e) => {
                    e.target.src = '/photos/ncaaf.png';
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Score and Details */}
          <div>
            {result && (
              <div className="flex items-center gap-4 mb-4">
                <span 
                  className="text-3xl font-black"
                  style={{ 
                    color: result.isWin ? '#10b981' : '#ef4444',
                    fontFamily: 'Orbitron, sans-serif'
                  }}
                >
                  {result.userScore}
                </span>
                <span className="text-xl text-gray-600">-</span>
                <span 
                  className="text-3xl font-black"
                  style={{ 
                    color: result.isWin ? '#6b7280' : '#ef4444',
                    fontFamily: 'Orbitron, sans-serif'
                  }}
                >
                  {result.opponentScore}
                </span>
                <span 
                  className={`text-sm font-black text-white px-2 py-1 rounded ${
                    result.isWin ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {result.isWin ? 'W' : 'L'}
                </span>
              </div>
            )}
            
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fas fa-calendar text-xs"></i>
                <span style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {formatDate(game.startDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fas fa-map-marker-alt text-xs"></i>
                <span style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {getLocationInfo()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-lg font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Matchup Analysis
                </h4>
              </div>
              
              {/* Team Comparison */}
              <div className="grid grid-cols-3 gap-6 items-center">
                {/* User Team */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <img 
                      src={getTeamLogo(team.school)}
                      alt={team.school}
                      className="w-full h-full object-contain metallic-3d-logo-enhanced"
                      onError={(e) => {
                        e.target.src = '/photos/ncaaf.png';
                      }}
                    />
                  </div>
                  <h5 
                    className="font-bold mb-2" 
                    style={{ color: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {team.school}
                  </h5>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {team.conference || "Independent"}
                    </p>
                    <span 
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        isHome ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {isHome ? 'HOME' : 'AWAY'}
                    </span>
                  </div>
                </div>
                
                {/* VS */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg border">
                    <span className="text-sm font-black text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      VS
                    </span>
                  </div>
                </div>
                
                {/* Opponent */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <img 
                      src={getTeamLogo(opponent)}
                      alt={opponent}
                      className="w-full h-full object-contain metallic-3d-logo-enhanced"
                      onError={(e) => {
                        e.target.src = '/photos/ncaaf.png';
                      }}
                    />
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {opponent}
                  </h5>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Conference
                    </p>
                    <span 
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        !isHome ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {!isHome ? 'HOME' : 'AWAY'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="mt-6 space-y-2">
                {isPostseasonGame(game) && (
                  <div 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 248, 220, 0.2))',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <i 
                      className="fas fa-trophy"
                      style={{ 
                        background: getGoldMetallicGradient(),
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '16px'
                      }}
                    ></i>
                    <span 
                      className="text-sm font-bold"
                      style={{ 
                        fontFamily: 'Orbitron, sans-serif',
                        background: getGoldMetallicGradient(),
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {game.notes || 'Bowl Game / Playoff'}
                    </span>
                  </div>
                )}
                {game.neutralSite && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <i className="fas fa-map-pin"></i>
                    <span className="text-sm font-medium" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Neutral Site Game
                    </span>
                  </div>
                )}
                {game.conferenceGame && (
                  <div className="flex items-center gap-2" style={{ color: primaryTeamColor }}>
                    <i className="fas fa-building"></i>
                    <span className="text-sm font-medium" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Conference Matchup
                    </span>
                  </div>
                )}
                {game.venue && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <i className="fas fa-building"></i>
                    <span className="text-sm font-medium" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {game.venue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Expand Button */}
        <button
          onClick={() => toggleGameExpansion(game.id)}
          className="w-full py-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 transition-all duration-300 flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              <i className="fas fa-eye"></i>
            </div>
            <span 
              className="text-sm font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Game Preview
            </span>
          </div>
          <div 
            className={`text-sm font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <i className="fas fa-chevron-down"></i>
          </div>
        </button>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = ({ icon, title, subtitle }) => (
    <div className="text-center py-20">
      <div 
        className="text-4xl mb-4 opacity-50"
        style={{ color: primaryTeamColor }}
      >
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        {title}
      </h3>
      <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        {subtitle}
      </p>
    </div>
  );

  // Loading View
  if (isLoadingSchedule) {
    return (
      <div className="text-center py-20">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-4 border-transparent mx-auto mb-6"
          style={{ 
            background: `conic-gradient(from 0deg, transparent, rgba(${teamColorRgb}, 1))`,
            borderRadius: '50%'
          }}
        ></div>
        <p className="text-lg text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Loading schedule...
        </p>
      </div>
    );
  }

  // Error View
  if (errorMessage) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-6" style={{ color: primaryTeamColor }}>
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Failed to load schedule
        </h3>
        <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
        <button
          onClick={loadScheduleData}
          className="px-6 py-3 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg"
          style={{ 
            backgroundColor: primaryTeamColor,
            fontFamily: 'Orbitron, sans-serif'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2 h-4 rounded-sm animate-bounce"
              style={{
                left: `${piece.left}%`,
                top: '-20px',
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}ms`,
                animationDuration: `${piece.duration}ms`,
                transform: `translateY(calc(100vh + 100px)) rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <ModernSectionHeader 
          title="2024-25 Season Schedule"
          subtitle="Game-by-Game Analysis"
          icon="fa-calendar-alt"
        />

        {/* Season Overview Card */}
        <SeasonOverviewCard />

        {/* Schedule Tab Selection */}
        <ScheduleTabSelector />

        {/* Tab Content */}
        <div className="space-y-4">
          {selectedScheduleTab === 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Upcoming Games
                </h3>
                <span 
                  className="text-xs font-medium text-white px-3 py-2 rounded-lg"
                  style={{ backgroundColor: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}
                >
                  {upcomingGames.length} games
                </span>
              </div>
              
              {upcomingGames.length === 0 ? (
                <EmptyState 
                  icon="fa-calendar-plus"
                  title="No Upcoming Games"
                  subtitle="2025 schedule not yet released"
                />
              ) : (
                <div className="space-y-4">
                  {upcomingGames.map((game, index) => (
                    <div 
                      key={game.id}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animationDuration: '600ms'
                      }}
                    >
                      <GameCard game={game} isUpcoming={true} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedScheduleTab === 1 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Completed Games
                </h3>
                <span 
                  className="text-xs font-medium text-white px-3 py-2 rounded-lg"
                  style={{ backgroundColor: primaryTeamColor, fontFamily: 'Orbitron, sans-serif' }}
                >
                  {completedGames.length} games
                </span>
              </div>
              
              {completedGames.length === 0 ? (
                <EmptyState 
                  icon="fa-calendar-check"
                  title="No Completed Games"
                  subtitle="2024 season data not available"
                />
              ) : (
                <div className="space-y-4">
                  {completedGames.map((game, index) => (
                    <div 
                      key={game.id}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animationDuration: '600ms'
                      }}
                    >
                      <GameCard game={game} isUpcoming={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedScheduleTab === 2 && (
            <div className="space-y-6">
              {/* Schedule Analysis Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strength of Schedule */}
                <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl border shadow-xl" style={{ borderColor: `rgba(${teamColorRgb}, 0.2)` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-lg font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Schedule Analysis
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { title: "Conference", value: [...completedGames, ...upcomingGames].filter(g => g.conferenceGame).length },
                      { title: "Neutral Site", value: [...completedGames, ...upcomingGames].filter(g => g.neutralSite).length },
                      { title: "Total", value: completedGames.length + upcomingGames.length }
                    ].map((stat, index) => (
                      <div key={index} className="text-center py-3 bg-white rounded-lg">
                        <div 
                          className="text-lg font-black mb-1"
                          style={{ fontFamily: 'Orbitron, sans-serif', color: primaryTeamColor }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {stat.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Overview */}
                <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl border shadow-xl" style={{ borderColor: `rgba(${teamColorRgb}, 0.2)` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-lg font-bold bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Performance Overview
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { title: "Games Played", value: completedGames.length },
                      { title: "Wins", value: completedGames.filter(game => {
                        const isHome = game.homeTeam?.toLowerCase() === team.school.toLowerCase();
                        return isHome ? (game.homePoints > game.awayPoints) : (game.awayPoints > game.homePoints);
                      }).length },
                      { title: "Conference Record", value: calculateConferenceRecord() }
                    ].map((stat, index) => (
                      <div key={index} className="flex justify-between items-center px-3">
                        <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {stat.title}
                        </span>
                        <span 
                          className="text-sm font-bold"
                          style={{ fontFamily: 'Orbitron, sans-serif', color: primaryTeamColor }}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ADVScheduleTab;