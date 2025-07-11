import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';

const AllTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteTeams');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentTeamSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Major conferences for organization
  const majorConferences = [
    "SEC", "Big Ten", "Big 12", "ACC", "Pac-12", 
    "American Athletic", "Conference USA", "Sun Belt", 
    "Mountain West", "Mid-American", "FBS Independents"
  ];

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const fbsTeams = await teamService.getFBSTeams(true);
        setTeams(fbsTeams.filter(team => team.school));
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, []);

  // Filter and organize teams
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    
    const query = searchQuery.toLowerCase();
    return teams.filter(team => 
      team.school?.toLowerCase().includes(query) ||
      team.mascot?.toLowerCase().includes(query) ||
      team.conference?.toLowerCase().includes(query) ||
      team.abbreviation?.toLowerCase().includes(query)
    );
  }, [teams, searchQuery]);

  // Group teams by conference
  const teamsByConference = useMemo(() => {
    const grouped = {};
    filteredTeams.forEach(team => {
      const conf = team.conference || 'Other';
      if (!grouped[conf]) grouped[conf] = [];
      grouped[conf].push(team);
    });
    
    // Sort conferences by major ones first
    const sortedConferences = Object.keys(grouped).sort((a, b) => {
      const aIndex = majorConferences.indexOf(a);
      const bIndex = majorConferences.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    const result = {};
    sortedConferences.forEach(conf => {
      result[conf] = grouped[conf].sort((a, b) => a.school.localeCompare(b.school));
    });
    
    return result;
  }, [filteredTeams]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = [];
    
    // Add team matches
    teams.slice(0, 5).forEach(team => {
      if (team.school?.toLowerCase().includes(query)) {
        suggestions.push({ type: 'team', value: team.school, team });
      }
    });
    
    // Add conference matches
    majorConferences.forEach(conf => {
      if (conf.toLowerCase().includes(query) && suggestions.length < 8) {
        suggestions.push({ type: 'conference', value: conf });
      }
    });
    
    return suggestions;
  }, [searchQuery, teams]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSuggestions(true);
    
    // Add to recent searches
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('recentTeamSearches', JSON.stringify(updated));
    }
  };

  const toggleFavorite = (team) => {
    const updated = favorites.some(fav => fav.id === team.id)
      ? favorites.filter(fav => fav.id !== team.id)
      : [...favorites, team];
    
    setFavorites(updated);
    localStorage.setItem('favoriteTeams', JSON.stringify(updated));
  };

  const handleTeamSelect = (team) => {
    if (!compareMode) {
      // Store team data and navigate to team detail view
      localStorage.setItem('selectedTeamData', JSON.stringify(team));
      window.location.hash = `team-detail-${team.id}`;
      return;
    }
    
    if (selectedTeams.find(t => t.id === team.id)) {
      setSelectedTeams(selectedTeams.filter(t => t.id !== team.id));
    } else if (selectedTeams.length < 2) {
      const newSelectedTeams = [...selectedTeams, team];
      setSelectedTeams(newSelectedTeams);
      
      // If we now have 2 teams, automatically go to comparison view
      if (newSelectedTeams.length === 2) {
        localStorage.setItem('compareTeams', JSON.stringify(newSelectedTeams));
        window.location.hash = 'compare-teams';
      }
    }
  };

  const clearComparison = () => {
    setSelectedTeams([]);
    setCompareMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-4 md:px-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>

        <div className="max-w-[97%] mx-auto relative z-10">
          <div className="flex items-center justify-center py-20">
            {/* Enhanced Loading Spinner */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-gray-600 border-r-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-6 relative overflow-hidden">
      <style>{`
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
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>
      
      {/* College Team Logos Background - Well-spaced distribution with varied sizes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top row - well spaced */}
        <div className="absolute top-16 left-12 w-12 h-12 opacity-6">
          <img src="/team_logos/alabama.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute top-20 right-16 w-10 h-10 opacity-5 rotate-12">
          <img src="/team_logos/ohio-state.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        
        {/* Middle left and right - far from center content */}
        <div className="absolute top-1/3 left-6 w-8 h-8 opacity-4 rotate-45">
          <img src="/team_logos/texas.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute top-1/2 right-8 w-9 h-9 opacity-5 -rotate-12">
          <img src="/team_logos/clemson.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        
        {/* Additional middle logos */}
        <div className="absolute top-2/5 left-2 w-14 h-14 opacity-7 rotate-20">
          <img src="/team_logos/oregon.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute top-3/5 right-2 w-6 h-6 opacity-4 -rotate-30">
          <img src="/team_logos/wisconsin.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        
        {/* Lower section - well separated */}
        <div className="absolute bottom-32 left-20 w-11 h-11 opacity-6 rotate-90">
          <img src="/team_logos/notre-dame.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute bottom-20 right-24 w-10 h-10 opacity-5 -rotate-6">
          <img src="/team_logos/michigan.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        
        {/* Corner positions - small and subtle */}
        <div className="absolute top-2/3 left-2 w-7 h-7 opacity-3 rotate-30">
          <img src="/team_logos/lsu.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute bottom-40 right-4 w-8 h-8 opacity-4 -rotate-45">
          <img src="/team_logos/georgia.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        
        {/* Additional scattered logos for depth - varied sizes */}
        <div className="absolute top-1/4 left-1/3 w-6 h-6 opacity-3 rotate-12">
          <img src="/team_logos/florida.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-7 h-7 opacity-4 -rotate-20">
          <img src="/team_logos/penn-state.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute top-1/5 right-1/4 w-5 h-5 opacity-3 rotate-60">
          <img src="/team_logos/stanford.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-9 h-9 opacity-5 -rotate-15">
          <img src="/team_logos/tennessee.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="absolute top-4/5 left-16 w-13 h-13 opacity-6 rotate-40">
          <img src="/team_logos/utah.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
      </div>

      <div className="max-w-[97%] mx-auto relative z-10">
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
                <i className="fas fa-university text-3xl relative z-10 drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}></i>
              </div>
              {/* Small floating icons instead of red dots */}
              <div className="absolute -top-1 -right-1 text-xs opacity-60">
                <i className="fas fa-star text-yellow-500"></i>
              </div>
              <div className="absolute -bottom-1 -left-1 text-xs opacity-40">
                <i className="fas fa-football-ball text-amber-600"></i>
              </div>
            </div>
          </div>
          
          {/* Enhanced Title with Liquid Glass Effect */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>College</span>
              <br />
              <span className="drop-shadow-2xl" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Teams</span>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full opacity-60 animate-pulse" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Explore comprehensive team profiles, statistics, and comparisons for every FBS program
            </p>
          </div>
          
          {/* Stats Badge with Liquid Glass */}
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_15px_35px_rgba(0,0,0,0.1)]">
            <div className="flex items-center space-x-2">
              <i className="fas fa-university text-gray-600"></i>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{teams.length} Teams</span>
            </div>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="text-lg text-gray-700 font-medium">
              FBS Division I
            </span>
          </div>
        </div>

        {/* Liquid Glass Search Container */}
        <div className="relative mb-16">
          {/* Liquid Glass Container */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Enhanced Search Input */}
              <div className="relative max-w-2xl mx-auto">
                <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)] overflow-hidden">
                  {/* Glass highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative flex items-center">
                    <i className="fas fa-search absolute left-6 text-gray-500 z-10 text-xl"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Search teams, conferences, or mascots..."
                      className="w-full pl-16 pr-6 py-5 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 font-medium text-lg"
                    />
                  </div>
                </div>

                {/* Enhanced Search Suggestions */}
                {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                    {/* Glass highlight */}
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
                    
                    {searchSuggestions.length > 0 && (
                      <div className="p-6 relative z-10">
                        <h4 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                          <i className="fas fa-lightbulb gradient-text text-sm"></i>
                          Suggestions
                        </h4>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(suggestion.value);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/30 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <i className={`fas ${suggestion.type === 'team' ? 'fa-university' : 'fa-layer-group'} text-gray-600`}></i>
                            </div>
                            <div className="flex-1">
                              <span className="text-gray-900 font-semibold text-lg">{suggestion.value}</span>
                              {suggestion.type === 'conference' && (
                                <span className="text-xs text-gray-600 ml-2 px-3 py-1 bg-white/40 rounded-full border border-white/30">Conference</span>
                              )}
                            </div>
                            <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-600 transition-colors"></i>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {recentSearches.length > 0 && (
                      <div className="p-6 border-t border-white/30 relative z-10">
                        <h4 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                          <i className="fas fa-clock gradient-text text-sm"></i>
                          Recent
                        </h4>
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(search);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/30 rounded-xl transition-all duration-300 flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <i className="fas fa-clock text-gray-600"></i>
                            </div>
                            <span className="text-gray-900 font-semibold text-lg flex-1">{search}</span>
                            <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-600 transition-colors"></i>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Compare Mode Toggle */}
                {!searchQuery && (
                  <div className="flex items-center justify-center mt-8 gap-4">
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 ${
                        compareMode
                          ? 'text-white shadow-2xl'
                          : 'text-gray-700 hover:text-white'
                      }`}
                    >
                      {/* Active gradient background */}
                      {compareMode && (
                        <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(204,0,28,0.3)]" style={{ background: 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)' }}></div>
                      )}
                      
                      {/* Inactive glass background */}
                      {!compareMode && (
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300"></div>
                      )}
                      
                      {/* Glass highlight */}
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                      
                      <span className="relative z-10 flex items-center gap-2">
                        <i className="fas fa-balance-scale"></i>
                        {compareMode ? 'Exit Compare Mode' : 'Compare Teams'}
                        {compareMode && selectedTeams.length > 0 && (
                          <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                            {selectedTeams.length}/2
                          </span>
                        )}
                      </span>
                    </button>
                    
                    {compareMode && selectedTeams.length > 0 && (
                      <button
                        onClick={clearComparison}
                        className="relative flex items-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300 text-gray-700 font-medium"
                      >
                        <i className="fas fa-times"></i>
                        Clear ({selectedTeams.length})
                      </button>
                    )}
                    
                    {compareMode && selectedTeams.length === 1 && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 font-medium">
                        <i className="fas fa-info-circle"></i>
                        Select one more team to compare
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Favorites Section with Liquid Glass */}
        {favorites.length > 0 && !searchQuery && (
          <div className="mb-16">
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
              {/* Highlight overlay */}
              <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    {/* Outer glass ring */}
                    <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl"></div>
                    {/* Inner glass container */}
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center">
                      <i className="fas fa-heart text-3xl text-white drop-shadow-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black mb-2 tracking-tight gradient-text">
                      Favorite Teams
                    </h2>
                    <p className="text-gray-600 font-light text-lg">Your selected teams for quick access</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                  {favorites.map(team => (
                    <TeamCard 
                      key={`fav-${team.id}`}
                      team={team}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      onSelect={handleTeamSelect}
                      isSelected={selectedTeams.some(t => t.id === team.id)}
                      compareMode={compareMode}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teams by Conference with Enhanced Liquid Glass */}
        <div className="space-y-8">
          {Object.entries(teamsByConference).map(([conference, conferenceTeams]) => (
            <div key={conference} className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-8">
              {/* Highlight overlay */}
              <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                {/* Enhanced Conference Header */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <img
                      src={`/photos/${conference}.png`}
                      alt={conference}
                      className="w-14 h-14 object-contain filter drop-shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-14 h-14 hidden items-center justify-center">
                      <i className="fas fa-layer-group text-gray-500 text-3xl"></i>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black mb-2 gradient-text">{conference}</h2>
                    <p className="text-gray-600 font-medium text-lg">{conferenceTeams.length} teams</p>
                  </div>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                  {conferenceTeams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      isFavorite={favorites.some(fav => fav.id === team.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={handleTeamSelect}
                      isSelected={selectedTeams.some(t => t.id === team.id)}
                      compareMode={compareMode}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredTeams.length === 0 && searchQuery && (
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.1)] p-16">
            {/* Highlight overlay */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 text-center">
              <div className="relative mb-8">
                {/* Outer glass ring */}
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl mx-auto"></div>
                {/* Inner glass container */}
                <div className="relative w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] flex items-center justify-center mx-auto">
                  <i className="fas fa-search text-gray-400 text-3xl"></i>
                </div>
              </div>
              <h3 className="text-3xl font-black mb-4 gradient-text">No teams found</h3>
              <p className="text-gray-600 text-xl font-light">
                Try adjusting your search or browse by conference
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Team Card Component with Modern Minimalist Design
const TeamCard = ({ team, isFavorite, onToggleFavorite, onSelect, isSelected, compareMode }) => {
  const teamLogo = team.logos?.[0];
  
  return (
    <div 
      className={`group relative rounded-2xl p-6 transition-all duration-500 cursor-pointer transform hover:scale-105 min-w-0 ${
        isSelected 
          ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 shadow-lg shadow-red-500/25' 
          : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:bg-white shadow-md hover:shadow-xl'
      }`}
      onClick={() => onSelect(team)}
      title={compareMode ? 'Click to select for comparison' : `View ${team.school} details`}
    >
      {/* Selection Indicator */}
      {compareMode && (
        <div className={`absolute top-3 right-3 w-7 h-7 rounded-full border-2 transition-all duration-300 z-10 ${
          isSelected 
            ? 'shadow-[0_4px_12px_rgba(204,0,28,0.4)]' 
            : 'border-gray-300 group-hover:border-gray-400'
        }`}
        style={{
          background: isSelected 
            ? 'linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c)'
            : 'rgba(255, 255, 255, 0.8)'
        }}>
          {isSelected && <i className="fas fa-check text-white text-sm absolute inset-0 flex items-center justify-center"></i>}
        </div>
      )}

      {/* Enhanced Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(team);
        }}
        className={`absolute top-3 left-3 w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center z-10 ${
          isFavorite 
            ? 'shadow-[0_4px_12px_rgba(234,179,8,0.4)]' 
            : 'bg-gray-100 hover:bg-gray-200 hover:scale-110'
        }`}
        style={{
          background: isFavorite 
            ? 'linear-gradient(135deg, #eab308, #d97706, #ea580c)'
            : undefined
        }}
      >
        <i className={`fas fa-star text-sm ${isFavorite ? 'text-white' : 'text-gray-500'} drop-shadow-sm`}></i>
      </button>

      {/* Modern Team Logo - Bigger and Cleaner */}
      <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        {teamLogo ? (
          <img
            src={teamLogo}
            alt={team.school}
            className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fas fa-university text-gray-400 text-4xl"></i>
          </div>
        )}
      </div>

      {/* Enhanced Team Info with Better Text Handling */}
      <div className="text-center px-2">
        <h3 className="font-black text-gray-800 text-sm lg:text-base leading-tight mb-2 group-hover:text-red-600 transition-colors duration-300 break-words">
          {team.school}
        </h3>
        <p className="text-gray-600 text-xs lg:text-sm font-medium break-words">
          {team.mascot}
        </p>
      </div>

      {/* Enhanced Team Colors Accent - Simplified */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" 
           style={{
             background: team.color && team.alternateColor 
               ? `linear-gradient(90deg, ${team.color}, ${team.alternateColor})`
               : 'linear-gradient(90deg, #cc001c, #a10014)'
           }}>
      </div>
    </div>
  );
};

export default AllTeams;
