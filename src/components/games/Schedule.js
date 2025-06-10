import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { gameService, teamService, rankingsService } from '../../services';

// Utility Components for Enhanced Game Cards
const ExcitementStars = ({ excitementIndex = 0 }) => {
  const stars = Math.min(Math.max(Math.round(excitementIndex / 2), 0), 5);
  const getStarColor = () => {
    if (excitementIndex >= 8) return 'text-yellow-400';
    if (excitementIndex >= 6) return 'text-yellow-400';
    if (excitementIndex >= 4) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <i 
          key={i} 
          className={`fas fa-star text-sm ${i < stars ? getStarColor() : 'text-gray-300'} drop-shadow-lg filter`}
          style={i < stars && excitementIndex >= 4 ? { 
            filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.6))' 
          } : {}}
        />
      ))}
      <span className="text-xs font-bold text-gray-700 ml-2">
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
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-4 shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
      {/* Glass highlight */}
      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="text-xs font-bold text-gray-700 mb-3 text-center flex items-center justify-center space-x-2">
          <i className="fas fa-chart-line" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
          <span>Win Probability</span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Away Team */}
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm border border-white/50 flex items-center justify-center overflow-hidden">
              <img 
                src={getTeamLogo(awayTeamId)} 
                alt={awayTeam}
                className="w-4 h-4 object-contain"
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
            </div>
            <span className="text-sm font-bold text-gray-800">{awayPct}%</span>
          </div>
          
          {/* Enhanced Probability Bar */}
          <div className="flex-1 h-3 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ 
                width: `${awayPct}%`,
                background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)`
              }}
            />
          </div>
          
          {/* Home Team */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <span className="text-sm font-bold text-gray-800">{homePct}%</span>
            <div className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm border border-white/50 flex items-center justify-center overflow-hidden">
              <img 
                src={getTeamLogo(homeTeamId)} 
                alt={homeTeam}
                className="w-4 h-4 object-contain"
                onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
              />
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
        className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs cursor-help hover:bg-white/30 transition-all duration-200"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center space-x-1">
          <i className="fas fa-chart-line text-blue-500 mr-1" />
          <span className="font-bold text-gray-700">{preGameElo}</span>
          <span className="text-gray-500">({eloLevel})</span>
          {isCompleted && eloChange !== 0 && (
            <span className={`font-bold ${eloChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {eloChange > 0 ? '+' : ''}{eloChange}
            </span>
          )}
        </div>
      </div>
      
      {/* ELO Explanation Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[10000] w-72">
          <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-4">
            {/* Glass highlight */}
            <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <i className="fas fa-info-circle text-blue-500" />
                <h4 className="font-bold text-gray-800">ELO Rating System</h4>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                ELO is a rating system that measures team strength based on game results and opponent quality. 
                Teams gain/lose points based on wins/losses and the strength of their opponents.
              </p>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Elite:</span>
                  <span className="font-bold text-green-600">2000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Strong:</span>
                  <span className="font-bold text-blue-600">1800-1999</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Good:</span>
                  <span className="font-bold text-yellow-600">1600-1799</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Developing:</span>
                  <span className="font-bold text-gray-600">Below 1600</span>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <i className="fas fa-lightbulb text-yellow-500 mr-1" />
                  Higher ratings indicate stronger teams. Changes show performance impact.
                </p>
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-white/50 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const WeatherIcon = ({ condition, temperature }) => {
  const getWeatherIcon = () => {
    if (!condition) return 'fas fa-question-circle';
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return 'fas fa-sun';
    if (cond.includes('cloud')) return 'fas fa-cloud';
    if (cond.includes('rain') || cond.includes('shower')) return 'fas fa-cloud-rain';
    if (cond.includes('snow')) return 'fas fa-snowflake';
    if (cond.includes('storm') || cond.includes('thunder')) return 'fas fa-bolt';
    if (cond.includes('fog') || cond.includes('mist')) return 'fas fa-smog';
    return 'fas fa-cloud-sun';
  };

  const getWeatherColor = () => {
    if (!condition) return 'text-gray-500';
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return 'text-yellow-500';
    if (cond.includes('rain') || cond.includes('storm')) return 'text-blue-500';
    if (cond.includes('snow')) return 'text-blue-200';
    if (cond.includes('cloud')) return 'text-gray-400';
    return 'text-gray-500';
  };

  const getWeatherGlow = () => {
    if (!condition) return '';
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]';
    if (cond.includes('rain') || cond.includes('storm')) return 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]';
    return 'drop-shadow-lg';
  };

  return (
    <div className="flex items-center space-x-2">
      <i className={`${getWeatherIcon()} ${getWeatherColor()} text-lg ${getWeatherGlow()}`} />
      {temperature && (
        <span className="text-sm font-bold text-gray-800">
          {Math.round(temperature)}°F
        </span>
      )}
    </div>
  );
};

const MediaIcon = ({ outlet, mediaType }) => {
  const getNetworkIcon = () => {
    if (!outlet) return 'fas fa-tv';
    const network = outlet.toLowerCase();
    if (network.includes('espn')) return 'fab fa-youtube'; // Using YouTube as ESPN placeholder
    if (network.includes('fox')) return 'fas fa-broadcast-tower';
    if (network.includes('cbs')) return 'fas fa-tv';
    if (network.includes('nbc')) return 'fas fa-tv';
    if (network.includes('peacock')) return 'fas fa-feather';
    if (network.includes('paramount')) return 'fas fa-mountain';
    if (network.includes('hulu')) return 'fas fa-play-circle';
    if (network.includes('netflix')) return 'fas fa-film';
    if (mediaType === 'web') return 'fas fa-globe';
    return 'fas fa-tv';
  };

  const getNetworkColor = () => {
    if (!outlet) return 'text-gray-600';
    const network = outlet.toLowerCase();
    if (network.includes('espn')) return 'text-red-600';
    if (network.includes('fox')) return 'text-blue-600';
    if (network.includes('cbs')) return 'text-blue-700';
    if (network.includes('nbc')) return 'text-purple-600';
    if (network.includes('peacock')) return 'text-blue-500';
    if (mediaType === 'web') return 'text-purple-500';
    return 'text-gray-700';
  };

  const getNetworkGlow = () => {
    if (!outlet) return 'drop-shadow-lg';
    const network = outlet.toLowerCase();
    if (network.includes('espn')) return 'drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]';
    if (network.includes('nbc') || network.includes('peacock')) return 'drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]';
    return 'drop-shadow-lg';
  };

  return <i className={`${getNetworkIcon()} ${getNetworkColor()} text-lg ${getNetworkGlow()}`} />;
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
  
  // UI state - removed animateShine to improve performance
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

  // Conference data matching your app structure
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

  // Search debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilteredGames();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, selectedConference, selectedCategory, games, rankings]);

  // Close dropdowns when clicking outside
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
      // Load teams if not cached
      let loadedTeams = teams;
      if (loadedTeams.length === 0) {
        loadedTeams = await teamService.getFBSTeams(true);
        setTeams(loadedTeams);
      }

      // Load games based on selections
      let loadedGames = [];
      if (isPostseason) {
        loadedGames = await gameService.getPostseasonGames(selectedYear, false);
      } else {
        loadedGames = await gameService.getGamesByWeek(selectedYear, selectedWeek, 'regular', false);
      }
      setGames(loadedGames || []);

      // Load enhanced media and weather data in parallel
      const [mediaData, weatherData] = await Promise.all([
        gameService.getEnhancedGameMedia(selectedYear, selectedWeek, isPostseason ? 'postseason' : 'regular').catch(() => []),
        gameService.getEnhancedGameWeather(null, selectedYear, selectedWeek, isPostseason ? 'postseason' : 'regular').catch(() => [])
      ]);

      // Create lookup maps for quick access
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

      // Load rankings if not cached
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

    // Filter by conference if selected
    if (selectedConference) {
      const conferenceTeamIds = new Set(
        teams.filter(team => team.conference === selectedConference).map(team => team.id)
      );
      filtered = filtered.filter(game => 
        conferenceTeamIds.has(game.home_id || game.homeId) ||
        conferenceTeamIds.has(game.away_id || game.awayId)
      );
    }

    // Category filtering (Top 25 vs FBS)
    if (selectedCategory === 'Top 25') {
      const rankedSchools = new Set(rankings.map(rank => rank.school.toLowerCase()));
      filtered = filtered.filter(game => {
        const homeTeam = teams.find(team => team.id === (game.home_id || game.homeId));
        const awayTeam = teams.find(team => team.id === (game.away_id || game.awayId));
        return (homeTeam && rankedSchools.has(homeTeam.school.toLowerCase())) ||
               (awayTeam && rankedSchools.has(awayTeam.school.toLowerCase()));
      });
    }

    // Search filter
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-300 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {isPostseason ? 'Loading Postseason Games...' : `Loading Week ${selectedWeek} Games...`}
              </p>
              <p className="text-gray-600">Fetching college football schedule</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
              <h3 className="font-bold">Error Loading Schedule</h3>
              <p className="text-sm mt-2">{errorMessage}</p>
              <button 
                onClick={loadDataIfNeeded}
                className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Custom Tailwind CSS Styles */}
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
        }
        .gradient-text {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .icon-gradient {
          background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>

      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
        <div className="absolute top-60 right-20 w-48 h-48 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 rounded-full opacity-4 blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 rounded-full opacity-3 blur-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Liquid Glass Header Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8 relative">
            {/* Liquid Glass Icon Container */}
            <div className="relative">
              {/* Outer glass ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
              {/* Inner glass container */}
              <div className="relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
                {/* Liquid glass highlight */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                <i className="fas fa-calendar-check text-3xl relative z-10 drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full opacity-60 animate-ping" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full opacity-40 animate-ping animation-delay-500" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
            </div>
          </div>
          
          {/* Enhanced Title with Liquid Glass Effect */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>College Football</span>
              <br />
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Schedule</span>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
            </h1>
          </div>
          
          {/* Stats Badge with Liquid Glass */}
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{filteredGames.length} Games</span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-lg text-gray-700 font-medium">
              {isPostseason ? 'Bowl Season & Playoffs' : `Week ${selectedWeek} • 2024`}
            </span>
          </div>
        </div>

        {/* Liquid Glass Filter Controls */}
        <div className="relative mb-8">
          {/* Liquid Glass Container */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Category Pills with Liquid Glass */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {['Top 25', 'FBS'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'text-white shadow-2xl'
                        : 'text-gray-700 hover:text-white'
                    }`}
                    style={selectedCategory === category ? {} : {}}
                  >
                    {/* Active gradient background */}
                    {selectedCategory === category && (
                      <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(204,0,28,0.3)]" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
                    )}
                    
                    {/* Inactive glass background */}
                    {selectedCategory !== category && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300"></div>
                    )}
                    
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <span className="relative z-10">{category}</span>
                  </button>
                ))}
                
                {/* Liquid Glass Search Box */}
                <div className="flex-1 min-w-80 relative">
                  <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)] overflow-hidden">
                    {/* Glass highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative flex items-center">
                      <i className="fas fa-search absolute left-4 text-gray-500 z-10"></i>
                      <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 font-medium text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Liquid Glass Time Frame Controls */}
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
                    className="flex items-center gap-3 px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 font-semibold text-gray-700 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]"
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <i className="fas fa-calendar-alt relative z-10"></i>
                    <span className="relative z-10">{selectedYear}</span>
                    <i className={`fas fa-chevron-down relative z-10 transition-transform duration-200 ${showYearPicker ? 'rotate-180' : ''}`}></i>
                  </button>
                  {showYearPicker && (
                    <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-[9999] min-w-32 overflow-hidden">
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                      
                      {[2024, 2025].map(year => (
                        <button
                          key={year}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedYear(year);
                            setShowYearPicker(false);
                          }}
                          className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700 z-[9999]"
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
                    className="flex items-center gap-3 px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 font-semibold text-gray-700 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]"
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <i className="fas fa-layer-group relative z-10"></i>
                    <span className="relative z-10">{selectedConference || 'All Conferences'}</span>
                    <i className={`fas fa-chevron-down relative z-10 transition-transform duration-200 ${showConferencePicker ? 'rotate-180' : ''}`}></i>
                  </button>
                  {showConferencePicker && (
                    <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-[9999] min-w-48 max-h-64 overflow-y-auto">
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConference(null);
                          setShowConferencePicker(false);
                        }}
                        className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700 z-[9999]"
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
                          className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700 z-[9999]"
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
                    className="flex items-center gap-3 px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 font-semibold text-gray-700 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]"
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <i className="fas fa-calendar-week relative z-10"></i>
                    <span className="relative z-10">{isPostseason ? 'Postseason' : `Week ${selectedWeek}`}</span>
                    <i className={`fas fa-chevron-down relative z-10 transition-transform duration-200 ${showWeekPicker ? 'rotate-180' : ''}`}></i>
                  </button>
                  {showWeekPicker && (
                    <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-[9999] min-w-32 max-h-64 overflow-y-auto">
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                      
                      {Array.from({length: 15}, (_, i) => i + 1).map(week => (
                        <button
                          key={week}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWeek(week);
                            setIsPostseason(false);
                            setShowWeekPicker(false);
                          }}
                          className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700 z-[9999]"
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
                        className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700 z-[9999]"
                      >
                        Postseason
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="relative">
          {/* Overlay when dropdowns are open */}
          {isAnyDropdownOpen && (
            <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] z-10 rounded-3xl pointer-events-none"></div>
          )}
          
          {filteredGames.length === 0 ? (
            <div className="text-center py-16">
              <i className="fas fa-calendar-times text-6xl text-gray-300 mb-6"></i>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No Games Found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or selecting a different week.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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

// Game Card Component - Enhanced with comprehensive game information
const GameCard = ({ game, getTeamRank, getTeamLogo, getTeamAbbreviation, formatGameDate, index, gameMedia, gameWeather, isAnyDropdownOpen }) => {
  const homeTeamId = game.home_id || game.homeId;
  const awayTeamId = game.away_id || game.awayId;
  const homeTeam = game.home_team || game.homeTeam;
  const awayTeam = game.away_team || game.awayTeam;
  const homePoints = game.home_points || game.homePoints;
  const awayPoints = game.away_points || game.awayPoints;
  const isCompleted = game.completed === true;

  // Enhanced game data extraction
  const excitementIndex = game.excitement_index || game.excitementIndex || 0;
  const homePreElo = game.home_pregame_elo || game.homePregameElo;
  const awayPreElo = game.away_pregame_elo || game.awayPregameElo;
  const homePostElo = game.home_postgame_elo || game.homePostgameElo;
  const awayPostElo = game.away_postgame_elo || game.awayPostgameElo;
  const homeWinProb = game.home_postgame_win_probability || game.homePostgameWinProbability;
  const awayWinProb = game.away_postgame_win_probability || game.awayPostgameWinProbability;
  const attendance = game.attendance;

  // Get enhanced media and weather data
  const mediaData = gameMedia.get(game.id);
  const weatherData = gameWeather.get(game.id);

  // Extract real weather data - check multiple sources
  const temperature = weatherData?.temperature || game.temperature;
  const weatherCondition = weatherData?.condition || weatherData?.weather_condition || game.weather_condition || game.weatherCondition;
  const windSpeed = weatherData?.wind_speed || game.wind_speed || game.windSpeed;
  const gameIndoors = weatherData?.indoors || game.game_indoors || game.gameIndoors;

  // Extract real media data
  const tvOutlet = mediaData?.outlet || game.tv_outlet;
  const streamingOutlet = mediaData?.streamingOutlet;
  const mediaType = mediaData?.mediaType || game.media_type;

  const handleCardClick = (e) => {
    // If any dropdown is open, prevent navigation
    if (isAnyDropdownOpen) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Navigate to game detail view using hash routing
    window.location.hash = `#game-detail-${game.id}`;
  };

  return (
    <div 
      className={`group relative overflow-hidden transition-all duration-500 ${
        isAnyDropdownOpen 
          ? 'cursor-not-allowed opacity-75 pointer-events-none' 
          : 'cursor-pointer hover:scale-[1.01] hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]'
      }`}
      onClick={handleCardClick}
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Enhanced Liquid Glass Container */}
      <div className="relative bg-white/50 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 group-hover:bg-white/60 group-hover:border-white/70">
        {/* Liquid Glass Highlight */}
        <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/40 via-white/10 to-transparent pointer-events-none"></div>
        
        {/* Dynamic Glow Effect */}
        <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(185,28,28,0.1) 50%, rgba(153,27,27,0.1) 100%)' }}></div>
        
        <div className="relative z-10 space-y-6">
          
          {/* Top Row: Teams and Core Info */}
          <div className="flex items-center justify-between">
            {/* Teams Section */}
            <div className="flex items-center space-x-6 flex-1">
              {/* Away Team */}
              <div className="flex items-center space-x-4">
                {/* Enhanced Logo Container */}
                <div className="relative w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                  <img
                    src={getTeamLogo(awayTeamId)}
                    alt={`${awayTeam} logo`}
                    className="w-12 h-12 object-contain relative z-10 drop-shadow-xl"
                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                  />
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    {getTeamRank(awayTeamId) && (
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.4)] group-hover:shadow-[0_6px_25px_rgba(220,38,38,0.5)] transition-shadow duration-300" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}>
                          <span className="text-white text-sm font-black">{getTeamRank(awayTeamId)}</span>
                        </div>
                      </div>
                    )}
                    <span className="font-black text-gray-900 text-lg truncate drop-shadow-sm">
                      {getTeamAbbreviation(awayTeamId, awayTeam)}
                    </span>
                  </div>
                  {homePoints !== null && awayPoints !== null && (
                    <div className="text-3xl font-black drop-shadow-xl group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {awayPoints}
                    </div>
                  )}
                  {/* Away Team ELO */}
                  {awayPreElo && (
                    <div className="mt-2">
                      <EloRatingDisplay 
                        preGameElo={awayPreElo} 
                        postGameElo={awayPostElo}
                        teamName={awayTeam}
                        isCompleted={isCompleted}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* VS Separator */}
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                  <span className="relative z-10 text-lg font-black drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>@</span>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex items-center space-x-4">
                <div className="min-w-0 text-right">
                  <div className="flex items-center justify-end space-x-3 mb-2">
                    <span className="font-black text-gray-900 text-lg truncate drop-shadow-sm">
                      {getTeamAbbreviation(homeTeamId, homeTeam)}
                    </span>
                    {getTeamRank(homeTeamId) && (
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.4)] group-hover:shadow-[0_6px_25px_rgba(220,38,38,0.5)] transition-shadow duration-300" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}>
                          <span className="text-white text-sm font-black">{getTeamRank(homeTeamId)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {homePoints !== null && awayPoints !== null && (
                    <div className="text-3xl font-black drop-shadow-xl group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {homePoints}
                    </div>
                  )}
                  {/* Home Team ELO */}
                  {homePreElo && (
                    <div className="mt-2">
                      <EloRatingDisplay 
                        preGameElo={homePreElo} 
                        postGameElo={homePostElo}
                        teamName={homeTeam}
                        isCompleted={isCompleted}
                      />
                    </div>
                  )}
                </div>
                
                {/* Enhanced Logo Container */}
                <div className="relative w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                  <img
                    src={getTeamLogo(homeTeamId)}
                    alt={`${homeTeam} logo`}
                    className="w-12 h-12 object-contain relative z-10 drop-shadow-xl"
                    onError={(e) => { e.target.src = '/photos/ncaaf.png'; }}
                  />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div 
              className={`relative inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm backdrop-blur-xl border shadow-lg ${
                isCompleted 
                  ? 'bg-green-500/20 border-green-400/30 text-green-700 shadow-[0_8px_25px_rgba(34,197,94,0.2)]' 
                  : 'border-white/30 text-white shadow-[0_8px_25px_rgba(204,0,28,0.3)]'
              }`}
              style={!isCompleted ? { background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' } : {}}
            >
              <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
              <div className="relative z-10 flex items-center space-x-2">
                {isCompleted ? (
                  <>
                    <i className="fas fa-check-circle"></i>
                    <span>FINAL</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>{formatGameDate(game.start_date || game.startDate)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Second Row: Enhanced Game Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Media Coverage */}
            {(tvOutlet || streamingOutlet) && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <MediaIcon outlet={tvOutlet || streamingOutlet} mediaType={mediaType} />
                  <div>
                    <div className="font-bold text-gray-700">{tvOutlet || streamingOutlet}</div>
                    {streamingOutlet && tvOutlet && (
                      <div className="text-xs text-gray-500">+ {streamingOutlet}</div>
                    )}
                    {mediaType && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        mediaType === 'web' ? 'bg-purple-500/20 text-purple-700' : 'bg-blue-500/20 text-blue-700'
                      }`}>
                        {mediaType.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Weather Information - Show with fallback data */}
            {(temperature || weatherCondition || game.venue_details?.climate) && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                <div className="flex items-center justify-between">
                  <WeatherIcon 
                    condition={weatherCondition || game.venue_details?.climate || 'Unknown'} 
                    temperature={temperature || (game.venue_details?.temperature_avg)} 
                  />
                  <div className="text-right">
                    {(weatherCondition || game.venue_details?.climate) && (
                      <div className="text-xs font-bold text-gray-700 capitalize">
                        {weatherCondition || game.venue_details?.climate || 'Check Local Weather'}
                      </div>
                    )}
                    {windSpeed && windSpeed > 10 && (
                      <div className="text-xs text-gray-500">
                        Wind: {Math.round(windSpeed)} mph
                      </div>
                    )}
                    {(gameIndoors || game.venue_details?.dome) && (
                      <div className="text-xs bg-gray-500/20 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                        Indoor
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Excitement Level */}
            {excitementIndex > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                <div className="text-xs font-bold text-gray-600 mb-1">Excitement Level</div>
                <ExcitementStars excitementIndex={excitementIndex} />
                <div className="text-xs text-gray-500 mt-1">
                  {excitementIndex >= 8 ? 'Thriller!' : 
                   excitementIndex >= 6 ? 'Great Game' : 
                   excitementIndex >= 4 ? 'Good Game' : 'Standard'}
                </div>
              </div>
            )}

            {/* Venue Information */}
            {game.venue && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-map-marker-alt text-gray-500"></i>
                  <div>
                    <div className="text-xs font-bold text-gray-700">{game.venue}</div>
                    {attendance && (
                      <div className="text-xs text-gray-500">
                        {attendance.toLocaleString()} fans
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Win Probability Chart */}
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

          {/* Third Row: Game Type Badges */}
          <div className="flex flex-wrap gap-2">
            {(game.conference_game || game.conferenceGame) && (
              <div className="inline-block text-xs bg-blue-500/20 backdrop-blur-sm text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-400/30">
                <i className="fas fa-trophy mr-1"></i>
                Conference Game
              </div>
            )}
            
            {(game.neutral_site || game.neutralSite) && (
              <div className="inline-block text-xs bg-purple-500/20 backdrop-blur-sm text-purple-700 font-bold px-3 py-1 rounded-full border border-purple-400/30">
                <i className="fas fa-balance-scale mr-1"></i>
                Neutral Site
              </div>
            )}

            {game.rivalry && (
              <div className="relative inline-block text-xs font-bold px-3 py-1 rounded-full border border-white/40 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)]" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}>
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                <span className="relative z-10 flex items-center">
                  <i className="fas fa-fire mr-1"></i>
                  Rivalry Game
                </span>
              </div>
            )}

            {isCompleted && excitementIndex >= 8 && (
              <div className="inline-block text-xs bg-yellow-500/20 backdrop-blur-sm text-yellow-700 font-bold px-3 py-1 rounded-full border border-yellow-400/30">
                <i className="fas fa-star mr-1"></i>
                Game of the Week
              </div>
            )}
          </div>
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Schedule;