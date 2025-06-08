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
    if (!compareMode) return;
    
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
      <div className="min-h-screen pt-32 px-6 md:px-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Glass Morphism Search Section */}
        <div className="relative mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="relative">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <i className="fas fa-search text-white/60 text-xl"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search teams, conferences, or mascots..."
                  className="w-full pl-16 pr-6 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg backdrop-blur-sm transition-all duration-300"
                />
              </div>

              {/* Search Suggestions */}
              {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden">
                  {searchSuggestions.length > 0 && (
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Suggestions</h4>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion.value);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                        >
                          <i className={`fas ${suggestion.type === 'team' ? 'fa-university' : 'fa-layer-group'} text-gray-400`}></i>
                          <span className="text-gray-800">{suggestion.value}</span>
                          {suggestion.type === 'conference' && (
                            <span className="text-sm text-gray-500 ml-auto">Conference</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {recentSearches.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Recent Searches</h4>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(search);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                        >
                          <i className="fas fa-clock text-gray-400"></i>
                          <span className="text-gray-800">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  compareMode 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                }`}
              >
                <i className="fas fa-balance-scale mr-2"></i>
                Compare Teams {selectedTeams.length > 0 && `(${selectedTeams.length}/2)`}
              </button>
              
              {compareMode && selectedTeams.length > 0 && (
                <button
                  onClick={clearComparison}
                  className="px-6 py-3 rounded-2xl font-semibold bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear Selection
                </button>
              )}
              
              {compareMode && selectedTeams.length === 2 && (
                <button
                  onClick={() => console.log('Navigate to comparison:', selectedTeams)}
                  className="px-8 py-3 rounded-2xl font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <i className="fas fa-chart-bar mr-2"></i>
                  Compare Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-star text-yellow-400"></i>
              Favorite Teams
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
        )}

        {/* Teams by Conference */}
        <div className="space-y-8">
          {Object.entries(teamsByConference).map(([conference, conferenceTeams]) => (
            <div key={conference} className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              {/* Conference Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                    <img
                      src={`/photos/${conference}.png`}
                      alt={conference}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <i className="fas fa-layer-group text-white/60 hidden"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{conference}</h2>
                    <p className="text-white/60">{conferenceTeams.length} teams</p>
                  </div>
                </div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            <i className="fas fa-search text-6xl text-white/30 mb-6"></i>
            <h3 className="text-2xl font-bold text-white mb-4">No teams found</h3>
            <p className="text-white/60 text-lg">
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
      className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-red-500 bg-gradient-to-br from-red-500/20 to-red-600/10 shadow-lg shadow-red-500/25 scale-105' 
          : 'border-white/20 hover:border-white/40 hover:bg-white/15 hover:scale-105'
      }`}
      onClick={() => compareMode && onSelect(team)}
    >
      {/* Selection Indicator */}
      {compareMode && (
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
          isSelected 
            ? 'bg-red-500 border-red-500' 
            : 'border-white/40 group-hover:border-white/60'
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
            : 'bg-white/20 text-white/60 hover:bg-white/30 hover:text-white'
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
        <h3 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-red-300 transition-colors">
          {team.school}
        </h3>
        <p className="text-white/60 text-xs">
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
