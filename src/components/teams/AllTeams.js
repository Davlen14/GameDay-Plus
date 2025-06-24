import React, { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';

// Add custom animations
const customStyles = `
  @keyframes animate-tilt {
    0%, 50%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(0.5deg);
    }
    75% {
      transform: rotate(-0.5deg);
    }
  }
  
  @keyframes animate-reverse {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  
  .animate-tilt {
    animation: animate-tilt 10s ease-in-out infinite;
  }
  
  .animate-reverse {
    animation: animate-reverse 3s linear infinite;
  }
  
  /* Cyberpunk glow effects */
  .glow-red {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
  }
  
  .glow-blue {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  
  .glow-purple {
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }
`;

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
    // Inject custom styles
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
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
    
    return () => {
      // Cleanup styles on unmount
      document.head.removeChild(styleElement);
    };
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
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const clearComparison = () => {
    setSelectedTeams([]);
    setCompareMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-4 md:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full border-4 border-white/20 border-t-red-500 border-r-blue-500 animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-4 border-white/10 border-b-purple-500 border-l-pink-500 animate-spin animate-reverse"></div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
            Loading Teams
          </h2>
          <p className="text-gray-400 font-light">
            Preparing the ultimate college football experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Search Section */}
        <div className="relative mb-12">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4 tracking-tight">
              College Teams
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Discover, explore, and compare your favorite college football teams with advanced analytics
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="relative">
                  {/* Enhanced Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                      <div className="relative">
                        <i className="fas fa-search text-2xl text-transparent bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text"></i>
                        <div className="absolute inset-0 animate-pulse">
                          <i className="fas fa-search text-2xl text-white/30"></i>
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Search teams, conferences, or mascots..."
                      className="w-full pl-20 pr-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-xl backdrop-blur-sm transition-all duration-500 hover:bg-white/10"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>

                  {/* Futuristic Search Suggestions */}
                  {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden">
                      {searchSuggestions.length > 0 && (
                        <div className="p-6">
                          <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">AI Suggestions</h4>
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(suggestion.value);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl transition-all duration-300 flex items-center gap-4 group border border-transparent hover:border-white/20"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i className={`fas ${suggestion.type === 'team' ? 'fa-university' : 'fa-layer-group'} text-white/70`}></i>
                              </div>
                              <div className="flex-1">
                                <span className="text-white font-medium">{suggestion.value}</span>
                                {suggestion.type === 'conference' && (
                                  <span className="text-sm text-gray-400 ml-2 px-2 py-1 bg-white/10 rounded-full">Conference</span>
                                )}
                              </div>
                              <i className="fas fa-arrow-right text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300"></i>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {recentSearches.length > 0 && (
                        <div className="p-6 border-t border-white/10">
                          <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Recent Searches</h4>
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(search);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl transition-all duration-300 flex items-center gap-4 group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i className="fas fa-clock text-white/70"></i>
                              </div>
                              <span className="text-white font-medium flex-1">{search}</span>
                              <i className="fas fa-arrow-right text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300"></i>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Advanced Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-500 overflow-hidden ${
                      compareMode 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <i className="fas fa-balance-scale text-sm"></i>
                      </div>
                      <span>Compare Teams</span>
                      {selectedTeams.length > 0 && (
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                          {selectedTeams.length}/2
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {compareMode && selectedTeams.length > 0 && (
                    <button
                      onClick={clearComparison}
                      className="group relative px-8 py-4 rounded-2xl font-bold bg-white/10 text-white border border-white/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <div className="relative flex items-center gap-3">
                        <i className="fas fa-times"></i>
                        <span>Clear Selection</span>
                      </div>
                    </button>
                  )}
                  
                  {compareMode && selectedTeams.length === 2 && (
                    <button
                      onClick={() => console.log('Navigate to comparison:', selectedTeams)}
                      className="group relative px-10 py-4 rounded-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      <div className="relative flex items-center gap-3">
                        <i className="fas fa-rocket"></i>
                        <span>Compare Now</span>
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Futuristic Favorites Section */}
        {favorites.length > 0 && !searchQuery && (
          <div className="mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                    <i className="fas fa-star text-3xl text-yellow-400 animate-pulse"></i>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                      Favorite Teams
                    </h2>
                    <p className="text-gray-400 font-light">Your handpicked elite collection</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-6">
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

        {/* Conference Sections with Cyberpunk Styling */}
        <div className="space-y-10">
          {Object.entries(teamsByConference).map(([conference, conferenceTeams], index) => (
            <div key={conference} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500">
                {/* Enhanced Conference Header */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                      <img
                        src={`/photos/${conference}.png`}
                        alt={conference}
                        className="w-12 h-12 object-contain filter brightness-0 invert opacity-80"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <i className="fas fa-layer-group text-white/60 text-2xl hidden"></i>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">
                      {conferenceTeams.length}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-500">
                      {conference}
                    </h2>
                    <div className="flex items-center gap-4">
                      <p className="text-gray-400 font-light">{conferenceTeams.length} elite programs</p>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <i className="fas fa-chevron-right transform group-hover:translate-x-2 transition-transform duration-300"></i>
                  </div>
                </div>

                {/* Futuristic Teams Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
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

        {/* Futuristic Empty State */}
        {filteredTeams.length === 0 && searchQuery && (
          <div className="text-center py-32">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-black/30 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center">
                  <i className="fas fa-search text-6xl text-white/40"></i>
                </div>
              </div>
            </div>
            <h3 className="text-4xl font-black text-white mb-4 tracking-tight">
              No teams found
            </h3>
            <p className="text-gray-400 text-xl font-light max-w-md mx-auto mb-8">
              The search came up empty. Try adjusting your query or explore by conference
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-refresh mr-2"></i>
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Futuristic Team Card Component with Cyberpunk Aesthetics
const TeamCard = ({ team, isFavorite, onToggleFavorite, onSelect, isSelected, compareMode }) => {
  const teamLogo = team.logos?.[0];
  
  return (
    <div 
      className={`group relative bg-black/30 backdrop-blur-xl rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden ${
        isSelected 
          ? 'border-red-500/50 bg-gradient-to-br from-red-500/10 to-blue-500/10 shadow-2xl shadow-red-500/25 scale-105 -rotate-1' 
          : 'border-white/10 hover:border-white/30 hover:bg-white/5 hover:scale-105 hover:rotate-1 shadow-xl hover:shadow-2xl'
      }`}
      onClick={() => onSelect(team)}
      title={compareMode ? 'Click to select for comparison' : `View ${team.school} details`}
    >
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Selection Indicator */}
      {compareMode && (
        <div className={`absolute top-3 right-3 w-8 h-8 rounded-full border-2 transition-all duration-300 z-10 ${
          isSelected 
            ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 shadow-lg shadow-red-500/50' 
            : 'border-white/30 group-hover:border-white/50 backdrop-blur-sm'
        }`}>
          {isSelected && (
            <i className="fas fa-check text-white text-sm absolute inset-0 flex items-center justify-center animate-pulse"></i>
          )}
        </div>
      )}

      {/* Futuristic Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(team);
        }}
        className={`absolute top-3 left-3 w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center z-10 backdrop-blur-sm ${
          isFavorite 
            ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50 scale-110' 
            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80 border border-white/20 hover:border-white/40'
        }`}
      >
        <i className={`fas fa-star text-sm ${isFavorite ? 'animate-pulse' : ''}`}></i>
      </button>

      {/* Holographic Team Logo */}
      <div className="relative w-20 h-20 mx-auto mt-8 mb-4">
        {/* Hologram Effect Background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl animate-pulse"></div>
        
        {/* Logo Container */}
        <div className="relative w-full h-full rounded-2xl bg-white/5 backdrop-blur-sm border border-white/20 overflow-hidden group-hover:border-white/40 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
          {teamLogo ? (
            <img
              src={teamLogo}
              alt={team.school}
              className="relative w-full h-full object-contain p-3 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <i className="fas fa-university text-white/60 text-2xl group-hover:text-white/80 transition-colors duration-300"></i>
            </div>
          )}
          
          {/* Scan Lines Effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-gradient-to-b from-transparent via-white/5 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute -inset-2 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-0"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-bounce delay-2000"></div>
        </div>
      </div>

      {/* Team Information */}
      <div className="text-center px-4 pb-6">
        <h3 className="font-black text-white text-sm leading-tight mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 tracking-tight">
          {team.school}
        </h3>
        <p className="text-gray-400 text-xs font-light">
          {team.mascot}
        </p>
      </div>

      {/* Neon Team Colors Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
           style={{
             background: team.color && team.alternateColor 
               ? `linear-gradient(to right, ${team.color}, ${team.alternateColor})`
               : 'linear-gradient(to right, #ef4444, #dc2626)'
           }}>
      </div>
      
      {/* Corner Accent Lights */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-white/20 group-hover:border-white/60 transition-colors duration-300"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-white/20 group-hover:border-white/60 transition-colors duration-300"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-white/20 group-hover:border-white/60 transition-colors duration-300"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-white/20 group-hover:border-white/60 transition-colors duration-300"></div>
    </div>
  );
};

export default AllTeams;
