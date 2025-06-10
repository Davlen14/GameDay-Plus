import React, { useState, useEffect, useMemo } from 'react';
import { gameService, teamService, rankingsService } from '../../services';

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
  const [animateShine, setAnimateShine] = useState(false);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showConferencePicker, setShowConferencePicker] = useState(false);

  // Data state (similar to SwiftUI's cache manager)
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);

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
    setAnimateShine(true);
    loadDataIfNeeded();
  }, [selectedWeek, selectedYear, isPostseason]);

  // Search debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilteredGames();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, selectedConference, selectedCategory, games, rankings]);

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
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent gradient-bg mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-300 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-xl gradient-text font-bold">
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
                className="mt-4 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity"
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center ${animateShine ? 'metallic-3d-logo-enhanced' : ''}`}>
              <i className="fas fa-calendar-check text-3xl icon-gradient"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">College Football Schedule</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Live college football schedule with {filteredGames.length} games
            {isPostseason ? ' from bowl season and playoffs' : ` for week ${selectedWeek}`}
          </p>
        </div>

        {/* Filter Controls - Similar to SwiftUI time frame section */}
        <div className="bg-white rounded-3xl shadow-xl mb-8 p-6">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {['Top 25', 'FBS'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'gradient-bg text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
            
            {/* Search Box */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Time Frame Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Year Selector */}
            <div className="relative">
              <button
                onClick={() => setShowYearPicker(!showYearPicker)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <i className="fas fa-calendar-alt"></i>
                <span>{selectedYear}</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              {showYearPicker && (
                <div className="absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-32">
                  {[2024, 2025].map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowYearPicker(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conference Selector */}
            <div className="relative">
              <button
                onClick={() => setShowConferencePicker(!showConferencePicker)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <i className="fas fa-layer-group"></i>
                <span>{selectedConference || 'All Conferences'}</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              {showConferencePicker && (
                <div className="absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedConference(null);
                      setShowConferencePicker(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    All Conferences
                  </button>
                  {conferences.map(conf => (
                    <button
                      key={conf.name}
                      onClick={() => {
                        setSelectedConference(conf.name);
                        setShowConferencePicker(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {conf.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Week Selector */}
            <div className="relative">
              <button
                onClick={() => setShowWeekPicker(!showWeekPicker)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <i className="fas fa-calendar-week"></i>
                <span>{isPostseason ? 'Postseason' : `Week ${selectedWeek}`}</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              {showWeekPicker && (
                <div className="absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-32 max-h-64 overflow-y-auto">
                  {Array.from({length: 15}, (_, i) => i + 1).map(week => (
                    <button
                      key={week}
                      onClick={() => {
                        setSelectedWeek(week);
                        setIsPostseason(false);
                        setShowWeekPicker(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Week {week}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsPostseason(true);
                      setShowWeekPicker(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Postseason
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Games List */}
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Game Card Component - Similar to SwiftUI ModernScheduleGameCard
const GameCard = ({ game, getTeamRank, getTeamLogo, getTeamAbbreviation, formatGameDate, index }) => {
  const homeTeamId = game.home_id || game.homeId;
  const awayTeamId = game.away_id || game.awayId;
  const homeTeam = game.home_team || game.homeTeam;
  const awayTeam = game.away_team || game.awayTeam;
  const homePoints = game.home_points || game.homePoints;
  const awayPoints = game.away_points || game.awayPoints;
  const isCompleted = game.completed === true;

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Teams Section */}
          <div className="flex items-center space-x-8 flex-1">
            {/* Away Team */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={getTeamLogo(awayTeamId)}
                  alt={`${awayTeam} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/photos/ncaaf.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {getTeamRank(awayTeamId) && (
                    <span className="w-6 h-6 bg-gray-800 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {getTeamRank(awayTeamId)}
                    </span>
                  )}
                  <span className="font-bold text-gray-900 truncate">
                    {getTeamAbbreviation(awayTeamId, awayTeam)}
                  </span>
                </div>
                {homePoints !== null && awayPoints !== null && (
                  <div className="text-2xl font-bold gradient-text">
                    {awayPoints}
                  </div>
                )}
              </div>
            </div>

            {/* VS/@ */}
            <div className="text-gray-400 font-bold">@</div>

            {/* Home Team */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={getTeamLogo(homeTeamId)}
                  alt={`${homeTeam} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/photos/ncaaf.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {getTeamRank(homeTeamId) && (
                    <span className="w-6 h-6 bg-gray-800 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {getTeamRank(homeTeamId)}
                    </span>
                  )}
                  <span className="font-bold text-gray-900 truncate">
                    {getTeamAbbreviation(homeTeamId, homeTeam)}
                  </span>
                </div>
                {homePoints !== null && awayPoints !== null && (
                  <div className="text-2xl font-bold gradient-text">
                    {homePoints}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="text-right ml-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isCompleted 
                ? 'bg-green-100 text-green-800' 
                : 'gradient-bg text-white'
            }`}>
              {isCompleted ? (
                <>
                  <i className="fas fa-check-circle mr-1"></i>
                  FINAL
                </>
              ) : (
                <>
                  <i className="fas fa-clock mr-1"></i>
                  {formatGameDate(game.start_date || game.startDate)}
                </>
              )}
            </div>
            
            {game.venue && (
              <div className="text-sm text-gray-500 mt-1">
                {game.venue}
              </div>
            )}
            
            {(game.conference_game || game.conferenceGame) && (
              <div className="text-xs text-blue-600 mt-1 font-medium">
                Conference Game
              </div>
            )}
            
            {(game.neutral_site || game.neutralSite) && (
              <div className="text-xs text-purple-600 mt-1 font-medium">
                Neutral Site
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
