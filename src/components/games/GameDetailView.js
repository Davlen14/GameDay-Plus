import React, { useState, useEffect, useRef } from 'react';
import { gameService, teamService } from '../../services';

const GameDetailView = ({ gameId }) => {
  const scrollRef = useRef(null);
  
  // State management
  const [currentGame, setCurrentGame] = useState(null);
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [headerMode, setHeaderMode] = useState('expanded'); // expanded, compact, dynamicIsland
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDynamicIslandActive, setIsDynamicIslandActive] = useState(false);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);

  // Tab configuration
  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'fas fa-file-alt' },
    { id: 'stats', title: 'Stats', icon: 'fas fa-chart-bar' },
    { id: 'playByPlay', title: 'Plays', icon: 'fas fa-play-circle' },
    { id: 'standings', title: 'Standings', icon: 'fas fa-list-ol' },
    { id: 'chat', title: 'Chat', icon: 'fas fa-comments' }
  ];

  // Header modes
  const headerModes = [
    { id: 'expanded', title: 'Full', icon: 'fas fa-expand-arrows-alt' },
    { id: 'compact', title: 'Compact', icon: 'fas fa-compress-arrows-alt' },
    { id: 'dynamicIsland', title: 'Island', icon: 'fas fa-mobile-alt' }
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
              setGames(weekGames || []);
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
            if (foundGame) {
              setGames(postseasonGames || []);
            }
          } catch (error) {
            console.warn('Error loading postseason games:', error);
          }
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

  // Get team data
  const getTeam = (teamId) => teams.find(team => team.id === teamId) || {};
  const awayTeam = getTeam(currentGame.away_id || currentGame.awayId);
  const homeTeam = getTeam(currentGame.home_id || currentGame.homeId);

  // Get team colors (you can implement this based on your team data structure)
  const getTeamColor = (teamId) => {
    const team = getTeam(teamId);
    if (team.color) {
      return team.color;
    }
    return teamId === currentGame.away_id || teamId === currentGame.awayId ? '#3B82F6' : '#EF4444';
  };

  const awayColor = getTeamColor(currentGame.away_id || currentGame.awayId);
  const homeColor = getTeamColor(currentGame.home_id || currentGame.homeId);

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

  // Handle scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollOffset(scrollRef.current.scrollTop);
    }
  };

  // Game status
  const getGameStatus = () => {
    if (currentGame.completed) return 'FINAL';
    if (currentGame.home_points !== null || currentGame.away_points !== null) return 'LIVE';
    return 'UPCOMING';
  };

  // Dynamic Island functions
  const startDynamicIsland = () => {
    setIsDynamicIslandActive(true);
    // In a real app, you would start live activity here
    console.log('Starting Dynamic Island for game:', currentGame.id);
  };

  const stopDynamicIsland = () => {
    setIsDynamicIslandActive(false);
    console.log('Stopping Dynamic Island');
  };

  const handleHeaderModeChange = (mode) => {
    setHeaderMode(mode);
    if (mode === 'dynamicIsland') {
      startDynamicIsland();
    } else {
      stopDynamicIsland();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Dynamic Background Gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${awayColor}22 0%, ${homeColor}11 50%, transparent 100%)`
        }}
      />

      {/* Floating Header */}
      {headerMode !== 'dynamicIsland' || !isDynamicIslandActive ? (        <FloatingHeader
          game={currentGame}
          awayTeam={awayTeam}
          homeTeam={homeTeam}
          headerMode={headerMode}
          onBack={() => window.history.back()}
          formatDate={formatDate}
          getTeamLogo={getTeamLogo}
          getGameStatus={getGameStatus}
          awayColor={awayColor}
          homeColor={homeColor}
        />
      ) : (
        <DynamicIslandStatus 
          onBack={() => window.history.back()}
          isDynamicIslandActive={isDynamicIslandActive}
        />
      )}

      {/* Main Content */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-auto pt-0"
        style={{
          paddingTop: headerMode === 'dynamicIsland' && isDynamicIslandActive ? '80px' : 
                     headerMode === 'compact' ? '180px' : '320px'
        }}
      >
        {/* Content Container */}
        <div className="bg-white rounded-t-3xl shadow-2xl min-h-full relative z-10">
          {/* Tab Selector */}
          <div className="px-6 pt-10 pb-4">
            <ModernTabSelector
              tabs={tabs}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              awayColor={awayColor}
              homeColor={homeColor}
            />
          </div>

          {/* Tab Content */}
          <div className="px-6 pb-8">
            <TabContent 
              selectedTab={selectedTab}
              game={currentGame}
              awayTeam={awayTeam}
              homeTeam={homeTeam}
              isLoadingStandings={isLoadingStandings}
            />
          </div>

          {/* Header Mode Toggle */}
          <div className="px-6 pb-10">
            <HeaderModeToggle
              headerModes={headerModes}
              currentMode={headerMode}
              onModeChange={handleHeaderModeChange}
              isDynamicIslandActive={isDynamicIslandActive}
              awayColor={awayColor}
              homeColor={homeColor}
              game={currentGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Header Component
const FloatingHeader = ({ 
  game, 
  awayTeam, 
  homeTeam, 
  headerMode, 
  onBack, 
  formatDate, 
  getTeamLogo, 
  getGameStatus,
  awayColor,
  homeColor 
}) => {
  const HeaderContent = () => {
    switch (headerMode) {
      case 'compact':
        return <CompactScoreboard game={game} awayTeam={awayTeam} homeTeam={homeTeam} getTeamLogo={getTeamLogo} getGameStatus={getGameStatus} />;
      case 'expanded':
        return <ExpandedScoreboard game={game} awayTeam={awayTeam} homeTeam={homeTeam} getTeamLogo={getTeamLogo} getGameStatus={getGameStatus} formatDate={formatDate} />;
      default:
        return <ExpandedScoreboard game={game} awayTeam={awayTeam} homeTeam={homeTeam} getTeamLogo={getTeamLogo} getGameStatus={getGameStatus} formatDate={formatDate} />;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Status bar spacer */}
      <div className="h-12" />
      
      {/* Header container */}
      <div 
        className={`relative px-5 pb-5 ${headerMode === 'compact' ? 'pt-2' : 'pt-4'}`}
        style={{
          background: `linear-gradient(135deg, ${awayColor} 0%, ${awayColor}DD 25%, ${homeColor}CC 75%, ${homeColor}AA 100%)`,
          borderRadius: headerMode === 'compact' ? '0' : '0 0 30px 30px'
        }}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,${headerMode === 'compact' ? '0.7' : '0.1'}) 0%, rgba(0,0,0,${headerMode === 'compact' ? '0.5' : '0'}) 100%)`,
            borderRadius: headerMode === 'compact' ? '0' : '0 0 30px 30px'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {headerMode !== 'compact' && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-black bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <i className="fas fa-chevron-left text-white"></i>
                <span className="text-white font-semibold">Back</span>
              </button>
              
              {game.start_date && (
                <div className="bg-black bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white text-sm font-medium">{formatDate(game.start_date)}</span>
                </div>
              )}
            </div>
          )}
          
          <HeaderContent />
        </div>
      </div>
    </div>
  );
};

// Compact Scoreboard
const CompactScoreboard = ({ game, awayTeam, homeTeam, getTeamLogo, getGameStatus }) => (
  <div className="flex items-center justify-center space-x-6">
    <div className="flex items-center space-x-3">
      <img
        src={getTeamLogo(game.away_id || game.awayId)}
        alt={awayTeam.school}
        className="w-8 h-8 object-contain"
        onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
      />
      <span className="text-white text-xl font-bold">{game.away_points || 0}</span>
    </div>
    
    <div className="flex flex-col items-center">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <span className="text-white text-xs font-bold mt-1">{getGameStatus()}</span>
    </div>
    
    <div className="flex items-center space-x-3">
      <span className="text-white text-xl font-bold">{game.home_points || 0}</span>
      <img
        src={getTeamLogo(game.home_id || game.homeId)}
        alt={homeTeam.school}
        className="w-8 h-8 object-contain"
        onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
      />
    </div>
  </div>
);

// Expanded Scoreboard
const ExpandedScoreboard = ({ game, awayTeam, homeTeam, getTeamLogo, getGameStatus, formatDate }) => (
  <div className="text-center">
    <div className="flex items-center justify-center space-x-10 mb-4">
      {/* Away Team */}
      <div className="flex flex-col items-center">
        <img
          src={getTeamLogo(game.away_id || game.awayId)}
          alt={awayTeam.school}
          className="w-18 h-18 object-contain mb-2 drop-shadow-lg"
          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
        />
        <span className="text-white font-semibold text-sm">{game.away_team || awayTeam.school}</span>
        <span className="text-white text-4xl font-black">{game.away_points || 0}</span>
      </div>
      
      {/* Game Status */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mb-2 shadow-lg"></div>
        <span className="text-white text-xs font-bold">{getGameStatus()}</span>
      </div>
      
      {/* Home Team */}
      <div className="flex flex-col items-center">
        <img
          src={getTeamLogo(game.home_id || game.homeId)}
          alt={homeTeam.school}
          className="w-18 h-18 object-contain mb-2 drop-shadow-lg"
          onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
        />
        <span className="text-white font-semibold text-sm">{game.home_team || homeTeam.school}</span>
        <span className="text-white text-4xl font-black">{game.home_points || 0}</span>
      </div>
    </div>
    
    {/* Venue */}
    {game.venue && (
      <div className="flex items-center justify-center space-x-2 bg-black bg-opacity-20 rounded-full px-4 py-2 inline-flex">
        <i className="fas fa-map-marker-alt text-white text-sm"></i>
        <span className="text-white text-sm font-medium">{game.venue}</span>
      </div>
    )}
  </div>
);

// Dynamic Island Status
const DynamicIslandStatus = ({ onBack, isDynamicIslandActive }) => (
  <div className="fixed top-0 left-0 right-0 z-50 pt-16">
    <div className="flex items-center justify-between px-5">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 bg-gray-900 bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded-full"
      >
        <i className="fas fa-chevron-left text-white"></i>
        <span className="text-white font-semibold">Back</span>
      </button>
      
      <div className="flex items-center space-x-2 bg-gray-900 bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded-full">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-white text-sm font-medium">Live on Dynamic Island</span>
      </div>
    </div>
  </div>
);

// Modern Tab Selector
const ModernTabSelector = ({ tabs, selectedTab, onTabChange, awayColor, homeColor }) => (
  <div className="flex space-x-2 p-2 bg-gray-100 rounded-2xl">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 min-w-16 ${
          selectedTab === tab.id
            ? 'gradient-bg text-white shadow-lg transform scale-105'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
        style={selectedTab === tab.id ? {
          background: `linear-gradient(135deg, ${awayColor} 0%, ${homeColor} 100%)`,
          boxShadow: `0 4px 15px ${awayColor}40`
        } : {}}
      >
        <i className={`${tab.icon} text-sm mb-1`}></i>
        <span className="text-xs font-semibold">{tab.title}</span>
      </button>
    ))}
  </div>
);

// Tab Content
const TabContent = ({ selectedTab, game, awayTeam, homeTeam, isLoadingStandings }) => {
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

// Header Mode Toggle
const HeaderModeToggle = ({ 
  headerModes, 
  currentMode, 
  onModeChange, 
  isDynamicIslandActive, 
  awayColor, 
  homeColor,
  game 
}) => (
  <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
    {/* Title Section */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Header Display</h3>
        <p className="text-sm text-gray-600">
          {isDynamicIslandActive ? 'Game shown on Dynamic Island' : 'Choose your preferred header style'}
        </p>
      </div>
      
      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
        <div 
          className={`w-2 h-2 rounded-full ${isDynamicIslandActive ? 'bg-green-500' : 'bg-gray-400'}`}
          style={!isDynamicIslandActive ? {
            background: `linear-gradient(45deg, ${awayColor}, ${homeColor})`
          } : {}}
        />
        <span className="text-xs font-bold text-gray-600">
          {isDynamicIslandActive ? 'LIVE ISLAND' : currentMode.toUpperCase()}
        </span>
      </div>
    </div>
    
    {/* Mode Buttons */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {headerModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 transform ${
            currentMode === mode.id ? 'scale-105 shadow-lg' : 'hover:scale-102'
          }`}
          style={currentMode === mode.id ? {
            background: mode.id === 'dynamicIsland' && isDynamicIslandActive 
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : `linear-gradient(135deg, ${awayColor} 0%, ${homeColor} 100%)`,
            boxShadow: `0 8px 25px ${mode.id === 'dynamicIsland' && isDynamicIslandActive ? '#10B98140' : awayColor + '40'}`
          } : {
            background: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}
        >
          <div 
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
              currentMode === mode.id ? 'bg-white bg-opacity-20' : 'bg-gray-200'
            }`}
          >
            <i 
              className={`${mode.icon} text-lg ${
                currentMode === mode.id ? 'text-white' : 'text-gray-600'
              }`}
            />
          </div>
          <span 
            className={`text-sm font-semibold ${
              currentMode === mode.id ? 'text-white' : 'text-gray-700'
            }`}
          >
            {mode.id === 'dynamicIsland' && isDynamicIslandActive ? 'Active' : mode.title}
          </span>
        </button>
      ))}
    </div>
    
    {/* Dynamic Island Controls */}
    {currentMode === 'dynamicIsland' && (
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center space-x-3 mb-3">
          <i className="fas fa-mobile-alt text-gray-700"></i>
          <span className="font-semibold text-gray-900">Dynamic Island</span>
        </div>
        
        {isDynamicIslandActive ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-check-circle text-green-500"></i>
              <span className="text-sm text-gray-600">Game is live on your Dynamic Island</span>
            </div>
            <button 
              onClick={() => onModeChange('expanded')}
              className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full hover:bg-red-200 transition-colors"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <i className="fas fa-info-circle text-blue-500"></i>
            <span className="text-sm text-gray-600">Tap 'Island' above to show game on Dynamic Island</span>
          </div>
        )}
      </div>
    )}
  </div>
);

export default GameDetailView;
