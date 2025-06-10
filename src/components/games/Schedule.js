import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { gameService, teamService, rankingsService } from '../../services';

// Enhanced Weather Icon Component with futuristic HD animations and modern gradients
const WeatherIcon = ({ condition, temperature }) => {
  const getWeatherIcon = () => {
    if (!condition) return 'fas fa-microchip';
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return 'fas fa-circle';
    if (cond.includes('partly') || cond.includes('scattered')) return 'fas fa-adjust';
    if (cond.includes('cloud') || cond.includes('overcast')) return 'fas fa-wifi';
    if (cond.includes('rain') || cond.includes('shower')) return 'fas fa-grip-lines';
    if (cond.includes('snow') || cond.includes('blizzard')) return 'fas fa-snowflake';
    if (cond.includes('storm') || cond.includes('thunder')) return 'fas fa-bolt';
    if (cond.includes('fog') || cond.includes('mist')) return 'fas fa-cloud';
    if (cond.includes('wind')) return 'fas fa-hurricane';
    if (cond.includes('night')) return 'fas fa-moon';
    return 'fas fa-satellite';
  };

  const getTemperatureGradient = () => {
    if (!temperature) return 'from-slate-400 to-slate-600';
    
    if (temperature >= 90) return 'brand-gradient-bg'; // Hot - Brand gradient
    if (temperature >= 80) return 'from-amber-400 via-orange-500 to-red-500'; // Warm
    if (temperature >= 70) return 'from-emerald-400 via-teal-500 to-cyan-500'; // Perfect
    if (temperature >= 50) return 'from-sky-400 via-blue-500 to-indigo-500'; // Cool
    if (temperature >= 32) return 'from-blue-500 via-purple-500 to-violet-600'; // Cold
    return 'from-indigo-600 via-purple-700 to-blue-800'; // Very Cold
  };

  const getWeatherAnimation = () => {
    if (!condition) return 'animate-pulse';
    const cond = condition.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return 'animate-spin';
    if (cond.includes('rain')) return 'animate-pulse';
    if (cond.includes('snow')) return 'animate-ping';
    if (cond.includes('storm')) return 'animate-bounce';
    if (cond.includes('cloud')) return 'animate-pulse';
    return 'animate-pulse';
  };

  const getWeatherGlow = () => {
    if (!condition) return 'drop-shadow-[0_0_15px_rgba(100,116,139,0.6)]';
    const cond = condition.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return 'drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]';
    if (cond.includes('rain')) return 'drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]';
    if (cond.includes('snow')) return 'drop-shadow-[0_0_15px_rgba(219,234,254,0.8)]';
    if (cond.includes('storm')) return 'drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]';
    return 'drop-shadow-[0_0_12px_rgba(100,116,139,0.5)]';
  };

  return (
    <div className="relative">
      {/* Futuristic Weather Icon Container */}
      <div className="relative flex items-center space-x-4">
        {/* Modern Weather Icon */}
        <div className="relative">
          <div 
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getTemperatureGradient()} p-4 shadow-2xl backdrop-blur-xl border border-white/20`}
            style={{
              boxShadow: `
                0 10px 40px rgba(0,0,0,0.15),
                inset 0 2px 10px rgba(255,255,255,0.3),
                0 0 0 1px rgba(255,255,255,0.1)
              `
            }}
          >
            <i 
              className={`${getWeatherIcon()} text-white text-lg ${getWeatherAnimation()} ${getWeatherGlow()}`}
              style={{ 
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                transform: 'scale(1.1)'
              }}
            />
            
            {/* Futuristic corner accents */}
            <div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-white/40 rounded-tl"></div>
            <div className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-white/40 rounded-tr"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-white/40 rounded-bl"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white/40 rounded-br"></div>
          </div>
          
          {/* Modern weather effects */}
          {condition?.toLowerCase().includes('rain') && (
            <div className="absolute -top-1 -right-1">
              <div className="w-1 h-4 bg-blue-400/80 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="absolute top-1 left-2 w-1 h-3 bg-blue-300/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
          
          {condition?.toLowerCase().includes('snow') && (
            <div className="absolute -top-2 -right-2 w-2 h-2 bg-white/90 rounded-full animate-ping"></div>
          )}
          
          {(condition?.toLowerCase().includes('sunny') || condition?.toLowerCase().includes('clear')) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300/80 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Futuristic Temperature Display */}
        {temperature && (
          <div className="relative">
            <div 
              className={`px-5 py-3 rounded-xl bg-gradient-to-r ${getTemperatureGradient()} text-white font-black text-lg shadow-xl backdrop-blur-xl border border-white/20`}
              style={{
                boxShadow: `
                  0 10px 30px rgba(0,0,0,0.2),
                  inset 0 1px 6px rgba(255,255,255,0.3)
                `
              }}
            >
              <span className="drop-shadow-lg font-mono tracking-wider">{Math.round(temperature)}°</span>
              
              {/* Futuristic UI elements */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            </div>
            
            {/* Temperature status indicators */}
            {temperature >= 90 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400/80 rounded-full animate-pulse border border-white/30"></div>
            )}
            {temperature <= 32 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-200/80 rounded-full animate-pulse border border-white/30"></div>
            )}
          </div>
        )}
      </div>

      {/* Modern condition display */}
      {condition && (
        <div className="mt-3 text-xs font-medium text-gray-600 capitalize text-center tracking-wide">
          <span className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
            {condition}
          </span>
        </div>
      )}
    </div>
  );
};

// Enhanced Utility Components
const ExcitementStars = ({ excitementIndex = 0 }) => {
  const stars = Math.min(Math.max(Math.round(excitementIndex / 2), 0), 5);
  const getStarGradient = () => {
    if (excitementIndex >= 8) return 'from-amber-300 via-orange-400 to-red-500';
    if (excitementIndex >= 6) return 'from-yellow-400 via-amber-500 to-orange-500';
    if (excitementIndex >= 4) return 'from-emerald-400 via-teal-500 to-cyan-500';
    return 'from-slate-300 to-slate-500';
  };

  const getGlow = () => {
    if (excitementIndex >= 8) return 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]';
    if (excitementIndex >= 6) return 'drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]';
    if (excitementIndex >= 4) return 'drop-shadow-[0_0_4px_rgba(20,184,166,0.4)]';
    return '';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-sm ${i < stars ? `bg-gradient-to-br ${getStarGradient()}` : 'bg-slate-200/60'} shadow-lg transition-all duration-300 hover:scale-110 border border-white/20`}
            style={i < stars ? {
              boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
              filter: getGlow()
            } : {}}
          />
        ))}
      </div>
      <span className="text-sm font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent font-mono">
        {excitementIndex ? excitementIndex.toFixed(1) : 'N/A'}
      </span>
    </div>
  );
};

const WinProbabilityChart = ({ homeTeam, awayTeam, homeProb, awayProb, homeTeamId, awayTeamId, getTeamLogo }) => {
  if (!homeProb && !awayProb) return null;
  
  const homePct = homeProb ? Math.round(homeProb * 100) : 50;
  const awayPct = awayProb ? Math.round(awayProb * 100) : 50;
  
  return (
    <div 
      className="relative bg-white/30 backdrop-blur-2xl rounded-3xl border border-white/40 p-6 shadow-2xl"
      style={{
        boxShadow: `
          0 25px 50px rgba(0,0,0,0.1),
          inset 0 1px 6px rgba(255,255,255,0.2),
          0 0 0 1px rgba(255,255,255,0.05)
        `
      }}
    >
      {/* Liquid glass highlight */}
      <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="text-sm font-bold text-gray-700 mb-4 text-center flex items-center justify-center space-x-2">
          <div className="w-6 h-6 rounded-full brand-gradient-to-br flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-xs"></i>
          </div>
          <span>Win Probability</span>
        </div>
        
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 p-2 flex items-center justify-center">
              <img 
                src={getTeamLogo(awayTeamId)} 
                alt={awayTeam}
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) saturate(1.3) contrast(1.2) brightness(1.1)'
                }}
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-800">{awayTeam}</span>
                <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{awayPct}%</span>
              </div>
              <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${awayPct}%`,
                    background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)`,
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Home Team */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 p-2 flex items-center justify-center">
              <img 
                src={getTeamLogo(homeTeamId)} 
                alt={homeTeam}
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) saturate(1.3) contrast(1.2) brightness(1.1)'
                }}
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-800">{homeTeam}</span>
                <span className="text-lg font-black gradient-text">{homePct}%</span>
              </div>
              <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${homePct}%`,
                    background: `linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)`,
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EloRatingDisplay = ({ preGameElo, postGameElo, teamName, isCompleted }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!preGameElo) return null;
  
  const eloChange = postGameElo && isCompleted ? postGameElo - preGameElo : 0;
  const eloLevel = preGameElo >= 2000 ? 'Elite' : preGameElo >= 1800 ? 'Strong' : preGameElo >= 1600 ? 'Good' : 'Developing';
  
  return (
    <div className="relative">
      <div 
        className="bg-white/25 backdrop-blur-xl px-3 py-2 rounded-xl text-xs cursor-help glassy-hover border border-white/30"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-xs" />
          </div>
          <span className="font-bold text-gray-700">{preGameElo}</span>
          <span className="text-gray-500">({eloLevel})</span>
          {isCompleted && eloChange !== 0 && (
            <span className={`font-bold ${eloChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {eloChange > 0 ? '+' : ''}{eloChange}
            </span>
          )}
        </div>
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[10000] w-80">
          <div 
            className="bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl p-6"
            style={{
              boxShadow: `
                0 25px 50px rgba(0,0,0,0.15),
                inset 0 1px 6px rgba(255,255,255,0.2),
                0 0 0 1px rgba(255,255,255,0.1)
              `
            }}
          >
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <i className="fas fa-info-circle text-white text-sm" />
                </div>
                <h4 className="font-black text-gray-800 text-lg">ELO Rating System</h4>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                ELO is a rating system that measures team strength based on game results and opponent quality. 
                Teams gain/lose points based on wins/losses and the strength of their opponents.
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                  <span className="text-gray-600 font-medium">Elite:</span>
                  <span className="font-black text-green-600">2000+</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                  <span className="text-gray-600 font-medium">Strong:</span>
                  <span className="font-black text-blue-600">1800-1999</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-50">
                  <span className="text-gray-600 font-medium">Good:</span>
                  <span className="font-black text-yellow-600">1600-1799</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-600 font-medium">Developing:</span>
                  <span className="font-black text-gray-600">Below 1600</span>
                </div>
              </div>
            </div>
            
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/95 border-r border-b border-white/60 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const MediaIcon = ({ outlet, mediaType }) => {
  const getNetworkIcon = () => {
    if (!outlet) return 'fas fa-broadcast-tower';
    const network = outlet.toLowerCase();
    if (network.includes('espn')) return 'fas fa-satellite-dish';
    if (network.includes('fox')) return 'fas fa-signal';
    if (network.includes('cbs')) return 'fas fa-wifi';
    if (network.includes('nbc')) return 'fas fa-tower-broadcast';
    if (network.includes('peacock')) return 'fas fa-circle-dot';
    if (network.includes('paramount')) return 'fas fa-mountain';
    if (network.includes('hulu')) return 'fas fa-play';
    if (network.includes('netflix')) return 'fas fa-film';
    if (mediaType === 'web') return 'fas fa-globe';
    return 'fas fa-broadcast-tower';
  };

  const getNetworkGradient = () => {
    if (!outlet) return 'from-slate-500 to-slate-700';
    const network = outlet.toLowerCase();
    if (network.includes('espn')) return 'brand-gradient-bg';
    if (network.includes('fox')) return 'from-blue-500 to-blue-700';
    if (network.includes('cbs')) return 'from-blue-600 to-blue-800';
    if (network.includes('nbc')) return 'from-purple-500 to-purple-700';
    if (network.includes('peacock')) return 'from-blue-400 to-blue-600';
    if (mediaType === 'web') return 'from-purple-500 to-purple-700';
    return 'from-slate-500 to-slate-700';
  };

  return (
    <div className="relative">
      <div 
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getNetworkGradient()} p-4 shadow-xl backdrop-blur-xl flex items-center justify-center border border-white/20`}
        style={{
          boxShadow: `
            0 10px 30px rgba(0,0,0,0.2),
            inset 0 1px 6px rgba(255,255,255,0.3)
          `
        }}
      >
        <i className={`${getNetworkIcon()} text-white text-lg drop-shadow-lg`} />
        
        {/* Futuristic corner accents */}
        <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-white/40"></div>
        <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-white/40"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-white/40"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-white/40"></div>
      </div>
      
      {/* Live indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400/90 rounded-full animate-pulse shadow-lg border border-white/30"></div>
      
      {/* Pulse effect */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400/30 rounded-full animate-ping"></div>
    </div>
  );
};

const Schedule = () => {
  // Core state management
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isPostseason, setIsPostseason] = useState(false);
  const [selectedConference, setSelectedConference] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Top 25');
  
  // UI state
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showConferencePicker, setShowConferencePicker] = useState(false);

  // Check if any dropdown is open
  const isAnyDropdownOpen = showWeekPicker || showYearPicker || showConferencePicker;

  // Data state with enhanced media and weather
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [gameMedia, setGameMedia] = useState(new Map());
  const [gameWeather, setGameWeather] = useState(new Map());

  // Conference data
  const conferences = [
    { name: 'ACC', logo: 'ACC' },
    { name: 'American Athletic', logo: 'American Athletic' },
    { name: 'Big 12', logo: 'Big 12' },
    { name: 'Big Ten', logo: 'Big Ten' },
    { name: 'Conference USA', logo: 'Conference USA' },
    { name: 'FBS Independents', logo: 'FBS Independents' },
    { name: 'Mid-American', logo: 'Mid-American' },
    { name: 'Mountain West', logo: 'Mountain West' },
    { name: 'Pac-12', logo: 'Pac-12' },
    { name: 'SEC', logo: 'SEC' },
    { name: 'Sun Belt', logo: 'SBC' }
  ];

  useEffect(() => {
    loadDataIfNeeded();
  }, [selectedWeek, selectedYear, isPostseason]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilteredGames();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, selectedConference, selectedCategory, games, rankings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowWeekPicker(false);
        setShowYearPicker(false);
        setShowConferencePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDataIfNeeded = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let loadedTeams = teams;
      if (loadedTeams.length === 0) {
        loadedTeams = await teamService.getFBSTeams(true);
        setTeams(loadedTeams);
      }

      let loadedGames = [];
      if (isPostseason) {
        loadedGames = await gameService.getPostseasonGames(selectedYear, false);
      } else {
        loadedGames = await gameService.getGamesByWeek(selectedYear, selectedWeek, 'regular', false);
      }
      setGames(loadedGames || []);

      const [mediaData, weatherData] = await Promise.all([
        gameService.getEnhancedGameMedia(selectedYear, selectedWeek, isPostseason ? 'postseason' : 'regular').catch(() => []),
        gameService.getEnhancedGameWeather(null, selectedYear, selectedWeek, isPostseason ? 'postseason' : 'regular').catch(() => [])
      ]);

      const mediaMap = new Map();
      const weatherMap = new Map();

      mediaData.forEach(media => {
        mediaMap.set(media.id, media);
      });

      weatherData.forEach(weather => {
        weatherMap.set(weather.id, weather);
      });

      setGameMedia(mediaMap);
      setGameWeather(weatherMap);

      let loadedRankings = rankings;
      if (loadedRankings.length === 0) {
        try {
          const rankingsData = await rankingsService.getHistoricalRankings(2024, null, 'postseason');
          const apPoll = rankingsData.find(week => 
            week.polls?.find(poll => poll.poll === 'AP Top 25')
          );
          if (apPoll) {
            const apRankings = apPoll.polls.find(poll => poll.poll === 'AP Top 25');
            loadedRankings = apRankings?.ranks || [];
          }
          setRankings(loadedRankings);
        } catch (error) {
          console.warn('Error loading rankings:', error);
          setRankings([]);
        }
      }

    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error loading schedule data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilteredGames = () => {
    let filtered = [...games];

    if (selectedConference) {
      const conferenceTeamIds = new Set(
        teams.filter(team => team.conference === selectedConference).map(team => team.id)
      );
      filtered = filtered.filter(game => 
        conferenceTeamIds.has(game.home_id || game.homeId) ||
        conferenceTeamIds.has(game.away_id || game.awayId)
      );
    }

    if (selectedCategory === 'Top 25') {
      const rankedSchools = new Set(rankings.map(rank => rank.school.toLowerCase()));
      filtered = filtered.filter(game => {
        const homeTeam = teams.find(team => team.id === (game.home_id || game.homeId));
        const awayTeam = teams.find(team => team.id === (game.away_id || game.awayId));
        return (homeTeam && rankedSchools.has(homeTeam.school.toLowerCase())) ||
               (awayTeam && rankedSchools.has(awayTeam.school.toLowerCase()));
      });
    }

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      const matchingTeamIds = new Set(
        teams.filter(team => 
          team.school?.toLowerCase().includes(query) ||
          team.abbreviation?.toLowerCase().includes(query) ||
          team.conference?.toLowerCase().includes(query)
        ).map(team => team.id)
      );
      
      filtered = filtered.filter(game =>
        matchingTeamIds.has(game.home_id || game.homeId) ||
        matchingTeamIds.has(game.away_id || game.awayId)
      );
    }

    setFilteredGames(filtered);
  };

  const getTeamRank = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    const ranking = rankings.find(r => r.school.toLowerCase() === team.school.toLowerCase());
    return ranking?.rank || null;
  };

  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.logos?.[0] || '/photos/ncaaf.png';
  };

  const getTeamAbbreviation = (teamId, fallback) => {
    const team = teams.find(t => t.id === teamId);
    if (team?.abbreviation) return team.abbreviation;
    if (team?.school) {
      const words = team.school.split(' ').filter(w => w.length > 0);
      if (words.length === 1) return words[0].substring(0, 4).toUpperCase();
      return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
    }
    return fallback || 'TBD';
  };

  const formatGameDate = (dateString) => {
    if (!dateString || dateString === 'TBD') return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBD';
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return `Today • ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow • ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full brand-gradient-via animate-spin mx-auto flex items-center justify-center" style={{ boxShadow: '0 10px 30px rgba(204, 0, 28, 0.3)' }}>
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <i className="fas fa-football-ball text-white text-2xl"></i>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-black gradient-text mb-2">
            {isPostseason ? 'Loading Postseason Games...' : `Loading Week ${selectedWeek} Games...`}
          </h2>
          <p className="text-gray-600">Fetching college football schedule</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div 
          className="max-w-md mx-auto bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 p-8 text-center"
          style={{
            boxShadow: `
              0 25px 50px rgba(0,0,0,0.1),
              inset 0 1px 6px rgba(255,255,255,0.2)
            `
          }}
        >
          <div className="w-16 h-16 rounded-full brand-gradient-to-br mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h3 className="font-black text-gray-800 text-xl mb-2">Error Loading Schedule</h3>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button 
            onClick={loadDataIfNeeded}
            className="px-6 py-3 brand-gradient-to-r text-white font-bold rounded-2xl hover:brand-gradient-bg transition-all duration-300 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <style jsx>{`
        .liquid-glass {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.37),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        }
        
        .metallic-logo {
          filter: 
            drop-shadow(0 10px 20px rgba(0,0,0,0.3)) 
            saturate(1.4) 
            contrast(1.3) 
            brightness(1.2);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .metallic-logo:hover {
          filter: 
            drop-shadow(0 15px 30px rgba(0,0,0,0.4)) 
            saturate(1.5) 
            contrast(1.4) 
            brightness(1.3);
          transform: translateY(-2px) scale(1.05);
        }
        
        .floating-orb {
          background: linear-gradient(135deg, rgba(204,0,28,0.08), rgba(255,255,255,0.05), rgba(204,0,28,0.04));
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-30px) rotate(180deg) scale(1.1); }
        }
        
        .cyber-pulse {
          background: radial-gradient(circle, rgba(204,0,28,0.1) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>

      {/* Futuristic Cyber Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Multiple layered network backgrounds */}
        <div className="absolute inset-0 cyber-network opacity-60"></div>
        <div className="absolute inset-0 connection-lines opacity-40"></div>
        <div className="absolute inset-0 data-nodes opacity-30"></div>
        
        {/* Floating orbs with cyber effect */}
        <div className="absolute top-20 left-10 w-96 h-96 floating-orb rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-20 w-80 h-80 cyber-pulse rounded-full blur-2xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-72 h-72 floating-orb rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 cyber-pulse rounded-full blur-2xl" style={{ animationDelay: '3s' }}></div>
        
        {/* Network connection nodes */}
        <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-gradient-to-br from-red-500/60 to-white/40 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-gradient-to-br from-white/50 to-red-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-gradient-to-br from-red-600/70 to-white/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Apple-Style Header */}
        <div className="text-center mb-16">
          {/* Iconic Header Logo */}
          <div className="flex items-center justify-center mb-8 relative">
            <div 
              className="relative w-24 h-24 rounded-3xl liquid-glass flex items-center justify-center group cursor-pointer"
              style={{
                boxShadow: `
                  0 25px 50px rgba(0,0,0,0.1),
                  inset 0 1px 6px rgba(255,255,255,0.3),
                  0 0 0 1px rgba(255,255,255,0.1)
                `
              }}
            >
              <i className="fas fa-calendar-check text-4xl gradient-text group-hover:scale-110 transition-transform duration-300"></i>
              <div className="absolute -top-1 -right-1 w-4 h-4 brand-gradient-to-br rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Apple-Style Typography */}
          <h1 className="text-7xl md:text-8xl font-black mb-6 relative">
            <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent drop-shadow-2xl">
              College Football
            </span>
            <br />
            <span className="gradient-text drop-shadow-2xl">
              Schedule
            </span>
          </h1>
          
          {/* Stats Display */}
          <div 
            className="inline-flex items-center space-x-6 px-8 py-4 rounded-full liquid-glass"
            style={{
              boxShadow: `
                0 15px 35px rgba(0,0,0,0.1),
                inset 0 1px 4px rgba(255,255,255,0.3)
              `
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full brand-gradient-to-r animate-pulse"></div>
              <span className="text-xl font-black gradient-text">
                {filteredGames.length} Games
              </span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
            <span className="text-xl text-gray-700 font-semibold">
              {isPostseason ? 'Bowl Season & Playoffs' : `Week ${selectedWeek} • 2024`}
            </span>
          </div>
        </div>

        {/* Apple-Style Filter Controls */}
        <div className="relative mb-12">
          <div 
            className="liquid-glass rounded-3xl p-8"
            style={{
              boxShadow: `
                0 25px 50px rgba(0,0,0,0.1),
                inset 0 1px 6px rgba(255,255,255,0.3),
                0 0 0 1px rgba(255,255,255,0.1)
              `
            }}
          >
            {/* Category Selection */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              {['Top 25', 'FBS'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative px-8 py-4 rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'text-white shadow-2xl'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {selectedCategory === category && (
                    <div 
                      className="absolute inset-0 rounded-2xl brand-gradient-to-br"
                      style={{
                        boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4), inset 0 1px 4px rgba(255,255,255,0.2)'
                      }}
                    ></div>
                  )}
                  
                  {selectedCategory !== category && (
                    <div className="absolute inset-0 liquid-glass rounded-2xl glassy-hover"></div>
                  )}
                  
                  <span className="relative z-10">{category}</span>
                </button>
              ))}
              
              {/* Search Box */}
              <div className="flex-1 min-w-80 relative">
                <div 
                  className="relative liquid-glass rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: `
                      inset 0 2px 8px rgba(0,0,0,0.1),
                      0 4px 12px rgba(0,0,0,0.05)
                    `
                  }}
                >
                  <div className="relative flex items-center">
                    <i className="fas fa-search absolute left-6 text-gray-500 z-10"></i>
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none font-medium text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Time Frame Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Year Selector */}
              <div className="relative dropdown-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowYearPicker(!showYearPicker);
                    setShowWeekPicker(false);
                    setShowConferencePicker(false);
                  }}
                  className="flex items-center gap-3 px-6 py-3 liquid-glass rounded-xl glassy-hover font-semibold text-gray-700"
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>{selectedYear}</span>
                  <i className={`fas fa-chevron-down transition-transform duration-200 ${showYearPicker ? 'rotate-180' : ''}`}></i>
                </button>
                
                {showYearPicker && (
                  <div 
                    className="absolute top-full mt-2 liquid-glass rounded-2xl z-[9999] min-w-32 overflow-hidden"
                    style={{
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }}
                  >
                    {[2024, 2025].map(year => (
                      <button
                        key={year}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedYear(year);
                          setShowYearPicker(false);
                        }}
                        className="block w-full text-left px-6 py-3 glassy-hover font-medium text-gray-700"
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conference Selector */}
              <div className="relative dropdown-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConferencePicker(!showConferencePicker);
                    setShowYearPicker(false);
                    setShowWeekPicker(false);
                  }}
                  className="flex items-center gap-3 px-6 py-3 liquid-glass rounded-xl glassy-hover font-semibold text-gray-700"
                >
                  <i className="fas fa-layer-group"></i>
                  <span>{selectedConference || 'All Conferences'}</span>
                  <i className={`fas fa-chevron-down transition-transform duration-200 ${showConferencePicker ? 'rotate-180' : ''}`}></i>
                </button>
                
                {showConferencePicker && (
                  <div 
                    className="absolute top-full mt-2 liquid-glass rounded-2xl z-[9999] min-w-48 max-h-64 overflow-y-auto"
                    style={{
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConference(null);
                        setShowConferencePicker(false);
                      }}
                      className="block w-full text-left px-6 py-3 glassy-hover font-medium text-gray-700"
                    >
                      All Conferences
                    </button>
                    {conferences.map(conf => (
                      <button
                        key={conf.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConference(conf.name);
                          setShowConferencePicker(false);
                        }}
                        className="block w-full text-left px-6 py-3 glassy-hover font-medium text-gray-700"
                      >
                        {conf.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Week Selector */}
              <div className="relative dropdown-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWeekPicker(!showWeekPicker);
                    setShowYearPicker(false);
                    setShowConferencePicker(false);
                  }}
                  className="flex items-center gap-3 px-6 py-3 liquid-glass rounded-xl glassy-hover font-semibold text-gray-700"
                >
                  <i className="fas fa-calendar-week"></i>
                  <span>{isPostseason ? 'Postseason' : `Week ${selectedWeek}`}</span>
                  <i className={`fas fa-chevron-down transition-transform duration-200 ${showWeekPicker ? 'rotate-180' : ''}`}></i>
                </button>
                
                {showWeekPicker && (
                  <div 
                    className="absolute top-full mt-2 liquid-glass rounded-2xl z-[9999] min-w-32 max-h-64 overflow-y-auto"
                    style={{
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }}
                  >
                    {Array.from({length: 15}, (_, i) => i + 1).map(week => (
                      <button
                        key={week}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWeek(week);
                          setIsPostseason(false);
                          setShowWeekPicker(false);
                        }}
                        className="block w-full text-left px-6 py-3 glassy-hover font-medium text-gray-700"
                      >
                        Week {week}
                      </button>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPostseason(true);
                        setShowWeekPicker(false);
                      }}
                      className="block w-full text-left px-6 py-3 glassy-hover font-medium text-gray-700"
                    >
                      Postseason
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="relative">
          {isAnyDropdownOpen && (
            <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm z-10 rounded-3xl pointer-events-none"></div>
          )}
          
          {filteredGames.length === 0 ? (
            <div className="text-center py-20">
              <div 
                className="w-24 h-24 rounded-3xl liquid-glass mx-auto mb-6 flex items-center justify-center"
                style={{
                  boxShadow: '0 25px 50px rgba(0,0,0,0.1)'
                }}
              >
                <i className="fas fa-calendar-times text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-3xl font-black text-gray-600 mb-4">No Games Found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your filters or selecting a different week.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredGames.map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  getTeamRank={getTeamRank}
                  getTeamLogo={getTeamLogo}
                  getTeamAbbreviation={getTeamAbbreviation}
                  formatGameDate={formatGameDate}
                  index={index}
                  gameMedia={gameMedia}
                  gameWeather={gameWeather}
                  isAnyDropdownOpen={isAnyDropdownOpen}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Apple Liquid Glass Game Card Component
const GameCard = ({ game, getTeamRank, getTeamLogo, getTeamAbbreviation, formatGameDate, index, gameMedia, gameWeather, isAnyDropdownOpen }) => {
  const homeTeamId = game.home_id || game.homeId;
  const awayTeamId = game.away_id || game.awayId;
  const homeTeam = game.home_team || game.homeTeam;
  const awayTeam = game.away_team || game.awayTeam;
  const homePoints = game.home_points || game.homePoints;
  const awayPoints = game.away_points || game.awayPoints;
  const isCompleted = game.completed === true;

  const excitementIndex = game.excitement_index || game.excitementIndex || 0;
  const homePreElo = game.home_pregame_elo || game.homePregameElo;
  const awayPreElo = game.away_pregame_elo || game.awayPregameElo;
  const homePostElo = game.home_postgame_elo || game.homePostgameElo;
  const awayPostElo = game.away_postgame_elo || game.awayPostgameElo;
  const homeWinProb = game.home_postgame_win_probability || game.homePostgameWinProbability;
  const awayWinProb = game.away_postgame_win_probability || game.awayPostgameWinProbability;
  const attendance = game.attendance;

  const mediaData = gameMedia.get(game.id);
  const weatherData = gameWeather.get(game.id);

  const temperature = weatherData?.temperature || game.temperature;
  const weatherCondition = weatherData?.condition || weatherData?.weather_condition || game.weather_condition || game.weatherCondition;
  const windSpeed = weatherData?.wind_speed || game.wind_speed || game.windSpeed;
  const gameIndoors = weatherData?.indoors || game.game_indoors || game.gameIndoors;

  const tvOutlet = mediaData?.outlet || game.tv_outlet;
  const streamingOutlet = mediaData?.streamingOutlet;
  const mediaType = mediaData?.mediaType || game.media_type;

  const handleCardClick = (e) => {
    if (isAnyDropdownOpen) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window.location.hash = `#game-detail-${game.id}`;
  };

  return (
    <div 
      className={`group relative transition-all duration-700 transform hover:scale-[1.02] ${
        isAnyDropdownOpen 
          ? 'cursor-not-allowed opacity-50 pointer-events-none' 
          : 'cursor-pointer hover:translate-y-[-8px]'
      }`}
      onClick={handleCardClick}
      style={{
        animationDelay: `${index * 150}ms`
      }}
    >
      {/* Apple Liquid Glass Card */}
      <div 
        className="relative liquid-glass card-hover rounded-3xl p-10 transition-all duration-700"
        style={{
          boxShadow: `
            0 25px 50px rgba(0,0,0,0.1),
            inset 0 1px 6px rgba(255,255,255,0.3),
            0 0 0 1px rgba(255,255,255,0.1)
          `,
          transform: 'perspective(1000px) rotateX(1deg)'
        }}
      >
        {/* Enhanced hover glow */}
        <div className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 brand-gradient-opacity-20 blur-xl"></div>
        
        <div className="relative z-10 space-y-10">
          
          {/* Main Team Matchup */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-10 flex-1">
              
              {/* Away Team */}
              <div className="flex items-center space-x-6">
                <div className="relative group/logo">
                  <img
                    src={getTeamLogo(awayTeamId)}
                    alt={`${awayTeam} logo`}
                    className="w-24 h-24 object-contain metallic-logo"
                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                  />
                  {getTeamRank(awayTeamId) && (
                    <div 
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full brand-gradient-to-br flex items-center justify-center shadow-2xl"
                      style={{
                        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4), inset 0 1px 4px rgba(255,255,255,0.2)'
                      }}
                    >
                      <span className="text-white text-sm font-black">{getTeamRank(awayTeamId)}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-left">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {getTeamAbbreviation(awayTeamId, awayTeam)}
                  </h3>
                  {homePoints !== null && awayPoints !== null && (
                    <div className="text-5xl font-black gradient-text mb-3 group-hover:scale-110 transition-transform duration-300">
                      {awayPoints}
                    </div>
                  )}
                  {awayPreElo && (
                    <EloRatingDisplay 
                      preGameElo={awayPreElo} 
                      postGameElo={awayPostElo}
                      teamName={awayTeam}
                      isCompleted={isCompleted}
                    />
                  )}
                </div>
              </div>

              {/* VS Indicator */}
              <div className="flex items-center justify-center">
                <div 
                  className="w-20 h-20 rounded-full liquid-glass flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                  style={{
                    boxShadow: `
                      0 15px 35px rgba(0,0,0,0.1),
                      inset 0 1px 4px rgba(255,255,255,0.3)
                    `
                  }}
                >
                  <span className="text-3xl font-black gradient-text">
                    @
                  </span>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {getTeamAbbreviation(homeTeamId, homeTeam)}
                  </h3>
                  {homePoints !== null && awayPoints !== null && (
                    <div className="text-5xl font-black gradient-text mb-3 group-hover:scale-110 transition-transform duration-300">
                      {homePoints}
                    </div>
                  )}
                  {homePreElo && (
                    <EloRatingDisplay 
                      preGameElo={homePreElo} 
                      postGameElo={homePostElo}
                      teamName={homeTeam}
                      isCompleted={isCompleted}
                    />
                  )}
                </div>
                
                <div className="relative group/logo">
                  <img
                    src={getTeamLogo(homeTeamId)}
                    alt={`${homeTeam} logo`}
                    className="w-24 h-24 object-contain metallic-logo"
                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                  />
                  {getTeamRank(homeTeamId) && (
                    <div 
                      className="absolute -top-2 -left-2 w-8 h-8 rounded-full brand-gradient-to-br flex items-center justify-center shadow-2xl"
                      style={{
                        boxShadow: '0 8px 25px rgba(204, 0, 28, 0.4), inset 0 1px 4px rgba(255,255,255,0.2)'
                      }}
                    >
                      <span className="text-white text-sm font-black">{getTeamRank(homeTeamId)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Status */}
            <div 
              className={`relative px-8 py-4 rounded-2xl font-black text-lg backdrop-blur-xl border shadow-2xl ${
                isCompleted 
                  ? 'bg-green-500/20 border-green-400/30 text-green-700' 
                  : 'brand-gradient-to-br border-white/30 text-white'
              }`}
              style={!isCompleted ? {
                boxShadow: '0 8px 32px rgba(204, 0, 28, 0.4), inset 0 1px 4px rgba(255,255,255,0.2)'
              } : {}}
            >
              <div className="flex items-center space-x-3">
                {isCompleted ? (
                  <>
                    <i className="fas fa-check-circle text-xl"></i>
                    <span>FINAL</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span>{formatGameDate(game.start_date || game.startDate)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Game Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Media Coverage */}
            {(tvOutlet || streamingOutlet) && (
              <div 
                className="liquid-glass rounded-2xl p-6"
                style={{
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <MediaIcon outlet={tvOutlet || streamingOutlet} mediaType={mediaType} />
                  <div>
                    <div className="font-black text-gray-800 text-lg">{tvOutlet || streamingOutlet}</div>
                    {streamingOutlet && tvOutlet && (
                      <div className="text-sm text-gray-600">+ {streamingOutlet}</div>
                    )}
                    {mediaType && (
                      <span className={`text-xs px-3 py-1 rounded-full font-bold mt-2 inline-block ${
                        mediaType === 'web' ? 'bg-purple-500/20 text-purple-700' : 'bg-blue-500/20 text-blue-700'
                      }`}>
                        {mediaType.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Weather */}
            {(temperature || weatherCondition || game.venue_details?.climate) && (
              <div 
                className="liquid-glass rounded-2xl p-6"
                style={{
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <WeatherIcon 
                  condition={weatherCondition || game.venue_details?.climate || 'Unknown'} 
                  temperature={temperature || (game.venue_details?.temperature_avg)} 
                />
                {windSpeed && windSpeed > 10 && (
                  <div className="mt-3 text-sm text-gray-600 flex items-center space-x-2">
                    <i className="fas fa-wind text-emerald-500"></i>
                    <span>Wind: {Math.round(windSpeed)} mph</span>
                  </div>
                )}
                {(gameIndoors || game.venue_details?.dome) && (
                  <div className="mt-3">
                    <span className="text-xs bg-gray-500/20 text-gray-700 px-3 py-1 rounded-full font-bold inline-flex items-center space-x-2">
                      <i className="fas fa-home"></i>
                      <span>Indoor</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Excitement Level */}
            {excitementIndex > 0 && (
              <div 
                className="liquid-glass rounded-2xl p-6"
                style={{
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div className="text-sm font-bold text-gray-600 mb-3">Excitement Level</div>
                <ExcitementStars excitementIndex={excitementIndex} />
                <div className="text-sm text-gray-500 mt-3 font-medium">
                  {excitementIndex >= 8 ? 'Thriller!' : 
                   excitementIndex >= 6 ? 'Great Game' : 
                   excitementIndex >= 4 ? 'Good Game' : 'Standard'}
                </div>
              </div>
            )}

            {/* Venue */}
            {game.venue && (
              <div 
                className="liquid-glass rounded-2xl p-6"
                style={{
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 p-3 flex items-center justify-center shadow-xl">
                    <i className="fas fa-map-marker-alt text-white text-lg"></i>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{game.venue}</div>
                    {attendance && (
                      <div className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                        <i className="fas fa-users"></i>
                        <span>{attendance.toLocaleString()} fans</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Win Probability */}
            {(homeWinProb || awayWinProb) && (
              <div className="md:col-span-2 lg:col-span-1">
                <WinProbabilityChart 
                  homeTeam={getTeamAbbreviation(homeTeamId, homeTeam)}
                  awayTeam={getTeamAbbreviation(awayTeamId, awayTeam)}
                  homeProb={homeWinProb}
                  awayProb={awayWinProb}
                  homeTeamId={homeTeamId}
                  awayTeamId={awayTeamId}
                  getTeamLogo={getTeamLogo}
                />
              </div>
            )}
          </div>

          {/* Game Type Badges */}
          <div className="flex flex-wrap gap-4">
            {(game.conference_game || game.conferenceGame) && (
              <div className="px-6 py-3 rounded-full bg-blue-500/20 backdrop-blur-xl text-blue-700 font-bold text-sm border border-blue-400/30">
                <i className="fas fa-trophy mr-2"></i>
                Conference Game
              </div>
            )}
            
            {(game.neutral_site || game.neutralSite) && (
              <div className="px-6 py-3 rounded-full bg-purple-500/20 backdrop-blur-xl text-purple-700 font-bold text-sm border border-purple-400/30">
                <i className="fas fa-balance-scale mr-2"></i>
                Neutral Site
              </div>
            )}

            {game.rivalry && (
              <div 
                className="px-6 py-3 rounded-full brand-gradient-to-br text-white font-bold text-sm shadow-2xl"
                style={{
                  boxShadow: '0 4px 15px rgba(204, 0, 28, 0.4), inset 0 1px 4px rgba(255,255,255,0.2)'
                }}
              >
                <i className="fas fa-fire mr-2"></i>
                Rivalry Game
              </div>
            )}

            {isCompleted && excitementIndex >= 8 && (
              <div className="px-6 py-3 rounded-full bg-yellow-500/20 backdrop-blur-xl text-yellow-700 font-bold text-sm border border-yellow-400/30">
                <i className="fas fa-star mr-2"></i>
                Game of the Week
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;