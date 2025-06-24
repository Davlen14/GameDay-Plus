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
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const clearComparison = () => {
    setSelectedTeams([]);
    setCompareMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-2 md:px-4 bg-gray-50">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
          </div>
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

        {/* Teams by Conference */}
        <div className="space-y-8">
          {Object.entries(teamsByConference).map(([conference, conferenceTeams]) => (
            <div key={conference} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
              {/* Conference Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
                    <img
                      src={`/photos/${conference}.png`}
                      alt={conference}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <i className="fas fa-layer-group text-gray-400 hidden"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{conference}</h2>
                    <p className="text-gray-500">{conferenceTeams.length} teams</p>
                  </div>
                </div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
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
          ))}
        </div>

        {/* Empty State */}
        {filteredTeams.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <i className="fas fa-search text-6xl text-gray-300 mb-6"></i>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No teams found</h3>
            <p className="text-gray-500 text-lg">
              Try adjusting your search or browse by conference
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Team Card Component with Metallic 3D Effect
const TeamCard = ({ team, isFavorite, onToggleFavorite, onSelect, isSelected, compareMode }) => {
  const teamLogo = team.logos?.[0];
  
  return (
    <div 
      className={`group relative bg-white backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-500/25 scale-105' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-105 shadow-md hover:shadow-lg'
      }`}
      onClick={() => onSelect(team)}
      title={compareMode ? 'Click to select for comparison' : `View ${team.school} details`}
    >
      {/* Selection Indicator */}
      {compareMode && (
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
          isSelected 
            ? 'bg-red-500 border-red-500' 
            : 'border-gray-300 group-hover:border-gray-400'
        }`}>
          {isSelected && <i className="fas fa-check text-white text-xs absolute inset-0 flex items-center justify-center"></i>}
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(team);
        }}
        className={`absolute top-2 left-2 w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
          isFavorite 
            ? 'bg-yellow-500 text-white' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }`}
      >
        <i className={`fas fa-star text-xs ${isFavorite ? 'text-white' : ''}`}></i>
      </button>

      {/* Team Logo with Metallic 3D Effect */}
      <div className="w-16 h-16 mx-auto mb-3 relative">
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
        <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-inner transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300 overflow-hidden">
          {teamLogo ? (
            <img
              src={teamLogo}
              alt={team.school}
              className="w-full h-full object-contain p-2 filter drop-shadow-md"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="fas fa-university text-gray-600 text-xl"></i>
            </div>
          )}
        </div>
      </div>

      {/* Team Info */}
      <div className="text-center">
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 group-hover:text-red-600 transition-colors">
          {team.school}
        </h3>
        <p className="text-gray-500 text-xs">
          {team.mascot}
        </p>
      </div>

      {/* Team Colors Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r opacity-60" 
           style={{
             background: team.color && team.alternateColor 
               ? `linear-gradient(to right, ${team.color}, ${team.alternateColor})`
               : 'linear-gradient(to right, #dc2626, #991b1b)'
           }}>
      </div>
    </div>
  );
};

export default AllTeams;
