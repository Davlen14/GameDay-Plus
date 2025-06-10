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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 gradient-bg rounded-full opacity-5 blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-48 h-48 gradient-bg rounded-full opacity-3 blur-2xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-80 gradient-bg rounded-full opacity-4 blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 gradient-bg rounded-full opacity-3 blur-2xl animate-pulse animation-delay-3000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Liquid Glass Header Section */}
        <div className="text-center mb-20" data-aos="fade-up">
          <div className="flex items-center justify-center mb-8 relative">
            {/* Liquid Glass Icon Container */}
            <div className="relative">
              {/* Outer glass ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse"></div>
              {/* Inner glass container */}
              <div className={`relative w-16 h-16 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center ${animateShine ? 'animate-bounce' : ''}`}>
                {/* Liquid glass highlight */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
                <i className="fas fa-calendar-check text-3xl icon-gradient relative z-10 drop-shadow-lg"></i>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 gradient-bg rounded-full opacity-60 animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 gradient-bg rounded-full opacity-40 animate-ping animation-delay-500"></div>
            </div>
          </div>
          
          {/* Enhanced Title with Liquid Glass Effect */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
              <span className="gradient-text drop-shadow-2xl">College Football</span>
              <br />
              <span className="gradient-text drop-shadow-2xl">Schedule</span>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 gradient-bg rounded-full opacity-60 animate-pulse"></div>
            </h1>
          </div>
          
          {/* Stats Badge with Liquid Glass */}
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]" data-aos="fade-up" data-aos-delay="200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 gradient-bg rounded-full animate-pulse"></div>
              <span className="text-lg font-bold gradient-text">{filteredGames.length} Games</span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-lg text-gray-700 font-medium">
              {isPostseason ? 'Bowl Season & Playoffs' : `Week ${selectedWeek} • 2024`}
            </span>
          </div>
        </div>

        {/* Liquid Glass Filter Controls */}
        <div className="relative mb-8" data-aos="fade-up" data-aos-delay="300">
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
                      <div className="absolute inset-0 gradient-bg rounded-2xl shadow-[0_8px_32px_rgba(204,0,28,0.3)]"></div>
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
                <div className="relative">
                  <button
                    onClick={() => setShowYearPicker(!showYearPicker)}
                    className="flex items-center gap-3 px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 font-semibold text-gray-700 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]"
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <i className="fas fa-calendar-alt relative z-10"></i>
                    <span className="relative z-10">{selectedYear}</span>
                    <i className="fas fa-chevron-down relative z-10"></i>
                  </button>
                  {showYearPicker && (
                    <div className="absolute top-full mt-2 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-20 min-w-32 overflow-hidden">
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                      
                      {[2024, 2025].map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setShowYearPicker(false);
                          }}
                          className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700"
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
                    className="flex items-center gap-3 px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 font-semibold text-gray-700 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]"
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <i className="fas fa-layer-group relative z-10"></i>
                    <span className="relative z-10">{selectedConference || 'All Conferences'}</span>
                    <i className="fas fa-chevron-down relative z-10"></i>
                  </button>
                  {showConferencePicker && (
                    <div className="absolute top-full mt-2 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-20 min-w-48 max-h-64 overflow-y-auto">
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                      
                      <button
                        onClick={() => {
                          setSelectedConference(null);
                          setShowConferencePicker(false);
                        }}
                        className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700"
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
                          className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700"
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
                    className="flex items-center gap-3 px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 font-semibold text-gray-700 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]"
                  >
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <i className="fas fa-calendar-week relative z-10"></i>
                    <span className="relative z-10">{isPostseason ? 'Postseason' : `Week ${selectedWeek}`}</span>
                    <i className="fas fa-chevron-down relative z-10"></i>
                  </button>
                  {showWeekPicker && (
                    <div className="absolute top-full mt-2 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-20 min-w-32 max-h-64 overflow-y-auto">
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                      
                      {Array.from({length: 15}, (_, i) => i + 1).map(week => (
                        <button
                          key={week}
                          onClick={() => {
                            setSelectedWeek(week);
                            setIsPostseason(false);
                            setShowWeekPicker(false);
                          }}
                          className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700"
                        >
                          Week {week}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setIsPostseason(true);
                          setShowWeekPicker(false);
                        }}
                        className="relative block w-full text-left px-6 py-3 hover:bg-white/40 transition-all duration-200 font-medium text-gray-700"
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

  const handleCardClick = () => {
    // Navigate to game detail view using hash routing
    window.location.hash = `#game-detail-${game.id}`;
  };

  return (
    <div 
      className="group relative overflow-hidden cursor-pointer"
      data-aos="fade-up"
      data-aos-delay={index * 50}
      onClick={handleCardClick}
    >
      {/* Liquid Glass Container */}
      <div className="relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_15px_rgba(255,255,255,0.4),0_25px_50px_rgba(0,0,0,0.1)] p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-[inset_0_2px_20px_rgba(255,255,255,0.5),0_35px_70px_rgba(0,0,0,0.15)] hover:bg-white/70">
        {/* Glass highlight overlay */}
        <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none"></div>
        
        {/* Floating highlight particles */}
        <div className="absolute top-4 right-4 w-2 h-2 gradient-bg rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 gradient-bg rounded-full opacity-40 animate-pulse animation-delay-1000"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Teams Section with Glass Morphism */}
          <div className="flex items-center space-x-8 flex-1">
            {/* Away Team */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Liquid Glass Logo Container */}
              <div className="relative w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.3)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                <img
                  src={getTeamLogo(awayTeamId)}
                  alt={`${awayTeam} logo`}
                  className="w-12 h-12 object-contain relative z-10 drop-shadow-lg"
                  onError={(e) => {
                    e.target.src = '/photos/ncaaf.png';
                  }}
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.2)]"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  {getTeamRank(awayTeamId) && (
                    <div className="relative">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(204,0,28,0.4)]">
                        <span className="text-white text-sm font-black">{getTeamRank(awayTeamId)}</span>
                      </div>
                      {/* Rank glow */}
                      <div className="absolute inset-0 gradient-bg rounded-full opacity-30 blur-sm"></div>
                    </div>
                  )}
                  <span className="font-black text-gray-900 text-lg truncate drop-shadow-sm">
                    {getTeamAbbreviation(awayTeamId, awayTeam)}
                  </span>
                </div>
                {homePoints !== null && awayPoints !== null && (
                  <div className="text-3xl font-black gradient-text drop-shadow-lg">
                    {awayPoints}
                  </div>
                )}
              </div>
            </div>

            {/* VS Separator with Glass Effect */}
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.3)] flex items-center justify-center">
                <span className="text-gray-500 font-black text-lg">@</span>
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Home Team */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-end space-x-3 mb-2">
                  <span className="font-black text-gray-900 text-lg truncate drop-shadow-sm">
                    {getTeamAbbreviation(homeTeamId, homeTeam)}
                  </span>
                  {getTeamRank(homeTeamId) && (
                    <div className="relative">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(204,0,28,0.4)]">
                        <span className="text-white text-sm font-black">{getTeamRank(homeTeamId)}</span>
                      </div>
                      {/* Rank glow */}
                      <div className="absolute inset-0 gradient-bg rounded-full opacity-30 blur-sm"></div>
                    </div>
                  )}
                </div>
                {homePoints !== null && awayPoints !== null && (
                  <div className="text-3xl font-black gradient-text drop-shadow-lg">
                    {homePoints}
                  </div>
                )}
              </div>
              
              {/* Liquid Glass Logo Container */}
              <div className="relative w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.3)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                <img
                  src={getTeamLogo(homeTeamId)}
                  alt={`${homeTeam} logo`}
                  className="w-12 h-12 object-contain relative z-10 drop-shadow-lg"
                  onError={(e) => {
                    e.target.src = '/photos/ncaaf.png';
                  }}
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.2)]"></div>
              </div>
            </div>
          </div>

          {/* Game Info Section with Liquid Glass */}
          <div className="text-right ml-8">
            {/* Status Badge with Liquid Glass */}
            <div className="mb-4">
              <div 
                className={`relative inline-flex items-center px-4 py-2 rounded-2xl font-bold text-sm backdrop-blur-xl border shadow-lg ${
                  isCompleted 
                    ? 'bg-green-500/20 border-green-400/30 text-green-700 shadow-[0_8px_25px_rgba(34,197,94,0.2)]' 
                    : 'gradient-bg border-white/30 text-white shadow-[0_8px_25px_rgba(204,0,28,0.3)]'
                }`}
              >
                {/* Glass highlight */}
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                
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
            
            {/* Additional Info with Glass Morphism */}
            <div className="space-y-2">
              {game.venue && (
                <div className="text-sm text-gray-600 font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/30">
                  <i className="fas fa-map-marker-alt mr-1 text-gray-500"></i>
                  {game.venue}
                </div>
              )}
              
              {(game.conference_game || game.conferenceGame) && (
                <div className="inline-block text-xs bg-blue-500/20 backdrop-blur-sm text-blue-700 font-bold px-3 py-1 rounded-lg border border-blue-400/30">
                  Conference Game
                </div>
              )}
              
              {(game.neutral_site || game.neutralSite) && (
                <div className="inline-block text-xs bg-purple-500/20 backdrop-blur-sm text-purple-700 font-bold px-3 py-1 rounded-lg border border-purple-400/30 ml-2">
                  Neutral Site
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Schedule;
